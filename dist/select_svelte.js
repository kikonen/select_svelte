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

  function destroy_each(iterations, detaching) {
    for (var i = 0; i < iterations.length; i += 1) {
      if (iterations[i]) iterations[i].d(detaching);
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
  } // (922:4) {#if typeahead}


  function create_if_block_9(ctx) {
    var input_1;
    var input_1_class_value;
    var dispose;
    return {
      c: function c() {
        input_1 = element("input");
        attr(input_1, "class", input_1_class_value = "ki-select-input form-control " + (
        /*inputVisible*/
        ctx[16] ? "" : "d-none") + " svelte-1y1l0qo");
        attr(input_1, "autocomplete", "new-password");
        attr(input_1, "autocorrect", "off");
        attr(input_1, "autocapitalize", "off");
        attr(input_1, "spellcheck", "off");
        dispose = [listen(input_1, "input",
        /*input_1_input_handler*/
        ctx[70]), listen(input_1, "blur",
        /*handleInputBlur*/
        ctx[20]), listen(input_1, "keypress",
        /*handleInputKeypress*/
        ctx[21]), listen(input_1, "keydown",
        /*handleInputKeydown*/
        ctx[22]), listen(input_1, "keyup",
        /*handleInputKeyup*/
        ctx[23])];
      },
      m: function m(target, anchor) {
        insert(target, input_1, anchor);
        set_input_value(input_1,
        /*query*/
        ctx[2]);
        /*input_1_binding*/

        ctx[71](input_1);
      },
      p: function p(ctx, dirty) {
        if (dirty[0] &
        /*inputVisible*/
        65536 && input_1_class_value !== (input_1_class_value = "ki-select-input form-control " + (
        /*inputVisible*/
        ctx[16] ? "" : "d-none") + " svelte-1y1l0qo")) {
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
      },
      d: function d(detaching) {
        if (detaching) detach(input_1);
        /*input_1_binding*/

        ctx[71](null);
        run_all(dispose);
      }
    };
  } // (942:8) {#each Object.values(selection) as item, index}


  function create_each_block_1(ctx) {
    var span;
    var t0_value = (
    /*index*/
    ctx[81] > 0 ? ", " : "") + "";
    var t0;
    var t1_value =
    /*item*/
    ctx[77].text + "";
    var t1;
    var span_class_value;
    return {
      c: function c() {
        span = element("span");
        t0 = text(t0_value);
        t1 = text(t1_value);
        attr(span, "class", span_class_value = "ki-no-click " + (
        /*item*/
        ctx[77].id ? "text-dark" : "text-muted") + " svelte-1y1l0qo");
      },
      m: function m(target, anchor) {
        insert(target, span, anchor);
        append(span, t0);
        append(span, t1);
      },
      p: function p(ctx, dirty) {
        if (dirty[0] &
        /*selection*/
        2048 && t1_value !== (t1_value =
        /*item*/
        ctx[77].text + "")) set_data(t1, t1_value);

        if (dirty[0] &
        /*selection*/
        2048 && span_class_value !== (span_class_value = "ki-no-click " + (
        /*item*/
        ctx[77].id ? "text-dark" : "text-muted") + " svelte-1y1l0qo")) {
          attr(span, "class", span_class_value);
        }
      },
      d: function d(detaching) {
        if (detaching) detach(span);
      }
    };
  } // (982:4) {:else}


  function create_else_block_1(ctx) {
    var each_1_anchor;
    var each_value =
    /*displayItems*/
    ctx[9];
    var each_blocks = [];

    for (var i = 0; i < each_value.length; i += 1) {
      each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    }

    return {
      c: function c() {
        for (var _i = 0; _i < each_blocks.length; _i += 1) {
          each_blocks[_i].c();
        }

        each_1_anchor = empty();
      },
      m: function m(target, anchor) {
        for (var _i2 = 0; _i2 < each_blocks.length; _i2 += 1) {
          each_blocks[_i2].m(target, anchor);
        }

        insert(target, each_1_anchor, anchor);
      },
      p: function p(ctx, dirty) {
        if (dirty[0] &
        /*displayItems, handleItemKeydown, selection, handleBlur, handleItemClick, handleItemKeyup*/
        470288896 | dirty[2] &
        /*index*/
        524288) {
          each_value =
          /*displayItems*/
          ctx[9];

          var _i3;

          for (_i3 = 0; _i3 < each_value.length; _i3 += 1) {
            var child_ctx = get_each_context(ctx, each_value, _i3);

            if (each_blocks[_i3]) {
              each_blocks[_i3].p(child_ctx, dirty);
            } else {
              each_blocks[_i3] = create_each_block(child_ctx);

              each_blocks[_i3].c();

              each_blocks[_i3].m(each_1_anchor.parentNode, each_1_anchor);
            }
          }

          for (; _i3 < each_blocks.length; _i3 += 1) {
            each_blocks[_i3].d(1);
          }

          each_blocks.length = each_value.length;
        }
      },
      d: function d(detaching) {
        destroy_each(each_blocks, detaching);
        if (detaching) detach(each_1_anchor);
      }
    };
  } // (974:32) 


  function create_if_block_3(ctx) {
    var div;

    function select_block_type_1(ctx, dirty) {
      if (
      /*tooShort*/
      ctx[13]) return create_if_block_4;
      return create_else_block;
    }

    var current_block_type = select_block_type_1(ctx);
    var if_block = current_block_type(ctx);
    return {
      c: function c() {
        div = element("div");
        if_block.c();
        attr(div, "tabindex", "-1");
        attr(div, "class", "dropdown-item text-muted");
      },
      m: function m(target, anchor) {
        insert(target, div, anchor);
        if_block.m(div, null);
      },
      p: function p(ctx, dirty) {
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
      d: function d(detaching) {
        if (detaching) detach(div);
        if_block.d();
      }
    };
  } // (970:43) 


  function create_if_block_2(ctx) {
    var div;
    return {
      c: function c() {
        div = element("div");
        div.textContent = "".concat(translate("fetching"));
        attr(div, "tabindex", "-1");
        attr(div, "class", "dropdown-item text-muted");
      },
      m: function m(target, anchor) {
        insert(target, div, anchor);
      },
      p: noop,
      d: function d(detaching) {
        if (detaching) detach(div);
      }
    };
  } // (966:4) {#if fetchError}


  function create_if_block_1(ctx) {
    var div;
    var t;
    return {
      c: function c() {
        div = element("div");
        t = text(
        /*fetchError*/
        ctx[15]);
        attr(div, "tabindex", "-1");
        attr(div, "class", "dropdown-item text-danger");
      },
      m: function m(target, anchor) {
        insert(target, div, anchor);
        append(div, t);
      },
      p: function p(ctx, dirty) {
        if (dirty[0] &
        /*fetchError*/
        32768) set_data(t,
        /*fetchError*/
        ctx[15]);
      },
      d: function d(detaching) {
        if (detaching) detach(div);
      }
    };
  } // (1002:4) {:else}


  function create_else_block_2(ctx) {
    var div1;
    var div0;
    var t0_value = (
    /*item*/
    ctx[77].id ?
    /*item*/
    ctx[77].display_text ||
    /*item*/
    ctx[77].text : translate("clear")) + "";
    var t0;
    var t1;
    var t2;
    var div1_class_value;
    var div1_data_id_value;
    var dispose;
    var if_block =
    /*item*/
    ctx[77].desc && create_if_block_8(ctx);
    return {
      c: function c() {
        div1 = element("div");
        div0 = element("div");
        t0 = text(t0_value);
        t1 = space();
        if (if_block) if_block.c();
        t2 = space();
        attr(div0, "class", "ki-no-click svelte-1y1l0qo");
        attr(div1, "tabindex", "1");
        attr(div1, "class", div1_class_value = "ki-js-item dropdown-item ki-select-item " + (!
        /*item*/
        ctx[77].id ? "text-muted" : "") + " " + (
        /*selection*/
        ctx[11][
        /*item*/
        ctx[77].id] ? "alert-primary" : "") + " svelte-1y1l0qo");
        attr(div1, "data-id", div1_data_id_value =
        /*item*/
        ctx[77].id);
        dispose = [listen(div1, "blur",
        /*handleBlur*/
        ctx[19]), listen(div1, "click",
        /*handleItemClick*/
        ctx[28]), listen(div1, "keydown",
        /*handleItemKeydown*/
        ctx[26]), listen(div1, "keyup",
        /*handleItemKeyup*/
        ctx[27])];
      },
      m: function m(target, anchor) {
        insert(target, div1, anchor);
        append(div1, div0);
        append(div0, t0);
        append(div1, t1);
        if (if_block) if_block.m(div1, null);
        append(div1, t2);
      },
      p: function p(ctx, dirty) {
        if (dirty[0] &
        /*displayItems*/
        512 && t0_value !== (t0_value = (
        /*item*/
        ctx[77].id ?
        /*item*/
        ctx[77].display_text ||
        /*item*/
        ctx[77].text : translate("clear")) + "")) set_data(t0, t0_value);

        if (
        /*item*/
        ctx[77].desc) {
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

        if (dirty[0] &
        /*displayItems, selection*/
        2560 && div1_class_value !== (div1_class_value = "ki-js-item dropdown-item ki-select-item " + (!
        /*item*/
        ctx[77].id ? "text-muted" : "") + " " + (
        /*selection*/
        ctx[11][
        /*item*/
        ctx[77].id] ? "alert-primary" : "") + " svelte-1y1l0qo")) {
          attr(div1, "class", div1_class_value);
        }

        if (dirty[0] &
        /*displayItems*/
        512 && div1_data_id_value !== (div1_data_id_value =
        /*item*/
        ctx[77].id)) {
          attr(div1, "data-id", div1_data_id_value);
        }
      },
      d: function d(detaching) {
        if (detaching) detach(div1);
        if (if_block) if_block.d();
        run_all(dispose);
      }
    };
  } // (990:48) 


  function create_if_block_6(ctx) {
    var div1;
    var div0;
    var t0_value = (
    /*item*/
    ctx[77].display_text ||
    /*item*/
    ctx[77].text) + "";
    var t0;
    var t1;
    var t2;
    var dispose;
    var if_block =
    /*item*/
    ctx[77].desc && create_if_block_7(ctx);
    return {
      c: function c() {
        div1 = element("div");
        div0 = element("div");
        t0 = text(t0_value);
        t1 = space();
        if (if_block) if_block.c();
        t2 = space();
        attr(div0, "class", "ki-no-click svelte-1y1l0qo");
        attr(div1, "tabindex", "-1");
        attr(div1, "class", "dropdown-item text-muted ki-js-blank");
        dispose = listen(div1, "keydown",
        /*handleItemKeydown*/
        ctx[26]);
      },
      m: function m(target, anchor) {
        insert(target, div1, anchor);
        append(div1, div0);
        append(div0, t0);
        append(div1, t1);
        if (if_block) if_block.m(div1, null);
        append(div1, t2);
      },
      p: function p(ctx, dirty) {
        if (dirty[0] &
        /*displayItems*/
        512 && t0_value !== (t0_value = (
        /*item*/
        ctx[77].display_text ||
        /*item*/
        ctx[77].text) + "")) set_data(t0, t0_value);

        if (
        /*item*/
        ctx[77].desc) {
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
      d: function d(detaching) {
        if (detaching) detach(div1);
        if (if_block) if_block.d();
        dispose();
      }
    };
  } // (984:4) {#if item.separator}


  function create_if_block_5(ctx) {
    var div;
    var dispose;
    return {
      c: function c() {
        div = element("div");
        attr(div, "tabindex", "-1");
        attr(div, "class", "dropdown-divider ki-js-blank");
        attr(div, "data-index", index);
        dispose = listen(div, "keydown",
        /*handleItemKeydown*/
        ctx[26]);
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
  } // (1014:6) {#if item.desc}


  function create_if_block_8(ctx) {
    var div;
    var t_value =
    /*item*/
    ctx[77].desc + "";
    var t;
    return {
      c: function c() {
        div = element("div");
        t = text(t_value);
        attr(div, "class", "ki-no-click text-muted svelte-1y1l0qo");
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
        ctx[77].desc + "")) set_data(t, t_value);
      },
      d: function d(detaching) {
        if (detaching) detach(div);
      }
    };
  } // (996:6) {#if item.desc}


  function create_if_block_7(ctx) {
    var div;
    var t_value =
    /*item*/
    ctx[77].desc + "";
    var t;
    return {
      c: function c() {
        div = element("div");
        t = text(t_value);
        attr(div, "class", "ki-no-click text-muted svelte-1y1l0qo");
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
        ctx[77].desc + "")) set_data(t, t_value);
      },
      d: function d(detaching) {
        if (detaching) detach(div);
      }
    };
  } // (983:4) {#each displayItems as item}


  function create_each_block(ctx) {
    var if_block_anchor;

    function select_block_type_2(ctx, dirty) {
      if (
      /*item*/
      ctx[77].separator) return create_if_block_5;
      if (
      /*item*/
      ctx[77].disabled ||
      /*item*/
      ctx[77].placeholder) return create_if_block_6;
      return create_else_block_2;
    }

    var current_block_type = select_block_type_2(ctx);
    var if_block = current_block_type(ctx);
    return {
      c: function c() {
        if_block.c();
        if_block_anchor = empty();
      },
      m: function m(target, anchor) {
        if_block.m(target, anchor);
        insert(target, if_block_anchor, anchor);
      },
      p: function p(ctx, dirty) {
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
        if_block.d(detaching);
        if (detaching) detach(if_block_anchor);
      }
    };
  } // (978:6) {:else}


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
  } // (976:6) {#if tooShort }


  function create_if_block_4(ctx) {
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
  } // (1024:4) {#if hasMore}


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

        ctx[74](div);
      },
      p: noop,
      d: function d(detaching) {
        if (detaching) detach(div);
        /*div_binding*/

        ctx[74](null);
      }
    };
  }

  function create_fragment(ctx) {
    var div4;
    var div2;
    var t0;
    var div0;
    var span;
    var div0_class_value;
    var t1;
    var div1;
    var button;
    var t2;
    var div3;
    var t3;
    var div3_class_value;
    var div4_class_value;
    var dispose;
    var if_block0 =
    /*typeahead*/
    ctx[1] && create_if_block_9(ctx);
    var each_value_1 = Object.values(
    /*selection*/
    ctx[11]);
    var each_blocks = [];

    for (var i = 0; i < each_value_1.length; i += 1) {
      each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    }

    function select_block_type(ctx, dirty) {
      if (
      /*fetchError*/
      ctx[15]) return create_if_block_1;
      if (
      /*activeFetch*/
      ctx[18] && !
      /*fetchingMore*/
      ctx[14]) return create_if_block_2;
      if (
      /*actualCount*/
      ctx[10] === 0) return create_if_block_3;
      return create_else_block_1;
    }

    var current_block_type = select_block_type(ctx);
    var if_block1 = current_block_type(ctx);
    var if_block2 =
    /*hasMore*/
    ctx[12] && create_if_block(ctx);
    return {
      c: function c() {
        div4 = element("div");
        div2 = element("div");
        if (if_block0) if_block0.c();
        t0 = space();
        div0 = element("div");
        span = element("span");

        for (var _i4 = 0; _i4 < each_blocks.length; _i4 += 1) {
          each_blocks[_i4].c();
        }

        t1 = space();
        div1 = element("div");
        button = element("button");
        button.innerHTML = "<i class=\"text-dark fas fa-caret-down\"></i>";
        t2 = space();
        div3 = element("div");
        if_block1.c();
        t3 = space();
        if (if_block2) if_block2.c();
        attr(span, "class", "ki-no-click ki-select-selection svelte-1y1l0qo");
        attr(div0, "class", div0_class_value = "form-control " + (
        /*inputVisible*/
        ctx[16] ? "d-none" : ""));
        attr(div0, "tabindex", "0");
        attr(button, "class", "btn btn-outline-secondary");
        attr(button, "type", "button");
        attr(button, "tabindex", "0");
        attr(div1, "class", "input-group-append");
        attr(div2, "class", "input-group");
        attr(div3, "class", div3_class_value = "dropdown-menu ki-select-popup " + (
        /*popupVisible*/
        ctx[17] ? "show" : "") + " svelte-1y1l0qo");
        attr(div4, "class", div4_class_value = "ki-select-container " +
        /*extraClass*/
        ctx[0] + " svelte-1y1l0qo");
        dispose = [listen(div0, "click",
        /*handleToggleClick*/
        ctx[25]), listen(button, "blur",
        /*handleBlur*/
        ctx[19]), listen(button, "keydown",
        /*handleToggleKeydown*/
        ctx[24]), listen(button, "click",
        /*handleToggleClick*/
        ctx[25]), listen(div3, "scroll",
        /*handlePopupScroll*/
        ctx[29])];
      },
      m: function m(target, anchor) {
        insert(target, div4, anchor);
        append(div4, div2);
        if (if_block0) if_block0.m(div2, null);
        append(div2, t0);
        append(div2, div0);
        append(div0, span);

        for (var _i5 = 0; _i5 < each_blocks.length; _i5 += 1) {
          each_blocks[_i5].m(span, null);
        }
        /*div0_binding*/


        ctx[72](div0);
        append(div2, t1);
        append(div2, div1);
        append(div1, button);
        /*button_binding*/

        ctx[73](button);
        append(div4, t2);
        append(div4, div3);
        if_block1.m(div3, null);
        append(div3, t3);
        if (if_block2) if_block2.m(div3, null);
        /*div3_binding*/

        ctx[75](div3);
        /*div4_binding*/

        ctx[76](div4);
      },
      p: function p(ctx, dirty) {
        if (
        /*typeahead*/
        ctx[1]) {
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

        if (dirty[0] &
        /*selection*/
        2048) {
          each_value_1 = Object.values(
          /*selection*/
          ctx[11]);

          var _i6;

          for (_i6 = 0; _i6 < each_value_1.length; _i6 += 1) {
            var child_ctx = get_each_context_1(ctx, each_value_1, _i6);

            if (each_blocks[_i6]) {
              each_blocks[_i6].p(child_ctx, dirty);
            } else {
              each_blocks[_i6] = create_each_block_1(child_ctx);

              each_blocks[_i6].c();

              each_blocks[_i6].m(span, null);
            }
          }

          for (; _i6 < each_blocks.length; _i6 += 1) {
            each_blocks[_i6].d(1);
          }

          each_blocks.length = each_value_1.length;
        }

        if (dirty[0] &
        /*inputVisible*/
        65536 && div0_class_value !== (div0_class_value = "form-control " + (
        /*inputVisible*/
        ctx[16] ? "d-none" : ""))) {
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

        if (
        /*hasMore*/
        ctx[12]) {
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

        if (dirty[0] &
        /*popupVisible*/
        131072 && div3_class_value !== (div3_class_value = "dropdown-menu ki-select-popup " + (
        /*popupVisible*/
        ctx[17] ? "show" : "") + " svelte-1y1l0qo")) {
          attr(div3, "class", div3_class_value);
        }

        if (dirty[0] &
        /*extraClass*/
        1 && div4_class_value !== (div4_class_value = "ki-select-container " +
        /*extraClass*/
        ctx[0] + " svelte-1y1l0qo")) {
          attr(div4, "class", div4_class_value);
        }
      },
      i: noop,
      o: noop,
      d: function d(detaching) {
        if (detaching) detach(div4);
        if (if_block0) if_block0.d();
        destroy_each(each_blocks, detaching);
        /*div0_binding*/

        ctx[72](null);
        /*button_binding*/

        ctx[73](null);
        if_block1.d();
        if (if_block2) if_block2.d();
        /*div3_binding*/

        ctx[75](null);
        /*div4_binding*/

        ctx[76](null);
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

  function isCharacterKey(event) {
    return event.key.length == 1;
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
    var items = [];
    var offsetCount = 0;
    var actualCount = 0;
    var selection = {};
    var selectedItems = [];
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
          var el = options[i];
          var ds = el.dataset;
          var item = {
            id: el.value || "",
            text: el.text || "",
            desc: ds.selectDesc || ""
          };
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
        $$invalidate(12, hasMore = false);
        fetched = false;
      }

      $$invalidate(14, fetchingMore = more);
      $$invalidate(15, fetchError = null);
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
          $$invalidate(12, hasMore = info.more && offsetCount > 0 && !fetchId);
          $$invalidate(13, tooShort = info.too_short === true);

          if (fetchId) {
            previousQuery = null;
          } else {
            previousQuery = currentQuery;
          }

          previousFetch = currentFetch;
          $$invalidate(18, activeFetch = null);
          fetched = true;
          $$invalidate(14, fetchingMore = false);
        }
      })["catch"](function (err) {
        if (currentFetch === activeFetch) {
          console.error(err);
          $$invalidate(15, fetchError = err);
          items = [];
          $$invalidate(9, displayItems = fixedItems);
          offsetCount = 0;
          $$invalidate(10, actualCount = 0);
          $$invalidate(12, hasMore = false);
          $$invalidate(13, tooShort = false);
          previousQuery = null;
          previousFetch = currentFetch;
          $$invalidate(18, activeFetch = null);
          fetched = false;
          $$invalidate(14, fetchingMore = false);
          toggle.focus();
          openPopup();
        }
      });
      $$invalidate(18, activeFetch = currentFetch);
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

    function cancelFetch() {
      if (activeFetch !== null) {
        $$invalidate(18, activeFetch = null);
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

    var _focusingInput = null;

    function openInput(focusInput) {
      if (!typeahead) {
        return;
      }

      var wasVisible = inputVisible;
      $$invalidate(16, inputVisible = true);

      if (!focusInput) {
        return;
      }

      if (wasVisible) {
        input.focus();
      } else {
        if (!_focusingInput) {
          _focusingInput = function focusingInput() {
            if (_focusingInput) {
              _focusingInput = null;
              input.focus();
            }
          };

          setTimeout(_focusingInput);
        }
      }
    }

    function closeInput(focusToggle) {
      if (!typeahead) {
        return;
      }

      _focusingInput = null;
      $$invalidate(16, inputVisible = false);

      if (focusToggle) {
        toggle.focus();
      }
    }

    function openPopup() {
      if (!popupVisible) {
        $$invalidate(17, popupVisible = true);
        var w = container.offsetWidth;
        $$invalidate(7, popup.style.minWidth = w + "px", popup);
      }
    }

    function closePopup(focusToggle) {
      $$invalidate(17, popupVisible = false);

      if (focusToggle) {
        toggle.focus();
      }
    }

    function selectItemImpl(id) {
      id = id.toString();

      var item = displayItems.find(function (item) {
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

      syncToReal(selection);
      real.dispatchEvent(new CustomEvent("select-select", {
        detail: selection
      }));
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
      return el === input || el === toggle || el === selectionDisplay || popup.contains(el);
    }

    function syncFromReal() {
      if (isSyncToReal) {
        return;
      }

      var newSelection = {};
      var options = real.selectedOptions;

      for (var i = options.length - 1; i >= 0; i--) {
        var el = options[i];
        var ds = el.dataset;
        var item = {
          id: el.value,
          text: el.text
        };

        if (ds.desc) {
          item.desc = ds.selectDesc;
        }

        newSelection[item.id] = item;
      }

      $$invalidate(11, selection = newSelection);
    }

    function syncToReal(selection) {
      var changed = false;

      if (remote) {
        Object.values(selection).forEach(function (item) {
          var el = real.querySelector("option[value=\"" + item.id.trim() + "\"]");

          if (!el) {
            var _el = document.createElement("option");

            _el.setAttribute("value", item.id);

            if (item.desc) {
              _el.setAttribute("data-select-desc", item.desc);
            }

            _el.textContent = item.text;
            real.appendChild(_el);
          }
        });
      }

      var options = real.options;

      for (var i = options.length - 1; i >= 0; i--) {
        var el = options[i];
        var curr = !!selection[el.value];

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
          item.desc = ds.selectDesc;
        }

        collectedItems.push(item);
      });
      fixedItems = collectedItems;
    }

    onMount(function () {
      real.classList.add("d-none");
      multiple = real.multiple;

      if (remote) {
        setupRemote();
      } else {
        $$invalidate(30, fetcher = inlineFetcher);
      }

      syncFromReal();
      real.addEventListener("change", function () {
        if (!isSyncToReal) {
          syncFromReal();
          console.log("FROM_REAL", selection);
        }
      });
      $$invalidate(36, mounted = true);
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
        closeInput(false);
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
        if (isCharacterKey(event)) {
          openInput(true);
          event.preventDefault();
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
    var itemKeydownHandlers = {
      base: function base(event) {
        if (isCharacterKey(event)) {
          openInput(true);
          event.preventDefault();
        }
      },
      ArrowDown: function ArrowDown(event) {
        var next = event.target.nextElementSibling;

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
      ArrowUp: function ArrowUp(event) {
        var next = event.target.previousElementSibling;

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
      Enter: function Enter(event) {
        selectElement(event.target);
        event.preventDefault();
      },
      Escape: function Escape(event) {
        cancelFetch();
        clearQuery();
        closePopup(true);
        closeInput(false);
      },
      PageUp: nop,
      PageDown: nop,
      Home: nop,
      End: nop,
      Tab: function Tab(event) {
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

    function div_binding($$value) {
      binding_callbacks[$$value ? "unshift" : "push"](function () {
        $$invalidate(8, more = $$value);
      });
    }

    function div3_binding($$value) {
      binding_callbacks[$$value ? "unshift" : "push"](function () {
        $$invalidate(7, popup = $$value);
      });
    }

    function div4_binding($$value) {
      binding_callbacks[$$value ? "unshift" : "push"](function () {
        $$invalidate(3, container = $$value);
      });
    }

    $$self.$set = function ($$props) {
      if ("real" in $$props) $$invalidate(31, real = $$props.real);
      if ("fetcher" in $$props) $$invalidate(30, fetcher = $$props.fetcher);
      if ("remote" in $$props) $$invalidate(32, remote = $$props.remote);
      if ("queryMinLen" in $$props) $$invalidate(33, queryMinLen = $$props.queryMinLen);
      if ("delay" in $$props) $$invalidate(34, delay = $$props.delay);
      if ("extraClass" in $$props) $$invalidate(0, extraClass = $$props.extraClass);
      if ("typeahead" in $$props) $$invalidate(1, typeahead = $$props.typeahead);
    };

    $$self.$$.update = function () {
      if ($$self.$$.dirty[0] &
      /*selection*/
      2048 | $$self.$$.dirty[1] &
      /*mounted*/
      32) {
         {
          if (mounted) {
            syncToReal(selection);
          }
        }
      }
    };

    return [extraClass, typeahead, query, container, input, selectionDisplay, toggle, popup, more, displayItems, actualCount, selection, hasMore, tooShort, fetchingMore, fetchError, inputVisible, popupVisible, activeFetch, handleBlur, handleInputBlur, handleInputKeypress, handleInputKeydown, handleInputKeyup, handleToggleKeydown, handleToggleClick, handleItemKeydown, handleItemKeyup, handleItemClick, handlePopupScroll, fetcher, real, remote, queryMinLen, delay, selectItem, mounted, fixedItems, items, offsetCount, fetched, previousFetch, previousQuery, multiple, wasDown, isSyncToReal, _focusingInput, selectedItems, inlineFetcher, fetchItems, resolveItems, cancelFetch, fetchMoreIfneeded, clearQuery, openInput, closeInput, openPopup, closePopup, selectItemImpl, selectElement, containsElement, syncFromReal, syncToReal, setupRemote, inputKeypressHandlers, inputKeydownHandlers, inputKeyupHandlers, toggleKeydownHandlers, itemKeydownHandlers, itemKeyupHandlers, input_1_input_handler, input_1_binding, div0_binding, button_binding, div_binding, div3_binding, div4_binding];
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
        real: 31,
        fetcher: 30,
        remote: 32,
        queryMinLen: 33,
        delay: 34,
        extraClass: 0,
        typeahead: 1,
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
