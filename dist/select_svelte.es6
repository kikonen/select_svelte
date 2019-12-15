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

function destroy_block(block, lookup) {
    block.d(1);
    lookup.delete(block.key);
}
function update_keyed_each(old_blocks, dirty, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
    let o = old_blocks.length;
    let n = list.length;
    let i = o;
    const old_indexes = {};
    while (i--)
        old_indexes[old_blocks[i].key] = i;
    const new_blocks = [];
    const new_lookup = new Map();
    const deltas = new Map();
    i = n;
    while (i--) {
        const child_ctx = get_context(ctx, list, i);
        const key = get_key(child_ctx);
        let block = lookup.get(key);
        if (!block) {
            block = create_each_block(key, child_ctx);
            block.c();
        }
        else if (dynamic) {
            block.p(child_ctx, dirty);
        }
        new_lookup.set(key, new_blocks[i] = block);
        if (key in old_indexes)
            deltas.set(key, Math.abs(i - old_indexes[key]));
    }
    const will_move = new Set();
    const did_move = new Set();
    function insert(block) {
        transition_in(block, 1);
        block.m(node, next);
        lookup.set(block.key, block);
        next = block.first;
        n--;
    }
    while (o && n) {
        const new_block = new_blocks[n - 1];
        const old_block = old_blocks[o - 1];
        const new_key = new_block.key;
        const old_key = old_block.key;
        if (new_block === old_block) {
            // do nothing
            next = new_block.first;
            o--;
            n--;
        }
        else if (!new_lookup.has(old_key)) {
            // remove old block
            destroy(old_block, lookup);
            o--;
        }
        else if (!lookup.has(new_key) || will_move.has(new_key)) {
            insert(new_block);
        }
        else if (did_move.has(old_key)) {
            o--;
        }
        else if (deltas.get(new_key) > deltas.get(old_key)) {
            did_move.add(new_key);
            insert(new_block);
        }
        else {
            will_move.add(old_key);
            o--;
        }
    }
    while (o--) {
        const old_block = old_blocks[o];
        if (!new_lookup.has(old_block.key))
            destroy(old_block, lookup);
    }
    while (n)
        insert(new_blocks[n - 1]);
    return new_blocks;
}
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
	style.id = "svelte-11aflex-style";
	style.textContent = ".ki-select-container.svelte-11aflex{position:relative}.ki-select-selection.svelte-11aflex{width:100%;height:100%}.ki-select-selected-item.svelte-11aflex{white-space:nowrap;overflow:hidden;word-break:break-all;text-overflow:ellipsis}.ki-select-popup.svelte-11aflex{max-height:15rem;max-width:90vw;overflow-y:auto}.ki-select-item.svelte-11aflex{padding-left:0.5rem;padding-right:0.5rem}.ki-no-click.svelte-11aflex{pointer-events:none}.ki-caret-container.svelte-11aflex{margin-top:140%;margin-bottom:100%}.ki-caret-down.svelte-11aflex{width:0;height:0;border-left:0.35rem solid transparent;border-right:0.35rem solid transparent;border-top:0.35rem solid #232323}.ki-w-0.svelte-11aflex{width:0}.ki-w-100.svelte-11aflex{width:100%}";
	append(document_1.head, style);
}

function get_each_context(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[80] = list[i];
	return child_ctx;
}

function get_each_context_1(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[80] = list[i];
	child_ctx[84] = i;
	return child_ctx;
}

function get_each_context_2(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[80] = list[i];
	child_ctx[84] = i;
	return child_ctx;
}

// (1043:4) {#if typeahead}
function create_if_block_17(ctx) {
	let input_1;
	let input_1_class_value;
	let dispose;

	return {
		c() {
			input_1 = element("input");
			attr(input_1, "class", input_1_class_value = "ki-select-input form-control " + (/*inputVisible*/ ctx[18] ? "" : "d-none") + " svelte-11aflex");
			attr(input_1, "autocomplete", "new-password");
			attr(input_1, "autocorrect", "off");
			attr(input_1, "autocapitalize", "off");
			attr(input_1, "spellcheck", "off");

			dispose = [
				listen(input_1, "input", /*input_1_input_handler*/ ctx[73]),
				listen(input_1, "blur", /*handleInputBlur*/ ctx[23]),
				listen(input_1, "keypress", /*handleInputKeypress*/ ctx[24]),
				listen(input_1, "keydown", /*handleInputKeydown*/ ctx[25]),
				listen(input_1, "keyup", /*handleInputKeyup*/ ctx[26])
			];
		},
		m(target, anchor) {
			insert(target, input_1, anchor);
			set_input_value(input_1, /*query*/ ctx[2]);
			/*input_1_binding*/ ctx[74](input_1);
		},
		p(ctx, dirty) {
			if (dirty[0] & /*inputVisible*/ 262144 && input_1_class_value !== (input_1_class_value = "ki-select-input form-control " + (/*inputVisible*/ ctx[18] ? "" : "d-none") + " svelte-11aflex")) {
				attr(input_1, "class", input_1_class_value);
			}

			if (dirty[0] & /*query*/ 4 && input_1.value !== /*query*/ ctx[2]) {
				set_input_value(input_1, /*query*/ ctx[2]);
			}
		},
		d(detaching) {
			if (detaching) detach(input_1);
			/*input_1_binding*/ ctx[74](null);
			run_all(dispose);
		}
	};
}

// (1063:8) {#each selectedItems as item, index (item.id)}
function create_each_block_2(key_1, ctx) {
	let span;
	let t0_value = (/*index*/ ctx[84] > 0 ? ", " : "") + "";
	let t0;
	let t1_value = /*item*/ ctx[80].text + "";
	let t1;
	let span_class_value;

	return {
		key: key_1,
		first: null,
		c() {
			span = element("span");
			t0 = text(t0_value);
			t1 = text(t1_value);
			attr(span, "class", span_class_value = "ki-no-click ki-select-selected-item " + (/*item*/ ctx[80].id ? "text-dark" : "text-muted") + " svelte-11aflex");
			this.first = span;
		},
		m(target, anchor) {
			insert(target, span, anchor);
			append(span, t0);
			append(span, t1);
		},
		p(ctx, dirty) {
			if (dirty[0] & /*selectedItems*/ 4096 && t0_value !== (t0_value = (/*index*/ ctx[84] > 0 ? ", " : "") + "")) set_data(t0, t0_value);
			if (dirty[0] & /*selectedItems*/ 4096 && t1_value !== (t1_value = /*item*/ ctx[80].text + "")) set_data(t1, t1_value);

			if (dirty[0] & /*selectedItems*/ 4096 && span_class_value !== (span_class_value = "ki-no-click ki-select-selected-item " + (/*item*/ ctx[80].id ? "text-dark" : "text-muted") + " svelte-11aflex")) {
				attr(span, "class", span_class_value);
			}
		},
		d(detaching) {
			if (detaching) detach(span);
		}
	};
}

// (1097:32) 
function create_if_block_15(ctx) {
	let div;

	function select_block_type_1(ctx, dirty) {
		if (/*tooShort*/ ctx[15]) return create_if_block_16;
		return create_else_block_3;
	}

	let current_block_type = select_block_type_1(ctx);
	let if_block = current_block_type(ctx);

	return {
		c() {
			div = element("div");
			if_block.c();
			attr(div, "tabindex", "-1");
			attr(div, "class", "dropdown-item text-muted ki-select-item svelte-11aflex");
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

// (1091:43) 
function create_if_block_14(ctx) {
	return { c: noop, m: noop, p: noop, d: noop };
}

// (1086:4) {#if fetchError}
function create_if_block_13(ctx) {
	let div;
	let t;

	return {
		c() {
			div = element("div");
			t = text(/*fetchError*/ ctx[17]);
			attr(div, "tabindex", "-1");
			attr(div, "class", "dropdown-item text-danger ki-select-item svelte-11aflex");
		},
		m(target, anchor) {
			insert(target, div, anchor);
			append(div, t);
		},
		p(ctx, dirty) {
			if (dirty[0] & /*fetchError*/ 131072) set_data(t, /*fetchError*/ ctx[17]);
		},
		d(detaching) {
			if (detaching) detach(div);
		}
	};
}

// (1101:8) {:else}
function create_else_block_3(ctx) {
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

// (1099:8) {#if tooShort }
function create_if_block_16(ctx) {
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

// (1108:6) {#if item.id}
function create_if_block_8(ctx) {
	let div3;
	let div2;
	let t0;
	let div1;
	let div0;
	let t1;
	let div3_data_id_value;
	let dispose;
	let if_block0 = /*multiple*/ ctx[21] && create_if_block_11(ctx);

	function select_block_type_2(ctx, dirty) {
		if (/*item*/ ctx[80].id) return create_if_block_10;
		return create_else_block_2;
	}

	let current_block_type = select_block_type_2(ctx);
	let if_block1 = current_block_type(ctx);
	let if_block2 = /*item*/ ctx[80].desc && create_if_block_9(ctx);

	return {
		c() {
			div3 = element("div");
			div2 = element("div");
			if (if_block0) if_block0.c();
			t0 = space();
			div1 = element("div");
			div0 = element("div");
			if_block1.c();
			t1 = space();
			if (if_block2) if_block2.c();
			attr(div0, "class", "ki-no-click svelte-11aflex");
			attr(div1, "class", "d-inline-block");
			attr(div2, "class", "ki-no-click svelte-11aflex");
			attr(div3, "tabindex", "1");
			attr(div3, "class", "ki-js-item dropdown-item ki-select-item svelte-11aflex");
			attr(div3, "data-id", div3_data_id_value = /*item*/ ctx[80].id);
			attr(div3, "data-selection", "true");

			dispose = [
				listen(div3, "blur", /*handleBlur*/ ctx[22]),
				listen(div3, "click", /*handleItemClick*/ ctx[31]),
				listen(div3, "keydown", /*handleItemKeydown*/ ctx[29]),
				listen(div3, "keyup", /*handleItemKeyup*/ ctx[30])
			];
		},
		m(target, anchor) {
			insert(target, div3, anchor);
			append(div3, div2);
			if (if_block0) if_block0.m(div2, null);
			append(div2, t0);
			append(div2, div1);
			append(div1, div0);
			if_block1.m(div0, null);
			append(div1, t1);
			if (if_block2) if_block2.m(div1, null);
		},
		p(ctx, dirty) {
			if (/*multiple*/ ctx[21]) {
				if (if_block0) {
					if_block0.p(ctx, dirty);
				} else {
					if_block0 = create_if_block_11(ctx);
					if_block0.c();
					if_block0.m(div2, t0);
				}
			} else if (if_block0) {
				if_block0.d(1);
				if_block0 = null;
			}

			if (current_block_type === (current_block_type = select_block_type_2(ctx)) && if_block1) {
				if_block1.p(ctx, dirty);
			} else {
				if_block1.d(1);
				if_block1 = current_block_type(ctx);

				if (if_block1) {
					if_block1.c();
					if_block1.m(div0, null);
				}
			}

			if (/*item*/ ctx[80].desc) {
				if (if_block2) {
					if_block2.p(ctx, dirty);
				} else {
					if_block2 = create_if_block_9(ctx);
					if_block2.c();
					if_block2.m(div1, null);
				}
			} else if (if_block2) {
				if_block2.d(1);
				if_block2 = null;
			}

			if (dirty[0] & /*selectedItems*/ 4096 && div3_data_id_value !== (div3_data_id_value = /*item*/ ctx[80].id)) {
				attr(div3, "data-id", div3_data_id_value);
			}
		},
		d(detaching) {
			if (detaching) detach(div3);
			if (if_block0) if_block0.d();
			if_block1.d();
			if (if_block2) if_block2.d();
			run_all(dispose);
		}
	};
}

// (1119:12) {#if multiple}
function create_if_block_11(ctx) {
	let div;
	let if_block = /*item*/ ctx[80].id && create_if_block_12();

	return {
		c() {
			div = element("div");
			if (if_block) if_block.c();
			attr(div, "class", "d-inline-block align-top");
		},
		m(target, anchor) {
			insert(target, div, anchor);
			if (if_block) if_block.m(div, null);
		},
		p(ctx, dirty) {
			if (/*item*/ ctx[80].id) {
				if (!if_block) {
					if_block = create_if_block_12();
					if_block.c();
					if_block.m(div, null);
				}
			} else if (if_block) {
				if_block.d(1);
				if_block = null;
			}
		},
		d(detaching) {
			if (detaching) detach(div);
			if (if_block) if_block.d();
		}
	};
}

// (1121:16) {#if item.id}
function create_if_block_12(ctx) {
	let i;

	return {
		c() {
			i = element("i");
			attr(i, "class", "far fa-check-square");
		},
		m(target, anchor) {
			insert(target, i, anchor);
		},
		d(detaching) {
			if (detaching) detach(i);
		}
	};
}

// (1131:16) {:else}
function create_else_block_2(ctx) {
	let t_value = translate("clear") + "";
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

// (1129:16) {#if item.id}
function create_if_block_10(ctx) {
	let t_value = /*item*/ ctx[80].text + "";
	let t;

	return {
		c() {
			t = text(t_value);
		},
		m(target, anchor) {
			insert(target, t, anchor);
		},
		p(ctx, dirty) {
			if (dirty[0] & /*selectedItems*/ 4096 && t_value !== (t_value = /*item*/ ctx[80].text + "")) set_data(t, t_value);
		},
		d(detaching) {
			if (detaching) detach(t);
		}
	};
}

// (1136:14) {#if item.desc}
function create_if_block_9(ctx) {
	let div;
	let t_value = /*item*/ ctx[80].desc + "";
	let t;

	return {
		c() {
			div = element("div");
			t = text(t_value);
			attr(div, "class", "ki-no-click text-muted svelte-11aflex");
		},
		m(target, anchor) {
			insert(target, div, anchor);
			append(div, t);
		},
		p(ctx, dirty) {
			if (dirty[0] & /*selectedItems*/ 4096 && t_value !== (t_value = /*item*/ ctx[80].desc + "")) set_data(t, t_value);
		},
		d(detaching) {
			if (detaching) detach(div);
		}
	};
}

// (1107:4) {#each selectedItems as item, index (item.id)}
function create_each_block_1(key_1, ctx) {
	let first;
	let if_block_anchor;
	let if_block = /*item*/ ctx[80].id && create_if_block_8(ctx);

	return {
		key: key_1,
		first: null,
		c() {
			first = empty();
			if (if_block) if_block.c();
			if_block_anchor = empty();
			this.first = first;
		},
		m(target, anchor) {
			insert(target, first, anchor);
			if (if_block) if_block.m(target, anchor);
			insert(target, if_block_anchor, anchor);
		},
		p(ctx, dirty) {
			if (/*item*/ ctx[80].id) {
				if (if_block) {
					if_block.p(ctx, dirty);
				} else {
					if_block = create_if_block_8(ctx);
					if_block.c();
					if_block.m(if_block_anchor.parentNode, if_block_anchor);
				}
			} else if (if_block) {
				if_block.d(1);
				if_block = null;
			}
		},
		d(detaching) {
			if (detaching) detach(first);
			if (if_block) if_block.d(detaching);
			if (detaching) detach(if_block_anchor);
		}
	};
}

// (1172:6) {:else}
function create_else_block(ctx) {
	let div3;
	let div2;
	let t0;
	let div1;
	let div0;
	let t1;
	let div3_class_value;
	let div3_data_id_value;
	let dispose;
	let if_block0 = /*multiple*/ ctx[21] && create_if_block_6(ctx);

	function select_block_type_4(ctx, dirty) {
		if (/*item*/ ctx[80].id) return create_if_block_5;
		return create_else_block_1;
	}

	let current_block_type = select_block_type_4(ctx);
	let if_block1 = current_block_type(ctx);
	let if_block2 = /*item*/ ctx[80].desc && create_if_block_4(ctx);

	return {
		c() {
			div3 = element("div");
			div2 = element("div");
			if (if_block0) if_block0.c();
			t0 = space();
			div1 = element("div");
			div0 = element("div");
			if_block1.c();
			t1 = space();
			if (if_block2) if_block2.c();
			attr(div0, "class", "ki-no-click svelte-11aflex");
			attr(div1, "class", "d-inline-block");
			attr(div2, "class", "ki-no-click svelte-11aflex");
			attr(div3, "tabindex", "1");

			attr(div3, "class", div3_class_value = "ki-js-item dropdown-item ki-select-item " + (!/*item*/ ctx[80].id ? "text-muted" : "") + " " + (/*selection*/ ctx[11][/*item*/ ctx[80].id]
			? "alert-primary"
			: "") + " svelte-11aflex");

			attr(div3, "data-id", div3_data_id_value = /*item*/ ctx[80].id);

			dispose = [
				listen(div3, "blur", /*handleBlur*/ ctx[22]),
				listen(div3, "click", /*handleItemClick*/ ctx[31]),
				listen(div3, "keydown", /*handleItemKeydown*/ ctx[29]),
				listen(div3, "keyup", /*handleItemKeyup*/ ctx[30])
			];
		},
		m(target, anchor) {
			insert(target, div3, anchor);
			append(div3, div2);
			if (if_block0) if_block0.m(div2, null);
			append(div2, t0);
			append(div2, div1);
			append(div1, div0);
			if_block1.m(div0, null);
			append(div1, t1);
			if (if_block2) if_block2.m(div1, null);
		},
		p(ctx, dirty) {
			if (/*multiple*/ ctx[21]) {
				if (if_block0) {
					if_block0.p(ctx, dirty);
				} else {
					if_block0 = create_if_block_6(ctx);
					if_block0.c();
					if_block0.m(div2, t0);
				}
			} else if (if_block0) {
				if_block0.d(1);
				if_block0 = null;
			}

			if (current_block_type === (current_block_type = select_block_type_4(ctx)) && if_block1) {
				if_block1.p(ctx, dirty);
			} else {
				if_block1.d(1);
				if_block1 = current_block_type(ctx);

				if (if_block1) {
					if_block1.c();
					if_block1.m(div0, null);
				}
			}

			if (/*item*/ ctx[80].desc) {
				if (if_block2) {
					if_block2.p(ctx, dirty);
				} else {
					if_block2 = create_if_block_4(ctx);
					if_block2.c();
					if_block2.m(div1, null);
				}
			} else if (if_block2) {
				if_block2.d(1);
				if_block2 = null;
			}

			if (dirty[0] & /*displayItems, selection*/ 2560 && div3_class_value !== (div3_class_value = "ki-js-item dropdown-item ki-select-item " + (!/*item*/ ctx[80].id ? "text-muted" : "") + " " + (/*selection*/ ctx[11][/*item*/ ctx[80].id]
			? "alert-primary"
			: "") + " svelte-11aflex")) {
				attr(div3, "class", div3_class_value);
			}

			if (dirty[0] & /*displayItems*/ 512 && div3_data_id_value !== (div3_data_id_value = /*item*/ ctx[80].id)) {
				attr(div3, "data-id", div3_data_id_value);
			}
		},
		d(detaching) {
			if (detaching) detach(div3);
			if (if_block0) if_block0.d();
			if_block1.d();
			if (if_block2) if_block2.d();
			run_all(dispose);
		}
	};
}

// (1158:50) 
function create_if_block_2(ctx) {
	let div1;
	let div0;
	let t0_value = (/*item*/ ctx[80].display_text || /*item*/ ctx[80].text) + "";
	let t0;
	let t1;
	let dispose;
	let if_block = /*item*/ ctx[80].desc && create_if_block_3(ctx);

	return {
		c() {
			div1 = element("div");
			div0 = element("div");
			t0 = text(t0_value);
			t1 = space();
			if (if_block) if_block.c();
			attr(div0, "class", "ki-no-click svelte-11aflex");
			attr(div1, "tabindex", "-1");
			attr(div1, "class", "dropdown-item text-muted ki-js-blank");
			dispose = listen(div1, "keydown", /*handleItemKeydown*/ ctx[29]);
		},
		m(target, anchor) {
			insert(target, div1, anchor);
			append(div1, div0);
			append(div0, t0);
			append(div1, t1);
			if (if_block) if_block.m(div1, null);
		},
		p(ctx, dirty) {
			if (dirty[0] & /*displayItems*/ 512 && t0_value !== (t0_value = (/*item*/ ctx[80].display_text || /*item*/ ctx[80].text) + "")) set_data(t0, t0_value);

			if (/*item*/ ctx[80].desc) {
				if (if_block) {
					if_block.p(ctx, dirty);
				} else {
					if_block = create_if_block_3(ctx);
					if_block.c();
					if_block.m(div1, null);
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

// (1152:6) {#if item.separator}
function create_if_block_1(ctx) {
	let div;
	let dispose;

	return {
		c() {
			div = element("div");
			attr(div, "tabindex", "-1");
			attr(div, "class", "dropdown-divider ki-js-blank");
			dispose = listen(div, "keydown", /*handleItemKeydown*/ ctx[29]);
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

// (1182:12) {#if multiple}
function create_if_block_6(ctx) {
	let div;
	let if_block = /*item*/ ctx[80].id && create_if_block_7(ctx);

	return {
		c() {
			div = element("div");
			if (if_block) if_block.c();
			attr(div, "class", "d-inline-block align-top");
		},
		m(target, anchor) {
			insert(target, div, anchor);
			if (if_block) if_block.m(div, null);
		},
		p(ctx, dirty) {
			if (/*item*/ ctx[80].id) {
				if (if_block) {
					if_block.p(ctx, dirty);
				} else {
					if_block = create_if_block_7(ctx);
					if_block.c();
					if_block.m(div, null);
				}
			} else if (if_block) {
				if_block.d(1);
				if_block = null;
			}
		},
		d(detaching) {
			if (detaching) detach(div);
			if (if_block) if_block.d();
		}
	};
}

// (1184:16) {#if item.id}
function create_if_block_7(ctx) {
	let i;
	let i_class_value;

	return {
		c() {
			i = element("i");

			attr(i, "class", i_class_value = "far " + (/*selection*/ ctx[11][/*item*/ ctx[80].id]
			? "fa-check-square"
			: "fa-square"));
		},
		m(target, anchor) {
			insert(target, i, anchor);
		},
		p(ctx, dirty) {
			if (dirty[0] & /*selection, displayItems*/ 2560 && i_class_value !== (i_class_value = "far " + (/*selection*/ ctx[11][/*item*/ ctx[80].id]
			? "fa-check-square"
			: "fa-square"))) {
				attr(i, "class", i_class_value);
			}
		},
		d(detaching) {
			if (detaching) detach(i);
		}
	};
}

// (1194:16) {:else}
function create_else_block_1(ctx) {
	let t_value = translate("clear") + "";
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

// (1192:16) {#if item.id}
function create_if_block_5(ctx) {
	let t_value = /*item*/ ctx[80].text + "";
	let t;

	return {
		c() {
			t = text(t_value);
		},
		m(target, anchor) {
			insert(target, t, anchor);
		},
		p(ctx, dirty) {
			if (dirty[0] & /*displayItems*/ 512 && t_value !== (t_value = /*item*/ ctx[80].text + "")) set_data(t, t_value);
		},
		d(detaching) {
			if (detaching) detach(t);
		}
	};
}

// (1199:14) {#if item.desc}
function create_if_block_4(ctx) {
	let div;
	let t_value = /*item*/ ctx[80].desc + "";
	let t;

	return {
		c() {
			div = element("div");
			t = text(t_value);
			attr(div, "class", "ki-no-click text-muted svelte-11aflex");
		},
		m(target, anchor) {
			insert(target, div, anchor);
			append(div, t);
		},
		p(ctx, dirty) {
			if (dirty[0] & /*displayItems*/ 512 && t_value !== (t_value = /*item*/ ctx[80].desc + "")) set_data(t, t_value);
		},
		d(detaching) {
			if (detaching) detach(div);
		}
	};
}

// (1165:10) {#if item.desc}
function create_if_block_3(ctx) {
	let div;
	let t_value = /*item*/ ctx[80].desc + "";
	let t;

	return {
		c() {
			div = element("div");
			t = text(t_value);
			attr(div, "class", "ki-no-click text-muted svelte-11aflex");
		},
		m(target, anchor) {
			insert(target, div, anchor);
			append(div, t);
		},
		p(ctx, dirty) {
			if (dirty[0] & /*displayItems*/ 512 && t_value !== (t_value = /*item*/ ctx[80].desc + "")) set_data(t, t_value);
		},
		d(detaching) {
			if (detaching) detach(div);
		}
	};
}

// (1151:4) {#each displayItems as item (item.id)}
function create_each_block(key_1, ctx) {
	let first;
	let if_block_anchor;

	function select_block_type_3(ctx, dirty) {
		if (/*item*/ ctx[80].separator) return create_if_block_1;
		if (/*item*/ ctx[80].disabled || /*item*/ ctx[80].placeholder) return create_if_block_2;
		return create_else_block;
	}

	let current_block_type = select_block_type_3(ctx);
	let if_block = current_block_type(ctx);

	return {
		key: key_1,
		first: null,
		c() {
			first = empty();
			if_block.c();
			if_block_anchor = empty();
			this.first = first;
		},
		m(target, anchor) {
			insert(target, first, anchor);
			if_block.m(target, anchor);
			insert(target, if_block_anchor, anchor);
		},
		p(ctx, dirty) {
			if (current_block_type === (current_block_type = select_block_type_3(ctx)) && if_block) {
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
			if (detaching) detach(first);
			if_block.d(detaching);
			if (detaching) detach(if_block_anchor);
		}
	};
}

// (1210:4) {#if hasMore}
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
			/*div_binding*/ ctx[77](div);
		},
		p: noop,
		d(detaching) {
			if (detaching) detach(div);
			/*div_binding*/ ctx[77](null);
		}
	};
}

function create_fragment(ctx) {
	let div5;
	let div2;
	let t0;
	let div0;
	let span;
	let each_blocks_2 = [];
	let each0_lookup = new Map();
	let div0_class_value;
	let t1;
	let div1;
	let button;
	let i;
	let i_class_value;
	let t2;
	let div4;
	let t3;
	let each_blocks_1 = [];
	let each1_lookup = new Map();
	let t4;
	let div3;
	let t5;
	let each_blocks = [];
	let each2_lookup = new Map();
	let t6;
	let div4_class_value;
	let div5_class_value;
	let dispose;
	let if_block0 = /*typeahead*/ ctx[1] && create_if_block_17(ctx);
	let each_value_2 = /*selectedItems*/ ctx[12];
	const get_key = ctx => /*item*/ ctx[80].id;

	for (let i = 0; i < each_value_2.length; i += 1) {
		let child_ctx = get_each_context_2(ctx, each_value_2, i);
		let key = get_key(child_ctx);
		each0_lookup.set(key, each_blocks_2[i] = create_each_block_2(key, child_ctx));
	}

	function select_block_type(ctx, dirty) {
		if (/*fetchError*/ ctx[17]) return create_if_block_13;
		if (/*activeFetch*/ ctx[20] && !/*fetchingMore*/ ctx[16]) return create_if_block_14;
		if (/*actualCount*/ ctx[10] === 0) return create_if_block_15;
	}

	let current_block_type = select_block_type(ctx);
	let if_block1 = current_block_type && current_block_type(ctx);
	let each_value_1 = /*selectedItems*/ ctx[12];
	const get_key_1 = ctx => /*item*/ ctx[80].id;

	for (let i = 0; i < each_value_1.length; i += 1) {
		let child_ctx = get_each_context_1(ctx, each_value_1, i);
		let key = get_key_1(child_ctx);
		each1_lookup.set(key, each_blocks_1[i] = create_each_block_1(key, child_ctx));
	}

	let each_value = /*displayItems*/ ctx[9];
	const get_key_2 = ctx => /*item*/ ctx[80].id;

	for (let i = 0; i < each_value.length; i += 1) {
		let child_ctx = get_each_context(ctx, each_value, i);
		let key = get_key_2(child_ctx);
		each2_lookup.set(key, each_blocks[i] = create_each_block(key, child_ctx));
	}

	let if_block2 = /*hasMore*/ ctx[14] && create_if_block(ctx);

	return {
		c() {
			div5 = element("div");
			div2 = element("div");
			if (if_block0) if_block0.c();
			t0 = space();
			div0 = element("div");
			span = element("span");

			for (let i = 0; i < each_blocks_2.length; i += 1) {
				each_blocks_2[i].c();
			}

			t1 = space();
			div1 = element("div");
			button = element("button");
			i = element("i");
			t2 = space();
			div4 = element("div");
			if (if_block1) if_block1.c();
			t3 = space();

			for (let i = 0; i < each_blocks_1.length; i += 1) {
				each_blocks_1[i].c();
			}

			t4 = space();
			div3 = element("div");
			t5 = space();

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			t6 = space();
			if (if_block2) if_block2.c();
			attr(span, "class", "ki-no-click ki-select-selection d-flex svelte-11aflex");
			attr(div0, "class", div0_class_value = "form-control " + (/*inputVisible*/ ctx[18] ? "d-none" : ""));
			attr(div0, "tabindex", "0");
			attr(i, "class", i_class_value = "text-dark " + (/*showFetching*/ ctx[13] ? CARET_FETCHING : CARET_DOWN) + " svelte-11aflex");
			attr(button, "class", "btn btn-outline-secondary");
			attr(button, "type", "button");
			attr(button, "tabindex", "0");
			attr(div1, "class", "input-group-append");
			attr(div2, "class", "input-group");
			attr(div3, "tabindex", "-1");
			attr(div3, "class", "dropdown-divider ki-js-blank");
			attr(div4, "class", div4_class_value = "dropdown-menu ki-select-popup " + (/*popupVisible*/ ctx[19] ? "show" : "") + " svelte-11aflex");
			attr(div5, "class", div5_class_value = "ki-select-container form-control p-0 border-0 " + /*extraClass*/ ctx[0] + " svelte-11aflex");

			dispose = [
				listen(div0, "click", /*handleToggleClick*/ ctx[28]),
				listen(button, "blur", /*handleBlur*/ ctx[22]),
				listen(button, "keydown", /*handleToggleKeydown*/ ctx[27]),
				listen(button, "click", /*handleToggleClick*/ ctx[28]),
				listen(div3, "keydown", /*handleItemKeydown*/ ctx[29]),
				listen(div4, "scroll", /*handlePopupScroll*/ ctx[32])
			];
		},
		m(target, anchor) {
			insert(target, div5, anchor);
			append(div5, div2);
			if (if_block0) if_block0.m(div2, null);
			append(div2, t0);
			append(div2, div0);
			append(div0, span);

			for (let i = 0; i < each_blocks_2.length; i += 1) {
				each_blocks_2[i].m(span, null);
			}

			/*div0_binding*/ ctx[75](div0);
			append(div2, t1);
			append(div2, div1);
			append(div1, button);
			append(button, i);
			/*button_binding*/ ctx[76](button);
			append(div5, t2);
			append(div5, div4);
			if (if_block1) if_block1.m(div4, null);
			append(div4, t3);

			for (let i = 0; i < each_blocks_1.length; i += 1) {
				each_blocks_1[i].m(div4, null);
			}

			append(div4, t4);
			append(div4, div3);
			append(div4, t5);

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(div4, null);
			}

			append(div4, t6);
			if (if_block2) if_block2.m(div4, null);
			/*div4_binding*/ ctx[78](div4);
			/*div5_binding*/ ctx[79](div5);
		},
		p(ctx, dirty) {
			if (/*typeahead*/ ctx[1]) {
				if (if_block0) {
					if_block0.p(ctx, dirty);
				} else {
					if_block0 = create_if_block_17(ctx);
					if_block0.c();
					if_block0.m(div2, t0);
				}
			} else if (if_block0) {
				if_block0.d(1);
				if_block0 = null;
			}

			const each_value_2 = /*selectedItems*/ ctx[12];
			each_blocks_2 = update_keyed_each(each_blocks_2, dirty, get_key, 1, ctx, each_value_2, each0_lookup, span, destroy_block, create_each_block_2, null, get_each_context_2);

			if (dirty[0] & /*inputVisible*/ 262144 && div0_class_value !== (div0_class_value = "form-control " + (/*inputVisible*/ ctx[18] ? "d-none" : ""))) {
				attr(div0, "class", div0_class_value);
			}

			if (dirty[0] & /*showFetching*/ 8192 && i_class_value !== (i_class_value = "text-dark " + (/*showFetching*/ ctx[13] ? CARET_FETCHING : CARET_DOWN) + " svelte-11aflex")) {
				attr(i, "class", i_class_value);
			}

			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block1) {
				if_block1.p(ctx, dirty);
			} else {
				if (if_block1) if_block1.d(1);
				if_block1 = current_block_type && current_block_type(ctx);

				if (if_block1) {
					if_block1.c();
					if_block1.m(div4, t3);
				}
			}

			const each_value_1 = /*selectedItems*/ ctx[12];
			each_blocks_1 = update_keyed_each(each_blocks_1, dirty, get_key_1, 1, ctx, each_value_1, each1_lookup, div4, destroy_block, create_each_block_1, t4, get_each_context_1);
			const each_value = /*displayItems*/ ctx[9];
			each_blocks = update_keyed_each(each_blocks, dirty, get_key_2, 1, ctx, each_value, each2_lookup, div4, destroy_block, create_each_block, t6, get_each_context);

			if (/*hasMore*/ ctx[14]) {
				if (if_block2) {
					if_block2.p(ctx, dirty);
				} else {
					if_block2 = create_if_block(ctx);
					if_block2.c();
					if_block2.m(div4, null);
				}
			} else if (if_block2) {
				if_block2.d(1);
				if_block2 = null;
			}

			if (dirty[0] & /*popupVisible*/ 524288 && div4_class_value !== (div4_class_value = "dropdown-menu ki-select-popup " + (/*popupVisible*/ ctx[19] ? "show" : "") + " svelte-11aflex")) {
				attr(div4, "class", div4_class_value);
			}

			if (dirty[0] & /*extraClass*/ 1 && div5_class_value !== (div5_class_value = "ki-select-container form-control p-0 border-0 " + /*extraClass*/ ctx[0] + " svelte-11aflex")) {
				attr(div5, "class", div5_class_value);
			}
		},
		i: noop,
		o: noop,
		d(detaching) {
			if (detaching) detach(div5);
			if (if_block0) if_block0.d();

			for (let i = 0; i < each_blocks_2.length; i += 1) {
				each_blocks_2[i].d();
			}

			/*div0_binding*/ ctx[75](null);
			/*button_binding*/ ctx[76](null);

			if (if_block1) {
				if_block1.d();
			}

			for (let i = 0; i < each_blocks_1.length; i += 1) {
				each_blocks_1[i].d();
			}

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].d();
			}

			if (if_block2) if_block2.d();
			/*div4_binding*/ ctx[78](null);
			/*div5_binding*/ ctx[79](null);
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

const FETCH_INDICATOR_DELAY = 150;
const CARET_DOWN = "fas fa-caret-down";
const CARET_FETCHING = "far fa-hourglass";

const META_KEYS = {
	Control: true,
	Shift: true,
	AltGraph: true,
	Meta: true,
	ContextMenu: true,
	F1: true,
	F2: true,
	F3: true,
	F4: true,
	F5: true,
	F6: true,
	F7: true,
	F8: true,
	F9: true,
	F10: true,
	F11: true
};

const config = { translations: I18N_DEFAULTS };

function nop() {
	
}



function translate(key) {
	return config.translations[key] || I18N_DEFAULTS[key];
}

function hasModifier(event) {
	return event.altKey || event.ctrlKey || event.metaKey || event.shiftKey;
}

function isValidKey(event) {
	return !META_KEYS[event.key];
}

function sendKeyPress(target, orig) {
	console.log("SEND", orig);

	var down = new KeyboardEvent("keydown",
	{
			key: orig.key,
			ctrlKey: orig.ctrlKey,
			altKey: orig.altKey,
			shiftKey: orig.shiftKey,
			metaKey: orig.metaKey,
			keyCode: orig.keyCode,
			charCode: orig.charCode
		});

	console.log("SEND_DOWN", down);
	target.dispatchEvent(down);

	var up = new KeyboardEvent("keyup",
	{
			key: orig.key,
			ctrlKey: orig.ctrlKey,
			altKey: orig.altKey,
			shiftKey: orig.shiftKey,
			metaKey: orig.metaKey,
			keyCode: orig.keyCode,
			charCode: orig.charCode
		});

	console.log("SEND_UP", up);
	target.dispatchEvent(up);
}

function focusNextItem(item) {
	let next = item.nextElementSibling;

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

	return next;
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
	let selectionDisplay;
	let toggle;
	let popup;
	let more;
	let mounted = false;
	let fixedItems = [];
	let displayItems = [];
	let items = [];
	let offsetCount = 0;
	let actualCount = 0;
	let selection = {};
	let selectedItems = [];
	let showFetching = false;
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
						desc: ds.selectDesc || ""
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
			items = [];
			offsetCount = 0;
			$$invalidate(10, actualCount = 0);
			$$invalidate(14, hasMore = false);
			fetched = false;
		}

		$$invalidate(16, fetchingMore = more);
		$$invalidate(17, fetchError = null);
		$$invalidate(13, showFetching = false);
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
				let fetchedItems = response.items || [];
				let info = response.info || ({});
				let newItems;

				if (currentFetchingMore) {
					newItems = items;

					fetchedItems.forEach(function (item) {
						newItems.push(item);
					});
				} else {
					newItems = fetchedItems;
				}

				items = newItems;
				resolveItems(items);
				let newDisplayItems = [];

				fixedItems.forEach(function (item) {
					newDisplayItems.push(item);
				});

				items.forEach(function (item) {
					newDisplayItems.push(item);
				});

				$$invalidate(9, displayItems = newDisplayItems);
				$$invalidate(14, hasMore = info.more && offsetCount > 0 && !fetchId);
				$$invalidate(15, tooShort = info.too_short === true);

				if (fetchId) {
					previousQuery = null;
				} else {
					previousQuery = currentQuery;
				}

				previousFetch = currentFetch;
				$$invalidate(20, activeFetch = null);
				fetched = true;
				$$invalidate(16, fetchingMore = false);
				$$invalidate(13, showFetching = false);
			}
		}).catch(function (err) {
			if (currentFetch === activeFetch) {
				console.error(err);
				$$invalidate(17, fetchError = err);
				items = [];
				$$invalidate(9, displayItems = fixedItems);
				offsetCount = 0;
				$$invalidate(10, actualCount = 0);
				$$invalidate(14, hasMore = false);
				$$invalidate(15, tooShort = false);
				previousQuery = null;
				previousFetch = currentFetch;
				$$invalidate(20, activeFetch = null);
				fetched = false;
				$$invalidate(16, fetchingMore = false);
				$$invalidate(13, showFetching = false);
				toggle.focus();
				openPopup();
			}
		});

		setTimeout(
			function () {
				if (activeFetch === currentFetch) {
					console.log("fetching...");
					$$invalidate(13, showFetching = true);
				}
			},
			FETCH_INDICATOR_DELAY
		);

		$$invalidate(20, activeFetch = currentFetch);
		previousFetch = null;
		return currentFetch;
	}

	function resolveItems(items) {
		let off = 0;
		let act = 0;

		items.forEach(function (item) {
			if (item.id) {
				item.id = item.id.toString();
			}

			if (item.separator) ; else if (item.placeholder) {
				act += 1;
			} else {
				off += 1;
				act += 1;
			}
		});

		offsetCount = off;
		$$invalidate(10, actualCount = act);
	}

	function cancelFetch() {
		if (activeFetch !== null) {
			$$invalidate(20, activeFetch = null);
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
	let passEvents = null;

	function openInput(focusInput, passEvent) {
		if (!typeahead) {
			return;
		}

		let wasVisible = inputVisible;
		$$invalidate(18, inputVisible = true);

		if (!focusInput) {
			return;
		}

		if (wasVisible) {
			input.focus();
		} else {
			if (passEvent) {
				passEvents = passEvents || [];
				passEvent.preventDefault();
				passEvents.push(passEvent);
			}

			if (!focusingInput) {
				focusingInput = function () {
					if (focusingInput) {
						focusingInput = null;
						input.focus();

						if (passEvents) {
							passEvents.forEach(function (event) {
								setTimeout(function () {
									sendKeyPress(input, event);
								});
							});

							passEvents = null;
						}
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
		$$invalidate(18, inputVisible = false);

		if (focusToggle) {
			toggle.focus();
		}
	}

	function openPopup() {
		if (!popupVisible) {
			$$invalidate(19, popupVisible = true);
			let w = container.offsetWidth;
			$$invalidate(7, popup.style.minWidth = w + "px", popup);
		}
	}

	function closePopup(focusToggle) {
		$$invalidate(19, popupVisible = false);

		if (focusToggle) {
			toggle.focus();
		}
	}

	function selectItemImpl(id) {
		id = id.toString();

		let item = displayItems.find(function (item) {
			return item.id.toString() === id;
		});

		if (!item) {
			item = selectedItems.find(function (item) {
				return item.id.toString() === id;
			});
		}

		if (!item) {
			console.error("MISSING item=" + id);
			return;
		}

		if (multiple) {
			if (item.id) {
				delete selection[""];

				if (selection[item.id]) {
					delete selection[item.id];
					$$invalidate(11, selection);
				} else {
					$$invalidate(11, selection[item.id] = item, selection);
				}
			} else {
				Object.keys(selection).forEach(function (id) {
					delete selection[id];
				});

				$$invalidate(11, selection[item.id] = item, selection);
			}
		} else {
			if (!selection[item.id]) {
				Object.keys(selection).forEach(function (id) {
					delete selection[id];
				});
			}

			$$invalidate(11, selection[item.id] = item, selection);
			clearQuery();
			closePopup(true);
			closeInput(false);
		}

		let newSelectedItems = [];

		Object.values(selection).forEach(function (item) {
			newSelectedItems.push(item);
		});

		$$invalidate(12, selectedItems = newSelectedItems);
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

		if (el.dataset.selection) {
			if (!focusNextItem(el)) {
				focusPreviousItem();
			}
		}
	}

	function containsElement(el) {
		return el === input || el === toggle || el === selectionDisplay || popup.contains(el);
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
				item.desc = ds.selectDesc;
			}

			newSelection[item.id] = item;
		}

		$$invalidate(11, selection = newSelection);
		let newSelectedItems = [];

		Object.values(selection).forEach(function (item) {
			newSelectedItems.push(item);
		});

		$$invalidate(12, selectedItems = newSelectedItems);
	}

	function syncToReal(selection) {
		let changed = false;

		if (remote) {
			selectedItems.forEach(function (item) {
				let el = real.querySelector("option[value=\"" + item.id.trim() + "\"]");

				if (!el) {
					let el = document.createElement("option");
					el.setAttribute("value", item.id);

					if (item.desc) {
						el.setAttribute("data-select-desc", item.desc);
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

	function setupRemote() {
		let fixedOptions = real.querySelectorAll("option[data-select-fixed]");
		let collectedItems = [];

		fixedOptions.forEach(function (el) {
			let ds = el.dataset;
			let item = { id: el.value, text: el.text };

			if (ds.desc) {
				item.desc = ds.selectDesc;
			}

			collectedItems.push(item);
		});

		fixedItems = collectedItems;
	}

	onMount(function () {
		real.classList.add("d-none");
		$$invalidate(21, multiple = real.multiple);

		if (remote) {
			setupRemote();
		} else {
			$$invalidate(33, fetcher = inlineFetcher);
		}

		syncFromReal();

		real.addEventListener("change", function () {
			if (!isSyncToReal) {
				syncFromReal();
				console.log("FROM_REAL", selection);
			}
		});

		$$invalidate(39, mounted = true);
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
			if (isValidKey(event)) {
				openInput(true, event);
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

	function focusPreviousItem(item) {
		let next = event.target.previousElementSibling;

		if (next) {
			while (next && next.classList.contains("ki-js-blank")) {
				next = next.previousElementSibling;
			}

			if (next && !next.classList.contains("ki-js-item")) {
				next = null;
			}
		}

		if (!next) {
			next = toggle;
		}

		if (next) {
			next.focus();
		}

		return next;
	}

	let itemKeydownHandlers = {
		base(event) {
			if (isValidKey(event)) {
				openInput(true, event);
			}
		},
		ArrowDown(event) {
			focusNextItem(event.target);
			event.preventDefault();
		},
		ArrowUp(event) {
			focusPreviousItem(event.target);
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

	function div0_binding($$value) {
		binding_callbacks[$$value ? "unshift" : "push"](() => {
			$$invalidate(5, selectionDisplay = $$value);
		});
	}

	function button_binding($$value) {
		binding_callbacks[$$value ? "unshift" : "push"](() => {
			$$invalidate(6, toggle = $$value);
		});
	}

	function div_binding($$value) {
		binding_callbacks[$$value ? "unshift" : "push"](() => {
			$$invalidate(8, more = $$value);
		});
	}

	function div4_binding($$value) {
		binding_callbacks[$$value ? "unshift" : "push"](() => {
			$$invalidate(7, popup = $$value);
		});
	}

	function div5_binding($$value) {
		binding_callbacks[$$value ? "unshift" : "push"](() => {
			$$invalidate(3, container = $$value);
		});
	}

	$$self.$set = $$props => {
		if ("real" in $$props) $$invalidate(34, real = $$props.real);
		if ("fetcher" in $$props) $$invalidate(33, fetcher = $$props.fetcher);
		if ("remote" in $$props) $$invalidate(35, remote = $$props.remote);
		if ("queryMinLen" in $$props) $$invalidate(36, queryMinLen = $$props.queryMinLen);
		if ("delay" in $$props) $$invalidate(37, delay = $$props.delay);
		if ("extraClass" in $$props) $$invalidate(0, extraClass = $$props.extraClass);
		if ("typeahead" in $$props) $$invalidate(1, typeahead = $$props.typeahead);
	};

	$$self.$$.update = () => {
		if ($$self.$$.dirty[0] & /*selection*/ 2048 | $$self.$$.dirty[1] & /*mounted*/ 256) {
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
		selectionDisplay,
		toggle,
		popup,
		more,
		displayItems,
		actualCount,
		selection,
		selectedItems,
		showFetching,
		hasMore,
		tooShort,
		fetchingMore,
		fetchError,
		inputVisible,
		popupVisible,
		activeFetch,
		multiple,
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
		fixedItems,
		items,
		offsetCount,
		fetched,
		previousFetch,
		previousQuery,
		wasDown,
		isSyncToReal,
		focusingInput,
		passEvents,
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
		setupRemote,
		inputKeypressHandlers,
		inputKeydownHandlers,
		inputKeyupHandlers,
		toggleKeydownHandlers,
		focusPreviousItem,
		itemKeydownHandlers,
		itemKeyupHandlers,
		input_1_input_handler,
		input_1_binding,
		div0_binding,
		button_binding,
		div_binding,
		div4_binding,
		div5_binding
	];
}

class Select extends SvelteComponent {
	constructor(options) {
		super();
		if (!document_1.getElementById("svelte-11aflex-style")) add_css();

		init(
			this,
			options,
			instance,
			create_fragment,
			safe_not_equal,
			{
				real: 34,
				fetcher: 33,
				remote: 35,
				queryMinLen: 36,
				delay: 37,
				extraClass: 0,
				typeahead: 1,
				selectItem: 38
			},
			[-1, -1, -1]
		);
	}

	get selectItem() {
		return this.$$.ctx[38];
	}
}

export default Select;
export { config };
