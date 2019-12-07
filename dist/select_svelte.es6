function noop() { }
function run(fn) {
    return fn();
}
function blank_object() {
    return Object.create(null);
}
function run_all(fns) {
    fns.forEach(run);
}
function is_function(thing) {
    return typeof thing === 'function';
}
function safe_not_equal(a, b) {
    return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
}

function append(target, node) {
    target.appendChild(node);
}
function insert(target, node, anchor) {
    target.insertBefore(node, anchor || null);
}
function detach(node) {
    node.parentNode.removeChild(node);
}
function destroy_each(iterations, detaching) {
    for (let i = 0; i < iterations.length; i += 1) {
        if (iterations[i])
            iterations[i].d(detaching);
    }
}
function element(name) {
    return document.createElement(name);
}
function text(data) {
    return document.createTextNode(data);
}
function space() {
    return text(' ');
}
function empty() {
    return text('');
}
function listen(node, event, handler, options) {
    node.addEventListener(event, handler, options);
    return () => node.removeEventListener(event, handler, options);
}
function attr(node, attribute, value) {
    if (value == null)
        node.removeAttribute(attribute);
    else if (node.getAttribute(attribute) !== value)
        node.setAttribute(attribute, value);
}
function children(element) {
    return Array.from(element.childNodes);
}
function set_data(text, data) {
    data = '' + data;
    if (text.data !== data)
        text.data = data;
}
function set_input_value(input, value) {
    if (value != null || input.value) {
        input.value = value;
    }
}

let current_component;
function set_current_component(component) {
    current_component = component;
}
function get_current_component() {
    if (!current_component)
        throw new Error(`Function called outside component initialization`);
    return current_component;
}
function onMount(fn) {
    get_current_component().$$.on_mount.push(fn);
}

const dirty_components = [];
const binding_callbacks = [];
const render_callbacks = [];
const flush_callbacks = [];
const resolved_promise = Promise.resolve();
let update_scheduled = false;
function schedule_update() {
    if (!update_scheduled) {
        update_scheduled = true;
        resolved_promise.then(flush);
    }
}
function add_render_callback(fn) {
    render_callbacks.push(fn);
}
function flush() {
    const seen_callbacks = new Set();
    do {
        // first, call beforeUpdate functions
        // and update components
        while (dirty_components.length) {
            const component = dirty_components.shift();
            set_current_component(component);
            update(component.$$);
        }
        while (binding_callbacks.length)
            binding_callbacks.pop()();
        // then, once components are updated, call
        // afterUpdate functions. This may cause
        // subsequent updates...
        for (let i = 0; i < render_callbacks.length; i += 1) {
            const callback = render_callbacks[i];
            if (!seen_callbacks.has(callback)) {
                callback();
                // ...so guard against infinite loops
                seen_callbacks.add(callback);
            }
        }
        render_callbacks.length = 0;
    } while (dirty_components.length);
    while (flush_callbacks.length) {
        flush_callbacks.pop()();
    }
    update_scheduled = false;
}
function update($$) {
    if ($$.fragment !== null) {
        $$.update($$.dirty);
        run_all($$.before_update);
        $$.fragment && $$.fragment.p($$.dirty, $$.ctx);
        $$.dirty = null;
        $$.after_update.forEach(add_render_callback);
    }
}
const outroing = new Set();
function transition_in(block, local) {
    if (block && block.i) {
        outroing.delete(block);
        block.i(local);
    }
}

const globals = (typeof window !== 'undefined' ? window : global);
function mount_component(component, target, anchor) {
    const { fragment, on_mount, on_destroy, after_update } = component.$$;
    fragment && fragment.m(target, anchor);
    // onMount happens before the initial afterUpdate
    add_render_callback(() => {
        const new_on_destroy = on_mount.map(run).filter(is_function);
        if (on_destroy) {
            on_destroy.push(...new_on_destroy);
        }
        else {
            // Edge case - component was destroyed immediately,
            // most likely as a result of a binding initialising
            run_all(new_on_destroy);
        }
        component.$$.on_mount = [];
    });
    after_update.forEach(add_render_callback);
}
function destroy_component(component, detaching) {
    const $$ = component.$$;
    if ($$.fragment !== null) {
        run_all($$.on_destroy);
        $$.fragment && $$.fragment.d(detaching);
        // TODO null out other refs, including component.$$ (but need to
        // preserve final state?)
        $$.on_destroy = $$.fragment = null;
        $$.ctx = {};
    }
}
function make_dirty(component, key) {
    if (!component.$$.dirty) {
        dirty_components.push(component);
        schedule_update();
        component.$$.dirty = blank_object();
    }
    component.$$.dirty[key] = true;
}
function init(component, options, instance, create_fragment, not_equal, props) {
    const parent_component = current_component;
    set_current_component(component);
    const prop_values = options.props || {};
    const $$ = component.$$ = {
        fragment: null,
        ctx: null,
        // state
        props,
        update: noop,
        not_equal,
        bound: blank_object(),
        // lifecycle
        on_mount: [],
        on_destroy: [],
        before_update: [],
        after_update: [],
        context: new Map(parent_component ? parent_component.$$.context : []),
        // everything else
        callbacks: blank_object(),
        dirty: null
    };
    let ready = false;
    $$.ctx = instance
        ? instance(component, prop_values, (key, ret, value = ret) => {
            if ($$.ctx && not_equal($$.ctx[key], $$.ctx[key] = value)) {
                if ($$.bound[key])
                    $$.bound[key](value);
                if (ready)
                    make_dirty(component, key);
            }
            return ret;
        })
        : prop_values;
    $$.update();
    ready = true;
    run_all($$.before_update);
    // `false` as a special case of no DOM component
    $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
    if (options.target) {
        if (options.hydrate) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            $$.fragment && $$.fragment.l(children(options.target));
        }
        else {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            $$.fragment && $$.fragment.c();
        }
        if (options.intro)
            transition_in(component.$$.fragment);
        mount_component(component, options.target, options.anchor);
        flush();
    }
    set_current_component(parent_component);
}
class SvelteComponent {
    $destroy() {
        destroy_component(this, 1);
        this.$destroy = noop;
    }
    $on(type, callback) {
        const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
        callbacks.push(callback);
        return () => {
            const index = callbacks.indexOf(callback);
            if (index !== -1)
                callbacks.splice(index, 1);
        };
    }
    $set() {
        // overridden by instance, if it has props
    }
}

/* src/select.svelte generated by Svelte v3.15.0 */

const { Object: Object_1, document: document_1 } = globals;

function add_css() {
	var style = element("style");
	style.id = "svelte-25hmt3-style";
	style.textContent = ".ki-select.svelte-25hmt3{position:relative}.ki-selection.svelte-25hmt3{white-space:nowrap;overflow:hidden;word-break:break-all;text-overflow:ellipsis}.ki-select-popup.svelte-25hmt3{max-height:15rem;max-width:90vw;overflow-y:auto}.ki-select-input.svelte-25hmt3{width:100%;padding-left:0.5rem;padding-right:0.5rem}.ki-select-item.svelte-25hmt3{padding-left:0.5rem;padding-right:0.5rem}.ki-no-click.svelte-25hmt3{pointer-events:none}.ki-caret-container.svelte-25hmt3{margin-top:140%;margin-bottom:100%}.ki-caret-down.svelte-25hmt3{width:0;height:0;border-left:0.35rem solid transparent;border-right:0.35rem solid transparent;border-top:0.35rem solid #232323}";
	append(document_1.head, style);
}

function get_each_context(ctx, list, i) {
	const child_ctx = Object_1.create(ctx);
	child_ctx.item = list[i];
	child_ctx.index = i;
	return child_ctx;
}

function get_each_context_1(ctx, list, i) {
	const child_ctx = Object_1.create(ctx);
	child_ctx.item = list[i];
	child_ctx.index = i;
	return child_ctx;
}

// (733:4) {#each Object.values(selection) as item, index}
function create_each_block_1(ctx) {
	let span;
	let t0_value = (ctx.index > 0 ? ", " : "") + "";
	let t0;
	let t1_value = ctx.item.text + "";
	let t1;
	let span_class_value;

	return {
		c() {
			span = element("span");
			t0 = text(t0_value);
			t1 = text(t1_value);
			attr(span, "class", span_class_value = ctx.item.id ? "text-dark" : "text-muted");
		},
		m(target, anchor) {
			insert(target, span, anchor);
			append(span, t0);
			append(span, t1);
		},
		p(changed, ctx) {
			if (changed.selection && t1_value !== (t1_value = ctx.item.text + "")) set_data(t1, t1_value);

			if (changed.selection && span_class_value !== (span_class_value = ctx.item.id ? "text-dark" : "text-muted")) {
				attr(span, "class", span_class_value);
			}
		},
		d(detaching) {
			if (detaching) detach(span);
		}
	};
}

// (746:2) {#if typeahead}
function create_if_block_9(ctx) {
	let div;
	let input_1;
	let dispose;

	return {
		c() {
			div = element("div");
			input_1 = element("input");
			attr(input_1, "class", "ki-select-input border svelte-25hmt3");
			attr(input_1, "tabindex", "1");
			attr(input_1, "autocomplete", "new-password");
			attr(input_1, "autocorrect", "off");
			attr(input_1, "autocapitalize", "off");
			attr(input_1, "spellcheck", "off");
			attr(div, "class", "dropdown-item ki-select-item svelte-25hmt3");

			dispose = [
				listen(input_1, "input", ctx.input_1_input_handler),
				listen(input_1, "blur", ctx.handleInputBlur),
				listen(input_1, "keypress", ctx.handleInputKeypress),
				listen(input_1, "keydown", ctx.handleInputKeydown),
				listen(input_1, "keyup", ctx.handleInputKeyup)
			];
		},
		m(target, anchor) {
			insert(target, div, anchor);
			append(div, input_1);
			set_input_value(input_1, ctx.query);
			ctx.input_1_binding(input_1);
		},
		p(changed, ctx) {
			if (changed.query && input_1.value !== ctx.query) {
				set_input_value(input_1, ctx.query);
			}
		},
		d(detaching) {
			if (detaching) detach(div);
			ctx.input_1_binding(null);
			run_all(dispose);
		}
	};
}

// (780:2) {:else}
function create_else_block_1(ctx) {
	let each_1_anchor;
	let each_value = ctx.entries;
	let each_blocks = [];

	for (let i = 0; i < each_value.length; i += 1) {
		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
	}

	return {
		c() {
			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			each_1_anchor = empty();
		},
		m(target, anchor) {
			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(target, anchor);
			}

			insert(target, each_1_anchor, anchor);
		},
		p(changed, ctx) {
			if (changed.entries || changed.handleItemKeydown || changed.selection || changed.handleBlur || changed.handleItemClick || changed.handleItemKeyup) {
				each_value = ctx.entries;
				let i;

				for (i = 0; i < each_value.length; i += 1) {
					const child_ctx = get_each_context(ctx, each_value, i);

					if (each_blocks[i]) {
						each_blocks[i].p(changed, child_ctx);
					} else {
						each_blocks[i] = create_each_block(child_ctx);
						each_blocks[i].c();
						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
					}
				}

				for (; i < each_blocks.length; i += 1) {
					each_blocks[i].d(1);
				}

				each_blocks.length = each_value.length;
			}
		},
		d(detaching) {
			destroy_each(each_blocks, detaching);
			if (detaching) detach(each_1_anchor);
		}
	};
}

// (772:31) 
function create_if_block_3(ctx) {
	let div;

	function select_block_type_1(changed, ctx) {
		if (ctx.tooShort) return create_if_block_4;
		return create_else_block;
	}

	let current_block_type = select_block_type_1(null, ctx);
	let if_block = current_block_type(ctx);

	return {
		c() {
			div = element("div");
			if_block.c();
			attr(div, "tabindex", "-1");
			attr(div, "class", "dropdown-item text-muted");
		},
		m(target, anchor) {
			insert(target, div, anchor);
			if_block.m(div, null);
		},
		p(changed, ctx) {
			if (current_block_type === (current_block_type = select_block_type_1(changed, ctx)) && if_block) {
				if_block.p(changed, ctx);
			} else {
				if_block.d(1);
				if_block = current_block_type(ctx);

				if (if_block) {
					if_block.c();
					if_block.m(div, null);
				}
			}
		},
		d(detaching) {
			if (detaching) detach(div);
			if_block.d();
		}
	};
}

// (768:41) 
function create_if_block_2(ctx) {
	let div;

	return {
		c() {
			div = element("div");
			div.textContent = `${ctx.translate("fetching")}`;
			attr(div, "tabindex", "-1");
			attr(div, "class", "dropdown-item text-muted");
		},
		m(target, anchor) {
			insert(target, div, anchor);
		},
		p: noop,
		d(detaching) {
			if (detaching) detach(div);
		}
	};
}

// (764:2) {#if fetchError}
function create_if_block_1(ctx) {
	let div;
	let t;

	return {
		c() {
			div = element("div");
			t = text(ctx.fetchError);
			attr(div, "tabindex", "-1");
			attr(div, "class", "dropdown-item text-danger");
		},
		m(target, anchor) {
			insert(target, div, anchor);
			append(div, t);
		},
		p(changed, ctx) {
			if (changed.fetchError) set_data(t, ctx.fetchError);
		},
		d(detaching) {
			if (detaching) detach(div);
		}
	};
}

// (800:6) {:else}
function create_else_block_2(ctx) {
	let div1;
	let div0;
	let t0_value = (ctx.item.display_text || ctx.item.text) + "";
	let t0;
	let t1;
	let t2;
	let div1_class_value;
	let div1_data_index_value;
	let dispose;
	let if_block = ctx.item.desc && create_if_block_8(ctx);

	return {
		c() {
			div1 = element("div");
			div0 = element("div");
			t0 = text(t0_value);
			t1 = space();
			if (if_block) if_block.c();
			t2 = space();
			attr(div0, "class", "ki-no-click svelte-25hmt3");
			attr(div1, "tabindex", "1");
			attr(div1, "class", div1_class_value = "ki-js-item dropdown-item ki-select-item " + (!ctx.item.id ? "text-muted" : "") + " " + (ctx.selection[ctx.item.id] ? "alert-primary" : "") + " svelte-25hmt3");
			attr(div1, "data-index", div1_data_index_value = ctx.index);

			dispose = [
				listen(div1, "blur", ctx.handleBlur),
				listen(div1, "click", ctx.handleItemClick),
				listen(div1, "keydown", ctx.handleItemKeydown),
				listen(div1, "keyup", ctx.handleItemKeyup)
			];
		},
		m(target, anchor) {
			insert(target, div1, anchor);
			append(div1, div0);
			append(div0, t0);
			append(div1, t1);
			if (if_block) if_block.m(div1, null);
			append(div1, t2);
		},
		p(changed, ctx) {
			if (changed.entries && t0_value !== (t0_value = (ctx.item.display_text || ctx.item.text) + "")) set_data(t0, t0_value);

			if (ctx.item.desc) {
				if (if_block) {
					if_block.p(changed, ctx);
				} else {
					if_block = create_if_block_8(ctx);
					if_block.c();
					if_block.m(div1, t2);
				}
			} else if (if_block) {
				if_block.d(1);
				if_block = null;
			}

			if ((changed.entries || changed.selection) && div1_class_value !== (div1_class_value = "ki-js-item dropdown-item ki-select-item " + (!ctx.item.id ? "text-muted" : "") + " " + (ctx.selection[ctx.item.id] ? "alert-primary" : "") + " svelte-25hmt3")) {
				attr(div1, "class", div1_class_value);
			}
		},
		d(detaching) {
			if (detaching) detach(div1);
			if (if_block) if_block.d();
			run_all(dispose);
		}
	};
}

// (788:50) 
function create_if_block_6(ctx) {
	let div1;
	let div0;
	let t0_value = (ctx.item.display_text || ctx.item.text) + "";
	let t0;
	let t1;
	let t2;
	let dispose;
	let if_block = ctx.item.desc && create_if_block_7(ctx);

	return {
		c() {
			div1 = element("div");
			div0 = element("div");
			t0 = text(t0_value);
			t1 = space();
			if (if_block) if_block.c();
			t2 = space();
			attr(div0, "class", "ki-no-click svelte-25hmt3");
			attr(div1, "tabindex", "-1");
			attr(div1, "class", "dropdown-item text-muted ki-js-blank");
			dispose = listen(div1, "keydown", ctx.handleItemKeydown);
		},
		m(target, anchor) {
			insert(target, div1, anchor);
			append(div1, div0);
			append(div0, t0);
			append(div1, t1);
			if (if_block) if_block.m(div1, null);
			append(div1, t2);
		},
		p(changed, ctx) {
			if (changed.entries && t0_value !== (t0_value = (ctx.item.display_text || ctx.item.text) + "")) set_data(t0, t0_value);

			if (ctx.item.desc) {
				if (if_block) {
					if_block.p(changed, ctx);
				} else {
					if_block = create_if_block_7(ctx);
					if_block.c();
					if_block.m(div1, t2);
				}
			} else if (if_block) {
				if_block.d(1);
				if_block = null;
			}
		},
		d(detaching) {
			if (detaching) detach(div1);
			if (if_block) if_block.d();
			dispose();
		}
	};
}

// (782:6) {#if item.separator}
function create_if_block_5(ctx) {
	let div;
	let div_data_index_value;
	let dispose;

	return {
		c() {
			div = element("div");
			attr(div, "tabindex", "-1");
			attr(div, "class", "dropdown-divider ki-js-blank");
			attr(div, "data-index", div_data_index_value = ctx.index);
			dispose = listen(div, "keydown", ctx.handleItemKeydown);
		},
		m(target, anchor) {
			insert(target, div, anchor);
		},
		p: noop,
		d(detaching) {
			if (detaching) detach(div);
			dispose();
		}
	};
}

// (812:10) {#if item.desc}
function create_if_block_8(ctx) {
	let div;
	let t_value = ctx.item.desc + "";
	let t;

	return {
		c() {
			div = element("div");
			t = text(t_value);
			attr(div, "class", "ki-no-click text-muted svelte-25hmt3");
		},
		m(target, anchor) {
			insert(target, div, anchor);
			append(div, t);
		},
		p(changed, ctx) {
			if (changed.entries && t_value !== (t_value = ctx.item.desc + "")) set_data(t, t_value);
		},
		d(detaching) {
			if (detaching) detach(div);
		}
	};
}

// (794:10) {#if item.desc}
function create_if_block_7(ctx) {
	let div;
	let t_value = ctx.item.desc + "";
	let t;

	return {
		c() {
			div = element("div");
			t = text(t_value);
			attr(div, "class", "ki-no-click text-muted svelte-25hmt3");
		},
		m(target, anchor) {
			insert(target, div, anchor);
			append(div, t);
		},
		p(changed, ctx) {
			if (changed.entries && t_value !== (t_value = ctx.item.desc + "")) set_data(t, t_value);
		},
		d(detaching) {
			if (detaching) detach(div);
		}
	};
}

// (781:4) {#each entries as item, index}
function create_each_block(ctx) {
	let if_block_anchor;

	function select_block_type_2(changed, ctx) {
		if (ctx.item.separator) return create_if_block_5;
		if (ctx.item.disabled || ctx.item.placeholder) return create_if_block_6;
		return create_else_block_2;
	}

	let current_block_type = select_block_type_2(null, ctx);
	let if_block = current_block_type(ctx);

	return {
		c() {
			if_block.c();
			if_block_anchor = empty();
		},
		m(target, anchor) {
			if_block.m(target, anchor);
			insert(target, if_block_anchor, anchor);
		},
		p(changed, ctx) {
			if (current_block_type === (current_block_type = select_block_type_2(changed, ctx)) && if_block) {
				if_block.p(changed, ctx);
			} else {
				if_block.d(1);
				if_block = current_block_type(ctx);

				if (if_block) {
					if_block.c();
					if_block.m(if_block_anchor.parentNode, if_block_anchor);
				}
			}
		},
		d(detaching) {
			if_block.d(detaching);
			if (detaching) detach(if_block_anchor);
		}
	};
}

// (776:6) {:else}
function create_else_block(ctx) {
	let t_value = ctx.translate("no_results") + "";
	let t;

	return {
		c() {
			t = text(t_value);
		},
		m(target, anchor) {
			insert(target, t, anchor);
		},
		p: noop,
		d(detaching) {
			if (detaching) detach(t);
		}
	};
}

// (774:6) {#if tooShort }
function create_if_block_4(ctx) {
	let t_value = ctx.translate("too_short") + "";
	let t;

	return {
		c() {
			t = text(t_value);
		},
		m(target, anchor) {
			insert(target, t, anchor);
		},
		p: noop,
		d(detaching) {
			if (detaching) detach(t);
		}
	};
}

// (822:2) {#if hasMore}
function create_if_block(ctx) {
	let div;

	return {
		c() {
			div = element("div");
			div.textContent = `${ctx.translate("has_more")}`;
			attr(div, "tabindex", "-1");
			attr(div, "class", "dropdown-item text-muted");
		},
		m(target, anchor) {
			insert(target, div, anchor);
			ctx.div_binding(div);
		},
		p: noop,
		d(detaching) {
			if (detaching) detach(div);
			ctx.div_binding(null);
		}
	};
}

function create_fragment(ctx) {
	let button;
	let span0;
	let t0;
	let span2;
	let button_class_value;
	let t1;
	let div1;
	let t2;
	let t3;
	let div1_class_value;
	let dispose;
	let each_value_1 = Object.values(ctx.selection);
	let each_blocks = [];

	for (let i = 0; i < each_value_1.length; i += 1) {
		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
	}

	let if_block0 = ctx.typeahead && create_if_block_9(ctx);

	function select_block_type(changed, ctx) {
		if (ctx.fetchError) return create_if_block_1;
		if (ctx.activeFetch && !ctx.fetchingMore) return create_if_block_2;
		if (ctx.displayCount === 0) return create_if_block_3;
		return create_else_block_1;
	}

	let current_block_type = select_block_type(null, ctx);
	let if_block1 = current_block_type(ctx);
	let if_block2 = ctx.hasMore && create_if_block(ctx);

	return {
		c() {
			button = element("button");
			span0 = element("span");

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			t0 = space();
			span2 = element("span");
			span2.innerHTML = `<div class="ki-caret-container svelte-25hmt3"><span class="ki-caret-down svelte-25hmt3"></span></div>`;
			t1 = space();
			div1 = element("div");
			if (if_block0) if_block0.c();
			t2 = space();
			if_block1.c();
			t3 = space();
			if (if_block2) if_block2.c();
			attr(span0, "class", "ki-selection svelte-25hmt3");
			attr(span2, "class", "ml-auto");
			attr(button, "class", button_class_value = "ki-select form-control d-flex " + ctx.real.getAttribute("class") + " " + ctx.extraClass + " svelte-25hmt3");
			attr(button, "type", "button");
			attr(div1, "class", div1_class_value = "dropdown-menu ki-select-popup " + (ctx.popupVisible ? "show" : "") + " svelte-25hmt3");

			dispose = [
				listen(button, "blur", ctx.handleBlur),
				listen(button, "keydown", ctx.handleToggleKeydown),
				listen(button, "click", ctx.handleToggleClick),
				listen(div1, "scroll", ctx.handlePopupScroll)
			];
		},
		m(target, anchor) {
			insert(target, button, anchor);
			append(button, span0);

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(span0, null);
			}

			append(button, t0);
			append(button, span2);
			ctx.button_binding(button);
			insert(target, t1, anchor);
			insert(target, div1, anchor);
			if (if_block0) if_block0.m(div1, null);
			append(div1, t2);
			if_block1.m(div1, null);
			append(div1, t3);
			if (if_block2) if_block2.m(div1, null);
			ctx.div1_binding(div1);
		},
		p(changed, ctx) {
			if (changed.Object || changed.selection) {
				each_value_1 = Object.values(ctx.selection);
				let i;

				for (i = 0; i < each_value_1.length; i += 1) {
					const child_ctx = get_each_context_1(ctx, each_value_1, i);

					if (each_blocks[i]) {
						each_blocks[i].p(changed, child_ctx);
					} else {
						each_blocks[i] = create_each_block_1(child_ctx);
						each_blocks[i].c();
						each_blocks[i].m(span0, null);
					}
				}

				for (; i < each_blocks.length; i += 1) {
					each_blocks[i].d(1);
				}

				each_blocks.length = each_value_1.length;
			}

			if ((changed.real || changed.extraClass) && button_class_value !== (button_class_value = "ki-select form-control d-flex " + ctx.real.getAttribute("class") + " " + ctx.extraClass + " svelte-25hmt3")) {
				attr(button, "class", button_class_value);
			}

			if (ctx.typeahead) {
				if (if_block0) {
					if_block0.p(changed, ctx);
				} else {
					if_block0 = create_if_block_9(ctx);
					if_block0.c();
					if_block0.m(div1, t2);
				}
			} else if (if_block0) {
				if_block0.d(1);
				if_block0 = null;
			}

			if (current_block_type === (current_block_type = select_block_type(changed, ctx)) && if_block1) {
				if_block1.p(changed, ctx);
			} else {
				if_block1.d(1);
				if_block1 = current_block_type(ctx);

				if (if_block1) {
					if_block1.c();
					if_block1.m(div1, t3);
				}
			}

			if (ctx.hasMore) {
				if (if_block2) {
					if_block2.p(changed, ctx);
				} else {
					if_block2 = create_if_block(ctx);
					if_block2.c();
					if_block2.m(div1, null);
				}
			} else if (if_block2) {
				if_block2.d(1);
				if_block2 = null;
			}

			if (changed.popupVisible && div1_class_value !== (div1_class_value = "dropdown-menu ki-select-popup " + (ctx.popupVisible ? "show" : "") + " svelte-25hmt3")) {
				attr(div1, "class", div1_class_value);
			}
		},
		i: noop,
		o: noop,
		d(detaching) {
			if (detaching) detach(button);
			destroy_each(each_blocks, detaching);
			ctx.button_binding(null);
			if (detaching) detach(t1);
			if (detaching) detach(div1);
			if (if_block0) if_block0.d();
			if_block1.d();
			if (if_block2) if_block2.d();
			ctx.div1_binding(null);
			run_all(dispose);
		}
	};
}

function nop() {
	
}

function hasModifier(event) {
	return event.altKey || event.ctrlKey || event.metaKey || event.shiftKey;
}

function handleEvent(code, handlers, event) {
	(handlers[code] || handlers.base)(event);
}

function instance($$self, $$props, $$invalidate) {
	const I18N_DEFAULTS = {
		fetching: "Searching..",
		no_results: "No results",
		too_short: "Too short",
		has_more: "More...",
		fetching_more: "Searching more..."
	};

	let { real } = $$props;
	let { fetcher } = $$props;
	let { queryMinLen = 0 } = $$props;
	let { translations = I18N_DEFAULTS } = $$props;
	let { delay = 0 } = $$props;
	let { extraClass = "" } = $$props;
	let { typeahead = false } = $$props;
	let query = "";
	let input;
	let toggle;
	let popup;
	let more;
	let mounted = false;
	let entries = [];
	let offsetCount = 0;
	let displayCount = 0;
	let hasMore = false;
	let tooShort = false;
	let fetchingMore = false;
	let fetchError = null;
	let popupVisible = false;
	let activeFetch = null;
	let previousQuery = null;
	let multiple = false;
	let selection = {};
	let wasDown = false;
	let isSyncToReal = false;
	

	function fetcherSelect(offset, query) {
		console.log("SELECT: " + query);

		let promise = new Promise(function (resolve, reject) {
				let entries = [];
				let pattern = query.toUpperCase().trim();
				let options = real.options;

				for (let i = 0; i < options.length; i++) {
					let el = options[i];
					let ds = el.dataset;

					let item = {
						id: el.value || "",
						text: el.text || "",
						desc: ds.desc || ""
					};

					let match = !item.id || item.text.toUpperCase().includes(pattern) || item.desc.toUpperCase().includes(pattern);

					if (match) {
						entries.push(item);
					}
				}

				let response = { entries, info: { more: false } };
				resolve(response);
			});

		return promise;
	}

	function fetchEntries(more) {
		let currentQuery = query.trim();

		if (currentQuery.length > 0) {
			currentQuery = query;
		}

		if (!more && !fetchingMore && currentQuery === previousQuery) {
			return;
		}

		cancelFetch();
		let fetchOffset = 0;

		if (more) {
			fetchOffset = offsetCount;
			$$invalidate("fetchingMore", fetchingMore = true);
		} else {
			$$invalidate("entries", entries = []);
			offsetCount = 0;
			$$invalidate("displayCount", displayCount = 0);
			$$invalidate("hasMore", hasMore = false);
			$$invalidate("fetchingMore", fetchingMore = false);
		}

		$$invalidate("fetchError", fetchError = null);
		let currentFetchOffset = fetchOffset;
		let currentFetchingMore = fetchingMore;

		let currentFetch = new Promise(function (resolve, reject) {
				if (currentFetchingMore) {
					resolve(fetcher(currentFetchOffset, currentQuery));
				} else {
					if (currentQuery.length < queryMinLen) {
						resolve({
							entries: [],
							info: { more: false, too_short: true }
						});
					} else {
						setTimeout(
							function () {
								if (currentFetch === activeFetch) {
									resolve(fetcher(currentFetchOffset, currentQuery));
								} else {
									reject("cancel");
								}
							},
							delay
						);
					}
				}
			}).then(function (response) {
			if (currentFetch === activeFetch) {
				let newEntries = response.entries || [];
				let info = response.info || ({});
				let updateEntries;

				if (currentFetchingMore) {
					updateEntries = entries;

					newEntries.forEach(function (item) {
						updateEntries.push(item);
					});
				} else {
					updateEntries = newEntries;
				}

				$$invalidate("entries", entries = updateEntries);
				updateCounts(entries);
				$$invalidate("hasMore", hasMore = info.more && offsetCount > 0);
				$$invalidate("tooShort", tooShort = info.too_short === true);
				previousQuery = currentQuery;
				$$invalidate("activeFetch", activeFetch = null);
				$$invalidate("fetchingMore", fetchingMore = false);
			}
		}).catch(function (err) {
			if (currentFetch === activeFetch) {
				console.error(err);
				$$invalidate("fetchError", fetchError = err);
				$$invalidate("entries", entries = []);
				offsetCount = 0;
				$$invalidate("displayCount", displayCount = 0);
				$$invalidate("hasMore", hasMore = false);
				$$invalidate("tooShort", tooShort = false);
				previousQuery = null;
				$$invalidate("activeFetch", activeFetch = null);
				$$invalidate("fetchingMore", fetchingMore = false);
				toggle.focus();
				openPopup();
			}
		});

		$$invalidate("activeFetch", activeFetch = currentFetch);
	}

	function updateCounts(entries) {
		let off = 0;
		let disp = 0;

		entries.forEach(function (item) {
			if (item.separator) ; else if (item.placeholder) {
				disp += 1;
			} else {
				off += 1;
				disp += 1;
			}
		});

		offsetCount = off;
		$$invalidate("displayCount", displayCount = disp);
	}

	function cancelFetch() {
		if (activeFetch !== null) {
			$$invalidate("activeFetch", activeFetch = null);
			previousQuery = null;
		}
	}

	function fetchMoreIfneeded() {
		if (hasMore && !fetchingMore) {
			if (popup.scrollTop + popup.clientHeight >= popup.scrollHeight - more.clientHeight * 2 - 2) {
				fetchEntries(true);
			}
		}
	}

	function closePopup(focusToggle) {
		$$invalidate("popupVisible", popupVisible = false);

		if (focusToggle) {
			toggle.focus();
		}
	}

	function openPopup() {
		if (!popupVisible) {
			$$invalidate("popupVisible", popupVisible = true);
			let w = toggle.parentElement.offsetWidth;
			$$invalidate("popup", popup.style.minWidth = w + "px", popup);
		}
	}

	function selectItem(el) {
		let item = entries[el.dataset.index];

		if (!item) {
			console.error("MISSING item", el);
			return;
		}

		if (multiple) {
			if (item.id) {
				delete selection[""];

				if (selection[item.id]) {
					delete selection[item.id];
					$$invalidate("selection", selection);
				} else {
					$$invalidate("selection", selection[item.id] = item, selection);
				}
			} else {
				Object.keys(selection).forEach(function (id) {
					delete selection[id];
				});

				$$invalidate("selection", selection[item.id] = item, selection);
			}
		} else {
			if (!selection[item.id]) {
				Object.keys(selection).forEach(function (id) {
					delete selection[id];
				});
			}

			$$invalidate("selection", selection[item.id] = item, selection);
			closePopup(true);
		}

		syncToReal(selection);
		real.dispatchEvent(new CustomEvent("select-select", { detail: selection }));
	}

	function containsElement(el) {
		return el === input || el === toggle || popup.contains(el);
	}

	function translate(key) {
		return translations[key] || I18N_DEFAULTS[key];
	}

	function syncFromReal() {
		if (isSyncToReal) {
			return;
		}

		let newSelection = {};
		let options = real.selectedOptions;

		for (let i = options.length - 1; i >= 0; i--) {
			let el = options[i];
			let ds = el.dataset;
			let item = { id: el.value, text: el.text };

			if (ds.desc) {
				item.desc = ds.desc;
			}

			newSelection[item.id] = item;
		}

		$$invalidate("selection", selection = newSelection);
	}

	function syncToReal(selection) {
		let changed = false;
		let options = real.options;

		for (let i = options.length - 1; i >= 0; i--) {
			let el = options[i];
			let curr = !!selection[el.value];

			if (el.selected !== curr) {
				changed = true;
			}

			el.selected = curr;
		}

		if (changed) {
			try {
				isSyncToReal = true;
				real.dispatchEvent(new Event("change"));
			} finally {
				isSyncToReal = false;
			}
		}
	}

	onMount(function () {
		real.classList.add("d-none");
		multiple = real.multiple;
		$$invalidate("fetcher", fetcher = fetcherSelect);
		syncFromReal();

		real.addEventListener("change", function () {
			if (!isSyncToReal) {
				syncFromReal();
				console.log("FROM_REAL", selection);
			}
		});

		$$invalidate("mounted", mounted = true);
	});

	let toggleKeydownHandlers = {
		base: nop,
		ArrowDown(event) {
			if (popupVisible) {
				let item = typeahead
				? input
				: popup.querySelectorAll(".ki-js-item")[0];

				if (item) {
					while (item && item.classList.contains("ki-js-blank")) {
						item = item.nextElementSibling;
					}
				}

				if (item) {
					item.focus();
				}
			} else {
				openPopup();

				if (typeahead) {
					setTimeout(function () {
						input.focus();
					});
				}

				fetchEntries();
			}

			event.preventDefault();
		},
		ArrowUp(event) {
			event.preventDefault();
		},
		Escape(event) {
			cancelFetch();
			closePopup(false);
		},
		Tab: nop
	};

	let itemKeydownHandlers = {
		base(event) {
			input.focus();
		},
		ArrowDown(event) {
			let next = event.target.nextElementSibling;

			if (next) {
				while (next && next.classList.contains("ki-js-blank")) {
					next = next.nextElementSibling;
				}

				if (next && !next.classList.contains("ki-js-item")) {
					next = null;
				}
			}

			if (next) {
				next.focus();
			}

			event.preventDefault();
		},
		ArrowUp(event) {
			let next = event.target.previousElementSibling;

			if (next) {
				while (next && next.classList.contains("ki-js-blank")) {
					next = next.previousElementSibling;
				}

				if (next && !next.classList.contains("ki-js-item")) {
					next = null;
				}
			}

			if (next) {
				next.focus();
			} else {
				input.focus();
			}

			event.preventDefault();
		},
		Enter(event) {
			selectItem(event.target);
			event.preventDefault();
		},
		Escape(event) {
			cancelFetch();
			closePopup(true);
		},
		Tab(event) {
			toggle.focus();
			event.preventDefault();
		},
		PageUp: nop,
		PageDown: nop,
		Home: nop,
		End: nop,
		Control: nop,
		Shift: nop,
		AltGraph: nop,
		Meta: nop,
		ContextMenu: nop
	};

	let itemKeyupHandlers = {
		base: nop,
		PageUp(event) {
			let scrollLeft = document.body.scrollLeft;
			let scrollTop = document.body.scrollTop;
			let rect = popup.getBoundingClientRect();
			let item = document.elementFromPoint(scrollLeft + rect.x + 10, scrollTop + rect.top + 1);

			if (!item) {
				item = popup.querySelector(".ki-js-item:first-child");
			} else {
				if (!item.classList.contains("ki-js-item")) {
					item = popup.querySelector(".ki-js-item:first-child");
				}
			}

			if (item) {
				item.focus();
			}

			event.preventDefault();
		},
		PageDown(event) {
			let scrollLeft = document.body.scrollLeft;
			let scrollTop = document.body.scrollTop;
			let h = popup.offsetHeight;
			let rect = popup.getBoundingClientRect();
			let item = document.elementFromPoint(scrollLeft + rect.x + 10, scrollTop + rect.top + h - 10);

			if (!item) {
				item = popup.querySelector(".ki-js-item:last-child");
			} else {
				if (!item.classList.contains("ki-js-item")) {
					item = popup.querySelector(".ki-js-item:last-child");
				}
			}

			if (item) {
				item.focus();
			}

			event.preventDefault();
		},
		Home(event) {
			let item = popup.querySelector(".ki-js-item:first-child");

			if (item) {
				item.focus();
			}

			event.preventDefault();
		},
		End(event) {
			let item = popup.querySelector(".ki-js-item:last-child");

			if (item) {
				item.focus();
			}

			event.preventDefault();
		}
	};

	let inputKeypressHandlers = { base: nop };

	let inputKeydownHandlers = {
		base(event) {
			wasDown = true;
		},
		ArrowUp: nop,
		ArrowDown(event) {
			let item = popup.querySelectorAll(".ki-js-item")[0];

			if (item) {
				while (item && item.classList.contains("ki-js-blank")) {
					item = item.nextElementSibling;
				}
			}

			if (item) {
				item.focus();
			}

			event.preventDefault();
		},
		Escape: itemKeydownHandlers.Escape,
		Tab(event) {
			toggle.focus();
			event.preventDefault();
		}
	};

	let inputKeyupHandlers = {
		base(event) {
			if (wasDown) {
				fetchEntries();
				input.focus();
			}
		},
		Enter: nop,
		Escape: nop,
		Tab: nop,
		ArrowDown: nop,
		ArrowUp: nop,
		ArrowLeft: nop,
		ArrowRight: nop,
		PageDown: nop,
		PageUp: nop,
		Home: nop,
		End: nop,
		Control: nop,
		Shift: nop,
		AltGraph: nop,
		Meta: nop,
		ContextMenu: nop
	};

	function handleBlur(event) {
		if (!containsElement(event.relatedTarget)) {
			cancelFetch();
			closePopup(false);
			syncFromReal();
		}
	}

	function handleInputBlur(event) {
		handleBlur(event);
	}

	function handleInputKeypress(event) {
		handleEvent(event.key, inputKeypressHandlers, event);
	}

	function handleInputKeydown(event) {
		handleEvent(event.key, inputKeydownHandlers, event);
	}

	function handleInputKeyup(event) {
		handleEvent(event.key, inputKeyupHandlers, event);
	}

	function handleToggleKeydown(event) {
		handleEvent(event.key, toggleKeydownHandlers, event);
	}

	function handleToggleClick(event) {
		if (event.button === 0 && !hasModifier(event)) {
			if (popupVisible) {
				closePopup(false);
			} else {
				openPopup();
				fetchEntries();
			}
		}
	}

	function handleItemKeydown(event) {
		handleEvent(event.key, itemKeydownHandlers, event);
	}

	function handleItemKeyup(event) {
		handleEvent(event.key, itemKeyupHandlers, event);
	}

	function handleItemClick(event) {
		if (event.button === 0 && !hasModifier(event)) {
			selectItem(event.target);
		}
	}

	function handlePopupScroll(event) {
		fetchMoreIfneeded();
	}

	function button_binding($$value) {
		binding_callbacks[$$value ? "unshift" : "push"](() => {
			$$invalidate("toggle", toggle = $$value);
		});
	}

	function input_1_input_handler() {
		query = this.value;
		$$invalidate("query", query);
	}

	function input_1_binding($$value) {
		binding_callbacks[$$value ? "unshift" : "push"](() => {
			$$invalidate("input", input = $$value);
		});
	}

	function div_binding($$value) {
		binding_callbacks[$$value ? "unshift" : "push"](() => {
			$$invalidate("more", more = $$value);
		});
	}

	function div1_binding($$value) {
		binding_callbacks[$$value ? "unshift" : "push"](() => {
			$$invalidate("popup", popup = $$value);
		});
	}

	$$self.$set = $$props => {
		if ("real" in $$props) $$invalidate("real", real = $$props.real);
		if ("fetcher" in $$props) $$invalidate("fetcher", fetcher = $$props.fetcher);
		if ("queryMinLen" in $$props) $$invalidate("queryMinLen", queryMinLen = $$props.queryMinLen);
		if ("translations" in $$props) $$invalidate("translations", translations = $$props.translations);
		if ("delay" in $$props) $$invalidate("delay", delay = $$props.delay);
		if ("extraClass" in $$props) $$invalidate("extraClass", extraClass = $$props.extraClass);
		if ("typeahead" in $$props) $$invalidate("typeahead", typeahead = $$props.typeahead);
	};

	$$self.$$.update = (changed = { mounted: 1, selection: 1 }) => {
		if (changed.mounted || changed.selection) {
			 {
				if (mounted) {
					syncToReal(selection);
				}
			}
		}
	};

	return {
		real,
		fetcher,
		queryMinLen,
		translations,
		delay,
		extraClass,
		typeahead,
		query,
		input,
		toggle,
		popup,
		more,
		entries,
		displayCount,
		hasMore,
		tooShort,
		fetchingMore,
		fetchError,
		popupVisible,
		activeFetch,
		selection,
		translate,
		handleBlur,
		handleInputBlur,
		handleInputKeypress,
		handleInputKeydown,
		handleInputKeyup,
		handleToggleKeydown,
		handleToggleClick,
		handleItemKeydown,
		handleItemKeyup,
		handleItemClick,
		handlePopupScroll,
		button_binding,
		input_1_input_handler,
		input_1_binding,
		div_binding,
		div1_binding
	};
}

class Select extends SvelteComponent {
	constructor(options) {
		super();
		if (!document_1.getElementById("svelte-25hmt3-style")) add_css();

		init(this, options, instance, create_fragment, safe_not_equal, {
			real: 0,
			fetcher: 0,
			queryMinLen: 0,
			translations: 0,
			delay: 0,
			extraClass: 0,
			typeahead: 0
		});
	}
}

export default Select;
