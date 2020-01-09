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
function toggle_class(element, name, toggle) {
    element.classList[toggle ? 'add' : 'remove'](name);
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

/* src/select.svelte generated by Svelte v3.16.5 */

const { document: document_1 } = globals;

function add_css() {
	var style = element("style");
	style.id = "svelte-7gew9f-style";
	style.textContent = ".ss-container{position:relative}.ss-selection{width:100%;height:100%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.ss-selected-item{white-space:nowrap}.ss-popup{padding-top:0;padding-bottom:0;max-height:40vh;max-width:90vw;overflow-y:auto}.ss-popup-top{top:unset;bottom:100%}.ss-item{padding-left:0.5rem;padding-right:0.5rem}.ss-message-item{padding-left:0.5rem;padding-right:0.5rem}.ss-sticky-item{width:100%;position:sticky;bottom:0;background-color:white}.ss-input-item{width:100%;position:sticky;top:0;background-color:white;padding-top:0.2rem;padding-bottom:0.2rem;padding-left:0.2rem;padding-right:0.2rem}.ss-no-click{pointer-events:none}";
	append(document_1.head, style);
}

function get_each_context(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[83] = list[i];
	return child_ctx;
}

function get_each_context_1(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[83] = list[i];
	child_ctx[87] = i;
	return child_ctx;
}

// (1259:6) {#each selectionItems as item, index (item.id)}
function create_each_block_1(key_1, ctx) {
	let first;
	let html_tag;
	let raw_value = (/*index*/ ctx[87] > 0 ? ",&nbsp;" : "") + "";
	let t0;
	let span;
	let t1_value = /*item*/ ctx[83].text + "";
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
			attr(span, "class", span_class_value = "ss-no-click ss-selected-item " + /*item*/ ctx[83].item_class);
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
			if (dirty[0] & /*selectionItems*/ 2048 && raw_value !== (raw_value = (/*index*/ ctx[87] > 0 ? ",&nbsp;" : "") + "")) html_tag.p(raw_value);
			if (dirty[0] & /*selectionItems*/ 2048 && t1_value !== (t1_value = /*item*/ ctx[83].text + "")) set_data(t1, t1_value);

			if (dirty[0] & /*selectionItems*/ 2048 && span_class_value !== (span_class_value = "ss-no-click ss-selected-item " + /*item*/ ctx[83].item_class)) {
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

// (1274:4) {#if typeahead}
function create_if_block_10(ctx) {
	let div;
	let input;
	let input_class_value;
	let dispose;

	return {
		c() {
			div = element("div");
			input = element("input");
			attr(input, "class", input_class_value = "ss-input form-control " + /*styles*/ ctx[20].typeahead_class);
			attr(input, "tabindex", "1");
			attr(input, "autocomplete", "new-password");
			attr(input, "autocorrect", "off");
			attr(input, "autocapitalize", "off");
			attr(input, "spellcheck", "off");
			attr(div, "class", "ss-input-item");
			attr(div, "tabindex", "-1");

			dispose = [
				listen(input, "input", /*input_input_handler*/ ctx[79]),
				listen(input, "blur", /*handleInputBlur*/ ctx[23]),
				listen(input, "keypress", /*handleInputKeypress*/ ctx[24]),
				listen(input, "keydown", /*handleInputKeydown*/ ctx[25]),
				listen(input, "keyup", /*handleInputKeyup*/ ctx[26])
			];
		},
		m(target, anchor) {
			insert(target, div, anchor);
			append(div, input);
			set_input_value(input, /*query*/ ctx[7]);
			/*input_binding*/ ctx[80](input);
		},
		p(ctx, dirty) {
			if (dirty[0] & /*query*/ 128 && input.value !== /*query*/ ctx[7]) {
				set_input_value(input, /*query*/ ctx[7]);
			}
		},
		d(detaching) {
			if (detaching) detach(div);
			/*input_binding*/ ctx[80](null);
			run_all(dispose);
		}
	};
}

// (1313:6) {:else}
function create_else_block(ctx) {
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
	let if_block0 = /*multiple*/ ctx[19] && create_if_block_8(ctx);

	function select_block_type_1(ctx, dirty) {
		if (/*item*/ ctx[83].blank) return create_if_block_7;
		return create_else_block_1;
	}

	let current_block_type = select_block_type_1(ctx);
	let if_block1 = current_block_type(ctx);
	let if_block2 = /*item*/ ctx[83].desc && create_if_block_6(ctx);

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
			attr(div0, "class", div0_class_value = "ss-no-click " + /*item*/ ctx[83].item_class);
			attr(div1, "class", "d-inline-block");
			attr(div2, "class", "ss-no-click");
			attr(div3, "tabindex", "1");

			attr(div3, "class", div3_class_value = "ss-js-item dropdown-item ss-item " + /*item*/ ctx[83].item_class + " " + (!/*item*/ ctx[83].blank && /*selectionById*/ ctx[10][/*item*/ ctx[83].id]
			? /*styles*/ ctx[20].selected_item_class
			: ""));

			attr(div3, "data-id", div3_data_id_value = /*item*/ ctx[83].id);
			attr(div3, "data-action", div3_data_action_value = /*item*/ ctx[83].action || "");

			dispose = [
				listen(div3, "blur", /*handleBlur*/ ctx[22]),
				listen(div3, "click", /*handleItemClick*/ ctx[32]),
				listen(div3, "keydown", /*handleItemKeydown*/ ctx[30]),
				listen(div3, "keyup", /*handleItemKeyup*/ ctx[31])
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
			if (/*multiple*/ ctx[19]) {
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

			if (current_block_type === (current_block_type = select_block_type_1(ctx)) && if_block1) {
				if_block1.p(ctx, dirty);
			} else {
				if_block1.d(1);
				if_block1 = current_block_type(ctx);

				if (if_block1) {
					if_block1.c();
					if_block1.m(div0, null);
				}
			}

			if (dirty[0] & /*displayItems*/ 512 && div0_class_value !== (div0_class_value = "ss-no-click " + /*item*/ ctx[83].item_class)) {
				attr(div0, "class", div0_class_value);
			}

			if (/*item*/ ctx[83].desc) {
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

			if (dirty[0] & /*displayItems, selectionById*/ 1536 && div3_class_value !== (div3_class_value = "ss-js-item dropdown-item ss-item " + /*item*/ ctx[83].item_class + " " + (!/*item*/ ctx[83].blank && /*selectionById*/ ctx[10][/*item*/ ctx[83].id]
			? /*styles*/ ctx[20].selected_item_class
			: ""))) {
				attr(div3, "class", div3_class_value);
			}

			if (dirty[0] & /*displayItems*/ 512 && div3_data_id_value !== (div3_data_id_value = /*item*/ ctx[83].id)) {
				attr(div3, "data-id", div3_data_id_value);
			}

			if (dirty[0] & /*displayItems*/ 512 && div3_data_action_value !== (div3_data_action_value = /*item*/ ctx[83].action || "")) {
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

// (1299:50) 
function create_if_block_4(ctx) {
	let div1;
	let div0;
	let t0_value = (/*item*/ ctx[83].display_text || /*item*/ ctx[83].text) + "";
	let t0;
	let div0_class_value;
	let t1;
	let dispose;
	let if_block = /*item*/ ctx[83].desc && create_if_block_5(ctx);

	return {
		c() {
			div1 = element("div");
			div0 = element("div");
			t0 = text(t0_value);
			t1 = space();
			if (if_block) if_block.c();
			attr(div0, "class", div0_class_value = "ss-no-click " + /*item*/ ctx[83].item_class);
			attr(div1, "tabindex", "-1");
			attr(div1, "class", "dropdown-item text-muted ss-js-blank");
			dispose = listen(div1, "keydown", /*handleItemKeydown*/ ctx[30]);
		},
		m(target, anchor) {
			insert(target, div1, anchor);
			append(div1, div0);
			append(div0, t0);
			append(div1, t1);
			if (if_block) if_block.m(div1, null);
		},
		p(ctx, dirty) {
			if (dirty[0] & /*displayItems*/ 512 && t0_value !== (t0_value = (/*item*/ ctx[83].display_text || /*item*/ ctx[83].text) + "")) set_data(t0, t0_value);

			if (dirty[0] & /*displayItems*/ 512 && div0_class_value !== (div0_class_value = "ss-no-click " + /*item*/ ctx[83].item_class)) {
				attr(div0, "class", div0_class_value);
			}

			if (/*item*/ ctx[83].desc) {
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

// (1293:6) {#if item.separator}
function create_if_block_3(ctx) {
	let div;
	let dispose;

	return {
		c() {
			div = element("div");
			attr(div, "tabindex", "-1");
			attr(div, "class", "dropdown-divider ss-js-blank");
			dispose = listen(div, "keydown", /*handleItemKeydown*/ ctx[30]);
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

// (1324:12) {#if multiple}
function create_if_block_8(ctx) {
	let div;
	let if_block = !/*item*/ ctx[83].blank && create_if_block_9(ctx);

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
			if (!/*item*/ ctx[83].blank) {
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

// (1326:16) {#if !item.blank}
function create_if_block_9(ctx) {
	let i;
	let i_class_value;

	return {
		c() {
			i = element("i");

			attr(i, "class", i_class_value = "pr-1 " + (/*selectionById*/ ctx[10][/*item*/ ctx[83].id]
			? FA_SELECTED
			: FA_NOT_SELECTED));
		},
		m(target, anchor) {
			insert(target, i, anchor);
		},
		p(ctx, dirty) {
			if (dirty[0] & /*selectionById, displayItems*/ 1536 && i_class_value !== (i_class_value = "pr-1 " + (/*selectionById*/ ctx[10][/*item*/ ctx[83].id]
			? FA_SELECTED
			: FA_NOT_SELECTED))) {
				attr(i, "class", i_class_value);
			}
		},
		d(detaching) {
			if (detaching) detach(i);
		}
	};
}

// (1336:16) {:else}
function create_else_block_1(ctx) {
	let t_value = /*item*/ ctx[83].text + "";
	let t;

	return {
		c() {
			t = text(t_value);
		},
		m(target, anchor) {
			insert(target, t, anchor);
		},
		p(ctx, dirty) {
			if (dirty[0] & /*displayItems*/ 512 && t_value !== (t_value = /*item*/ ctx[83].text + "")) set_data(t, t_value);
		},
		d(detaching) {
			if (detaching) detach(t);
		}
	};
}

// (1334:16) {#if item.blank}
function create_if_block_7(ctx) {
	let t_value = /*translate*/ ctx[21]("clear") + "";
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

// (1341:14) {#if item.desc}
function create_if_block_6(ctx) {
	let div;
	let t_value = /*item*/ ctx[83].desc + "";
	let t;
	let div_class_value;

	return {
		c() {
			div = element("div");
			t = text(t_value);
			attr(div, "class", div_class_value = "ss-no-click " + /*styles*/ ctx[20].item_desc_class);
		},
		m(target, anchor) {
			insert(target, div, anchor);
			append(div, t);
		},
		p(ctx, dirty) {
			if (dirty[0] & /*displayItems*/ 512 && t_value !== (t_value = /*item*/ ctx[83].desc + "")) set_data(t, t_value);
		},
		d(detaching) {
			if (detaching) detach(div);
		}
	};
}

// (1306:10) {#if item.desc}
function create_if_block_5(ctx) {
	let div;
	let t_value = /*item*/ ctx[83].desc + "";
	let t;
	let div_class_value;

	return {
		c() {
			div = element("div");
			t = text(t_value);
			attr(div, "class", div_class_value = "ss-no-click " + /*styles*/ ctx[20].item_desc_class);
		},
		m(target, anchor) {
			insert(target, div, anchor);
			append(div, t);
		},
		p(ctx, dirty) {
			if (dirty[0] & /*displayItems*/ 512 && t_value !== (t_value = /*item*/ ctx[83].desc + "")) set_data(t, t_value);
		},
		d(detaching) {
			if (detaching) detach(div);
		}
	};
}

// (1292:4) {#each displayItems as item (item.id)}
function create_each_block(key_1, ctx) {
	let first;
	let if_block_anchor;

	function select_block_type(ctx, dirty) {
		if (/*item*/ ctx[83].separator) return create_if_block_3;
		if (/*item*/ ctx[83].disabled || /*item*/ ctx[83].placeholder) return create_if_block_4;
		return create_else_block;
	}

	let current_block_type = select_block_type(ctx);
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
			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
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

// (1352:4) {#if typeahead && actualCount === 0 && previousFetch && !activeFetch}
function create_if_block_2(ctx) {
	let div;

	return {
		c() {
			div = element("div");
			div.textContent = `${/*translate*/ ctx[21]("no_results")}`;
			attr(div, "tabindex", "-1");
			attr(div, "class", "dropdown-item ss-message-item text-muted ss-no-click ss-js-blank");
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

// (1358:4) {#if fetchError}
function create_if_block_1(ctx) {
	let div;
	let t;

	return {
		c() {
			div = element("div");
			t = text(/*fetchError*/ ctx[14]);
			attr(div, "tabindex", "-1");
			attr(div, "class", "dropdown-item ss-message-item border-top text-danger ss-no-click ss-js-blank ss-sticky-item");
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

// (1364:4) {#if selectionItems.length >= maxItems}
function create_if_block(ctx) {
	let div;

	return {
		c() {
			div = element("div");
			div.textContent = `${/*translate*/ ctx[21]("max_limit")}`;
			attr(div, "tabindex", "-1");
			attr(div, "class", "dropdown-item ss-message-item border-top text-danger ss-no-click ss-js-blank ss-sticky-item");
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
	let button_name_value;
	let t1;
	let div0;
	let t2;
	let each_blocks = [];
	let each1_lookup = new Map();
	let t3;
	let t4;
	let t5;
	let div1_class_value;
	let div1_name_value;
	let dispose;
	let each_value_1 = /*selectionItems*/ ctx[11];
	const get_key = ctx => /*item*/ ctx[83].id;

	for (let i = 0; i < each_value_1.length; i += 1) {
		let child_ctx = get_each_context_1(ctx, each_value_1, i);
		let key = get_key(child_ctx);
		each0_lookup.set(key, each_blocks_1[i] = create_each_block_1(key, child_ctx));
	}

	let if_block0 = /*typeahead*/ ctx[6] && create_if_block_10(ctx);
	let each_value = /*displayItems*/ ctx[9];
	const get_key_1 = ctx => /*item*/ ctx[83].id;

	for (let i = 0; i < each_value.length; i += 1) {
		let child_ctx = get_each_context(ctx, each_value, i);
		let key = get_key_1(child_ctx);
		each1_lookup.set(key, each_blocks[i] = create_each_block(key, child_ctx));
	}

	let if_block1 = /*typeahead*/ ctx[6] && /*actualCount*/ ctx[8] === 0 && /*previousFetch*/ ctx[18] && !/*activeFetch*/ ctx[17] && create_if_block_2(ctx);
	let if_block2 = /*fetchError*/ ctx[14] && create_if_block_1(ctx);
	let if_block3 = /*selectionItems*/ ctx[11].length >= /*maxItems*/ ctx[5] && create_if_block(ctx);

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

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			t3 = space();
			if (if_block1) if_block1.c();
			t4 = space();
			if (if_block2) if_block2.c();
			t5 = space();
			if (if_block3) if_block3.c();
			attr(span0, "class", "ss-no-click ss-selection text-dark d-flex");

			attr(i, "class", i_class_value = /*showFetching*/ ctx[13]
			? FA_CARET_FETCHING
			: FA_CARET_DOWN);

			attr(span1, "class", "ml-auto");
			attr(button, "class", button_class_value = "form-control " + /*styles*/ ctx[20].control_class + " d-flex");
			attr(button, "name", button_name_value = "ss_control_" + /*basename*/ ctx[4]);
			attr(button, "type", "button");
			attr(button, "tabindex", "0");
			attr(button, "title", /*selectionTitle*/ ctx[12]);
			attr(div0, "class", "dropdown-menu ss-popup");
			toggle_class(div0, "show", /*popupVisible*/ ctx[15]);
			toggle_class(div0, "ss-popup-top", /*popupTop*/ ctx[16]);
			attr(div1, "class", div1_class_value = "ss-container form-control p-0 border-0 " + /*styles*/ ctx[20].container_class);
			attr(div1, "name", div1_name_value = "ss_container_" + /*basename*/ ctx[4]);

			dispose = [
				listen(button, "blur", /*handleBlur*/ ctx[22]),
				listen(button, "keydown", /*handleToggleKeydown*/ ctx[27]),
				listen(button, "keyup", /*handleToggleKeyup*/ ctx[28]),
				listen(button, "click", /*handleToggleClick*/ ctx[29]),
				listen(div0, "scroll", /*handlePopupScroll*/ ctx[33])
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
			/*button_binding*/ ctx[78](button);
			append(div1, t1);
			append(div1, div0);
			if (if_block0) if_block0.m(div0, null);
			append(div0, t2);

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(div0, null);
			}

			append(div0, t3);
			if (if_block1) if_block1.m(div0, null);
			append(div0, t4);
			if (if_block2) if_block2.m(div0, null);
			append(div0, t5);
			if (if_block3) if_block3.m(div0, null);
			/*div0_binding*/ ctx[81](div0);
			/*div1_binding*/ ctx[82](div1);
		},
		p(ctx, dirty) {
			const each_value_1 = /*selectionItems*/ ctx[11];
			each_blocks_1 = update_keyed_each(each_blocks_1, dirty, get_key, 1, ctx, each_value_1, each0_lookup, span0, destroy_block, create_each_block_1, null, get_each_context_1);

			if (dirty[0] & /*showFetching*/ 8192 && i_class_value !== (i_class_value = /*showFetching*/ ctx[13]
			? FA_CARET_FETCHING
			: FA_CARET_DOWN)) {
				attr(i, "class", i_class_value);
			}

			if (dirty[0] & /*basename*/ 16 && button_name_value !== (button_name_value = "ss_control_" + /*basename*/ ctx[4])) {
				attr(button, "name", button_name_value);
			}

			if (dirty[0] & /*selectionTitle*/ 4096) {
				attr(button, "title", /*selectionTitle*/ ctx[12]);
			}

			if (/*typeahead*/ ctx[6]) {
				if (if_block0) {
					if_block0.p(ctx, dirty);
				} else {
					if_block0 = create_if_block_10(ctx);
					if_block0.c();
					if_block0.m(div0, t2);
				}
			} else if (if_block0) {
				if_block0.d(1);
				if_block0 = null;
			}

			const each_value = /*displayItems*/ ctx[9];
			each_blocks = update_keyed_each(each_blocks, dirty, get_key_1, 1, ctx, each_value, each1_lookup, div0, destroy_block, create_each_block, t3, get_each_context);

			if (/*typeahead*/ ctx[6] && /*actualCount*/ ctx[8] === 0 && /*previousFetch*/ ctx[18] && !/*activeFetch*/ ctx[17]) {
				if (if_block1) {
					if_block1.p(ctx, dirty);
				} else {
					if_block1 = create_if_block_2(ctx);
					if_block1.c();
					if_block1.m(div0, t4);
				}
			} else if (if_block1) {
				if_block1.d(1);
				if_block1 = null;
			}

			if (/*fetchError*/ ctx[14]) {
				if (if_block2) {
					if_block2.p(ctx, dirty);
				} else {
					if_block2 = create_if_block_1(ctx);
					if_block2.c();
					if_block2.m(div0, t5);
				}
			} else if (if_block2) {
				if_block2.d(1);
				if_block2 = null;
			}

			if (/*selectionItems*/ ctx[11].length >= /*maxItems*/ ctx[5]) {
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

			if (dirty[0] & /*popupVisible*/ 32768) {
				toggle_class(div0, "show", /*popupVisible*/ ctx[15]);
			}

			if (dirty[0] & /*popupTop*/ 65536) {
				toggle_class(div0, "ss-popup-top", /*popupTop*/ ctx[16]);
			}

			if (dirty[0] & /*basename*/ 16 && div1_name_value !== (div1_name_value = "ss_container_" + /*basename*/ ctx[4])) {
				attr(div1, "name", div1_name_value);
			}
		},
		i: noop,
		o: noop,
		d(detaching) {
			if (detaching) detach(div1);

			for (let i = 0; i < each_blocks_1.length; i += 1) {
				each_blocks_1[i].d();
			}

			/*button_binding*/ ctx[78](null);
			if (if_block0) if_block0.d();

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].d();
			}

			if (if_block1) if_block1.d();
			if (if_block2) if_block2.d();
			if (if_block3) if_block3.d();
			/*div0_binding*/ ctx[81](null);
			/*div1_binding*/ ctx[82](null);
			run_all(dispose);
		}
	};
}

const I18N_DEFAULTS = {
	clear: "Clear",
	no_results: "No results",
	max_limit: "Max limit reached"
};

const STYLE_DEFAULTS = {
	container_class: "",
	item_class: "",
	item_desc_class: "text-muted",
	blank_item_class: "text-muted",
	selected_item_class: "alert-primary",
	typeahead_class: "",
	control_class: ""
};

const MAX_ITEMS_DEFAULT = 100;
const FETCH_INDICATOR_DELAY = 150;
const FA_CARET_DOWN = "text-dark fas fa-caret-down";
const FA_CARET_FETCHING = "text-muted far fa-hourglass";
const FA_SELECTED = "text-muted far fa-check-square";
const FA_NOT_SELECTED = "text-muted far fa-square";

const META_KEYS = {
	Control: true,
	Shift: true,
	Alt: true,
	AltGraph: true,
	Meta: true,
	ContextMenu: true,
	PrintScreen: true,
	ScrollLock: true,
	Pause: true,
	CapsLock: true,
	Numlock: true,
	Escape: true,
	Tab: true,
	ArrowDown: true,
	ArrowUp: true,
	ArrowLeft: true,
	ArrowRight: true,
	PageDown: true,
	PageUp: true,
	Home: true,
	End: true,
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
	F11: true,
	F12: true
};

function nop() {
	
}



function hasModifier(event) {
	return event.altKey || event.ctrlKey || event.metaKey || event.shiftKey;
}

function isMetaKey(event) {
	return META_KEYS[event.key] || META_KEYS[event.code];
}

function toUnderscore(key) {
	return key.split(/(?=[A-Z])/).join("_").toLowerCase();
}

function createItemFromOption(el, styles) {
	let ds = el.dataset;
	let item = { id: el.value || "", text: el.text || "" };

	if (ds) {
		if (ds.itemSeparator) {
			item.separator = true;
		}

		if (ds.itemDesc) {
			item.desc = ds.itemDesc;
		}

		if (ds.itemAction) {
			item.action = ds.itemAction;
		}

		if (ds.itemClass) {
			item.item_class = ds.itemClass;
		}

		item.data = {};

		Object.keys(ds).forEach(function (key) {
			item.data[toUnderscore(key)] = ds[key];
		});
	}

	if (!item.separator) {
		if (item.id === "") {
			item.blank = true;
		}

		if (!item.item_class) {
			item.item_class = item.blank ? styles.blank_item_class : styles.item_class;
		}
	}

	return item;
}

function createOptionFromItem(item) {
	let el = document.createElement("option");
	el.setAttribute("value", item.id);

	if (item.desc) {
		el.setAttribute("data-item-desc", item.desc);
	}

	if (item.item_class) {
		el.setAttribute("data-item-class", item.item_class);
	}

	if (item.action) {
		el.setAttribute("data-item-action", item.action);
	}

	el.textContent = item.text;
	return el;
}

function createDisplay(data) {
	let byId = {};
	let items = [];
	let blankItem = null;
	let fixedItems = data.fixedItems || [];
	let fetchedItems = data.fetchedItems || [];
	let selectionItems = data.selectionItems || [];
	let fixedById = data.fixedById || ({});
	let fetchedById = data.fetchedById || ({});
	let selectionById = data.selectionById || ({});

	fixedItems.forEach(function (item) {
		items.push(item);

		if (!item.separator) {
			byId[item.id] = item;
		}
	});

	let otherItems = [];

	if (data.multiple) {
		selectionItems.forEach(function (item) {
			if (!byId[item.id] || item.separator) {
				otherItems.push(item);

				if (!item.separator) {
					byId[item.id] = item;
				}
			}
		});
	}

	if (otherItems.length) {
		otherItems.push({ id: "selection_sep", separator: true });
	}

	fetchedItems.forEach(function (item) {
		if (!data.multiple || !byId[item.id] || item.separator) {
			otherItems.push(item);

			if (!item.separator) {
				byId[item.id] = item;
			}
		}
	});

	if (data.typeahead && otherItems.length && items.length) {
		items.push({ id: "fixed_sep", separator: true });
	}

	otherItems.forEach(function (item) {
		items.push(item);
	});

	items.forEach(function (item) {
		if (item.blank) {
			blankItem = item;
		}
	});

	return { blankItem, byId, displayItems: items };
}



function createResult(data) {
	let byId = {};
	let fetchedItems = data.fetchedItems || [];

	fetchedItems.forEach(function (item) {
		if (item.id) {
			item.id = item.id.toString();
		}

		if (!item.separator) {
			byId[item.id] = item;
		}
	});

	let counts = calculateCounts(fetchedItems);
	let more = data.more === true && counts.offsetCount > 0 && !data.fetchedId;
	let blankItem = byId[""] || null;

	if (blankItem) {
		blankItem.blank = true;
	}

	return {
		blankItem,
		fetchedItems,
		fetchedById: byId,
		offsetCount: counts.offsetCount,
		actualCount: counts.actualCount,
		more
	};
}

function calculateCounts(items) {
	let act = 0;
	let off = 0;

	items.forEach(function (item) {
		if (item.separator) ; else if (!item.id) ; else if (item.placeholder) {
			act += 1;
		} else {
			off += 1;
			act += 1;
		}
	});

	return { offsetCount: off, actualCount: act };
}

function handleKeyEvent(event, handlers) {
	(handlers[event.key] || handlers[event.code] || handlers.base)(event);
}

function instance($$self, $$props, $$invalidate) {
	let { real } = $$props;
	let { config = {} } = $$props;
	let containerEl;
	let inputEl;
	let toggleEl;
	let popupEl;
	let setupDone = false;
	let translations = {};
	let styles = {};
	let basename = "";
	let fetcher = inlineFetcher;
	let remote = false;
	let maxItems = MAX_ITEMS_DEFAULT;
	let typeahead = false;
	let placeholderItem = { id: "", text: "", blank: true };
	let mounted = false;
	let query = "";
	let fixedItems = [];
	let fixedById = {};
	let result = createResult({});
	let actualCount = 0;
	let hasMore = false;
	let display = createDisplay({});
	let displayItems = [];
	let selectionById = {};
	let selectionItems = [];
	let selectionTitle = "";
	let showFetching = false;
	let fetchingMore = false;
	let fetchError = null;
	let popupVisible = false;
	let popupTop = false;
	let activeFetch = null;
	let previousFetch = null;
	let previousQuery = null;
	let multiple = false;
	let isSyncToReal = false;

	function selectItem(id) {
		return fetchItems(false, id).then(function (response) {
			selectItemImpl(id);
		});
	}

	function translate(key) {
		return translations[key];
	}

	function clearQuery() {
		$$invalidate(7, query = "");
		previousQuery = null;
	}

	function openPopup() {
		if (!popupVisible) {
			$$invalidate(15, popupVisible = true);
			let w = containerEl.offsetWidth;
			$$invalidate(3, popupEl.style.minWidth = w + "px", popupEl);
			let bounds = containerEl.getBoundingClientRect();
			let middle = window.innerHeight / 2;
			$$invalidate(16, popupTop = bounds.y > middle);
		}
	}

	function closePopup(focusToggle) {
		$$invalidate(15, popupVisible = false);
		updateDisplay();

		if (focusToggle) {
			toggleEl.focus();
		}
	}

	function selectItemImpl(id) {
		id = id.toString();
		let item = display.byId[id];

		if (!item) {
			console.error("MISSING item=" + id);
			return;
		}

		let blankItem = display.blankItem;
		let byId = selectionById;

		if (multiple) {
			if (item.id) {
				if (byId[item.id]) {
					delete byId[item.id];

					if (!blankItem) {
						blankItem = placeholderItem;
					}
				} else {
					if (selectionItems.length >= maxItems) {
						console.warn("IGNORE: maxItems=" + maxItems);
						return;
					}

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

		$$invalidate(10, selectionById = byId);

		$$invalidate(11, selectionItems = items.sort(function (a, b) {
			return a.text.localeCompare(b.text);
		}));

		$$invalidate(12, selectionTitle = selectionItems.map(function (item) {
			return item.text;
		}).join(", "));

		if (!multiple || item.blank) {
			clearQuery();
			closePopup(containsElement(document.activeElement));
		}

		syncToRealSelection();
		real.dispatchEvent(new CustomEvent("select-select", { detail: selectionItems }));
	}

	function executeAction(id) {
		let item = display.byId[id];

		if (!item) {
			console.error("MISSING action item=" + id);
			return;
		}

		closePopup(containsElement(document.activeElement));
		real.dispatchEvent(new CustomEvent("select-action", { detail: item }));
	}

	function selectElement(el) {
		if (el.dataset.action) {
			executeAction(el.dataset.id);
		} else {
			selectItemImpl(el.dataset.id);

			if (el.dataset.selected) ;
		}
	}

	function containsElement(el) {
		return containerEl.contains(el) || popupEl.contains(el);
	}

	function syncFromRealSelection() {
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
				item = createItemFromOption(el, styles);
			}

			byId[item.id] = item;
		}

		$$invalidate(10, selectionById = byId);

		$$invalidate(11, selectionItems = Object.values(byId).sort(function (a, b) {
			return a.text.localeCompare(b.text);
		}));

		if (selectionItems.length == 0 && multiple) {
			selectionById[""] == placeholderItem;
			selectionItems.push(placeholderItem);
		}

		$$invalidate(12, selectionTitle = selectionItems.map(function (item) {
			return item.text;
		}).join(", "));
	}

	function syncToRealSelection() {
		let changed = false;

		if (remote) {
			selectionItems.forEach(function (item) {
				if (multiple && item.blank) {
					return;
				}

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
			let selected = !!selectionById[el.value];
			changed = changed || el.selected !== selected;

			if (selected) {
				el.setAttribute("selected", "");
			} else {
				el.removeAttribute("selected");
			}
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

	function updateFixedItems() {
		let byId = {};
		let items = [];

		if (multiple) {
			items.push(placeholderItem);
		}

		let options = real.options;

		for (let i = 0; i < options.length; i++) {
			let el = options[i];

			if (!el.value || el.dataset.itemFixed != null) {
				let item = createItemFromOption(el, styles);
				item.fixed = true;
				byId[item.id] = item;
				items.push(item);
			}
		}

		let blankItem = byId[""];

		if (blankItem) {
			blankItem.blank = true;
		}

		fixedItems = items;
		fixedById = byId;
	}

	function updateDisplay() {
		display = createDisplay({
			typeahead,
			multiple,
			fixedItems,
			fixedById,
			fetchedItems: result.fetchedItems,
			fetchedById: result.fetchedById,
			selectionItems,
			selectionById
		});

		$$invalidate(9, displayItems = display.displayItems);
	}

	function inlineFetcher(offset, query) {

		let promise = new Promise(function (resolve, reject) {
				let items = [];
				let pattern = query.toUpperCase().trim();
				let options = real.options;

				for (let i = 0; i < options.length; i++) {
					let item = createItemFromOption(options[i], styles);
					let match;

					if (item.blank) {
						match = false;
					} else {
						match = item.separator || item.text.toUpperCase().includes(pattern) || item.desc && item.desc.toUpperCase().includes(pattern);
					}

					if (match) {
						items.push(item);
					}
				}

				let response = { items, info: { more: false } };
				resolve(response);
			});

		return promise;
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
			hasMore = false;
		}

		fetchingMore = fetchMore;
		$$invalidate(14, fetchError = null);
		$$invalidate(13, showFetching = false);
		let currentFetchingMore = fetchingMore;

		let currentFetch = fetcher(currentFetchOffset, currentQuery, fetchId).then(function (response) {
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
					fetchedId: fetchId,
					more: info.more
				});

				$$invalidate(8, actualCount = result.actualCount);
				hasMore = result.more;
				updateDisplay();

				if (fetchId) {
					previousQuery = null;
				} else {
					previousQuery = currentQuery;
				}

				$$invalidate(18, previousFetch = currentFetch);
				$$invalidate(17, activeFetch = null);
				fetchingMore = false;
				$$invalidate(13, showFetching = false);

				setTimeout(function () {
					fetchMoreIfneeded();
				});
			}
		}).catch(function (err) {
			if (currentFetch === activeFetch) {
				console.error(err);
				$$invalidate(14, fetchError = err);
				let result = createResult({});
				$$invalidate(8, actualCount = result.actualCount);
				hasMore = result.more;
				updateDisplay();
				previousQuery = null;
				$$invalidate(18, previousFetch = currentFetch);
				$$invalidate(17, activeFetch = null);
				fetchingMore = false;
				$$invalidate(13, showFetching = false);
				toggleEl.focus();
				openPopup();
			}
		});

		setTimeout(
			function () {
				if (activeFetch === currentFetch) {
					$$invalidate(13, showFetching = true);
				}
			},
			FETCH_INDICATOR_DELAY
		);

		$$invalidate(17, activeFetch = currentFetch);
		$$invalidate(18, previousFetch = null);
		return currentFetch;
	}

	function cancelFetch() {
		if (activeFetch !== null) {
			$$invalidate(17, activeFetch = null);
			previousQuery = null;
		}
	}

	function fetchMoreIfneeded() {
		if (hasMore && !fetchingMore && popupVisible) {
			if (popupEl.scrollTop + popupEl.clientHeight >= popupEl.scrollHeight - popupEl.lastElementChild.clientHeight * 2 - 2) {
				fetchItems(true);
			}
		}
	}

	onMount(function () {
		syncFromRealSelection();

		Object.keys(eventListeners).forEach(function (ev) {
			real.addEventListener(ev, eventListeners[ev]);
		});

		$$invalidate(41, mounted = true);
	});

	beforeUpdate(function () {
		if (!setupDone) {
			setupComponent();
			setupDone = true;
		}
	});

	function setupComponent() {
		real.classList.add("d-none");
		$$invalidate(19, multiple = real.multiple);

		if (config.remote) {
			remote = true;
			fetcher = config.fetcher;
		}

		$$invalidate(6, typeahead = config.typeahead || false);
		$$invalidate(5, maxItems = config.maxItems || MAX_ITEMS_DEFAULT);
		Object.assign(translations, I18N_DEFAULTS);

		if (config.translations) {
			Object.assign(translations, config.translations);
		}

		Object.assign(styles, STYLE_DEFAULTS);

		if (config.styles) {
			Object.assign(styles, config.styles);
		}

		$$invalidate(4, basename = real.name);
		$$invalidate(5, maxItems = config.maxItems || MAX_ITEMS_DEFAULT);
		placeholderItem.text = config.placeholder || "";
		placeholderItem.item_class = styles.blank_item_class;
		jQuery(toggleEl).tooltip();
		updateFixedItems();
		updateDisplay();
	}

	let eventListeners = {
		change(event) {

			if (!isSyncToReal) {
				syncFromRealSelection();
			}
		},
		"select-reload"(event) {

			if (!isSyncToReal) {
				updateFixedItems();
				syncFromRealSelection();
				previousQuery = null;

				if (popupVisible) {
					fetchItems(false, null);
				} else {
					updateDisplay();
				}
			}
		}
	};

	let toggleKeydownHandlers = {
		base(event) {
			if (typeahead && popupVisible && !isMetaKey(event)) {
				inputEl.focus();
			}
		},
		ArrowDown(event) {
			openPopup();
			fetchItems();

			if (typeahead) {
				inputEl.focus();
			} else {
				let next = popupEl.querySelectorAll(".ss-js-item")[0];

				while (next && next.classList.contains("ss-js-blank")) {
					next = next.nextElementSibling;
				}

				focusItem(next);
			}

			event.preventDefault();
		},
		ArrowUp: nop,
		Enter(event) {
			if (!hasModifier(event)) {
				openPopup();
				fetchItems(false);
				event.preventDefault();
			}
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
		Delete(event) {
			selectItem("");
		},
		Backspace(event) {
			selectItem("");
		}
	};

	let toggleKeyupHandlers = { base: nop };

	let inputKeypressHandlers = {
		base(event) {
			
		}
	};

	let inputKeydownHandlers = {
		base: nop,
		ArrowDown(event) {
			let next = popupEl.querySelectorAll(".ss-js-item")[0];

			while (next && next.classList.contains("ss-js-blank")) {
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
			if (!isMetaKey(event)) {
				fetchItems();
			}
		}
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
			while (next && next.classList.contains("ss-js-blank")) {
				next = next.previousElementSibling;
			}

			if (next && !next.classList.contains("ss-js-item")) {
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
			while (next && next.classList.contains("ss-js-blank")) {
				next = next.nextElementSibling;
			}

			if (next && !next.classList.contains("ss-js-item")) {
				next = null;
			}
		}

		focusItem(next);
		return next;
	}

	let itemKeydownHandlers = {
		base(event) {
			if (typeahead && !isMetaKey(event)) {
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
		Tab(event) {
			toggleEl.focus();
			event.preventDefault();
		}
	};

	let itemKeyupHandlers = {
		base: nop,
		PageUp(event) {
			let scrollLeft = document.body.scrollLeft;
			let scrollTop = document.body.scrollTop;
			let rect = popupEl.getBoundingClientRect();
			let next = document.elementFromPoint(scrollLeft + rect.x + 10, scrollTop + rect.top + 1);

			if (!next) {
				next = popupEl.querySelector(".ss-js-item:first-child");
			} else {
				if (!next.classList.contains("ss-js-item")) {
					next = popupEl.querySelector(".ss-js-item:first-child");
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
				next = popupEl.querySelector(".ss-js-item:last-child");
			} else {
				if (!next.classList.contains("ss-js-item")) {
					next = popupEl.querySelector(".ss-js-item:last-child");
				}
			}

			focusItem(next);
			event.preventDefault();
		},
		Home(event) {
			let next = popupEl.querySelector(".ss-js-item:first-child");
			focusItem(next);
			event.preventDefault();
		},
		End(event) {
			let next = popupEl.querySelector(".ss-js-item:last-child");
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
		handleKeyEvent(event, inputKeypressHandlers);
	}

	function handleInputKeydown(event) {
		handleKeyEvent(event, inputKeydownHandlers);
	}

	function handleInputKeyup(event) {
		handleKeyEvent(event, inputKeyupHandlers);
	}

	function handleToggleKeydown(event) {
		handleKeyEvent(event, toggleKeydownHandlers);
	}

	function handleToggleKeyup(event) {
		handleKeyEvent(event, toggleKeyupHandlers);
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
		handleKeyEvent(event, itemKeydownHandlers);
	}

	function handleItemKeyup(event) {
		handleKeyEvent(event, itemKeyupHandlers);
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
			$$invalidate(2, toggleEl = $$value);
		});
	}

	function input_input_handler() {
		query = this.value;
		$$invalidate(7, query);
	}

	function input_binding($$value) {
		binding_callbacks[$$value ? "unshift" : "push"](() => {
			$$invalidate(1, inputEl = $$value);
		});
	}

	function div0_binding($$value) {
		binding_callbacks[$$value ? "unshift" : "push"](() => {
			$$invalidate(3, popupEl = $$value);
		});
	}

	function div1_binding($$value) {
		binding_callbacks[$$value ? "unshift" : "push"](() => {
			$$invalidate(0, containerEl = $$value);
		});
	}

	$$self.$set = $$props => {
		if ("real" in $$props) $$invalidate(34, real = $$props.real);
		if ("config" in $$props) $$invalidate(35, config = $$props.config);
	};

	$$self.$$.update = () => {
		if ($$self.$$.dirty[1] & /*mounted*/ 1024) {
			 {
				if (mounted) {
					syncToRealSelection();
				}
			}
		}
	};

	return [
		containerEl,
		inputEl,
		toggleEl,
		popupEl,
		basename,
		maxItems,
		typeahead,
		query,
		actualCount,
		displayItems,
		selectionById,
		selectionItems,
		selectionTitle,
		showFetching,
		fetchError,
		popupVisible,
		popupTop,
		activeFetch,
		previousFetch,
		multiple,
		styles,
		translate,
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
		real,
		config,
		selectItem,
		setupDone,
		fetcher,
		remote,
		placeholderItem,
		mounted,
		fixedItems,
		fixedById,
		result,
		hasMore,
		display,
		fetchingMore,
		previousQuery,
		isSyncToReal,
		translations,
		clearQuery,
		openPopup,
		closePopup,
		selectItemImpl,
		executeAction,
		selectElement,
		containsElement,
		syncFromRealSelection,
		syncToRealSelection,
		updateFixedItems,
		updateDisplay,
		inlineFetcher,
		fetchItems,
		cancelFetch,
		fetchMoreIfneeded,
		setupComponent,
		eventListeners,
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
		input_input_handler,
		input_binding,
		div0_binding,
		div1_binding
	];
}

class Select extends SvelteComponent {
	constructor(options) {
		super();
		if (!document_1.getElementById("svelte-7gew9f-style")) add_css();
		init(this, options, instance, create_fragment, safe_not_equal, { real: 34, config: 35, selectItem: 36 }, [-1, -1, -1]);
	}

	get selectItem() {
		return this.$$.ctx[36];
	}
}

export default Select;
