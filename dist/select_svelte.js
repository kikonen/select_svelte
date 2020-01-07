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

  function toggle_class(element, name, toggle) {
    element.classList[toggle ? 'add' : 'remove'](name);
  }

  var HtmlTag =
  /*#__PURE__*/
  function () {
    function HtmlTag(html) {
      var anchor = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

      _classCallCheck(this, HtmlTag);

      this.e = element('div');
      this.a = anchor;
      this.u(html);
    }

    _createClass(HtmlTag, [{
      key: "m",
      value: function m(target) {
        var anchor = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

        for (var i = 0; i < this.n.length; i += 1) {
          insert(target, this.n[i], anchor);
        }

        this.t = target;
      }
    }, {
      key: "u",
      value: function u(html) {
        this.e.innerHTML = html;
        this.n = Array.from(this.e.childNodes);
      }
    }, {
      key: "p",
      value: function p(html) {
        this.d();
        this.u(html);
        this.m(this.t, this.a);
      }
    }, {
      key: "d",
      value: function d() {
        this.n.forEach(detach);
      }
    }]);

    return HtmlTag;
  }();

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
    child_ctx[77] = list[i];
    return child_ctx;
  }

  function get_each_context_1(ctx, list, i) {
    var child_ctx = ctx.slice();
    child_ctx[77] = list[i];
    child_ctx[81] = i;
    return child_ctx;
  } // (1198:6) {#each selectionItems as item, index (item.id)}


  function create_each_block_1(key_1, ctx) {
    var first;
    var html_tag;
    var raw_value = (
    /*index*/
    ctx[81] > 0 ? ",&nbsp;" : "") + "";
    var t0;
    var span;
    var t1_value =
    /*item*/
    ctx[77].text + "";
    var t1;
    var span_class_value;
    return {
      key: key_1,
      first: null,
      c: function c() {
        first = empty();
        t0 = space();
        span = element("span");
        t1 = text(t1_value);
        html_tag = new HtmlTag(raw_value, t0);
        attr(span, "class", span_class_value = "ss-no-click ss-selected-item " +
        /*item*/
        ctx[77].itemClass);
        this.first = first;
      },
      m: function m(target, anchor) {
        insert(target, first, anchor);
        html_tag.m(target, anchor);
        insert(target, t0, anchor);
        insert(target, span, anchor);
        append(span, t1);
      },
      p: function p(ctx, dirty) {
        if (dirty[0] &
        /*selectionItems*/
        1024 && raw_value !== (raw_value = (
        /*index*/
        ctx[81] > 0 ? ",&nbsp;" : "") + "")) html_tag.p(raw_value);
        if (dirty[0] &
        /*selectionItems*/
        1024 && t1_value !== (t1_value =
        /*item*/
        ctx[77].text + "")) set_data(t1, t1_value);

        if (dirty[0] &
        /*selectionItems*/
        1024 && span_class_value !== (span_class_value = "ss-no-click ss-selected-item " +
        /*item*/
        ctx[77].itemClass)) {
          attr(span, "class", span_class_value);
        }
      },
      d: function d(detaching) {
        if (detaching) detach(first);
        if (detaching) html_tag.d();
        if (detaching) detach(t0);
        if (detaching) detach(span);
      }
    };
  } // (1212:4) {#if typeahead}


  function create_if_block_10(ctx) {
    var div;
    var input;
    var input_class_value;
    var dispose;
    return {
      c: function c() {
        div = element("div");
        input = element("input");
        attr(input, "class", input_class_value = "ss-input form-control " +
        /*setupStyles*/
        ctx[18].typeahead_class);
        attr(input, "tabindex", "1");
        attr(input, "autocomplete", "new-password");
        attr(input, "autocorrect", "off");
        attr(input, "autocapitalize", "off");
        attr(input, "spellcheck", "off");
        attr(div, "class", "ss-input-item");
        attr(div, "tabindex", "-1");
        dispose = [listen(input, "input",
        /*input_input_handler*/
        ctx[73]), listen(input, "blur",
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
        insert(target, div, anchor);
        append(div, input);
        set_input_value(input,
        /*query*/
        ctx[6]);
        /*input_binding*/

        ctx[74](input);
      },
      p: function p(ctx, dirty) {
        if (dirty[0] &
        /*query*/
        64 && input.value !==
        /*query*/
        ctx[6]) {
          set_input_value(input,
          /*query*/
          ctx[6]);
        }
      },
      d: function d(detaching) {
        if (detaching) detach(div);
        /*input_binding*/

        ctx[74](null);
        run_all(dispose);
      }
    };
  } // (1251:6) {:else}


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
    var div3_data_action_value;
    var dispose;
    var if_block0 =
    /*multiple*/
    ctx[17] && create_if_block_8(ctx);

    function select_block_type_1(ctx, dirty) {
      if (
      /*item*/
      ctx[77].id) return create_if_block_7;
      return create_else_block_1;
    }

    var current_block_type = select_block_type_1(ctx);
    var if_block1 = current_block_type(ctx);
    var if_block2 =
    /*item*/
    ctx[77].desc && create_if_block_6(ctx);
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
        ctx[77].itemClass);
        attr(div1, "class", "d-inline-block");
        attr(div2, "class", "ss-no-click");
        attr(div3, "tabindex", "1");
        attr(div3, "class", div3_class_value = "ss-js-item dropdown-item ss-item " +
        /*item*/
        ctx[77].itemClass + " " + (
        /*selectionById*/
        ctx[9][
        /*item*/
        ctx[77].id] ?
        /*setupStyles*/
        ctx[18].selected_item_class : ""));
        attr(div3, "data-id", div3_data_id_value =
        /*item*/
        ctx[77].id);
        attr(div3, "data-action", div3_data_action_value =
        /*item*/
        ctx[77].action || "");
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
        ctx[17]) {
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

        if (dirty[0] &
        /*displayItems*/
        256 && div0_class_value !== (div0_class_value = "ss-no-click " +
        /*item*/
        ctx[77].itemClass)) {
          attr(div0, "class", div0_class_value);
        }

        if (
        /*item*/
        ctx[77].desc) {
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
        768 && div3_class_value !== (div3_class_value = "ss-js-item dropdown-item ss-item " +
        /*item*/
        ctx[77].itemClass + " " + (
        /*selectionById*/
        ctx[9][
        /*item*/
        ctx[77].id] ?
        /*setupStyles*/
        ctx[18].selected_item_class : ""))) {
          attr(div3, "class", div3_class_value);
        }

        if (dirty[0] &
        /*displayItems*/
        256 && div3_data_id_value !== (div3_data_id_value =
        /*item*/
        ctx[77].id)) {
          attr(div3, "data-id", div3_data_id_value);
        }

        if (dirty[0] &
        /*displayItems*/
        256 && div3_data_action_value !== (div3_data_action_value =
        /*item*/
        ctx[77].action || "")) {
          attr(div3, "data-action", div3_data_action_value);
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
  } // (1237:50) 


  function create_if_block_4(ctx) {
    var div1;
    var div0;
    var t0_value = (
    /*item*/
    ctx[77].display_text ||
    /*item*/
    ctx[77].text) + "";
    var t0;
    var div0_class_value;
    var t1;
    var dispose;
    var if_block =
    /*item*/
    ctx[77].desc && create_if_block_5(ctx);
    return {
      c: function c() {
        div1 = element("div");
        div0 = element("div");
        t0 = text(t0_value);
        t1 = space();
        if (if_block) if_block.c();
        attr(div0, "class", div0_class_value = "ss-no-click " +
        /*item*/
        ctx[77].itemClass);
        attr(div1, "tabindex", "-1");
        attr(div1, "class", "dropdown-item text-muted ss-js-blank");
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
        ctx[77].display_text ||
        /*item*/
        ctx[77].text) + "")) set_data(t0, t0_value);

        if (dirty[0] &
        /*displayItems*/
        256 && div0_class_value !== (div0_class_value = "ss-no-click " +
        /*item*/
        ctx[77].itemClass)) {
          attr(div0, "class", div0_class_value);
        }

        if (
        /*item*/
        ctx[77].desc) {
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
  } // (1231:6) {#if item.separator}


  function create_if_block_3(ctx) {
    var div;
    var dispose;
    return {
      c: function c() {
        div = element("div");
        attr(div, "tabindex", "-1");
        attr(div, "class", "dropdown-divider ss-js-blank");
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
  } // (1262:12) {#if multiple}


  function create_if_block_8(ctx) {
    var div;
    var if_block =
    /*item*/
    ctx[77].id && create_if_block_9(ctx);
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
        ctx[77].id) {
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
  } // (1264:16) {#if item.id}


  function create_if_block_9(ctx) {
    var i;
    var i_class_value;
    return {
      c: function c() {
        i = element("i");
        attr(i, "class", i_class_value = "far " + (
        /*selectionById*/
        ctx[9][
        /*item*/
        ctx[77].id] ? "fa-check-square" : "fa-square"));
      },
      m: function m(target, anchor) {
        insert(target, i, anchor);
      },
      p: function p(ctx, dirty) {
        if (dirty[0] &
        /*selectionById, displayItems*/
        768 && i_class_value !== (i_class_value = "far " + (
        /*selectionById*/
        ctx[9][
        /*item*/
        ctx[77].id] ? "fa-check-square" : "fa-square"))) {
          attr(i, "class", i_class_value);
        }
      },
      d: function d(detaching) {
        if (detaching) detach(i);
      }
    };
  } // (1274:16) {:else}


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
  } // (1272:16) {#if item.id}


  function create_if_block_7(ctx) {
    var t_value =
    /*item*/
    ctx[77].text + "";
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
        ctx[77].text + "")) set_data(t, t_value);
      },
      d: function d(detaching) {
        if (detaching) detach(t);
      }
    };
  } // (1279:14) {#if item.desc}


  function create_if_block_6(ctx) {
    var div;
    var t_value =
    /*item*/
    ctx[77].desc + "";
    var t;
    var div_class_value;
    return {
      c: function c() {
        div = element("div");
        t = text(t_value);
        attr(div, "class", div_class_value = "ss-no-click " +
        /*setupStyles*/
        ctx[18].item_desc_class);
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
        ctx[77].desc + "")) set_data(t, t_value);
      },
      d: function d(detaching) {
        if (detaching) detach(div);
      }
    };
  } // (1244:10) {#if item.desc}


  function create_if_block_5(ctx) {
    var div;
    var t_value =
    /*item*/
    ctx[77].desc + "";
    var t;
    var div_class_value;
    return {
      c: function c() {
        div = element("div");
        t = text(t_value);
        attr(div, "class", div_class_value = "ss-no-click " +
        /*setupStyles*/
        ctx[18].item_desc_class);
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
        ctx[77].desc + "")) set_data(t, t_value);
      },
      d: function d(detaching) {
        if (detaching) detach(div);
      }
    };
  } // (1230:4) {#each displayItems as item (item.id)}


  function create_each_block(key_1, ctx) {
    var first;
    var if_block_anchor;

    function select_block_type(ctx, dirty) {
      if (
      /*item*/
      ctx[77].separator) return create_if_block_3;
      if (
      /*item*/
      ctx[77].disabled ||
      /*item*/
      ctx[77].placeholder) return create_if_block_4;
      return create_else_block;
    }

    var current_block_type = select_block_type(ctx);
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
      d: function d(detaching) {
        if (detaching) detach(first);
        if_block.d(detaching);
        if (detaching) detach(if_block_anchor);
      }
    };
  } // (1290:4) {#if actualCount === 0 && previousFetch || activeFetch}


  function create_if_block_2(ctx) {
    var div;
    return {
      c: function c() {
        div = element("div");
        div.textContent = "".concat(translate("no_results"));
        attr(div, "tabindex", "-1");
        attr(div, "class", "dropdown-item text-muted ss-no-click ss-js-blank");
      },
      m: function m(target, anchor) {
        insert(target, div, anchor);
      },
      p: noop,
      d: function d(detaching) {
        if (detaching) detach(div);
      }
    };
  } // (1296:4) {#if fetchError}


  function create_if_block_1(ctx) {
    var div;
    var t;
    return {
      c: function c() {
        div = element("div");
        t = text(
        /*fetchError*/
        ctx[13]);
        attr(div, "tabindex", "-1");
        attr(div, "class", "dropdown-item border-top text-danger ss-no-click ss-js-blank ss-sticky-item");
      },
      m: function m(target, anchor) {
        insert(target, div, anchor);
        append(div, t);
      },
      p: function p(ctx, dirty) {
        if (dirty[0] &
        /*fetchError*/
        8192) set_data(t,
        /*fetchError*/
        ctx[13]);
      },
      d: function d(detaching) {
        if (detaching) detach(div);
      }
    };
  } // (1302:4) {#if selectionItems.length >= maxItems}


  function create_if_block(ctx) {
    var div;
    return {
      c: function c() {
        div = element("div");
        div.textContent = "".concat(translate("max_limit"));
        attr(div, "tabindex", "-1");
        attr(div, "class", "dropdown-item border-top text-danger ss-no-click ss-js-blank ss-sticky-item");
      },
      m: function m(target, anchor) {
        insert(target, div, anchor);
      },
      p: noop,
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
    var i;
    var i_class_value;
    var button_class_value;
    var t1;
    var div0;
    var t2;
    var each_blocks = [];
    var each1_lookup = new Map();
    var t3;
    var t4;
    var t5;
    var div1_class_value;
    var dispose;
    var each_value_1 =
    /*selectionItems*/
    ctx[10];

    var get_key = function get_key(ctx) {
      return (
        /*item*/
        ctx[77].id
      );
    };

    for (var _i = 0; _i < each_value_1.length; _i += 1) {
      var child_ctx = get_each_context_1(ctx, each_value_1, _i);
      var key = get_key(child_ctx);
      each0_lookup.set(key, each_blocks_1[_i] = create_each_block_1(key, child_ctx));
    }

    var if_block0 =
    /*typeahead*/
    ctx[1] && create_if_block_10(ctx);
    var each_value =
    /*displayItems*/
    ctx[8];

    var get_key_1 = function get_key_1(ctx) {
      return (
        /*item*/
        ctx[77].id
      );
    };

    for (var _i2 = 0; _i2 < each_value.length; _i2 += 1) {
      var _child_ctx = get_each_context(ctx, each_value, _i2);

      var _key = get_key_1(_child_ctx);

      each1_lookup.set(_key, each_blocks[_i2] = create_each_block(_key, _child_ctx));
    }

    var if_block1 = (
    /*actualCount*/
    ctx[7] === 0 &&
    /*previousFetch*/
    ctx[16] ||
    /*activeFetch*/
    ctx[15]) && create_if_block_2();
    var if_block2 =
    /*fetchError*/
    ctx[13] && create_if_block_1(ctx);
    var if_block3 =
    /*selectionItems*/
    ctx[10].length >=
    /*maxItems*/
    ctx[0] && create_if_block();
    return {
      c: function c() {
        div1 = element("div");
        button = element("button");
        span0 = element("span");

        for (var _i3 = 0; _i3 < each_blocks_1.length; _i3 += 1) {
          each_blocks_1[_i3].c();
        }

        t0 = space();
        span1 = element("span");
        i = element("i");
        t1 = space();
        div0 = element("div");
        if (if_block0) if_block0.c();
        t2 = space();

        for (var _i4 = 0; _i4 < each_blocks.length; _i4 += 1) {
          each_blocks[_i4].c();
        }

        t3 = space();
        if (if_block1) if_block1.c();
        t4 = space();
        if (if_block2) if_block2.c();
        t5 = space();
        if (if_block3) if_block3.c();
        attr(span0, "class", "ss-no-click ss-selection text-dark d-flex");
        attr(i, "class", i_class_value = "text-dark " + (
        /*showFetching*/
        ctx[12] ? CARET_FETCHING : CARET_DOWN));
        attr(span1, "class", "ml-auto");
        attr(button, "class", button_class_value = "form-control " +
        /*setupStyles*/
        ctx[18].control_class + " d-flex");
        attr(button, "type", "button");
        attr(button, "tabindex", "0");
        attr(button, "title",
        /*selectionTitle*/
        ctx[11]);
        attr(div0, "class", "dropdown-menu ss-popup");
        toggle_class(div0, "show",
        /*popupVisible*/
        ctx[14]);
        attr(div1, "class", div1_class_value = "ss-container form-control p-0 border-0 " +
        /*setupStyles*/
        ctx[18].container_class);
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
        append(button, span0);

        for (var _i5 = 0; _i5 < each_blocks_1.length; _i5 += 1) {
          each_blocks_1[_i5].m(span0, null);
        }

        append(button, t0);
        append(button, span1);
        append(span1, i);
        /*button_binding*/

        ctx[72](button);
        append(div1, t1);
        append(div1, div0);
        if (if_block0) if_block0.m(div0, null);
        append(div0, t2);

        for (var _i6 = 0; _i6 < each_blocks.length; _i6 += 1) {
          each_blocks[_i6].m(div0, null);
        }

        append(div0, t3);
        if (if_block1) if_block1.m(div0, null);
        append(div0, t4);
        if (if_block2) if_block2.m(div0, null);
        append(div0, t5);
        if (if_block3) if_block3.m(div0, null);
        /*div0_binding*/

        ctx[75](div0);
        /*div1_binding*/

        ctx[76](div1);
      },
      p: function p(ctx, dirty) {
        var each_value_1 =
        /*selectionItems*/
        ctx[10];
        each_blocks_1 = update_keyed_each(each_blocks_1, dirty, get_key, 1, ctx, each_value_1, each0_lookup, span0, destroy_block, create_each_block_1, null, get_each_context_1);

        if (dirty[0] &
        /*showFetching*/
        4096 && i_class_value !== (i_class_value = "text-dark " + (
        /*showFetching*/
        ctx[12] ? CARET_FETCHING : CARET_DOWN))) {
          attr(i, "class", i_class_value);
        }

        if (dirty[0] &
        /*selectionTitle*/
        2048) {
          attr(button, "title",
          /*selectionTitle*/
          ctx[11]);
        }

        if (
        /*typeahead*/
        ctx[1]) {
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

        var each_value =
        /*displayItems*/
        ctx[8];
        each_blocks = update_keyed_each(each_blocks, dirty, get_key_1, 1, ctx, each_value, each1_lookup, div0, destroy_block, create_each_block, t3, get_each_context);

        if (
        /*actualCount*/
        ctx[7] === 0 &&
        /*previousFetch*/
        ctx[16] ||
        /*activeFetch*/
        ctx[15]) {
          if (if_block1) {
            if_block1.p(ctx, dirty);
          } else {
            if_block1 = create_if_block_2();
            if_block1.c();
            if_block1.m(div0, t4);
          }
        } else if (if_block1) {
          if_block1.d(1);
          if_block1 = null;
        }

        if (
        /*fetchError*/
        ctx[13]) {
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
        ctx[10].length >=
        /*maxItems*/
        ctx[0]) {
          if (if_block3) {
            if_block3.p(ctx, dirty);
          } else {
            if_block3 = create_if_block();
            if_block3.c();
            if_block3.m(div0, null);
          }
        } else if (if_block3) {
          if_block3.d(1);
          if_block3 = null;
        }

        if (dirty[0] &
        /*popupVisible*/
        16384) {
          toggle_class(div0, "show",
          /*popupVisible*/
          ctx[14]);
        }
      },
      i: noop,
      o: noop,
      d: function d(detaching) {
        if (detaching) detach(div1);

        for (var _i7 = 0; _i7 < each_blocks_1.length; _i7 += 1) {
          each_blocks_1[_i7].d();
        }
        /*button_binding*/


        ctx[72](null);
        if (if_block0) if_block0.d();

        for (var _i8 = 0; _i8 < each_blocks.length; _i8 += 1) {
          each_blocks[_i8].d();
        }

        if (if_block1) if_block1.d();
        if (if_block2) if_block2.d();
        if (if_block3) if_block3.d();
        /*div0_binding*/

        ctx[75](null);
        /*div1_binding*/

        ctx[76](null);
        run_all(dispose);
      }
    };
  }
  var I18N_DEFAULTS = {
    clear: "Clear",
    no_results: "No results",
    max_limit: "Max limit reached"
  };
  var STYLE_DEFAULTS = {
    container_class: "",
    item_class: "",
    item_desc_class: "text-muted",
    blank_item_class: "text-muted",
    selected_item_class: "alert-primary",
    typeahead_class: "",
    control_class: ""
  };
  var FETCH_INDICATOR_DELAY = 150;
  var CARET_DOWN = "fas fa-caret-down";
  var CARET_FETCHING = "far fa-hourglass";
  var BLANK_ITEM = {
    id: "",
    text: ""
  };
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

  function createItemFromOption(el, styles) {
    var ds = el.dataset;
    var item = {
      id: el.value || "",
      text: el.text || ""
    };

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
        item.itemClass = ds.itemClass;
      }
    }

    if (!item.separator) {
      if (item.id === "") {
        item.blank = true;
      }

      if (!item.itemClass) {
        item.itemClass = item.blank ? styles.blank_item_class : styles.item_class;
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

    if (item.action) {
      el.setAttribute("data-item-action", item.action);
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
    var fixedById = data.fixedById || {};
    var fetchedById = data.fetchedById || {};
    var selectionById = data.selectionById || {};
    fixedItems.forEach(function (item) {
      items.push(item);

      if (!item.separator) {
        byId[item.id] = item;
      }
    });
    var otherItems = [];

    if (data.filterBySelection) {
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
      otherItems.push({
        id: "selection_sep",
        separator: true
      });
    }

    fetchedItems.forEach(function (item) {
      if (!data.filterBySelection || !byId[item.id] || item.separator) {
        otherItems.push(item);

        if (!item.separator) {
          byId[item.id] = item;
        }
      }
    });

    if (otherItems.length && items.length) {
      items.push({
        id: "fixed_sep",
        separator: true
      });
    }

    otherItems.forEach(function (item) {
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
      displayItems: items
    };
  }

  function createResult(data) {
    var byId = {};
    var fetchedItems = data.fetchedItems || [];
    fetchedItems.forEach(function (item) {
      if (item.id) {
        item.id = item.id.toString();
      }

      if (!item.separator) {
        byId[item.id] = item;
      }
    });
    var counts = calculateCounts(fetchedItems);
    var more = data.more === true && counts.offsetCount > 0 && !data.fetchedId;
    var blankItem = byId[""] || null;

    if (blankItem) {
      blankItem.blank = true;
    }

    return {
      blankItem: blankItem,
      fetchedItems: fetchedItems,
      fetchedById: byId,
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

  function handleEvent(code, handlers, event) {
    (handlers[code] || handlers.base)(event);
  }

  function instance($$self, $$props, $$invalidate) {
    var real = $$props.real;
    var fetcher = $$props.fetcher;
    var remote = $$props.remote;
    var _$$props$maxItems = $$props.maxItems,
        maxItems = _$$props$maxItems === void 0 ? 100 : _$$props$maxItems;
    var _$$props$typeahead = $$props.typeahead,
        typeahead = _$$props$typeahead === void 0 ? false : _$$props$typeahead;
    var _$$props$styles = $$props.styles,
        styles = _$$props$styles === void 0 ? {} : _$$props$styles;
    var containerEl;
    var inputEl;
    var toggleEl;
    var popupEl;
    var setup = false;
    var setupStyles = {};
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
    var selectionTitle = "";
    var showFetching = false;
    var fetchingMore = false;
    var fetchError = null;
    var popupVisible = false;
    var activeFetch = null;
    var previousFetch = null;
    var previousQuery = null;
    var multiple = false;
    var isSyncToReal = false;

    function inlineFetcher(offset, query) {
      var promise = new Promise(function (resolve, reject) {
        var items = [];
        var pattern = query.toUpperCase().trim();
        var options = real.options;

        for (var i = 0; i < options.length; i++) {
          var item = createItemFromOption(options[i], setupStyles);
          var match = void 0;

          if (item.blank) {
            match = false;
          } else {
            match = item.separator || item.text.toUpperCase().includes(pattern) || item.desc.toUpperCase().includes(pattern);
          }

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
          item = createItemFromOption(el, setupStyles);
        }

        byId[item.id] = item;
      }

      $$invalidate(9, selectionById = byId);
      $$invalidate(10, selectionItems = Object.values(byId).sort(function (a, b) {
        return a.text.localeCompare(b.text);
      }));
      $$invalidate(11, selectionTitle = selectionItems.map(function (item) {
        return item.text;
      }).join(", "));
    }

    function syncToRealSelection() {
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
        var selected = !!selectionById[el.value];
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
      var byId = {};
      var items = [];
      var options = real.options;

      for (var i = 0; i < options.length; i++) {
        var el = options[i];

        if (!el.value || el.dataset.itemFixed != null) {
          var item = createItemFromOption(el, setupStyles);
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
      display = createDisplay({
        fixedItems: fixedItems,
        fixedById: fixedById,
        fetchedItems: result.fetchedItems,
        fetchedById: result.fetchedById,
        selectionItems: selectionItems,
        selectionById: selectionById,
        filterBySelection: multiple
      });
      $$invalidate(8, displayItems = display.displayItems);
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
        hasMore = false;
      }

      fetchingMore = fetchMore;
      $$invalidate(13, fetchError = null);
      $$invalidate(12, showFetching = false);
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
          $$invalidate(7, actualCount = result.actualCount);
          hasMore = result.more;
          updateDisplay();

          if (fetchId) {
            previousQuery = null;
          } else {
            previousQuery = currentQuery;
          }

          $$invalidate(16, previousFetch = currentFetch);
          $$invalidate(15, activeFetch = null);
          fetchingMore = false;
          $$invalidate(12, showFetching = false);
          setTimeout(function () {
            fetchMoreIfneeded();
          });
        }
      })["catch"](function (err) {
        if (currentFetch === activeFetch) {
          console.error(err);
          $$invalidate(13, fetchError = err);

          var _result = createResult({});

          $$invalidate(7, actualCount = _result.actualCount);
          hasMore = _result.more;
          updateDisplay();
          previousQuery = null;
          $$invalidate(16, previousFetch = currentFetch);
          $$invalidate(15, activeFetch = null);
          fetchingMore = false;
          $$invalidate(12, showFetching = false);
          toggleEl.focus();
          openPopup();
        }
      });
      setTimeout(function () {
        if (activeFetch === currentFetch) {
          $$invalidate(12, showFetching = true);
        }
      }, FETCH_INDICATOR_DELAY);
      $$invalidate(15, activeFetch = currentFetch);
      $$invalidate(16, previousFetch = null);
      return currentFetch;
    }

    function cancelFetch() {
      if (activeFetch !== null) {
        $$invalidate(15, activeFetch = null);
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

    function clearQuery() {
      $$invalidate(6, query = "");
      previousQuery = null;
    }

    function openPopup() {
      if (!popupVisible) {
        $$invalidate(14, popupVisible = true);
        var w = containerEl.offsetWidth;
        $$invalidate(5, popupEl.style.minWidth = w + "px", popupEl);
      }
    }

    function closePopup(focusToggle) {
      $$invalidate(14, popupVisible = false);
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
              blankItem = BLANK_ITEM;
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

      var items = Object.values(byId);

      if (items.length == 0 && blankItem) {
        byId = _defineProperty({}, blankItem.id, blankItem);
        items = [blankItem];
      }

      $$invalidate(9, selectionById = byId);
      $$invalidate(10, selectionItems = items.sort(function (a, b) {
        return a.text.localeCompare(b.text);
      }));
      $$invalidate(11, selectionTitle = selectionItems.map(function (item) {
        return item.text;
      }).join(", "));

      if (!multiple) {
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

        if (el.dataset.selected) ;
      }
    }

    function containsElement(el) {
      return containerEl.contains(el) || popupEl.contains(el);
    }

    function setupComponent() {
      real.classList.add("d-none");
      $$invalidate(17, multiple = real.multiple);

      if (!remote) {
        $$invalidate(31, fetcher = inlineFetcher);
      }

      jQuery(toggleEl).tooltip();
      Object.assign(setupStyles, STYLE_DEFAULTS);
      Object.assign(setupStyles, styles);
      updateFixedItems();
      updateDisplay();
    }

    beforeUpdate(function () {
      if (!setup) {
        setupComponent();
        setup = true;
      }
    });
    onMount(function () {
      syncFromRealSelection();
      real.addEventListener("change", function () {
        if (!isSyncToReal) {
          syncFromRealSelection();
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
          var next = popupEl.querySelectorAll(".ss-js-item")[0];

          while (next && next.classList.contains("ss-js-blank")) {
            next = next.nextElementSibling;
          }

          focusItem(next);
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
      Tab: nop,
      ArrowLeft: nop,
      ArrowRight: nop,
      PageDown: nop,
      PageUp: nop,
      Home: nop,
      End: nop,
      ControlRight: nop,
      ControlLeft: nop,
      ShiftRight: nop,
      ShiftLeft: nop,
      AltGraph: nop,
      AltRight: nop,
      MetaRight: nop,
      MetaLeft: nop,
      ContextMenu: nop
    };
    var toggleKeyupHandlers = {
      base: nop,
      Tab: nop
    };
    var inputKeypressHandlers = {
      base: function base(event) {}
    };
    var inputKeydownHandlers = {
      base: nop,
      ArrowDown: function ArrowDown(event) {
        var next = popupEl.querySelectorAll(".ss-js-item")[0];

        while (next && next.classList.contains("ss-js-blank")) {
          next = next.nextElementSibling;
        }

        focusItem(next);
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
        if (isValidKey(event)) {
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
      ControlRight: nop,
      ControlLeft: nop,
      ShiftRight: nop,
      ShiftLeft: nop,
      AltGraph: nop,
      AltRight: nop,
      MetaRight: nop,
      MetaLeft: nop,
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
      var next = el.previousElementSibling;

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
      var next = el.nextElementSibling;

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
      ControlRight: nop,
      ControlLeft: nop,
      ShiftRight: nop,
      ShiftLeft: nop,
      AltGraph: nop,
      AltRight: nop,
      MetaRight: nop,
      MetaLeft: nop,
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
      $$invalidate(6, query);
    }

    function input_binding($$value) {
      binding_callbacks[$$value ? "unshift" : "push"](function () {
        $$invalidate(3, inputEl = $$value);
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
      if ("maxItems" in $$props) $$invalidate(0, maxItems = $$props.maxItems);
      if ("typeahead" in $$props) $$invalidate(1, typeahead = $$props.typeahead);
      if ("styles" in $$props) $$invalidate(34, styles = $$props.styles);
    };

    $$self.$$.update = function () {
      if ($$self.$$.dirty[1] &
      /*mounted*/
      64) {
         {
          if (mounted) {
            syncToRealSelection();
          }
        }
      }
    };

    return [maxItems, typeahead, containerEl, inputEl, toggleEl, popupEl, query, actualCount, displayItems, selectionById, selectionItems, selectionTitle, showFetching, fetchError, popupVisible, activeFetch, previousFetch, multiple, setupStyles, handleBlur, handleInputBlur, handleInputKeypress, handleInputKeydown, handleInputKeyup, handleToggleKeydown, handleToggleKeyup, handleToggleClick, handleItemKeydown, handleItemKeyup, handleItemClick, handlePopupScroll, fetcher, real, remote, styles, selectItem, setup, mounted, fixedItems, fixedById, result, hasMore, display, fetchingMore, previousQuery, isSyncToReal, inlineFetcher, syncFromRealSelection, syncToRealSelection, updateFixedItems, updateDisplay, fetchItems, cancelFetch, fetchMoreIfneeded, clearQuery, openPopup, closePopup, selectItemImpl, executeAction, selectElement, containsElement, setupComponent, toggleKeydownHandlers, toggleKeyupHandlers, inputKeypressHandlers, inputKeydownHandlers, inputKeyupHandlers, focusItem, focusPreviousItem, focusNextItem, itemKeydownHandlers, itemKeyupHandlers, button_binding, input_input_handler, input_binding, div0_binding, div1_binding];
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
        maxItems: 0,
        typeahead: 1,
        styles: 34,
        selectItem: 35
      }, [-1, -1, -1]);
      return _this;
    }

    _createClass(Select, [{
      key: "selectItem",
      get: function get() {
        return this.$$.ctx[35];
      }
    }]);

    return Select;
  }(SvelteComponent);

  exports.config = config;
  exports.default = Select;

  return exports;

}({}));
