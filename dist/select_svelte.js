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
    child_ctx[74] = list[i];
    return child_ctx;
  }

  function get_each_context_1(ctx, list, i) {
    var child_ctx = ctx.slice();
    child_ctx[74] = list[i];
    child_ctx[78] = i;
    return child_ctx;
  }

  function get_each_context_2(ctx, list, i) {
    var child_ctx = ctx.slice();
    child_ctx[74] = list[i];
    child_ctx[78] = i;
    return child_ctx;
  } // (1061:6) {#each selectionItems as item, index (item.id)}


  function create_each_block_2(key_1, ctx) {
    var span;
    var t0_value = (
    /*index*/
    ctx[78] > 0 ? ", " : "") + "";
    var t0;
    var t1_value =
    /*item*/
    ctx[74].text + "";
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
        ctx[74].itemClass + " " + (
        /*item*/
        ctx[74].id ? "" : "text-muted"));
        this.first = span;
      },
      m: function m(target, anchor) {
        insert(target, span, anchor);
        append(span, t0);
        append(span, t1);
      },
      p: function p(ctx, dirty) {
        if (dirty[0] &
        /*selectionItems*/
        8192 && t0_value !== (t0_value = (
        /*index*/
        ctx[78] > 0 ? ", " : "") + "")) set_data(t0, t0_value);
        if (dirty[0] &
        /*selectionItems*/
        8192 && t1_value !== (t1_value =
        /*item*/
        ctx[74].text + "")) set_data(t1, t1_value);

        if (dirty[0] &
        /*selectionItems*/
        8192 && span_class_value !== (span_class_value = "ss-no-click ss-selected-item " +
        /*item*/
        ctx[74].itemClass + " " + (
        /*item*/
        ctx[74].id ? "" : "text-muted"))) {
          attr(span, "class", span_class_value);
        }
      },
      d: function d(detaching) {
        if (detaching) detach(span);
      }
    };
  } // (1073:4) {#if fetchError}


  function create_if_block_17(ctx) {
    var div;
    var t;
    return {
      c: function c() {
        div = element("div");
        t = text(
        /*fetchError*/
        ctx[16]);
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
        65536) set_data(t,
        /*fetchError*/
        ctx[16]);
      },
      d: function d(detaching) {
        if (detaching) detach(div);
      }
    };
  } // (1079:4) {#if typeahead}


  function create_if_block_10(ctx) {
    var input;
    var t0;
    var each_blocks = [];
    var each_1_lookup = new Map();
    var t1;
    var if_block_anchor;
    var dispose;
    var each_value_1 =
    /*selectionDropdownItems*/
    ctx[14];

    var get_key = function get_key(ctx) {
      return (
        /*item*/
        ctx[74].id
      );
    };

    for (var i = 0; i < each_value_1.length; i += 1) {
      var child_ctx = get_each_context_1(ctx, each_value_1, i);
      var key = get_key(child_ctx);
      each_1_lookup.set(key, each_blocks[i] = create_each_block_1(key, child_ctx));
    }

    var if_block = (
    /*selectionDropdownItems*/
    ctx[14].length > 1 ||
    /*selectionDropdownItems*/
    ctx[14].length == 1 &&
    /*selectionDropdownItems*/
    ctx[14][0].id) && create_if_block_11(ctx);
    return {
      c: function c() {
        input = element("input");
        t0 = space();

        for (var _i = 0; _i < each_blocks.length; _i += 1) {
          each_blocks[_i].c();
        }

        t1 = space();
        if (if_block) if_block.c();
        if_block_anchor = empty();
        attr(input, "class", "ss-input ss-item");
        attr(input, "tabindex", "1");
        attr(input, "autocomplete", "new-password");
        attr(input, "autocorrect", "off");
        attr(input, "autocapitalize", "off");
        attr(input, "spellcheck", "off");
        dispose = [listen(input, "input",
        /*input_input_handler*/
        ctx[69]), listen(input, "blur",
        /*handleInputBlur*/
        ctx[20]), listen(input, "keypress",
        /*handleInputKeypress*/
        ctx[21]), listen(input, "keydown",
        /*handleInputKeydown*/
        ctx[22]), listen(input, "keyup",
        /*handleInputKeyup*/
        ctx[23])];
      },
      m: function m(target, anchor) {
        insert(target, input, anchor);
        set_input_value(input,
        /*query*/
        ctx[7]);
        /*input_binding*/

        ctx[70](input);
        insert(target, t0, anchor);

        for (var _i2 = 0; _i2 < each_blocks.length; _i2 += 1) {
          each_blocks[_i2].m(target, anchor);
        }

        insert(target, t1, anchor);
        if (if_block) if_block.m(target, anchor);
        insert(target, if_block_anchor, anchor);
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

        var each_value_1 =
        /*selectionDropdownItems*/
        ctx[14];
        each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value_1, each_1_lookup, t1.parentNode, destroy_block, create_each_block_1, t1, get_each_context_1);

        if (
        /*selectionDropdownItems*/
        ctx[14].length > 1 ||
        /*selectionDropdownItems*/
        ctx[14].length == 1 &&
        /*selectionDropdownItems*/
        ctx[14][0].id) {
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
      d: function d(detaching) {
        if (detaching) detach(input);
        /*input_binding*/

        ctx[70](null);
        if (detaching) detach(t0);

        for (var _i3 = 0; _i3 < each_blocks.length; _i3 += 1) {
          each_blocks[_i3].d(detaching);
        }

        if (detaching) detach(t1);
        if (if_block) if_block.d(detaching);
        if (detaching) detach(if_block_anchor);
        run_all(dispose);
      }
    };
  } // (1095:8) {#if item.id}


  function create_if_block_12(ctx) {
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
    ctx[18] && create_if_block_15(ctx);

    function select_block_type(ctx, dirty) {
      if (
      /*item*/
      ctx[74].id) return create_if_block_14;
      return create_else_block_3;
    }

    var current_block_type = select_block_type(ctx);
    var if_block1 = current_block_type(ctx);
    var if_block2 =
    /*item*/
    ctx[74].desc && create_if_block_13(ctx);
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
        ctx[74].itemClass);
        attr(div1, "class", "d-inline-block");
        attr(div2, "class", "ss-no-click");
        attr(div3, "tabindex", "1");
        attr(div3, "class", "ki-js-item dropdown-item ss-item");
        attr(div3, "data-id", div3_data_id_value =
        /*item*/
        ctx[74].id);
        attr(div3, "data-selected", "true");
        dispose = [listen(div3, "blur",
        /*handleBlur*/
        ctx[19]), listen(div3, "click",
        /*handleItemClick*/
        ctx[29]), listen(div3, "keydown",
        /*handleItemKeydown*/
        ctx[27]), listen(div3, "keyup",
        /*handleItemKeyup*/
        ctx[28])];
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
        ctx[18]) {
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

        if (dirty[0] &
        /*selectionDropdownItems*/
        16384 && div0_class_value !== (div0_class_value = "ss-no-click " +
        /*item*/
        ctx[74].itemClass)) {
          attr(div0, "class", div0_class_value);
        }

        if (
        /*item*/
        ctx[74].desc) {
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

        if (dirty[0] &
        /*selectionDropdownItems*/
        16384 && div3_data_id_value !== (div3_data_id_value =
        /*item*/
        ctx[74].id)) {
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
  } // (1106:14) {#if multiple}


  function create_if_block_15(ctx) {
    var div;
    var if_block =
    /*item*/
    ctx[74].id && create_if_block_16(ctx);
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
        ctx[74].id) {
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
      d: function d(detaching) {
        if (detaching) detach(div);
        if (if_block) if_block.d();
      }
    };
  } // (1108:18) {#if item.id}


  function create_if_block_16(ctx) {
    var i;
    var i_class_value;
    return {
      c: function c() {
        i = element("i");
        attr(i, "class", i_class_value = "far " + (
        /*selectionById*/
        ctx[12][
        /*item*/
        ctx[74].id] ? "fa-check-square" : "fa-square"));
      },
      m: function m(target, anchor) {
        insert(target, i, anchor);
      },
      p: function p(ctx, dirty) {
        if (dirty[0] &
        /*selectionById, selectionDropdownItems*/
        20480 && i_class_value !== (i_class_value = "far " + (
        /*selectionById*/
        ctx[12][
        /*item*/
        ctx[74].id] ? "fa-check-square" : "fa-square"))) {
          attr(i, "class", i_class_value);
        }
      },
      d: function d(detaching) {
        if (detaching) detach(i);
      }
    };
  } // (1118:18) {:else}


  function create_else_block_3(ctx) {
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
  } // (1116:18) {#if item.id}


  function create_if_block_14(ctx) {
    var t_value =
    /*item*/
    ctx[74].text + "";
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
        /*selectionDropdownItems*/
        16384 && t_value !== (t_value =
        /*item*/
        ctx[74].text + "")) set_data(t, t_value);
      },
      d: function d(detaching) {
        if (detaching) detach(t);
      }
    };
  } // (1123:16) {#if item.desc}


  function create_if_block_13(ctx) {
    var div;
    var t_value =
    /*item*/
    ctx[74].desc + "";
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
        /*selectionDropdownItems*/
        16384 && t_value !== (t_value =
        /*item*/
        ctx[74].desc + "")) set_data(t, t_value);
      },
      d: function d(detaching) {
        if (detaching) detach(div);
      }
    };
  } // (1094:6) {#each selectionDropdownItems as item, index (item.id)}


  function create_each_block_1(key_1, ctx) {
    var first;
    var if_block_anchor;
    var if_block =
    /*item*/
    ctx[74].id && create_if_block_12(ctx);
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
        ctx[74].id) {
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
      d: function d(detaching) {
        if (detaching) detach(first);
        if (if_block) if_block.d(detaching);
        if (detaching) detach(if_block_anchor);
      }
    };
  } // (1134:6) {#if selectionDropdownItems.length > 1 || (selectionDropdownItems.length == 1 && selectionDropdownItems[0].id)}


  function create_if_block_11(ctx) {
    var div;
    var dispose;
    return {
      c: function c() {
        div = element("div");
        attr(div, "tabindex", "-1");
        attr(div, "class", "dropdown-divider ki-js-blank");
        dispose = listen(div, "keydown",
        /*handleItemKeydown*/
        ctx[27]);
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
  } // (1163:6) {:else}


  function create_else_block_1(ctx) {
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
    ctx[18] && create_if_block_8(ctx);

    function select_block_type_2(ctx, dirty) {
      if (
      /*item*/
      ctx[74].id) return create_if_block_7;
      return create_else_block_2;
    }

    var current_block_type = select_block_type_2(ctx);
    var if_block1 = current_block_type(ctx);
    var if_block2 =
    /*item*/
    ctx[74].desc && create_if_block_6(ctx);
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
        ctx[74].itemClass);
        attr(div1, "class", "d-inline-block");
        attr(div2, "class", "ss-no-click");
        attr(div3, "tabindex", "1");
        attr(div3, "class", div3_class_value = "ki-js-item dropdown-item ss-item " + (!
        /*item*/
        ctx[74].id ? "text-muted" : "") + " " + (
        /*selectionById*/
        ctx[12][
        /*item*/
        ctx[74].id] ? "alert-primary" : ""));
        attr(div3, "data-id", div3_data_id_value =
        /*item*/
        ctx[74].id);
        dispose = [listen(div3, "blur",
        /*handleBlur*/
        ctx[19]), listen(div3, "click",
        /*handleItemClick*/
        ctx[29]), listen(div3, "keydown",
        /*handleItemKeydown*/
        ctx[27]), listen(div3, "keyup",
        /*handleItemKeyup*/
        ctx[28])];
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
        ctx[18]) {
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

        if (dirty[0] &
        /*displayItems*/
        256 && div0_class_value !== (div0_class_value = "ss-no-click " +
        /*item*/
        ctx[74].itemClass)) {
          attr(div0, "class", div0_class_value);
        }

        if (
        /*item*/
        ctx[74].desc) {
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

        if (dirty[0] &
        /*displayItems, selectionById*/
        4352 && div3_class_value !== (div3_class_value = "ki-js-item dropdown-item ss-item " + (!
        /*item*/
        ctx[74].id ? "text-muted" : "") + " " + (
        /*selectionById*/
        ctx[12][
        /*item*/
        ctx[74].id] ? "alert-primary" : ""))) {
          attr(div3, "class", div3_class_value);
        }

        if (dirty[0] &
        /*displayItems*/
        256 && div3_data_id_value !== (div3_data_id_value =
        /*item*/
        ctx[74].id)) {
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
  } // (1149:50) 


  function create_if_block_4(ctx) {
    var div1;
    var div0;
    var t0_value = (
    /*item*/
    ctx[74].display_text ||
    /*item*/
    ctx[74].text) + "";
    var t0;
    var div0_class_value;
    var t1;
    var dispose;
    var if_block =
    /*item*/
    ctx[74].desc && create_if_block_5(ctx);
    return {
      c: function c() {
        div1 = element("div");
        div0 = element("div");
        t0 = text(t0_value);
        t1 = space();
        if (if_block) if_block.c();
        attr(div0, "class", div0_class_value = "ss-no-click " +
        /*item*/
        ctx[74].itemClass);
        attr(div1, "tabindex", "-1");
        attr(div1, "class", "dropdown-item text-muted ki-js-blank");
        dispose = listen(div1, "keydown",
        /*handleItemKeydown*/
        ctx[27]);
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
        256 && t0_value !== (t0_value = (
        /*item*/
        ctx[74].display_text ||
        /*item*/
        ctx[74].text) + "")) set_data(t0, t0_value);

        if (dirty[0] &
        /*displayItems*/
        256 && div0_class_value !== (div0_class_value = "ss-no-click " +
        /*item*/
        ctx[74].itemClass)) {
          attr(div0, "class", div0_class_value);
        }

        if (
        /*item*/
        ctx[74].desc) {
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
  } // (1143:6) {#if item.separator}


  function create_if_block_3(ctx) {
    var div;
    var dispose;
    return {
      c: function c() {
        div = element("div");
        attr(div, "tabindex", "-1");
        attr(div, "class", "dropdown-divider ki-js-blank");
        dispose = listen(div, "keydown",
        /*handleItemKeydown*/
        ctx[27]);
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
  } // (1173:12) {#if multiple}


  function create_if_block_8(ctx) {
    var div;
    var if_block =
    /*item*/
    ctx[74].id && create_if_block_9(ctx);
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
        ctx[74].id) {
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
      d: function d(detaching) {
        if (detaching) detach(div);
        if (if_block) if_block.d();
      }
    };
  } // (1175:16) {#if item.id}


  function create_if_block_9(ctx) {
    var i;
    var i_class_value;
    return {
      c: function c() {
        i = element("i");
        attr(i, "class", i_class_value = "far " + (
        /*selectionById*/
        ctx[12][
        /*item*/
        ctx[74].id] ? "fa-check-square" : "fa-square"));
      },
      m: function m(target, anchor) {
        insert(target, i, anchor);
      },
      p: function p(ctx, dirty) {
        if (dirty[0] &
        /*selectionById, displayItems*/
        4352 && i_class_value !== (i_class_value = "far " + (
        /*selectionById*/
        ctx[12][
        /*item*/
        ctx[74].id] ? "fa-check-square" : "fa-square"))) {
          attr(i, "class", i_class_value);
        }
      },
      d: function d(detaching) {
        if (detaching) detach(i);
      }
    };
  } // (1185:16) {:else}


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
  } // (1183:16) {#if item.id}


  function create_if_block_7(ctx) {
    var t_value =
    /*item*/
    ctx[74].text + "";
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
        256 && t_value !== (t_value =
        /*item*/
        ctx[74].text + "")) set_data(t, t_value);
      },
      d: function d(detaching) {
        if (detaching) detach(t);
      }
    };
  } // (1190:14) {#if item.desc}


  function create_if_block_6(ctx) {
    var div;
    var t_value =
    /*item*/
    ctx[74].desc + "";
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
        256 && t_value !== (t_value =
        /*item*/
        ctx[74].desc + "")) set_data(t, t_value);
      },
      d: function d(detaching) {
        if (detaching) detach(div);
      }
    };
  } // (1156:10) {#if item.desc}


  function create_if_block_5(ctx) {
    var div;
    var t_value =
    /*item*/
    ctx[74].desc + "";
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
        256 && t_value !== (t_value =
        /*item*/
        ctx[74].desc + "")) set_data(t, t_value);
      },
      d: function d(detaching) {
        if (detaching) detach(div);
      }
    };
  } // (1142:4) {#each displayItems as item (item.id)}


  function create_each_block(key_1, ctx) {
    var first;
    var if_block_anchor;

    function select_block_type_1(ctx, dirty) {
      if (
      /*item*/
      ctx[74].separator) return create_if_block_3;
      if (
      /*item*/
      ctx[74].disabled ||
      /*item*/
      ctx[74].placeholder) return create_if_block_4;
      return create_else_block_1;
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
  } // (1201:4) {#if hasMore}


  function create_if_block_2(ctx) {
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

        ctx[71](div);
      },
      p: noop,
      d: function d(detaching) {
        if (detaching) detach(div);
        /*div_binding*/

        ctx[71](null);
      }
    };
  } // (1208:4) {#if actualCount === 0}


  function create_if_block(ctx) {
    var div;

    function select_block_type_3(ctx, dirty) {
      if (
      /*tooShort*/
      ctx[10]) return create_if_block_1;
      return create_else_block;
    }

    var current_block_type = select_block_type_3(ctx);
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
  } // (1212:8) {:else}


  function create_else_block(ctx) {
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
  } // (1210:8) {#if tooShort }


  function create_if_block_1(ctx) {
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
  }

  function create_fragment(ctx) {
    var div1;
    var button;
    var span1;
    var each_blocks_1 = [];
    var each0_lookup = new Map();
    var t0;
    var span0;
    var i;
    var i_class_value;
    var t1;
    var div0;
    var t2;
    var t3;
    var each_blocks = [];
    var each1_lookup = new Map();
    var t4;
    var t5;
    var div0_class_value;
    var div1_class_value;
    var dispose;
    var each_value_2 =
    /*selectionItems*/
    ctx[13];

    var get_key = function get_key(ctx) {
      return (
        /*item*/
        ctx[74].id
      );
    };

    for (var _i4 = 0; _i4 < each_value_2.length; _i4 += 1) {
      var child_ctx = get_each_context_2(ctx, each_value_2, _i4);
      var key = get_key(child_ctx);
      each0_lookup.set(key, each_blocks_1[_i4] = create_each_block_2(key, child_ctx));
    }

    var if_block0 =
    /*fetchError*/
    ctx[16] && create_if_block_17(ctx);
    var if_block1 =
    /*typeahead*/
    ctx[1] && create_if_block_10(ctx);
    var each_value =
    /*displayItems*/
    ctx[8];

    var get_key_1 = function get_key_1(ctx) {
      return (
        /*item*/
        ctx[74].id
      );
    };

    for (var _i5 = 0; _i5 < each_value.length; _i5 += 1) {
      var _child_ctx = get_each_context(ctx, each_value, _i5);

      var _key = get_key_1(_child_ctx);

      each1_lookup.set(_key, each_blocks[_i5] = create_each_block(_key, _child_ctx));
    }

    var if_block2 =
    /*hasMore*/
    ctx[11] && create_if_block_2(ctx);
    var if_block3 =
    /*actualCount*/
    ctx[9] === 0 && create_if_block(ctx);
    return {
      c: function c() {
        div1 = element("div");
        button = element("button");
        span1 = element("span");

        for (var _i6 = 0; _i6 < each_blocks_1.length; _i6 += 1) {
          each_blocks_1[_i6].c();
        }

        t0 = space();
        span0 = element("span");
        i = element("i");
        t1 = space();
        div0 = element("div");
        if (if_block0) if_block0.c();
        t2 = space();
        if (if_block1) if_block1.c();
        t3 = space();

        for (var _i7 = 0; _i7 < each_blocks.length; _i7 += 1) {
          each_blocks[_i7].c();
        }

        t4 = space();
        if (if_block2) if_block2.c();
        t5 = space();
        if (if_block3) if_block3.c();
        attr(i, "class", i_class_value = "text-dark " + (
        /*showFetching*/
        ctx[15] ? CARET_FETCHING : CARET_DOWN));
        attr(span0, "class", "ml-auto");
        attr(span1, "class", "ss-no-click ss-selection text-dark d-flex");
        attr(button, "class", "form-control d-flex");
        attr(button, "type", "button");
        attr(button, "tabindex", "0");
        attr(div0, "class", div0_class_value = "dropdown-menu ss-popup " + (
        /*popupVisible*/
        ctx[17] ? "show" : ""));
        attr(div1, "class", div1_class_value = "ss-container form-control p-0 border-0 " +
        /*extraClass*/
        ctx[0]);
        dispose = [listen(button, "blur",
        /*handleBlur*/
        ctx[19]), listen(button, "keydown",
        /*handleToggleKeydown*/
        ctx[24]), listen(button, "keyup",
        /*handleToggleKeyup*/
        ctx[25]), listen(button, "click",
        /*handleToggleClick*/
        ctx[26]), listen(div0, "scroll",
        /*handlePopupScroll*/
        ctx[30])];
      },
      m: function m(target, anchor) {
        insert(target, div1, anchor);
        append(div1, button);
        append(button, span1);

        for (var _i8 = 0; _i8 < each_blocks_1.length; _i8 += 1) {
          each_blocks_1[_i8].m(span1, null);
        }

        append(span1, t0);
        append(span1, span0);
        append(span0, i);
        /*button_binding*/

        ctx[68](button);
        append(div1, t1);
        append(div1, div0);
        if (if_block0) if_block0.m(div0, null);
        append(div0, t2);
        if (if_block1) if_block1.m(div0, null);
        append(div0, t3);

        for (var _i9 = 0; _i9 < each_blocks.length; _i9 += 1) {
          each_blocks[_i9].m(div0, null);
        }

        append(div0, t4);
        if (if_block2) if_block2.m(div0, null);
        append(div0, t5);
        if (if_block3) if_block3.m(div0, null);
        /*div0_binding*/

        ctx[72](div0);
        /*div1_binding*/

        ctx[73](div1);
      },
      p: function p(ctx, dirty) {
        var each_value_2 =
        /*selectionItems*/
        ctx[13];
        each_blocks_1 = update_keyed_each(each_blocks_1, dirty, get_key, 1, ctx, each_value_2, each0_lookup, span1, destroy_block, create_each_block_2, t0, get_each_context_2);

        if (dirty[0] &
        /*showFetching*/
        32768 && i_class_value !== (i_class_value = "text-dark " + (
        /*showFetching*/
        ctx[15] ? CARET_FETCHING : CARET_DOWN))) {
          attr(i, "class", i_class_value);
        }

        if (
        /*fetchError*/
        ctx[16]) {
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

        if (
        /*typeahead*/
        ctx[1]) {
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

        var each_value =
        /*displayItems*/
        ctx[8];
        each_blocks = update_keyed_each(each_blocks, dirty, get_key_1, 1, ctx, each_value, each1_lookup, div0, destroy_block, create_each_block, t4, get_each_context);

        if (
        /*hasMore*/
        ctx[11]) {
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

        if (
        /*actualCount*/
        ctx[9] === 0) {
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
        131072 && div0_class_value !== (div0_class_value = "dropdown-menu ss-popup " + (
        /*popupVisible*/
        ctx[17] ? "show" : ""))) {
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

        for (var _i10 = 0; _i10 < each_blocks_1.length; _i10 += 1) {
          each_blocks_1[_i10].d();
        }
        /*button_binding*/


        ctx[68](null);
        if (if_block0) if_block0.d();
        if (if_block1) if_block1.d();

        for (var _i11 = 0; _i11 < each_blocks.length; _i11 += 1) {
          each_blocks[_i11].d();
        }

        if (if_block2) if_block2.d();
        if (if_block3) if_block3.d();
        /*div0_binding*/

        ctx[72](null);
        /*div1_binding*/

        ctx[73](null);
        run_all(dispose);
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
  var BLANK_ITEM = {
    id: "",
    text: ""
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

  function createItemFromOption(el) {
    var ds = el.dataset;
    var item = {
      id: el.value || "",
      text: el.text || ""
    };

    if (ds) {
      if (ds.itemDesc) {
        item.desc = ds.itemDesc;
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

  function createResult(data) {
    var items;
    var byId = {};

    if (data.fixedItems && data.fetchedItems) {
      items = [];

      if (data.fixedItems) {
        data.fixedItems.forEach(function (item) {
          items.push(item);
        });
      }

      if (data.fetchedItems) {
        if (items.length > 0) {
          items.push({
            separator: true
          });
        }

        var wasClear = false;
        data.fetchedItems.forEach(function (item) {
          if (wasClear) {
            items.push({
              separator: true
            });
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
    var counts = calculateCounts(data.fetchedItems || []);
    var more = data.more === true && counts.offsetCount > 0 && !data.fetchedId;
    var tooShort = data.tooShort === true;
    return {
      blankItem: byId[""] || null,
      byId: byId,
      displayItems: items,
      fetchedItems: data.fetchedItems,
      offsetCount: counts.offsetCount,
      actualCount: counts.actualCount,
      more: more,
      tooShort: tooShort
    };
  }

  function calculateCounts(items) {
    var act = 0;
    var off = 0;
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
    return {
      offsetCount: off,
      actualCount: act
    };
  }

  function focusNextItem(el) {
    var next = el.nextElementSibling;

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
    var containerEl;
    var inputEl;
    var toggleEl;
    var popupEl;
    var moreEl;
    var mounted = false;
    var query = "";
    var fixedItems = [];
    var result = createResult({});
    var displayItems = [];
    var actualCount = 0;
    var tooShort = false;
    var hasMore = false;
    var selectionById = {};
    var selectionItems = [];
    var selectionDropdownItems = [];
    var showFetching = false;
    var fetchingMore = false;
    var fetchError = null;
    var popupVisible = false;
    var activeFetch = null;
    var fetched = false;
    var previousFetch = null;
    var previousQuery = null;
    var multiple = false;
    var wasDown = false;
    var isSyncToReal = false;

    function inlineFetcher(offset, query) {
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
        $$invalidate(10, tooShort = false);
        $$invalidate(11, hasMore = false);
        fetched = false;
      }

      fetchingMore = fetchMore;
      $$invalidate(16, fetchError = null);
      $$invalidate(15, showFetching = false);
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
            fixedItems: fixedItems,
            fetchedId: fetchId,
            more: info.more,
            tooShort: info.too_short === true
          });
          $$invalidate(8, displayItems = result.displayItems);
          $$invalidate(9, actualCount = result.actualCount);
          $$invalidate(10, tooShort = result.tooShort);
          $$invalidate(11, hasMore = result.more);

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
      })["catch"](function (err) {
        if (currentFetch === activeFetch) {
          console.error(err);
          $$invalidate(16, fetchError = err);

          var _result = createResult({
            fixedItems: fixedItems
          });

          $$invalidate(8, displayItems = _result.displayItems);
          $$invalidate(9, actualCount = _result.actualCount);
          $$invalidate(10, tooShort = _result.tooShort);
          $$invalidate(11, hasMore = _result.more);
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
      setTimeout(function () {
        if (activeFetch === currentFetch) {
          $$invalidate(15, showFetching = true);
        }
      }, FETCH_INDICATOR_DELAY);
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
      $$invalidate(7, query = "");
      previousQuery = null;
    }

    function openPopup() {
      if (!popupVisible) {
        $$invalidate(17, popupVisible = true);
        var w = containerEl.offsetWidth;
        $$invalidate(5, popupEl.style.minWidth = w + "px", popupEl);
      }
    }

    function closePopup(focusToggle) {
      $$invalidate(14, selectionDropdownItems = selectionItems);
      $$invalidate(17, popupVisible = false);

      if (focusToggle) {
        toggleEl.focus();
      }
    }

    function selectItemImpl(id) {
      id = id.toString();
      var item = result.byId[id] || selectionById[id];

      if (!item) {
        console.error("MISSING item=" + id);
        return;
      }

      var blankItem = result.blankItem;
      var byId = selectionById;

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
          byId = _defineProperty({}, item.id, item);
        }
      } else {
        byId = _defineProperty({}, item.id, item);
        closePopup(containsElement(document.activeElement));
      }

      var items = Object.values(byId);

      if (items.length == 0 && blankItem) {
        byId = _defineProperty({}, blankItem.id, blankItem);
        items = [blankItem];
      }

      $$invalidate(12, selectionById = byId);
      $$invalidate(13, selectionItems = items.sort(function (a, b) {
        return a.text.localeCompare(b.text);
      }));
      syncToReal();
      real.dispatchEvent(new CustomEvent("select-select", {
        detail: selectionItems
      }));
    }

    function selectItem(id) {
      return fetchItems(false, id).then(function (response) {
        selectItemImpl(id);
      });
    }

    function selectElement(el) {
      selectItemImpl(el.dataset.id);

      if (el.dataset.selected) {
        $$invalidate(14, selectionDropdownItems);
      }
    }

    function containsElement(el) {
      return containerEl.contains(el) || popupEl.contains(el);
    }

    function syncFromReal() {
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

      $$invalidate(12, selectionById = byId);
      $$invalidate(13, selectionItems = Object.values(byId).sort(function (a, b) {
        return a.text.localeCompare(b.text);
      }));
    }

    function syncToReal() {
      var changed = false;

      if (remote) {
        selectionItems.forEach(function (item) {
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
        var curr = !!selectionById[el.value];

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
      $$invalidate(18, multiple = real.multiple);

      if (remote) {
        setupRemote();
      } else {
        $$invalidate(31, fetcher = inlineFetcher);
      }

      syncFromReal();
      real.addEventListener("change", function () {
        if (!isSyncToReal) {
          syncFromReal();
        }
      });
      $$invalidate(37, mounted = true);
    });
    var toggleKeydownHandlers = {
      base: function base(event) {
        if (typeahead && popupVisible) {
          inputEl.focus();
        }
      },
      ArrowDown: function ArrowDown(event) {
        openPopup();
        fetchItems();

        if (typeahead) {
          inputEl.focus();
        } else {
          var next = popupEl.querySelectorAll(".ki-js-item")[0];

          while (next && next.classList.contains("ki-js-blank")) {
            next = next.nextElementSibling;
          }

          if (next) {
            next.focus();
          }
        }

        event.preventDefault();
      },
      ArrowUp: nop,
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
      },
      Tab: nop
    };
    var toggleKeyupHandlers = {
      base: nop,
      Tab: nop
    };
    var inputKeypressHandlers = {
      base: function base(event) {}
    };
    var inputKeydownHandlers = {
      base: function base(event) {
        wasDown = true;
      },
      ArrowDown: function ArrowDown(event) {
        var next = popupEl.querySelectorAll(".ki-js-item")[0];

        while (next && next.classList.contains("ki-js-blank")) {
          next = next.nextElementSibling;
        }

        if (next) {
          next.focus();
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
      },
      Tab: function Tab(event) {
        toggleEl.focus();
        event.preventDefault();
      }
    };
    var inputKeyupHandlers = {
      base: function base(event) {
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

    function focusPreviousItem(el) {
      var next = el.previousElementSibling;

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

      if (next) {
        next.focus();
      }

      return next;
    }

    var itemKeydownHandlers = {
      base: function base(event) {
        if (typeahead) {
          inputEl.focus();
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
      PageUp: nop,
      PageDown: nop,
      Home: nop,
      End: nop,
      Tab: function Tab(event) {
        toggleEl.focus();
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
        var rect = popupEl.getBoundingClientRect();
        var next = document.elementFromPoint(scrollLeft + rect.x + 10, scrollTop + rect.top + 1);

        if (!next) {
          next = popupEl.querySelector(".ki-js-item:first-child");
        } else {
          if (!next.classList.contains("ki-js-item")) {
            next = popupEl.querySelector(".ki-js-item:first-child");
          }
        }

        if (next) {
          next.focus();
        }

        event.preventDefault();
      },
      PageDown: function PageDown(event) {
        var scrollLeft = document.body.scrollLeft;
        var scrollTop = document.body.scrollTop;
        var h = popupEl.offsetHeight;
        var rect = popupEl.getBoundingClientRect();
        var next = document.elementFromPoint(scrollLeft + rect.x + 10, scrollTop + rect.top + h - 10);

        if (!next) {
          next = popupEl.querySelector(".ki-js-item:last-child");
        } else {
          if (!next.classList.contains("ki-js-item")) {
            next = popupEl.querySelector(".ki-js-item:last-child");
          }
        }

        if (next) {
          next.focus();
        }

        event.preventDefault();
      },
      Home: function Home(event) {
        var next = popupEl.querySelector(".ki-js-item:first-child");

        if (next) {
          next.focus();
        }

        event.preventDefault();
      },
      End: function End(event) {
        var next = popupEl.querySelector(".ki-js-item:last-child");

        if (next) {
          next.focus();
        }

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
      binding_callbacks[$$value ? "unshift" : "push"](function () {
        $$invalidate(4, toggleEl = $$value);
      });
    }

    function input_input_handler() {
      query = this.value;
      $$invalidate(7, query);
    }

    function input_binding($$value) {
      binding_callbacks[$$value ? "unshift" : "push"](function () {
        $$invalidate(3, inputEl = $$value);
      });
    }

    function div_binding($$value) {
      binding_callbacks[$$value ? "unshift" : "push"](function () {
        $$invalidate(6, moreEl = $$value);
      });
    }

    function div0_binding($$value) {
      binding_callbacks[$$value ? "unshift" : "push"](function () {
        $$invalidate(5, popupEl = $$value);
      });
    }

    function div1_binding($$value) {
      binding_callbacks[$$value ? "unshift" : "push"](function () {
        $$invalidate(2, containerEl = $$value);
      });
    }

    $$self.$set = function ($$props) {
      if ("real" in $$props) $$invalidate(32, real = $$props.real);
      if ("fetcher" in $$props) $$invalidate(31, fetcher = $$props.fetcher);
      if ("remote" in $$props) $$invalidate(33, remote = $$props.remote);
      if ("queryMinLen" in $$props) $$invalidate(34, queryMinLen = $$props.queryMinLen);
      if ("delay" in $$props) $$invalidate(35, delay = $$props.delay);
      if ("extraClass" in $$props) $$invalidate(0, extraClass = $$props.extraClass);
      if ("typeahead" in $$props) $$invalidate(1, typeahead = $$props.typeahead);
    };

    $$self.$$.update = function () {
      if ($$self.$$.dirty[1] &
      /*mounted*/
      64) {
         {
          if (mounted) {
            syncToReal();
          }
        }
      }
    };

    return [extraClass, typeahead, containerEl, inputEl, toggleEl, popupEl, moreEl, query, displayItems, actualCount, tooShort, hasMore, selectionById, selectionItems, selectionDropdownItems, showFetching, fetchError, popupVisible, multiple, handleBlur, handleInputBlur, handleInputKeypress, handleInputKeydown, handleInputKeyup, handleToggleKeydown, handleToggleKeyup, handleToggleClick, handleItemKeydown, handleItemKeyup, handleItemClick, handlePopupScroll, fetcher, real, remote, queryMinLen, delay, selectItem, mounted, fixedItems, result, fetchingMore, activeFetch, fetched, previousFetch, previousQuery, wasDown, isSyncToReal, inlineFetcher, fetchItems, cancelFetch, fetchMoreIfneeded, clearQuery, openPopup, closePopup, selectItemImpl, selectElement, containsElement, syncFromReal, syncToReal, setupRemote, toggleKeydownHandlers, toggleKeyupHandlers, inputKeypressHandlers, inputKeydownHandlers, inputKeyupHandlers, focusPreviousItem, itemKeydownHandlers, itemKeyupHandlers, button_binding, input_input_handler, input_binding, div_binding, div0_binding, div1_binding];
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
        real: 32,
        fetcher: 31,
        remote: 33,
        queryMinLen: 34,
        delay: 35,
        extraClass: 0,
        typeahead: 1,
        selectItem: 36
      }, [-1, -1, -1]);
      return _this;
    }

    _createClass(Select, [{
      key: "selectItem",
      get: function get() {
        return this.$$.ctx[36];
      }
    }]);

    return Select;
  }(SvelteComponent);

  exports.config = config;
  exports.default = Select;

  return exports;

}({}));
