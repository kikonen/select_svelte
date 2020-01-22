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
    return Constructor;
  }

  function _typeof(obj) {
    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
      _typeof = function _typeof(obj) {
        return typeof obj;
      };
    } else {
      _typeof = function _typeof(obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      };
    }

    return _typeof(obj);
  }

  function _assertThisInitialized(self) {
    if (self === void 0) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return self;
  }

  function _possibleConstructorReturn(self, call) {
    if (call && (_typeof(call) === "object" || typeof call === "function")) {
      return call;
    }

    return _assertThisInitialized(self);
  }

  function _getPrototypeOf(o) {
    _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
      return o.__proto__ || Object.getPrototypeOf(o);
    };
    return _getPrototypeOf(o);
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
    if (superClass) _setPrototypeOf(subClass, superClass);
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

  function _isNativeFunction(fn) {
    return Function.toString.call(fn).indexOf("[native code]") !== -1;
  }

  function isNativeReflectConstruct() {
    if (typeof Reflect === "undefined" || !Reflect.construct) return false;
    if (Reflect.construct.sham) return false;
    if (typeof Proxy === "function") return true;

    try {
      Date.prototype.toString.call(Reflect.construct(Date, [], function () {}));
      return true;
    } catch (e) {
      return false;
    }
  }

  function _construct(Parent, args, Class) {
    if (isNativeReflectConstruct()) {
      _construct = Reflect.construct;
    } else {
      _construct = function _construct(Parent, args, Class) {
        var a = [null];
        a.push.apply(a, args);
        var Constructor = Function.bind.apply(Parent, a);
        var instance = new Constructor();
        if (Class) _setPrototypeOf(instance, Class.prototype);
        return instance;
      };
    }

    return _construct.apply(null, arguments);
  }

  function _wrapNativeSuper(Class) {
    var _cache = typeof Map === "function" ? new Map() : undefined;

    _wrapNativeSuper = function _wrapNativeSuper(Class) {
      if (Class === null || !_isNativeFunction(Class)) return Class;

      if (typeof Class !== "function") {
        throw new TypeError("Super expression must either be null or a function");
      }

      if (typeof _cache !== "undefined") {
        if (_cache.has(Class)) return _cache.get(Class);

        _cache.set(Class, Wrapper);
      }

      function Wrapper() {
        return _construct(Class, arguments, _getPrototypeOf(this).constructor);
      }

      Wrapper.prototype = Object.create(Class.prototype, {
        constructor: {
          value: Wrapper,
          enumerable: false,
          writable: true,
          configurable: true
        }
      });
      return _setPrototypeOf(Wrapper, Class);
    };

    return _wrapNativeSuper(Class);
  }

  function _arrayWithoutHoles(arr) {
    if (Array.isArray(arr)) {
      for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) {
        arr2[i] = arr[i];
      }

      return arr2;
    }
  }

  function _iterableToArray(iter) {
    if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter);
  }

  function _nonIterableSpread() {
    throw new TypeError("Invalid attempt to spread non-iterable instance");
  }

  function _toConsumableArray(arr) {
    return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread();
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
    if (text.data !== data) text.data = data;
  }

  function set_input_value(input, value) {
    if (value != null || input.value) {
      input.value = value;
    }
  }

  function toggle_class(element, name, toggle) {
    element.classList[toggle ? 'add' : 'remove'](name);
  }

  var current_component;

  function set_current_component(component) {
    current_component = component;
  }

  function get_current_component() {
    if (!current_component) throw new Error("Function called outside component initialization");
    return current_component;
  }

  function beforeUpdate(fn) {
    get_current_component().$$.before_update.push(fn);
  }

  function onMount(fn) {
    get_current_component().$$.on_mount.push(fn);
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

  function flush() {
    var seen_callbacks = new Set();

    do {
      // first, call beforeUpdate functions
      // and update components
      while (dirty_components.length) {
        var component = dirty_components.shift();
        set_current_component(component);
        update(component.$$);
      }

      while (binding_callbacks.length) {
        binding_callbacks.pop()();
      } // then, once components are updated, call
      // afterUpdate functions. This may cause
      // subsequent updates...


      for (var i = 0; i < render_callbacks.length; i += 1) {
        var callback = render_callbacks[i];

        if (!seen_callbacks.has(callback)) {
          callback(); // ...so guard against infinite loops

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

  function mount_component(component, target, anchor) {
    var _component$$$ = component.$$,
        fragment = _component$$$.fragment,
        on_mount = _component$$$.on_mount,
        on_destroy = _component$$$.on_destroy,
        after_update = _component$$$.after_update;
    fragment && fragment.m(target, anchor); // onMount happens before the initial afterUpdate

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

  function init(component, options, instance, create_fragment, not_equal, props) {
    var dirty = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : [-1];
    var parent_component = current_component;
    set_current_component(component);
    var prop_values = options.props || {};
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
      before_update: [],
      after_update: [],
      context: new Map(parent_component ? parent_component.$$.context : []),
      // everything else
      callbacks: blank_object(),
      dirty: dirty
    };
    var ready = false;
    $$.ctx = instance ? instance(component, prop_values, function (i, ret) {
      var value = (arguments.length <= 2 ? 0 : arguments.length - 2) ? arguments.length <= 2 ? undefined : arguments[2] : ret;

      if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
        if ($$.bound[i]) $$.bound[i](value);
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
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        $$.fragment && $$.fragment.l(children(options.target));
      } else {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        $$.fragment && $$.fragment.c();
      }

      if (options.intro) transition_in(component.$$.fragment);
      mount_component(component, options.target, options.anchor);
      flush();
    }

    set_current_component(parent_component);
  }

  var SvelteElement;

  if (typeof HTMLElement === 'function') {
    SvelteElement =
    /*#__PURE__*/
    function (_HTMLElement) {
      _inherits(SvelteElement, _HTMLElement);

      function SvelteElement() {
        var _this;

        _classCallCheck(this, SvelteElement);

        _this = _possibleConstructorReturn(this, _getPrototypeOf(SvelteElement).call(this));

        _this.attachShadow({
          mode: 'open'
        });

        return _this;
      }

      _createClass(SvelteElement, [{
        key: "connectedCallback",
        value: function connectedCallback() {
          // @ts-ignore todo: improve typings
          for (var key in this.$$.slotted) {
            // @ts-ignore todo: improve typings
            this.appendChild(this.$$.slotted[key]);
          }
        }
      }, {
        key: "attributeChangedCallback",
        value: function attributeChangedCallback(attr, _oldValue, newValue) {
          this[attr] = newValue;
        }
      }, {
        key: "$destroy",
        value: function $destroy() {
          destroy_component(this, 1);
          this.$destroy = noop;
        }
      }, {
        key: "$on",
        value: function $on(type, callback) {
          // TODO should this delegate to addEventListener?
          var callbacks = this.$$.callbacks[type] || (this.$$.callbacks[type] = []);
          callbacks.push(callback);
          return function () {
            var index = callbacks.indexOf(callback);
            if (index !== -1) callbacks.splice(index, 1);
          };
        }
      }, {
        key: "$set",
        value: function $set() {// overridden by instance, if it has props
        }
      }]);

      return SvelteElement;
    }(_wrapNativeSuper(HTMLElement));
  }

  var SvelteComponent =
  /*#__PURE__*/
  function () {
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
      value: function $set() {// overridden by instance, if it has props
      }
    }]);

    return SvelteComponent;
  }();

  function get_each_context(ctx, list, i) {
    var child_ctx = ctx.slice();
    child_ctx[96] = list[i];
    return child_ctx;
  }

  function get_each_context_1(ctx, list, i) {
    var child_ctx = ctx.slice();
    child_ctx[96] = list[i];
    child_ctx[100] = i;
    return child_ctx;
  } // (1400:10) {:else}


  function create_else_block_4(ctx) {
    var t_value =
    /*item*/
    ctx[96].text + "";
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
        16384 && t_value !== (t_value =
        /*item*/
        ctx[96].text + "")) set_data(t, t_value);
      },
      d: function d(detaching) {
        if (detaching) detach(t);
      }
    };
  } // (1394:10) {#if item.href}


  function create_if_block_12(ctx) {
    var a;
    var t_value =
    /*item*/
    ctx[96].text + "";
    var t;
    var a_href_value;
    var dispose;
    return {
      c: function c() {
        a = element("a");
        t = text(t_value);
        attr(a, "class", "ss-item-link");
        attr(a, "href", a_href_value =
        /*item*/
        ctx[96].href);
        attr(a, "target", "_blank");
        attr(a, "tabindex", "-1");
      },
      m: function m(target, anchor) {
        insert(target, a, anchor);
        append(a, t);
        dispose = listen(a, "click",
        /*handleToggleLinkClick*/
        ctx[36]);
      },
      p: function p(ctx, dirty) {
        if (dirty[0] &
        /*summaryItems*/
        16384 && t_value !== (t_value =
        /*item*/
        ctx[96].text + "")) set_data(t, t_value);

        if (dirty[0] &
        /*summaryItems*/
        16384 && a_href_value !== (a_href_value =
        /*item*/
        ctx[96].href)) {
          attr(a, "href", a_href_value);
        }
      },
      d: function d(detaching) {
        if (detaching) detach(a);
        dispose();
      }
    };
  } // (1387:6) {#each summaryItems as item, index (item.id)}


  function create_each_block_1(key_1, ctx) {
    var span;
    var t;
    var span_class_value;

    function select_block_type(ctx, dirty) {
      if (
      /*item*/
      ctx[96].href) return create_if_block_12;
      return create_else_block_4;
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
        ctx[96].item_class || "");
        toggle_class(span, "ss-blank",
        /*item*/
        ctx[96].blank);
        toggle_class(span, "ss-summary-item-multiple", !
        /*summarySingle*/
        ctx[13]);
        toggle_class(span, "ss-summary-item-single",
        /*summarySingle*/
        ctx[13]);
        this.first = span;
      },
      m: function m(target, anchor) {
        insert(target, span, anchor);
        if_block.m(span, null);
        append(span, t);
      },
      p: function p(ctx, dirty) {
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
        16384 && span_class_value !== (span_class_value =
        /*item*/
        ctx[96].item_class || "")) {
          attr(span, "class", span_class_value);
        }

        if (dirty[0] &
        /*summaryItems, summaryItems*/
        16384) {
          toggle_class(span, "ss-blank",
          /*item*/
          ctx[96].blank);
        }

        if (dirty[0] &
        /*summaryItems, summarySingle*/
        24576) {
          toggle_class(span, "ss-summary-item-multiple", !
          /*summarySingle*/
          ctx[13]);
        }

        if (dirty[0] &
        /*summaryItems, summarySingle*/
        24576) {
          toggle_class(span, "ss-summary-item-single",
          /*summarySingle*/
          ctx[13]);
        }
      },
      d: function d(detaching) {
        if (detaching) detach(span);
        if_block.d();
      }
    };
  } // (1417:4) {#if typeahead}


  function create_if_block_11(ctx) {
    var div;
    var input;
    var dispose;
    return {
      c: function c() {
        div = element("div");
        input = element("input");
        attr(input, "class", "form-control ss-input");
        attr(input, "tabindex", "1");
        attr(input, "autocomplete", "new-password");
        attr(input, "autocorrect", "off");
        attr(input, "autocapitalize", "off");
        attr(input, "spellcheck", "off");
        attr(div, "class", "ss-input-item");
        attr(div, "tabindex", "-1");
      },
      m: function m(target, anchor) {
        insert(target, div, anchor);
        append(div, input);
        /*input_binding*/

        ctx[92](input);
        set_input_value(input,
        /*query*/
        ctx[7]);
        dispose = [listen(input, "input",
        /*input_input_handler*/
        ctx[93]), listen(input, "blur",
        /*handleInputBlur*/
        ctx[26]), listen(input, "keypress",
        /*handleInputKeypress*/
        ctx[27]), listen(input, "keydown",
        /*handleInputKeydown*/
        ctx[28]), listen(input, "keyup",
        /*handleInputKeyup*/
        ctx[29])];
      },
      p: function p(ctx, dirty) {
        if (dirty[0] &
        /*query*/
        128 && input.value !==
        /*query*/
        ctx[7]) {
          set_input_value(input,
          /*query*/
          ctx[7]);
        }
      },
      d: function d(detaching) {
        if (detaching) detach(div);
        /*input_binding*/

        ctx[92](null);
        run_all(dispose);
      }
    };
  } // (1456:6) {:else}


  function create_else_block(ctx) {
    var div2;
    var div1;
    var t;
    var div0;
    var div2_class_value;
    var div2_data_id_value;
    var div2_data_action_value;
    var dispose;
    var if_block0 =
    /*multiple*/
    ctx[22] && !
    /*item*/
    ctx[96].blank && !
    /*item*/
    ctx[96].action && create_if_block_10(ctx);

    function select_block_type_2(ctx, dirty) {
      if (
      /*item*/
      ctx[96].blank) return create_if_block_6;
      return create_else_block_2;
    }

    var current_block_type = select_block_type_2(ctx);
    var if_block1 = current_block_type(ctx);
    return {
      c: function c() {
        div2 = element("div");
        div1 = element("div");
        if (if_block0) if_block0.c();
        t = space();
        div0 = element("div");
        if_block1.c();
        attr(div0, "class", "d-inline-block");
        attr(div1, "class", "ss-no-click");
        attr(div2, "tabindex", "1");
        attr(div2, "class", div2_class_value = "dropdown-item ss-item ss-js-item " + (
        /*item*/
        ctx[96].item_class || ""));
        attr(div2, "data-id", div2_data_id_value =
        /*item*/
        ctx[96].id);
        attr(div2, "data-action", div2_data_action_value =
        /*item*/
        ctx[96].action || "");
        toggle_class(div2, "ss-item-selected", !
        /*item*/
        ctx[96].blank &&
        /*selectionById*/
        ctx[10][
        /*item*/
        ctx[96].id]);
      },
      m: function m(target, anchor) {
        insert(target, div2, anchor);
        append(div2, div1);
        if (if_block0) if_block0.m(div1, null);
        append(div1, t);
        append(div1, div0);
        if_block1.m(div0, null);
        dispose = [listen(div2, "blur",
        /*handleBlur*/
        ctx[25]), listen(div2, "click",
        /*handleItemClick*/
        ctx[35]), listen(div2, "keydown",
        /*handleItemKeydown*/
        ctx[33]), listen(div2, "keyup",
        /*handleItemKeyup*/
        ctx[34])];
      },
      p: function p(ctx, dirty) {
        if (
        /*multiple*/
        ctx[22] && !
        /*item*/
        ctx[96].blank && !
        /*item*/
        ctx[96].action) {
          if (if_block0) {
            if_block0.p(ctx, dirty);
          } else {
            if_block0 = create_if_block_10(ctx);
            if_block0.c();
            if_block0.m(div1, t);
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

        if (dirty[0] &
        /*displayItems*/
        512 && div2_class_value !== (div2_class_value = "dropdown-item ss-item ss-js-item " + (
        /*item*/
        ctx[96].item_class || ""))) {
          attr(div2, "class", div2_class_value);
        }

        if (dirty[0] &
        /*displayItems*/
        512 && div2_data_id_value !== (div2_data_id_value =
        /*item*/
        ctx[96].id)) {
          attr(div2, "data-id", div2_data_id_value);
        }

        if (dirty[0] &
        /*displayItems*/
        512 && div2_data_action_value !== (div2_data_action_value =
        /*item*/
        ctx[96].action || "")) {
          attr(div2, "data-action", div2_data_action_value);
        }

        if (dirty[0] &
        /*displayItems, displayItems, selectionById*/
        1536) {
          toggle_class(div2, "ss-item-selected", !
          /*item*/
          ctx[96].blank &&
          /*selectionById*/
          ctx[10][
          /*item*/
          ctx[96].id]);
        }
      },
      d: function d(detaching) {
        if (detaching) detach(div2);
        if (if_block0) if_block0.d();
        if_block1.d();
        run_all(dispose);
      }
    };
  } // (1442:50) 


  function create_if_block_4(ctx) {
    var div1;
    var div0;
    var t0_value =
    /*item*/
    ctx[96].text + "";
    var t0;
    var div0_class_value;
    var t1;
    var dispose;
    var if_block =
    /*item*/
    ctx[96].desc && create_if_block_5(ctx);
    return {
      c: function c() {
        div1 = element("div");
        div0 = element("div");
        t0 = text(t0_value);
        t1 = space();
        if (if_block) if_block.c();
        attr(div0, "class", div0_class_value = "ss-item-text " +
        /*item*/
        ctx[96].item_class);
        attr(div1, "tabindex", "-1");
        attr(div1, "class", "dropdown-item ss-item-muted ss-js-dead");
      },
      m: function m(target, anchor) {
        insert(target, div1, anchor);
        append(div1, div0);
        append(div0, t0);
        append(div1, t1);
        if (if_block) if_block.m(div1, null);
        dispose = listen(div1, "keydown",
        /*handleItemKeydown*/
        ctx[33]);
      },
      p: function p(ctx, dirty) {
        if (dirty[0] &
        /*displayItems*/
        512 && t0_value !== (t0_value =
        /*item*/
        ctx[96].text + "")) set_data(t0, t0_value);

        if (dirty[0] &
        /*displayItems*/
        512 && div0_class_value !== (div0_class_value = "ss-item-text " +
        /*item*/
        ctx[96].item_class)) {
          attr(div0, "class", div0_class_value);
        }

        if (
        /*item*/
        ctx[96].desc) {
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
      d: function d(detaching) {
        if (detaching) detach(div1);
        if (if_block) if_block.d();
        dispose();
      }
    };
  } // (1436:6) {#if item.separator}


  function create_if_block_3(ctx) {
    var div;
    var dispose;
    return {
      c: function c() {
        div = element("div");
        attr(div, "tabindex", "-1");
        attr(div, "class", "dropdown-divider ss-js-dead");
      },
      m: function m(target, anchor) {
        insert(target, div, anchor);
        dispose = listen(div, "keydown",
        /*handleItemKeydown*/
        ctx[33]);
      },
      p: noop,
      d: function d(detaching) {
        if (detaching) detach(div);
        dispose();
      }
    };
  } // (1468:12) {#if multiple && !item.blank && !item.action}


  function create_if_block_10(ctx) {
    var div;
    var i;
    var i_class_value;
    return {
      c: function c() {
        div = element("div");
        i = element("i");
        attr(i, "class", i_class_value = "ss-marker " + (
        /*selectionById*/
        ctx[10][
        /*item*/
        ctx[96].id] ? FA_SELECTED : FA_NOT_SELECTED));
        attr(div, "class", "d-inline-block align-top");
      },
      m: function m(target, anchor) {
        insert(target, div, anchor);
        append(div, i);
      },
      p: function p(ctx, dirty) {
        if (dirty[0] &
        /*selectionById, displayItems*/
        1536 && i_class_value !== (i_class_value = "ss-marker " + (
        /*selectionById*/
        ctx[10][
        /*item*/
        ctx[96].id] ? FA_SELECTED : FA_NOT_SELECTED))) {
          attr(i, "class", i_class_value);
        }
      },
      d: function d(detaching) {
        if (detaching) detach(div);
      }
    };
  } // (1483:14) {:else}


  function create_else_block_2(ctx) {
    var t;
    var if_block1_anchor;

    function select_block_type_4(ctx, dirty) {
      if (
      /*item*/
      ctx[96].href) return create_if_block_9;
      return create_else_block_3;
    }

    var current_block_type = select_block_type_4(ctx);
    var if_block0 = current_block_type(ctx);
    var if_block1 =
    /*item*/
    ctx[96].desc && create_if_block_8(ctx);
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

        if (
        /*item*/
        ctx[96].desc) {
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
      d: function d(detaching) {
        if_block0.d(detaching);
        if (detaching) detach(t);
        if (if_block1) if_block1.d(detaching);
        if (detaching) detach(if_block1_anchor);
      }
    };
  } // (1475:14) {#if item.blank}


  function create_if_block_6(ctx) {
    var div;

    function select_block_type_3(ctx, dirty) {
      if (
      /*multiple*/
      ctx[22]) return create_if_block_7;
      return create_else_block_1;
    }

    var current_block_type = select_block_type_3(ctx);
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
      d: function d(detaching) {
        if (detaching) detach(div);
        if_block.d();
      }
    };
  } // (1490:16) {:else}


  function create_else_block_3(ctx) {
    var div;
    var t_value =
    /*item*/
    ctx[96].text + "";
    var t;
    var div_class_value;
    return {
      c: function c() {
        div = element("div");
        t = text(t_value);
        attr(div, "class", div_class_value = "ss-item-text " + (
        /*item*/
        ctx[96].item_class || ""));
      },
      m: function m(target, anchor) {
        insert(target, div, anchor);
        append(div, t);
      },
      p: function p(ctx, dirty) {
        if (dirty[0] &
        /*displayItems*/
        512 && t_value !== (t_value =
        /*item*/
        ctx[96].text + "")) set_data(t, t_value);

        if (dirty[0] &
        /*displayItems*/
        512 && div_class_value !== (div_class_value = "ss-item-text " + (
        /*item*/
        ctx[96].item_class || ""))) {
          attr(div, "class", div_class_value);
        }
      },
      d: function d(detaching) {
        if (detaching) detach(div);
      }
    };
  } // (1484:16) {#if item.href}


  function create_if_block_9(ctx) {
    var a;
    var t_value =
    /*item*/
    ctx[96].text + "";
    var t;
    var a_href_value;
    var dispose;
    return {
      c: function c() {
        a = element("a");
        t = text(t_value);
        attr(a, "class", "ss-item-link");
        attr(a, "href", a_href_value =
        /*item*/
        ctx[96].href);
        attr(a, "tabindex", "-1");
      },
      m: function m(target, anchor) {
        insert(target, a, anchor);
        append(a, t);
        dispose = listen(a, "click",
        /*handleItemLinkClick*/
        ctx[37]);
      },
      p: function p(ctx, dirty) {
        if (dirty[0] &
        /*displayItems*/
        512 && t_value !== (t_value =
        /*item*/
        ctx[96].text + "")) set_data(t, t_value);

        if (dirty[0] &
        /*displayItems*/
        512 && a_href_value !== (a_href_value =
        /*item*/
        ctx[96].href)) {
          attr(a, "href", a_href_value);
        }
      },
      d: function d(detaching) {
        if (detaching) detach(a);
        dispose();
      }
    };
  } // (1496:16) {#if item.desc}


  function create_if_block_8(ctx) {
    var div;
    var t_value =
    /*item*/
    ctx[96].desc + "";
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
        512 && t_value !== (t_value =
        /*item*/
        ctx[96].desc + "")) set_data(t, t_value);
      },
      d: function d(detaching) {
        if (detaching) detach(div);
      }
    };
  } // (1479:18) {:else}


  function create_else_block_1(ctx) {
    var t_value =
    /*item*/
    ctx[96].text + "";
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
        512 && t_value !== (t_value =
        /*item*/
        ctx[96].text + "")) set_data(t, t_value);
      },
      d: function d(detaching) {
        if (detaching) detach(t);
      }
    };
  } // (1477:18) {#if multiple}


  function create_if_block_7(ctx) {
    var t_value =
    /*translate*/
    ctx[24]("clear") + "";
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
  } // (1449:10) {#if item.desc}


  function create_if_block_5(ctx) {
    var div;
    var t_value =
    /*item*/
    ctx[96].desc + "";
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
        512 && t_value !== (t_value =
        /*item*/
        ctx[96].desc + "")) set_data(t, t_value);
      },
      d: function d(detaching) {
        if (detaching) detach(div);
      }
    };
  } // (1435:4) {#each displayItems as item (item.id)}


  function create_each_block(key_1, ctx) {
    var first;
    var if_block_anchor;

    function select_block_type_1(ctx, dirty) {
      if (
      /*item*/
      ctx[96].separator) return create_if_block_3;
      if (
      /*item*/
      ctx[96].disabled ||
      /*item*/
      ctx[96].placeholder) return create_if_block_4;
      return create_else_block;
    }

    var current_block_type = select_block_type_1(ctx);
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
      p: function p(ctx, dirty) {
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
      d: function d(detaching) {
        if (detaching) detach(first);
        if_block.d(detaching);
        if (detaching) detach(if_block_anchor);
      }
    };
  } // (1508:4) {#if typeahead && actualCount === 0 && previousFetch && !activeFetch}


  function create_if_block_2(ctx) {
    var div;
    return {
      c: function c() {
        div = element("div");
        div.textContent = "".concat(
        /*translate*/
        ctx[24]("no_results"));
        attr(div, "tabindex", "-1");
        attr(div, "class", "dropdown-item ss-message-item ss-item-muted ss-js-dead");
      },
      m: function m(target, anchor) {
        insert(target, div, anchor);
      },
      p: noop,
      d: function d(detaching) {
        if (detaching) detach(div);
      }
    };
  } // (1514:4) {#if fetchError}


  function create_if_block_1(ctx) {
    var div;
    var t;
    return {
      c: function c() {
        div = element("div");
        t = text(
        /*fetchError*/
        ctx[16]);
        attr(div, "tabindex", "-1");
        attr(div, "class", "dropdown-item border-top text-danger ss-message-item ss-sticky-item ss-js-dead");
      },
      m: function m(target, anchor) {
        insert(target, div, anchor);
        append(div, t);
      },
      p: function p(ctx, dirty) {
        if (dirty[0] &
        /*fetchError*/
        65536) set_data(t,
        /*fetchError*/
        ctx[16]);
      },
      d: function d(detaching) {
        if (detaching) detach(div);
      }
    };
  } // (1520:4) {#if selectionItems.length >= maxItems}


  function create_if_block(ctx) {
    var div;
    var t0_value =
    /*translate*/
    ctx[24]("max_limit") + "";
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
        ctx[5]);
        t3 = text(")");
        attr(div, "tabindex", "-1");
        attr(div, "class", "dropdown-item border-top text-danger ss-message-item ss-sticky-item ss-js-dead");
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
        32) set_data(t2,
        /*maxItems*/
        ctx[5]);
      },
      d: function d(detaching) {
        if (detaching) detach(div);
      }
    };
  }

  function create_fragment(ctx) {
    var div1;
    var button;
    var span0;
    var each_blocks_1 = [];
    var each0_lookup = new Map();
    var t0;
    var span1;
    var span1_class_value;
    var button_name_value;
    var t1;
    var div0;
    var t2;
    var each_blocks = [];
    var each1_lookup = new Map();
    var t3;
    var t4;
    var t5;
    var div1_class_value;
    var div1_id_value;
    var div1_name_value;
    var dispose;
    var each_value_1 =
    /*summaryItems*/
    ctx[14];

    var get_key = function get_key(ctx) {
      return (
        /*item*/
        ctx[96].id
      );
    };

    for (var i = 0; i < each_value_1.length; i += 1) {
      var child_ctx = get_each_context_1(ctx, each_value_1, i);
      var key = get_key(child_ctx);
      each0_lookup.set(key, each_blocks_1[i] = create_each_block_1(key, child_ctx));
    }

    var if_block0 =
    /*typeahead*/
    ctx[6] && create_if_block_11(ctx);
    var each_value =
    /*displayItems*/
    ctx[9];

    var get_key_1 = function get_key_1(ctx) {
      return (
        /*item*/
        ctx[96].id
      );
    };

    for (var _i = 0; _i < each_value.length; _i += 1) {
      var _child_ctx = get_each_context(ctx, each_value, _i);

      var _key = get_key_1(_child_ctx);

      each1_lookup.set(_key, each_blocks[_i] = create_each_block(_key, _child_ctx));
    }

    var if_block1 =
    /*typeahead*/
    ctx[6] &&
    /*actualCount*/
    ctx[8] === 0 &&
    /*previousFetch*/
    ctx[21] && !
    /*activeFetch*/
    ctx[20] && create_if_block_2(ctx);
    var if_block2 =
    /*fetchError*/
    ctx[16] && create_if_block_1(ctx);
    var if_block3 =
    /*selectionItems*/
    ctx[11].length >=
    /*maxItems*/
    ctx[5] && create_if_block(ctx);
    return {
      c: function c() {
        div1 = element("div");
        button = element("button");
        span0 = element("span");

        for (var _i2 = 0; _i2 < each_blocks_1.length; _i2 += 1) {
          each_blocks_1[_i2].c();
        }

        t0 = space();
        span1 = element("span");
        t1 = space();
        div0 = element("div");
        if (if_block0) if_block0.c();
        t2 = space();

        for (var _i3 = 0; _i3 < each_blocks.length; _i3 += 1) {
          each_blocks[_i3].c();
        }

        t3 = space();
        if (if_block1) if_block1.c();
        t4 = space();
        if (if_block2) if_block2.c();
        t5 = space();
        if (if_block3) if_block3.c();
        toggle_class(span0, "ss-summary-multiple", !
        /*summarySingle*/
        ctx[13]);
        toggle_class(span0, "ss-summary-single",
        /*summarySingle*/
        ctx[13]);
        attr(span1, "class", span1_class_value = "ss-caret " + (
        /*showFetching*/
        ctx[15] ? FA_CARET_FETCHING : FA_CARET_DOWN));
        attr(button, "class", "form-control ss-control");
        attr(button, "name", button_name_value = "ss_control_" +
        /*real*/
        ctx[0].name);
        attr(button, "type", "button");
        attr(button, "tabindex", "0");
        attr(button, "title",
        /*selectionTip*/
        ctx[12]);
        attr(div0, "class", "dropdown-menu ss-popup");
        attr(div0, "tabindex", "-1");
        toggle_class(div0, "show",
        /*popupVisible*/
        ctx[17]);
        toggle_class(div0, "ss-popup-top",
        /*popupTop*/
        ctx[18]);
        toggle_class(div0, "ss-popup-left",
        /*popupLeft*/
        ctx[19]);
        attr(div1, "class", div1_class_value = "form-control ss-container " +
        /*styles*/
        ctx[23].container_class);
        attr(div1, "id", div1_id_value = "ss_container_" +
        /*real*/
        ctx[0].id);
        attr(div1, "name", div1_name_value = "ss_container_" +
        /*real*/
        ctx[0].name);
      },
      m: function m(target, anchor) {
        insert(target, div1, anchor);
        append(div1, button);
        append(button, span0);

        for (var _i4 = 0; _i4 < each_blocks_1.length; _i4 += 1) {
          each_blocks_1[_i4].m(span0, null);
        }

        append(button, t0);
        append(button, span1);
        /*button_binding*/

        ctx[91](button);
        append(div1, t1);
        append(div1, div0);
        if (if_block0) if_block0.m(div0, null);
        append(div0, t2);

        for (var _i5 = 0; _i5 < each_blocks.length; _i5 += 1) {
          each_blocks[_i5].m(div0, null);
        }

        append(div0, t3);
        if (if_block1) if_block1.m(div0, null);
        append(div0, t4);
        if (if_block2) if_block2.m(div0, null);
        append(div0, t5);
        if (if_block3) if_block3.m(div0, null);
        /*div0_binding*/

        ctx[94](div0);
        /*div1_binding*/

        ctx[95](div1);
        dispose = [listen(button, "blur",
        /*handleBlur*/
        ctx[25]), listen(button, "keydown",
        /*handleToggleKeydown*/
        ctx[30]), listen(button, "keyup",
        /*handleToggleKeyup*/
        ctx[31]), listen(button, "click",
        /*handleToggleClick*/
        ctx[32]), listen(div0, "scroll",
        /*handlePopupScroll*/
        ctx[38])];
      },
      p: function p(ctx, dirty) {
        var each_value_1 =
        /*summaryItems*/
        ctx[14];
        each_blocks_1 = update_keyed_each(each_blocks_1, dirty, get_key, 1, ctx, each_value_1, each0_lookup, span0, destroy_block, create_each_block_1, null, get_each_context_1);

        if (dirty[0] &
        /*summarySingle*/
        8192) {
          toggle_class(span0, "ss-summary-multiple", !
          /*summarySingle*/
          ctx[13]);
        }

        if (dirty[0] &
        /*summarySingle*/
        8192) {
          toggle_class(span0, "ss-summary-single",
          /*summarySingle*/
          ctx[13]);
        }

        if (dirty[0] &
        /*showFetching*/
        32768 && span1_class_value !== (span1_class_value = "ss-caret " + (
        /*showFetching*/
        ctx[15] ? FA_CARET_FETCHING : FA_CARET_DOWN))) {
          attr(span1, "class", span1_class_value);
        }

        if (dirty[0] &
        /*real*/
        1 && button_name_value !== (button_name_value = "ss_control_" +
        /*real*/
        ctx[0].name)) {
          attr(button, "name", button_name_value);
        }

        if (dirty[0] &
        /*selectionTip*/
        4096) {
          attr(button, "title",
          /*selectionTip*/
          ctx[12]);
        }

        if (
        /*typeahead*/
        ctx[6]) {
          if (if_block0) {
            if_block0.p(ctx, dirty);
          } else {
            if_block0 = create_if_block_11(ctx);
            if_block0.c();
            if_block0.m(div0, t2);
          }
        } else if (if_block0) {
          if_block0.d(1);
          if_block0 = null;
        }

        var each_value =
        /*displayItems*/
        ctx[9];
        each_blocks = update_keyed_each(each_blocks, dirty, get_key_1, 1, ctx, each_value, each1_lookup, div0, destroy_block, create_each_block, t3, get_each_context);

        if (
        /*typeahead*/
        ctx[6] &&
        /*actualCount*/
        ctx[8] === 0 &&
        /*previousFetch*/
        ctx[21] && !
        /*activeFetch*/
        ctx[20]) {
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

        if (
        /*fetchError*/
        ctx[16]) {
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

        if (
        /*selectionItems*/
        ctx[11].length >=
        /*maxItems*/
        ctx[5]) {
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

        if (dirty[0] &
        /*popupVisible*/
        131072) {
          toggle_class(div0, "show",
          /*popupVisible*/
          ctx[17]);
        }

        if (dirty[0] &
        /*popupTop*/
        262144) {
          toggle_class(div0, "ss-popup-top",
          /*popupTop*/
          ctx[18]);
        }

        if (dirty[0] &
        /*popupLeft*/
        524288) {
          toggle_class(div0, "ss-popup-left",
          /*popupLeft*/
          ctx[19]);
        }

        if (dirty[0] &
        /*real*/
        1 && div1_id_value !== (div1_id_value = "ss_container_" +
        /*real*/
        ctx[0].id)) {
          attr(div1, "id", div1_id_value);
        }

        if (dirty[0] &
        /*real*/
        1 && div1_name_value !== (div1_name_value = "ss_container_" +
        /*real*/
        ctx[0].name)) {
          attr(div1, "name", div1_name_value);
        }
      },
      i: noop,
      o: noop,
      d: function d(detaching) {
        if (detaching) detach(div1);

        for (var _i6 = 0; _i6 < each_blocks_1.length; _i6 += 1) {
          each_blocks_1[_i6].d();
        }
        /*button_binding*/


        ctx[91](null);
        if (if_block0) if_block0.d();

        for (var _i7 = 0; _i7 < each_blocks.length; _i7 += 1) {
          each_blocks[_i7].d();
        }

        if (if_block1) if_block1.d();
        if (if_block2) if_block2.d();
        if (if_block3) if_block3.d();
        /*div0_binding*/

        ctx[94](null);
        /*div1_binding*/

        ctx[95](null);
        run_all(dispose);
      }
    };
  }
  var I18N_DEFAULTS = {
    clear: "Clear",
    no_results: "No results",
    max_limit: "Max limit reached",
    selected_count: "selected",
    selected_more: "more"
  };
  var STYLE_DEFAULTS = {
    container_class: ""
  };
  var FIXED_SORT_KEY = "_";
  var MAX_ITEMS_DEFAULT = 100;
  var FETCH_INDICATOR_DELAY = 150;
  var SUMMARY_LEN = 2;
  var SUMMARY_WRAP = false;
  var FA_CARET_DOWN = "fas fa-caret-down";
  var FA_CARET_FETCHING = "far fa-hourglass";
  var FA_SELECTED = "far fa-check-square";
  var FA_NOT_SELECTED = "far fa-square";
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
    childList: true
  };

  function nop() {}

  function hasModifier(event) {
    return event.altKey || event.ctrlKey || event.metaKey || event.shiftKey;
  }

  function isMetaKey(event) {
    return META_KEYS[event.key] || META_KEYS[event.code];
  }

  function toUnderscore(key) {
    return key.split(/(?=[A-Z])/).join("_").toLowerCase();
  }

  function toDash(key) {
    return key.replace(/_/g, "-");
  }

  function createItemFromOption(el, styles) {
    var ds = el.dataset;
    var item = {
      id: el.value || "",
      text: el.text || ""
    };
    item.sort_key = item.text;

    if (ds) {
      if (ds.sortKey) {
        item.sort_key = ds.sortKey;
      }

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

      if (ds.itemHref) {
        item.href = ds.itemHref;
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
    }

    return item;
  }

  function createOptionFromItem(item) {
    var el = document.createElement("option");
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

    if (data.multiple) {
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
        id: "fixed_sep",
        separator: true
      });
    }

    filteredSelection.forEach(function (item) {
      items.push(item);
    });

    if (filteredSelection.length && filteredFetched.length) {
      items.push({
        id: "selection_sep",
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
      if (item.id) {
        item.id = item.id.toString();
      }

      item.sort_key = item.sort_key || item.text;
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
      if (item.separator) ; else if (!item.id) ; else if (item.placeholder) {
        // NOTE KI does not affect pagination
        act += 1; // NOTE KI separator is ignored always //NOTE KI dummy items ignored
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

  function handleKeyEvent(event, handlers) {
    (handlers[event.key] || handlers[event.code] || handlers.base)(event);
  }

  function instance($$self, $$props, $$invalidate) {
    var real = $$props.real;
    var _$$props$config = $$props.config,
        config = _$$props$config === void 0 ? {} : _$$props$config;
    var containerEl;
    var inputEl;
    var toggleEl;
    var popupEl;
    var mutationObserver = new MutationObserver(handleMutation);
    var setupDone = false;
    var translations = {};
    var styles = {};
    var fetcher = inlineFetcher;
    var remote = false;
    var maxItems = MAX_ITEMS_DEFAULT;
    var typeahead = false;
    var summaryLen = SUMMARY_LEN;
    var summaryWrap = SUMMARY_WRAP;
    var keepResult = true;
    var placeholderItem = {
      id: "",
      text: "",
      blank: true
    };
    var mounted = false;
    var query = "";
    var fixedItems = [];
    var fixedById = {};
    var result = createResult({});
    var actualCount = 0;
    var hasMore = false;
    var display = createDisplay({});
    var displayItems = [];
    var selectionById = {};
    var selectionItems = [];
    var selectionTip = "";
    var summarySingle = true;
    var summaryItems = [];
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
      $$invalidate(7, query = "");

      if (!keepResult) {
        previousQuery = null;
      }
    }

    function openPopup() {
      if (!popupVisible) {
        $$invalidate(17, popupVisible = true);
        var w = containerEl.offsetWidth;
        $$invalidate(4, popupEl.style.minWidth = w + "px", popupEl);
        var bounds = containerEl.getBoundingClientRect();
        var middleY = window.innerHeight / 2;
        var middleX = window.innerWidth / 2;
        $$invalidate(18, popupTop = bounds.y > middleY);
        $$invalidate(19, popupLeft = bounds.x + bounds.width > middleX);
      }
    }

    function closePopup(focusToggle) {
      $$invalidate(17, popupVisible = false);
      updateDisplay();

      if (focusToggle) {
        toggleEl.focus();
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
          byId = _defineProperty({}, item.id, item);
        }
      } else {
        byId = _defineProperty({}, item.id, item);
      }

      updateSelection(byId);

      if (!multiple || item.blank) {
        clearQuery();
        closePopup(containsElement(document.activeElement));
      }

      syncToRealSelection();
      real.dispatchEvent(new CustomEvent("select-select", {
        detail: selectionItems
      }));
    }

    function executeAction(id) {
      var item = display.byId[id];

      if (!item) {
        console.error("MISSING action item=" + id);
        return;
      }

      closePopup(containsElement(document.activeElement));
      real.dispatchEvent(new CustomEvent("select-action", {
        detail: item
      }));
    }

    function selectElement(el) {
      if (el.dataset.action) {
        executeAction(el.dataset.id);
      } else {
        selectItemImpl(el.dataset.id);

        if (el.dataset.selected) ; //             selectionDropdownItems = selectionDropdownItems;

      }
    }

    function containsElement(el) {
      return containerEl.contains(el) || popupEl.contains(el);
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
        var item = oldById[el.value || ""];

        if (!item) {
          item = createItemFromOption(el);
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

          var el = real.querySelector("option[value=\"" + item.id + "\"]");

          if (!el) {
            el = createOptionFromItem(item);
            real.appendChild(el);
          }
        });
      }

      var options = real.options;

      for (var i = options.length - 1; i >= 0; i--) {
        var el = options[i];
        var selected = !!selectionById[el.value];
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

    function updateFixedItems() {
      var byId = {};
      var items = [];

      if (multiple) {
        items.push(placeholderItem);
      }

      var options = real.options;

      for (var i = 0; i < options.length; i++) {
        var el = options[i];

        if (!el.value || el.dataset.itemFixed != null) {
          var item = createItemFromOption(el);
          item.sort_key = FIXED_SORT_KEY + item.sort_key;
          item.fixed = true;
          byId[item.id] = item;
          items.push(item);
        }
      }

      var blankItem = byId[""];

      if (blankItem) {
        blankItem.blank = true;
      }

      fixedItems = items;
      fixedById = byId;
    }

    function updateDisplay() {

      if (!display.dirty) {
        return;
      }

      display = createDisplay({
        typeahead: typeahead,
        multiple: multiple,
        fixedItems: fixedItems,
        fetchedItems: result.fetchedItems,
        selectionItems: selectionItems
      });
      $$invalidate(9, displayItems = display.displayItems);
    }

    function appendFetchedToDisplay(fetchedItems) {
      var byId = display.byId;
      var displayItems = display.displayItems;
      fetchedItems.forEach(function (item) {
        if (byId[item.id]) {
          console.warn("DUPLICATE: fetched-append", item);
          return;
        }

        displayItems.push(item);

        if (!item.separator) {
          byId[item.id] = item;
        }
      });
      displayItems = display.displayItems;
    }

    function updateSelection(byId) {
      var items = Object.values(byId);

      if (items.length == 0) {
        var blankItem = display.blankItem || placeholderItem;
        byId = _defineProperty({}, blankItem.id, blankItem);
        items = [blankItem];
      }

      $$invalidate(10, selectionById = byId);
      $$invalidate(11, selectionItems = items.sort(function (a, b) {
        return a.sort_key.localeCompare(b.sort_key);
      }));
      var tip = selectionItems.map(function (item) {
        return item.text;
      }).join(", ");
      var len = selectionItems.length;

      if (len > 1) {
        $$invalidate(14, summaryItems = selectionItems.slice(0, summaryLen));

        if (summaryItems.length < len) {
          summaryItems.push({
            id: "more",
            text: "".concat(len - summaryLen, " ").concat(translate("selected_more")),
            item_class: "ss-summary-more"
          });
        }

        $$invalidate(12, selectionTip = "".concat(len, " ").concat(translate("selected_count"), ": ").concat(tip));
      } else {
        $$invalidate(14, summaryItems = selectionItems);

        if (summaryItems[0].blank) {
          $$invalidate(12, selectionTip = "");
        } else {
          $$invalidate(12, selectionTip = summaryItems[0].text);
        }
      }

      $$invalidate(13, summarySingle = summaryItems[0].blank || !multiple);
      display.dirty = true;
    }

    function reload() {
      if (isSyncToReal) {
        return;
      }

      updateFixedItems();
      syncFromRealSelection();
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
        var items = [];
        var pattern = query.toUpperCase().trim();
        var options = real.options;

        for (var i = 0; i < options.length; i++) {
          var item = createItemFromOption(options[i]);
          var match = void 0; // NOTE KI "blank" is handled as fixed item

          if (item.blank) {
            match = false;
          } else {
            match = item.separator || item.text.toUpperCase().includes(pattern) || item.desc && item.desc.toUpperCase().includes(pattern);
          }

          if (match) {
            items.push(item);
          }
        }

        return items;
      }

      var promise = new Promise(function (resolve, reject) {
        resolve({
          items: createItems(),
          info: {
            more: false
          }
        });
      });
      return promise;
    }
    /**
    * @return Promise
    */


    function fetchItems(fetchMore, fetchId) {
      var currentQuery;

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
      var currentFetchOffset = 0;

      if (fetchMore) {
        currentFetchOffset = result.offsetCount;
      } else {
        hasMore = false;
      }

      fetchingMore = fetchMore;
      $$invalidate(16, fetchError = null);
      $$invalidate(15, showFetching = false);
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
          $$invalidate(8, actualCount = result.actualCount);
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

          $$invalidate(21, previousFetch = currentFetch);
          $$invalidate(20, activeFetch = null);
          fetchingMore = false;
          $$invalidate(15, showFetching = false);
          setTimeout(function () {
            fetchMoreIfneeded();
          });
        }
      })["catch"](function (err) {
        if (currentFetch === activeFetch) {
          console.error(err);
          $$invalidate(16, fetchError = err);

          var _result = createResult({});

          $$invalidate(8, actualCount = _result.actualCount);
          hasMore = _result.more;
          display.dirty = true;
          updateDisplay();
          previousQuery = null;
          $$invalidate(21, previousFetch = currentFetch);
          $$invalidate(20, activeFetch = null);
          fetchingMore = false;
          $$invalidate(15, showFetching = false);
          toggleEl.focus();
          openPopup();
        }
      });
      setTimeout(function () {
        if (activeFetch === currentFetch) {
          $$invalidate(15, showFetching = true);
        }
      }, FETCH_INDICATOR_DELAY);
      $$invalidate(20, activeFetch = currentFetch);
      $$invalidate(21, previousFetch = null);
      return currentFetch;
    }

    function cancelFetch() {
      if (activeFetch !== null) {
        $$invalidate(20, activeFetch = null); // no result fetched; since it doesn't match input any longer

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
      // Initial selection
      syncFromRealSelection();
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

    function setupComponent() {
      real.classList.add("d-none");
      $$invalidate(22, multiple = real.multiple);

      if (config.remote) {
        remote = true;
        fetcher = config.fetcher;
      }

      $$invalidate(6, typeahead = config.typeahead || false);
      $$invalidate(5, maxItems = config.maxItems || MAX_ITEMS_DEFAULT);
      summaryLen = config.summaryLen || SUMMARY_LEN;
      summaryWrap = config.summaryWrap != null ? config.summaryWrap : SUMMARY_WRAP;
      keepResult = config.keepResult != null ? config.keepResult : true;
      Object.assign(translations, I18N_DEFAULTS);

      if (config.translations) {
        Object.assign(translations, config.translations);
      }

      Object.assign(styles, STYLE_DEFAULTS);

      if (config.styles) {
        Object.assign(styles, config.styles);
      }

      $$invalidate(5, maxItems = config.maxItems || MAX_ITEMS_DEFAULT);
      placeholderItem.text = config.placeholder || "";

      if (jQuery.tooltip) {
        jQuery(toggleEl).tooltip();
      }

      mutationObserver.observe(real, MUTATIONS);
      updateFixedItems();
      display.dirty = true;
      updateDisplay();
    }

    function handleMutation(mutationsList, observer) {
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = mutationsList[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var mutation = _step.value;

          if (mutation.type === "childList") {
            reload();
          }
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator["return"] != null) {
            _iterator["return"]();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }
    }

    var eventListeners = {
      change: function change(event) {

        if (!isSyncToReal) {
          syncFromRealSelection();
        }
      },
      "select-reload": function selectReload(event) {
        reload();
      }
    }; ////////////////////////////////////////////////////////////
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
          focusNextByKey(event.key);
        }
      },
      ArrowDown: function ArrowDown(event) {
        openPopup();
        fetchItems();

        if (typeahead) {
          inputEl.focus();
        } else {
          var next = popupEl.querySelectorAll(".ss-js-item")[0];

          while (next && next.classList.contains("ss-js-dead")) {
            next = next.nextElementSibling;
          }

          focusItem(next);
        }

        event.preventDefault();
      },
      ArrowUp: nop,
      Enter: function Enter(event) {
        if (hasModifier(event)) {
          return;
        }

        if (popupVisible) {
          // NOTE KI don't cancel fetch
          clearQuery();
          closePopup(false);
        } else {
          openPopup();
          fetchItems(false);
        }

        event.preventDefault();
      },
      Space: function Space(event) {
        if (hasModifier(event)) {
          return;
        }

        if (popupVisible) {
          // NOTE KI don't cancel fetch
          clearQuery();
          closePopup(false);
        } else {
          openPopup();
          fetchItems(false);
        }

        event.preventDefault();
      },
      Escape: function Escape(event) {
        cancelFetch();
        clearQuery();
        closePopup(false);
      },
      Delete: function Delete(event) {
        selectItem("");
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
      ArrowDown: function ArrowDown(event) {
        var next = popupEl.querySelectorAll(".ss-js-item")[0];

        while (next && next.classList.contains("ss-js-dead")) {
          next = next.nextElementSibling;
        }

        focusItem(next);
        event.preventDefault();
      },
      ArrowUp: function ArrowUp(event) {
        // NOTE KI closing popup here is *irritating* i.e. if one is trying to select
        // first entry in dropdown
        event.preventDefault();
      },
      Escape: function Escape(event) {
        cancelFetch();
        clearQuery();
        closePopup(true);
      },
      Tab: function Tab(event) {
        toggleEl.focus();
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

    function focusNextByKey(ch) {
      ch = ch.toUpperCase();
      var nodes = popupEl.querySelectorAll(".ss-js-item");
      var curr = document.activeElement;

      if (curr.classList.contains("ss-js-item")) {
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

      focusItem(curr);
    }

    function focusItem(item) {
      if (item) {
        if (typeahead && popupEl.children[1] === item) {
          popupEl.scroll(0, 0);
        } //         item.scrollIntoView();


        item.focus();
      }
    }

    function focusPreviousItem(el) {
      var next = el.previousElementSibling;

      if (next) {
        while (next && next.classList.contains("ss-js-dead")) {
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
      var next = el.nextElementSibling;

      if (next) {
        while (next && next.classList.contains("ss-js-dead")) {
          next = next.nextElementSibling;
        }

        if (next && !next.classList.contains("ss-js-item")) {
          next = null;
        }
      }

      focusItem(next);
      return next;
    }

    var itemKeydownHandlers = {
      base: function base(event) {
        if (isMetaKey(event)) {
          return;
        }

        if (typeahead) {
          inputEl.focus();
        } else {
          focusNextByKey(event.key);
        }
      },
      ArrowDown: function ArrowDown(event) {
        if (!fetchingMore) {
          //             console.log("BLOCKED down");
          focusNextItem(event.target);
        }

        event.preventDefault();
      },
      ArrowUp: function ArrowUp(event) {
        focusPreviousItem(event.target);
        event.preventDefault();
      },
      Enter: function Enter(event) {
        if (!hasModifier(event)) {
          selectElement(event.target);
          event.preventDefault();
        }
      },
      Space: function Space(event) {
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
      Escape: function Escape(event) {
        cancelFetch();
        clearQuery();
        closePopup(true);
      },
      Tab: function Tab(event) {
        toggleEl.focus();
        event.preventDefault();
      }
    };
    var itemKeyupHandlers = {
      base: nop,
      // allow "meta" keys to navigate in items
      PageUp: function PageUp(event) {
        var scrollLeft = document.body.scrollLeft;
        var scrollTop = document.body.scrollTop;
        var rect = popupEl.getBoundingClientRect();
        var next = document.elementFromPoint(scrollLeft + rect.x + 10, scrollTop + rect.top + 1);

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
      PageDown: function PageDown(event) {
        var scrollLeft = document.body.scrollLeft;
        var scrollTop = document.body.scrollTop;
        var h = popupEl.offsetHeight;
        var rect = popupEl.getBoundingClientRect();
        var next = document.elementFromPoint(scrollLeft + rect.x + 10, scrollTop + rect.top + h - 10);

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
      Home: function Home(event) {
        var next = popupEl.querySelector(".ss-js-item:first-child");
        focusItem(next);
        event.preventDefault();
      },
      End: function End(event) {
        var next = popupEl.querySelector(".ss-js-item:last-child");
        focusItem(next);
        event.preventDefault();
      }
    };

    function handleBlur(event) {
      if (
      /*event.sourceCapabilities &&*/
      !containsElement(event.relatedTarget)) {
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
      if (event.button === 0) {
        if (!hasModifier(event)) {
          selectElement(event.target);
        }
      }
    }

    function handleToggleLinkClick(event) {
      toggleEl.focus();

      if (!hasModifier(event)) {
        event.preventDefault();
      }
    }

    function handleItemLinkClick(event) {
      var el = event.target.closest(".ss-item");
      el.focus();

      if (!hasModifier(event)) {
        event.preventDefault();
        event.stopPropagation();

        if (event.button === 0) {
          if (!hasModifier(event)) {
            selectElement(el);
          }
        }
      } // activate link

    }

    function handlePopupScroll(event) {
      fetchMoreIfneeded();
    }

    function button_binding($$value) {
      binding_callbacks[$$value ? "unshift" : "push"](function () {
        $$invalidate(3, toggleEl = $$value);
      });
    }

    function input_binding($$value) {
      binding_callbacks[$$value ? "unshift" : "push"](function () {
        $$invalidate(2, inputEl = $$value);
      });
    }

    function input_input_handler() {
      query = this.value;
      $$invalidate(7, query);
    }

    function div0_binding($$value) {
      binding_callbacks[$$value ? "unshift" : "push"](function () {
        $$invalidate(4, popupEl = $$value);
      });
    }

    function div1_binding($$value) {
      binding_callbacks[$$value ? "unshift" : "push"](function () {
        $$invalidate(1, containerEl = $$value);
      });
    }

    $$self.$set = function ($$props) {
      if ("real" in $$props) $$invalidate(0, real = $$props.real);
      if ("config" in $$props) $$invalidate(39, config = $$props.config);
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

    return [real, containerEl, inputEl, toggleEl, popupEl, maxItems, typeahead, query, actualCount, displayItems, selectionById, selectionItems, selectionTip, summarySingle, summaryItems, showFetching, fetchError, popupVisible, popupTop, popupLeft, activeFetch, previousFetch, multiple, styles, translate, handleBlur, handleInputBlur, handleInputKeypress, handleInputKeydown, handleInputKeyup, handleToggleKeydown, handleToggleKeyup, handleToggleClick, handleItemKeydown, handleItemKeyup, handleItemClick, handleToggleLinkClick, handleItemLinkClick, handlePopupScroll, config, selectItem, setupDone, fetcher, remote, summaryLen, summaryWrap, keepResult, placeholderItem, mounted, fixedItems, fixedById, result, hasMore, display, fetchingMore, previousQuery, isSyncToReal, mutationObserver, translations, clearQuery, openPopup, closePopup, selectItemImpl, executeAction, selectElement, containsElement, syncFromRealSelection, syncToRealSelection, updateFixedItems, updateDisplay, appendFetchedToDisplay, updateSelection, reload, inlineFetcher, fetchItems, cancelFetch, fetchMoreIfneeded, setupComponent, handleMutation, eventListeners, toggleKeydownHandlers, toggleKeyupHandlers, inputKeypressHandlers, inputKeydownHandlers, inputKeyupHandlers, focusNextByKey, focusItem, focusPreviousItem, focusNextItem, itemKeydownHandlers, itemKeyupHandlers, button_binding, input_binding, input_input_handler, div0_binding, div1_binding];
  }

  var Select =
  /*#__PURE__*/
  function (_SvelteComponent) {
    _inherits(Select, _SvelteComponent);

    function Select(options) {
      var _this;

      _classCallCheck(this, Select);

      _this = _possibleConstructorReturn(this, _getPrototypeOf(Select).call(this));
      init(_assertThisInitialized(_this), options, instance, create_fragment, safe_not_equal, {
        real: 0,
        config: 39,
        selectItem: 40
      }, [-1, -1, -1, -1]);
      return _this;
    }

    _createClass(Select, [{
      key: "selectItem",
      get: function get() {
        return this.$$.ctx[40];
      }
    }]);

    return Select;
  }(SvelteComponent);

  return Select;

}());
