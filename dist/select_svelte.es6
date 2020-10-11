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
function is_empty(obj) {
    return Object.keys(obj).length === 0;
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
    if (text.wholeText !== data)
        text.data = data;
}
function set_input_value(input, value) {
    input.value = value == null ? '' : value;
}
function toggle_class(element, name, toggle) {
    element.classList[toggle ? 'add' : 'remove'](name);
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
function afterUpdate(fn) {
    get_current_component().$$.after_update.push(fn);
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
let flushing = false;
const seen_callbacks = new Set();
function flush() {
    if (flushing)
        return;
    flushing = true;
    do {
        // first, call beforeUpdate functions
        // and update components
        for (let i = 0; i < dirty_components.length; i += 1) {
            const component = dirty_components[i];
            set_current_component(component);
            update(component.$$);
        }
        set_current_component(null);
        dirty_components.length = 0;
        while (binding_callbacks.length)
            binding_callbacks.pop()();
        // then, once components are updated, call
        // afterUpdate functions. This may cause
        // subsequent updates...
        for (let i = 0; i < render_callbacks.length; i += 1) {
            const callback = render_callbacks[i];
            if (!seen_callbacks.has(callback)) {
                // ...so guard against infinite loops
                seen_callbacks.add(callback);
                callback();
            }
        }
        render_callbacks.length = 0;
    } while (dirty_components.length);
    while (flush_callbacks.length) {
        flush_callbacks.pop()();
    }
    update_scheduled = false;
    flushing = false;
    seen_callbacks.clear();
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
        dirty,
        skip_bound: false
    };
    let ready = false;
    $$.ctx = instance
        ? instance(component, prop_values, (i, ret, ...rest) => {
            const value = rest.length ? rest[0] : ret;
            if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                if (!$$.skip_bound && $$.bound[i])
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
            const nodes = children(options.target);
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            $$.fragment && $$.fragment.l(nodes);
            nodes.forEach(detach);
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
    $set($$props) {
        if (this.$$set && !is_empty($$props)) {
            this.$$.skip_bound = true;
            this.$$set($$props);
            this.$$.skip_bound = false;
        }
    }
}

/* src/select.svelte generated by Svelte v3.29.0 */

function get_each_context(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[125] = list[i];
	return child_ctx;
}

function get_each_context_1(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[125] = list[i];
	child_ctx[129] = i;
	return child_ctx;
}

// (1731:10) {:else}
function create_else_block_4(ctx) {
	let t_value = (/*item*/ ctx[125].summary == null
	? /*item*/ ctx[125].text
	: /*item*/ ctx[125].summary) + "";

	let t;

	return {
		c() {
			t = text(t_value);
		},
		m(target, anchor) {
			insert(target, t, anchor);
		},
		p(ctx, dirty) {
			if (dirty[0] & /*summaryItems*/ 2097152 && t_value !== (t_value = (/*item*/ ctx[125].summary == null
			? /*item*/ ctx[125].text
			: /*item*/ ctx[125].summary) + "")) set_data(t, t_value);
		},
		d(detaching) {
			if (detaching) detach(t);
		}
	};
}

// (1724:10) {#if item.href}
function create_if_block_12(ctx) {
	let a;

	let t_value = (/*item*/ ctx[125].summary == null
	? /*item*/ ctx[125].text
	: /*item*/ ctx[125].summary) + "";

	let t;
	let a_href_value;
	let mounted;
	let dispose;

	return {
		c() {
			a = element("a");
			t = text(t_value);
			attr(a, "class", "ss-item-link");
			attr(a, "href", a_href_value = /*item*/ ctx[125].href);
			attr(a, "target", "_blank");
			attr(a, "tabindex", "-1");
		},
		m(target, anchor) {
			insert(target, a, anchor);
			append(a, t);

			if (!mounted) {
				dispose = [
					listen(a, "click", handleToggleLinkMouseDown),
					listen(a, "click", /*handleToggleLinkClick*/ ctx[42])
				];

				mounted = true;
			}
		},
		p(ctx, dirty) {
			if (dirty[0] & /*summaryItems*/ 2097152 && t_value !== (t_value = (/*item*/ ctx[125].summary == null
			? /*item*/ ctx[125].text
			: /*item*/ ctx[125].summary) + "")) set_data(t, t_value);

			if (dirty[0] & /*summaryItems*/ 2097152 && a_href_value !== (a_href_value = /*item*/ ctx[125].href)) {
				attr(a, "href", a_href_value);
			}
		},
		d(detaching) {
			if (detaching) detach(a);
			mounted = false;
			run_all(dispose);
		}
	};
}

// (1717:6) {#each summaryItems as item, index (item.id)}
function create_each_block_1(key_1, ctx) {
	let span;
	let t;
	let span_class_value;

	function select_block_type(ctx, dirty) {
		if (/*item*/ ctx[125].href) return create_if_block_12;
		return create_else_block_4;
	}

	let current_block_type = select_block_type(ctx);
	let if_block = current_block_type(ctx);

	return {
		key: key_1,
		first: null,
		c() {
			span = element("span");
			if_block.c();
			t = space();
			attr(span, "class", span_class_value = /*item*/ ctx[125].item_class || "");
			toggle_class(span, "ss-blank", /*item*/ ctx[125].blank);
			toggle_class(span, "ss-summary-item-multiple", !/*summarySingle*/ ctx[20]);
			toggle_class(span, "ss-summary-item-single", /*summarySingle*/ ctx[20]);
			this.first = span;
		},
		m(target, anchor) {
			insert(target, span, anchor);
			if_block.m(span, null);
			append(span, t);
		},
		p(ctx, dirty) {
			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
				if_block.p(ctx, dirty);
			} else {
				if_block.d(1);
				if_block = current_block_type(ctx);

				if (if_block) {
					if_block.c();
					if_block.m(span, t);
				}
			}

			if (dirty[0] & /*summaryItems*/ 2097152 && span_class_value !== (span_class_value = /*item*/ ctx[125].item_class || "")) {
				attr(span, "class", span_class_value);
			}

			if (dirty[0] & /*summaryItems, summaryItems*/ 2097152) {
				toggle_class(span, "ss-blank", /*item*/ ctx[125].blank);
			}

			if (dirty[0] & /*summaryItems, summarySingle*/ 3145728) {
				toggle_class(span, "ss-summary-item-multiple", !/*summarySingle*/ ctx[20]);
			}

			if (dirty[0] & /*summaryItems, summarySingle*/ 3145728) {
				toggle_class(span, "ss-summary-item-single", /*summarySingle*/ ctx[20]);
			}
		},
		d(detaching) {
			if (detaching) detach(span);
			if_block.d();
		}
	};
}

// (1752:4) {#if typeahead}
function create_if_block_11(ctx) {
	let div;
	let label;
	let t0_value = /*translate*/ ctx[33]("typeahead_input") + "";
	let t0;
	let label_for_value;
	let t1;
	let input;
	let input_id_value;
	let input_aria_controls_value;
	let input_aria_activedescendant_value;
	let mounted;
	let dispose;

	return {
		c() {
			div = element("div");
			label = element("label");
			t0 = text(t0_value);
			t1 = space();
			input = element("input");
			attr(label, "for", label_for_value = "" + (/*containerId*/ ctx[12] + "_input"));
			attr(label, "class", "sr-only");
			attr(input, "class", "form-control ss-input");
			attr(input, "id", input_id_value = "" + (/*containerId*/ ctx[12] + "_input"));
			attr(input, "tabindex", "1");
			attr(input, "autocomplete", "new-password");
			attr(input, "autocorrect", "off");
			attr(input, "autocapitalize", "off");
			attr(input, "spellcheck", "off");
			attr(input, "role", "combobox");
			attr(input, "aria-autocomplete", "list");
			attr(input, "aria-controls", input_aria_controls_value = "" + (/*containerId*/ ctx[12] + "_items"));
			attr(input, "aria-activedescendant", input_aria_activedescendant_value = /*activeId*/ ctx[22] || "");
			attr(div, "class", "ss-input-item");
		},
		m(target, anchor) {
			insert(target, div, anchor);
			append(div, label);
			append(label, t0);
			append(div, t1);
			append(div, input);
			/*input_binding*/ ctx[49](input);
			set_input_value(input, /*query*/ ctx[14]);

			if (!mounted) {
				dispose = [
					listen(input, "input", /*input_input_handler*/ ctx[50]),
					listen(input, "blur", /*handleInputBlur*/ ctx[35]),
					listen(input, "keypress", /*handleInputKeypress*/ ctx[36]),
					listen(input, "keydown", /*handleInputKeydown*/ ctx[37]),
					listen(input, "keyup", /*handleInputKeyup*/ ctx[38])
				];

				mounted = true;
			}
		},
		p(ctx, dirty) {
			if (dirty[0] & /*containerId*/ 4096 && label_for_value !== (label_for_value = "" + (/*containerId*/ ctx[12] + "_input"))) {
				attr(label, "for", label_for_value);
			}

			if (dirty[0] & /*containerId*/ 4096 && input_id_value !== (input_id_value = "" + (/*containerId*/ ctx[12] + "_input"))) {
				attr(input, "id", input_id_value);
			}

			if (dirty[0] & /*containerId*/ 4096 && input_aria_controls_value !== (input_aria_controls_value = "" + (/*containerId*/ ctx[12] + "_items"))) {
				attr(input, "aria-controls", input_aria_controls_value);
			}

			if (dirty[0] & /*activeId*/ 4194304 && input_aria_activedescendant_value !== (input_aria_activedescendant_value = /*activeId*/ ctx[22] || "")) {
				attr(input, "aria-activedescendant", input_aria_activedescendant_value);
			}

			if (dirty[0] & /*query*/ 16384 && input.value !== /*query*/ ctx[14]) {
				set_input_value(input, /*query*/ ctx[14]);
			}
		},
		d(detaching) {
			if (detaching) detach(div);
			/*input_binding*/ ctx[49](null);
			mounted = false;
			run_all(dispose);
		}
	};
}

// (1813:10) {:else}
function create_else_block(ctx) {
	let li;
	let div1;
	let t0;
	let div0;
	let t1;
	let li_class_value;
	let li_id_value;
	let li_aria_selected_value;
	let li_data_id_value;
	let li_data_action_value;
	let mounted;
	let dispose;
	let if_block0 = /*multiple*/ ctx[30] && !/*item*/ ctx[125].blank && !/*item*/ ctx[125].action && create_if_block_10(ctx);

	function select_block_type_2(ctx, dirty) {
		if (/*item*/ ctx[125].blank) return create_if_block_6;
		return create_else_block_2;
	}

	let current_block_type = select_block_type_2(ctx);
	let if_block1 = current_block_type(ctx);

	return {
		c() {
			li = element("li");
			div1 = element("div");
			if (if_block0) if_block0.c();
			t0 = space();
			div0 = element("div");
			if_block1.c();
			t1 = space();
			attr(div0, "class", "d-inline-block");
			attr(div1, "class", "ss-no-click");
			attr(li, "class", li_class_value = "dropdown-item ss-item ss-js-item " + (/*item*/ ctx[125].item_class || ""));
			attr(li, "id", li_id_value = "" + (/*containerId*/ ctx[12] + "_item_" + /*item*/ ctx[125].id));
			attr(li, "role", "option");

			attr(li, "aria-selected", li_aria_selected_value = /*selectionById*/ ctx[17][/*item*/ ctx[125].id]
			? "true"
			: null);

			attr(li, "data-id", li_data_id_value = /*item*/ ctx[125].id);
			attr(li, "data-action", li_data_action_value = /*item*/ ctx[125].action);
			toggle_class(li, "ss-item-selected", !/*item*/ ctx[125].blank && /*selectionById*/ ctx[17][/*item*/ ctx[125].id]);
		},
		m(target, anchor) {
			insert(target, li, anchor);
			append(li, div1);
			if (if_block0) if_block0.m(div1, null);
			append(div1, t0);
			append(div1, div0);
			if_block1.m(div0, null);
			append(li, t1);

			if (!mounted) {
				dispose = [
					listen(li, "mousedown", handleOptionMouseDown),
					listen(li, "click", /*handleOptionClick*/ ctx[43])
				];

				mounted = true;
			}
		},
		p(ctx, dirty) {
			if (/*multiple*/ ctx[30] && !/*item*/ ctx[125].blank && !/*item*/ ctx[125].action) {
				if (if_block0) {
					if_block0.p(ctx, dirty);
				} else {
					if_block0 = create_if_block_10(ctx);
					if_block0.c();
					if_block0.m(div1, t0);
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

			if (dirty[0] & /*displayItems*/ 65536 && li_class_value !== (li_class_value = "dropdown-item ss-item ss-js-item " + (/*item*/ ctx[125].item_class || ""))) {
				attr(li, "class", li_class_value);
			}

			if (dirty[0] & /*containerId, displayItems*/ 69632 && li_id_value !== (li_id_value = "" + (/*containerId*/ ctx[12] + "_item_" + /*item*/ ctx[125].id))) {
				attr(li, "id", li_id_value);
			}

			if (dirty[0] & /*selectionById, displayItems*/ 196608 && li_aria_selected_value !== (li_aria_selected_value = /*selectionById*/ ctx[17][/*item*/ ctx[125].id]
			? "true"
			: null)) {
				attr(li, "aria-selected", li_aria_selected_value);
			}

			if (dirty[0] & /*displayItems*/ 65536 && li_data_id_value !== (li_data_id_value = /*item*/ ctx[125].id)) {
				attr(li, "data-id", li_data_id_value);
			}

			if (dirty[0] & /*displayItems*/ 65536 && li_data_action_value !== (li_data_action_value = /*item*/ ctx[125].action)) {
				attr(li, "data-action", li_data_action_value);
			}

			if (dirty[0] & /*displayItems, displayItems, selectionById*/ 196608) {
				toggle_class(li, "ss-item-selected", !/*item*/ ctx[125].blank && /*selectionById*/ ctx[17][/*item*/ ctx[125].id]);
			}
		},
		d(detaching) {
			if (detaching) detach(li);
			if (if_block0) if_block0.d();
			if_block1.d();
			mounted = false;
			run_all(dispose);
		}
	};
}

// (1800:54) 
function create_if_block_4(ctx) {
	let li;
	let div;
	let t0_value = /*item*/ ctx[125].text + "";
	let t0;
	let div_class_value;
	let t1;
	let t2;
	let if_block = /*item*/ ctx[125].desc && create_if_block_5(ctx);

	return {
		c() {
			li = element("li");
			div = element("div");
			t0 = text(t0_value);
			t1 = space();
			if (if_block) if_block.c();
			t2 = space();
			attr(div, "class", div_class_value = "ss-item-text " + (/*item*/ ctx[125].item_class || ""));
			attr(li, "class", "dropdown-item ss-item-muted ss-js-dead");
		},
		m(target, anchor) {
			insert(target, li, anchor);
			append(li, div);
			append(div, t0);
			append(li, t1);
			if (if_block) if_block.m(li, null);
			append(li, t2);
		},
		p(ctx, dirty) {
			if (dirty[0] & /*displayItems*/ 65536 && t0_value !== (t0_value = /*item*/ ctx[125].text + "")) set_data(t0, t0_value);

			if (dirty[0] & /*displayItems*/ 65536 && div_class_value !== (div_class_value = "ss-item-text " + (/*item*/ ctx[125].item_class || ""))) {
				attr(div, "class", div_class_value);
			}

			if (/*item*/ ctx[125].desc) {
				if (if_block) {
					if_block.p(ctx, dirty);
				} else {
					if_block = create_if_block_5(ctx);
					if_block.c();
					if_block.m(li, t2);
				}
			} else if (if_block) {
				if_block.d(1);
				if_block = null;
			}
		},
		d(detaching) {
			if (detaching) detach(li);
			if (if_block) if_block.d();
		}
	};
}

// (1796:10) {#if item.separator}
function create_if_block_3(ctx) {
	let li;

	return {
		c() {
			li = element("li");
			attr(li, "class", "dropdown-divider ss-js-dead");
		},
		m(target, anchor) {
			insert(target, li, anchor);
		},
		p: noop,
		d(detaching) {
			if (detaching) detach(li);
		}
	};
}

// (1828:16) {#if multiple && !item.blank && !item.action}
function create_if_block_10(ctx) {
	let div;
	let i;
	let i_class_value;

	return {
		c() {
			div = element("div");
			i = element("i");

			attr(i, "class", i_class_value = "ss-marker " + (/*selectionById*/ ctx[17][/*item*/ ctx[125].id]
			? FA_SELECTED
			: FA_NOT_SELECTED));

			attr(div, "class", "d-inline-block align-top");
		},
		m(target, anchor) {
			insert(target, div, anchor);
			append(div, i);
		},
		p(ctx, dirty) {
			if (dirty[0] & /*selectionById, displayItems*/ 196608 && i_class_value !== (i_class_value = "ss-marker " + (/*selectionById*/ ctx[17][/*item*/ ctx[125].id]
			? FA_SELECTED
			: FA_NOT_SELECTED))) {
				attr(i, "class", i_class_value);
			}
		},
		d(detaching) {
			if (detaching) detach(div);
		}
	};
}

// (1843:18) {:else}
function create_else_block_2(ctx) {
	let t;
	let if_block1_anchor;

	function select_block_type_4(ctx, dirty) {
		if (/*item*/ ctx[125].href) return create_if_block_9;
		return create_else_block_3;
	}

	let current_block_type = select_block_type_4(ctx);
	let if_block0 = current_block_type(ctx);
	let if_block1 = /*item*/ ctx[125].desc && create_if_block_8(ctx);

	return {
		c() {
			if_block0.c();
			t = space();
			if (if_block1) if_block1.c();
			if_block1_anchor = empty();
		},
		m(target, anchor) {
			if_block0.m(target, anchor);
			insert(target, t, anchor);
			if (if_block1) if_block1.m(target, anchor);
			insert(target, if_block1_anchor, anchor);
		},
		p(ctx, dirty) {
			if (current_block_type === (current_block_type = select_block_type_4(ctx)) && if_block0) {
				if_block0.p(ctx, dirty);
			} else {
				if_block0.d(1);
				if_block0 = current_block_type(ctx);

				if (if_block0) {
					if_block0.c();
					if_block0.m(t.parentNode, t);
				}
			}

			if (/*item*/ ctx[125].desc) {
				if (if_block1) {
					if_block1.p(ctx, dirty);
				} else {
					if_block1 = create_if_block_8(ctx);
					if_block1.c();
					if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
				}
			} else if (if_block1) {
				if_block1.d(1);
				if_block1 = null;
			}
		},
		d(detaching) {
			if_block0.d(detaching);
			if (detaching) detach(t);
			if (if_block1) if_block1.d(detaching);
			if (detaching) detach(if_block1_anchor);
		}
	};
}

// (1835:18) {#if item.blank}
function create_if_block_6(ctx) {
	let div;

	function select_block_type_3(ctx, dirty) {
		if (/*multiple*/ ctx[30]) return create_if_block_7;
		return create_else_block_1;
	}

	let current_block_type = select_block_type_3(ctx);
	let if_block = current_block_type(ctx);

	return {
		c() {
			div = element("div");
			if_block.c();
			attr(div, "class", "ss-blank");
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

// (1851:20) {:else}
function create_else_block_3(ctx) {
	let div;
	let t_value = /*item*/ ctx[125].text + "";
	let t;
	let div_class_value;

	return {
		c() {
			div = element("div");
			t = text(t_value);
			attr(div, "class", div_class_value = "ss-item-text " + (/*item*/ ctx[125].item_text_class || ""));
		},
		m(target, anchor) {
			insert(target, div, anchor);
			append(div, t);
		},
		p(ctx, dirty) {
			if (dirty[0] & /*displayItems*/ 65536 && t_value !== (t_value = /*item*/ ctx[125].text + "")) set_data(t, t_value);

			if (dirty[0] & /*displayItems*/ 65536 && div_class_value !== (div_class_value = "ss-item-text " + (/*item*/ ctx[125].item_text_class || ""))) {
				attr(div, "class", div_class_value);
			}
		},
		d(detaching) {
			if (detaching) detach(div);
		}
	};
}

// (1844:20) {#if item.href}
function create_if_block_9(ctx) {
	let a;
	let t_value = /*item*/ ctx[125].text + "";
	let t;
	let a_href_value;
	let mounted;
	let dispose;

	return {
		c() {
			a = element("a");
			t = text(t_value);
			attr(a, "class", "ss-item-link");
			attr(a, "href", a_href_value = /*item*/ ctx[125].href);
			attr(a, "tabindex", "-1");
		},
		m(target, anchor) {
			insert(target, a, anchor);
			append(a, t);

			if (!mounted) {
				dispose = [
					listen(a, "mousedown", handleOptionLinkMouseDown),
					listen(a, "click", /*handleOptionLinkClick*/ ctx[44])
				];

				mounted = true;
			}
		},
		p(ctx, dirty) {
			if (dirty[0] & /*displayItems*/ 65536 && t_value !== (t_value = /*item*/ ctx[125].text + "")) set_data(t, t_value);

			if (dirty[0] & /*displayItems*/ 65536 && a_href_value !== (a_href_value = /*item*/ ctx[125].href)) {
				attr(a, "href", a_href_value);
			}
		},
		d(detaching) {
			if (detaching) detach(a);
			mounted = false;
			run_all(dispose);
		}
	};
}

// (1857:20) {#if item.desc}
function create_if_block_8(ctx) {
	let div;
	let t_value = /*item*/ ctx[125].desc + "";
	let t;
	let div_class_value;

	return {
		c() {
			div = element("div");
			t = text(t_value);
			attr(div, "class", div_class_value = "ss-item-desc " + (/*item*/ ctx[125].item_desc_class || ""));
		},
		m(target, anchor) {
			insert(target, div, anchor);
			append(div, t);
		},
		p(ctx, dirty) {
			if (dirty[0] & /*displayItems*/ 65536 && t_value !== (t_value = /*item*/ ctx[125].desc + "")) set_data(t, t_value);

			if (dirty[0] & /*displayItems*/ 65536 && div_class_value !== (div_class_value = "ss-item-desc " + (/*item*/ ctx[125].item_desc_class || ""))) {
				attr(div, "class", div_class_value);
			}
		},
		d(detaching) {
			if (detaching) detach(div);
		}
	};
}

// (1839:22) {:else}
function create_else_block_1(ctx) {
	let t_value = /*item*/ ctx[125].text + "";
	let t;

	return {
		c() {
			t = text(t_value);
		},
		m(target, anchor) {
			insert(target, t, anchor);
		},
		p(ctx, dirty) {
			if (dirty[0] & /*displayItems*/ 65536 && t_value !== (t_value = /*item*/ ctx[125].text + "")) set_data(t, t_value);
		},
		d(detaching) {
			if (detaching) detach(t);
		}
	};
}

// (1837:22) {#if multiple}
function create_if_block_7(ctx) {
	let t_value = /*translate*/ ctx[33]("clear") + "";
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

// (1806:14) {#if item.desc}
function create_if_block_5(ctx) {
	let div;
	let t_value = /*item*/ ctx[125].desc + "";
	let t;

	return {
		c() {
			div = element("div");
			t = text(t_value);
			attr(div, "class", "ss-item-desc");
		},
		m(target, anchor) {
			insert(target, div, anchor);
			append(div, t);
		},
		p(ctx, dirty) {
			if (dirty[0] & /*displayItems*/ 65536 && t_value !== (t_value = /*item*/ ctx[125].desc + "")) set_data(t, t_value);
		},
		d(detaching) {
			if (detaching) detach(div);
		}
	};
}

// (1795:8) {#each displayItems as item (item.id)}
function create_each_block(key_1, ctx) {
	let first;
	let if_block_anchor;

	function select_block_type_1(ctx, dirty) {
		if (/*item*/ ctx[125].separator) return create_if_block_3;
		if (/*item*/ ctx[125].disabled || /*item*/ ctx[125].placeholder) return create_if_block_4;
		return create_else_block;
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

// (1875:78) 
function create_if_block_2(ctx) {
	let div;

	return {
		c() {
			div = element("div");
			div.textContent = `${/*translate*/ ctx[33]("no_results")}`;
			attr(div, "class", "dropdown-item ss-message-item ss-item-muted");
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

// (1871:4) {#if fetchError}
function create_if_block_1(ctx) {
	let div;
	let t;

	return {
		c() {
			div = element("div");
			t = text(/*fetchError*/ ctx[24]);
			attr(div, "class", "dropdown-item border-top text-danger ss-message-item");
		},
		m(target, anchor) {
			insert(target, div, anchor);
			append(div, t);
		},
		p(ctx, dirty) {
			if (dirty[0] & /*fetchError*/ 16777216) set_data(t, /*fetchError*/ ctx[24]);
		},
		d(detaching) {
			if (detaching) detach(div);
		}
	};
}

// (1881:4) {#if selectionItems.length >= maxItems}
function create_if_block(ctx) {
	let div;
	let t0_value = /*translate*/ ctx[33]("max_limit") + "";
	let t0;
	let t1;
	let t2;
	let t3;

	return {
		c() {
			div = element("div");
			t0 = text(t0_value);
			t1 = text(" (");
			t2 = text(/*maxItems*/ ctx[10]);
			t3 = text(")");
			attr(div, "class", "dropdown-item border-top text-danger ss-message-item");
		},
		m(target, anchor) {
			insert(target, div, anchor);
			append(div, t0);
			append(div, t1);
			append(div, t2);
			append(div, t3);
		},
		p(ctx, dirty) {
			if (dirty[0] & /*maxItems*/ 1024) set_data(t2, /*maxItems*/ ctx[10]);
		},
		d(detaching) {
			if (detaching) detach(div);
		}
	};
}

function create_fragment(ctx) {
	let div3;
	let div0;
	let span;
	let each_blocks_1 = [];
	let each0_lookup = new Map();
	let t0;
	let i;
	let i_class_value;
	let div0_name_value;
	let div0_aria_owns_value;
	let div0_tabindex_value;
	let t1;
	let div2;
	let t2;
	let div1;
	let ul;
	let each_blocks = [];
	let each1_lookup = new Map();
	let ul_id_value;
	let ul_aria_activedescendant_value;
	let ul_aria_multiselectable_value;
	let t3;
	let t4;
	let div2_id_value;
	let div3_class_value;
	let mounted;
	let dispose;
	let each_value_1 = /*summaryItems*/ ctx[21];
	const get_key = ctx => /*item*/ ctx[125].id;

	for (let i = 0; i < each_value_1.length; i += 1) {
		let child_ctx = get_each_context_1(ctx, each_value_1, i);
		let key = get_key(child_ctx);
		each0_lookup.set(key, each_blocks_1[i] = create_each_block_1(key, child_ctx));
	}

	let if_block0 = /*typeahead*/ ctx[11] && create_if_block_11(ctx);
	let each_value = /*displayItems*/ ctx[16];
	const get_key_1 = ctx => /*item*/ ctx[125].id;

	for (let i = 0; i < each_value.length; i += 1) {
		let child_ctx = get_each_context(ctx, each_value, i);
		let key = get_key_1(child_ctx);
		each1_lookup.set(key, each_blocks[i] = create_each_block(key, child_ctx));
	}

	function select_block_type_5(ctx, dirty) {
		if (/*fetchError*/ ctx[24]) return create_if_block_1;
		if (/*typeahead*/ ctx[11] && /*actualCount*/ ctx[15] === 0 && /*previousFetch*/ ctx[29] && !/*activeFetch*/ ctx[28]) return create_if_block_2;
	}

	let current_block_type = select_block_type_5(ctx);
	let if_block1 = current_block_type && current_block_type(ctx);
	let if_block2 = /*selectionItems*/ ctx[18].length >= /*maxItems*/ ctx[10] && create_if_block(ctx);

	return {
		c() {
			div3 = element("div");
			div0 = element("div");
			span = element("span");

			for (let i = 0; i < each_blocks_1.length; i += 1) {
				each_blocks_1[i].c();
			}

			t0 = space();
			i = element("i");
			t1 = space();
			div2 = element("div");
			if (if_block0) if_block0.c();
			t2 = space();
			div1 = element("div");
			ul = element("ul");

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			t3 = space();
			if (if_block1) if_block1.c();
			t4 = space();
			if (if_block2) if_block2.c();
			toggle_class(span, "ss-summary-multiple", !/*summarySingle*/ ctx[20]);
			toggle_class(span, "ss-summary-single", /*summarySingle*/ ctx[20]);

			attr(i, "class", i_class_value = "ss-caret " + (/*showFetching*/ ctx[23]
			? FA_CARET_FETCHING
			: FA_CARET_DOWN));

			attr(i, "aria-hidden", "true");
			attr(div0, "class", "form-control ss-control");
			attr(div0, "name", div0_name_value = "ss_control_" + /*real*/ ctx[0].name);
			attr(div0, "role", "button");
			attr(div0, "aria-labelledby", /*labelId*/ ctx[7]);
			attr(div0, "aria-label", /*labelText*/ ctx[8]);
			attr(div0, "aria-expanded", /*popupVisible*/ ctx[25]);
			attr(div0, "aria-haspopup", "listbox");
			attr(div0, "aria-owns", div0_aria_owns_value = "" + (/*containerId*/ ctx[12] + "_popup"));
			attr(div0, "tabindex", div0_tabindex_value = /*disabled*/ ctx[31] ? "-1" : "0");
			attr(div0, "title", /*selectionTip*/ ctx[19]);
			attr(div0, "aria-disabled", /*disabled*/ ctx[31]);
			toggle_class(div0, "ss-disabled", /*disabled*/ ctx[31]);
			attr(ul, "class", "ss-item-list");
			attr(ul, "id", ul_id_value = "" + (/*containerId*/ ctx[12] + "_items"));
			attr(ul, "role", "listbox");
			attr(ul, "aria-expanded", /*popupVisible*/ ctx[25]);
			attr(ul, "aria-hidden", "false");

			attr(ul, "aria-activedescendant", ul_aria_activedescendant_value = !/*multiple*/ ctx[30] && /*selectionItems*/ ctx[18].length
			? `${/*containerId*/ ctx[12]}_item_${/*selectionItems*/ ctx[18][0].id}`
			: null);

			attr(ul, "aria-multiselectable", ul_aria_multiselectable_value = /*multiple*/ ctx[30] ? "true" : null);
			attr(div1, "class", "ss-result");
			attr(div2, "class", "dropdown-menu ss-popup");
			attr(div2, "id", div2_id_value = "" + (/*containerId*/ ctx[12] + "_popup"));
			toggle_class(div2, "show", /*popupVisible*/ ctx[25]);
			toggle_class(div2, "ss-popup-fixed", /*popupFixed*/ ctx[9]);
			toggle_class(div2, "ss-popup-top", /*popupTop*/ ctx[26] && !/*popupFixed*/ ctx[9]);
			toggle_class(div2, "ss-popup-left", /*popupLeft*/ ctx[27] && !/*popupFixed*/ ctx[9]);
			toggle_class(div2, "ss-popup-fixed-top", /*popupTop*/ ctx[26] && /*popupFixed*/ ctx[9]);
			toggle_class(div2, "ss-popup-fixed-left", /*popupLeft*/ ctx[27] && /*popupFixed*/ ctx[9]);
			attr(div3, "class", div3_class_value = "form-control ss-container " + (/*styles*/ ctx[32].container_class || ""));
			attr(div3, "id", /*containerId*/ ctx[12]);
			attr(div3, "name", /*containerName*/ ctx[13]);
		},
		m(target, anchor) {
			insert(target, div3, anchor);
			append(div3, div0);
			append(div0, span);

			for (let i = 0; i < each_blocks_1.length; i += 1) {
				each_blocks_1[i].m(span, null);
			}

			append(div0, t0);
			append(div0, i);
			/*div0_binding*/ ctx[48](div0);
			append(div3, t1);
			append(div3, div2);
			if (if_block0) if_block0.m(div2, null);
			append(div2, t2);
			append(div2, div1);
			append(div1, ul);

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(ul, null);
			}

			/*ul_binding*/ ctx[51](ul);
			/*div1_binding*/ ctx[52](div1);
			append(div2, t3);
			if (if_block1) if_block1.m(div2, null);
			append(div2, t4);
			if (if_block2) if_block2.m(div2, null);
			/*div2_binding*/ ctx[53](div2);
			/*div3_binding*/ ctx[54](div3);

			if (!mounted) {
				dispose = [
					listen(div0, "blur", /*handleBlur*/ ctx[34]),
					listen(div0, "keydown", /*handleToggleKeydown*/ ctx[39]),
					listen(div0, "keyup", /*handleToggleKeyup*/ ctx[40]),
					listen(div0, "click", /*handleToggleClick*/ ctx[41]),
					listen(div1, "scroll", /*handleResultScroll*/ ctx[45])
				];

				mounted = true;
			}
		},
		p(ctx, dirty) {
			if (dirty[0] & /*summaryItems, summarySingle*/ 3145728 | dirty[1] & /*handleToggleLinkClick*/ 2048) {
				const each_value_1 = /*summaryItems*/ ctx[21];
				each_blocks_1 = update_keyed_each(each_blocks_1, dirty, get_key, 1, ctx, each_value_1, each0_lookup, span, destroy_block, create_each_block_1, null, get_each_context_1);
			}

			if (dirty[0] & /*summarySingle*/ 1048576) {
				toggle_class(span, "ss-summary-multiple", !/*summarySingle*/ ctx[20]);
			}

			if (dirty[0] & /*summarySingle*/ 1048576) {
				toggle_class(span, "ss-summary-single", /*summarySingle*/ ctx[20]);
			}

			if (dirty[0] & /*showFetching*/ 8388608 && i_class_value !== (i_class_value = "ss-caret " + (/*showFetching*/ ctx[23]
			? FA_CARET_FETCHING
			: FA_CARET_DOWN))) {
				attr(i, "class", i_class_value);
			}

			if (dirty[0] & /*real*/ 1 && div0_name_value !== (div0_name_value = "ss_control_" + /*real*/ ctx[0].name)) {
				attr(div0, "name", div0_name_value);
			}

			if (dirty[0] & /*labelId*/ 128) {
				attr(div0, "aria-labelledby", /*labelId*/ ctx[7]);
			}

			if (dirty[0] & /*labelText*/ 256) {
				attr(div0, "aria-label", /*labelText*/ ctx[8]);
			}

			if (dirty[0] & /*popupVisible*/ 33554432) {
				attr(div0, "aria-expanded", /*popupVisible*/ ctx[25]);
			}

			if (dirty[0] & /*containerId*/ 4096 && div0_aria_owns_value !== (div0_aria_owns_value = "" + (/*containerId*/ ctx[12] + "_popup"))) {
				attr(div0, "aria-owns", div0_aria_owns_value);
			}

			if (dirty[1] & /*disabled*/ 1 && div0_tabindex_value !== (div0_tabindex_value = /*disabled*/ ctx[31] ? "-1" : "0")) {
				attr(div0, "tabindex", div0_tabindex_value);
			}

			if (dirty[0] & /*selectionTip*/ 524288) {
				attr(div0, "title", /*selectionTip*/ ctx[19]);
			}

			if (dirty[1] & /*disabled*/ 1) {
				attr(div0, "aria-disabled", /*disabled*/ ctx[31]);
			}

			if (dirty[1] & /*disabled*/ 1) {
				toggle_class(div0, "ss-disabled", /*disabled*/ ctx[31]);
			}

			if (/*typeahead*/ ctx[11]) {
				if (if_block0) {
					if_block0.p(ctx, dirty);
				} else {
					if_block0 = create_if_block_11(ctx);
					if_block0.c();
					if_block0.m(div2, t2);
				}
			} else if (if_block0) {
				if_block0.d(1);
				if_block0 = null;
			}

			if (dirty[0] & /*displayItems, containerId, selectionById, multiple*/ 1073942528 | dirty[1] & /*handleOptionClick, translate, handleOptionLinkClick*/ 12292) {
				const each_value = /*displayItems*/ ctx[16];
				each_blocks = update_keyed_each(each_blocks, dirty, get_key_1, 1, ctx, each_value, each1_lookup, ul, destroy_block, create_each_block, null, get_each_context);
			}

			if (dirty[0] & /*containerId*/ 4096 && ul_id_value !== (ul_id_value = "" + (/*containerId*/ ctx[12] + "_items"))) {
				attr(ul, "id", ul_id_value);
			}

			if (dirty[0] & /*popupVisible*/ 33554432) {
				attr(ul, "aria-expanded", /*popupVisible*/ ctx[25]);
			}

			if (dirty[0] & /*multiple, selectionItems, containerId*/ 1074008064 && ul_aria_activedescendant_value !== (ul_aria_activedescendant_value = !/*multiple*/ ctx[30] && /*selectionItems*/ ctx[18].length
			? `${/*containerId*/ ctx[12]}_item_${/*selectionItems*/ ctx[18][0].id}`
			: null)) {
				attr(ul, "aria-activedescendant", ul_aria_activedescendant_value);
			}

			if (dirty[0] & /*multiple*/ 1073741824 && ul_aria_multiselectable_value !== (ul_aria_multiselectable_value = /*multiple*/ ctx[30] ? "true" : null)) {
				attr(ul, "aria-multiselectable", ul_aria_multiselectable_value);
			}

			if (current_block_type === (current_block_type = select_block_type_5(ctx)) && if_block1) {
				if_block1.p(ctx, dirty);
			} else {
				if (if_block1) if_block1.d(1);
				if_block1 = current_block_type && current_block_type(ctx);

				if (if_block1) {
					if_block1.c();
					if_block1.m(div2, t4);
				}
			}

			if (/*selectionItems*/ ctx[18].length >= /*maxItems*/ ctx[10]) {
				if (if_block2) {
					if_block2.p(ctx, dirty);
				} else {
					if_block2 = create_if_block(ctx);
					if_block2.c();
					if_block2.m(div2, null);
				}
			} else if (if_block2) {
				if_block2.d(1);
				if_block2 = null;
			}

			if (dirty[0] & /*containerId*/ 4096 && div2_id_value !== (div2_id_value = "" + (/*containerId*/ ctx[12] + "_popup"))) {
				attr(div2, "id", div2_id_value);
			}

			if (dirty[0] & /*popupVisible*/ 33554432) {
				toggle_class(div2, "show", /*popupVisible*/ ctx[25]);
			}

			if (dirty[0] & /*popupFixed*/ 512) {
				toggle_class(div2, "ss-popup-fixed", /*popupFixed*/ ctx[9]);
			}

			if (dirty[0] & /*popupTop, popupFixed*/ 67109376) {
				toggle_class(div2, "ss-popup-top", /*popupTop*/ ctx[26] && !/*popupFixed*/ ctx[9]);
			}

			if (dirty[0] & /*popupLeft, popupFixed*/ 134218240) {
				toggle_class(div2, "ss-popup-left", /*popupLeft*/ ctx[27] && !/*popupFixed*/ ctx[9]);
			}

			if (dirty[0] & /*popupTop, popupFixed*/ 67109376) {
				toggle_class(div2, "ss-popup-fixed-top", /*popupTop*/ ctx[26] && /*popupFixed*/ ctx[9]);
			}

			if (dirty[0] & /*popupLeft, popupFixed*/ 134218240) {
				toggle_class(div2, "ss-popup-fixed-left", /*popupLeft*/ ctx[27] && /*popupFixed*/ ctx[9]);
			}

			if (dirty[0] & /*containerId*/ 4096) {
				attr(div3, "id", /*containerId*/ ctx[12]);
			}

			if (dirty[0] & /*containerName*/ 8192) {
				attr(div3, "name", /*containerName*/ ctx[13]);
			}
		},
		i: noop,
		o: noop,
		d(detaching) {
			if (detaching) detach(div3);

			for (let i = 0; i < each_blocks_1.length; i += 1) {
				each_blocks_1[i].d();
			}

			/*div0_binding*/ ctx[48](null);
			if (if_block0) if_block0.d();

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].d();
			}

			/*ul_binding*/ ctx[51](null);
			/*div1_binding*/ ctx[52](null);

			if (if_block1) {
				if_block1.d();
			}

			if (if_block2) if_block2.d();
			/*div2_binding*/ ctx[53](null);
			/*div3_binding*/ ctx[54](null);
			mounted = false;
			run_all(dispose);
		}
	};
}

const I18N_DEFAULTS = {
	clear: "Clear",
	no_results: "No results",
	max_limit: "Max limit reached",
	selected_count: "selected",
	selected_more: "more",
	typeahead_input: "Search for..."
};

const STYLE_DEFAULTS = { container_class: "" };
const BLANK_ID = "";
const FIXED_SORT_KEY = "_";
const FETCH_INDICATOR_DELAY = 150;
const FA_CARET_DOWN = "fas fa-caret-down";
const FA_CARET_FETCHING = "far fa-hourglass";
const FA_SELECTED = "far fa-check-square";
const FA_NOT_SELECTED = "far fa-square";

const META_KEYS = {
	// Modifiers
	Control: true,
	Shift: true,
	Alt: true,
	AltGraph: true,
	Meta: true,
	// Special keys
	ContextMenu: true,
	PrintScreen: true,
	ScrollLock: true,
	Pause: true,
	CapsLock: true,
	Numlock: true,
	// Nav keys
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
	// Ignore function keys
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

const MUTATIONS = { childList: true, attributes: true };
let uidBase = 0;

function nop() {
	
}



function nextUID() {
	uidBase++;
	return uidBase;
}



function hasModifier(event) {
	return event.altKey || event.ctrlKey || event.metaKey || event.shiftKey;
}

function isMetaKey(event) {
	return META_KEYS[event.key] || META_KEYS[event.code];
}

/**
 * NOTE 0 and "0" are non blank ids
 */
function isBlankId(id) {
	return id !== 0 && id !== "0" && (id == null || id == BLANK_ID);
}

/**
 * Normalize id value
 */
function normalizeId(id) {
	return isBlankId(id) ? BLANK_ID : id.toString();
}

function toUnderscore(key) {
	return key.split(/(?=[A-Z])/).join("_").toLowerCase();
}

function toDash(key) {
	return key.replace(/_/g, "-");
}

function createItemFromOption(el, styles, baseHref) {
	let ds = el.dataset;

	let item = {
		id: normalizeId(el.value),
		text: el.text || ""
	};

	if (ds) {
		item.sort_key = ds.sortKey || null;

		if (ds.itemSeparator !== undefined) {
			item.separator = true;
		}

		if (ds.itemSummary != null) {
			item.summary = ds.itemSummary;
		}

		item.desc = ds.itemDesc || null;
		item.action = ds.itemAction || null;
		item.item_class = ds.itemClass || null;
		item.item_text_class = ds.itemTextClass || null;
		item.item_desc_class = ds.itemDescClass || null;
		item.href = ds.itemHref || null;
		item.data = {};

		Object.keys(ds).forEach(function (key) {
			item.data[toUnderscore(key)] = ds[key];
		});
	}

	if (item.sort_key == null) {
		item.sort_key = item.text;
	}

	if (!item.separator) {
		if (isBlankId(item.id)) {
			item.blank = true;
		} else {
			if (!item.action && !item.href && baseHref) {
				item.href = baseHref.replace(/:id/, item.id);
			}
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

	if (item.item_text_class) {
		el.setAttribute("data-item-text-class", item.item_class);
	}

	if (item.item_desc_class) {
		el.setAttribute("data-item-desc-class", item.item_class);
	}

	if (item.action) {
		el.setAttribute("data-item-action", item.action);
	}

	if (item.summary) {
		el.setAttribute("data-item-summary", item.desc);
	}

	if (item.data) {
		Object.keys(item.data).forEach(function (key) {
			el.setAttribute(`data-${toDash(key)}`, item.data[key]);
		});
	}

	el.textContent = item.text;
	return el;
}

function createDisplay(data) {
	let byId = {};
	let items = [];
	let blankItem = null;
	let query = (data.query || "").trim();
	let fixedItems = data.fixedItems || [];
	let fetchedItems = data.fetchedItems || [];
	let selectionItems = data.selectionItems || [];

	fixedItems.forEach(function (item) {
		if (byId[item.id]) {
			console.warn("DUPLICATE: fixed", item);
			return;
		}

		items.push(item);

		if (!item.separator) {
			byId[item.id] = item;
		}
	});

	let filteredSelection = [];
	let filteredFetched = [];

	if (data.multiple && !query) {
		selectionItems.forEach(function (item) {
			if (byId[item.id]) {
				// NOTE KI "placeholder" is pushed into fixed items; don't complain about it
				if (!item.blank) {
					console.warn("DUPLICATE: selected", item);
				}

				return;
			}

			filteredSelection.push(item);

			if (!item.separator) {
				byId[item.id] = item;
			}
		});
	}

	fetchedItems.forEach(function (item) {
		if (byId[item.id]) {
			console.warn("DUPLICATE: fetched", item);
			return;
		}

		filteredFetched.push(item);

		if (!item.separator) {
			byId[item.id] = item;
		}
	});

	if (data.typeahead && items.length && filteredSelection.length && filteredFetched.length) {
		items.push({ id: "fixed_sep", separator: true });
	}

	filteredSelection.forEach(function (item) {
		items.push(item);
	});

	if (filteredSelection.length && filteredFetched.length) {
		items.push({ id: "selection_sep", separator: true });
	}

	filteredFetched.forEach(function (item) {
		items.push(item);
	});

	items.forEach(function (item) {
		if (item.blank) {
			blankItem = item;
		}
	});

	return {
		blankItem,
		byId,
		displayItems: items,
		dirty: false
	};
}



function createResult(data) {
	let fetchedItems = data.fetchedItems || [];

	fetchedItems.forEach(function (item) {
		item.id = normalizeId(item.id);

		if (isBlankId(item.id)) {
			item.blank = true;
		}

		if (item.text == null) {
			item.text = "";
		}

		if (item.sort_key == null) {
			item.sort_key = item.text;
		}
	});

	let counts = calculateCounts(fetchedItems);
	let more = data.more === true && counts.offsetCount > 0 && !data.fetchedId;

	return {
		fetchedItems,
		offsetCount: counts.offsetCount,
		actualCount: counts.actualCount,
		more
	};
}

function calculateCounts(items) {
	let act = 0;
	let off = 0;

	items.forEach(function (item) {
		if (item.separator) ; else if (item.blank) ; else if (item.placeholder) {
			// NOTE KI does not affect pagination
			act += 1; // NOTE KI separator is ignored always
			//NOTE KI dummy items ignored
		} else {
			// NOTE KI normal or disabled affects pagination
			off += 1;

			act += 1;
		}
	});

	return { offsetCount: off, actualCount: act };
}

function handleToggleLinkMouseDown(event) {
	event.preventDefault();
}

/**
 * NOTE KI blocks undesired blur in option select
 */
function handleOptionMouseDown(event) {
	event.preventDefault();
}

function handleOptionLinkMouseDown(event) {
	event.preventDefault();
}

function instance($$self, $$props, $$invalidate) {
	let { real } = $$props;
	let { config = {} } = $$props;
	let containerEl;
	let inputEl;
	let toggleEl;
	let popupEl;
	let resultEl;
	let optionsEl;
	let labelId = null;
	let labelText = null;
	const mutationObserver = new MutationObserver(handleMutation);
	let resizeObserver = null;
	let windowScrollListener = null;
	let setupDone = false;
	let translations = {};
	let styles = {};
	let popupFixed = false;
	let debugMode = false;
	let fetcher = inlineFetcher;
	let remote = false;
	let maxItems = 100;
	let typeahead = false;
	let summaryLen = 2;
	let summaryWrap = false;
	let noCache = false;
	let placeholderItem = { id: BLANK_ID, text: "", blank: true };
	let baseHref = null;
	let mounted = false;
	let containerId = null;
	let containerName = null;
	let query = "";
	let fixedItems = [];
	let result = createResult({});
	let actualCount = 0;
	let hasMore = false;
	let display = createDisplay({});
	let displayItems = [];
	let selectionById = {};
	let selectionItems = [];
	let selectionTip = "";
	let summarySingle = true;
	let summaryItems = [];
	let activeId = null;
	let showFetching = false;
	let fetchingMore = false;
	let fetchError = null;
	let popupVisible = false;
	let popupTop = false;
	let popupLeft = false;
	let activeFetch = null;
	let previousFetch = null;
	let previousQuery = null;
	let multiple = false;
	let disabled = false;
	let isSyncToReal = false;

	function selectItem(id) {
		return fetchItems(false, id).then(function (response) {
			selectItemImpl(id);
		});
	}

	////////////////////////////////////////////////////////////
	// Utils
	function translate(key) {
		return translations[key];
	}

	function clearQuery() {
		$$invalidate(14, query = "");

		if (noCache) {
			previousQuery = null;
		}
	}

	function focusToggle() {
		if (disabled) {
			return;
		}

		if (document.activeElement !== toggleEl) {
			toggleEl.focus();
		}
	}

	/**
 * @return true if opened, false if was already open
 */
	function openPopup() {
		if (popupVisible) {
			return false;
		}

		$$invalidate(25, popupVisible = true);
		let w = containerEl.offsetWidth;
		$$invalidate(4, popupEl.style.minWidth = w + "px", popupEl);
		updatePopupPosition();

		if (!windowScrollListener) {
			windowScrollListener = handleWindowScroll;
			window.addEventListener("scroll", windowScrollListener);
		}

		return true;
	}

	function closePopup(focus) {
		$$invalidate(25, popupVisible = false);

		if (windowScrollListener) {
			window.removeEventListener("scroll", windowScrollListener);
			windowScrollListener = null;
		}

		updateDisplay();

		if (focus) {
			focusToggle();
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
			if (!item.blank) {
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

		updateSelection(byId);

		if (!multiple || item.blank) {
			clearQuery();
			closePopup(true);
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

		closePopup(true);
		real.dispatchEvent(new CustomEvent("select-action", { detail: item }));
	}

	function selectElement(el) {
		if (!el) {
			// NOTE KI "blank" selected
			closePopup(true);

			return;
		}

		if (el.dataset.action) {
			executeAction(el.dataset.id);
		} else {
			selectItemImpl(el.dataset.id);

			if (el.dataset.selected) ; //             selectionDropdownItems = selectionDropdownItems;
		}
	}

	function containsActiveElement(el) {
		return toggleEl === el || inputEl === el;
	}

	////////////////////////////////////////////////////////////
	// sync/update
	//
	function syncFromRealSelection() {
		if (isSyncToReal) {
			return;
		}

		let oldById = selectionById;
		let byId = {};
		let options = real.selectedOptions;

		for (let i = options.length - 1; i >= 0; i--) {
			let el = options[i];
			let id = normalizeId(el.value);
			let item = oldById[id];

			if (!item) {
				item = createItemFromOption(el, styles, baseHref);
			}

			byId[item.id] = item;
		}

		updateSelection(byId);
	}

	function syncToRealSelection() {
		let changed = false;
		mutationObserver.disconnect();

		// Insert missing values
		// NOTE KI all existing values are *assumed* to be in sync data-attr wise
		if (remote) {
			selectionItems.forEach(function (item) {
				if (multiple && item.blank) {
					// NOTE KI no "blank" item in multiselection
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
			let id = normalizeId(el.value);
			let selected = !!selectionById[id];
			changed = changed || el.selected !== selected;

			if (selected) {
				el.setAttribute("selected", "");
				el.selected = true;
			} else {
				el.removeAttribute("selected");
				el.selected = false;
			}
		}

		mutationObserver.observe(real, MUTATIONS);

		if (changed) {
			try {
				isSyncToReal = true;
				real.dispatchEvent(new Event("change"));
			} finally {
				isSyncToReal = false;
			}
		}
	}

	function syncFromRealDisabled() {
		$$invalidate(31, disabled = real.disabled);

		if (disabled) {
			closePopup();
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

			// NOTE KI pick "blank" and "fixed" items
			if (isBlankId(el.value) || el.dataset.itemFixed != null) {
				let item = createItemFromOption(el, styles, baseHref);
				item.sort_key = FIXED_SORT_KEY + item.sort_key;
				item.fixed = true;
				byId[item.id] = item;
				items.push(item);
			}
		}

		let blankItem = byId[BLANK_ID];

		if (blankItem) {
			blankItem.blank = true;
		}

		fixedItems = items;
	}

	function updateDisplay() {

		if (!display.dirty) {
			return;
		}

		display = createDisplay({
			query,
			typeahead,
			multiple,
			fixedItems,
			fetchedItems: result.fetchedItems,
			selectionItems
		});

		$$invalidate(16, displayItems = display.displayItems);
	}

	function appendFetchedToDisplay(fetchedItems) {
		let byId = display.byId;
		let items = display.displayItems;

		fetchedItems.forEach(function (item) {
			if (byId[item.id]) {
				console.warn("DUPLICATE: fetched-append", item);
				return;
			}

			items.push(item);

			if (!item.separator) {
				byId[item.id] = item;
			}
		});

		$$invalidate(16, displayItems = display.displayItems);
	}

	function updateSelection(byId) {
		let items = Object.values(byId);

		if (items.length === 0) {
			let blankItem = display.blankItem || placeholderItem;
			byId = { [blankItem.id]: blankItem };
			items = [blankItem];
		}

		$$invalidate(17, selectionById = byId);

		$$invalidate(18, selectionItems = items.sort(function (a, b) {
			return a.sort_key.localeCompare(b.sort_key);
		}));

		let tip = selectionItems.map(function (item) {
			return item.text;
		}).join(", ");

		let len = selectionItems.length;

		if (len > 1) {
			$$invalidate(21, summaryItems = selectionItems.slice(0, summaryLen));

			if (summaryItems.length < len) {
				summaryItems.push({
					id: "more",
					text: `${len - summaryLen} ${translate("selected_more")}`,
					item_class: "ss-summary-more"
				});
			}

			$$invalidate(19, selectionTip = `${len} ${translate("selected_count")}: ${tip}`);
		} else {
			$$invalidate(21, summaryItems = selectionItems);

			if (summaryItems[0].blank) {
				$$invalidate(19, selectionTip = "");
			} else {
				$$invalidate(19, selectionTip = summaryItems[0].text);
			}
		}

		$$invalidate(20, summarySingle = summaryItems[0].blank || !multiple);
		display.dirty = true;
	}

	function reload() {
		if (isSyncToReal) {
			return;
		}

		updateFixedItems();
		syncFromRealSelection();
		syncFromRealDisabled();
		result = createResult({});
		display.dirty = true;
		updateDisplay();
		previousQuery = null;

		// NOTE KI need to force refetch immediately (or lazily in popup open)
		if (popupVisible) {
			fetchItems(false, null);
		}
	}

	////////////////////////////////////////////////////////////
	// Fetch
	//
	function inlineFetcher(offset, query) {

		function createItems() {
			let pattern = query.toUpperCase().trim();
			let matchedItems = [];
			let options = real.options;

			for (let i = 0; i < options.length; i++) {
				let item = createItemFromOption(options[i], styles, baseHref);
				let match;

				// NOTE KI "blank" is handled as fixed item
				if (item.blank) {
					match = false;
				} else {
					match = item.separator || item.text.toUpperCase().includes(pattern) || item.desc && item.desc.toUpperCase().includes(pattern);
				}

				if (match) {
					matchedItems.push(item);
				}
			}

			let wasSeparator = true;
			let lastSeparator = null;
			let items = [];

			matchedItems.forEach(function (item) {
				if (item.separator) {
					lastSeparator = item;
				} else {
					if (lastSeparator && !wasSeparator) {
						items.push(lastSeparator);
						lastSeparator = null;
					}

					items.push(item);
					wasSeparator = false;
				}
			});

			return items;
		}

		return Promise.resolve({
			items: createItems(),
			info: { more: false }
		});
	}

	/**
 * @return Promise
 */
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
		$$invalidate(24, fetchError = null);
		$$invalidate(23, showFetching = false);
		let currentFetchingMore = fetchingMore;

		let currentFetch = fetcher(currentFetchOffset, currentQuery, fetchId).then(function (response) {
			if (currentFetch === activeFetch) {
				let responseItems = response.items || [];
				let info = response.info || {};
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
				$$invalidate(15, actualCount = result.actualCount);
				hasMore = result.more;

				if (currentFetchingMore) {
					appendFetchedToDisplay(responseItems);
				} else {
					display.dirty = true;
					updateDisplay();
				}

				if (fetchId) {
					previousQuery = null;
				} else {
					previousQuery = currentQuery;
				}

				$$invalidate(29, previousFetch = currentFetch);
				$$invalidate(28, activeFetch = null);
				fetchingMore = false;
				$$invalidate(23, showFetching = false);

				setTimeout(function () {
					fetchMoreIfneeded();
				});
			}
		}).catch(function (err) {
			if (currentFetch === activeFetch) {
				console.error(err);
				$$invalidate(24, fetchError = err);
				let result = createResult({});
				$$invalidate(15, actualCount = result.actualCount);
				hasMore = result.more;
				display.dirty = true;
				updateDisplay();
				previousQuery = null;
				$$invalidate(29, previousFetch = currentFetch);
				$$invalidate(28, activeFetch = null);
				fetchingMore = false;
				$$invalidate(23, showFetching = false);
				focusToggle();
				openPopup();
			}
		});

		setTimeout(
			function () {
				if (activeFetch === currentFetch) {
					$$invalidate(23, showFetching = true);
				}
			},
			FETCH_INDICATOR_DELAY
		);

		$$invalidate(28, activeFetch = currentFetch);
		$$invalidate(29, previousFetch = null);
		return currentFetch;
	}

	function cancelFetch() {
		if (activeFetch !== null) {
			$$invalidate(28, activeFetch = null);

			// no result fetched; since it doesn't match input any longer
			previousQuery = null;

			$$invalidate(23, showFetching = false);
		}
	}

	function fetchMoreIfneeded() {
		if (hasMore && !fetchingMore && popupVisible) {
			let lastItem = optionsEl.querySelector(".ss-item:last-child");

			if (resultEl.scrollTop + resultEl.clientHeight >= resultEl.scrollHeight - lastItem.clientHeight * 2 - 2) {
				fetchItems(true);
			}
		}
	}

	onMount(function () {
		// Initial selection
		syncFromRealSelection();

		syncFromRealDisabled();

		Object.keys(eventListeners).forEach(function (ev) {
			real.addEventListener(ev, eventListeners[ev]);
		});

		$$invalidate(66, mounted = true);
	});

	beforeUpdate(function () {
		if (!setupDone) {
			setupComponent();
			setupDone = true;
		}
	});

	afterUpdate(function () {
		if (popupFixed && !resizeObserver) {
			resizeObserver = new ResizeObserver(handleResize);
			resizeObserver.observe(containerEl, {});
		}

		updatePopupPosition();
	});

	function setupComponent() {
		real.classList.add("ss-select-hidden");
		real.setAttribute("tabindex", "-1");
		real.setAttribute("aria-hidden", "true");
		$$invalidate(30, multiple = real.multiple);
		let ds = real.dataset;
		let baseId = real.id || nextUID();
		$$invalidate(12, containerId = `ss_container_${baseId}`);
		$$invalidate(13, containerName = real.name ? `ss_container_${real.name}` : null);

		if (config.remote) {
			remote = true;
			fetcher = config.fetcher;
		}

		debugMode = ds.ssDebugMode !== undefined ? true : debugMode;
		$$invalidate(11, typeahead = ds.ssTypeahead !== undefined ? true : typeahead);

		$$invalidate(10, maxItems = ds.ssMaxItems !== undefined
		? parseInt(ds.ssMaxItems, 10)
		: maxItems);

		summaryLen = ds.ssSummaryLen !== undefined
		? parseInt(ds.ssSummaryLen, 10)
		: summaryLen;

		summaryWrap = ds.ssSummaryWrap !== undefined ? true : summaryWrap;
		baseHref = ds.ssBaseHref != undefined ? ds.ssBaseHref : baseHref;
		noCache = ds.ssNoCache !== undefined ? true : noCache;
		$$invalidate(9, popupFixed = ds.ssPopupFixed !== undefined ? true : popupFixed);

		debugMode = config.debugMode !== undefined
		? config.debugMode
		: debugMode;

		$$invalidate(11, typeahead = config.typeahead !== undefined
		? config.typeahead
		: typeahead);

		$$invalidate(10, maxItems = config.maxItems || maxItems);
		summaryLen = config.summaryLen || summaryLen;

		summaryWrap = config.summaryWrap !== undefined
		? config.summaryWrap
		: summaryWrap;

		baseHref = config.baseHref || baseHref;
		noCache = config.noCache !== undefined ? config.noCache : noCache;

		$$invalidate(9, popupFixed = config.popupFixed !== undefined
		? config.popupFixed
		: popupFixed);

		Object.assign(translations, I18N_DEFAULTS);

		if (config.translations) {
			Object.assign(translations, config.translations);
		}

		Object.assign(styles, STYLE_DEFAULTS);

		if (config.styles) {
			Object.assign(styles, config.styles);
		}

		$$invalidate(10, maxItems = config.maxItems || maxItems);
		placeholderItem.text = config.placeholder || "";

		if (jQuery.tooltip) {
			jQuery(toggleEl).tooltip();
		}

		mutationObserver.observe(real, MUTATIONS);
		bindLabel();
		updateFixedItems();
		display.dirty = true;
		updateDisplay();
	}

	function bindLabel() {
		if (real.id) {
			let label = document.querySelector(`[for="${real.id}"]`);

			if (label) {
				label.id = label.id || `ss_label_${real.id}`;
				$$invalidate(7, labelId = label.id);
			}
		}

		if (!labelId) {
			$$invalidate(8, labelText = real.getAttribute("aria-label") || null);
		}
	}

	function handleMutation(mutationsList, observer) {
		for (let mutation of mutationsList) {
			if (mutation.type === "childList") {
				reload();
			} else if (mutation.type === "attributes") {
				if (mutation.attributeName === "disabled") {
					syncFromRealDisabled();
				}
			}
		}
	}

	function handleResize(resizeList, observer) {
		updatePopupPosition();
	}

	let eventListeners = {
		change(event) {

			if (!isSyncToReal) {
				syncFromRealSelection();
			}
		},
		"select-reload"(event) {
			reload();
		},
		"focus"(event) {
			focusToggle();
		}
	};

	function findActiveOption() {
		return optionsEl.querySelector(".ss-item-active");
	}

	function findFirstOption() {
		let children = optionsEl.children;
		return children[0];
	}

	function findInitialOption() {
		return multiple ? findInitialDynamic() : findInitialSimple();
	}

	function findInitialSimple() {
		let selectedId = selectionItems[0].id;
		return optionsEl.querySelector(`.ss-js-item[data-id="${selectedId}"`);
	}

	function findInitialDynamic() {
		return optionsEl.querySelectorAll(".ss-js-item")[0];
	}

	function updatePopupPosition() {
		if (!popupVisible) {
			return;
		}

		let bounds = containerEl.getBoundingClientRect();
		let middleY = window.innerHeight / 2;
		let middleX = window.innerWidth / 2;
		$$invalidate(26, popupTop = bounds.y > middleY);
		$$invalidate(27, popupLeft = bounds.x + bounds.width > middleX);

		if (popupFixed) {
			let popupBounds = popupEl.getBoundingClientRect();

			if (popupTop) {
				$$invalidate(4, popupEl.style.top = `${bounds.y - popupBounds.height}px`, popupEl);
			} else {
				$$invalidate(4, popupEl.style.top = `${bounds.y + bounds.height}px`, popupEl);
			}

			if (popupLeft) {
				$$invalidate(4, popupEl.style.left = `${bounds.x + bounds.width - popupBounds.width}px`, popupEl);
			} else {
				$$invalidate(4, popupEl.style.left = `${bounds.x}px`, popupEl);
			}
		}
	}

	////////////////////////////////////////////////////////////
	// Handlers
	//
	let toggleKeydownHandlers = {
		base(event) {
			if (!popupVisible || isMetaKey(event)) {
				return;
			}

			if (typeahead) {
				inputEl.focus();
			} else {
				activateNextByKey(event.key);
			}
		},
		ArrowDown(event) {
			if (openPopup()) {
				fetchItems().then(function () {
					let next = findInitialOption();

					if (next) {
						activateOption(next);
					}
				});
			} else {
				if (!fetchingMore) {
					activateArrowDown(event);
				}
			}

			event.preventDefault();
		},
		ArrowUp(event) {
			if (openPopup()) {
				fetchItems().then(function () {
					activateOption(findInitialOption());
				});
			} else {
				activateArrowUp(event);
			}

			event.preventDefault();
		},
		PageUp(event) {
			activatePageUp(event);
		},
		PageDown(event) {
			activatePageDown(event);
		},
		Home(event) {
			activateHome(event);
		},
		End(event) {
			activateEnd(event);
		},
		Enter(event) {
			if (hasModifier(event)) {
				return;
			}

			if (popupVisible) {
				selectElement(findActiveOption());
			} else {
				if (openPopup()) {
					fetchItems(false).then(function () {
						activateOption(findInitialOption());
					});
				}
			}

			event.preventDefault();
		},
		Space(event) {
			if (hasModifier(event)) {
				return;
			}

			if (popupVisible) {
				selectElement(findActiveOption());
			} else {
				if (openPopup()) {
					fetchItems(false).then(function () {
						activateOption(findInitialOption());
					});
				}
			}

			event.preventDefault();
		},
		Escape(event) {
			cancelFetch();
			clearQuery();
			closePopup(false);
		},
		Delete(event) {
			selectItem(BLANK_ID);
		}
	};

	let toggleKeyupHandlers = { base: nop };

	let inputKeypressHandlers = {
		base(event) {
			
		}
	};

	let inputKeydownHandlers = {
		base: nop,
		ArrowUp: activateArrowUp,
		ArrowDown: activateArrowDown,
		PageUp: activatePageUp,
		PageDown: activatePageDown,
		Home: activateHome,
		End: activateEnd,
		Enter(event) {
			if (!hasModifier(event)) {
				selectElement(findActiveOption());
				event.preventDefault();
			}
		},
		Escape(event) {
			cancelFetch();
			clearQuery();
			closePopup(true);
		},
		Tab(event) {
			focusToggle();
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

	function activateNextByKey(ch) {
		ch = ch.toUpperCase();
		let nodes = optionsEl.querySelectorAll(".ss-js-item");
		let curr = findActiveOption() || findFirstOption();

		if (curr.classList.contains("ss-js-item")) {
			curr = curr.nextElementSibling;
		} else {
			curr = null;
		}

		if (!curr) {
			curr = nodes[0];
		}
		let found = false;
		let idx = 0;

		while (curr && !found && idx < nodes.length) {
			let item = curr.dataset && display.byId[curr.dataset.id];
			found = item && item.text && item.text.toUpperCase().startsWith(ch);
			idx++;

			if (!found) {
				curr = curr.nextElementSibling;

				if (!curr) {
					curr = nodes[0];
				}
			}
		}

		if (idx >= nodes.length) {
			curr = null;
		}

		activateOption(curr);
	}

	function activateOption(el, old) {
		if (!el) {
			$$invalidate(22, activeId = null);
			return;
		}

		old = old || findActiveOption();

		if (old && old !== el) {
			old.classList.remove("ss-item-active");
		}

		el.classList.add("ss-item-active");
		$$invalidate(22, activeId = `${containerId}_item_${el.dataset.id}`);
		let clientHeight = resultEl.clientHeight;

		if (resultEl.scrollHeight > clientHeight) {
			let y = el.offsetTop;
			let elementBottom = y + el.offsetHeight;
			let scrollTop = resultEl.scrollTop;

			if (elementBottom > scrollTop + clientHeight) {
				$$invalidate(5, resultEl.scrollTop = elementBottom - clientHeight, resultEl);
			} else if (y < scrollTop) {
				$$invalidate(5, resultEl.scrollTop = y, resultEl);
			}
		}
	}

	function activateArrowUp(event) {
		if (disabled || !popupVisible) {
			return;
		}

		let el = findActiveOption();
		let next = el ? el.previousElementSibling : findFirstOption();

		if (next) {
			while (next && next.classList.contains("ss-js-dead")) {
				next = next.previousElementSibling;
			}

			if (next && !next.classList.contains("ss-js-item")) {
				next = null;
			}
		}

		activateOption(next, el);
		activateArrowShift(event, el);
		event.preventDefault();
	}

	function activateArrowDown(event) {
		if (disabled || !popupVisible) {
			return;
		}

		let el = findActiveOption();
		let next = el ? el.nextElementSibling : findFirstOption();

		if (next) {
			while (next && next.classList.contains("ss-js-dead")) {
				next = next.nextElementSibling;
			}

			if (next && !next.classList.contains("ss-js-item")) {
				next = null;
			}
		}

		activateOption(next, el);
		activateArrowShift(event, el);
		event.preventDefault();
	}

	function activateArrowShift(event, el) {
		if (!event.shiftKey || !multiple) {
			return;
		}

		if (!el) {
			return;
		}

		let ds = el.dataset;
		let id = ds.id;
		let item = display.byId[id];

		if (!item || item.blank || item.action) {
			return;
		}

		selectElement(el);
	}

	function activatePageUp(event) {
		if (disabled || !popupVisible) {
			return;
		}

		let newY = resultEl.scrollTop - resultEl.clientHeight;
		let nodes = optionsEl.querySelectorAll(".ss-js-item");
		let next = null;

		for (let i = 0; !next && i < nodes.length; i++) {
			let node = nodes[i];

			if (newY <= node.offsetTop) {
				next = node;
			}
		}

		if (!next) {
			next = nodes[0];
		}

		activateOption(next);
		event.preventDefault();
	}

	function activatePageDown(event) {
		if (disabled || !popupVisible) {
			return;
		}

		let curr = findActiveOption() || findFirstOption();
		let newY = curr.offsetTop + resultEl.clientHeight;
		let nodes = optionsEl.querySelectorAll(".ss-js-item");
		let next = null;

		for (let i = 0; !next && i < nodes.length; i++) {
			let node = nodes[i];

			if (node.offsetTop + node.clientHeight >= newY) {
				next = node;
			}
		}

		if (!next) {
			next = nodes[nodes.length - 1];
		}

		activateOption(next);
		event.preventDefault();
	}

	function activateHome(event) {
		if (disabled || !popupVisible) {
			return;
		}

		let nodes = optionsEl.querySelectorAll(".ss-js-item");
		let next = nodes.length ? nodes[0] : null;
		activateOption(next);
		event.preventDefault();
	}

	function activateEnd(event) {
		if (disabled || !popupVisible) {
			return;
		}

		let nodes = optionsEl.querySelectorAll(".ss-js-item");
		let next = nodes.length ? nodes[nodes.length - 1] : null;
		activateOption(next);
		event.preventDefault();
	}

	////////////////////////////////////////////////////////////
	//
	function handleKeyEvent(event, handlers) {

		if (disabled) {
			return;
		}

		(handlers[event.key] || handlers[event.code] || handlers.base)(event);
	}

	function handleBlur(event) {
		if (debugMode) {
			return;
		}

		if (/*event.sourceCapabilities &&*/
		!containsActiveElement(event.relatedTarget)) {
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
		if (disabled) {
			return;
		}

		if (event.button === 0 && !hasModifier(event)) {
			if (popupVisible) {
				closePopup(false);
			} else {
				if (openPopup()) {
					fetchItems(false).then(function () {
						activateOption(findInitialOption());
					});
				}
			}
		}
	}

	function handleToggleLinkClick(event) {
		if (disabled) {
			return;
		}

		focusToggle();

		if (!hasModifier(event)) {
			event.preventDefault();
		}
	}

	function handleOptionClick(event) {
		if (disabled) {
			return;
		}

		if (event.button === 0) {
			if (!hasModifier(event)) {
				selectElement(event.target);
				event.preventDefault();
			}
		}
	}

	function handleOptionLinkClick(event) {
		if (disabled) {
			return;
		}

		let el = event.target.closest(".ss-item");
		activateOption(el);

		if (!hasModifier(event)) {
			event.preventDefault();
			event.stopPropagation();

			if (event.button === 0) {
				selectElement(el);
			}
		} // activate link
	}

	function handleResultScroll(event) {
		fetchMoreIfneeded();
	}

	function handleWindowScroll(event) {
		updatePopupPosition();
	}

	function div0_binding($$value) {
		binding_callbacks[$$value ? "unshift" : "push"](() => {
			toggleEl = $$value;
			$$invalidate(3, toggleEl);
		});
	}

	function input_binding($$value) {
		binding_callbacks[$$value ? "unshift" : "push"](() => {
			inputEl = $$value;
			$$invalidate(2, inputEl);
		});
	}

	function input_input_handler() {
		query = this.value;
		$$invalidate(14, query);
	}

	function ul_binding($$value) {
		binding_callbacks[$$value ? "unshift" : "push"](() => {
			optionsEl = $$value;
			$$invalidate(6, optionsEl);
		});
	}

	function div1_binding($$value) {
		binding_callbacks[$$value ? "unshift" : "push"](() => {
			resultEl = $$value;
			$$invalidate(5, resultEl);
		});
	}

	function div2_binding($$value) {
		binding_callbacks[$$value ? "unshift" : "push"](() => {
			popupEl = $$value;
			$$invalidate(4, popupEl);
		});
	}

	function div3_binding($$value) {
		binding_callbacks[$$value ? "unshift" : "push"](() => {
			containerEl = $$value;
			$$invalidate(1, containerEl);
		});
	}

	$$self.$$set = $$props => {
		if ("real" in $$props) $$invalidate(0, real = $$props.real);
		if ("config" in $$props) $$invalidate(46, config = $$props.config);
	};

	$$self.$$.update = () => {
		if ($$self.$$.dirty[2] & /*mounted*/ 16) {
			////////////////////////////////////////////////////////////
			// Setup
			//
			 {
				if (mounted) {
					syncToRealSelection();
				}
			}
		}
	};

	return [
		real,
		containerEl,
		inputEl,
		toggleEl,
		popupEl,
		resultEl,
		optionsEl,
		labelId,
		labelText,
		popupFixed,
		maxItems,
		typeahead,
		containerId,
		containerName,
		query,
		actualCount,
		displayItems,
		selectionById,
		selectionItems,
		selectionTip,
		summarySingle,
		summaryItems,
		activeId,
		showFetching,
		fetchError,
		popupVisible,
		popupTop,
		popupLeft,
		activeFetch,
		previousFetch,
		multiple,
		disabled,
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
		handleToggleLinkClick,
		handleOptionClick,
		handleOptionLinkClick,
		handleResultScroll,
		config,
		selectItem,
		div0_binding,
		input_binding,
		input_input_handler,
		ul_binding,
		div1_binding,
		div2_binding,
		div3_binding
	];
}

class Select extends SvelteComponent {
	constructor(options) {
		super();
		init(this, options, instance, create_fragment, safe_not_equal, { real: 0, config: 46, selectItem: 47 }, [-1, -1, -1, -1, -1]);
	}

	get selectItem() {
		return this.$$.ctx[47];
	}
}

export default Select;
