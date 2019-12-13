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
        $$.update();
        run_all($$.before_update);
        $$.fragment && $$.fragment.p($$.ctx, $$.dirty);
        $$.dirty = [-1];
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
        $$.ctx = [];
    }
}
function make_dirty(component, i) {
    if (component.$$.dirty[0] === -1) {
        dirty_components.push(component);
        schedule_update();
        component.$$.dirty.fill(0);
    }
    component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
}
function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
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
        dirty
    };
    let ready = false;
    $$.ctx = instance
        ? instance(component, prop_values, (i, ret, value = ret) => {
            if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                if ($$.bound[i])
                    $$.bound[i](value);
                if (ready)
                    make_dirty(component, i);
            }
            return ret;
        })
        : [];
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

/* src/select.svelte generated by Svelte v3.16.4 */

const { document: document_1 } = globals;

function add_css() {
	var style = element("style");
	style.id = "svelte-1y1l0qo-style";
	style.textContent = ".ki-select-container.svelte-1y1l0qo{position:relative}.ki-select-selection.svelte-1y1l0qo{white-space:nowrap;overflow:hidden;word-break:break-all;text-overflow:ellipsis}.ki-select-popup.svelte-1y1l0qo{max-height:15rem;max-width:90vw;overflow-y:auto}.ki-select-selection.svelte-1y1l0qo{width:100%;height:100%}.ki-select-item.svelte-1y1l0qo{padding-left:0.5rem;padding-right:0.5rem}.ki-no-click.svelte-1y1l0qo{pointer-events:none}.ki-caret-container.svelte-1y1l0qo{margin-top:140%;margin-bottom:100%}.ki-caret-down.svelte-1y1l0qo{width:0;height:0;border-left:0.35rem solid transparent;border-right:0.35rem solid transparent;border-top:0.35rem solid #232323}.ki-w-0.svelte-1y1l0qo{width:0}.ki-w-100.svelte-1y1l0qo{width:100%}";
	append(document_1.head, style);
}

function get_each_context(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[72] = list[i];
	child_ctx[74] = i;
	return child_ctx;
}

function get_each_context_1(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[72] = list[i];
	child_ctx[74] = i;
	return child_ctx;
}

// (891:4) {#if typeahead}
function create_if_block_9(ctx) {
	let input_1;
	let input_1_class_value;
	let dispose;

	return {
		c() {
			input_1 = element("input");
			attr(input_1, "class", input_1_class_value = "ki-select-input form-control " + (/*inputVisible*/ ctx[15] ? "" : "d-none") + " svelte-1y1l0qo");
			attr(input_1, "autocomplete", "new-password");
			attr(input_1, "autocorrect", "off");
			attr(input_1, "autocapitalize", "off");
			attr(input_1, "spellcheck", "off");

			dispose = [
				listen(input_1, "input", /*input_1_input_handler*/ ctx[66]),
				listen(input_1, "blur", /*handleInputBlur*/ ctx[19]),
				listen(input_1, "keypress", /*handleInputKeypress*/ ctx[20]),
				listen(input_1, "keydown", /*handleInputKeydown*/ ctx[21]),
				listen(input_1, "keyup", /*handleInputKeyup*/ ctx[22])
			];
		},
		m(target, anchor) {
			insert(target, input_1, anchor);
			set_input_value(input_1, /*query*/ ctx[2]);
			/*input_1_binding*/ ctx[67](input_1);
		},
		p(ctx, dirty) {
			if (dirty[0] & /*inputVisible*/ 32768 && input_1_class_value !== (input_1_class_value = "ki-select-input form-control " + (/*inputVisible*/ ctx[15] ? "" : "d-none") + " svelte-1y1l0qo")) {
				attr(input_1, "class", input_1_class_value);
			}

			if (dirty[0] & /*query*/ 4 && input_1.value !== /*query*/ ctx[2]) {
				set_input_value(input_1, /*query*/ ctx[2]);
			}
		},
		d(detaching) {
			if (detaching) detach(input_1);
			/*input_1_binding*/ ctx[67](null);
			run_all(dispose);
		}
	};
}

// (909:8) {#each Object.values(selection) as item, index}
function create_each_block_1(ctx) {
	let span;
	let t0_value = (/*index*/ ctx[74] > 0 ? ", " : "") + "";
	let t0;
	let t1_value = /*item*/ ctx[72].text + "";
	let t1;
	let span_class_value;

	return {
		c() {
			span = element("span");
			t0 = text(t0_value);
			t1 = text(t1_value);
			attr(span, "class", span_class_value = "ki-no-click " + (/*item*/ ctx[72].id ? "text-dark" : "text-muted") + " svelte-1y1l0qo");
		},
		m(target, anchor) {
			insert(target, span, anchor);
			append(span, t0);
			append(span, t1);
		},
		p(ctx, dirty) {
			if (dirty[0] & /*selection*/ 1024 && t1_value !== (t1_value = /*item*/ ctx[72].text + "")) set_data(t1, t1_value);

			if (dirty[0] & /*selection*/ 1024 && span_class_value !== (span_class_value = "ki-no-click " + (/*item*/ ctx[72].id ? "text-dark" : "text-muted") + " svelte-1y1l0qo")) {
				attr(span, "class", span_class_value);
			}
		},
		d(detaching) {
			if (detaching) detach(span);
		}
	};
}

// (949:4) {:else}
function create_else_block_1(ctx) {
	let each_1_anchor;
	let each_value = /*items*/ ctx[8];
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
		p(ctx, dirty) {
			if (dirty[0] & /*items, handleItemKeydown, selection, handleBlur, handleItemClick, handleItemKeyup*/ 235144448) {
				each_value = /*items*/ ctx[8];
				let i;

				for (i = 0; i < each_value.length; i += 1) {
					const child_ctx = get_each_context(ctx, each_value, i);

					if (each_blocks[i]) {
						each_blocks[i].p(child_ctx, dirty);
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

// (941:33) 
function create_if_block_3(ctx) {
	let div;

	function select_block_type_1(ctx, dirty) {
		if (/*tooShort*/ ctx[12]) return create_if_block_4;
		return create_else_block;
	}

	let current_block_type = select_block_type_1(ctx);
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
		p(ctx, dirty) {
			if (current_block_type === (current_block_type = select_block_type_1(ctx)) && if_block) {
				if_block.p(ctx, dirty);
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

// (937:43) 
function create_if_block_2(ctx) {
	let div;

	return {
		c() {
			div = element("div");
			div.textContent = `${translate("fetching")}`;
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

// (933:4) {#if fetchError}
function create_if_block_1(ctx) {
	let div;
	let t;

	return {
		c() {
			div = element("div");
			t = text(/*fetchError*/ ctx[14]);
			attr(div, "tabindex", "-1");
			attr(div, "class", "dropdown-item text-danger");
		},
		m(target, anchor) {
			insert(target, div, anchor);
			append(div, t);
		},
		p(ctx, dirty) {
			if (dirty[0] & /*fetchError*/ 16384) set_data(t, /*fetchError*/ ctx[14]);
		},
		d(detaching) {
			if (detaching) detach(div);
		}
	};
}

// (969:4) {:else}
function create_else_block_2(ctx) {
	let div1;
	let div0;

	let t0_value = (/*item*/ ctx[72].id
	? /*item*/ ctx[72].display_text || /*item*/ ctx[72].text
	: translate("clear")) + "";

	let t0;
	let t1;
	let t2;
	let div1_class_value;
	let div1_data_id_value;
	let dispose;
	let if_block = /*item*/ ctx[72].desc && create_if_block_8(ctx);

	return {
		c() {
			div1 = element("div");
			div0 = element("div");
			t0 = text(t0_value);
			t1 = space();
			if (if_block) if_block.c();
			t2 = space();
			attr(div0, "class", "ki-no-click svelte-1y1l0qo");
			attr(div1, "tabindex", "1");

			attr(div1, "class", div1_class_value = "ki-js-item dropdown-item ki-select-item " + (!/*item*/ ctx[72].id ? "text-muted" : "") + " " + (/*selection*/ ctx[10][/*item*/ ctx[72].id]
			? "alert-primary"
			: "") + " svelte-1y1l0qo");

			attr(div1, "data-id", div1_data_id_value = /*item*/ ctx[72].id);

			dispose = [
				listen(div1, "blur", /*handleBlur*/ ctx[18]),
				listen(div1, "click", /*handleItemClick*/ ctx[27]),
				listen(div1, "keydown", /*handleItemKeydown*/ ctx[25]),
				listen(div1, "keyup", /*handleItemKeyup*/ ctx[26])
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
		p(ctx, dirty) {
			if (dirty[0] & /*items*/ 256 && t0_value !== (t0_value = (/*item*/ ctx[72].id
			? /*item*/ ctx[72].display_text || /*item*/ ctx[72].text
			: translate("clear")) + "")) set_data(t0, t0_value);

			if (/*item*/ ctx[72].desc) {
				if (if_block) {
					if_block.p(ctx, dirty);
				} else {
					if_block = create_if_block_8(ctx);
					if_block.c();
					if_block.m(div1, t2);
				}
			} else if (if_block) {
				if_block.d(1);
				if_block = null;
			}

			if (dirty[0] & /*items, selection*/ 1280 && div1_class_value !== (div1_class_value = "ki-js-item dropdown-item ki-select-item " + (!/*item*/ ctx[72].id ? "text-muted" : "") + " " + (/*selection*/ ctx[10][/*item*/ ctx[72].id]
			? "alert-primary"
			: "") + " svelte-1y1l0qo")) {
				attr(div1, "class", div1_class_value);
			}

			if (dirty[0] & /*items*/ 256 && div1_data_id_value !== (div1_data_id_value = /*item*/ ctx[72].id)) {
				attr(div1, "data-id", div1_data_id_value);
			}
		},
		d(detaching) {
			if (detaching) detach(div1);
			if (if_block) if_block.d();
			run_all(dispose);
		}
	};
}

// (957:48) 
function create_if_block_6(ctx) {
	let div1;
	let div0;
	let t0_value = (/*item*/ ctx[72].display_text || /*item*/ ctx[72].text) + "";
	let t0;
	let t1;
	let t2;
	let dispose;
	let if_block = /*item*/ ctx[72].desc && create_if_block_7(ctx);

	return {
		c() {
			div1 = element("div");
			div0 = element("div");
			t0 = text(t0_value);
			t1 = space();
			if (if_block) if_block.c();
			t2 = space();
			attr(div0, "class", "ki-no-click svelte-1y1l0qo");
			attr(div1, "tabindex", "-1");
			attr(div1, "class", "dropdown-item text-muted ki-js-blank");
			dispose = listen(div1, "keydown", /*handleItemKeydown*/ ctx[25]);
		},
		m(target, anchor) {
			insert(target, div1, anchor);
			append(div1, div0);
			append(div0, t0);
			append(div1, t1);
			if (if_block) if_block.m(div1, null);
			append(div1, t2);
		},
		p(ctx, dirty) {
			if (dirty[0] & /*items*/ 256 && t0_value !== (t0_value = (/*item*/ ctx[72].display_text || /*item*/ ctx[72].text) + "")) set_data(t0, t0_value);

			if (/*item*/ ctx[72].desc) {
				if (if_block) {
					if_block.p(ctx, dirty);
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

// (951:4) {#if item.separator}
function create_if_block_5(ctx) {
	let div;
	let div_data_index_value;
	let dispose;

	return {
		c() {
			div = element("div");
			attr(div, "tabindex", "-1");
			attr(div, "class", "dropdown-divider ki-js-blank");
			attr(div, "data-index", div_data_index_value = /*index*/ ctx[74]);
			dispose = listen(div, "keydown", /*handleItemKeydown*/ ctx[25]);
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

// (981:6) {#if item.desc}
function create_if_block_8(ctx) {
	let div;
	let t_value = /*item*/ ctx[72].desc + "";
	let t;

	return {
		c() {
			div = element("div");
			t = text(t_value);
			attr(div, "class", "ki-no-click text-muted svelte-1y1l0qo");
		},
		m(target, anchor) {
			insert(target, div, anchor);
			append(div, t);
		},
		p(ctx, dirty) {
			if (dirty[0] & /*items*/ 256 && t_value !== (t_value = /*item*/ ctx[72].desc + "")) set_data(t, t_value);
		},
		d(detaching) {
			if (detaching) detach(div);
		}
	};
}

// (963:6) {#if item.desc}
function create_if_block_7(ctx) {
	let div;
	let t_value = /*item*/ ctx[72].desc + "";
	let t;

	return {
		c() {
			div = element("div");
			t = text(t_value);
			attr(div, "class", "ki-no-click text-muted svelte-1y1l0qo");
		},
		m(target, anchor) {
			insert(target, div, anchor);
			append(div, t);
		},
		p(ctx, dirty) {
			if (dirty[0] & /*items*/ 256 && t_value !== (t_value = /*item*/ ctx[72].desc + "")) set_data(t, t_value);
		},
		d(detaching) {
			if (detaching) detach(div);
		}
	};
}

// (950:4) {#each items as item, index}
function create_each_block(ctx) {
	let if_block_anchor;

	function select_block_type_2(ctx, dirty) {
		if (/*item*/ ctx[72].separator) return create_if_block_5;
		if (/*item*/ ctx[72].disabled || /*item*/ ctx[72].placeholder) return create_if_block_6;
		return create_else_block_2;
	}

	let current_block_type = select_block_type_2(ctx);
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
		p(ctx, dirty) {
			if (current_block_type === (current_block_type = select_block_type_2(ctx)) && if_block) {
				if_block.p(ctx, dirty);
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

// (945:6) {:else}
function create_else_block(ctx) {
	let t_value = translate("no_results") + "";
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

// (943:6) {#if tooShort }
function create_if_block_4(ctx) {
	let t_value = translate("too_short") + "";
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

// (991:4) {#if hasMore}
function create_if_block(ctx) {
	let div;

	return {
		c() {
			div = element("div");
			div.textContent = `${translate("has_more")}`;
			attr(div, "tabindex", "-1");
			attr(div, "class", "dropdown-item text-muted");
		},
		m(target, anchor) {
			insert(target, div, anchor);
			/*div_binding*/ ctx[69](div);
		},
		p: noop,
		d(detaching) {
			if (detaching) detach(div);
			/*div_binding*/ ctx[69](null);
		}
	};
}

function create_fragment(ctx) {
	let div4;
	let div2;
	let t0;
	let div0;
	let span;
	let div0_class_value;
	let t1;
	let div1;
	let button;
	let t2;
	let div3;
	let t3;
	let div3_class_value;
	let div4_class_value;
	let dispose;
	let if_block0 = /*typeahead*/ ctx[1] && create_if_block_9(ctx);
	let each_value_1 = Object.values(/*selection*/ ctx[10]);
	let each_blocks = [];

	for (let i = 0; i < each_value_1.length; i += 1) {
		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
	}

	function select_block_type(ctx, dirty) {
		if (/*fetchError*/ ctx[14]) return create_if_block_1;
		if (/*activeFetch*/ ctx[17] && !/*fetchingMore*/ ctx[13]) return create_if_block_2;
		if (/*displayCount*/ ctx[9] === 0) return create_if_block_3;
		return create_else_block_1;
	}

	let current_block_type = select_block_type(ctx);
	let if_block1 = current_block_type(ctx);
	let if_block2 = /*hasMore*/ ctx[11] && create_if_block(ctx);

	return {
		c() {
			div4 = element("div");
			div2 = element("div");
			if (if_block0) if_block0.c();
			t0 = space();
			div0 = element("div");
			span = element("span");

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			t1 = space();
			div1 = element("div");
			button = element("button");
			button.innerHTML = `<i class="text-dark fas fa-caret-down"></i>`;
			t2 = space();
			div3 = element("div");
			if_block1.c();
			t3 = space();
			if (if_block2) if_block2.c();
			attr(span, "class", "ki-no-click ki-select-selection svelte-1y1l0qo");
			attr(div0, "class", div0_class_value = "form-control " + (/*inputVisible*/ ctx[15] ? "d-none" : ""));
			attr(button, "class", "btn btn-outline-secondary");
			attr(button, "type", "button");
			attr(button, "tabindex", "0");
			attr(div1, "class", "input-group-append");
			attr(div2, "class", "input-group");
			attr(div3, "class", div3_class_value = "dropdown-menu ki-select-popup " + (/*popupVisible*/ ctx[16] ? "show" : "") + " svelte-1y1l0qo");
			attr(div4, "class", div4_class_value = "ki-select-container " + /*extraClass*/ ctx[0] + " svelte-1y1l0qo");

			dispose = [
				listen(div0, "click", /*handleToggleClick*/ ctx[24]),
				listen(button, "blur", /*handleBlur*/ ctx[18]),
				listen(button, "keydown", /*handleToggleKeydown*/ ctx[23]),
				listen(button, "click", /*handleToggleClick*/ ctx[24]),
				listen(div3, "scroll", /*handlePopupScroll*/ ctx[28])
			];
		},
		m(target, anchor) {
			insert(target, div4, anchor);
			append(div4, div2);
			if (if_block0) if_block0.m(div2, null);
			append(div2, t0);
			append(div2, div0);
			append(div0, span);

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(span, null);
			}

			append(div2, t1);
			append(div2, div1);
			append(div1, button);
			/*button_binding*/ ctx[68](button);
			append(div4, t2);
			append(div4, div3);
			if_block1.m(div3, null);
			append(div3, t3);
			if (if_block2) if_block2.m(div3, null);
			/*div3_binding*/ ctx[70](div3);
			/*div4_binding*/ ctx[71](div4);
		},
		p(ctx, dirty) {
			if (/*typeahead*/ ctx[1]) {
				if (if_block0) {
					if_block0.p(ctx, dirty);
				} else {
					if_block0 = create_if_block_9(ctx);
					if_block0.c();
					if_block0.m(div2, t0);
				}
			} else if (if_block0) {
				if_block0.d(1);
				if_block0 = null;
			}

			if (dirty[0] & /*selection*/ 1024) {
				each_value_1 = Object.values(/*selection*/ ctx[10]);
				let i;

				for (i = 0; i < each_value_1.length; i += 1) {
					const child_ctx = get_each_context_1(ctx, each_value_1, i);

					if (each_blocks[i]) {
						each_blocks[i].p(child_ctx, dirty);
					} else {
						each_blocks[i] = create_each_block_1(child_ctx);
						each_blocks[i].c();
						each_blocks[i].m(span, null);
					}
				}

				for (; i < each_blocks.length; i += 1) {
					each_blocks[i].d(1);
				}

				each_blocks.length = each_value_1.length;
			}

			if (dirty[0] & /*inputVisible*/ 32768 && div0_class_value !== (div0_class_value = "form-control " + (/*inputVisible*/ ctx[15] ? "d-none" : ""))) {
				attr(div0, "class", div0_class_value);
			}

			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block1) {
				if_block1.p(ctx, dirty);
			} else {
				if_block1.d(1);
				if_block1 = current_block_type(ctx);

				if (if_block1) {
					if_block1.c();
					if_block1.m(div3, t3);
				}
			}

			if (/*hasMore*/ ctx[11]) {
				if (if_block2) {
					if_block2.p(ctx, dirty);
				} else {
					if_block2 = create_if_block(ctx);
					if_block2.c();
					if_block2.m(div3, null);
				}
			} else if (if_block2) {
				if_block2.d(1);
				if_block2 = null;
			}

			if (dirty[0] & /*popupVisible*/ 65536 && div3_class_value !== (div3_class_value = "dropdown-menu ki-select-popup " + (/*popupVisible*/ ctx[16] ? "show" : "") + " svelte-1y1l0qo")) {
				attr(div3, "class", div3_class_value);
			}

			if (dirty[0] & /*extraClass*/ 1 && div4_class_value !== (div4_class_value = "ki-select-container " + /*extraClass*/ ctx[0] + " svelte-1y1l0qo")) {
				attr(div4, "class", div4_class_value);
			}
		},
		i: noop,
		o: noop,
		d(detaching) {
			if (detaching) detach(div4);
			if (if_block0) if_block0.d();
			destroy_each(each_blocks, detaching);
			/*button_binding*/ ctx[68](null);
			if_block1.d();
			if (if_block2) if_block2.d();
			/*div3_binding*/ ctx[70](null);
			/*div4_binding*/ ctx[71](null);
			run_all(dispose);
		}
	};
}

const I18N_DEFAULTS = {
	clear: "Clear",
	fetching: "Searching..",
	no_results: "No results",
	too_short: "Too short",
	has_more: "More...",
	fetching_more: "Searching more..."
};

let config = { translations: I18N_DEFAULTS };

function translate(key) {
	return config.translations[key] || I18N_DEFAULTS[key];
}

function hasModifier(event) {
	return event.altKey || event.ctrlKey || event.metaKey || event.shiftKey;
}

function isCharacterKey(event) {
	return event.key.length == 1;
}

function nop() {
	
}

function handleEvent(code, handlers, event) {
	(handlers[code] || handlers.base)(event);
}

function instance($$self, $$props, $$invalidate) {
	let { real } = $$props;
	let { fetcher } = $$props;
	let { remote } = $$props;
	let { queryMinLen = 0 } = $$props;
	let { delay = 0 } = $$props;
	let { extraClass = "" } = $$props;
	let { typeahead = false } = $$props;
	let query = "";
	let container;
	let input;
	let toggle;
	let popup;
	let more;
	let mounted = false;
	let items = [];
	let offsetCount = 0;
	let displayCount = 0;
	let selection = {};
	let selectedItems = [];
	let hasMore = false;
	let tooShort = false;
	let fetchingMore = false;
	let fetchError = null;
	let inputVisible = false;
	let popupVisible = false;
	let activeFetch = null;
	let fetched = false;
	let previousFetch = null;
	let previousQuery = null;
	let multiple = false;
	let wasDown = false;
	let isSyncToReal = false;
	

	function inlineFetcher(offset, query) {
		console.log("INLINE_SELECT_FETCH: " + query);

		let promise = new Promise(function (resolve, reject) {
				let items = [];
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
						items.push(item);
					}
				}

				let response = { items, info: { more: false } };
				resolve(response);
			});

		return promise;
	}

	function fetchItems(more, fetchId) {
		let currentQuery;

		if (fetchId) {
			currentQuery = "";
		} else {
			currentQuery = query.trim();

			if (currentQuery.length > 0) {
				currentQuery = query;
			}
		}

		if (!more && !fetchingMore && currentQuery === previousQuery && !fetchId) {
			return activeFetch || previousFetch;
		}

		cancelFetch();
		let fetchOffset = 0;

		if (more) {
			fetchOffset = offsetCount;
		} else {
			$$invalidate(8, items = []);
			offsetCount = 0;
			$$invalidate(9, displayCount = 0);
			$$invalidate(11, hasMore = false);
			fetched = false;
		}

		$$invalidate(13, fetchingMore = more);
		$$invalidate(14, fetchError = null);
		let currentFetchOffset = fetchOffset;
		let currentFetchingMore = fetchingMore;

		let currentFetch = new Promise(function (resolve, reject) {
				if (currentFetchingMore) {
					resolve(fetcher(currentFetchOffset, currentQuery, fetchId));
				} else {
					if (currentQuery.length < queryMinLen && !fetchId) {
						resolve({
							items: [],
							info: { more: false, too_short: true }
						});
					} else {
						setTimeout(
							function () {
								if (currentFetch === activeFetch) {
									resolve(fetcher(currentFetchOffset, currentQuery, fetchId));
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
				let newItems = response.items || [];
				let info = response.info || ({});
				let updateItems;

				if (currentFetchingMore) {
					updateItems = items;

					newItems.forEach(function (item) {
						updateItems.push(item);
					});
				} else {
					updateItems = newItems;
				}

				$$invalidate(8, items = updateItems);
				resolveItems(items);
				$$invalidate(11, hasMore = info.more && offsetCount > 0 && !fetchId);
				$$invalidate(12, tooShort = info.too_short === true);

				if (fetchId) {
					previousQuery = null;
				} else {
					previousQuery = currentQuery;
				}

				previousFetch = currentFetch;
				$$invalidate(17, activeFetch = null);
				fetched = true;
				$$invalidate(13, fetchingMore = false);
			}
		}).catch(function (err) {
			if (currentFetch === activeFetch) {
				console.error(err);
				$$invalidate(14, fetchError = err);
				$$invalidate(8, items = []);
				offsetCount = 0;
				$$invalidate(9, displayCount = 0);
				$$invalidate(11, hasMore = false);
				$$invalidate(12, tooShort = false);
				previousQuery = null;
				previousFetch = currentFetch;
				$$invalidate(17, activeFetch = null);
				fetched = false;
				$$invalidate(13, fetchingMore = false);
				toggle.focus();
				openPopup();
			}
		});

		$$invalidate(17, activeFetch = currentFetch);
		previousFetch = null;
		return currentFetch;
	}

	function resolveItems(items) {
		let off = 0;
		let disp = 0;

		items.forEach(function (item) {
			if (item.id) {
				item.id = item.id.toString();
			}

			if (item.separator) ; else if (item.placeholder) {
				disp += 1;
			} else {
				off += 1;
				disp += 1;
			}
		});

		offsetCount = off;
		$$invalidate(9, displayCount = disp);
	}

	function cancelFetch() {
		if (activeFetch !== null) {
			$$invalidate(17, activeFetch = null);
			fetched = false;
			previousQuery = null;
		}
	}

	function fetchMoreIfneeded() {
		if (hasMore && !fetchingMore) {
			if (popup.scrollTop + popup.clientHeight >= popup.scrollHeight - more.clientHeight * 2 - 2) {
				fetchItems(true);
			}
		}
	}

	function clearQuery() {
		$$invalidate(2, query = "");
		previousQuery = null;
	}

	let focusingInput = null;

	function openInput(focusInput) {
		if (!typeahead) {
			return;
		}

		let wasVisible = inputVisible;
		$$invalidate(15, inputVisible = true);

		if (!focusInput) {
			return;
		}

		if (wasVisible) {
			input.focus();
		} else {
			if (!focusingInput) {
				focusingInput = function () {
					if (focusingInput) {
						focusingInput = null;
						input.focus();
					}
				};

				setTimeout(focusingInput);
			}
		}
	}

	function closeInput(focusToggle) {
		if (!typeahead) {
			return;
		}

		focusingInput = null;
		$$invalidate(15, inputVisible = false);

		if (focusToggle) {
			toggle.focus();
		}
	}

	function openPopup() {
		if (!popupVisible) {
			$$invalidate(16, popupVisible = true);
			let w = container.offsetWidth;
			$$invalidate(6, popup.style.minWidth = w + "px", popup);
		}
	}

	function closePopup(focusToggle) {
		$$invalidate(16, popupVisible = false);

		if (focusToggle) {
			toggle.focus();
		}
	}

	function selectItemImpl(id) {
		id = id.toString();

		let item = items.find(function (item) {
			return item.id.toString() === id;
		});

		if (!item) {
			console.error("MISSING item=" + id);
			return;
		}

		if (multiple) {
			if (item.id) {
				delete selection[""];

				if (selection[item.id]) {
					delete selection[item.id];
					$$invalidate(10, selection);
				} else {
					$$invalidate(10, selection[item.id] = item, selection);
				}
			} else {
				Object.keys(selection).forEach(function (id) {
					delete selection[id];
				});

				$$invalidate(10, selection[item.id] = item, selection);
			}
		} else {
			if (!selection[item.id]) {
				Object.keys(selection).forEach(function (id) {
					delete selection[id];
				});
			}

			$$invalidate(10, selection[item.id] = item, selection);
			clearQuery();
			closePopup(true);
			closeInput(false);
		}

		syncToReal(selection);
		real.dispatchEvent(new CustomEvent("select-select", { detail: selection }));
	}

	function selectItem(id) {
		return fetchItems(false, id).then(function (response) {
			selectItemImpl(id);
		});
	}

	function selectElement(el) {
		selectItemImpl(el.dataset.id);
	}

	function containsElement(el) {
		return el === input || el === toggle || popup.contains(el);
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

		$$invalidate(10, selection = newSelection);
	}

	function syncToReal(selection) {
		let changed = false;

		if (remote) {
			Object.values(selection).forEach(function (item) {
				let el = real.querySelector("option[value=\"" + item.id.trim() + "\"]");

				if (!el) {
					let el = document.createElement("option");
					el.setAttribute("value", item.id);

					if (item.desc) {
						el.setAttribute("data-desc", item.desc);
					}

					el.textContent = item.text;
					real.appendChild(el);
				}
			});
		}

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

		if (remote) ; else {
			$$invalidate(29, fetcher = inlineFetcher);
		}

		syncFromReal();

		real.addEventListener("change", function () {
			if (!isSyncToReal) {
				syncFromReal();
				console.log("FROM_REAL", selection);
			}
		});

		$$invalidate(35, mounted = true);
	});

	let inputKeypressHandlers = {
		base(event) {
			
		}
	};

	let inputKeydownHandlers = {
		base(event) {
			wasDown = true;
			openInput(true);
		},
		ArrowDown(event) {
			let item = popupVisible
			? popup.querySelectorAll(".ki-js-item")[0]
			: null;

			if (item) {
				while (item && item.classList.contains("ki-js-blank")) {
					item = item.nextElementSibling;
				}

				item.focus();
			} else {
				openPopup();
				fetchItems(false);
			}

			event.preventDefault();
		},
		ArrowUp(event) {
			event.preventDefault();
		},
		Escape(event) {
			cancelFetch();
			clearQuery();
			closePopup(true);
			closeInput(false);
		},
		Tab: nop
	};

	let inputKeyupHandlers = {
		base(event) {
			if (wasDown) {
				openPopup();
				fetchItems(false);
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

	let toggleKeydownHandlers = {
		base(event) {
			if (isCharacterKey(event)) {
				openInput(true);
				event.preventDefault();
			}
		},
		ArrowDown: inputKeydownHandlers.ArrowDown,
		ArrowUp: inputKeydownHandlers.ArrowDown,
		Enter(event) {
			openPopup();
			fetchItems(false);
			event.preventDefault();
		},
		Space(event) {
			openPopup();
			fetchItems(false);
			event.preventDefault();
		},
		Escape(event) {
			cancelFetch();
			clearQuery();
			closePopup(false);
			closeInput(false);
		},
		Tab: nop,
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

	let itemKeydownHandlers = {
		base(event) {
			if (isCharacterKey(event)) {
				openInput(true);
				event.preventDefault();
			}
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
			selectElement(event.target);
			event.preventDefault();
		},
		Escape(event) {
			cancelFetch();
			clearQuery();
			closePopup(true);
			closeInput(false);
		},
		PageUp: nop,
		PageDown: nop,
		Home: nop,
		End: nop,
		Tab(event) {
			if (inputVisible) {
				input.focus();
			} else {
				toggle.focus();
			}

			event.preventDefault();
		},
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

	function handleBlur(event) {
		if (!containsElement(event.relatedTarget)) {
			cancelFetch();
			clearQuery();
			closePopup(false);
			closeInput(false);
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
			toggle.focus();

			if (popupVisible) {
				closePopup(false);
			} else {
				openPopup();
				fetchItems(false);
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
			selectElement(event.target);
		}
	}

	function handlePopupScroll(event) {
		fetchMoreIfneeded();
	}

	function input_1_input_handler() {
		query = this.value;
		$$invalidate(2, query);
	}

	function input_1_binding($$value) {
		binding_callbacks[$$value ? "unshift" : "push"](() => {
			$$invalidate(4, input = $$value);
		});
	}

	function button_binding($$value) {
		binding_callbacks[$$value ? "unshift" : "push"](() => {
			$$invalidate(5, toggle = $$value);
		});
	}

	function div_binding($$value) {
		binding_callbacks[$$value ? "unshift" : "push"](() => {
			$$invalidate(7, more = $$value);
		});
	}

	function div3_binding($$value) {
		binding_callbacks[$$value ? "unshift" : "push"](() => {
			$$invalidate(6, popup = $$value);
		});
	}

	function div4_binding($$value) {
		binding_callbacks[$$value ? "unshift" : "push"](() => {
			$$invalidate(3, container = $$value);
		});
	}

	$$self.$set = $$props => {
		if ("real" in $$props) $$invalidate(30, real = $$props.real);
		if ("fetcher" in $$props) $$invalidate(29, fetcher = $$props.fetcher);
		if ("remote" in $$props) $$invalidate(31, remote = $$props.remote);
		if ("queryMinLen" in $$props) $$invalidate(32, queryMinLen = $$props.queryMinLen);
		if ("delay" in $$props) $$invalidate(33, delay = $$props.delay);
		if ("extraClass" in $$props) $$invalidate(0, extraClass = $$props.extraClass);
		if ("typeahead" in $$props) $$invalidate(1, typeahead = $$props.typeahead);
	};

	$$self.$$.update = () => {
		if ($$self.$$.dirty[0] & /*selection*/ 1024 | $$self.$$.dirty[1] & /*mounted*/ 16) {
			 {
				if (mounted) {
					syncToReal(selection);
				}
			}
		}
	};

	return [
		extraClass,
		typeahead,
		query,
		container,
		input,
		toggle,
		popup,
		more,
		items,
		displayCount,
		selection,
		hasMore,
		tooShort,
		fetchingMore,
		fetchError,
		inputVisible,
		popupVisible,
		activeFetch,
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
		fetcher,
		real,
		remote,
		queryMinLen,
		delay,
		selectItem,
		mounted,
		offsetCount,
		fetched,
		previousFetch,
		previousQuery,
		multiple,
		wasDown,
		isSyncToReal,
		focusingInput,
		selectedItems,
		inlineFetcher,
		fetchItems,
		resolveItems,
		cancelFetch,
		fetchMoreIfneeded,
		clearQuery,
		openInput,
		closeInput,
		openPopup,
		closePopup,
		selectItemImpl,
		selectElement,
		containsElement,
		syncFromReal,
		syncToReal,
		inputKeypressHandlers,
		inputKeydownHandlers,
		inputKeyupHandlers,
		toggleKeydownHandlers,
		itemKeydownHandlers,
		itemKeyupHandlers,
		input_1_input_handler,
		input_1_binding,
		button_binding,
		div_binding,
		div3_binding,
		div4_binding
	];
}

class Select extends SvelteComponent {
	constructor(options) {
		super();
		if (!document_1.getElementById("svelte-1y1l0qo-style")) add_css();

		init(
			this,
			options,
			instance,
			create_fragment,
			safe_not_equal,
			{
				real: 30,
				fetcher: 29,
				remote: 31,
				queryMinLen: 32,
				delay: 33,
				extraClass: 0,
				typeahead: 1,
				selectItem: 34
			},
			[-1, -1, -1]
		);
	}

	get selectItem() {
		return this.$$.ctx[34];
	}
}

export default Select;
export { config };
