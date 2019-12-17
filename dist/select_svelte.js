var Select = (function (exports) {
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

  var current_component;

  function set_current_component(component) {
    current_component = component;
  }

  function get_current_component() {
    if (!current_component) throw new Error("Function called outside component initialization");
    return current_component;
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
      $$.fragment && $$.fragment.p($$.ctx, $$.dirty);
      $$.dirty = [-1];
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
      var value = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : ret;

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
    child_ctx[84] = list[i];
    return child_ctx;
  }

  function get_each_context_1(ctx, list, i) {
    var child_ctx = ctx.slice();
    child_ctx[84] = list[i];
    child_ctx[88] = i;
    return child_ctx;
  }

  function get_each_context_3(ctx, list, i) {
    var child_ctx = ctx.slice();
    child_ctx[84] = list[i];
    child_ctx[88] = i;
    return child_ctx;
  }

  function get_each_context_2(ctx, list, i) {
    var child_ctx = ctx.slice();
    child_ctx[84] = list[i];
    child_ctx[88] = i;
    return child_ctx;
  } // (1117:2) {:else}


  function create_else_block_4(ctx) {
    var button;
    var span1;
    var each_blocks = [];
    var each_1_lookup = new Map();
    var t;
    var span0;
    var i;
    var i_class_value;
    var dispose;
    var each_value_3 =
    /*selectedItems*/
    ctx[12];

    var get_key = function get_key(ctx) {
      return (
        /*item*/
        ctx[84].id
      );
    };

    for (var _i = 0; _i < each_value_3.length; _i += 1) {
      var child_ctx = get_each_context_3(ctx, each_value_3, _i);
      var key = get_key(child_ctx);
      each_1_lookup.set(key, each_blocks[_i] = create_each_block_3(key, child_ctx));
    }

    return {
      c: function c() {
        button = element("button");
        span1 = element("span");

        for (var _i2 = 0; _i2 < each_blocks.length; _i2 += 1) {
          each_blocks[_i2].c();
        }

        t = space();
        span0 = element("span");
        i = element("i");
        attr(i, "class", i_class_value = "text-dark " + (
        /*showFetching*/
        ctx[13] ? CARET_FETCHING : CARET_DOWN));
        attr(span0, "class", "ml-auto");
        attr(span1, "class", "ss-no-click ss-selection text-dark d-flex");
        attr(button, "class", "form-control d-flex");
        attr(button, "type", "button");
        attr(button, "tabindex", "0");
        dispose = [listen(button, "blur",
        /*handleBlur*/
        ctx[22]), listen(button, "keydown",
        /*handleToggleKeydown*/
        ctx[27]), listen(button, "click",
        /*handleToggleClick*/
        ctx[28])];
      },
      m: function m(target, anchor) {
        insert(target, button, anchor);
        append(button, span1);

        for (var _i3 = 0; _i3 < each_blocks.length; _i3 += 1) {
          each_blocks[_i3].m(span1, null);
        }

        append(span1, t);
        append(span1, span0);
        append(span0, i);
        /*button_binding_1*/

        ctx[80](button);
      },
      p: function p(ctx, dirty) {
        var each_value_3 =
        /*selectedItems*/
        ctx[12];
        each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value_3, each_1_lookup, span1, destroy_block, create_each_block_3, t, get_each_context_3);

        if (dirty[0] &
        /*showFetching*/
        8192 && i_class_value !== (i_class_value = "text-dark " + (
        /*showFetching*/
        ctx[13] ? CARET_FETCHING : CARET_DOWN))) {
          attr(i, "class", i_class_value);
        }
      },
      d: function d(detaching) {
        if (detaching) detach(button);

        for (var _i4 = 0; _i4 < each_blocks.length; _i4 += 1) {
          each_blocks[_i4].d();
        }
        /*button_binding_1*/


        ctx[80](null);
        run_all(dispose);
      }
    };
  } // (1075:2) {#if typeahead}


  function create_if_block_18(ctx) {
    var div2;
    var input_1;
    var input_1_class_value;
    var t0;
    var div0;
    var span;
    var each_blocks = [];
    var each_1_lookup = new Map();
    var div0_class_value;
    var t1;
    var div1;
    var button;
    var i;
    var i_class_value;
    var dispose;
    var each_value_2 =
    /*selectedItems*/
    ctx[12];

    var get_key = function get_key(ctx) {
      return (
        /*item*/
        ctx[84].id
      );
    };

    for (var _i5 = 0; _i5 < each_value_2.length; _i5 += 1) {
      var child_ctx = get_each_context_2(ctx, each_value_2, _i5);
      var key = get_key(child_ctx);
      each_1_lookup.set(key, each_blocks[_i5] = create_each_block_2(key, child_ctx));
    }

    return {
      c: function c() {
        div2 = element("div");
        input_1 = element("input");
        t0 = space();
        div0 = element("div");
        span = element("span");

        for (var _i6 = 0; _i6 < each_blocks.length; _i6 += 1) {
          each_blocks[_i6].c();
        }

        t1 = space();
        div1 = element("div");
        button = element("button");
        i = element("i");
        attr(input_1, "class", input_1_class_value = "ss-input form-control " + (
        /*inputVisible*/
        ctx[18] ? "" : "d-none"));
        attr(input_1, "autocomplete", "new-password");
        attr(input_1, "autocorrect", "off");
        attr(input_1, "autocapitalize", "off");
        attr(input_1, "spellcheck", "off");
        attr(span, "class", "ss-no-click ss-selection text-dark d-flex");
        attr(div0, "class", div0_class_value = "form-control " + (
        /*inputVisible*/
        ctx[18] ? "d-none" : ""));
        attr(div0, "tabindex", "0");
        attr(i, "class", i_class_value = "text-dark " + (
        /*showFetching*/
        ctx[13] ? CARET_FETCHING : CARET_DOWN));
        attr(button, "class", "btn btn-outline-secondary");
        attr(button, "type", "button");
        attr(button, "tabindex", "-1");
        attr(div1, "class", "input-group-append");
        attr(div2, "class", "input-group");
        dispose = [listen(input_1, "input",
        /*input_1_input_handler*/
        ctx[76]), listen(input_1, "blur",
        /*handleInputBlur*/
        ctx[23]), listen(input_1, "keypress",
        /*handleInputKeypress*/
        ctx[24]), listen(input_1, "keydown",
        /*handleInputKeydown*/
        ctx[25]), listen(input_1, "keyup",
        /*handleInputKeyup*/
        ctx[26]), listen(div0, "blur",
        /*handleBlur*/
        ctx[22]), listen(div0, "keydown",
        /*handleToggleKeydown*/
        ctx[27]), listen(div0, "click",
        /*handleToggleClick*/
        ctx[28]), listen(button, "blur",
        /*handleBlur*/
        ctx[22]), listen(button, "keydown",
        /*handleToggleKeydown*/
        ctx[27]), listen(button, "click",
        /*handleToggleClick*/
        ctx[28])];
      },
      m: function m(target, anchor) {
        insert(target, div2, anchor);
        append(div2, input_1);
        set_input_value(input_1,
        /*query*/
        ctx[2]);
        /*input_1_binding*/

        ctx[77](input_1);
        append(div2, t0);
        append(div2, div0);
        append(div0, span);

        for (var _i7 = 0; _i7 < each_blocks.length; _i7 += 1) {
          each_blocks[_i7].m(span, null);
        }
        /*div0_binding*/


        ctx[78](div0);
        append(div2, t1);
        append(div2, div1);
        append(div1, button);
        append(button, i);
        /*button_binding*/

        ctx[79](button);
      },
      p: function p(ctx, dirty) {
        if (dirty[0] &
        /*inputVisible*/
        262144 && input_1_class_value !== (input_1_class_value = "ss-input form-control " + (
        /*inputVisible*/
        ctx[18] ? "" : "d-none"))) {
          attr(input_1, "class", input_1_class_value);
        }

        if (dirty[0] &
        /*query*/
        4 && input_1.value !==
        /*query*/
        ctx[2]) {
          set_input_value(input_1,
          /*query*/
          ctx[2]);
        }

        var each_value_2 =
        /*selectedItems*/
        ctx[12];
        each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value_2, each_1_lookup, span, destroy_block, create_each_block_2, null, get_each_context_2);

        if (dirty[0] &
        /*inputVisible*/
        262144 && div0_class_value !== (div0_class_value = "form-control " + (
        /*inputVisible*/
        ctx[18] ? "d-none" : ""))) {
          attr(div0, "class", div0_class_value);
        }

        if (dirty[0] &
        /*showFetching*/
        8192 && i_class_value !== (i_class_value = "text-dark " + (
        /*showFetching*/
        ctx[13] ? CARET_FETCHING : CARET_DOWN))) {
          attr(i, "class", i_class_value);
        }
      },
      d: function d(detaching) {
        if (detaching) detach(div2);
        /*input_1_binding*/

        ctx[77](null);

        for (var _i8 = 0; _i8 < each_blocks.length; _i8 += 1) {
          each_blocks[_i8].d();
        }
        /*div0_binding*/


        ctx[78](null);
        /*button_binding*/

        ctx[79](null);
        run_all(dispose);
      }
    };
  } // (1127:8) {#each selectedItems as item, index (item.id)}


  function create_each_block_3(key_1, ctx) {
    var span;
    var t0_value = (
    /*index*/
    ctx[88] > 0 ? ", " : "") + "";
    var t0;
    var t1_value =
    /*item*/
    ctx[84].text + "";
    var t1;
    var span_class_value;
    return {
      key: key_1,
      first: null,
      c: function c() {
        span = element("span");
        t0 = text(t0_value);
        t1 = text(t1_value);
        attr(span, "class", span_class_value = "ss-no-click ss-selected-item " +
        /*item*/
        ctx[84].itemClass + " " + (
        /*item*/
        ctx[84].id ? "" : "text-muted"));
        this.first = span;
      },
      m: function m(target, anchor) {
        insert(target, span, anchor);
        append(span, t0);
        append(span, t1);
      },
      p: function p(ctx, dirty) {
        if (dirty[0] &
        /*selectedItems*/
        4096 && t0_value !== (t0_value = (
        /*index*/
        ctx[88] > 0 ? ", " : "") + "")) set_data(t0, t0_value);
        if (dirty[0] &
        /*selectedItems*/
        4096 && t1_value !== (t1_value =
        /*item*/
        ctx[84].text + "")) set_data(t1, t1_value);

        if (dirty[0] &
        /*selectedItems*/
        4096 && span_class_value !== (span_class_value = "ss-no-click ss-selected-item " +
        /*item*/
        ctx[84].itemClass + " " + (
        /*item*/
        ctx[84].id ? "" : "text-muted"))) {
          attr(span, "class", span_class_value);
        }
      },
      d: function d(detaching) {
        if (detaching) detach(span);
      }
    };
  } // (1098:10) {#each selectedItems as item, index (item.id)}


  function create_each_block_2(key_1, ctx) {
    var span;
    var t0_value = (
    /*index*/
    ctx[88] > 0 ? ", " : "") + "";
    var t0;
    var t1_value =
    /*item*/
    ctx[84].text + "";
    var t1;
    var span_class_value;
    return {
      key: key_1,
      first: null,
      c: function c() {
        span = element("span");
        t0 = text(t0_value);
        t1 = text(t1_value);
        attr(span, "class", span_class_value = "ss-no-click ss-selected-item " +
        /*item*/
        ctx[84].itemClass + " " + (
        /*item*/
        ctx[84].id ? "" : "text-muted"));
        this.first = span;
      },
      m: function m(target, anchor) {
        insert(target, span, anchor);
        append(span, t0);
        append(span, t1);
      },
      p: function p(ctx, dirty) {
        if (dirty[0] &
        /*selectedItems*/
        4096 && t0_value !== (t0_value = (
        /*index*/
        ctx[88] > 0 ? ", " : "") + "")) set_data(t0, t0_value);
        if (dirty[0] &
        /*selectedItems*/
        4096 && t1_value !== (t1_value =
        /*item*/
        ctx[84].text + "")) set_data(t1, t1_value);

        if (dirty[0] &
        /*selectedItems*/
        4096 && span_class_value !== (span_class_value = "ss-no-click ss-selected-item " +
        /*item*/
        ctx[84].itemClass + " " + (
        /*item*/
        ctx[84].id ? "" : "text-muted"))) {
          attr(span, "class", span_class_value);
        }
      },
      d: function d(detaching) {
        if (detaching) detach(span);
      }
    };
  } // (1151:32) 


  function create_if_block_16(ctx) {
    var div;

    function select_block_type_2(ctx, dirty) {
      if (
      /*tooShort*/
      ctx[15]) return create_if_block_17;
      return create_else_block_3;
    }

    var current_block_type = select_block_type_2(ctx);
    var if_block = current_block_type(ctx);
    return {
      c: function c() {
        div = element("div");
        if_block.c();
        attr(div, "tabindex", "-1");
        attr(div, "class", "dropdown-item text-muted ss-item");
      },
      m: function m(target, anchor) {
        insert(target, div, anchor);
        if_block.m(div, null);
      },
      p: function p(ctx, dirty) {
        if (current_block_type === (current_block_type = select_block_type_2(ctx)) && if_block) {
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
  } // (1145:43) 


  function create_if_block_15(ctx) {
    return {
      c: noop,
      m: noop,
      p: noop,
      d: noop
    };
  } // (1140:4) {#if fetchError}


  function create_if_block_14(ctx) {
    var div;
    var t;
    return {
      c: function c() {
        div = element("div");
        t = text(
        /*fetchError*/
        ctx[17]);
        attr(div, "tabindex", "-1");
        attr(div, "class", "dropdown-item text-danger ss-item");
      },
      m: function m(target, anchor) {
        insert(target, div, anchor);
        append(div, t);
      },
      p: function p(ctx, dirty) {
        if (dirty[0] &
        /*fetchError*/
        131072) set_data(t,
        /*fetchError*/
        ctx[17]);
      },
      d: function d(detaching) {
        if (detaching) detach(div);
      }
    };
  } // (1155:8) {:else}


  function create_else_block_3(ctx) {
    var t_value = translate("no_results") + "";
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
  } // (1153:8) {#if tooShort }


  function create_if_block_17(ctx) {
    var t_value = translate("too_short") + "";
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
  } // (1161:4) {#if typeahead}


  function create_if_block_8(ctx) {
    var each_blocks = [];
    var each_1_lookup = new Map();
    var t;
    var div;
    var dispose;
    var each_value_1 =
    /*selectedItems*/
    ctx[12];

    var get_key = function get_key(ctx) {
      return (
        /*item*/
        ctx[84].id
      );
    };

    for (var i = 0; i < each_value_1.length; i += 1) {
      var child_ctx = get_each_context_1(ctx, each_value_1, i);
      var key = get_key(child_ctx);
      each_1_lookup.set(key, each_blocks[i] = create_each_block_1(key, child_ctx));
    }

    return {
      c: function c() {
        for (var _i9 = 0; _i9 < each_blocks.length; _i9 += 1) {
          each_blocks[_i9].c();
        }

        t = space();
        div = element("div");
        attr(div, "tabindex", "-1");
        attr(div, "class", "dropdown-divider ki-js-blank");
        dispose = listen(div, "keydown",
        /*handleItemKeydown*/
        ctx[29]);
      },
      m: function m(target, anchor) {
        for (var _i10 = 0; _i10 < each_blocks.length; _i10 += 1) {
          each_blocks[_i10].m(target, anchor);
        }

        insert(target, t, anchor);
        insert(target, div, anchor);
      },
      p: function p(ctx, dirty) {
        var each_value_1 =
        /*selectedItems*/
        ctx[12];
        each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value_1, each_1_lookup, t.parentNode, destroy_block, create_each_block_1, t, get_each_context_1);
      },
      d: function d(detaching) {
        for (var _i11 = 0; _i11 < each_blocks.length; _i11 += 1) {
          each_blocks[_i11].d(detaching);
        }

        if (detaching) detach(t);
        if (detaching) detach(div);
        dispose();
      }
    };
  } // (1163:8) {#if item.id}


  function create_if_block_9(ctx) {
    var div3;
    var div2;
    var t0;
    var div1;
    var div0;
    var div0_class_value;
    var t1;
    var div3_data_id_value;
    var dispose;
    var if_block0 =
    /*multiple*/
    ctx[21] && create_if_block_12(ctx);

    function select_block_type_3(ctx, dirty) {
      if (
      /*item*/
      ctx[84].id) return create_if_block_11;
      return create_else_block_2;
    }

    var current_block_type = select_block_type_3(ctx);
    var if_block1 = current_block_type(ctx);
    var if_block2 =
    /*item*/
    ctx[84].desc && create_if_block_10(ctx);
    return {
      c: function c() {
        div3 = element("div");
        div2 = element("div");
        if (if_block0) if_block0.c();
        t0 = space();
        div1 = element("div");
        div0 = element("div");
        if_block1.c();
        t1 = space();
        if (if_block2) if_block2.c();
        attr(div0, "class", div0_class_value = "ss-no-click " +
        /*item*/
        ctx[84].itemClass);
        attr(div1, "class", "d-inline-block");
        attr(div2, "class", "ss-no-click");
        attr(div3, "tabindex", "1");
        attr(div3, "class", "ki-js-item dropdown-item ss-item");
        attr(div3, "data-id", div3_data_id_value =
        /*item*/
        ctx[84].id);
        attr(div3, "data-selection", "true");
        dispose = [listen(div3, "blur",
        /*handleBlur*/
        ctx[22]), listen(div3, "click",
        /*handleItemClick*/
        ctx[31]), listen(div3, "keydown",
        /*handleItemKeydown*/
        ctx[29]), listen(div3, "keyup",
        /*handleItemKeyup*/
        ctx[30])];
      },
      m: function m(target, anchor) {
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
      p: function p(ctx, dirty) {
        if (
        /*multiple*/
        ctx[21]) {
          if (if_block0) {
            if_block0.p(ctx, dirty);
          } else {
            if_block0 = create_if_block_12(ctx);
            if_block0.c();
            if_block0.m(div2, t0);
          }
        } else if (if_block0) {
          if_block0.d(1);
          if_block0 = null;
        }

        if (current_block_type === (current_block_type = select_block_type_3(ctx)) && if_block1) {
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
        /*selectedItems*/
        4096 && div0_class_value !== (div0_class_value = "ss-no-click " +
        /*item*/
        ctx[84].itemClass)) {
          attr(div0, "class", div0_class_value);
        }

        if (
        /*item*/
        ctx[84].desc) {
          if (if_block2) {
            if_block2.p(ctx, dirty);
          } else {
            if_block2 = create_if_block_10(ctx);
            if_block2.c();
            if_block2.m(div1, null);
          }
        } else if (if_block2) {
          if_block2.d(1);
          if_block2 = null;
        }

        if (dirty[0] &
        /*selectedItems*/
        4096 && div3_data_id_value !== (div3_data_id_value =
        /*item*/
        ctx[84].id)) {
          attr(div3, "data-id", div3_data_id_value);
        }
      },
      d: function d(detaching) {
        if (detaching) detach(div3);
        if (if_block0) if_block0.d();
        if_block1.d();
        if (if_block2) if_block2.d();
        run_all(dispose);
      }
    };
  } // (1174:14) {#if multiple}


  function create_if_block_12(ctx) {
    var div;
    var if_block =
    /*item*/
    ctx[84].id && create_if_block_13();
    return {
      c: function c() {
        div = element("div");
        if (if_block) if_block.c();
        attr(div, "class", "d-inline-block align-top");
      },
      m: function m(target, anchor) {
        insert(target, div, anchor);
        if (if_block) if_block.m(div, null);
      },
      p: function p(ctx, dirty) {
        if (
        /*item*/
        ctx[84].id) {
          if (!if_block) {
            if_block = create_if_block_13();
            if_block.c();
            if_block.m(div, null);
          }
        } else if (if_block) {
          if_block.d(1);
          if_block = null;
        }
      },
      d: function d(detaching) {
        if (detaching) detach(div);
        if (if_block) if_block.d();
      }
    };
  } // (1176:18) {#if item.id}


  function create_if_block_13(ctx) {
    var i;
    return {
      c: function c() {
        i = element("i");
        attr(i, "class", "far fa-check-square");
      },
      m: function m(target, anchor) {
        insert(target, i, anchor);
      },
      d: function d(detaching) {
        if (detaching) detach(i);
      }
    };
  } // (1186:18) {:else}


  function create_else_block_2(ctx) {
    var t_value = translate("clear") + "";
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
  } // (1184:18) {#if item.id}


  function create_if_block_11(ctx) {
    var t_value =
    /*item*/
    ctx[84].text + "";
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
        /*selectedItems*/
        4096 && t_value !== (t_value =
        /*item*/
        ctx[84].text + "")) set_data(t, t_value);
      },
      d: function d(detaching) {
        if (detaching) detach(t);
      }
    };
  } // (1191:16) {#if item.desc}


  function create_if_block_10(ctx) {
    var div;
    var t_value =
    /*item*/
    ctx[84].desc + "";
    var t;
    return {
      c: function c() {
        div = element("div");
        t = text(t_value);
        attr(div, "class", "ss-no-click text-muted");
      },
      m: function m(target, anchor) {
        insert(target, div, anchor);
        append(div, t);
      },
      p: function p(ctx, dirty) {
        if (dirty[0] &
        /*selectedItems*/
        4096 && t_value !== (t_value =
        /*item*/
        ctx[84].desc + "")) set_data(t, t_value);
      },
      d: function d(detaching) {
        if (detaching) detach(div);
      }
    };
  } // (1162:6) {#each selectedItems as item, index (item.id)}


  function create_each_block_1(key_1, ctx) {
    var first;
    var if_block_anchor;
    var if_block =
    /*item*/
    ctx[84].id && create_if_block_9(ctx);
    return {
      key: key_1,
      first: null,
      c: function c() {
        first = empty();
        if (if_block) if_block.c();
        if_block_anchor = empty();
        this.first = first;
      },
      m: function m(target, anchor) {
        insert(target, first, anchor);
        if (if_block) if_block.m(target, anchor);
        insert(target, if_block_anchor, anchor);
      },
      p: function p(ctx, dirty) {
        if (
        /*item*/
        ctx[84].id) {
          if (if_block) {
            if_block.p(ctx, dirty);
          } else {
            if_block = create_if_block_9(ctx);
            if_block.c();
            if_block.m(if_block_anchor.parentNode, if_block_anchor);
          }
        } else if (if_block) {
          if_block.d(1);
          if_block = null;
        }
      },
      d: function d(detaching) {
        if (detaching) detach(first);
        if (if_block) if_block.d(detaching);
        if (detaching) detach(if_block_anchor);
      }
    };
  } // (1229:6) {:else}


  function create_else_block(ctx) {
    var div3;
    var div2;
    var t0;
    var div1;
    var div0;
    var div0_class_value;
    var t1;
    var div3_class_value;
    var div3_data_id_value;
    var dispose;
    var if_block0 =
    /*multiple*/
    ctx[21] && create_if_block_6(ctx);

    function select_block_type_5(ctx, dirty) {
      if (
      /*item*/
      ctx[84].id) return create_if_block_5;
      return create_else_block_1;
    }

    var current_block_type = select_block_type_5(ctx);
    var if_block1 = current_block_type(ctx);
    var if_block2 =
    /*item*/
    ctx[84].desc && create_if_block_4(ctx);
    return {
      c: function c() {
        div3 = element("div");
        div2 = element("div");
        if (if_block0) if_block0.c();
        t0 = space();
        div1 = element("div");
        div0 = element("div");
        if_block1.c();
        t1 = space();
        if (if_block2) if_block2.c();
        attr(div0, "class", div0_class_value = "ss-no-click " +
        /*item*/
        ctx[84].itemClass);
        attr(div1, "class", "d-inline-block");
        attr(div2, "class", "ss-no-click");
        attr(div3, "tabindex", "1");
        attr(div3, "class", div3_class_value = "ki-js-item dropdown-item ss-item " + (!
        /*item*/
        ctx[84].id ? "text-muted" : "") + " " + (
        /*selectedMap*/
        ctx[11][
        /*item*/
        ctx[84].id] ? "alert-primary" : ""));
        attr(div3, "data-id", div3_data_id_value =
        /*item*/
        ctx[84].id);
        dispose = [listen(div3, "blur",
        /*handleBlur*/
        ctx[22]), listen(div3, "click",
        /*handleItemClick*/
        ctx[31]), listen(div3, "keydown",
        /*handleItemKeydown*/
        ctx[29]), listen(div3, "keyup",
        /*handleItemKeyup*/
        ctx[30])];
      },
      m: function m(target, anchor) {
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
      p: function p(ctx, dirty) {
        if (
        /*multiple*/
        ctx[21]) {
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

        if (current_block_type === (current_block_type = select_block_type_5(ctx)) && if_block1) {
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
        512 && div0_class_value !== (div0_class_value = "ss-no-click " +
        /*item*/
        ctx[84].itemClass)) {
          attr(div0, "class", div0_class_value);
        }

        if (
        /*item*/
        ctx[84].desc) {
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

        if (dirty[0] &
        /*displayItems, selectedMap*/
        2560 && div3_class_value !== (div3_class_value = "ki-js-item dropdown-item ss-item " + (!
        /*item*/
        ctx[84].id ? "text-muted" : "") + " " + (
        /*selectedMap*/
        ctx[11][
        /*item*/
        ctx[84].id] ? "alert-primary" : ""))) {
          attr(div3, "class", div3_class_value);
        }

        if (dirty[0] &
        /*displayItems*/
        512 && div3_data_id_value !== (div3_data_id_value =
        /*item*/
        ctx[84].id)) {
          attr(div3, "data-id", div3_data_id_value);
        }
      },
      d: function d(detaching) {
        if (detaching) detach(div3);
        if (if_block0) if_block0.d();
        if_block1.d();
        if (if_block2) if_block2.d();
        run_all(dispose);
      }
    };
  } // (1215:50) 


  function create_if_block_2(ctx) {
    var div1;
    var div0;
    var t0_value = (
    /*item*/
    ctx[84].display_text ||
    /*item*/
    ctx[84].text) + "";
    var t0;
    var div0_class_value;
    var t1;
    var dispose;
    var if_block =
    /*item*/
    ctx[84].desc && create_if_block_3(ctx);
    return {
      c: function c() {
        div1 = element("div");
        div0 = element("div");
        t0 = text(t0_value);
        t1 = space();
        if (if_block) if_block.c();
        attr(div0, "class", div0_class_value = "ss-no-click " +
        /*item*/
        ctx[84].itemClass);
        attr(div1, "tabindex", "-1");
        attr(div1, "class", "dropdown-item text-muted ki-js-blank");
        dispose = listen(div1, "keydown",
        /*handleItemKeydown*/
        ctx[29]);
      },
      m: function m(target, anchor) {
        insert(target, div1, anchor);
        append(div1, div0);
        append(div0, t0);
        append(div1, t1);
        if (if_block) if_block.m(div1, null);
      },
      p: function p(ctx, dirty) {
        if (dirty[0] &
        /*displayItems*/
        512 && t0_value !== (t0_value = (
        /*item*/
        ctx[84].display_text ||
        /*item*/
        ctx[84].text) + "")) set_data(t0, t0_value);

        if (dirty[0] &
        /*displayItems*/
        512 && div0_class_value !== (div0_class_value = "ss-no-click " +
        /*item*/
        ctx[84].itemClass)) {
          attr(div0, "class", div0_class_value);
        }

        if (
        /*item*/
        ctx[84].desc) {
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
      d: function d(detaching) {
        if (detaching) detach(div1);
        if (if_block) if_block.d();
        dispose();
      }
    };
  } // (1209:6) {#if item.separator}


  function create_if_block_1(ctx) {
    var div;
    var dispose;
    return {
      c: function c() {
        div = element("div");
        attr(div, "tabindex", "-1");
        attr(div, "class", "dropdown-divider ki-js-blank");
        dispose = listen(div, "keydown",
        /*handleItemKeydown*/
        ctx[29]);
      },
      m: function m(target, anchor) {
        insert(target, div, anchor);
      },
      p: noop,
      d: function d(detaching) {
        if (detaching) detach(div);
        dispose();
      }
    };
  } // (1239:12) {#if multiple}


  function create_if_block_6(ctx) {
    var div;
    var if_block =
    /*item*/
    ctx[84].id && create_if_block_7(ctx);
    return {
      c: function c() {
        div = element("div");
        if (if_block) if_block.c();
        attr(div, "class", "d-inline-block align-top");
      },
      m: function m(target, anchor) {
        insert(target, div, anchor);
        if (if_block) if_block.m(div, null);
      },
      p: function p(ctx, dirty) {
        if (
        /*item*/
        ctx[84].id) {
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
      d: function d(detaching) {
        if (detaching) detach(div);
        if (if_block) if_block.d();
      }
    };
  } // (1241:16) {#if item.id}


  function create_if_block_7(ctx) {
    var i;
    var i_class_value;
    return {
      c: function c() {
        i = element("i");
        attr(i, "class", i_class_value = "far " + (
        /*selectedMap*/
        ctx[11][
        /*item*/
        ctx[84].id] ? "fa-check-square" : "fa-square"));
      },
      m: function m(target, anchor) {
        insert(target, i, anchor);
      },
      p: function p(ctx, dirty) {
        if (dirty[0] &
        /*selectedMap, displayItems*/
        2560 && i_class_value !== (i_class_value = "far " + (
        /*selectedMap*/
        ctx[11][
        /*item*/
        ctx[84].id] ? "fa-check-square" : "fa-square"))) {
          attr(i, "class", i_class_value);
        }
      },
      d: function d(detaching) {
        if (detaching) detach(i);
      }
    };
  } // (1251:16) {:else}


  function create_else_block_1(ctx) {
    var t_value = translate("clear") + "";
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
  } // (1249:16) {#if item.id}


  function create_if_block_5(ctx) {
    var t_value =
    /*item*/
    ctx[84].text + "";
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
        ctx[84].text + "")) set_data(t, t_value);
      },
      d: function d(detaching) {
        if (detaching) detach(t);
      }
    };
  } // (1256:14) {#if item.desc}


  function create_if_block_4(ctx) {
    var div;
    var t_value =
    /*item*/
    ctx[84].desc + "";
    var t;
    return {
      c: function c() {
        div = element("div");
        t = text(t_value);
        attr(div, "class", "ss-no-click text-muted");
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
        ctx[84].desc + "")) set_data(t, t_value);
      },
      d: function d(detaching) {
        if (detaching) detach(div);
      }
    };
  } // (1222:10) {#if item.desc}


  function create_if_block_3(ctx) {
    var div;
    var t_value =
    /*item*/
    ctx[84].desc + "";
    var t;
    return {
      c: function c() {
        div = element("div");
        t = text(t_value);
        attr(div, "class", "ss-no-click text-muted");
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
        ctx[84].desc + "")) set_data(t, t_value);
      },
      d: function d(detaching) {
        if (detaching) detach(div);
      }
    };
  } // (1208:4) {#each displayItems as item (item.id)}


  function create_each_block(key_1, ctx) {
    var first;
    var if_block_anchor;

    function select_block_type_4(ctx, dirty) {
      if (
      /*item*/
      ctx[84].separator) return create_if_block_1;
      if (
      /*item*/
      ctx[84].disabled ||
      /*item*/
      ctx[84].placeholder) return create_if_block_2;
      return create_else_block;
    }

    var current_block_type = select_block_type_4(ctx);
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
        if (current_block_type === (current_block_type = select_block_type_4(ctx)) && if_block) {
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
  } // (1267:4) {#if hasMore}


  function create_if_block(ctx) {
    var div;
    return {
      c: function c() {
        div = element("div");
        div.textContent = "".concat(translate("has_more"));
        attr(div, "tabindex", "-1");
        attr(div, "class", "dropdown-item text-muted");
      },
      m: function m(target, anchor) {
        insert(target, div, anchor);
        /*div_binding*/

        ctx[81](div);
      },
      p: noop,
      d: function d(detaching) {
        if (detaching) detach(div);
        /*div_binding*/

        ctx[81](null);
      }
    };
  }

  function create_fragment(ctx) {
    var div1;
    var t0;
    var div0;
    var t1;
    var t2;
    var each_blocks = [];
    var each_1_lookup = new Map();
    var t3;
    var div0_class_value;
    var div1_class_value;
    var dispose;

    function select_block_type(ctx, dirty) {
      if (
      /*typeahead*/
      ctx[1]) return create_if_block_18;
      return create_else_block_4;
    }

    var current_block_type = select_block_type(ctx);
    var if_block0 = current_block_type(ctx);

    function select_block_type_1(ctx, dirty) {
      if (
      /*fetchError*/
      ctx[17]) return create_if_block_14;
      if (
      /*activeFetch*/
      ctx[20] && !
      /*fetchingMore*/
      ctx[16]) return create_if_block_15;
      if (
      /*actualCount*/
      ctx[10] === 0) return create_if_block_16;
    }

    var current_block_type_1 = select_block_type_1(ctx);
    var if_block1 = current_block_type_1 && current_block_type_1(ctx);
    var if_block2 =
    /*typeahead*/
    ctx[1] && create_if_block_8(ctx);
    var each_value =
    /*displayItems*/
    ctx[9];

    var get_key = function get_key(ctx) {
      return (
        /*item*/
        ctx[84].id
      );
    };

    for (var i = 0; i < each_value.length; i += 1) {
      var child_ctx = get_each_context(ctx, each_value, i);
      var key = get_key(child_ctx);
      each_1_lookup.set(key, each_blocks[i] = create_each_block(key, child_ctx));
    }

    var if_block3 =
    /*hasMore*/
    ctx[14] && create_if_block(ctx);
    return {
      c: function c() {
        div1 = element("div");
        if_block0.c();
        t0 = space();
        div0 = element("div");
        if (if_block1) if_block1.c();
        t1 = space();
        if (if_block2) if_block2.c();
        t2 = space();

        for (var _i12 = 0; _i12 < each_blocks.length; _i12 += 1) {
          each_blocks[_i12].c();
        }

        t3 = space();
        if (if_block3) if_block3.c();
        attr(div0, "class", div0_class_value = "dropdown-menu ss-popup " + (
        /*popupVisible*/
        ctx[19] ? "show" : ""));
        attr(div1, "class", div1_class_value = "ss-container form-control p-0 border-0 " +
        /*extraClass*/
        ctx[0]);
        dispose = listen(div0, "scroll",
        /*handlePopupScroll*/
        ctx[32]);
      },
      m: function m(target, anchor) {
        insert(target, div1, anchor);
        if_block0.m(div1, null);
        append(div1, t0);
        append(div1, div0);
        if (if_block1) if_block1.m(div0, null);
        append(div0, t1);
        if (if_block2) if_block2.m(div0, null);
        append(div0, t2);

        for (var _i13 = 0; _i13 < each_blocks.length; _i13 += 1) {
          each_blocks[_i13].m(div0, null);
        }

        append(div0, t3);
        if (if_block3) if_block3.m(div0, null);
        /*div0_binding_1*/

        ctx[82](div0);
        /*div1_binding*/

        ctx[83](div1);
      },
      p: function p(ctx, dirty) {
        if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block0) {
          if_block0.p(ctx, dirty);
        } else {
          if_block0.d(1);
          if_block0 = current_block_type(ctx);

          if (if_block0) {
            if_block0.c();
            if_block0.m(div1, t0);
          }
        }

        if (current_block_type_1 === (current_block_type_1 = select_block_type_1(ctx)) && if_block1) {
          if_block1.p(ctx, dirty);
        } else {
          if (if_block1) if_block1.d(1);
          if_block1 = current_block_type_1 && current_block_type_1(ctx);

          if (if_block1) {
            if_block1.c();
            if_block1.m(div0, t1);
          }
        }

        if (
        /*typeahead*/
        ctx[1]) {
          if (if_block2) {
            if_block2.p(ctx, dirty);
          } else {
            if_block2 = create_if_block_8(ctx);
            if_block2.c();
            if_block2.m(div0, t2);
          }
        } else if (if_block2) {
          if_block2.d(1);
          if_block2 = null;
        }

        var each_value =
        /*displayItems*/
        ctx[9];
        each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, div0, destroy_block, create_each_block, t3, get_each_context);

        if (
        /*hasMore*/
        ctx[14]) {
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
        524288 && div0_class_value !== (div0_class_value = "dropdown-menu ss-popup " + (
        /*popupVisible*/
        ctx[19] ? "show" : ""))) {
          attr(div0, "class", div0_class_value);
        }

        if (dirty[0] &
        /*extraClass*/
        1 && div1_class_value !== (div1_class_value = "ss-container form-control p-0 border-0 " +
        /*extraClass*/
        ctx[0])) {
          attr(div1, "class", div1_class_value);
        }
      },
      i: noop,
      o: noop,
      d: function d(detaching) {
        if (detaching) detach(div1);
        if_block0.d();

        if (if_block1) {
          if_block1.d();
        }

        if (if_block2) if_block2.d();

        for (var _i14 = 0; _i14 < each_blocks.length; _i14 += 1) {
          each_blocks[_i14].d();
        }

        if (if_block3) if_block3.d();
        /*div0_binding_1*/

        ctx[82](null);
        /*div1_binding*/

        ctx[83](null);
        dispose();
      }
    };
  }

  var I18N_DEFAULTS = {
    clear: "Clear",
    fetching: "Searching..",
    no_results: "No results",
    too_short: "Too short",
    has_more: "More...",
    fetching_more: "Searching more..."
  };
  var FETCH_INDICATOR_DELAY = 150;
  var CARET_DOWN = "fas fa-caret-down";
  var CARET_FETCHING = "far fa-hourglass";
  var META_KEYS = {
    Control: true,
    Shift: true,
    Alt: true,
    AltGraph: true,
    Meta: true,
    ContextMenu: true,
    PrintScreen: true,
    Pause: true,
    CapsLock: true,
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
  var config = {
    translations: I18N_DEFAULTS
  };

  function nop() {}

  function translate(key) {
    return config.translations[key] || I18N_DEFAULTS[key];
  }

  function hasModifier(event) {
    return event.altKey || event.ctrlKey || event.metaKey || event.shiftKey;
  }

  function isValidKey(event) {
    return !(META_KEYS[event.key] || META_KEYS[event.code]);
  }

  function createItemFromOption(el) {
    var ds = el.dataset;
    var item = {
      id: el.value || "",
      text: el.text || ""
    };

    if (ds) {
      if (ds.itemtDesc) {
        item.desc = ds.itemtDesc;
      }

      if (ds.itemClass) {
        item.itemClass = ds.itemClass;
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

    if (item.itemClass) {
      el.setAttribute("data-item-class", item.itemClass);
    }

    el.textContent = item.text;
    return el;
  }

  function focusNextItem(item) {
    var next = item.nextElementSibling;

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
    console.debug(event);
    (handlers[code] || handlers.base)(event);
  }

  function instance($$self, $$props, $$invalidate) {
    var real = $$props.real;
    var fetcher = $$props.fetcher;
    var remote = $$props.remote;
    var _$$props$queryMinLen = $$props.queryMinLen,
        queryMinLen = _$$props$queryMinLen === void 0 ? 0 : _$$props$queryMinLen;
    var _$$props$delay = $$props.delay,
        delay = _$$props$delay === void 0 ? 0 : _$$props$delay;
    var _$$props$extraClass = $$props.extraClass,
        extraClass = _$$props$extraClass === void 0 ? "" : _$$props$extraClass;
    var _$$props$typeahead = $$props.typeahead,
        typeahead = _$$props$typeahead === void 0 ? false : _$$props$typeahead;
    var query = "";
    var container;
    var input;
    var selectionDisplay;
    var toggle;
    var popup;
    var more;
    var mounted = false;
    var fixedItems = [];
    var displayItems = [];
    var itemMap = {};
    var items = [];
    var offsetCount = 0;
    var actualCount = 0;
    var selectedMap = {};
    var selectedItems = [];
    var showFetching = false;
    var hasMore = false;
    var tooShort = false;
    var fetchingMore = false;
    var fetchError = null;
    var inputVisible = false;
    var popupVisible = false;
    var activeFetch = null;
    var fetched = false;
    var previousFetch = null;
    var previousQuery = null;
    var multiple = false;
    var wasDown = false;
    var isSyncToReal = false;

    function inlineFetcher(offset, query) {
      console.log("INLINE_SELECT_FETCH: " + query);
      var promise = new Promise(function (resolve, reject) {
        var items = [];
        var pattern = query.toUpperCase().trim();
        var options = real.options;

        for (var i = 0; i < options.length; i++) {
          var item = createItemFromOption(options[i]);
          var match = !item.id || item.text.toUpperCase().includes(pattern) || item.desc.toUpperCase().includes(pattern);

          if (match) {
            items.push(item);
          }
        }

        var response = {
          items: items,
          info: {
            more: false
          }
        };
        resolve(response);
      });
      return promise;
    }

    function fetchItems(more, fetchId) {
      var currentQuery;

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
      var fetchOffset = 0;

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
      var currentFetchOffset = fetchOffset;
      var currentFetchingMore = fetchingMore;
      var currentFetch = new Promise(function (resolve, reject) {
        if (currentFetchingMore) {
          resolve(fetcher(currentFetchOffset, currentQuery, fetchId));
        } else {
          if (currentQuery.length < queryMinLen && !fetchId) {
            resolve({
              items: [],
              info: {
                more: false,
                too_short: true
              }
            });
          } else {
            setTimeout(function () {
              if (currentFetch === activeFetch) {
                resolve(fetcher(currentFetchOffset, currentQuery, fetchId));
              } else {
                reject("cancel");
              }
            }, delay);
          }
        }
      }).then(function (response) {
        if (currentFetch === activeFetch) {
          var fetchedItems = response.items || [];
          var info = response.info || {};
          var newItems;

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
          var newDisplayItems = [];
          fixedItems.forEach(function (item) {
            newDisplayItems.push(item);
          });
          items.forEach(function (item) {
            newDisplayItems.push(item);
          });
          $$invalidate(9, displayItems = newDisplayItems);
          resolveItemMap(displayItems);
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
      })["catch"](function (err) {
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
          resolveItemMap(displayItems);

          if (inputVisible) {
            input.focus();
          } else {
            selectinDisplay.focus();
          }

          openPopup();
        }
      });
      setTimeout(function () {
        if (activeFetch === currentFetch) {
          console.log("fetching...");
          $$invalidate(13, showFetching = true);
        }
      }, FETCH_INDICATOR_DELAY);
      $$invalidate(20, activeFetch = currentFetch);
      previousFetch = null;
      return currentFetch;
    }

    function resolveItems(items) {
      var off = 0;
      var act = 0;
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

    function resolveItemMap(displayItems) {
      var newMap = {};
      displayItems.forEach(function (item) {
        newMap[item.id] = item;
      });
      itemMap = newMap;
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

    var activeFocusRequest = null;
    var passEvents = null;

    function focusTarget(target) {
      console.trace("request_Focus", target);
      activeFocusRequest = null;

      var handler = function handler() {
        console.log("HANDLE: request_Focus", target, activeFocusRequest);

        if (activeFocusRequest === handler) {
          console.log("HANDLE_HIT: request_Focus", target);
          activeFocusRequest = null;
          target.focus();
        } else {
          console.log("HANDLE_MISS: request_Focus", target);
        }
      };

      setTimeout(handler);
      activeFocusRequest = handler;
    }

    function openInput(focus, passEvent) {
      if (!typeahead) {
        return;
      }

      var wasVisible = inputVisible;
      $$invalidate(18, inputVisible = true);

      if (!focus) {
        return;
      }

      focusTarget(input);

      if (!wasVisible) {
        if (passEvent) {
          passEvents = passEvents || [];
          passEvent.preventDefault();
          passEvents.push(passEvent);
        }
      }
    }

    function closeInput(focusToggle) {
      console.trace("CLOSE_INPUT", focusToggle);

      if (!typeahead) {
        return;
      }

      var wasVisible = inputVisible;

      if (wasVisible) {
        activeFocusRequest = null;
        $$invalidate(18, inputVisible = false);
      }

      if (focusToggle) {
        focusTarget(selectionDisplay || toggle);
      } else {
        if (wasVisible) {
          toggle.focus();
        }
      }
    }

    function openPopup() {
      if (!popupVisible) {
        $$invalidate(19, popupVisible = true);
        var w = container.offsetWidth;
        $$invalidate(7, popup.style.minWidth = w + "px", popup);
      }
    }

    function closePopup(focusToggle) {
      $$invalidate(19, popupVisible = false);

      if (focusToggle) {
        focusTarget(selectionDisplay || toggle);
      }
    }

    function selectItemImpl(id) {
      id = id.toString();

      var item = itemMap[id] || selectedMap[id];

      if (!item) {
        console.error("MISSING item=" + id);
        return;
      }

      if (multiple) {
        if (item.id) {
          delete selectedMap[""];

          if (selectedMap[item.id]) {
            delete selectedMap[item.id];
            $$invalidate(11, selectedMap);
          } else {
            $$invalidate(11, selectedMap[item.id] = item, selectedMap);
          }
        } else {
          $$invalidate(11, selectedMap = _defineProperty({}, item.id, item));
        }
      } else {
        $$invalidate(11, selectedMap = _defineProperty({}, item.id, item));
        clearQuery();
        closeInput(false);
        closePopup(true);
      }

      $$invalidate(12, selectedItems = Object.values(selectedMap));
      syncToReal(selectedMap);
      real.dispatchEvent(new CustomEvent("select-select", {
        detail: selectedMap
      }));
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

      var newMap = {};
      var options = real.selectedOptions;

      for (var i = options.length - 1; i >= 0; i--) {
        var item = createItemFromOption(options[i]);
        newMap[item.id] = item;
      }

      $$invalidate(11, selectedMap = newMap);
      $$invalidate(12, selectedItems = Object.values(newMap));
    }

    function syncToReal(selectedMap) {
      var changed = false;

      if (remote) {
        selectedItems.forEach(function (item) {
          var el = real.querySelector("option[value=\"" + item.id.trim() + "\"]");

          if (!el) {
            el = createOptionFromItem(item);
            real.appendChild(el);
          }
        });
      }

      var options = real.options;

      for (var i = options.length - 1; i >= 0; i--) {
        var el = options[i];
        var curr = !!selectedMap[el.value];

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
      var fixedOptions = real.querySelectorAll("option[data-select-fixed]");
      var collectedItems = [];
      fixedOptions.forEach(function (el) {
        var ds = el.dataset;
        var item = {
          id: el.value,
          text: el.text
        };

        if (ds.desc) {
          item.desc = ds.itemDesc;
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
          console.log("FROM_REAL", selectedMap);
        }
      });
      $$invalidate(39, mounted = true);
    });
    var inputKeypressHandlers = {
      base: function base(event) {}
    };
    var inputKeydownHandlers = {
      base: function base(event) {
        wasDown = true;
        openInput(true);
      },
      ArrowDown: function ArrowDown(event) {
        var item = popupVisible ? popup.querySelectorAll(".ki-js-item")[0] : null;

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
      ArrowUp: function ArrowUp(event) {
        event.preventDefault();
      },
      Escape: function Escape(event) {
        cancelFetch();
        clearQuery();
        closePopup(true);
        closeInput(true);
      },
      Tab: nop
    };
    var inputKeyupHandlers = {
      base: function base(event) {
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
    var toggleKeydownHandlers = {
      base: function base(event) {
        if (isValidKey(event)) {
          openInput(true, event);
        }
      },
      ArrowDown: inputKeydownHandlers.ArrowDown,
      ArrowUp: inputKeydownHandlers.ArrowDown,
      Enter: function Enter(event) {
        openPopup();
        fetchItems(false);
        event.preventDefault();
      },
      Space: function Space(event) {
        openPopup();
        fetchItems(false);
        event.preventDefault();
      },
      Escape: function Escape(event) {
        cancelFetch();
        clearQuery();
        closePopup(false);
        closeInput(true);
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
      var next = event.target.previousElementSibling;

      if (next) {
        while (next && next.classList.contains("ki-js-blank")) {
          next = next.previousElementSibling;
        }

        if (next && !next.classList.contains("ki-js-item")) {
          next = null;
        }
      }

      if (!next) {
        next = inputVisible ? input : selectionDisplay || toggle;
      }

      if (next) {
        next.focus();
      }

      return next;
    }

    var itemKeydownHandlers = {
      base: function base(event) {
        if (isValidKey(event)) {
          openInput(true, event);
        }
      },
      ArrowDown: function ArrowDown(event) {
        focusNextItem(event.target);
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
        if (!hasModifier(event)) {
          selectElement(event.target);
          event.preventDefault();
        }
      },
      Escape: function Escape(event) {
        cancelFetch();
        clearQuery();
        closePopup(true);
        closeInput(true);
      },
      PageUp: nop,
      PageDown: nop,
      Home: nop,
      End: nop,
      Tab: function Tab(event) {
        if (inputVisible) {
          input.focus();
        } else {
          (selectionDisplay || toggle).focus();
        }

        event.preventDefault();
      },
      Control: nop,
      Shift: nop,
      AltGraph: nop,
      Meta: nop,
      ContextMenu: nop
    };
    var itemKeyupHandlers = {
      base: nop,
      PageUp: function PageUp(event) {
        var scrollLeft = document.body.scrollLeft;
        var scrollTop = document.body.scrollTop;
        var rect = popup.getBoundingClientRect();
        var item = document.elementFromPoint(scrollLeft + rect.x + 10, scrollTop + rect.top + 1);

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
      PageDown: function PageDown(event) {
        var scrollLeft = document.body.scrollLeft;
        var scrollTop = document.body.scrollTop;
        var h = popup.offsetHeight;
        var rect = popup.getBoundingClientRect();
        var item = document.elementFromPoint(scrollLeft + rect.x + 10, scrollTop + rect.top + h - 10);

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
      Home: function Home(event) {
        var item = popup.querySelector(".ki-js-item:first-child");

        if (item) {
          item.focus();
        }

        event.preventDefault();
      },
      End: function End(event) {
        var item = popup.querySelector(".ki-js-item:last-child");

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

    function input_1_input_handler() {
      query = this.value;
      $$invalidate(2, query);
    }

    function input_1_binding($$value) {
      binding_callbacks[$$value ? "unshift" : "push"](function () {
        $$invalidate(4, input = $$value);
      });
    }

    function div0_binding($$value) {
      binding_callbacks[$$value ? "unshift" : "push"](function () {
        $$invalidate(5, selectionDisplay = $$value);
      });
    }

    function button_binding($$value) {
      binding_callbacks[$$value ? "unshift" : "push"](function () {
        $$invalidate(6, toggle = $$value);
      });
    }

    function button_binding_1($$value) {
      binding_callbacks[$$value ? "unshift" : "push"](function () {
        $$invalidate(6, toggle = $$value);
      });
    }

    function div_binding($$value) {
      binding_callbacks[$$value ? "unshift" : "push"](function () {
        $$invalidate(8, more = $$value);
      });
    }

    function div0_binding_1($$value) {
      binding_callbacks[$$value ? "unshift" : "push"](function () {
        $$invalidate(7, popup = $$value);
      });
    }

    function div1_binding($$value) {
      binding_callbacks[$$value ? "unshift" : "push"](function () {
        $$invalidate(3, container = $$value);
      });
    }

    $$self.$set = function ($$props) {
      if ("real" in $$props) $$invalidate(34, real = $$props.real);
      if ("fetcher" in $$props) $$invalidate(33, fetcher = $$props.fetcher);
      if ("remote" in $$props) $$invalidate(35, remote = $$props.remote);
      if ("queryMinLen" in $$props) $$invalidate(36, queryMinLen = $$props.queryMinLen);
      if ("delay" in $$props) $$invalidate(37, delay = $$props.delay);
      if ("extraClass" in $$props) $$invalidate(0, extraClass = $$props.extraClass);
      if ("typeahead" in $$props) $$invalidate(1, typeahead = $$props.typeahead);
    };

    $$self.$$.update = function () {
      if ($$self.$$.dirty[0] &
      /*selectedMap*/
      2048 | $$self.$$.dirty[1] &
      /*mounted*/
      256) {
         {
          if (mounted) {
            syncToReal(selectedMap);
          }
        }
      }
    };

    return [extraClass, typeahead, query, container, input, selectionDisplay, toggle, popup, more, displayItems, actualCount, selectedMap, selectedItems, showFetching, hasMore, tooShort, fetchingMore, fetchError, inputVisible, popupVisible, activeFetch, multiple, handleBlur, handleInputBlur, handleInputKeypress, handleInputKeydown, handleInputKeyup, handleToggleKeydown, handleToggleClick, handleItemKeydown, handleItemKeyup, handleItemClick, handlePopupScroll, fetcher, real, remote, queryMinLen, delay, selectItem, mounted, fixedItems, itemMap, items, offsetCount, fetched, previousFetch, previousQuery, wasDown, isSyncToReal, activeFocusRequest, passEvents, inlineFetcher, fetchItems, resolveItems, resolveItemMap, cancelFetch, fetchMoreIfneeded, clearQuery, focusTarget, openInput, closeInput, openPopup, closePopup, selectItemImpl, selectElement, containsElement, syncFromReal, syncToReal, setupRemote, inputKeypressHandlers, inputKeydownHandlers, inputKeyupHandlers, toggleKeydownHandlers, focusPreviousItem, itemKeydownHandlers, itemKeyupHandlers, input_1_input_handler, input_1_binding, div0_binding, button_binding, button_binding_1, div_binding, div0_binding_1, div1_binding];
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
        real: 34,
        fetcher: 33,
        remote: 35,
        queryMinLen: 36,
        delay: 37,
        extraClass: 0,
        typeahead: 1,
        selectItem: 38
      }, [-1, -1, -1]);
      return _this;
    }

    _createClass(Select, [{
      key: "selectItem",
      get: function get() {
        return this.$$.ctx[38];
      }
    }]);

    return Select;
  }(SvelteComponent);

  exports.config = config;
  exports.default = Select;

  return exports;

}({}));
