var Select = (function () {
  'use strict';

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    Object.defineProperty(Constructor, "prototype", {
      writable: false
    });
    return Constructor;
  }

  function _assertThisInitialized(self) {
    if (self === void 0) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return self;
  }

  function _setPrototypeOf(o, p) {
    _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
      o.__proto__ = p;
      return o;
    };

    return _setPrototypeOf(o, p);
  }

  function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function");
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        writable: true,
        configurable: true
      }
    });
    Object.defineProperty(subClass, "prototype", {
      writable: false
    });
    if (superClass) _setPrototypeOf(subClass, superClass);
  }

  function _typeof(obj) {
    "@babel/helpers - typeof";

    return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) {
      return typeof obj;
    } : function (obj) {
      return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    }, _typeof(obj);
  }

  function _possibleConstructorReturn(self, call) {
    if (call && (_typeof(call) === "object" || typeof call === "function")) {
      return call;
    } else if (call !== void 0) {
      throw new TypeError("Derived constructors may only return object or undefined");
    }

    return _assertThisInitialized(self);
  }

  function _getPrototypeOf(o) {
    _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
      return o.__proto__ || Object.getPrototypeOf(o);
    };
    return _getPrototypeOf(o);
  }

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  }

  function _arrayLikeToArray$1(arr, len) {
    if (len == null || len > arr.length) len = arr.length;

    for (var i = 0, arr2 = new Array(len); i < len; i++) {
      arr2[i] = arr[i];
    }

    return arr2;
  }

  function _arrayWithoutHoles(arr) {
    if (Array.isArray(arr)) return _arrayLikeToArray$1(arr);
  }

  function _iterableToArray(iter) {
    if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter);
  }

  function _unsupportedIterableToArray$1(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray$1(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray$1(o, minLen);
  }

  function _nonIterableSpread() {
    throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }

  function _toConsumableArray(arr) {
    return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray$1(arr) || _nonIterableSpread();
  }

  function noop() {}

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
    return a != a ? b == b : a !== b || a && _typeof(a) === 'object' || typeof a === 'function';
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

  function svg_element(name) {
    return document.createElementNS('http://www.w3.org/2000/svg', name);
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
    return function () {
      return node.removeEventListener(event, handler, options);
    };
  }

  function attr(node, attribute, value) {
    if (value == null) node.removeAttribute(attribute);else if (node.getAttribute(attribute) !== value) node.setAttribute(attribute, value);
  }

  function children(element) {
    return Array.from(element.childNodes);
  }

  function set_data(text, data) {
    data = '' + data;
    if (text.wholeText !== data) text.data = data;
  }

  function set_input_value(input, value) {
    input.value = value == null ? '' : value;
  }

  function toggle_class(element, name, toggle) {
    element.classList[toggle ? 'add' : 'remove'](name);
  }

  var current_component;

  function set_current_component(component) {
    current_component = component;
  }

  function get_current_component() {
    if (!current_component) throw new Error('Function called outside component initialization');
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

  var dirty_components = [];
  var binding_callbacks = [];
  var render_callbacks = [];
  var flush_callbacks = [];
  var resolved_promise = Promise.resolve();
  var update_scheduled = false;

  function schedule_update() {
    if (!update_scheduled) {
      update_scheduled = true;
      resolved_promise.then(flush);
    }
  }

  function add_render_callback(fn) {
    render_callbacks.push(fn);
  }
  // 1. All beforeUpdate callbacks, in order: parents before children
  // 2. All bind:this callbacks, in reverse order: children before parents.
  // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
  //    for afterUpdates called during the initial onMount, which are called in
  //    reverse order: children before parents.
  // Since callbacks might update component values, which could trigger another
  // call to flush(), the following steps guard against this:
  // 1. During beforeUpdate, any updated components will be added to the
  //    dirty_components array and will cause a reentrant call to flush(). Because
  //    the flush index is kept outside the function, the reentrant call will pick
  //    up where the earlier call left off and go through all dirty components. The
  //    current_component value is saved and restored so that the reentrant call will
  //    not interfere with the "parent" flush() call.
  // 2. bind:this callbacks cannot trigger new flush() calls.
  // 3. During afterUpdate, any updated components will NOT have their afterUpdate
  //    callback called a second time; the seen_callbacks set, outside the flush()
  //    function, guarantees this behavior.


  var seen_callbacks = new Set();
  var flushidx = 0; // Do *not* move this inside the flush() function

  function flush() {
    var saved_component = current_component;

    do {
      // first, call beforeUpdate functions
      // and update components
      while (flushidx < dirty_components.length) {
        var component = dirty_components[flushidx];
        flushidx++;
        set_current_component(component);
        update(component.$$);
      }

      set_current_component(null);
      dirty_components.length = 0;
      flushidx = 0;

      while (binding_callbacks.length) {
        binding_callbacks.pop()();
      } // then, once components are updated, call
      // afterUpdate functions. This may cause
      // subsequent updates...


      for (var i = 0; i < render_callbacks.length; i += 1) {
        var callback = render_callbacks[i];

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
    seen_callbacks.clear();
    set_current_component(saved_component);
  }

  function update($$) {
    if ($$.fragment !== null) {
      $$.update();
      run_all($$.before_update);
      var dirty = $$.dirty;
      $$.dirty = [-1];
      $$.fragment && $$.fragment.p($$.ctx, dirty);
      $$.after_update.forEach(add_render_callback);
    }
  }

  var outroing = new Set();

  function transition_in(block, local) {
    if (block && block.i) {
      outroing["delete"](block);
      block.i(local);
    }
  }

  function destroy_block(block, lookup) {
    block.d(1);
    lookup["delete"](block.key);
  }

  function update_keyed_each(old_blocks, dirty, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
    var o = old_blocks.length;
    var n = list.length;
    var i = o;
    var old_indexes = {};

    while (i--) {
      old_indexes[old_blocks[i].key] = i;
    }

    var new_blocks = [];
    var new_lookup = new Map();
    var deltas = new Map();
    i = n;

    while (i--) {
      var child_ctx = get_context(ctx, list, i);
      var key = get_key(child_ctx);
      var block = lookup.get(key);

      if (!block) {
        block = create_each_block(key, child_ctx);
        block.c();
      } else if (dynamic) {
        block.p(child_ctx, dirty);
      }

      new_lookup.set(key, new_blocks[i] = block);
      if (key in old_indexes) deltas.set(key, Math.abs(i - old_indexes[key]));
    }

    var will_move = new Set();
    var did_move = new Set();

    function insert(block) {
      transition_in(block, 1);
      block.m(node, next);
      lookup.set(block.key, block);
      next = block.first;
      n--;
    }

    while (o && n) {
      var new_block = new_blocks[n - 1];
      var old_block = old_blocks[o - 1];
      var new_key = new_block.key;
      var old_key = old_block.key;

      if (new_block === old_block) {
        // do nothing
        next = new_block.first;
        o--;
        n--;
      } else if (!new_lookup.has(old_key)) {
        // remove old block
        destroy(old_block, lookup);
        o--;
      } else if (!lookup.has(new_key) || will_move.has(new_key)) {
        insert(new_block);
      } else if (did_move.has(old_key)) {
        o--;
      } else if (deltas.get(new_key) > deltas.get(old_key)) {
        did_move.add(new_key);
        insert(new_block);
      } else {
        will_move.add(old_key);
        o--;
      }
    }

    while (o--) {
      var _old_block = old_blocks[o];
      if (!new_lookup.has(_old_block.key)) destroy(_old_block, lookup);
    }

    while (n) {
      insert(new_blocks[n - 1]);
    }

    return new_blocks;
  }

  function mount_component(component, target, anchor, customElement) {
    var _component$$$ = component.$$,
        fragment = _component$$$.fragment,
        on_mount = _component$$$.on_mount,
        on_destroy = _component$$$.on_destroy,
        after_update = _component$$$.after_update;
    fragment && fragment.m(target, anchor);

    if (!customElement) {
      // onMount happens before the initial afterUpdate
      add_render_callback(function () {
        var new_on_destroy = on_mount.map(run).filter(is_function);

        if (on_destroy) {
          on_destroy.push.apply(on_destroy, _toConsumableArray(new_on_destroy));
        } else {
          // Edge case - component was destroyed immediately,
          // most likely as a result of a binding initialising
          run_all(new_on_destroy);
        }

        component.$$.on_mount = [];
      });
    }

    after_update.forEach(add_render_callback);
  }

  function destroy_component(component, detaching) {
    var $$ = component.$$;

    if ($$.fragment !== null) {
      run_all($$.on_destroy);
      $$.fragment && $$.fragment.d(detaching); // TODO null out other refs, including component.$$ (but need to
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

    component.$$.dirty[i / 31 | 0] |= 1 << i % 31;
  }

  function init(component, options, instance, create_fragment, not_equal, props, append_styles) {
    var dirty = arguments.length > 7 && arguments[7] !== undefined ? arguments[7] : [-1];
    var parent_component = current_component;
    set_current_component(component);
    var $$ = component.$$ = {
      fragment: null,
      ctx: null,
      // state
      props: props,
      update: noop,
      not_equal: not_equal,
      bound: blank_object(),
      // lifecycle
      on_mount: [],
      on_destroy: [],
      on_disconnect: [],
      before_update: [],
      after_update: [],
      context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
      // everything else
      callbacks: blank_object(),
      dirty: dirty,
      skip_bound: false,
      root: options.target || parent_component.$$.root
    };
    append_styles && append_styles($$.root);
    var ready = false;
    $$.ctx = instance ? instance(component, options.props || {}, function (i, ret) {
      var value = (arguments.length <= 2 ? 0 : arguments.length - 2) ? arguments.length <= 2 ? undefined : arguments[2] : ret;

      if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
        if (!$$.skip_bound && $$.bound[i]) $$.bound[i](value);
        if (ready) make_dirty(component, i);
      }

      return ret;
    }) : [];
    $$.update();
    ready = true;
    run_all($$.before_update); // `false` as a special case of no DOM component

    $$.fragment = create_fragment ? create_fragment($$.ctx) : false;

    if (options.target) {
      if (options.hydrate) {
        var nodes = children(options.target); // eslint-disable-next-line @typescript-eslint/no-non-null-assertion

        $$.fragment && $$.fragment.l(nodes);
        nodes.forEach(detach);
      } else {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        $$.fragment && $$.fragment.c();
      }

      if (options.intro) transition_in(component.$$.fragment);
      mount_component(component, options.target, options.anchor, options.customElement);
      flush();
    }

    set_current_component(parent_component);
  }
  /**
   * Base class for Svelte components. Used when dev=false.
   */


  var SvelteComponent = /*#__PURE__*/function () {
    function SvelteComponent() {
      _classCallCheck(this, SvelteComponent);
    }

    _createClass(SvelteComponent, [{
      key: "$destroy",
      value: function $destroy() {
        destroy_component(this, 1);
        this.$destroy = noop;
      }
    }, {
      key: "$on",
      value: function $on(type, callback) {
        var callbacks = this.$$.callbacks[type] || (this.$$.callbacks[type] = []);
        callbacks.push(callback);
        return function () {
          var index = callbacks.indexOf(callback);
          if (index !== -1) callbacks.splice(index, 1);
        };
      }
    }, {
      key: "$set",
      value: function $set($$props) {
        if (this.$$set && !is_empty($$props)) {
          this.$$.skip_bound = true;
          this.$$set($$props);
          this.$$.skip_bound = false;
        }
      }
    }]);

    return SvelteComponent;
  }();

  function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

  function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

  function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

  function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

  function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

  function get_each_context(ctx, list, i) {
    var child_ctx = ctx.slice();
    child_ctx[125] = list[i];
    return child_ctx;
  }

  function get_each_context_1(ctx, list, i) {
    var child_ctx = ctx.slice();
    child_ctx[125] = list[i];
    child_ctx[129] = i;
    return child_ctx;
  } // (1737:10) {:else}


  function create_else_block_6(ctx) {
    var t_value = (
    /*item*/
    ctx[125].summary == null ?
    /*item*/
    ctx[125].text :
    /*item*/
    ctx[125].summary) + "";
    var t;
    return {
      c: function c() {
        t = text(t_value);
      },
      m: function m(target, anchor) {
        insert(target, t, anchor);
      },
      p: function p(ctx, dirty) {
        if (dirty[0] &
        /*summaryItems*/
        2097152 && t_value !== (t_value = (
        /*item*/
        ctx[125].summary == null ?
        /*item*/
        ctx[125].text :
        /*item*/
        ctx[125].summary) + "")) set_data(t, t_value);
      },
      d: function d(detaching) {
        if (detaching) detach(t);
      }
    };
  } // (1730:10) {#if item.href}


  function create_if_block_15(ctx) {
    var a;
    var t_value = (
    /*item*/
    ctx[125].summary == null ?
    /*item*/
    ctx[125].text :
    /*item*/
    ctx[125].summary) + "";
    var t;
    var a_href_value;
    var mounted;
    var dispose;
    return {
      c: function c() {
        a = element("a");
        t = text(t_value);
        attr(a, "class", "ss-item-link");
        attr(a, "href", a_href_value =
        /*item*/
        ctx[125].href);
        attr(a, "target", "_blank");
        attr(a, "tabindex", "-1");
      },
      m: function m(target, anchor) {
        insert(target, a, anchor);
        append(a, t);

        if (!mounted) {
          dispose = [listen(a, "click", handleToggleLinkMouseDown), listen(a, "click",
          /*handleToggleLinkClick*/
          ctx[42])];
          mounted = true;
        }
      },
      p: function p(ctx, dirty) {
        if (dirty[0] &
        /*summaryItems*/
        2097152 && t_value !== (t_value = (
        /*item*/
        ctx[125].summary == null ?
        /*item*/
        ctx[125].text :
        /*item*/
        ctx[125].summary) + "")) set_data(t, t_value);

        if (dirty[0] &
        /*summaryItems*/
        2097152 && a_href_value !== (a_href_value =
        /*item*/
        ctx[125].href)) {
          attr(a, "href", a_href_value);
        }
      },
      d: function d(detaching) {
        if (detaching) detach(a);
        mounted = false;
        run_all(dispose);
      }
    };
  } // (1723:6) {#each summaryItems as item, index (item.id)}


  function create_each_block_1(key_1, ctx) {
    var span;
    var t;
    var span_class_value;

    function select_block_type(ctx, dirty) {
      if (
      /*item*/
      ctx[125].href) return create_if_block_15;
      return create_else_block_6;
    }

    var current_block_type = select_block_type(ctx);
    var if_block = current_block_type(ctx);
    return {
      key: key_1,
      first: null,
      c: function c() {
        span = element("span");
        if_block.c();
        t = space();
        attr(span, "class", span_class_value =
        /*item*/
        ctx[125].item_class || '');
        toggle_class(span, "ss-blank",
        /*item*/
        ctx[125].blank);
        toggle_class(span, "ss-summary-item-multiple", !
        /*summarySingle*/
        ctx[20]);
        toggle_class(span, "ss-summary-item-single",
        /*summarySingle*/
        ctx[20]);
        this.first = span;
      },
      m: function m(target, anchor) {
        insert(target, span, anchor);
        if_block.m(span, null);
        append(span, t);
      },
      p: function p(new_ctx, dirty) {
        ctx = new_ctx;

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

        if (dirty[0] &
        /*summaryItems*/
        2097152 && span_class_value !== (span_class_value =
        /*item*/
        ctx[125].item_class || '')) {
          attr(span, "class", span_class_value);
        }

        if (dirty[0] &
        /*summaryItems, summaryItems*/
        2097152) {
          toggle_class(span, "ss-blank",
          /*item*/
          ctx[125].blank);
        }

        if (dirty[0] &
        /*summaryItems, summarySingle*/
        3145728) {
          toggle_class(span, "ss-summary-item-multiple", !
          /*summarySingle*/
          ctx[20]);
        }

        if (dirty[0] &
        /*summaryItems, summarySingle*/
        3145728) {
          toggle_class(span, "ss-summary-item-single",
          /*summarySingle*/
          ctx[20]);
        }
      },
      d: function d(detaching) {
        if (detaching) detach(span);
        if_block.d();
      }
    };
  } // (1749:6) {:else}


  function create_else_block_5(ctx) {
    var svg;
    var polygon;
    var svg_class_value;
    return {
      c: function c() {
        svg = svg_element("svg");
        polygon = svg_element("polygon");
        attr(polygon, "points", "2,2 14,2 8,8");
        attr(svg, "viewBox", "0 0 16 16");
        attr(svg, "class", svg_class_value =
        /*disabled*/
        ctx[31] ? 'ss-svg-caret-diasbled' : 'ss-svg-caret');
      },
      m: function m(target, anchor) {
        insert(target, svg, anchor);
        append(svg, polygon);
      },
      p: function p(ctx, dirty) {
        if (dirty[1] &
        /*disabled*/
        1 && svg_class_value !== (svg_class_value =
        /*disabled*/
        ctx[31] ? 'ss-svg-caret-diasbled' : 'ss-svg-caret')) {
          attr(svg, "class", svg_class_value);
        }
      },
      d: function d(detaching) {
        if (detaching) detach(svg);
      }
    };
  } // (1745:6) {#if showFetching}


  function create_if_block_14(ctx) {
    var svg;
    var polygon;
    var svg_class_value;
    return {
      c: function c() {
        svg = svg_element("svg");
        polygon = svg_element("polygon");
        attr(polygon, "points", "4,2 12,2 12,10 4,10");
        attr(svg, "viewBox", "0 0 16 16");
        attr(svg, "class", svg_class_value =
        /*disabled*/
        ctx[31] ? 'ss-svg-caret-diasbled' : 'ss-svg-caret');
      },
      m: function m(target, anchor) {
        insert(target, svg, anchor);
        append(svg, polygon);
      },
      p: function p(ctx, dirty) {
        if (dirty[1] &
        /*disabled*/
        1 && svg_class_value !== (svg_class_value =
        /*disabled*/
        ctx[31] ? 'ss-svg-caret-diasbled' : 'ss-svg-caret')) {
          attr(svg, "class", svg_class_value);
        }
      },
      d: function d(detaching) {
        if (detaching) detach(svg);
      }
    };
  } // (1769:4) {#if typeahead}


  function create_if_block_13(ctx) {
    var div;
    var label;
    var t0_value =
    /*translate*/
    ctx[33]('typeahead_input') + "";
    var t0;
    var label_for_value;
    var t1;
    var input;
    var input_id_value;
    var input_aria_controls_value;
    var input_aria_activedescendant_value;
    var mounted;
    var dispose;
    return {
      c: function c() {
        div = element("div");
        label = element("label");
        t0 = text(t0_value);
        t1 = space();
        input = element("input");
        attr(label, "for", label_for_value = "" + (
        /*containerId*/
        ctx[12] + "_input"));
        attr(label, "class", "sr-only");
        attr(input, "class", "form-control ss-input");
        attr(input, "id", input_id_value = "" + (
        /*containerId*/
        ctx[12] + "_input"));
        attr(input, "tabindex", "1");
        attr(input, "autocomplete", "new-password");
        attr(input, "autocorrect", "off");
        attr(input, "autocapitalize", "off");
        attr(input, "spellcheck", "off");
        attr(input, "role", "combobox");
        attr(input, "aria-autocomplete", "list");
        attr(input, "aria-controls", input_aria_controls_value = "" + (
        /*containerId*/
        ctx[12] + "_items"));
        attr(input, "aria-activedescendant", input_aria_activedescendant_value =
        /*activeId*/
        ctx[22] || '');
        attr(div, "class", "ss-input-item");
      },
      m: function m(target, anchor) {
        insert(target, div, anchor);
        append(div, label);
        append(label, t0);
        append(div, t1);
        append(div, input);
        /*input_binding*/

        ctx[50](input);
        set_input_value(input,
        /*query*/
        ctx[14]);

        if (!mounted) {
          dispose = [listen(input, "input",
          /*input_input_handler*/
          ctx[51]), listen(input, "blur",
          /*handleInputBlur*/
          ctx[35]), listen(input, "keypress",
          /*handleInputKeypress*/
          ctx[36]), listen(input, "keydown",
          /*handleInputKeydown*/
          ctx[37]), listen(input, "keyup",
          /*handleInputKeyup*/
          ctx[38])];
          mounted = true;
        }
      },
      p: function p(ctx, dirty) {
        if (dirty[0] &
        /*containerId*/
        4096 && label_for_value !== (label_for_value = "" + (
        /*containerId*/
        ctx[12] + "_input"))) {
          attr(label, "for", label_for_value);
        }

        if (dirty[0] &
        /*containerId*/
        4096 && input_id_value !== (input_id_value = "" + (
        /*containerId*/
        ctx[12] + "_input"))) {
          attr(input, "id", input_id_value);
        }

        if (dirty[0] &
        /*containerId*/
        4096 && input_aria_controls_value !== (input_aria_controls_value = "" + (
        /*containerId*/
        ctx[12] + "_items"))) {
          attr(input, "aria-controls", input_aria_controls_value);
        }

        if (dirty[0] &
        /*activeId*/
        4194304 && input_aria_activedescendant_value !== (input_aria_activedescendant_value =
        /*activeId*/
        ctx[22] || '')) {
          attr(input, "aria-activedescendant", input_aria_activedescendant_value);
        }

        if (dirty[0] &
        /*query*/
        16384 && input.value !==
        /*query*/
        ctx[14]) {
          set_input_value(input,
          /*query*/
          ctx[14]);
        }
      },
      d: function d(detaching) {
        if (detaching) detach(div);
        /*input_binding*/

        ctx[50](null);
        mounted = false;
        run_all(dispose);
      }
    };
  } // (1837:10) {:else}


  function create_else_block(ctx) {
    var li;
    var div1;
    var t0;
    var div0;
    var t1;
    var li_class_value;
    var li_id_value;
    var li_aria_selected_value;
    var li_data_id_value;
    var li_data_action_value;
    var mounted;
    var dispose;
    var if_block0 =
    /*multiple*/
    ctx[30] && !
    /*item*/
    ctx[125].blank && !
    /*item*/
    ctx[125].action && create_if_block_11(ctx);

    function select_block_type_4(ctx, dirty) {
      if (
      /*item*/
      ctx[125].blank) return create_if_block_7;
      return create_else_block_2;
    }

    var current_block_type = select_block_type_4(ctx);
    var if_block1 = current_block_type(ctx);
    return {
      c: function c() {
        li = element("li");
        div1 = element("div");
        if (if_block0) if_block0.c();
        t0 = space();
        div0 = element("div");
        if_block1.c();
        t1 = space();
        attr(div0, "class", "d-inline-block");
        attr(div1, "class", "ss-no-click");
        attr(li, "class", li_class_value = "dropdown-item ss-item ss-js-item " + (
        /*item*/
        ctx[125].item_class || ''));
        attr(li, "id", li_id_value = "" + (
        /*containerId*/
        ctx[12] + "_item_" +
        /*item*/
        ctx[125].id));
        attr(li, "role", "option");
        attr(li, "aria-selected", li_aria_selected_value =
        /*selectionById*/
        ctx[17][
        /*item*/
        ctx[125].id] ? 'true' : null);
        attr(li, "data-id", li_data_id_value =
        /*item*/
        ctx[125].id);
        attr(li, "data-action", li_data_action_value =
        /*item*/
        ctx[125].action);
        toggle_class(li, "ss-item-selected", !
        /*item*/
        ctx[125].blank &&
        /*selectionById*/
        ctx[17][
        /*item*/
        ctx[125].id]);
      },
      m: function m(target, anchor) {
        insert(target, li, anchor);
        append(li, div1);
        if (if_block0) if_block0.m(div1, null);
        append(div1, t0);
        append(div1, div0);
        if_block1.m(div0, null);
        append(li, t1);

        if (!mounted) {
          dispose = [listen(li, "mousedown", handleOptionMouseDown), listen(li, "click",
          /*handleOptionClick*/
          ctx[43])];
          mounted = true;
        }
      },
      p: function p(ctx, dirty) {
        if (
        /*multiple*/
        ctx[30] && !
        /*item*/
        ctx[125].blank && !
        /*item*/
        ctx[125].action) {
          if (if_block0) {
            if_block0.p(ctx, dirty);
          } else {
            if_block0 = create_if_block_11(ctx);
            if_block0.c();
            if_block0.m(div1, t0);
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

        if (dirty[0] &
        /*displayItems*/
        65536 && li_class_value !== (li_class_value = "dropdown-item ss-item ss-js-item " + (
        /*item*/
        ctx[125].item_class || ''))) {
          attr(li, "class", li_class_value);
        }

        if (dirty[0] &
        /*containerId, displayItems*/
        69632 && li_id_value !== (li_id_value = "" + (
        /*containerId*/
        ctx[12] + "_item_" +
        /*item*/
        ctx[125].id))) {
          attr(li, "id", li_id_value);
        }

        if (dirty[0] &
        /*selectionById, displayItems*/
        196608 && li_aria_selected_value !== (li_aria_selected_value =
        /*selectionById*/
        ctx[17][
        /*item*/
        ctx[125].id] ? 'true' : null)) {
          attr(li, "aria-selected", li_aria_selected_value);
        }

        if (dirty[0] &
        /*displayItems*/
        65536 && li_data_id_value !== (li_data_id_value =
        /*item*/
        ctx[125].id)) {
          attr(li, "data-id", li_data_id_value);
        }

        if (dirty[0] &
        /*displayItems*/
        65536 && li_data_action_value !== (li_data_action_value =
        /*item*/
        ctx[125].action)) {
          attr(li, "data-action", li_data_action_value);
        }

        if (dirty[0] &
        /*displayItems, displayItems, selectionById*/
        196608) {
          toggle_class(li, "ss-item-selected", !
          /*item*/
          ctx[125].blank &&
          /*selectionById*/
          ctx[17][
          /*item*/
          ctx[125].id]);
        }
      },
      d: function d(detaching) {
        if (detaching) detach(li);
        if (if_block0) if_block0.d();
        if_block1.d();
        mounted = false;
        run_all(dispose);
      }
    };
  } // (1817:54) 


  function create_if_block_4(ctx) {
    var li;
    var t0;
    var div1;
    var div0;
    var t1_value =
    /*item*/
    ctx[125].text + "";
    var t1;
    var div0_class_value;
    var t2;
    var t3;
    var if_block0 =
    /*multiple*/
    ctx[30] && !
    /*item*/
    ctx[125].blank && !
    /*item*/
    ctx[125].action && create_if_block_6();
    var if_block1 =
    /*item*/
    ctx[125].desc && create_if_block_5(ctx);
    return {
      c: function c() {
        li = element("li");
        if (if_block0) if_block0.c();
        t0 = space();
        div1 = element("div");
        div0 = element("div");
        t1 = text(t1_value);
        t2 = space();
        if (if_block1) if_block1.c();
        t3 = space();
        attr(div0, "class", div0_class_value = "ss-item-text " + (
        /*item*/
        ctx[125].item_class || ''));
        attr(div1, "class", "d-inline-block");
        attr(li, "class", "dropdown-item ss-item ss-item-muted ss-js-dead");
      },
      m: function m(target, anchor) {
        insert(target, li, anchor);
        if (if_block0) if_block0.m(li, null);
        append(li, t0);
        append(li, div1);
        append(div1, div0);
        append(div0, t1);
        append(div1, t2);
        if (if_block1) if_block1.m(div1, null);
        append(li, t3);
      },
      p: function p(ctx, dirty) {
        if (
        /*multiple*/
        ctx[30] && !
        /*item*/
        ctx[125].blank && !
        /*item*/
        ctx[125].action) {
          if (if_block0) ; else {
            if_block0 = create_if_block_6();
            if_block0.c();
            if_block0.m(li, t0);
          }
        } else if (if_block0) {
          if_block0.d(1);
          if_block0 = null;
        }

        if (dirty[0] &
        /*displayItems*/
        65536 && t1_value !== (t1_value =
        /*item*/
        ctx[125].text + "")) set_data(t1, t1_value);

        if (dirty[0] &
        /*displayItems*/
        65536 && div0_class_value !== (div0_class_value = "ss-item-text " + (
        /*item*/
        ctx[125].item_class || ''))) {
          attr(div0, "class", div0_class_value);
        }

        if (
        /*item*/
        ctx[125].desc) {
          if (if_block1) {
            if_block1.p(ctx, dirty);
          } else {
            if_block1 = create_if_block_5(ctx);
            if_block1.c();
            if_block1.m(div1, null);
          }
        } else if (if_block1) {
          if_block1.d(1);
          if_block1 = null;
        }
      },
      d: function d(detaching) {
        if (detaching) detach(li);
        if (if_block0) if_block0.d();
        if (if_block1) if_block1.d();
      }
    };
  } // (1813:10) {#if item.separator}


  function create_if_block_3(ctx) {
    var li;
    return {
      c: function c() {
        li = element("li");
        attr(li, "class", "dropdown-divider ss-js-dead");
      },
      m: function m(target, anchor) {
        insert(target, li, anchor);
      },
      p: noop,
      d: function d(detaching) {
        if (detaching) detach(li);
      }
    };
  } // (1852:16) {#if multiple && !item.blank && !item.action}


  function create_if_block_11(ctx) {
    var div;

    function select_block_type_3(ctx, dirty) {
      if (
      /*selectionById*/
      ctx[17][
      /*item*/
      ctx[125].id]) return create_if_block_12;
      return create_else_block_4;
    }

    var current_block_type = select_block_type_3(ctx);
    var if_block = current_block_type(ctx);
    return {
      c: function c() {
        div = element("div");
        if_block.c();
        attr(div, "class", "d-inline-block align-top ss-marker");
      },
      m: function m(target, anchor) {
        insert(target, div, anchor);
        if_block.m(div, null);
      },
      p: function p(ctx, dirty) {
        if (current_block_type !== (current_block_type = select_block_type_3(ctx))) {
          if_block.d(1);
          if_block = current_block_type(ctx);

          if (if_block) {
            if_block.c();
            if_block.m(div, null);
          }
        }
      },
      d: function d(detaching) {
        if (detaching) detach(div);
        if_block.d();
      }
    };
  } // (1859:20) {:else}


  function create_else_block_4(ctx) {
    var svg;
    var polygon;
    return {
      c: function c() {
        svg = svg_element("svg");
        polygon = svg_element("polygon");
        attr(polygon, "points", "2,1 14,1 14,12 2,12");
        attr(polygon, "class", "ss-svg-marker");
        attr(svg, "viewBox", "0 0 16 16");
      },
      m: function m(target, anchor) {
        insert(target, svg, anchor);
        append(svg, polygon);
      },
      d: function d(detaching) {
        if (detaching) detach(svg);
      }
    };
  } // (1854:20) {#if selectionById[item.id]}


  function create_if_block_12(ctx) {
    var svg;
    var polygon;
    var path;
    return {
      c: function c() {
        svg = svg_element("svg");
        polygon = svg_element("polygon");
        path = svg_element("path");
        attr(polygon, "points", "2,1 14,1 14,12 2,12");
        attr(polygon, "class", "ss-svg-marker");
        attr(path, "d", "M4,6 L7,9 L12,4");
        attr(path, "class", "ss-svg-marker-check");
        attr(svg, "viewBox", "0 0 16 16");
      },
      m: function m(target, anchor) {
        insert(target, svg, anchor);
        append(svg, polygon);
        append(svg, path);
      },
      d: function d(detaching) {
        if (detaching) detach(svg);
      }
    };
  } // (1876:18) {:else}


  function create_else_block_2(ctx) {
    var t;
    var if_block1_anchor;

    function select_block_type_6(ctx, dirty) {
      if (
      /*item*/
      ctx[125].href) return create_if_block_10;
      return create_else_block_3;
    }

    var current_block_type = select_block_type_6(ctx);
    var if_block0 = current_block_type(ctx);
    var if_block1 =
    /*item*/
    ctx[125].desc && create_if_block_9(ctx);
    return {
      c: function c() {
        if_block0.c();
        t = space();
        if (if_block1) if_block1.c();
        if_block1_anchor = empty();
      },
      m: function m(target, anchor) {
        if_block0.m(target, anchor);
        insert(target, t, anchor);
        if (if_block1) if_block1.m(target, anchor);
        insert(target, if_block1_anchor, anchor);
      },
      p: function p(ctx, dirty) {
        if (current_block_type === (current_block_type = select_block_type_6(ctx)) && if_block0) {
          if_block0.p(ctx, dirty);
        } else {
          if_block0.d(1);
          if_block0 = current_block_type(ctx);

          if (if_block0) {
            if_block0.c();
            if_block0.m(t.parentNode, t);
          }
        }

        if (
        /*item*/
        ctx[125].desc) {
          if (if_block1) {
            if_block1.p(ctx, dirty);
          } else {
            if_block1 = create_if_block_9(ctx);
            if_block1.c();
            if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
          }
        } else if (if_block1) {
          if_block1.d(1);
          if_block1 = null;
        }
      },
      d: function d(detaching) {
        if_block0.d(detaching);
        if (detaching) detach(t);
        if (if_block1) if_block1.d(detaching);
        if (detaching) detach(if_block1_anchor);
      }
    };
  } // (1868:18) {#if item.blank}


  function create_if_block_7(ctx) {
    var div;

    function select_block_type_5(ctx, dirty) {
      if (
      /*multiple*/
      ctx[30]) return create_if_block_8;
      return create_else_block_1;
    }

    var current_block_type = select_block_type_5(ctx);
    var if_block = current_block_type(ctx);
    return {
      c: function c() {
        div = element("div");
        if_block.c();
        attr(div, "class", "ss-blank");
      },
      m: function m(target, anchor) {
        insert(target, div, anchor);
        if_block.m(div, null);
      },
      p: function p(ctx, dirty) {
        if (current_block_type === (current_block_type = select_block_type_5(ctx)) && if_block) {
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
      d: function d(detaching) {
        if (detaching) detach(div);
        if_block.d();
      }
    };
  } // (1884:20) {:else}


  function create_else_block_3(ctx) {
    var div;
    var t_value =
    /*item*/
    ctx[125].text + "";
    var t;
    var div_class_value;
    return {
      c: function c() {
        div = element("div");
        t = text(t_value);
        attr(div, "class", div_class_value = "ss-item-text " + (
        /*item*/
        ctx[125].item_text_class || ''));
      },
      m: function m(target, anchor) {
        insert(target, div, anchor);
        append(div, t);
      },
      p: function p(ctx, dirty) {
        if (dirty[0] &
        /*displayItems*/
        65536 && t_value !== (t_value =
        /*item*/
        ctx[125].text + "")) set_data(t, t_value);

        if (dirty[0] &
        /*displayItems*/
        65536 && div_class_value !== (div_class_value = "ss-item-text " + (
        /*item*/
        ctx[125].item_text_class || ''))) {
          attr(div, "class", div_class_value);
        }
      },
      d: function d(detaching) {
        if (detaching) detach(div);
      }
    };
  } // (1877:20) {#if item.href}


  function create_if_block_10(ctx) {
    var a;
    var t_value =
    /*item*/
    ctx[125].text + "";
    var t;
    var a_href_value;
    var mounted;
    var dispose;
    return {
      c: function c() {
        a = element("a");
        t = text(t_value);
        attr(a, "class", "ss-item-link");
        attr(a, "href", a_href_value =
        /*item*/
        ctx[125].href);
        attr(a, "tabindex", "-1");
      },
      m: function m(target, anchor) {
        insert(target, a, anchor);
        append(a, t);

        if (!mounted) {
          dispose = [listen(a, "mousedown", handleOptionLinkMouseDown), listen(a, "click",
          /*handleOptionLinkClick*/
          ctx[44])];
          mounted = true;
        }
      },
      p: function p(ctx, dirty) {
        if (dirty[0] &
        /*displayItems*/
        65536 && t_value !== (t_value =
        /*item*/
        ctx[125].text + "")) set_data(t, t_value);

        if (dirty[0] &
        /*displayItems*/
        65536 && a_href_value !== (a_href_value =
        /*item*/
        ctx[125].href)) {
          attr(a, "href", a_href_value);
        }
      },
      d: function d(detaching) {
        if (detaching) detach(a);
        mounted = false;
        run_all(dispose);
      }
    };
  } // (1890:20) {#if item.desc}


  function create_if_block_9(ctx) {
    var div;
    var t_value =
    /*item*/
    ctx[125].desc + "";
    var t;
    var div_class_value;
    return {
      c: function c() {
        div = element("div");
        t = text(t_value);
        attr(div, "class", div_class_value = "ss-item-desc " + (
        /*item*/
        ctx[125].item_desc_class || ''));
      },
      m: function m(target, anchor) {
        insert(target, div, anchor);
        append(div, t);
      },
      p: function p(ctx, dirty) {
        if (dirty[0] &
        /*displayItems*/
        65536 && t_value !== (t_value =
        /*item*/
        ctx[125].desc + "")) set_data(t, t_value);

        if (dirty[0] &
        /*displayItems*/
        65536 && div_class_value !== (div_class_value = "ss-item-desc " + (
        /*item*/
        ctx[125].item_desc_class || ''))) {
          attr(div, "class", div_class_value);
        }
      },
      d: function d(detaching) {
        if (detaching) detach(div);
      }
    };
  } // (1872:22) {:else}


  function create_else_block_1(ctx) {
    var t_value =
    /*item*/
    ctx[125].text + "";
    var t;
    return {
      c: function c() {
        t = text(t_value);
      },
      m: function m(target, anchor) {
        insert(target, t, anchor);
      },
      p: function p(ctx, dirty) {
        if (dirty[0] &
        /*displayItems*/
        65536 && t_value !== (t_value =
        /*item*/
        ctx[125].text + "")) set_data(t, t_value);
      },
      d: function d(detaching) {
        if (detaching) detach(t);
      }
    };
  } // (1870:22) {#if multiple}


  function create_if_block_8(ctx) {
    var t_value =
    /*translate*/
    ctx[33]('clear') + "";
    var t;
    return {
      c: function c() {
        t = text(t_value);
      },
      m: function m(target, anchor) {
        insert(target, t, anchor);
      },
      p: noop,
      d: function d(detaching) {
        if (detaching) detach(t);
      }
    };
  } // (1819:14) {#if multiple && !item.blank && !item.action}


  function create_if_block_6(ctx) {
    var div;
    return {
      c: function c() {
        div = element("div");
        attr(div, "class", "d-inline-block align-top ss-marker");
      },
      m: function m(target, anchor) {
        insert(target, div, anchor);
      },
      d: function d(detaching) {
        if (detaching) detach(div);
      }
    };
  } // (1829:16) {#if item.desc}


  function create_if_block_5(ctx) {
    var div;
    var t_value =
    /*item*/
    ctx[125].desc + "";
    var t;
    return {
      c: function c() {
        div = element("div");
        t = text(t_value);
        attr(div, "class", "ss-item-desc");
      },
      m: function m(target, anchor) {
        insert(target, div, anchor);
        append(div, t);
      },
      p: function p(ctx, dirty) {
        if (dirty[0] &
        /*displayItems*/
        65536 && t_value !== (t_value =
        /*item*/
        ctx[125].desc + "")) set_data(t, t_value);
      },
      d: function d(detaching) {
        if (detaching) detach(div);
      }
    };
  } // (1812:8) {#each displayItems as item (item.id)}


  function create_each_block(key_1, ctx) {
    var first;
    var if_block_anchor;

    function select_block_type_2(ctx, dirty) {
      if (
      /*item*/
      ctx[125].separator) return create_if_block_3;
      if (
      /*item*/
      ctx[125].disabled ||
      /*item*/
      ctx[125].placeholder) return create_if_block_4;
      return create_else_block;
    }

    var current_block_type = select_block_type_2(ctx);
    var if_block = current_block_type(ctx);
    return {
      key: key_1,
      first: null,
      c: function c() {
        first = empty();
        if_block.c();
        if_block_anchor = empty();
        this.first = first;
      },
      m: function m(target, anchor) {
        insert(target, first, anchor);
        if_block.m(target, anchor);
        insert(target, if_block_anchor, anchor);
      },
      p: function p(new_ctx, dirty) {
        ctx = new_ctx;

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
      d: function d(detaching) {
        if (detaching) detach(first);
        if_block.d(detaching);
        if (detaching) detach(if_block_anchor);
      }
    };
  } // (1908:78) 


  function create_if_block_2(ctx) {
    var div;
    return {
      c: function c() {
        div = element("div");
        div.textContent = "".concat(
        /*translate*/
        ctx[33]('no_results'));
        attr(div, "class", "dropdown-item ss-message-item ss-item-muted");
      },
      m: function m(target, anchor) {
        insert(target, div, anchor);
      },
      p: noop,
      d: function d(detaching) {
        if (detaching) detach(div);
      }
    };
  } // (1904:4) {#if fetchError}


  function create_if_block_1(ctx) {
    var div;
    var t;
    return {
      c: function c() {
        div = element("div");
        t = text(
        /*fetchError*/
        ctx[24]);
        attr(div, "class", "dropdown-item border-top text-danger ss-message-item");
      },
      m: function m(target, anchor) {
        insert(target, div, anchor);
        append(div, t);
      },
      p: function p(ctx, dirty) {
        if (dirty[0] &
        /*fetchError*/
        16777216) set_data(t,
        /*fetchError*/
        ctx[24]);
      },
      d: function d(detaching) {
        if (detaching) detach(div);
      }
    };
  } // (1914:4) {#if selectionItems.length >= maxItems}


  function create_if_block(ctx) {
    var div;
    var t0_value =
    /*translate*/
    ctx[33]('max_limit') + "";
    var t0;
    var t1;
    var t2;
    var t3;
    return {
      c: function c() {
        div = element("div");
        t0 = text(t0_value);
        t1 = text(" (");
        t2 = text(
        /*maxItems*/
        ctx[10]);
        t3 = text(")");
        attr(div, "class", "dropdown-item border-top text-danger ss-message-item");
      },
      m: function m(target, anchor) {
        insert(target, div, anchor);
        append(div, t0);
        append(div, t1);
        append(div, t2);
        append(div, t3);
      },
      p: function p(ctx, dirty) {
        if (dirty[0] &
        /*maxItems*/
        1024) set_data(t2,
        /*maxItems*/
        ctx[10]);
      },
      d: function d(detaching) {
        if (detaching) detach(div);
      }
    };
  }

  function create_fragment(ctx) {
    var div4;
    var div1;
    var span;
    var each_blocks_1 = [];
    var each0_lookup = new Map();
    var t0;
    var div0;
    var div1_name_value;
    var div1_aria_owns_value;
    var div1_tabindex_value;
    var t1;
    var div3;
    var t2;
    var div2;
    var ul;
    var each_blocks = [];
    var each1_lookup = new Map();
    var ul_id_value;
    var ul_aria_activedescendant_value;
    var ul_aria_multiselectable_value;
    var t3;
    var t4;
    var div3_id_value;
    var mounted;
    var dispose;
    var each_value_1 =
    /*summaryItems*/
    ctx[21];

    var get_key = function get_key(ctx) {
      return (
        /*item*/
        ctx[125].id
      );
    };

    for (var i = 0; i < each_value_1.length; i += 1) {
      var child_ctx = get_each_context_1(ctx, each_value_1, i);
      var key = get_key(child_ctx);
      each0_lookup.set(key, each_blocks_1[i] = create_each_block_1(key, child_ctx));
    }

    function select_block_type_1(ctx, dirty) {
      if (
      /*showFetching*/
      ctx[23]) return create_if_block_14;
      return create_else_block_5;
    }

    var current_block_type = select_block_type_1(ctx);
    var if_block0 = current_block_type(ctx);
    var if_block1 =
    /*typeahead*/
    ctx[11] && create_if_block_13(ctx);
    var each_value =
    /*displayItems*/
    ctx[16];

    var get_key_1 = function get_key_1(ctx) {
      return (
        /*item*/
        ctx[125].id
      );
    };

    for (var _i = 0; _i < each_value.length; _i += 1) {
      var _child_ctx = get_each_context(ctx, each_value, _i);

      var _key = get_key_1(_child_ctx);

      each1_lookup.set(_key, each_blocks[_i] = create_each_block(_key, _child_ctx));
    }

    function select_block_type_7(ctx, dirty) {
      if (
      /*fetchError*/
      ctx[24]) return create_if_block_1;
      if (
      /*typeahead*/
      ctx[11] &&
      /*actualCount*/
      ctx[15] === 0 &&
      /*previousFetch*/
      ctx[29] && !
      /*activeFetch*/
      ctx[28]) return create_if_block_2;
    }

    var current_block_type_1 = select_block_type_7(ctx);
    var if_block2 = current_block_type_1 && current_block_type_1(ctx);
    var if_block3 =
    /*selectionItems*/
    ctx[18].length >=
    /*maxItems*/
    ctx[10] && create_if_block(ctx);
    return {
      c: function c() {
        div4 = element("div");
        div1 = element("div");
        span = element("span");

        for (var _i2 = 0; _i2 < each_blocks_1.length; _i2 += 1) {
          each_blocks_1[_i2].c();
        }

        t0 = space();
        div0 = element("div");
        if_block0.c();
        t1 = space();
        div3 = element("div");
        if (if_block1) if_block1.c();
        t2 = space();
        div2 = element("div");
        ul = element("ul");

        for (var _i3 = 0; _i3 < each_blocks.length; _i3 += 1) {
          each_blocks[_i3].c();
        }

        t3 = space();
        if (if_block2) if_block2.c();
        t4 = space();
        if (if_block3) if_block3.c();
        toggle_class(span, "ss-summary-multiple", !
        /*summarySingle*/
        ctx[20]);
        toggle_class(span, "ss-summary-single",
        /*summarySingle*/
        ctx[20]);
        attr(div0, "class", "ss-caret");
        attr(div1, "class", "form-control ss-control");
        attr(div1, "name", div1_name_value = "ss_control_" +
        /*real*/
        ctx[0].name);
        attr(div1, "role", "button");
        attr(div1, "aria-labelledby",
        /*labelId*/
        ctx[7]);
        attr(div1, "aria-label",
        /*labelText*/
        ctx[8]);
        attr(div1, "aria-expanded",
        /*popupVisible*/
        ctx[25]);
        attr(div1, "aria-haspopup", "listbox");
        attr(div1, "aria-owns", div1_aria_owns_value = "" + (
        /*containerId*/
        ctx[12] + "_popup"));
        attr(div1, "tabindex", div1_tabindex_value =
        /*disabled*/
        ctx[31] ? '-1' : '0');
        attr(div1, "title",
        /*selectionTip*/
        ctx[19]);
        attr(div1, "aria-disabled",
        /*disabled*/
        ctx[31]);
        toggle_class(div1, "ss-disabled",
        /*disabled*/
        ctx[31]);
        attr(ul, "class", "ss-item-list");
        attr(ul, "id", ul_id_value = "" + (
        /*containerId*/
        ctx[12] + "_items"));
        attr(ul, "role", "listbox");
        attr(ul, "aria-expanded",
        /*popupVisible*/
        ctx[25]);
        attr(ul, "aria-hidden", "false");
        attr(ul, "aria-activedescendant", ul_aria_activedescendant_value = !
        /*multiple*/
        ctx[30] &&
        /*selectionItems*/
        ctx[18].length ? "".concat(
        /*containerId*/
        ctx[12], "_item_").concat(
        /*selectionItems*/
        ctx[18][0].id) : null);
        attr(ul, "aria-multiselectable", ul_aria_multiselectable_value =
        /*multiple*/
        ctx[30] ? 'true' : null);
        attr(div2, "class", "ss-result");
        attr(div3, "class", "dropdown-menu ss-popup");
        attr(div3, "id", div3_id_value = "" + (
        /*containerId*/
        ctx[12] + "_popup"));
        toggle_class(div3, "show",
        /*popupVisible*/
        ctx[25]);
        toggle_class(div3, "ss-popup-fixed",
        /*popupFixed*/
        ctx[9]);
        toggle_class(div3, "ss-popup-top",
        /*popupTop*/
        ctx[26] && !
        /*popupFixed*/
        ctx[9]);
        toggle_class(div3, "ss-popup-left",
        /*popupLeft*/
        ctx[27] && !
        /*popupFixed*/
        ctx[9]);
        toggle_class(div3, "ss-popup-fixed-top",
        /*popupTop*/
        ctx[26] &&
        /*popupFixed*/
        ctx[9]);
        toggle_class(div3, "ss-popup-fixed-left",
        /*popupLeft*/
        ctx[27] &&
        /*popupFixed*/
        ctx[9]);
        attr(div4, "class", "form-control ss-container " + (
        /*styles*/
        ctx[32].container_class || ''));
        attr(div4, "id",
        /*containerId*/
        ctx[12]);
        attr(div4, "name",
        /*containerName*/
        ctx[13]);
      },
      m: function m(target, anchor) {
        insert(target, div4, anchor);
        append(div4, div1);
        append(div1, span);

        for (var _i4 = 0; _i4 < each_blocks_1.length; _i4 += 1) {
          each_blocks_1[_i4].m(span, null);
        }

        append(div1, t0);
        append(div1, div0);
        if_block0.m(div0, null);
        /*div1_binding*/

        ctx[49](div1);
        append(div4, t1);
        append(div4, div3);
        if (if_block1) if_block1.m(div3, null);
        append(div3, t2);
        append(div3, div2);
        append(div2, ul);

        for (var _i5 = 0; _i5 < each_blocks.length; _i5 += 1) {
          each_blocks[_i5].m(ul, null);
        }
        /*ul_binding*/


        ctx[52](ul);
        /*div2_binding*/

        ctx[53](div2);
        append(div3, t3);
        if (if_block2) if_block2.m(div3, null);
        append(div3, t4);
        if (if_block3) if_block3.m(div3, null);
        /*div3_binding*/

        ctx[54](div3);
        /*div4_binding*/

        ctx[55](div4);

        if (!mounted) {
          dispose = [listen(div1, "blur",
          /*handleBlur*/
          ctx[34]), listen(div1, "keydown",
          /*handleToggleKeydown*/
          ctx[39]), listen(div1, "keyup",
          /*handleToggleKeyup*/
          ctx[40]), listen(div1, "click",
          /*handleToggleClick*/
          ctx[41]), listen(div1, "mousedown", handleToggleMousedown), listen(div1, "dblclick", handleToggleDoubleClick), listen(div2, "scroll",
          /*handleResultScroll*/
          ctx[45])];
          mounted = true;
        }
      },
      p: function p(ctx, dirty) {
        if (dirty[0] &
        /*summaryItems, summarySingle*/
        3145728 | dirty[1] &
        /*handleToggleLinkClick*/
        2048) {
          each_value_1 =
          /*summaryItems*/
          ctx[21];
          each_blocks_1 = update_keyed_each(each_blocks_1, dirty, get_key, 1, ctx, each_value_1, each0_lookup, span, destroy_block, create_each_block_1, null, get_each_context_1);
        }

        if (dirty[0] &
        /*summarySingle*/
        1048576) {
          toggle_class(span, "ss-summary-multiple", !
          /*summarySingle*/
          ctx[20]);
        }

        if (dirty[0] &
        /*summarySingle*/
        1048576) {
          toggle_class(span, "ss-summary-single",
          /*summarySingle*/
          ctx[20]);
        }

        if (current_block_type === (current_block_type = select_block_type_1(ctx)) && if_block0) {
          if_block0.p(ctx, dirty);
        } else {
          if_block0.d(1);
          if_block0 = current_block_type(ctx);

          if (if_block0) {
            if_block0.c();
            if_block0.m(div0, null);
          }
        }

        if (dirty[0] &
        /*real*/
        1 && div1_name_value !== (div1_name_value = "ss_control_" +
        /*real*/
        ctx[0].name)) {
          attr(div1, "name", div1_name_value);
        }

        if (dirty[0] &
        /*labelId*/
        128) {
          attr(div1, "aria-labelledby",
          /*labelId*/
          ctx[7]);
        }

        if (dirty[0] &
        /*labelText*/
        256) {
          attr(div1, "aria-label",
          /*labelText*/
          ctx[8]);
        }

        if (dirty[0] &
        /*popupVisible*/
        33554432) {
          attr(div1, "aria-expanded",
          /*popupVisible*/
          ctx[25]);
        }

        if (dirty[0] &
        /*containerId*/
        4096 && div1_aria_owns_value !== (div1_aria_owns_value = "" + (
        /*containerId*/
        ctx[12] + "_popup"))) {
          attr(div1, "aria-owns", div1_aria_owns_value);
        }

        if (dirty[1] &
        /*disabled*/
        1 && div1_tabindex_value !== (div1_tabindex_value =
        /*disabled*/
        ctx[31] ? '-1' : '0')) {
          attr(div1, "tabindex", div1_tabindex_value);
        }

        if (dirty[0] &
        /*selectionTip*/
        524288) {
          attr(div1, "title",
          /*selectionTip*/
          ctx[19]);
        }

        if (dirty[1] &
        /*disabled*/
        1) {
          attr(div1, "aria-disabled",
          /*disabled*/
          ctx[31]);
        }

        if (dirty[1] &
        /*disabled*/
        1) {
          toggle_class(div1, "ss-disabled",
          /*disabled*/
          ctx[31]);
        }

        if (
        /*typeahead*/
        ctx[11]) {
          if (if_block1) {
            if_block1.p(ctx, dirty);
          } else {
            if_block1 = create_if_block_13(ctx);
            if_block1.c();
            if_block1.m(div3, t2);
          }
        } else if (if_block1) {
          if_block1.d(1);
          if_block1 = null;
        }

        if (dirty[0] &
        /*displayItems, multiple, containerId, selectionById*/
        1073942528 | dirty[1] &
        /*handleOptionClick, translate, handleOptionLinkClick*/
        12292) {
          each_value =
          /*displayItems*/
          ctx[16];
          each_blocks = update_keyed_each(each_blocks, dirty, get_key_1, 1, ctx, each_value, each1_lookup, ul, destroy_block, create_each_block, null, get_each_context);
        }

        if (dirty[0] &
        /*containerId*/
        4096 && ul_id_value !== (ul_id_value = "" + (
        /*containerId*/
        ctx[12] + "_items"))) {
          attr(ul, "id", ul_id_value);
        }

        if (dirty[0] &
        /*popupVisible*/
        33554432) {
          attr(ul, "aria-expanded",
          /*popupVisible*/
          ctx[25]);
        }

        if (dirty[0] &
        /*multiple, selectionItems, containerId*/
        1074008064 && ul_aria_activedescendant_value !== (ul_aria_activedescendant_value = !
        /*multiple*/
        ctx[30] &&
        /*selectionItems*/
        ctx[18].length ? "".concat(
        /*containerId*/
        ctx[12], "_item_").concat(
        /*selectionItems*/
        ctx[18][0].id) : null)) {
          attr(ul, "aria-activedescendant", ul_aria_activedescendant_value);
        }

        if (dirty[0] &
        /*multiple*/
        1073741824 && ul_aria_multiselectable_value !== (ul_aria_multiselectable_value =
        /*multiple*/
        ctx[30] ? 'true' : null)) {
          attr(ul, "aria-multiselectable", ul_aria_multiselectable_value);
        }

        if (current_block_type_1 === (current_block_type_1 = select_block_type_7(ctx)) && if_block2) {
          if_block2.p(ctx, dirty);
        } else {
          if (if_block2) if_block2.d(1);
          if_block2 = current_block_type_1 && current_block_type_1(ctx);

          if (if_block2) {
            if_block2.c();
            if_block2.m(div3, t4);
          }
        }

        if (
        /*selectionItems*/
        ctx[18].length >=
        /*maxItems*/
        ctx[10]) {
          if (if_block3) {
            if_block3.p(ctx, dirty);
          } else {
            if_block3 = create_if_block(ctx);
            if_block3.c();
            if_block3.m(div3, null);
          }
        } else if (if_block3) {
          if_block3.d(1);
          if_block3 = null;
        }

        if (dirty[0] &
        /*containerId*/
        4096 && div3_id_value !== (div3_id_value = "" + (
        /*containerId*/
        ctx[12] + "_popup"))) {
          attr(div3, "id", div3_id_value);
        }

        if (dirty[0] &
        /*popupVisible*/
        33554432) {
          toggle_class(div3, "show",
          /*popupVisible*/
          ctx[25]);
        }

        if (dirty[0] &
        /*popupFixed*/
        512) {
          toggle_class(div3, "ss-popup-fixed",
          /*popupFixed*/
          ctx[9]);
        }

        if (dirty[0] &
        /*popupTop, popupFixed*/
        67109376) {
          toggle_class(div3, "ss-popup-top",
          /*popupTop*/
          ctx[26] && !
          /*popupFixed*/
          ctx[9]);
        }

        if (dirty[0] &
        /*popupLeft, popupFixed*/
        134218240) {
          toggle_class(div3, "ss-popup-left",
          /*popupLeft*/
          ctx[27] && !
          /*popupFixed*/
          ctx[9]);
        }

        if (dirty[0] &
        /*popupTop, popupFixed*/
        67109376) {
          toggle_class(div3, "ss-popup-fixed-top",
          /*popupTop*/
          ctx[26] &&
          /*popupFixed*/
          ctx[9]);
        }

        if (dirty[0] &
        /*popupLeft, popupFixed*/
        134218240) {
          toggle_class(div3, "ss-popup-fixed-left",
          /*popupLeft*/
          ctx[27] &&
          /*popupFixed*/
          ctx[9]);
        }

        if (dirty[0] &
        /*containerId*/
        4096) {
          attr(div4, "id",
          /*containerId*/
          ctx[12]);
        }

        if (dirty[0] &
        /*containerName*/
        8192) {
          attr(div4, "name",
          /*containerName*/
          ctx[13]);
        }
      },
      i: noop,
      o: noop,
      d: function d(detaching) {
        if (detaching) detach(div4);

        for (var _i6 = 0; _i6 < each_blocks_1.length; _i6 += 1) {
          each_blocks_1[_i6].d();
        }

        if_block0.d();
        /*div1_binding*/

        ctx[49](null);
        if (if_block1) if_block1.d();

        for (var _i7 = 0; _i7 < each_blocks.length; _i7 += 1) {
          each_blocks[_i7].d();
        }
        /*ul_binding*/


        ctx[52](null);
        /*div2_binding*/

        ctx[53](null);

        if (if_block2) {
          if_block2.d();
        }

        if (if_block3) if_block3.d();
        /*div3_binding*/

        ctx[54](null);
        /*div4_binding*/

        ctx[55](null);
        mounted = false;
        run_all(dispose);
      }
    };
  }
  var I18N_DEFAULTS = {
    clear: 'Clear',
    no_results: 'No results',
    max_limit: 'Max limit reached',
    selected_count: 'selected',
    selected_more: 'more',
    typeahead_input: 'Search for...'
  };
  var STYLE_DEFAULTS = {
    container_class: ''
  };
  var BLANK_ID = '';
  var FIXED_SORT_KEY = '_';
  var FETCH_INDICATOR_DELAY = 150;
  var META_KEYS = {
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
  var MUTATIONS = {
    childList: true,
    attributes: true
  };
  var uidBase = 0;

  function nop() {}

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
    return id !== 0 && id !== '0' && (id == null || id == BLANK_ID);
  }
  /**
   * Normalize id value
   */


  function normalizeId(id) {
    return isBlankId(id) ? BLANK_ID : id.toString();
  }

  function toUnderscore(key) {
    return key.split(/(?=[A-Z])/).join('_').toLowerCase();
  }

  function toDash(key) {
    return key.replace(/_/g, '-');
  }

  function createItemFromOption(el, styles, baseHref) {
    var ds = el.dataset;
    var item = {
      id: normalizeId(el.value),
      text: el.text || '',
      disabled: el.disabled
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
    var el = document.createElement('option');
    el.setAttribute('value', item.id);

    if (item.desc) {
      el.setAttribute('data-item-desc', item.desc);
    }

    if (item.item_class) {
      el.setAttribute('data-item-class', item.item_class);
    }

    if (item.item_text_class) {
      el.setAttribute('data-item-text-class', item.item_class);
    }

    if (item.item_desc_class) {
      el.setAttribute('data-item-desc-class', item.item_class);
    }

    if (item.action) {
      el.setAttribute('data-item-action', item.action);
    }

    if (item.summary) {
      el.setAttribute('data-item-summary', item.desc);
    }

    if (item.data) {
      Object.keys(item.data).forEach(function (key) {
        el.setAttribute("data-".concat(toDash(key)), item.data[key]);
      });
    }

    el.textContent = item.text;
    return el;
  }

  function createDisplay(data) {
    var byId = {};
    var items = [];
    var blankItem = null;
    var query = (data.query || '').trim();
    var fixedItems = data.fixedItems || [];
    var fetchedItems = data.fetchedItems || [];
    var selectionItems = data.selectionItems || [];
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
    var filteredSelection = [];
    var filteredFetched = [];

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
      items.push({
        id: 'fixed_sep',
        separator: true
      });
    }

    filteredSelection.forEach(function (item) {
      items.push(item);
    });

    if (filteredSelection.length && filteredFetched.length) {
      items.push({
        id: 'selection_sep',
        separator: true
      });
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
      blankItem: blankItem,
      byId: byId,
      displayItems: items,
      dirty: false
    };
  }

  function createResult(data) {
    var fetchedItems = data.fetchedItems || [];
    fetchedItems.forEach(function (item) {
      item.id = normalizeId(item.id);

      if (isBlankId(item.id)) {
        item.blank = true;
      }

      if (item.text == null) {
        item.text = '';
      }

      if (item.sort_key == null) {
        item.sort_key = item.text;
      }
    });
    var counts = calculateCounts(fetchedItems);
    var more = data.more === true && counts.offsetCount > 0 && !data.fetchedId;
    return {
      fetchedItems: fetchedItems,
      offsetCount: counts.offsetCount,
      actualCount: counts.actualCount,
      more: more
    };
  }

  function calculateCounts(items) {
    var act = 0;
    var off = 0;
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
    return {
      offsetCount: off,
      actualCount: act
    };
  }

  function handleToggleMousedown(event) {
    if (event.detail > 1) {
      event.preventDefault();
    }
  }

  function handleToggleDoubleClick(event) {}

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
    var real = $$props.real;
    var _$$props$config = $$props.config,
        config = _$$props$config === void 0 ? {} : _$$props$config;
    var containerEl;
    var inputEl;
    var toggleEl;
    var popupEl;
    var resultEl;
    var optionsEl;
    var labelId = null;
    var labelText = null;
    var mutationObserver = new MutationObserver(handleMutation);
    var resizeObserver = null;
    var windowScrollListener = null;
    var setupDone = false;
    var translations = {};
    var styles = {};
    var popupFixed = false;
    var debugMode = false;
    var fetcher = inlineFetcher;
    var remote = false;
    var maxItems = 100;
    var typeahead = false;
    var summaryLen = 2;
    var summaryWrap = false;
    var noCache = false;
    var placeholderItem = {
      id: BLANK_ID,
      text: '',
      blank: true
    };
    var baseHref = null;
    var mounted = false;
    var containerId = null;
    var containerName = null;
    var query = '';
    var fixedItems = [];
    var result = createResult({});
    var actualCount = 0;
    var hasMore = false;
    var display = createDisplay({});
    var displayItems = [];
    var selectionById = {};
    var selectionItems = [];
    var selectionTip = '';
    var summarySingle = true;
    var summaryItems = [];
    var activeId = null;
    var showFetching = false;
    var fetchingMore = false;
    var fetchError = null;
    var popupVisible = false;
    var popupTop = false;
    var popupLeft = false;
    var activeFetch = null;
    var previousFetch = null;
    var previousQuery = null;
    var multiple = false;
    var disabled = false;
    var isSyncToReal = false;

    function selectItem(id) {
      return fetchItems(false, id).then(function (response) {
        selectItemImpl(id);
      });
    } ////////////////////////////////////////////////////////////
    // Utils


    function translate(key) {
      return translations[key];
    }

    function clearQuery() {
      $$invalidate(14, query = '');

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
      var w = containerEl.offsetWidth;
      $$invalidate(4, popupEl.style.minWidth = w + "px", popupEl);
      updatePopupPosition();

      if (!windowScrollListener) {
        windowScrollListener = handleWindowScroll;
        window.addEventListener('scroll', windowScrollListener);
      }

      return true;
    }

    function closePopup(focus) {
      $$invalidate(25, popupVisible = false);

      if (windowScrollListener) {
        window.removeEventListener('scroll', windowScrollListener);
        windowScrollListener = null;
      }

      updateDisplay();

      if (focus) {
        focusToggle();
      }
    }

    function selectItemImpl(id) {
      id = id.toString();
      var item = display.byId[id];

      if (!item) {
        console.error("MISSING item=" + id);
        return;
      }

      var blankItem = display.blankItem;
      var byId = selectionById;

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
          byId = _defineProperty({}, item.id, item);
        }
      } else {
        byId = _defineProperty({}, item.id, item);
      }

      updateSelection(byId);

      if (!multiple || item.blank) {
        clearQuery();
        closePopup(true);
      }

      syncToRealSelection();
      real.dispatchEvent(new CustomEvent('select-select', {
        detail: selectionItems
      }));
    }

    function executeAction(id) {
      var item = display.byId[id];

      if (!item) {
        console.error("MISSING action item=" + id);
        return;
      }

      closePopup(true);
      real.dispatchEvent(new CustomEvent('select-action', {
        detail: item
      }));
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
      return toggleEl === el || inputEl === el || toggleEl.contains(el);
    } ////////////////////////////////////////////////////////////
    // sync/update
    //


    function syncFromRealSelection() {
      if (isSyncToReal) {
        return;
      }

      var oldById = selectionById;
      var byId = {};
      var options = real.selectedOptions;

      for (var i = options.length - 1; i >= 0; i--) {
        var el = options[i];
        var id = normalizeId(el.value);
        var item = oldById[id];

        if (!item) {
          item = createItemFromOption(el, styles, baseHref);
        }

        byId[item.id] = item;
      }

      updateSelection(byId);
    }

    function syncToRealSelection() {
      var changed = false;
      mutationObserver.disconnect(); // Insert missing values
      // NOTE KI all existing values are *assumed* to be in sync data-attr wise

      if (remote) {
        selectionItems.forEach(function (item) {
          if (multiple && item.blank) {
            // NOTE KI no "blank" item in multiselection
            return;
          }

          var el = real.querySelector('option[value="' + item.id + '"]');

          if (!el) {
            el = createOptionFromItem(item);
            real.appendChild(el);
          }
        });
      }

      var options = real.options;

      for (var i = options.length - 1; i >= 0; i--) {
        var el = options[i];
        var id = normalizeId(el.value);
        var selected = !!selectionById[id];
        changed = changed || el.selected !== selected;

        if (selected) {
          el.setAttribute('selected', '');
          el.selected = true;
        } else {
          el.removeAttribute('selected');
          el.selected = false;
        }
      }

      mutationObserver.observe(real, MUTATIONS);

      if (changed) {
        try {
          isSyncToReal = true;
          real.dispatchEvent(new Event('change'));
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
      var byId = {};
      var items = [];

      if (multiple) {
        items.push(placeholderItem);
      }

      var options = real.options;

      for (var i = 0; i < options.length; i++) {
        var el = options[i]; // NOTE KI pick "blank" and "fixed" items

        if (isBlankId(el.value) || el.dataset.itemFixed != null) {
          var item = createItemFromOption(el, styles, baseHref);
          item.sort_key = FIXED_SORT_KEY + item.sort_key;
          item.fixed = true;
          byId[item.id] = item;
          items.push(item);
        }
      }

      var blankItem = byId[BLANK_ID];

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
        query: query,
        typeahead: typeahead,
        multiple: multiple,
        fixedItems: fixedItems,
        fetchedItems: result.fetchedItems,
        selectionItems: selectionItems
      });
      $$invalidate(16, displayItems = display.displayItems);
    }

    function appendFetchedToDisplay(fetchedItems) {
      var byId = display.byId;
      var items = display.displayItems;
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
      var items = Object.values(byId);

      if (items.length === 0) {
        var blankItem = display.blankItem || placeholderItem;
        byId = _defineProperty({}, blankItem.id, blankItem);
        items = [blankItem];
      }

      $$invalidate(17, selectionById = byId);
      $$invalidate(18, selectionItems = items.sort(function (a, b) {
        return a.sort_key.localeCompare(b.sort_key);
      }));
      var tip = selectionItems.map(function (item) {
        return item.text;
      }).join(', ');
      var len = selectionItems.length;

      if (len > 1) {
        $$invalidate(21, summaryItems = selectionItems.slice(0, summaryLen));

        if (summaryItems.length < len) {
          summaryItems.push({
            id: 'more',
            text: "".concat(len - summaryLen, " ").concat(translate('selected_more')),
            item_class: 'ss-summary-more'
          });
        }

        $$invalidate(19, selectionTip = "".concat(len, " ").concat(translate('selected_count'), ": ").concat(tip));
      } else {
        $$invalidate(21, summaryItems = selectionItems);

        if (summaryItems[0].blank) {
          $$invalidate(19, selectionTip = '');
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
      previousQuery = null; // NOTE KI need to force refetch immediately (or lazily in popup open)

      if (popupVisible) {
        fetchItems(false, null);
      }
    } ////////////////////////////////////////////////////////////
    // Fetch
    //


    function inlineFetcher(offset, query) {

      function createItems() {
        var pattern = query.toUpperCase().trim();
        var matchedItems = [];
        var options = real.options;

        for (var i = 0; i < options.length; i++) {
          var item = createItemFromOption(options[i], styles, baseHref);
          var match = void 0; // NOTE KI "blank" is handled as fixed item

          if (item.blank) {
            match = false;
          } else {
            match = item.separator || item.text.toUpperCase().includes(pattern) || item.desc && item.desc.toUpperCase().includes(pattern);
          }

          if (match) {
            matchedItems.push(item);
          }
        }

        var wasSeparator = true;
        var lastSeparator = null;
        var items = [];
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
        info: {
          more: false
        }
      });
    }
    /**
    * @return Promise
    */


    function fetchItems(fetchMore, fetchId) {
      var currentQuery;

      if (fetchId) {
        currentQuery = '';
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
      var currentFetchOffset = 0;

      if (fetchMore) {
        currentFetchOffset = result.offsetCount;
      } else {
        hasMore = false;
      }

      fetchingMore = fetchMore;
      $$invalidate(24, fetchError = null);
      $$invalidate(23, showFetching = false);
      var currentFetchingMore = fetchingMore;
      var currentFetch = fetcher(currentFetchOffset, currentQuery, fetchId).then(function (response) {
        if (currentFetch === activeFetch) {
          var responseItems = response.items || [];
          var info = response.info || {};
          var fetchedItems = responseItems;

          if (currentFetchingMore) {
            fetchedItems = result.fetchedItems;
            responseItems.forEach(function (item) {
              fetchedItems.push(item);
            });
          }

          result = createResult({
            fetchedItems: fetchedItems,
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
      })["catch"](function (err) {
        if (currentFetch === activeFetch) {
          console.error(err);
          $$invalidate(24, fetchError = err);

          var _result = createResult({});

          $$invalidate(15, actualCount = _result.actualCount);
          hasMore = _result.more;
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
      setTimeout(function () {
        if (activeFetch === currentFetch) {
          $$invalidate(23, showFetching = true);
        }
      }, FETCH_INDICATOR_DELAY);
      $$invalidate(28, activeFetch = currentFetch);
      $$invalidate(29, previousFetch = null);
      return currentFetch;
    }

    function cancelFetch() {
      if (activeFetch !== null) {
        $$invalidate(28, activeFetch = null); // no result fetched; since it doesn't match input any longer

        previousQuery = null;
        $$invalidate(23, showFetching = false);
      }
    }

    function fetchMoreIfneeded() {
      if (hasMore && !fetchingMore && popupVisible) {
        var lastItem = optionsEl.querySelector('.ss-item:last-child');

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
      $$invalidate(48, mounted = true);
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
      real.classList.add('ss-select-hidden');
      real.setAttribute('tabindex', '-1');
      real.setAttribute('aria-hidden', 'true');
      $$invalidate(30, multiple = real.multiple);
      var ds = real.dataset;
      var baseId = real.id || nextUID();
      $$invalidate(12, containerId = "ss_container_".concat(baseId));
      $$invalidate(13, containerName = real.name ? "ss_container_".concat(real.name) : null);

      if (config.remote) {
        remote = true;
        fetcher = config.fetcher;
      }

      debugMode = ds.ssDebugMode !== undefined ? true : debugMode;
      $$invalidate(11, typeahead = ds.ssTypeahead !== undefined ? true : typeahead);
      $$invalidate(10, maxItems = ds.ssMaxItems !== undefined ? parseInt(ds.ssMaxItems, 10) : maxItems);
      summaryLen = ds.ssSummaryLen !== undefined ? parseInt(ds.ssSummaryLen, 10) : summaryLen;
      summaryWrap = ds.ssSummaryWrap !== undefined ? true : summaryWrap;
      baseHref = ds.ssBaseHref != undefined ? ds.ssBaseHref : baseHref;
      noCache = ds.ssNoCache !== undefined ? true : noCache;
      $$invalidate(9, popupFixed = ds.ssPopupFixed !== undefined ? true : popupFixed);
      debugMode = config.debugMode !== undefined ? config.debugMode : debugMode;
      $$invalidate(11, typeahead = config.typeahead !== undefined ? config.typeahead : typeahead);
      $$invalidate(10, maxItems = config.maxItems || maxItems);
      summaryLen = config.summaryLen || summaryLen;
      summaryWrap = config.summaryWrap !== undefined ? config.summaryWrap : summaryWrap;
      baseHref = config.baseHref || baseHref;
      noCache = config.noCache !== undefined ? config.noCache : noCache;
      $$invalidate(9, popupFixed = config.popupFixed !== undefined ? config.popupFixed : popupFixed);
      Object.assign(translations, I18N_DEFAULTS);

      if (config.translations) {
        Object.assign(translations, config.translations);
      }

      Object.assign(styles, STYLE_DEFAULTS);

      if (config.styles) {
        Object.assign(styles, config.styles);
      }

      $$invalidate(10, maxItems = config.maxItems || maxItems);
      placeholderItem.text = config.placeholder || '';

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
        var label = document.querySelector("[for=\"".concat(real.id, "\"]"));

        if (label) {
          label.id = label.id || "ss_label_".concat(real.id);
          $$invalidate(7, labelId = label.id);
        }
      }

      if (!labelId) {
        $$invalidate(8, labelText = real.getAttribute('aria-label') || null);
      }
    }

    function handleMutation(mutationsList, observer) {
      var _iterator = _createForOfIteratorHelper(mutationsList),
          _step;

      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var mutation = _step.value;

          if (mutation.type === 'childList') {
            reload();
          } else if (mutation.type === 'attributes') {
            if (mutation.attributeName === 'disabled') {
              syncFromRealDisabled();
            }
          }
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
    }

    function handleResize(resizeList, observer) {
      updatePopupPosition();
    }

    var eventListeners = {
      change: function change(event) {

        if (!isSyncToReal) {
          syncFromRealSelection();
        }
      },
      'select-reload': function selectReload(event) {
        reload();
      },
      'focus': function focus(event) {
        focusToggle();
      }
    };

    function findActiveOption() {
      return optionsEl.querySelector('.ss-item-active');
    }

    function findFirstOption() {
      var children = optionsEl.children;
      return children[0];
    }

    function findInitialOption() {
      return multiple ? findInitialDynamic() : findInitialSimple();
    }

    function findInitialSimple() {
      var selectedId = selectionItems[0].id;
      return optionsEl.querySelector(".ss-js-item[data-id=\"".concat(selectedId, "\""));
    }

    function findInitialDynamic() {
      return optionsEl.querySelectorAll('.ss-js-item')[0];
    }

    function updatePopupPosition() {
      if (!popupVisible) {
        return;
      }

      var bounds = containerEl.getBoundingClientRect();
      var middleY = window.innerHeight / 2;
      var middleX = window.innerWidth / 2;
      $$invalidate(26, popupTop = bounds.y > middleY);
      $$invalidate(27, popupLeft = bounds.x + bounds.width > middleX);

      if (popupFixed) {
        var popupBounds = popupEl.getBoundingClientRect();

        if (popupTop) {
          $$invalidate(4, popupEl.style.top = "".concat(bounds.y - popupBounds.height, "px"), popupEl);
        } else {
          $$invalidate(4, popupEl.style.top = "".concat(bounds.y + bounds.height, "px"), popupEl);
        }

        if (popupLeft) {
          $$invalidate(4, popupEl.style.left = "".concat(bounds.x + bounds.width - popupBounds.width, "px"), popupEl);
        } else {
          $$invalidate(4, popupEl.style.left = "".concat(bounds.x, "px"), popupEl);
        }
      }
    } ////////////////////////////////////////////////////////////
    // Handlers
    //


    var toggleKeydownHandlers = {
      base: function base(event) {
        if (!popupVisible || isMetaKey(event)) {
          return;
        }

        if (typeahead) {
          inputEl.focus();
        } else {
          activateNextByKey(event.key);
        }
      },
      ArrowDown: function ArrowDown(event) {
        if (openPopup()) {
          fetchItems().then(function () {
            var next = findInitialOption();

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
      ArrowUp: function ArrowUp(event) {
        if (openPopup()) {
          fetchItems().then(function () {
            activateOption(findInitialOption());
          });
        } else {
          activateArrowUp(event);
        }

        event.preventDefault();
      },
      PageUp: function PageUp(event) {
        activatePageUp(event);
      },
      PageDown: function PageDown(event) {
        activatePageDown(event);
      },
      Home: function Home(event) {
        activateHome(event);
      },
      End: function End(event) {
        activateEnd(event);
      },
      Enter: function Enter(event) {
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
      Space: function Space(event) {
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
      Escape: function Escape(event) {
        cancelFetch();
        clearQuery();
        closePopup(false);
      },
      Delete: function Delete(event) {
        selectItem(BLANK_ID);
      }
    };
    var toggleKeyupHandlers = {
      base: nop
    };
    var inputKeypressHandlers = {
      base: function base(event) {}
    };
    var inputKeydownHandlers = {
      base: nop,
      ArrowUp: activateArrowUp,
      ArrowDown: activateArrowDown,
      PageUp: activatePageUp,
      PageDown: activatePageDown,
      Home: activateHome,
      End: activateEnd,
      Enter: function Enter(event) {
        if (!hasModifier(event)) {
          selectElement(findActiveOption());
          event.preventDefault();
        }
      },
      Escape: function Escape(event) {
        cancelFetch();
        clearQuery();
        closePopup(true);
      },
      Tab: function Tab(event) {
        focusToggle();
        event.preventDefault();
      }
    };
    var inputKeyupHandlers = {
      base: function base(event) {
        if (!isMetaKey(event)) {
          fetchItems();
        }
      }
    };

    function activateNextByKey(ch) {
      ch = ch.toUpperCase();
      var nodes = optionsEl.querySelectorAll('.ss-js-item');
      var curr = findActiveOption() || findFirstOption();

      if (curr.classList.contains('ss-js-item')) {
        curr = curr.nextElementSibling;
      } else {
        curr = null;
      }

      if (!curr) {
        curr = nodes[0];
      }
      var found = false;
      var idx = 0;

      while (curr && !found && idx < nodes.length) {
        var item = curr.dataset && display.byId[curr.dataset.id];
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
        old.classList.remove('ss-item-active');
      }

      el.classList.add('ss-item-active');
      $$invalidate(22, activeId = "".concat(containerId, "_item_").concat(el.dataset.id));
      var clientHeight = resultEl.clientHeight;

      if (resultEl.scrollHeight > clientHeight) {
        var y = el.offsetTop;
        var elementBottom = y + el.offsetHeight;
        var scrollTop = resultEl.scrollTop;

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

      var el = findActiveOption();
      var next = el ? el.previousElementSibling : findFirstOption();

      if (next) {
        while (next && next.classList.contains('ss-js-dead')) {
          next = next.previousElementSibling;
        }

        if (next && !next.classList.contains('ss-js-item')) {
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

      var el = findActiveOption();
      var next = el ? el.nextElementSibling : findFirstOption();

      if (next) {
        while (next && next.classList.contains('ss-js-dead')) {
          next = next.nextElementSibling;
        }

        if (next && !next.classList.contains('ss-js-item')) {
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

      var ds = el.dataset;
      var id = ds.id;
      var item = display.byId[id];

      if (!item || item.blank || item.action) {
        return;
      }

      selectElement(el);
    }

    function activatePageUp(event) {
      if (disabled || !popupVisible) {
        return;
      }

      var newY = resultEl.scrollTop - resultEl.clientHeight;
      var nodes = optionsEl.querySelectorAll('.ss-js-item');
      var next = null;

      for (var i = 0; !next && i < nodes.length; i++) {
        var node = nodes[i];

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

      var curr = findActiveOption() || findFirstOption();
      var newY = curr.offsetTop + resultEl.clientHeight;
      var nodes = optionsEl.querySelectorAll('.ss-js-item');
      var next = null;

      for (var i = 0; !next && i < nodes.length; i++) {
        var node = nodes[i];

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

      var nodes = optionsEl.querySelectorAll('.ss-js-item');
      var next = nodes.length ? nodes[0] : null;
      activateOption(next);
      event.preventDefault();
    }

    function activateEnd(event) {
      if (disabled || !popupVisible) {
        return;
      }

      var nodes = optionsEl.querySelectorAll('.ss-js-item');
      var next = nodes.length ? nodes[nodes.length - 1] : null;
      activateOption(next);
      event.preventDefault();
    } ////////////////////////////////////////////////////////////
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

      if (
      /*event.sourceCapabilities &&*/
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

      var el = event.target.closest('.ss-item');
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

    function div1_binding($$value) {
      binding_callbacks[$$value ? 'unshift' : 'push'](function () {
        toggleEl = $$value;
        $$invalidate(3, toggleEl);
      });
    }

    function input_binding($$value) {
      binding_callbacks[$$value ? 'unshift' : 'push'](function () {
        inputEl = $$value;
        $$invalidate(2, inputEl);
      });
    }

    function input_input_handler() {
      query = this.value;
      $$invalidate(14, query);
    }

    function ul_binding($$value) {
      binding_callbacks[$$value ? 'unshift' : 'push'](function () {
        optionsEl = $$value;
        $$invalidate(6, optionsEl);
      });
    }

    function div2_binding($$value) {
      binding_callbacks[$$value ? 'unshift' : 'push'](function () {
        resultEl = $$value;
        $$invalidate(5, resultEl);
      });
    }

    function div3_binding($$value) {
      binding_callbacks[$$value ? 'unshift' : 'push'](function () {
        popupEl = $$value;
        $$invalidate(4, popupEl);
      });
    }

    function div4_binding($$value) {
      binding_callbacks[$$value ? 'unshift' : 'push'](function () {
        containerEl = $$value;
        $$invalidate(1, containerEl);
      });
    }

    $$self.$$set = function ($$props) {
      if ('real' in $$props) $$invalidate(0, real = $$props.real);
      if ('config' in $$props) $$invalidate(46, config = $$props.config);
    };

    $$self.$$.update = function () {
      if ($$self.$$.dirty[1] &
      /*mounted*/
      131072) {
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

    return [real, containerEl, inputEl, toggleEl, popupEl, resultEl, optionsEl, labelId, labelText, popupFixed, maxItems, typeahead, containerId, containerName, query, actualCount, displayItems, selectionById, selectionItems, selectionTip, summarySingle, summaryItems, activeId, showFetching, fetchError, popupVisible, popupTop, popupLeft, activeFetch, previousFetch, multiple, disabled, styles, translate, handleBlur, handleInputBlur, handleInputKeypress, handleInputKeydown, handleInputKeyup, handleToggleKeydown, handleToggleKeyup, handleToggleClick, handleToggleLinkClick, handleOptionClick, handleOptionLinkClick, handleResultScroll, config, selectItem, mounted, div1_binding, input_binding, input_input_handler, ul_binding, div2_binding, div3_binding, div4_binding];
  }

  var Select = /*#__PURE__*/function (_SvelteComponent) {
    _inherits(Select, _SvelteComponent);

    var _super = _createSuper(Select);

    function Select(options) {
      var _this;

      _classCallCheck(this, Select);

      _this = _super.call(this);
      init(_assertThisInitialized(_this), options, instance, create_fragment, safe_not_equal, {
        real: 0,
        config: 46,
        selectItem: 47
      }, null, [-1, -1, -1, -1, -1]);
      return _this;
    }

    _createClass(Select, [{
      key: "selectItem",
      get: function get() {
        return this.$$.ctx[47];
      }
    }]);

    return Select;
  }(SvelteComponent);

  return Select;

})();
