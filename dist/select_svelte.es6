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
class HtmlTag {
    constructor(html, anchor = null) {
        this.e = element('div');
        this.a = anchor;
        this.u(html);
    }
    m(target, anchor = null) {
        for (let i = 0; i < this.n.length; i += 1) {
            insert(target, this.n[i], anchor);
        }
        this.t = target;
    }
    u(html) {
        this.e.innerHTML = html;
        this.n = Array.from(this.e.childNodes);
    }
    p(html) {
        this.d();
        this.u(html);
        this.m(this.t, this.a);
    }
    d() {
        this.n.forEach(detach);
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
function beforeUpdate(fn) {
    get_current_component().$$.before_update.push(fn);
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
        const dirty = $$.dirty;
        $$.dirty = [-1];
        $$.fragment && $$.fragment.p($$.ctx, dirty);
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

/* src/select.svelte generated by Svelte v3.16.7 */

const { document: document_1 } = globals;

function add_css() {
	var style = element("style");
	style.id = "svelte-4wtex5-style";
	style.textContent = ".ss-container{position:relative}.ss-selection{width:100%;height:100%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.ss-selected-item{white-space:nowrap}.ss-popup{padding-top:0;max-height:50vh;max-width:90vw;overflow-y:auto}.ss-item{padding-left:0.5rem;padding-right:0.5rem}.ss-input-item{width:100%;position:sticky;top:0;background-color:white;padding-top:0.2rem;padding-bottom:0.2rem;padding-left:0.2rem;padding-right:0.2rem}.ss-no-click{pointer-events:none}";
	append(document_1.head, style);
}

function get_each_context(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[82] = list[i];
	return child_ctx;
}

function get_each_context_1(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[82] = list[i];
	child_ctx[86] = i;
	return child_ctx;
}

function get_each_context_2(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[82] = list[i];
	child_ctx[86] = i;
	return child_ctx;
}

// (1111:6) {#each selectionItems as item, index (item.id)}
function create_each_block_2(key_1, ctx) {
	let first;
	let html_tag;
	let raw_value = (/*index*/ ctx[86] > 0 ? ",&nbsp;" : "") + "";
	let t0;
	let span;
	let t1_value = /*item*/ ctx[82].text + "";
	let t1;
	let span_class_value;

	return {
		key: key_1,
		first: null,
		c() {
			first = empty();
			t0 = space();
			span = element("span");
			t1 = text(t1_value);
			html_tag = new HtmlTag(raw_value, t0);
			attr(span, "class", span_class_value = "ss-no-click ss-selected-item " + /*item*/ ctx[82].itemClass);
			this.first = first;
		},
		m(target, anchor) {
			insert(target, first, anchor);
			html_tag.m(target, anchor);
			insert(target, t0, anchor);
			insert(target, span, anchor);
			append(span, t1);
		},
		p(ctx, dirty) {
			if (dirty[0] & /*selectionItems*/ 4096 && raw_value !== (raw_value = (/*index*/ ctx[86] > 0 ? ",&nbsp;" : "") + "")) html_tag.p(raw_value);
			if (dirty[0] & /*selectionItems*/ 4096 && t1_value !== (t1_value = /*item*/ ctx[82].text + "")) set_data(t1, t1_value);

			if (dirty[0] & /*selectionItems*/ 4096 && span_class_value !== (span_class_value = "ss-no-click ss-selected-item " + /*item*/ ctx[82].itemClass)) {
				attr(span, "class", span_class_value);
			}
		},
		d(detaching) {
			if (detaching) detach(first);
			if (detaching) html_tag.d();
			if (detaching) detach(t0);
			if (detaching) detach(span);
		}
	};
}

// (1124:4) {#if fetchError}
function create_if_block_17(ctx) {
	let div;
	let t;

	return {
		c() {
			div = element("div");
			t = text(/*fetchError*/ ctx[16]);
			attr(div, "tabindex", "-1");
			attr(div, "class", "dropdown-item text-danger ss-item");
		},
		m(target, anchor) {
			insert(target, div, anchor);
			append(div, t);
		},
		p(ctx, dirty) {
			if (dirty[0] & /*fetchError*/ 65536) set_data(t, /*fetchError*/ ctx[16]);
		},
		d(detaching) {
			if (detaching) detach(div);
		}
	};
}

// (1130:4) {#if typeahead}
function create_if_block_10(ctx) {
	let div;
	let input;
	let input_class_value;
	let t0;
	let each_blocks = [];
	let each_1_lookup = new Map();
	let t1;
	let if_block_anchor;
	let dispose;
	let each_value_1 = /*selectionDropdownItems*/ ctx[13];
	const get_key = ctx => /*item*/ ctx[82].id;

	for (let i = 0; i < each_value_1.length; i += 1) {
		let child_ctx = get_each_context_1(ctx, each_value_1, i);
		let key = get_key(child_ctx);
		each_1_lookup.set(key, each_blocks[i] = create_each_block_1(key, child_ctx));
	}

	let if_block = (/*selectionDropdownItems*/ ctx[13].length > 1 || /*selectionDropdownItems*/ ctx[13].length == 1 && /*selectionDropdownItems*/ ctx[13][0].id) && create_if_block_11(ctx);

	return {
		c() {
			div = element("div");
			input = element("input");
			t0 = space();

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			t1 = space();
			if (if_block) if_block.c();
			if_block_anchor = empty();
			attr(input, "class", input_class_value = "ss-input form-control " + /*setupStyles*/ ctx[19].typeahead_class);
			attr(input, "tabindex", "1");
			attr(input, "autocomplete", "new-password");
			attr(input, "autocorrect", "off");
			attr(input, "autocapitalize", "off");
			attr(input, "spellcheck", "off");
			attr(div, "class", "ss-input-item");
			attr(div, "tabindex", "-1");

			dispose = [
				listen(input, "input", /*input_input_handler*/ ctx[78]),
				listen(input, "blur", /*handleInputBlur*/ ctx[21]),
				listen(input, "keypress", /*handleInputKeypress*/ ctx[22]),
				listen(input, "keydown", /*handleInputKeydown*/ ctx[23]),
				listen(input, "keyup", /*handleInputKeyup*/ ctx[24])
			];
		},
		m(target, anchor) {
			insert(target, div, anchor);
			append(div, input);
			/*input_binding*/ ctx[77](input);
			set_input_value(input, /*query*/ ctx[6]);
			insert(target, t0, anchor);

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(target, anchor);
			}

			insert(target, t1, anchor);
			if (if_block) if_block.m(target, anchor);
			insert(target, if_block_anchor, anchor);
		},
		p(ctx, dirty) {
			if (dirty[0] & /*query*/ 64 && input.value !== /*query*/ ctx[6]) {
				set_input_value(input, /*query*/ ctx[6]);
			}

			const each_value_1 = /*selectionDropdownItems*/ ctx[13];
			each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value_1, each_1_lookup, t1.parentNode, destroy_block, create_each_block_1, t1, get_each_context_1);

			if (/*selectionDropdownItems*/ ctx[13].length > 1 || /*selectionDropdownItems*/ ctx[13].length == 1 && /*selectionDropdownItems*/ ctx[13][0].id) {
				if (if_block) {
					if_block.p(ctx, dirty);
				} else {
					if_block = create_if_block_11(ctx);
					if_block.c();
					if_block.m(if_block_anchor.parentNode, if_block_anchor);
				}
			} else if (if_block) {
				if_block.d(1);
				if_block = null;
			}
		},
		d(detaching) {
			if (detaching) detach(div);
			/*input_binding*/ ctx[77](null);
			if (detaching) detach(t0);

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].d(detaching);
			}

			if (detaching) detach(t1);
			if (if_block) if_block.d(detaching);
			if (detaching) detach(if_block_anchor);
			run_all(dispose);
		}
	};
}

// (1148:8) {#if item.id}
function create_if_block_12(ctx) {
	let div3;
	let div2;
	let t0;
	let div1;
	let div0;
	let div0_class_value;
	let t1;
	let div3_data_id_value;
	let dispose;
	let if_block0 = /*multiple*/ ctx[18] && create_if_block_15(ctx);

	function select_block_type(ctx, dirty) {
		if (/*item*/ ctx[82].id) return create_if_block_14;
		return create_else_block_3;
	}

	let current_block_type = select_block_type(ctx);
	let if_block1 = current_block_type(ctx);
	let if_block2 = /*item*/ ctx[82].desc && create_if_block_13(ctx);

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
			attr(div0, "class", div0_class_value = "ss-no-click " + /*item*/ ctx[82].itemClass);
			attr(div1, "class", "d-inline-block");
			attr(div2, "class", "ss-no-click");
			attr(div3, "tabindex", "1");
			attr(div3, "class", "ki-js-item dropdown-item ss-item");
			attr(div3, "data-id", div3_data_id_value = /*item*/ ctx[82].id);
			attr(div3, "data-selected", "true");

			dispose = [
				listen(div3, "blur", /*handleBlur*/ ctx[20]),
				listen(div3, "click", /*handleItemClick*/ ctx[30]),
				listen(div3, "keydown", /*handleItemKeydown*/ ctx[28]),
				listen(div3, "keyup", /*handleItemKeyup*/ ctx[29])
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
			if (/*multiple*/ ctx[18]) {
				if (if_block0) {
					if_block0.p(ctx, dirty);
				} else {
					if_block0 = create_if_block_15(ctx);
					if_block0.c();
					if_block0.m(div2, t0);
				}
			} else if (if_block0) {
				if_block0.d(1);
				if_block0 = null;
			}

			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block1) {
				if_block1.p(ctx, dirty);
			} else {
				if_block1.d(1);
				if_block1 = current_block_type(ctx);

				if (if_block1) {
					if_block1.c();
					if_block1.m(div0, null);
				}
			}

			if (dirty[0] & /*selectionDropdownItems*/ 8192 && div0_class_value !== (div0_class_value = "ss-no-click " + /*item*/ ctx[82].itemClass)) {
				attr(div0, "class", div0_class_value);
			}

			if (/*item*/ ctx[82].desc) {
				if (if_block2) {
					if_block2.p(ctx, dirty);
				} else {
					if_block2 = create_if_block_13(ctx);
					if_block2.c();
					if_block2.m(div1, null);
				}
			} else if (if_block2) {
				if_block2.d(1);
				if_block2 = null;
			}

			if (dirty[0] & /*selectionDropdownItems*/ 8192 && div3_data_id_value !== (div3_data_id_value = /*item*/ ctx[82].id)) {
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

// (1159:14) {#if multiple}
function create_if_block_15(ctx) {
	let div;
	let if_block = /*item*/ ctx[82].id && create_if_block_16(ctx);

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
			if (/*item*/ ctx[82].id) {
				if (if_block) {
					if_block.p(ctx, dirty);
				} else {
					if_block = create_if_block_16(ctx);
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

// (1161:18) {#if item.id}
function create_if_block_16(ctx) {
	let i;
	let i_class_value;

	return {
		c() {
			i = element("i");

			attr(i, "class", i_class_value = "far " + (/*selectionById*/ ctx[11][/*item*/ ctx[82].id]
			? "fa-check-square"
			: "fa-square"));
		},
		m(target, anchor) {
			insert(target, i, anchor);
		},
		p(ctx, dirty) {
			if (dirty[0] & /*selectionById, selectionDropdownItems*/ 10240 && i_class_value !== (i_class_value = "far " + (/*selectionById*/ ctx[11][/*item*/ ctx[82].id]
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

// (1171:18) {:else}
function create_else_block_3(ctx) {
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

// (1169:18) {#if item.id}
function create_if_block_14(ctx) {
	let t_value = /*item*/ ctx[82].text + "";
	let t;

	return {
		c() {
			t = text(t_value);
		},
		m(target, anchor) {
			insert(target, t, anchor);
		},
		p(ctx, dirty) {
			if (dirty[0] & /*selectionDropdownItems*/ 8192 && t_value !== (t_value = /*item*/ ctx[82].text + "")) set_data(t, t_value);
		},
		d(detaching) {
			if (detaching) detach(t);
		}
	};
}

// (1176:16) {#if item.desc}
function create_if_block_13(ctx) {
	let div;
	let t_value = /*item*/ ctx[82].desc + "";
	let t;
	let div_class_value;

	return {
		c() {
			div = element("div");
			t = text(t_value);
			attr(div, "class", div_class_value = "ss-no-click " + /*setupStyles*/ ctx[19].item_desc_class);
		},
		m(target, anchor) {
			insert(target, div, anchor);
			append(div, t);
		},
		p(ctx, dirty) {
			if (dirty[0] & /*selectionDropdownItems*/ 8192 && t_value !== (t_value = /*item*/ ctx[82].desc + "")) set_data(t, t_value);
		},
		d(detaching) {
			if (detaching) detach(div);
		}
	};
}

// (1147:6) {#each selectionDropdownItems as item, index (item.id)}
function create_each_block_1(key_1, ctx) {
	let first;
	let if_block_anchor;
	let if_block = /*item*/ ctx[82].id && create_if_block_12(ctx);

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
			if (/*item*/ ctx[82].id) {
				if (if_block) {
					if_block.p(ctx, dirty);
				} else {
					if_block = create_if_block_12(ctx);
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

// (1187:6) {#if selectionDropdownItems.length > 1 || (selectionDropdownItems.length == 1 && selectionDropdownItems[0].id)}
function create_if_block_11(ctx) {
	let div;
	let dispose;

	return {
		c() {
			div = element("div");
			attr(div, "tabindex", "-1");
			attr(div, "class", "dropdown-divider ki-js-blank");
			dispose = listen(div, "keydown", /*handleItemKeydown*/ ctx[28]);
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

// (1216:6) {:else}
function create_else_block_1(ctx) {
	let div3;
	let div2;
	let t0;
	let div1;
	let div0;
	let div0_class_value;
	let t1;
	let div3_class_value;
	let div3_data_id_value;
	let div3_data_action_value;
	let dispose;
	let if_block0 = /*multiple*/ ctx[18] && create_if_block_8(ctx);

	function select_block_type_2(ctx, dirty) {
		if (/*item*/ ctx[82].id) return create_if_block_7;
		return create_else_block_2;
	}

	let current_block_type = select_block_type_2(ctx);
	let if_block1 = current_block_type(ctx);
	let if_block2 = /*item*/ ctx[82].desc && create_if_block_6(ctx);

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
			attr(div0, "class", div0_class_value = "ss-no-click " + /*item*/ ctx[82].itemClass);
			attr(div1, "class", "d-inline-block");
			attr(div2, "class", "ss-no-click");
			attr(div3, "tabindex", "1");

			attr(div3, "class", div3_class_value = "ki-js-item dropdown-item ss-item " + (/*item*/ ctx[82].itemClass || "") + " " + (/*selectionById*/ ctx[11][/*item*/ ctx[82].id]
			? /*setupStyles*/ ctx[19].missing_item_class
			: ""));

			attr(div3, "data-id", div3_data_id_value = /*item*/ ctx[82].id);
			attr(div3, "data-action", div3_data_action_value = /*item*/ ctx[82].action || "");

			dispose = [
				listen(div3, "blur", /*handleBlur*/ ctx[20]),
				listen(div3, "click", /*handleItemClick*/ ctx[30]),
				listen(div3, "keydown", /*handleItemKeydown*/ ctx[28]),
				listen(div3, "keyup", /*handleItemKeyup*/ ctx[29])
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
			if (/*multiple*/ ctx[18]) {
				if (if_block0) {
					if_block0.p(ctx, dirty);
				} else {
					if_block0 = create_if_block_8(ctx);
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

			if (dirty[0] & /*displayItems*/ 128 && div0_class_value !== (div0_class_value = "ss-no-click " + /*item*/ ctx[82].itemClass)) {
				attr(div0, "class", div0_class_value);
			}

			if (/*item*/ ctx[82].desc) {
				if (if_block2) {
					if_block2.p(ctx, dirty);
				} else {
					if_block2 = create_if_block_6(ctx);
					if_block2.c();
					if_block2.m(div1, null);
				}
			} else if (if_block2) {
				if_block2.d(1);
				if_block2 = null;
			}

			if (dirty[0] & /*displayItems, selectionById*/ 2176 && div3_class_value !== (div3_class_value = "ki-js-item dropdown-item ss-item " + (/*item*/ ctx[82].itemClass || "") + " " + (/*selectionById*/ ctx[11][/*item*/ ctx[82].id]
			? /*setupStyles*/ ctx[19].missing_item_class
			: ""))) {
				attr(div3, "class", div3_class_value);
			}

			if (dirty[0] & /*displayItems*/ 128 && div3_data_id_value !== (div3_data_id_value = /*item*/ ctx[82].id)) {
				attr(div3, "data-id", div3_data_id_value);
			}

			if (dirty[0] & /*displayItems*/ 128 && div3_data_action_value !== (div3_data_action_value = /*item*/ ctx[82].action || "")) {
				attr(div3, "data-action", div3_data_action_value);
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

// (1202:50) 
function create_if_block_4(ctx) {
	let div1;
	let div0;
	let t0_value = (/*item*/ ctx[82].display_text || /*item*/ ctx[82].text) + "";
	let t0;
	let div0_class_value;
	let t1;
	let dispose;
	let if_block = /*item*/ ctx[82].desc && create_if_block_5(ctx);

	return {
		c() {
			div1 = element("div");
			div0 = element("div");
			t0 = text(t0_value);
			t1 = space();
			if (if_block) if_block.c();
			attr(div0, "class", div0_class_value = "ss-no-click " + /*item*/ ctx[82].itemClass);
			attr(div1, "tabindex", "-1");
			attr(div1, "class", "dropdown-item text-muted ki-js-blank");
			dispose = listen(div1, "keydown", /*handleItemKeydown*/ ctx[28]);
		},
		m(target, anchor) {
			insert(target, div1, anchor);
			append(div1, div0);
			append(div0, t0);
			append(div1, t1);
			if (if_block) if_block.m(div1, null);
		},
		p(ctx, dirty) {
			if (dirty[0] & /*displayItems*/ 128 && t0_value !== (t0_value = (/*item*/ ctx[82].display_text || /*item*/ ctx[82].text) + "")) set_data(t0, t0_value);

			if (dirty[0] & /*displayItems*/ 128 && div0_class_value !== (div0_class_value = "ss-no-click " + /*item*/ ctx[82].itemClass)) {
				attr(div0, "class", div0_class_value);
			}

			if (/*item*/ ctx[82].desc) {
				if (if_block) {
					if_block.p(ctx, dirty);
				} else {
					if_block = create_if_block_5(ctx);
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

// (1196:6) {#if item.separator}
function create_if_block_3(ctx) {
	let div;
	let dispose;

	return {
		c() {
			div = element("div");
			attr(div, "tabindex", "-1");
			attr(div, "class", "dropdown-divider ki-js-blank");
			dispose = listen(div, "keydown", /*handleItemKeydown*/ ctx[28]);
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

// (1227:12) {#if multiple}
function create_if_block_8(ctx) {
	let div;
	let if_block = /*item*/ ctx[82].id && create_if_block_9(ctx);

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
			if (/*item*/ ctx[82].id) {
				if (if_block) {
					if_block.p(ctx, dirty);
				} else {
					if_block = create_if_block_9(ctx);
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

// (1229:16) {#if item.id}
function create_if_block_9(ctx) {
	let i;
	let i_class_value;

	return {
		c() {
			i = element("i");

			attr(i, "class", i_class_value = "far " + (/*selectionById*/ ctx[11][/*item*/ ctx[82].id]
			? "fa-check-square"
			: "fa-square"));
		},
		m(target, anchor) {
			insert(target, i, anchor);
		},
		p(ctx, dirty) {
			if (dirty[0] & /*selectionById, displayItems*/ 2176 && i_class_value !== (i_class_value = "far " + (/*selectionById*/ ctx[11][/*item*/ ctx[82].id]
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

// (1239:16) {:else}
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

// (1237:16) {#if item.id}
function create_if_block_7(ctx) {
	let t_value = /*item*/ ctx[82].text + "";
	let t;

	return {
		c() {
			t = text(t_value);
		},
		m(target, anchor) {
			insert(target, t, anchor);
		},
		p(ctx, dirty) {
			if (dirty[0] & /*displayItems*/ 128 && t_value !== (t_value = /*item*/ ctx[82].text + "")) set_data(t, t_value);
		},
		d(detaching) {
			if (detaching) detach(t);
		}
	};
}

// (1244:14) {#if item.desc}
function create_if_block_6(ctx) {
	let div;
	let t_value = /*item*/ ctx[82].desc + "";
	let t;
	let div_class_value;

	return {
		c() {
			div = element("div");
			t = text(t_value);
			attr(div, "class", div_class_value = "ss-no-click " + /*setupStyles*/ ctx[19].item_desc_class);
		},
		m(target, anchor) {
			insert(target, div, anchor);
			append(div, t);
		},
		p(ctx, dirty) {
			if (dirty[0] & /*displayItems*/ 128 && t_value !== (t_value = /*item*/ ctx[82].desc + "")) set_data(t, t_value);
		},
		d(detaching) {
			if (detaching) detach(div);
		}
	};
}

// (1209:10) {#if item.desc}
function create_if_block_5(ctx) {
	let div;
	let t_value = /*item*/ ctx[82].desc + "";
	let t;
	let div_class_value;

	return {
		c() {
			div = element("div");
			t = text(t_value);
			attr(div, "class", div_class_value = "ss-no-click " + /*setupStyles*/ ctx[19].item_desc_class);
		},
		m(target, anchor) {
			insert(target, div, anchor);
			append(div, t);
		},
		p(ctx, dirty) {
			if (dirty[0] & /*displayItems*/ 128 && t_value !== (t_value = /*item*/ ctx[82].desc + "")) set_data(t, t_value);
		},
		d(detaching) {
			if (detaching) detach(div);
		}
	};
}

// (1195:4) {#each displayItems as item (item.id)}
function create_each_block(key_1, ctx) {
	let first;
	let if_block_anchor;

	function select_block_type_1(ctx, dirty) {
		if (/*item*/ ctx[82].separator) return create_if_block_3;
		if (/*item*/ ctx[82].disabled || /*item*/ ctx[82].placeholder) return create_if_block_4;
		return create_else_block_1;
	}

	let current_block_type = select_block_type_1(ctx);
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
			if (current_block_type === (current_block_type = select_block_type_1(ctx)) && if_block) {
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

// (1255:4) {#if hasMore}
function create_if_block_2(ctx) {
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
			/*div_binding*/ ctx[79](div);
		},
		p: noop,
		d(detaching) {
			if (detaching) detach(div);
			/*div_binding*/ ctx[79](null);
		}
	};
}

// (1262:4) {#if actualCount === 0}
function create_if_block(ctx) {
	let div;

	function select_block_type_3(ctx, dirty) {
		if (/*tooShort*/ ctx[9]) return create_if_block_1;
		return create_else_block;
	}

	let current_block_type = select_block_type_3(ctx);
	let if_block = current_block_type(ctx);

	return {
		c() {
			div = element("div");
			if_block.c();
			attr(div, "tabindex", "-1");
			attr(div, "class", "dropdown-item text-muted ss-item");
		},
		m(target, anchor) {
			insert(target, div, anchor);
			if_block.m(div, null);
		},
		p(ctx, dirty) {
			if (current_block_type === (current_block_type = select_block_type_3(ctx)) && if_block) {
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

// (1266:8) {:else}
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

// (1264:8) {#if tooShort }
function create_if_block_1(ctx) {
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

function create_fragment(ctx) {
	let div1;
	let button;
	let span0;
	let each_blocks_1 = [];
	let each0_lookup = new Map();
	let t0;
	let span1;
	let i;
	let i_class_value;
	let button_class_value;
	let t1;
	let div0;
	let t2;
	let t3;
	let each_blocks = [];
	let each1_lookup = new Map();
	let t4;
	let t5;
	let div0_class_value;
	let div1_class_value;
	let dispose;
	let each_value_2 = /*selectionItems*/ ctx[12];
	const get_key = ctx => /*item*/ ctx[82].id;

	for (let i = 0; i < each_value_2.length; i += 1) {
		let child_ctx = get_each_context_2(ctx, each_value_2, i);
		let key = get_key(child_ctx);
		each0_lookup.set(key, each_blocks_1[i] = create_each_block_2(key, child_ctx));
	}

	let if_block0 = /*fetchError*/ ctx[16] && create_if_block_17(ctx);
	let if_block1 = /*typeahead*/ ctx[0] && create_if_block_10(ctx);
	let each_value = /*displayItems*/ ctx[7];
	const get_key_1 = ctx => /*item*/ ctx[82].id;

	for (let i = 0; i < each_value.length; i += 1) {
		let child_ctx = get_each_context(ctx, each_value, i);
		let key = get_key_1(child_ctx);
		each1_lookup.set(key, each_blocks[i] = create_each_block(key, child_ctx));
	}

	let if_block2 = /*hasMore*/ ctx[10] && create_if_block_2(ctx);
	let if_block3 = /*actualCount*/ ctx[8] === 0 && create_if_block(ctx);

	return {
		c() {
			div1 = element("div");
			button = element("button");
			span0 = element("span");

			for (let i = 0; i < each_blocks_1.length; i += 1) {
				each_blocks_1[i].c();
			}

			t0 = space();
			span1 = element("span");
			i = element("i");
			t1 = space();
			div0 = element("div");
			if (if_block0) if_block0.c();
			t2 = space();
			if (if_block1) if_block1.c();
			t3 = space();

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			t4 = space();
			if (if_block2) if_block2.c();
			t5 = space();
			if (if_block3) if_block3.c();
			attr(span0, "class", "ss-no-click ss-selection text-dark d-flex");
			attr(i, "class", i_class_value = "text-dark " + (/*showFetching*/ ctx[15] ? CARET_FETCHING : CARET_DOWN));
			attr(span1, "class", "ml-auto");
			attr(button, "class", button_class_value = "form-control " + /*setupStyles*/ ctx[19].control_class + " d-flex");
			attr(button, "type", "button");
			attr(button, "tabindex", "0");
			attr(button, "title", /*selectionTitle*/ ctx[14]);
			attr(div0, "class", div0_class_value = "dropdown-menu ss-popup " + (/*popupVisible*/ ctx[17] ? "show" : ""));
			attr(div1, "class", div1_class_value = "ss-container form-control p-0 border-0 " + /*setupStyles*/ ctx[19].container_class);

			dispose = [
				listen(button, "blur", /*handleBlur*/ ctx[20]),
				listen(button, "keydown", /*handleToggleKeydown*/ ctx[25]),
				listen(button, "keyup", /*handleToggleKeyup*/ ctx[26]),
				listen(button, "click", /*handleToggleClick*/ ctx[27]),
				listen(div0, "scroll", /*handlePopupScroll*/ ctx[31])
			];
		},
		m(target, anchor) {
			insert(target, div1, anchor);
			append(div1, button);
			append(button, span0);

			for (let i = 0; i < each_blocks_1.length; i += 1) {
				each_blocks_1[i].m(span0, null);
			}

			append(button, t0);
			append(button, span1);
			append(span1, i);
			/*button_binding*/ ctx[76](button);
			append(div1, t1);
			append(div1, div0);
			if (if_block0) if_block0.m(div0, null);
			append(div0, t2);
			if (if_block1) if_block1.m(div0, null);
			append(div0, t3);

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(div0, null);
			}

			append(div0, t4);
			if (if_block2) if_block2.m(div0, null);
			append(div0, t5);
			if (if_block3) if_block3.m(div0, null);
			/*div0_binding*/ ctx[80](div0);
			/*div1_binding*/ ctx[81](div1);
		},
		p(ctx, dirty) {
			const each_value_2 = /*selectionItems*/ ctx[12];
			each_blocks_1 = update_keyed_each(each_blocks_1, dirty, get_key, 1, ctx, each_value_2, each0_lookup, span0, destroy_block, create_each_block_2, null, get_each_context_2);

			if (dirty[0] & /*showFetching*/ 32768 && i_class_value !== (i_class_value = "text-dark " + (/*showFetching*/ ctx[15] ? CARET_FETCHING : CARET_DOWN))) {
				attr(i, "class", i_class_value);
			}

			if (dirty[0] & /*selectionTitle*/ 16384) {
				attr(button, "title", /*selectionTitle*/ ctx[14]);
			}

			if (/*fetchError*/ ctx[16]) {
				if (if_block0) {
					if_block0.p(ctx, dirty);
				} else {
					if_block0 = create_if_block_17(ctx);
					if_block0.c();
					if_block0.m(div0, t2);
				}
			} else if (if_block0) {
				if_block0.d(1);
				if_block0 = null;
			}

			if (/*typeahead*/ ctx[0]) {
				if (if_block1) {
					if_block1.p(ctx, dirty);
				} else {
					if_block1 = create_if_block_10(ctx);
					if_block1.c();
					if_block1.m(div0, t3);
				}
			} else if (if_block1) {
				if_block1.d(1);
				if_block1 = null;
			}

			const each_value = /*displayItems*/ ctx[7];
			each_blocks = update_keyed_each(each_blocks, dirty, get_key_1, 1, ctx, each_value, each1_lookup, div0, destroy_block, create_each_block, t4, get_each_context);

			if (/*hasMore*/ ctx[10]) {
				if (if_block2) {
					if_block2.p(ctx, dirty);
				} else {
					if_block2 = create_if_block_2(ctx);
					if_block2.c();
					if_block2.m(div0, t5);
				}
			} else if (if_block2) {
				if_block2.d(1);
				if_block2 = null;
			}

			if (/*actualCount*/ ctx[8] === 0) {
				if (if_block3) {
					if_block3.p(ctx, dirty);
				} else {
					if_block3 = create_if_block(ctx);
					if_block3.c();
					if_block3.m(div0, null);
				}
			} else if (if_block3) {
				if_block3.d(1);
				if_block3 = null;
			}

			if (dirty[0] & /*popupVisible*/ 131072 && div0_class_value !== (div0_class_value = "dropdown-menu ss-popup " + (/*popupVisible*/ ctx[17] ? "show" : ""))) {
				attr(div0, "class", div0_class_value);
			}
		},
		i: noop,
		o: noop,
		d(detaching) {
			if (detaching) detach(div1);

			for (let i = 0; i < each_blocks_1.length; i += 1) {
				each_blocks_1[i].d();
			}

			/*button_binding*/ ctx[76](null);
			if (if_block0) if_block0.d();
			if (if_block1) if_block1.d();

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].d();
			}

			if (if_block2) if_block2.d();
			if (if_block3) if_block3.d();
			/*div0_binding*/ ctx[80](null);
			/*div1_binding*/ ctx[81](null);
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

const STYLE_DEFAULTS = {
	container_class: "",
	item_class: "",
	item_desc_class: "text-muted",
	blank_item_class: "text-muted",
	missing_item_class: "alert-primary",
	typeahead_class: "",
	control_class: ""
};

const FETCH_INDICATOR_DELAY = 150;
const CARET_DOWN = "fas fa-caret-down";
const CARET_FETCHING = "far fa-hourglass";
const BLANK_ITEM = { id: "", text: "" };

const config = { translations: I18N_DEFAULTS };

function nop() {
	
}



function translate(key) {
	return config.translations[key] || I18N_DEFAULTS[key];
}

function hasModifier(event) {
	return event.altKey || event.ctrlKey || event.metaKey || event.shiftKey;
}

function createOptionFromItem(item) {
	let el = document.createElement("option");
	el.setAttribute("value", item.id);

	if (item.desc) {
		el.setAttribute("data-item-desc", item.desc);
	}

	if (item.itemClass) {
		el.setAttribute("data-item-class", item.itemClass);
	}

	if (item.action) {
		el.setAttribute("data-item-action", item.action);
	}

	el.textContent = item.text;
	return el;
}

function createResult(data) {
	let items;
	let byId = {};

	if (data.fixedItems && data.fetchedItems) {
		items = [];

		if (data.fixedItems) {
			data.fixedItems.forEach(function (item) {
				items.push(item);
			});
		}

		if (data.fetchedItems) {
			if (items.length > 0) {
				items.push({ separator: true });
			}

			let wasClear = false;

			data.fetchedItems.forEach(function (item) {
				if (wasClear) {
					items.push({ separator: true });
				}

				items.push(item);
				wasClear = !item.id;
			});
		}
	} else {
		items = data.fetchedItems || data.fixedItems || [];
	}

	items.forEach(function (item) {
		byId[item.id] = item;
	});

	let counts = calculateCounts(data.fetchedItems || []);
	let more = data.more === true && counts.offsetCount > 0 && !data.fetchedId;
	let tooShort = data.tooShort === true;

	return {
		blankItem: byId[""] || null,
		byId,
		displayItems: items,
		fetchedItems: data.fetchedItems,
		offsetCount: counts.offsetCount,
		actualCount: counts.actualCount,
		more,
		tooShort
	};
}

function calculateCounts(items) {
	let act = 0;
	let off = 0;

	items.forEach(function (item) {
		if (item.id) {
			item.id = item.id.toString();
		}

		if (item.separator) ; else if (!item.id) ; else if (item.placeholder) {
			act += 1;
		} else {
			off += 1;
			act += 1;
		}
	});

	return { offsetCount: off, actualCount: act };
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
	let { typeahead = false } = $$props;
	let { styles = {} } = $$props;
	let containerEl;
	let inputEl;
	let toggleEl;
	let popupEl;
	let moreEl;
	let setup = false;
	let setupStyles = {};
	let mounted = false;
	let query = "";
	let fixedItems = [];
	let result = createResult({});
	let displayItems = [];
	let actualCount = 0;
	let tooShort = false;
	let hasMore = false;
	let selectionById = {};
	let selectionItems = [];
	let selectionDropdownItems = [];
	let selectionTitle = "";
	let showFetching = false;
	let fetchingMore = false;
	let fetchError = null;
	let popupVisible = false;
	let activeFetch = null;
	let fetched = false;
	let previousFetch = null;
	let previousQuery = null;
	let multiple = false;
	let wasDown = false;
	let isSyncToReal = false;

	function inlineFetcher(offset, query) {

		let promise = new Promise(function (resolve, reject) {
				let items = [];
				let pattern = query.toUpperCase().trim();
				let options = real.options;

				for (let i = 0; i < options.length; i++) {
					let item = createItemFromOption(options[i]);
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

	function createItemFromOption(el) {
		let ds = el.dataset;
		let item = { id: el.value || "", text: el.text || "" };

		if (ds) {
			if (ds.itemDesc) {
				item.desc = ds.itemDesc;
			}

			if (ds.itemAction) {
				item.action = ds.itemAction;
			}

			if (ds.itemClass) {
				item.itemClass = ds.itemClass;
			} else {
				item.itemClass = setupStyles[item.id === "" ? "blank_item_class" : "item_class"];
			}
		}

		return item;
	}

	function fetchItems(fetchMore, fetchId) {
		let currentQuery;

		if (fetchId) {
			currentQuery = "";
		} else {
			currentQuery = query.trim();

			if (currentQuery.length > 0) {
				currentQuery = query;
			}
		}

		if (!fetchMore && !fetchingMore && currentQuery === previousQuery && !fetchId) {
			return activeFetch || previousFetch;
		}

		cancelFetch();
		let currentFetchOffset = 0;

		if (fetchMore) {
			currentFetchOffset = result.offsetCount;
		} else {
			$$invalidate(9, tooShort = false);
			$$invalidate(10, hasMore = false);
			fetched = false;
		}

		fetchingMore = fetchMore;
		$$invalidate(16, fetchError = null);
		$$invalidate(15, showFetching = false);
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
				let responseItems = response.items || [];
				let info = response.info || ({});
				let fetchedItems = responseItems;

				if (currentFetchingMore) {
					fetchedItems = result.fetchedItems;

					responseItems.forEach(function (item) {
						fetchedItems.push(item);
					});
				}

				result = createResult({
					fetchedItems,
					fixedItems,
					fetchedId: fetchId,
					more: info.more,
					tooShort: info.too_short === true
				});

				$$invalidate(7, displayItems = result.displayItems);
				$$invalidate(8, actualCount = result.actualCount);
				$$invalidate(9, tooShort = result.tooShort);
				$$invalidate(10, hasMore = result.more);

				if (fetchId) {
					previousQuery = null;
				} else {
					previousQuery = currentQuery;
				}

				previousFetch = currentFetch;
				activeFetch = null;
				fetched = true;
				fetchingMore = false;
				$$invalidate(15, showFetching = false);

				setTimeout(function () {
					fetchMoreIfneeded();
				});
			}
		}).catch(function (err) {
			if (currentFetch === activeFetch) {
				console.error(err);
				$$invalidate(16, fetchError = err);
				let result = createResult({ fixedItems });
				$$invalidate(7, displayItems = result.displayItems);
				$$invalidate(8, actualCount = result.actualCount);
				$$invalidate(9, tooShort = result.tooShort);
				$$invalidate(10, hasMore = result.more);
				previousQuery = null;
				previousFetch = currentFetch;
				activeFetch = null;
				fetched = false;
				fetchingMore = false;
				$$invalidate(15, showFetching = false);
				toggleEl.focus();
				openPopup();
			}
		});

		setTimeout(
			function () {
				if (activeFetch === currentFetch) {
					$$invalidate(15, showFetching = true);
				}
			},
			FETCH_INDICATOR_DELAY
		);

		activeFetch = currentFetch;
		previousFetch = null;
		return currentFetch;
	}

	function cancelFetch() {
		if (activeFetch !== null) {
			activeFetch = null;
			fetched = false;
			previousQuery = null;
		}
	}

	function fetchMoreIfneeded() {
		if (hasMore && !fetchingMore && popupVisible) {
			if (popupEl.scrollTop + popupEl.clientHeight >= popupEl.scrollHeight - moreEl.clientHeight * 2 - 2) {
				fetchItems(true);
			}
		}
	}

	function clearQuery() {
		$$invalidate(6, query = "");
		previousQuery = null;
	}

	function openPopup() {
		if (!popupVisible) {
			$$invalidate(17, popupVisible = true);
			let w = containerEl.offsetWidth;
			$$invalidate(4, popupEl.style.minWidth = w + "px", popupEl);
		}
	}

	function closePopup(focusToggle) {
		$$invalidate(13, selectionDropdownItems = selectionItems);
		$$invalidate(17, popupVisible = false);

		if (focusToggle) {
			toggleEl.focus();
		}
	}

	function selectItemImpl(id) {
		id = id.toString();
		let item = result.byId[id] || selectionById[id];

		if (!item) {
			console.error("MISSING item=" + id);
			return;
		}

		let blankItem = result.blankItem;
		let byId = selectionById;

		if (multiple) {
			if (item.id) {
				if (byId[item.id]) {
					delete byId[item.id];

					if (!blankItem) {
						blankItem = BLANK_ITEM;
					}
				} else {
					delete byId[blankItem.id];
					byId[item.id] = item;
				}
			} else {
				byId = { [item.id]: item };
			}
		} else {
			byId = { [item.id]: item };
		}

		let items = Object.values(byId);

		if (items.length == 0 && blankItem) {
			byId = { [blankItem.id]: blankItem };
			items = [blankItem];
		}

		$$invalidate(11, selectionById = byId);

		$$invalidate(12, selectionItems = items.sort(function (a, b) {
			return a.text.localeCompare(b.text);
		}));

		$$invalidate(14, selectionTitle = items.map(function (item) {
			return item.text;
		}).join(", "));

		if (!multiple) {
			closePopup(containsElement(document.activeElement));
		}

		syncToReal();
		real.dispatchEvent(new CustomEvent("select-select", { detail: selectionItems }));
	}

	function executeAction(id) {
		let item = result.byId[id];

		if (!item) {
			console.error("MISSING action item=" + id);
			return;
		}

		closePopup(containsElement(document.activeElement));
		real.dispatchEvent(new CustomEvent("select-action", { detail: item }));
	}

	function selectItem(id) {
		return fetchItems(false, id).then(function (response) {
			selectItemImpl(id);
		});
	}

	function selectElement(el) {
		if (el.dataset.action) {
			executeAction(el.dataset.id);
		} else {
			selectItemImpl(el.dataset.id);

			if (el.dataset.selected) {
				$$invalidate(13, selectionDropdownItems);
			}
		}
	}

	function containsElement(el) {
		return containerEl.contains(el) || popupEl.contains(el);
	}

	function syncFromReal() {
		if (isSyncToReal) {
			return;
		}

		let oldById = selectionById;
		let byId = {};
		let options = real.selectedOptions;

		for (let i = options.length - 1; i >= 0; i--) {
			let el = options[i];
			let item = oldById[el.value || ""];

			if (!item) {
				item = createItemFromOption(el);
			}

			byId[item.id] = item;
		}

		$$invalidate(11, selectionById = byId);

		$$invalidate(12, selectionItems = Object.values(byId).sort(function (a, b) {
			return a.text.localeCompare(b.text);
		}));

		$$invalidate(14, selectionTitle = items.map(function (item) {
			return item.text;
		}).join(", "));
	}

	function syncToReal() {
		let changed = false;

		if (remote) {
			selectionItems.forEach(function (item) {
				let el = real.querySelector("option[value=\"" + item.id + "\"]");

				if (!el) {
					el = createOptionFromItem(item);
					real.appendChild(el);
				}
			});
		}

		let options = real.options;

		for (let i = options.length - 1; i >= 0; i--) {
			let el = options[i];
			let curr = !!selectionById[el.value];

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
			collectedItems.push(createItemFromOption(el));
		});

		fixedItems = collectedItems;
	}

	function setupComponent() {
		real.classList.add("d-none");
		$$invalidate(18, multiple = real.multiple);

		if (remote) {
			setupRemote();
		} else {
			$$invalidate(32, fetcher = inlineFetcher);
		}

		jQuery(toggleEl).tooltip();
		Object.assign(setupStyles, STYLE_DEFAULTS);
		Object.assign(setupStyles, styles);
	}

	beforeUpdate(function () {
		if (!setup) {
			setupComponent();
			setup = true;
		}
	});

	onMount(function () {
		syncFromReal();

		real.addEventListener("change", function () {
			if (!isSyncToReal) {
				syncFromReal();
			}
		});

		$$invalidate(40, mounted = true);
	});

	let toggleKeydownHandlers = {
		base(event) {
			if (typeahead && popupVisible) {
				inputEl.focus();
			}
		},
		ArrowDown(event) {
			openPopup();
			fetchItems();

			if (typeahead) {
				inputEl.focus();
			} else {
				let next = popupEl.querySelectorAll(".ki-js-item")[0];

				while (next && next.classList.contains("ki-js-blank")) {
					next = next.nextElementSibling;
				}

				focusItem(next);
			}

			event.preventDefault();
		},
		ArrowUp: nop,
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
		},
		Tab: nop
	};

	let toggleKeyupHandlers = { base: nop, Tab: nop };

	let inputKeypressHandlers = {
		base(event) {
			
		}
	};

	let inputKeydownHandlers = {
		base(event) {
			wasDown = true;
		},
		ArrowDown(event) {
			let next = popupEl.querySelectorAll(".ki-js-item")[0];

			while (next && next.classList.contains("ki-js-blank")) {
				next = next.nextElementSibling;
			}

			focusItem(next);
			event.preventDefault();
		},
		ArrowUp(event) {
			event.preventDefault();
		},
		Escape(event) {
			cancelFetch();
			clearQuery();
			closePopup(true);
		},
		Tab(event) {
			toggleEl.focus();
			event.preventDefault();
		}
	};

	let inputKeyupHandlers = {
		base(event) {
			if (wasDown) {
				fetchItems();
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

	function focusItem(item) {
		if (item) {
			if (typeahead && popupEl.children[1] === item) {
				popupEl.scroll(0, 0);
			}

			item.focus();
		}
	}

	function focusPreviousItem(el) {
		let next = el.previousElementSibling;

		if (next) {
			while (next && next.classList.contains("ki-js-blank")) {
				next = next.previousElementSibling;
			}

			if (next && !next.classList.contains("ki-js-item")) {
				next = null;
			}
		}

		if (!next) {
			next = typeahead ? inputEl : toggleEl;
		}

		focusItem(next);
		return next;
	}

	function focusNextItem(el) {
		let next = el.nextElementSibling;

		if (next) {
			while (next && next.classList.contains("ki-js-blank")) {
				next = next.nextElementSibling;
			}

			if (next && !next.classList.contains("ki-js-item")) {
				next = null;
			}
		}

		focusItem(next);
		return next;
	}

	let itemKeydownHandlers = {
		base(event) {
			if (typeahead) {
				inputEl.focus();
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
			if (!hasModifier(event)) {
				selectElement(event.target);
				event.preventDefault();
			}
		},
		Space(event) {
			if (hasModifier(event)) {
				return;
			}

			if (typeahead) {
				inputEl.focus();
			} else {
				selectElement(event.target);
				event.preventDefault();
			}
		},
		Escape(event) {
			cancelFetch();
			clearQuery();
			closePopup(true);
		},
		PageUp: nop,
		PageDown: nop,
		Home: nop,
		End: nop,
		Tab(event) {
			toggleEl.focus();
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
			let rect = popupEl.getBoundingClientRect();
			let next = document.elementFromPoint(scrollLeft + rect.x + 10, scrollTop + rect.top + 1);

			if (!next) {
				next = popupEl.querySelector(".ki-js-item:first-child");
			} else {
				if (!next.classList.contains("ki-js-item")) {
					next = popupEl.querySelector(".ki-js-item:first-child");
				}
			}

			focusItem(next);
			event.preventDefault();
		},
		PageDown(event) {
			let scrollLeft = document.body.scrollLeft;
			let scrollTop = document.body.scrollTop;
			let h = popupEl.offsetHeight;
			let rect = popupEl.getBoundingClientRect();
			let next = document.elementFromPoint(scrollLeft + rect.x + 10, scrollTop + rect.top + h - 10);

			if (!next) {
				next = popupEl.querySelector(".ki-js-item:last-child");
			} else {
				if (!next.classList.contains("ki-js-item")) {
					next = popupEl.querySelector(".ki-js-item:last-child");
				}
			}

			focusItem(next);
			event.preventDefault();
		},
		Home(event) {
			let next = popupEl.querySelector(".ki-js-item:first-child");
			focusItem(next);
			event.preventDefault();
		},
		End(event) {
			let next = popupEl.querySelector(".ki-js-item:last-child");
			focusItem(next);
			event.preventDefault();
		}
	};

	function handleBlur(event) {
		if (event.sourceCapabilities && !containsElement(event.relatedTarget)) {
			cancelFetch();
			clearQuery();
			closePopup(false);
		}
	}

	function handleInputBlur(event) {
		handleBlur(event);
	}

	function handleInputKeypress(event) {
		handleEvent(event.code, inputKeypressHandlers, event);
	}

	function handleInputKeydown(event) {
		handleEvent(event.code, inputKeydownHandlers, event);
	}

	function handleInputKeyup(event) {
		handleEvent(event.code, inputKeyupHandlers, event);
	}

	function handleToggleKeydown(event) {
		handleEvent(event.code, toggleKeydownHandlers, event);
	}

	function handleToggleKeyup(event) {
		handleEvent(event.code, toggleKeyupHandlers, event);
	}

	function handleToggleClick(event) {
		if (event.button === 0 && !hasModifier(event)) {
			if (popupVisible) {
				closePopup(false);
			} else {
				openPopup();
				fetchItems(false);
			}
		}
	}

	function handleItemKeydown(event) {
		handleEvent(event.code, itemKeydownHandlers, event);
	}

	function handleItemKeyup(event) {
		handleEvent(event.code, itemKeyupHandlers, event);
	}

	function handleItemClick(event) {
		if (event.button === 0 && !hasModifier(event)) {
			selectElement(event.target);
		}
	}

	function handlePopupScroll(event) {
		fetchMoreIfneeded();
	}

	function button_binding($$value) {
		binding_callbacks[$$value ? "unshift" : "push"](() => {
			$$invalidate(3, toggleEl = $$value);
		});
	}

	function input_binding($$value) {
		binding_callbacks[$$value ? "unshift" : "push"](() => {
			$$invalidate(2, inputEl = $$value);
		});
	}

	function input_input_handler() {
		query = this.value;
		$$invalidate(6, query);
	}

	function div_binding($$value) {
		binding_callbacks[$$value ? "unshift" : "push"](() => {
			$$invalidate(5, moreEl = $$value);
		});
	}

	function div0_binding($$value) {
		binding_callbacks[$$value ? "unshift" : "push"](() => {
			$$invalidate(4, popupEl = $$value);
		});
	}

	function div1_binding($$value) {
		binding_callbacks[$$value ? "unshift" : "push"](() => {
			$$invalidate(1, containerEl = $$value);
		});
	}

	$$self.$set = $$props => {
		if ("real" in $$props) $$invalidate(33, real = $$props.real);
		if ("fetcher" in $$props) $$invalidate(32, fetcher = $$props.fetcher);
		if ("remote" in $$props) $$invalidate(34, remote = $$props.remote);
		if ("queryMinLen" in $$props) $$invalidate(35, queryMinLen = $$props.queryMinLen);
		if ("delay" in $$props) $$invalidate(36, delay = $$props.delay);
		if ("typeahead" in $$props) $$invalidate(0, typeahead = $$props.typeahead);
		if ("styles" in $$props) $$invalidate(37, styles = $$props.styles);
	};

	$$self.$$.update = () => {
		if ($$self.$$.dirty[1] & /*mounted*/ 512) {
			 {
				if (mounted) {
					syncToReal();
				}
			}
		}
	};

	return [
		typeahead,
		containerEl,
		inputEl,
		toggleEl,
		popupEl,
		moreEl,
		query,
		displayItems,
		actualCount,
		tooShort,
		hasMore,
		selectionById,
		selectionItems,
		selectionDropdownItems,
		selectionTitle,
		showFetching,
		fetchError,
		popupVisible,
		multiple,
		setupStyles,
		handleBlur,
		handleInputBlur,
		handleInputKeypress,
		handleInputKeydown,
		handleInputKeyup,
		handleToggleKeydown,
		handleToggleKeyup,
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
		styles,
		selectItem,
		setup,
		mounted,
		fixedItems,
		result,
		fetchingMore,
		activeFetch,
		fetched,
		previousFetch,
		previousQuery,
		wasDown,
		isSyncToReal,
		inlineFetcher,
		createItemFromOption,
		fetchItems,
		cancelFetch,
		fetchMoreIfneeded,
		clearQuery,
		openPopup,
		closePopup,
		selectItemImpl,
		executeAction,
		selectElement,
		containsElement,
		syncFromReal,
		syncToReal,
		setupRemote,
		setupComponent,
		toggleKeydownHandlers,
		toggleKeyupHandlers,
		inputKeypressHandlers,
		inputKeydownHandlers,
		inputKeyupHandlers,
		focusItem,
		focusPreviousItem,
		focusNextItem,
		itemKeydownHandlers,
		itemKeyupHandlers,
		button_binding,
		input_binding,
		input_input_handler,
		div_binding,
		div0_binding,
		div1_binding
	];
}

class Select extends SvelteComponent {
	constructor(options) {
		super();
		if (!document_1.getElementById("svelte-4wtex5-style")) add_css();

		init(
			this,
			options,
			instance,
			create_fragment,
			safe_not_equal,
			{
				real: 33,
				fetcher: 32,
				remote: 34,
				queryMinLen: 35,
				delay: 36,
				typeahead: 0,
				styles: 37,
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
