var Select = (function () {
  'use strict';

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _typeof2(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof2 = function _typeof2(obj) { return typeof obj; }; } else { _typeof2 = function _typeof2(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof2(obj); }

  function _typeof(obj) {
    if (typeof Symbol === "function" && _typeof2(Symbol.iterator) === "symbol") {
      _typeof = function _typeof(obj) {
        return _typeof2(obj);
      };
    } else {
      _typeof = function _typeof(obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : _typeof2(obj);
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
      $$.update($$.dirty);
      run_all($$.before_update);
      $$.fragment && $$.fragment.p($$.dirty, $$.ctx);
      $$.dirty = null;
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
      $$.ctx = {};
    }
  }

  function make_dirty(component, key) {
    if (!component.$$.dirty) {
      dirty_components.push(component);
      schedule_update();
      component.$$.dirty = blank_object();
    }

    component.$$.dirty[key] = true;
  }

  function init(component, options, instance, create_fragment, not_equal, props) {
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
      dirty: null
    };
    var ready = false;
    $$.ctx = instance ? instance(component, prop_values, function (key, ret) {
      var value = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : ret;

      if ($$.ctx && not_equal($$.ctx[key], $$.ctx[key] = value)) {
        if ($$.bound[key]) $$.bound[key](value);
        if (ready) make_dirty(component, key);
      }

      return ret;
    }) : prop_values;
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
    var child_ctx = Object.create(ctx);
    child_ctx.item = list[i];
    child_ctx.index = i;
    return child_ctx;
  } // (679:4) {:else}


  function create_else_block_1(ctx) {
    var each_1_anchor;
    var each_value = ctx.entries;
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
      p: function p(changed, ctx) {
        if (changed.entries || changed.handleItemKeydown || changed.handleBlur || changed.handleItemClick || changed.handleItemKeyup) {
          each_value = ctx.entries;

          var _i3;

          for (_i3 = 0; _i3 < each_value.length; _i3 += 1) {
            var child_ctx = get_each_context(ctx, each_value, _i3);

            if (each_blocks[_i3]) {
              each_blocks[_i3].p(changed, child_ctx);
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
  } // (671:33) 


  function create_if_block_3(ctx) {
    var div;

    function select_block_type_1(changed, ctx) {
      if (ctx.tooShort) return create_if_block_4;
      return create_else_block;
    }

    var current_block_type = select_block_type_1(null, ctx);
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
      p: function p(changed, ctx) {
        if (current_block_type === (current_block_type = select_block_type_1(changed, ctx)) && if_block) {
          if_block.p(changed, ctx);
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
  } // (667:43) 


  function create_if_block_2(ctx) {
    var div;
    return {
      c: function c() {
        div = element("div");
        div.textContent = "".concat(ctx.translate("fetching"));
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
  } // (663:4) {#if fetchError}


  function create_if_block_1(ctx) {
    var div;
    var t;
    return {
      c: function c() {
        div = element("div");
        t = text(ctx.fetchError);
        attr(div, "tabindex", "-1");
        attr(div, "class", "dropdown-item text-danger");
      },
      m: function m(target, anchor) {
        insert(target, div, anchor);
        append(div, t);
      },
      p: function p(changed, ctx) {
        if (changed.fetchError) set_data(t, ctx.fetchError);
      },
      d: function d(detaching) {
        if (detaching) detach(div);
      }
    };
  } // (699:8) {:else}


  function create_else_block_2(ctx) {
    var div1;
    var div0;
    var t0_value = (ctx.item.display_text || ctx.item.text) + "";
    var t0;
    var t1;
    var t2;
    var div1_data_index_value;
    var dispose;
    var if_block = ctx.item.desc && create_if_block_8(ctx);
    return {
      c: function c() {
        div1 = element("div");
        div0 = element("div");
        t0 = text(t0_value);
        t1 = space();
        if (if_block) if_block.c();
        t2 = space();
        attr(div0, "class", "ki-no-click svelte-c8skuc");
        attr(div1, "tabindex", "1");
        attr(div1, "class", "ki-js-item dropdown-item");
        attr(div1, "data-index", div1_data_index_value = ctx.index);
        dispose = [listen(div1, "blur", ctx.handleBlur), listen(div1, "click", ctx.handleItemClick), listen(div1, "keydown", ctx.handleItemKeydown), listen(div1, "keyup", ctx.handleItemKeyup)];
      },
      m: function m(target, anchor) {
        insert(target, div1, anchor);
        append(div1, div0);
        append(div0, t0);
        append(div1, t1);
        if (if_block) if_block.m(div1, null);
        append(div1, t2);
      },
      p: function p(changed, ctx) {
        if (changed.entries && t0_value !== (t0_value = (ctx.item.display_text || ctx.item.text) + "")) set_data(t0, t0_value);

        if (ctx.item.desc) {
          if (if_block) {
            if_block.p(changed, ctx);
          } else {
            if_block = create_if_block_8(ctx);
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
        run_all(dispose);
      }
    };
  } // (687:52) 


  function create_if_block_6(ctx) {
    var div1;
    var div0;
    var t0_value = (ctx.item.display_text || ctx.item.text) + "";
    var t0;
    var t1;
    var t2;
    var dispose;
    var if_block = ctx.item.desc && create_if_block_7(ctx);
    return {
      c: function c() {
        div1 = element("div");
        div0 = element("div");
        t0 = text(t0_value);
        t1 = space();
        if (if_block) if_block.c();
        t2 = space();
        attr(div0, "class", "ki-no-click svelte-c8skuc");
        attr(div1, "tabindex", "-1");
        attr(div1, "class", "dropdown-item text-muted ki-js-blank");
        dispose = listen(div1, "keydown", ctx.handleItemKeydown);
      },
      m: function m(target, anchor) {
        insert(target, div1, anchor);
        append(div1, div0);
        append(div0, t0);
        append(div1, t1);
        if (if_block) if_block.m(div1, null);
        append(div1, t2);
      },
      p: function p(changed, ctx) {
        if (changed.entries && t0_value !== (t0_value = (ctx.item.display_text || ctx.item.text) + "")) set_data(t0, t0_value);

        if (ctx.item.desc) {
          if (if_block) {
            if_block.p(changed, ctx);
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
  } // (681:8) {#if item.separator}


  function create_if_block_5(ctx) {
    var div;
    var div_data_index_value;
    var dispose;
    return {
      c: function c() {
        div = element("div");
        attr(div, "tabindex", "-1");
        attr(div, "class", "dropdown-divider ki-js-blank");
        attr(div, "data-index", div_data_index_value = ctx.index);
        dispose = listen(div, "keydown", ctx.handleItemKeydown);
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
  } // (709:12) {#if item.desc}


  function create_if_block_8(ctx) {
    var div;
    var t_value = ctx.item.desc + "";
    var t;
    return {
      c: function c() {
        div = element("div");
        t = text(t_value);
        attr(div, "class", "ki-no-click text-muted svelte-c8skuc");
      },
      m: function m(target, anchor) {
        insert(target, div, anchor);
        append(div, t);
      },
      p: function p(changed, ctx) {
        if (changed.entries && t_value !== (t_value = ctx.item.desc + "")) set_data(t, t_value);
      },
      d: function d(detaching) {
        if (detaching) detach(div);
      }
    };
  } // (693:12) {#if item.desc}


  function create_if_block_7(ctx) {
    var div;
    var t_value = ctx.item.desc + "";
    var t;
    return {
      c: function c() {
        div = element("div");
        t = text(t_value);
        attr(div, "class", "ki-no-click text-muted svelte-c8skuc");
      },
      m: function m(target, anchor) {
        insert(target, div, anchor);
        append(div, t);
      },
      p: function p(changed, ctx) {
        if (changed.entries && t_value !== (t_value = ctx.item.desc + "")) set_data(t, t_value);
      },
      d: function d(detaching) {
        if (detaching) detach(div);
      }
    };
  } // (680:6) {#each entries as item, index}


  function create_each_block(ctx) {
    var if_block_anchor;

    function select_block_type_2(changed, ctx) {
      if (ctx.item.separator) return create_if_block_5;
      if (ctx.item.disabled || ctx.item.placeholder) return create_if_block_6;
      return create_else_block_2;
    }

    var current_block_type = select_block_type_2(null, ctx);
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
      p: function p(changed, ctx) {
        if (current_block_type === (current_block_type = select_block_type_2(changed, ctx)) && if_block) {
          if_block.p(changed, ctx);
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
  } // (675:8) {:else}


  function create_else_block(ctx) {
    var t_value = ctx.translate("no_results") + "";
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
  } // (673:8) {#if tooShort }


  function create_if_block_4(ctx) {
    var t_value = ctx.translate("too_short") + "";
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
  } // (719:4) {#if hasMore}


  function create_if_block(ctx) {
    var div;
    return {
      c: function c() {
        div = element("div");
        div.textContent = "".concat(ctx.translate("has_more"));
        attr(div, "tabindex", "-1");
        attr(div, "class", "dropdown-item text-muted");
      },
      m: function m(target, anchor) {
        insert(target, div, anchor);
        ctx.div_binding(div);
      },
      p: noop,
      d: function d(detaching) {
        if (detaching) detach(div);
        ctx.div_binding(null);
      }
    };
  }

  function create_fragment(ctx) {
    var div2;
    var input_1;
    var input_1_class_value;
    var input_1_data_target_value;
    var input_1_placeholder_value;
    var t0;
    var div0;
    var button;
    var t1;
    var div1;
    var t2;
    var div1_class_value;
    var dispose;

    function select_block_type(changed, ctx) {
      if (ctx.fetchError) return create_if_block_1;
      if (ctx.activeFetch && !ctx.fetchingMore) return create_if_block_2;
      if (ctx.displayCount === 0) return create_if_block_3;
      return create_else_block_1;
    }

    var current_block_type = select_block_type(null, ctx);
    var if_block0 = current_block_type(ctx);
    var if_block1 = ctx.hasMore && create_if_block(ctx);
    return {
      c: function c() {
        div2 = element("div");
        input_1 = element("input");
        t0 = space();
        div0 = element("div");
        button = element("button");
        button.innerHTML = "<i class=\"text-dark fas fa-caret-down\"></i>";
        t1 = space();
        div1 = element("div");
        if_block0.c();
        t2 = space();
        if (if_block1) if_block1.c();
        attr(input_1, "class", input_1_class_value = "" + (ctx.real.getAttribute("class") + " " + ctx.extraClass + " svelte-c8skuc"));
        attr(input_1, "autocomplete", "new-password");
        attr(input_1, "autocorrect", "off");
        attr(input_1, "autocapitalize", "off");
        attr(input_1, "spellcheck", "off");
        attr(input_1, "data-target", input_1_data_target_value = ctx.real.id);
        attr(input_1, "placeholder", input_1_placeholder_value = ctx.real.placeholder);
        attr(button, "class", "btn btn-outline-secondary");
        attr(button, "type", "button");
        attr(button, "tabindex", "-1");
        attr(div0, "class", "input-group-append");
        attr(div1, "class", div1_class_value = "dropdown-menu ki-select-popup " + (ctx.popupVisible ? "show" : "") + " svelte-c8skuc");
        attr(div2, "class", "input-group ki-select svelte-c8skuc");
        dispose = [listen(input_1, "input", ctx.input_1_input_handler), listen(input_1, "blur", ctx.handleBlur), listen(input_1, "keypress", ctx.handleInputKeypress), listen(input_1, "keydown", ctx.handleInputKeydown), listen(input_1, "keyup", ctx.handleInputKeyup), listen(button, "blur", ctx.handleBlur), listen(button, "keydown", ctx.handleToggleKeydown), listen(button, "click", ctx.handleToggleClick), listen(div1, "scroll", ctx.handlePopupScroll)];
      },
      m: function m(target, anchor) {
        insert(target, div2, anchor);
        append(div2, input_1);
        set_input_value(input_1, ctx.query);
        ctx.input_1_binding(input_1);
        append(div2, t0);
        append(div2, div0);
        append(div0, button);
        ctx.button_binding(button);
        append(div2, t1);
        append(div2, div1);
        if_block0.m(div1, null);
        append(div1, t2);
        if (if_block1) if_block1.m(div1, null);
        ctx.div1_binding(div1);
      },
      p: function p(changed, ctx) {
        if ((changed.real || changed.extraClass) && input_1_class_value !== (input_1_class_value = "" + (ctx.real.getAttribute("class") + " " + ctx.extraClass + " svelte-c8skuc"))) {
          attr(input_1, "class", input_1_class_value);
        }

        if (changed.real && input_1_data_target_value !== (input_1_data_target_value = ctx.real.id)) {
          attr(input_1, "data-target", input_1_data_target_value);
        }

        if (changed.real && input_1_placeholder_value !== (input_1_placeholder_value = ctx.real.placeholder)) {
          attr(input_1, "placeholder", input_1_placeholder_value);
        }

        if (changed.query && input_1.value !== ctx.query) {
          set_input_value(input_1, ctx.query);
        }

        if (current_block_type === (current_block_type = select_block_type(changed, ctx)) && if_block0) {
          if_block0.p(changed, ctx);
        } else {
          if_block0.d(1);
          if_block0 = current_block_type(ctx);

          if (if_block0) {
            if_block0.c();
            if_block0.m(div1, t2);
          }
        }

        if (ctx.hasMore) {
          if (if_block1) {
            if_block1.p(changed, ctx);
          } else {
            if_block1 = create_if_block(ctx);
            if_block1.c();
            if_block1.m(div1, null);
          }
        } else if (if_block1) {
          if_block1.d(1);
          if_block1 = null;
        }

        if (changed.popupVisible && div1_class_value !== (div1_class_value = "dropdown-menu ki-select-popup " + (ctx.popupVisible ? "show" : "") + " svelte-c8skuc")) {
          attr(div1, "class", div1_class_value);
        }
      },
      i: noop,
      o: noop,
      d: function d(detaching) {
        if (detaching) detach(div2);
        ctx.input_1_binding(null);
        ctx.button_binding(null);
        if_block0.d();
        if (if_block1) if_block1.d();
        ctx.div1_binding(null);
        run_all(dispose);
      }
    };
  }

  function nop() {}

  function hasModifier(event) {
    return event.altKey || event.ctrlKey || event.metaKey || event.shiftKey;
  }

  function handleEvent(code, handlers, event) {
    (handlers[code] || handlers.base)(event);
  }

  function instance($$self, $$props, $$invalidate) {
    var I18N_DEFAULTS = {
      fetching: "Searching..",
      no_results: "No results",
      too_short: "Too short",
      has_more: "More...",
      fetching_more: "Searching more..."
    };
    var real = $$props.real;
    var fetcher = $$props.fetcher;
    var _$$props$queryMinLen = $$props.queryMinLen,
        queryMinLen = _$$props$queryMinLen === void 0 ? 0 : _$$props$queryMinLen;
    var _$$props$translations = $$props.translations,
        translations = _$$props$translations === void 0 ? I18N_DEFAULTS : _$$props$translations;
    var query = $$props.query;
    var _$$props$delay = $$props.delay,
        delay = _$$props$delay === void 0 ? 0 : _$$props$delay;
    var _$$props$extraClass = $$props.extraClass,
        extraClass = _$$props$extraClass === void 0 ? "" : _$$props$extraClass;
    var input;
    var toggle;
    var popup;
    var more;
    var entries = [];
    var offsetCount = 0;
    var displayCount = 0;
    var hasMore = false;
    var tooShort = false;
    var fetchingMore = false;
    var fetchError = null;
    var popupVisible = false;
    var activeFetch = null;
    var previousQuery = null;
    var selectedItem = null;
    var wasDown = false;
    var isSyncToReal = false;

    function fetcherSelect(offset, query) {
      var promise = new Promise(function (resolve, reject) {
        var entries = [];
        real.querySelectorAll("option").forEach(function (el) {
          var ds = el.dataset;
          var item = {
            id: el.value,
            text: el.text,
            desc: ds.desc
          };
          entries.push(item);
        });
        var response = {
          entries: entries,
          info: {
            more: false
          }
        };
        resolve(response);
      });
      return promise;
    }

    function fetchEntries(more) {
      var currentQuery = query.trim();

      if (currentQuery.length > 0) {
        currentQuery = query;
      }

      if (!more && !fetchingMore && currentQuery === previousQuery) {
        return;
      }

      cancelFetch();
      var fetchOffset = 0;

      if (more) {
        fetchOffset = offsetCount;
        $$invalidate("fetchingMore", fetchingMore = true);
      } else {
        $$invalidate("entries", entries = []);
        offsetCount = 0;
        $$invalidate("displayCount", displayCount = 0);
        $$invalidate("hasMore", hasMore = false);
        $$invalidate("fetchingMore", fetchingMore = false);
      }

      $$invalidate("fetchError", fetchError = null);
      var currentFetchOffset = fetchOffset;
      var currentFetchingMore = fetchingMore;
      var currentFetch = new Promise(function (resolve, reject) {
        if (currentFetchingMore) {
          resolve(fetcher(currentFetchOffset, currentQuery));
        } else {
          if (currentQuery.length < queryMinLen) {
            resolve({
              entries: [],
              info: {
                more: false,
                too_short: true
              }
            });
          } else {
            setTimeout(function () {
              if (currentFetch === activeFetch) {
                resolve(fetcher(currentFetchOffset, currentQuery));
              } else {
                reject("cancel");
              }
            }, delay);
          }
        }
      }).then(function (response) {
        if (currentFetch === activeFetch) {
          var newEntries = response.entries || [];
          var info = response.info || {};
          var updateEntries;

          if (currentFetchingMore) {
            updateEntries = entries;
            newEntries.forEach(function (item) {
              updateEntries.push(item);
            });
          } else {
            updateEntries = newEntries;
          }

          $$invalidate("entries", entries = updateEntries);
          updateCounts(entries);
          $$invalidate("hasMore", hasMore = info.more && offsetCount > 0);
          $$invalidate("tooShort", tooShort = info.too_short === true);
          previousQuery = currentQuery;
          $$invalidate("activeFetch", activeFetch = null);
          $$invalidate("fetchingMore", fetchingMore = false);
        }
      })["catch"](function (err) {
        if (currentFetch === activeFetch) {
          console.error(err);
          $$invalidate("fetchError", fetchError = err);
          $$invalidate("entries", entries = []);
          offsetCount = 0;
          $$invalidate("displayCount", displayCount = 0);
          $$invalidate("hasMore", hasMore = false);
          $$invalidate("tooShort", tooShort = false);
          previousQuery = null;
          $$invalidate("activeFetch", activeFetch = null);
          $$invalidate("fetchingMore", fetchingMore = false);
          input.focus();
          openPopup();
        }
      });
      $$invalidate("activeFetch", activeFetch = currentFetch);
    }

    function updateCounts(entries) {
      var off = 0;
      var disp = 0;
      entries.forEach(function (item) {
        if (item.separator) ; else if (item.placeholder) {
          disp += 1;
        } else {
          off += 1;
          disp += 1;
        }
      });
      offsetCount = off;
      $$invalidate("displayCount", displayCount = disp);
    }

    function cancelFetch() {
      if (activeFetch !== null) {
        $$invalidate("activeFetch", activeFetch = null);
        previousQuery = null;
      }
    }

    function fetchMoreIfneeded() {
      if (hasMore && !fetchingMore) {
        if (popup.scrollTop + popup.clientHeight >= popup.scrollHeight - more.clientHeight * 2 - 2) {
          fetchEntries(true);
        }
      }
    }

    function closePopup(focusInput) {
      $$invalidate("popupVisible", popupVisible = false);

      if (focusInput) {
        input.focus();
      }
    }

    function openPopup() {
      if (!popupVisible) {
        $$invalidate("popupVisible", popupVisible = true);
        var w = input.parentElement.offsetWidth;
        $$invalidate("popup", popup.style.minWidth = w + "px", popup);
      }
    }

    function selectItem(el) {
      var item = entries[el.dataset.index];

      if (item) {
        $$invalidate("selectedItem", selectedItem = item);
        var changed = item.text !== query;
        $$invalidate("query", query = item.text);
        previousQuery = query.trim();

        if (previousQuery.length > 0) {
          previousQuery = query;
        }

        closePopup(true);

        if (changed) {
          previousQuery = null;
        }

        syncToReal(query, selectedItem);
        real.dispatchEvent(new CustomEvent("select-select", {
          detail: item
        }));
      }
    }

    function containsElement(el) {
      return el === input || el === toggle || popup.contains(el);
    }

    function translate(key) {
      return translations[key] || I18N_DEFAULTS[key];
    }

    function syncFromReal() {
      if (isSyncToReal) {
        return;
      }

      var el = real.options[real.selectedIndex];
      var item;

      if (el) {
        var ds = el.dataset;
        item = {
          id: el.value,
          text: el.text,
          desc: ds.desc
        };
      } else {
        item = {
          id: "",
          text: ""
        };
      }

      $$invalidate("query", query = item.text || "");
      $$invalidate("selectedItem", selectedItem = item);
    }

    function syncToReal(query, selectedItem) {
      var oldOption;
      var newOption;
      var selectedValue = selectedItem.id.toString();
      real.querySelectorAll("option").forEach(function (el) {
        if (el.selected) {
          oldOption = el;
        }

        if (el.value === selectedValue) {
          newOption = el;
        }
      });

      if (newOption !== oldOption) {
        try {
          isSyncToReal = true;
          oldOption.removeAttribute("selected");
          newOption.setAttribute("selected", "true");
          real.dispatchEvent(new Event("change"));
        } finally {
          isSyncToReal = false;
        }
      }
    }

    onMount(function () {
      real.classList.add("d-none");
      $$invalidate("fetcher", fetcher = fetcherSelect);
      syncFromReal();
      real.addEventListener("change", function () {
        syncFromReal();
      });
    });
    var inputKeypressHandlers = {
      base: function base(event) {
        $$invalidate("selectedItem", selectedItem = null);
      }
    };
    var inputKeydownHandlers = {
      base: function base(event) {
        wasDown = true;
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
          fetchEntries();
        }

        event.preventDefault();
      },
      ArrowUp: function ArrowUp(event) {
        event.preventDefault();
      },
      Escape: function Escape(event) {
        cancelFetch();
        closePopup(false);
      },
      Tab: nop
    };
    var inputKeyupHandlers = {
      base: function base(event) {
        if (wasDown) {
          openPopup();
          fetchEntries();
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
        input.focus();
      },
      ArrowDown: inputKeydownHandlers.ArrowDown,
      ArrowUp: inputKeydownHandlers.ArrowDown,
      Escape: function Escape(event) {
        cancelFetch();
        closePopup(false);
        input.focus();
      },
      Tab: function Tab(event) {
        input.focus();
      }
    };
    var itemKeydownHandlers = {
      base: function base(event) {
        input.focus();
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
        selectItem(event.target);
        event.preventDefault();
      },
      Escape: function Escape(event) {
        cancelFetch();
        closePopup(true);
      },
      PageUp: nop,
      PageDown: nop,
      Home: nop,
      End: nop,
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
        closePopup(false);
        syncFromReal();
      }
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
        if (popupVisible) {
          closePopup(false);
        } else {
          openPopup();
          fetchEntries();
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
        selectItem(event.target);
      }
    }

    function handlePopupScroll(event) {
      fetchMoreIfneeded();
    }

    function input_1_input_handler() {
      query = this.value;
      $$invalidate("query", query);
    }

    function input_1_binding($$value) {
      binding_callbacks[$$value ? "unshift" : "push"](function () {
        $$invalidate("input", input = $$value);
      });
    }

    function button_binding($$value) {
      binding_callbacks[$$value ? "unshift" : "push"](function () {
        $$invalidate("toggle", toggle = $$value);
      });
    }

    function div_binding($$value) {
      binding_callbacks[$$value ? "unshift" : "push"](function () {
        $$invalidate("more", more = $$value);
      });
    }

    function div1_binding($$value) {
      binding_callbacks[$$value ? "unshift" : "push"](function () {
        $$invalidate("popup", popup = $$value);
      });
    }

    $$self.$set = function ($$props) {
      if ("real" in $$props) $$invalidate("real", real = $$props.real);
      if ("fetcher" in $$props) $$invalidate("fetcher", fetcher = $$props.fetcher);
      if ("queryMinLen" in $$props) $$invalidate("queryMinLen", queryMinLen = $$props.queryMinLen);
      if ("translations" in $$props) $$invalidate("translations", translations = $$props.translations);
      if ("query" in $$props) $$invalidate("query", query = $$props.query);
      if ("delay" in $$props) $$invalidate("delay", delay = $$props.delay);
      if ("extraClass" in $$props) $$invalidate("extraClass", extraClass = $$props.extraClass);
    };

    $$self.$$.update = function () {
      var changed = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {
        query: 1,
        selectedItem: 1
      };

      if (changed.query || changed.selectedItem) {
         {
          if (syncToReal) {
            syncToReal(query, selectedItem);
          }
        }
      }
    };

    return {
      real: real,
      fetcher: fetcher,
      queryMinLen: queryMinLen,
      translations: translations,
      query: query,
      delay: delay,
      extraClass: extraClass,
      input: input,
      toggle: toggle,
      popup: popup,
      more: more,
      entries: entries,
      displayCount: displayCount,
      hasMore: hasMore,
      tooShort: tooShort,
      fetchingMore: fetchingMore,
      fetchError: fetchError,
      popupVisible: popupVisible,
      activeFetch: activeFetch,
      translate: translate,
      handleBlur: handleBlur,
      handleInputKeypress: handleInputKeypress,
      handleInputKeydown: handleInputKeydown,
      handleInputKeyup: handleInputKeyup,
      handleToggleKeydown: handleToggleKeydown,
      handleToggleClick: handleToggleClick,
      handleItemKeydown: handleItemKeydown,
      handleItemKeyup: handleItemKeyup,
      handleItemClick: handleItemClick,
      handlePopupScroll: handlePopupScroll,
      input_1_input_handler: input_1_input_handler,
      input_1_binding: input_1_binding,
      button_binding: button_binding,
      div_binding: div_binding,
      div1_binding: div1_binding
    };
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
        fetcher: 0,
        queryMinLen: 0,
        translations: 0,
        query: 0,
        delay: 0,
        extraClass: 0
      });
      return _this;
    }

    return Select;
  }(SvelteComponent);

  return Select;

}());
