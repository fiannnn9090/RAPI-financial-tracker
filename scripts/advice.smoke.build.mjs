var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  try {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  } catch (e) {
    throw mod = 0, e;
  }
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/react/cjs/react.production.js
var require_react_production = __commonJS({
  "node_modules/react/cjs/react.production.js"(exports) {
    "use strict";
    var REACT_ELEMENT_TYPE = /* @__PURE__ */ Symbol.for("react.transitional.element");
    var REACT_PORTAL_TYPE = /* @__PURE__ */ Symbol.for("react.portal");
    var REACT_FRAGMENT_TYPE = /* @__PURE__ */ Symbol.for("react.fragment");
    var REACT_STRICT_MODE_TYPE = /* @__PURE__ */ Symbol.for("react.strict_mode");
    var REACT_PROFILER_TYPE = /* @__PURE__ */ Symbol.for("react.profiler");
    var REACT_CONSUMER_TYPE = /* @__PURE__ */ Symbol.for("react.consumer");
    var REACT_CONTEXT_TYPE = /* @__PURE__ */ Symbol.for("react.context");
    var REACT_FORWARD_REF_TYPE = /* @__PURE__ */ Symbol.for("react.forward_ref");
    var REACT_SUSPENSE_TYPE = /* @__PURE__ */ Symbol.for("react.suspense");
    var REACT_MEMO_TYPE = /* @__PURE__ */ Symbol.for("react.memo");
    var REACT_LAZY_TYPE = /* @__PURE__ */ Symbol.for("react.lazy");
    var REACT_ACTIVITY_TYPE = /* @__PURE__ */ Symbol.for("react.activity");
    var MAYBE_ITERATOR_SYMBOL = Symbol.iterator;
    function getIteratorFn(maybeIterable) {
      if (null === maybeIterable || "object" !== typeof maybeIterable) return null;
      maybeIterable = MAYBE_ITERATOR_SYMBOL && maybeIterable[MAYBE_ITERATOR_SYMBOL] || maybeIterable["@@iterator"];
      return "function" === typeof maybeIterable ? maybeIterable : null;
    }
    var ReactNoopUpdateQueue = {
      isMounted: function() {
        return false;
      },
      enqueueForceUpdate: function() {
      },
      enqueueReplaceState: function() {
      },
      enqueueSetState: function() {
      }
    };
    var assign = Object.assign;
    var emptyObject = {};
    function Component(props, context, updater) {
      this.props = props;
      this.context = context;
      this.refs = emptyObject;
      this.updater = updater || ReactNoopUpdateQueue;
    }
    Component.prototype.isReactComponent = {};
    Component.prototype.setState = function(partialState, callback) {
      if ("object" !== typeof partialState && "function" !== typeof partialState && null != partialState)
        throw Error(
          "takes an object of state variables to update or a function which returns an object of state variables."
        );
      this.updater.enqueueSetState(this, partialState, callback, "setState");
    };
    Component.prototype.forceUpdate = function(callback) {
      this.updater.enqueueForceUpdate(this, callback, "forceUpdate");
    };
    function ComponentDummy() {
    }
    ComponentDummy.prototype = Component.prototype;
    function PureComponent(props, context, updater) {
      this.props = props;
      this.context = context;
      this.refs = emptyObject;
      this.updater = updater || ReactNoopUpdateQueue;
    }
    var pureComponentPrototype = PureComponent.prototype = new ComponentDummy();
    pureComponentPrototype.constructor = PureComponent;
    assign(pureComponentPrototype, Component.prototype);
    pureComponentPrototype.isPureReactComponent = true;
    var isArrayImpl = Array.isArray;
    function noop() {
    }
    var ReactSharedInternals = { H: null, A: null, T: null, S: null };
    var hasOwnProperty = Object.prototype.hasOwnProperty;
    function ReactElement(type, key, props) {
      var refProp = props.ref;
      return {
        $$typeof: REACT_ELEMENT_TYPE,
        type,
        key,
        ref: void 0 !== refProp ? refProp : null,
        props
      };
    }
    function cloneAndReplaceKey(oldElement, newKey) {
      return ReactElement(oldElement.type, newKey, oldElement.props);
    }
    function isValidElement(object) {
      return "object" === typeof object && null !== object && object.$$typeof === REACT_ELEMENT_TYPE;
    }
    function escape(key) {
      var escaperLookup = { "=": "=0", ":": "=2" };
      return "$" + key.replace(/[=:]/g, function(match) {
        return escaperLookup[match];
      });
    }
    var userProvidedKeyEscapeRegex = /\/+/g;
    function getElementKey(element, index) {
      return "object" === typeof element && null !== element && null != element.key ? escape("" + element.key) : index.toString(36);
    }
    function resolveThenable(thenable) {
      switch (thenable.status) {
        case "fulfilled":
          return thenable.value;
        case "rejected":
          throw thenable.reason;
        default:
          switch ("string" === typeof thenable.status ? thenable.then(noop, noop) : (thenable.status = "pending", thenable.then(
            function(fulfilledValue) {
              "pending" === thenable.status && (thenable.status = "fulfilled", thenable.value = fulfilledValue);
            },
            function(error) {
              "pending" === thenable.status && (thenable.status = "rejected", thenable.reason = error);
            }
          )), thenable.status) {
            case "fulfilled":
              return thenable.value;
            case "rejected":
              throw thenable.reason;
          }
      }
      throw thenable;
    }
    function mapIntoArray(children, array, escapedPrefix, nameSoFar, callback) {
      var type = typeof children;
      if ("undefined" === type || "boolean" === type) children = null;
      var invokeCallback = false;
      if (null === children) invokeCallback = true;
      else
        switch (type) {
          case "bigint":
          case "string":
          case "number":
            invokeCallback = true;
            break;
          case "object":
            switch (children.$$typeof) {
              case REACT_ELEMENT_TYPE:
              case REACT_PORTAL_TYPE:
                invokeCallback = true;
                break;
              case REACT_LAZY_TYPE:
                return invokeCallback = children._init, mapIntoArray(
                  invokeCallback(children._payload),
                  array,
                  escapedPrefix,
                  nameSoFar,
                  callback
                );
            }
        }
      if (invokeCallback)
        return callback = callback(children), invokeCallback = "" === nameSoFar ? "." + getElementKey(children, 0) : nameSoFar, isArrayImpl(callback) ? (escapedPrefix = "", null != invokeCallback && (escapedPrefix = invokeCallback.replace(userProvidedKeyEscapeRegex, "$&/") + "/"), mapIntoArray(callback, array, escapedPrefix, "", function(c) {
          return c;
        })) : null != callback && (isValidElement(callback) && (callback = cloneAndReplaceKey(
          callback,
          escapedPrefix + (null == callback.key || children && children.key === callback.key ? "" : ("" + callback.key).replace(
            userProvidedKeyEscapeRegex,
            "$&/"
          ) + "/") + invokeCallback
        )), array.push(callback)), 1;
      invokeCallback = 0;
      var nextNamePrefix = "" === nameSoFar ? "." : nameSoFar + ":";
      if (isArrayImpl(children))
        for (var i = 0; i < children.length; i++)
          nameSoFar = children[i], type = nextNamePrefix + getElementKey(nameSoFar, i), invokeCallback += mapIntoArray(
            nameSoFar,
            array,
            escapedPrefix,
            type,
            callback
          );
      else if (i = getIteratorFn(children), "function" === typeof i)
        for (children = i.call(children), i = 0; !(nameSoFar = children.next()).done; )
          nameSoFar = nameSoFar.value, type = nextNamePrefix + getElementKey(nameSoFar, i++), invokeCallback += mapIntoArray(
            nameSoFar,
            array,
            escapedPrefix,
            type,
            callback
          );
      else if ("object" === type) {
        if ("function" === typeof children.then)
          return mapIntoArray(
            resolveThenable(children),
            array,
            escapedPrefix,
            nameSoFar,
            callback
          );
        array = String(children);
        throw Error(
          "Objects are not valid as a React child (found: " + ("[object Object]" === array ? "object with keys {" + Object.keys(children).join(", ") + "}" : array) + "). If you meant to render a collection of children, use an array instead."
        );
      }
      return invokeCallback;
    }
    function mapChildren(children, func, context) {
      if (null == children) return children;
      var result = [], count = 0;
      mapIntoArray(children, result, "", "", function(child) {
        return func.call(context, child, count++);
      });
      return result;
    }
    function lazyInitializer(payload) {
      if (-1 === payload._status) {
        var ctor = payload._result;
        ctor = ctor();
        ctor.then(
          function(moduleObject) {
            if (0 === payload._status || -1 === payload._status)
              payload._status = 1, payload._result = moduleObject;
          },
          function(error) {
            if (0 === payload._status || -1 === payload._status)
              payload._status = 2, payload._result = error;
          }
        );
        -1 === payload._status && (payload._status = 0, payload._result = ctor);
      }
      if (1 === payload._status) return payload._result.default;
      throw payload._result;
    }
    var reportGlobalError = "function" === typeof reportError ? reportError : function(error) {
      if ("object" === typeof window && "function" === typeof window.ErrorEvent) {
        var event = new window.ErrorEvent("error", {
          bubbles: true,
          cancelable: true,
          message: "object" === typeof error && null !== error && "string" === typeof error.message ? String(error.message) : String(error),
          error
        });
        if (!window.dispatchEvent(event)) return;
      } else if ("object" === typeof process && "function" === typeof process.emit) {
        process.emit("uncaughtException", error);
        return;
      }
      console.error(error);
    };
    var Children = {
      map: mapChildren,
      forEach: function(children, forEachFunc, forEachContext) {
        mapChildren(
          children,
          function() {
            forEachFunc.apply(this, arguments);
          },
          forEachContext
        );
      },
      count: function(children) {
        var n = 0;
        mapChildren(children, function() {
          n++;
        });
        return n;
      },
      toArray: function(children) {
        return mapChildren(children, function(child) {
          return child;
        }) || [];
      },
      only: function(children) {
        if (!isValidElement(children))
          throw Error(
            "React.Children.only expected to receive a single React element child."
          );
        return children;
      }
    };
    exports.Activity = REACT_ACTIVITY_TYPE;
    exports.Children = Children;
    exports.Component = Component;
    exports.Fragment = REACT_FRAGMENT_TYPE;
    exports.Profiler = REACT_PROFILER_TYPE;
    exports.PureComponent = PureComponent;
    exports.StrictMode = REACT_STRICT_MODE_TYPE;
    exports.Suspense = REACT_SUSPENSE_TYPE;
    exports.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = ReactSharedInternals;
    exports.__COMPILER_RUNTIME = {
      __proto__: null,
      c: function(size) {
        return ReactSharedInternals.H.useMemoCache(size);
      }
    };
    exports.cache = function(fn) {
      return function() {
        return fn.apply(null, arguments);
      };
    };
    exports.cacheSignal = function() {
      return null;
    };
    exports.cloneElement = function(element, config, children) {
      if (null === element || void 0 === element)
        throw Error(
          "The argument must be a React element, but you passed " + element + "."
        );
      var props = assign({}, element.props), key = element.key;
      if (null != config)
        for (propName in void 0 !== config.key && (key = "" + config.key), config)
          !hasOwnProperty.call(config, propName) || "key" === propName || "__self" === propName || "__source" === propName || "ref" === propName && void 0 === config.ref || (props[propName] = config[propName]);
      var propName = arguments.length - 2;
      if (1 === propName) props.children = children;
      else if (1 < propName) {
        for (var childArray = Array(propName), i = 0; i < propName; i++)
          childArray[i] = arguments[i + 2];
        props.children = childArray;
      }
      return ReactElement(element.type, key, props);
    };
    exports.createContext = function(defaultValue) {
      defaultValue = {
        $$typeof: REACT_CONTEXT_TYPE,
        _currentValue: defaultValue,
        _currentValue2: defaultValue,
        _threadCount: 0,
        Provider: null,
        Consumer: null
      };
      defaultValue.Provider = defaultValue;
      defaultValue.Consumer = {
        $$typeof: REACT_CONSUMER_TYPE,
        _context: defaultValue
      };
      return defaultValue;
    };
    exports.createElement = function(type, config, children) {
      var propName, props = {}, key = null;
      if (null != config)
        for (propName in void 0 !== config.key && (key = "" + config.key), config)
          hasOwnProperty.call(config, propName) && "key" !== propName && "__self" !== propName && "__source" !== propName && (props[propName] = config[propName]);
      var childrenLength = arguments.length - 2;
      if (1 === childrenLength) props.children = children;
      else if (1 < childrenLength) {
        for (var childArray = Array(childrenLength), i = 0; i < childrenLength; i++)
          childArray[i] = arguments[i + 2];
        props.children = childArray;
      }
      if (type && type.defaultProps)
        for (propName in childrenLength = type.defaultProps, childrenLength)
          void 0 === props[propName] && (props[propName] = childrenLength[propName]);
      return ReactElement(type, key, props);
    };
    exports.createRef = function() {
      return { current: null };
    };
    exports.forwardRef = function(render) {
      return { $$typeof: REACT_FORWARD_REF_TYPE, render };
    };
    exports.isValidElement = isValidElement;
    exports.lazy = function(ctor) {
      return {
        $$typeof: REACT_LAZY_TYPE,
        _payload: { _status: -1, _result: ctor },
        _init: lazyInitializer
      };
    };
    exports.memo = function(type, compare) {
      return {
        $$typeof: REACT_MEMO_TYPE,
        type,
        compare: void 0 === compare ? null : compare
      };
    };
    exports.startTransition = function(scope) {
      var prevTransition = ReactSharedInternals.T, currentTransition = {};
      ReactSharedInternals.T = currentTransition;
      try {
        var returnValue = scope(), onStartTransitionFinish = ReactSharedInternals.S;
        null !== onStartTransitionFinish && onStartTransitionFinish(currentTransition, returnValue);
        "object" === typeof returnValue && null !== returnValue && "function" === typeof returnValue.then && returnValue.then(noop, reportGlobalError);
      } catch (error) {
        reportGlobalError(error);
      } finally {
        null !== prevTransition && null !== currentTransition.types && (prevTransition.types = currentTransition.types), ReactSharedInternals.T = prevTransition;
      }
    };
    exports.unstable_useCacheRefresh = function() {
      return ReactSharedInternals.H.useCacheRefresh();
    };
    exports.use = function(usable) {
      return ReactSharedInternals.H.use(usable);
    };
    exports.useActionState = function(action, initialState, permalink) {
      return ReactSharedInternals.H.useActionState(action, initialState, permalink);
    };
    exports.useCallback = function(callback, deps) {
      return ReactSharedInternals.H.useCallback(callback, deps);
    };
    exports.useContext = function(Context) {
      return ReactSharedInternals.H.useContext(Context);
    };
    exports.useDebugValue = function() {
    };
    exports.useDeferredValue = function(value, initialValue) {
      return ReactSharedInternals.H.useDeferredValue(value, initialValue);
    };
    exports.useEffect = function(create, deps) {
      return ReactSharedInternals.H.useEffect(create, deps);
    };
    exports.useEffectEvent = function(callback) {
      return ReactSharedInternals.H.useEffectEvent(callback);
    };
    exports.useId = function() {
      return ReactSharedInternals.H.useId();
    };
    exports.useImperativeHandle = function(ref, create, deps) {
      return ReactSharedInternals.H.useImperativeHandle(ref, create, deps);
    };
    exports.useInsertionEffect = function(create, deps) {
      return ReactSharedInternals.H.useInsertionEffect(create, deps);
    };
    exports.useLayoutEffect = function(create, deps) {
      return ReactSharedInternals.H.useLayoutEffect(create, deps);
    };
    exports.useMemo = function(create, deps) {
      return ReactSharedInternals.H.useMemo(create, deps);
    };
    exports.useOptimistic = function(passthrough, reducer) {
      return ReactSharedInternals.H.useOptimistic(passthrough, reducer);
    };
    exports.useReducer = function(reducer, initialArg, init) {
      return ReactSharedInternals.H.useReducer(reducer, initialArg, init);
    };
    exports.useRef = function(initialValue) {
      return ReactSharedInternals.H.useRef(initialValue);
    };
    exports.useState = function(initialState) {
      return ReactSharedInternals.H.useState(initialState);
    };
    exports.useSyncExternalStore = function(subscribe, getSnapshot, getServerSnapshot) {
      return ReactSharedInternals.H.useSyncExternalStore(
        subscribe,
        getSnapshot,
        getServerSnapshot
      );
    };
    exports.useTransition = function() {
      return ReactSharedInternals.H.useTransition();
    };
    exports.version = "19.2.8";
  }
});

// node_modules/react/cjs/react.development.js
var require_react_development = __commonJS({
  "node_modules/react/cjs/react.development.js"(exports, module) {
    "use strict";
    "production" !== process.env.NODE_ENV && (function() {
      function defineDeprecationWarning(methodName, info) {
        Object.defineProperty(Component.prototype, methodName, {
          get: function() {
            console.warn(
              "%s(...) is deprecated in plain JavaScript React classes. %s",
              info[0],
              info[1]
            );
          }
        });
      }
      function getIteratorFn(maybeIterable) {
        if (null === maybeIterable || "object" !== typeof maybeIterable)
          return null;
        maybeIterable = MAYBE_ITERATOR_SYMBOL && maybeIterable[MAYBE_ITERATOR_SYMBOL] || maybeIterable["@@iterator"];
        return "function" === typeof maybeIterable ? maybeIterable : null;
      }
      function warnNoop(publicInstance, callerName) {
        publicInstance = (publicInstance = publicInstance.constructor) && (publicInstance.displayName || publicInstance.name) || "ReactClass";
        var warningKey = publicInstance + "." + callerName;
        didWarnStateUpdateForUnmountedComponent[warningKey] || (console.error(
          "Can't call %s on a component that is not yet mounted. This is a no-op, but it might indicate a bug in your application. Instead, assign to `this.state` directly or define a `state = {};` class property with the desired state in the %s component.",
          callerName,
          publicInstance
        ), didWarnStateUpdateForUnmountedComponent[warningKey] = true);
      }
      function Component(props, context, updater) {
        this.props = props;
        this.context = context;
        this.refs = emptyObject;
        this.updater = updater || ReactNoopUpdateQueue;
      }
      function ComponentDummy() {
      }
      function PureComponent(props, context, updater) {
        this.props = props;
        this.context = context;
        this.refs = emptyObject;
        this.updater = updater || ReactNoopUpdateQueue;
      }
      function noop() {
      }
      function testStringCoercion(value) {
        return "" + value;
      }
      function checkKeyStringCoercion(value) {
        try {
          testStringCoercion(value);
          var JSCompiler_inline_result = false;
        } catch (e) {
          JSCompiler_inline_result = true;
        }
        if (JSCompiler_inline_result) {
          JSCompiler_inline_result = console;
          var JSCompiler_temp_const = JSCompiler_inline_result.error;
          var JSCompiler_inline_result$jscomp$0 = "function" === typeof Symbol && Symbol.toStringTag && value[Symbol.toStringTag] || value.constructor.name || "Object";
          JSCompiler_temp_const.call(
            JSCompiler_inline_result,
            "The provided key is an unsupported type %s. This value must be coerced to a string before using it here.",
            JSCompiler_inline_result$jscomp$0
          );
          return testStringCoercion(value);
        }
      }
      function getComponentNameFromType(type) {
        if (null == type) return null;
        if ("function" === typeof type)
          return type.$$typeof === REACT_CLIENT_REFERENCE ? null : type.displayName || type.name || null;
        if ("string" === typeof type) return type;
        switch (type) {
          case REACT_FRAGMENT_TYPE:
            return "Fragment";
          case REACT_PROFILER_TYPE:
            return "Profiler";
          case REACT_STRICT_MODE_TYPE:
            return "StrictMode";
          case REACT_SUSPENSE_TYPE:
            return "Suspense";
          case REACT_SUSPENSE_LIST_TYPE:
            return "SuspenseList";
          case REACT_ACTIVITY_TYPE:
            return "Activity";
        }
        if ("object" === typeof type)
          switch ("number" === typeof type.tag && console.error(
            "Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue."
          ), type.$$typeof) {
            case REACT_PORTAL_TYPE:
              return "Portal";
            case REACT_CONTEXT_TYPE:
              return type.displayName || "Context";
            case REACT_CONSUMER_TYPE:
              return (type._context.displayName || "Context") + ".Consumer";
            case REACT_FORWARD_REF_TYPE:
              var innerType = type.render;
              type = type.displayName;
              type || (type = innerType.displayName || innerType.name || "", type = "" !== type ? "ForwardRef(" + type + ")" : "ForwardRef");
              return type;
            case REACT_MEMO_TYPE:
              return innerType = type.displayName || null, null !== innerType ? innerType : getComponentNameFromType(type.type) || "Memo";
            case REACT_LAZY_TYPE:
              innerType = type._payload;
              type = type._init;
              try {
                return getComponentNameFromType(type(innerType));
              } catch (x) {
              }
          }
        return null;
      }
      function getTaskName(type) {
        if (type === REACT_FRAGMENT_TYPE) return "<>";
        if ("object" === typeof type && null !== type && type.$$typeof === REACT_LAZY_TYPE)
          return "<...>";
        try {
          var name = getComponentNameFromType(type);
          return name ? "<" + name + ">" : "<...>";
        } catch (x) {
          return "<...>";
        }
      }
      function getOwner() {
        var dispatcher = ReactSharedInternals.A;
        return null === dispatcher ? null : dispatcher.getOwner();
      }
      function UnknownOwner() {
        return Error("react-stack-top-frame");
      }
      function hasValidKey(config) {
        if (hasOwnProperty.call(config, "key")) {
          var getter = Object.getOwnPropertyDescriptor(config, "key").get;
          if (getter && getter.isReactWarning) return false;
        }
        return void 0 !== config.key;
      }
      function defineKeyPropWarningGetter(props, displayName) {
        function warnAboutAccessingKey() {
          specialPropKeyWarningShown || (specialPropKeyWarningShown = true, console.error(
            "%s: `key` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://react.dev/link/special-props)",
            displayName
          ));
        }
        warnAboutAccessingKey.isReactWarning = true;
        Object.defineProperty(props, "key", {
          get: warnAboutAccessingKey,
          configurable: true
        });
      }
      function elementRefGetterWithDeprecationWarning() {
        var componentName = getComponentNameFromType(this.type);
        didWarnAboutElementRef[componentName] || (didWarnAboutElementRef[componentName] = true, console.error(
          "Accessing element.ref was removed in React 19. ref is now a regular prop. It will be removed from the JSX Element type in a future release."
        ));
        componentName = this.props.ref;
        return void 0 !== componentName ? componentName : null;
      }
      function ReactElement(type, key, props, owner, debugStack, debugTask) {
        var refProp = props.ref;
        type = {
          $$typeof: REACT_ELEMENT_TYPE,
          type,
          key,
          props,
          _owner: owner
        };
        null !== (void 0 !== refProp ? refProp : null) ? Object.defineProperty(type, "ref", {
          enumerable: false,
          get: elementRefGetterWithDeprecationWarning
        }) : Object.defineProperty(type, "ref", { enumerable: false, value: null });
        type._store = {};
        Object.defineProperty(type._store, "validated", {
          configurable: false,
          enumerable: false,
          writable: true,
          value: 0
        });
        Object.defineProperty(type, "_debugInfo", {
          configurable: false,
          enumerable: false,
          writable: true,
          value: null
        });
        Object.defineProperty(type, "_debugStack", {
          configurable: false,
          enumerable: false,
          writable: true,
          value: debugStack
        });
        Object.defineProperty(type, "_debugTask", {
          configurable: false,
          enumerable: false,
          writable: true,
          value: debugTask
        });
        Object.freeze && (Object.freeze(type.props), Object.freeze(type));
        return type;
      }
      function cloneAndReplaceKey(oldElement, newKey) {
        newKey = ReactElement(
          oldElement.type,
          newKey,
          oldElement.props,
          oldElement._owner,
          oldElement._debugStack,
          oldElement._debugTask
        );
        oldElement._store && (newKey._store.validated = oldElement._store.validated);
        return newKey;
      }
      function validateChildKeys(node) {
        isValidElement(node) ? node._store && (node._store.validated = 1) : "object" === typeof node && null !== node && node.$$typeof === REACT_LAZY_TYPE && ("fulfilled" === node._payload.status ? isValidElement(node._payload.value) && node._payload.value._store && (node._payload.value._store.validated = 1) : node._store && (node._store.validated = 1));
      }
      function isValidElement(object) {
        return "object" === typeof object && null !== object && object.$$typeof === REACT_ELEMENT_TYPE;
      }
      function escape(key) {
        var escaperLookup = { "=": "=0", ":": "=2" };
        return "$" + key.replace(/[=:]/g, function(match) {
          return escaperLookup[match];
        });
      }
      function getElementKey(element, index) {
        return "object" === typeof element && null !== element && null != element.key ? (checkKeyStringCoercion(element.key), escape("" + element.key)) : index.toString(36);
      }
      function resolveThenable(thenable) {
        switch (thenable.status) {
          case "fulfilled":
            return thenable.value;
          case "rejected":
            throw thenable.reason;
          default:
            switch ("string" === typeof thenable.status ? thenable.then(noop, noop) : (thenable.status = "pending", thenable.then(
              function(fulfilledValue) {
                "pending" === thenable.status && (thenable.status = "fulfilled", thenable.value = fulfilledValue);
              },
              function(error) {
                "pending" === thenable.status && (thenable.status = "rejected", thenable.reason = error);
              }
            )), thenable.status) {
              case "fulfilled":
                return thenable.value;
              case "rejected":
                throw thenable.reason;
            }
        }
        throw thenable;
      }
      function mapIntoArray(children, array, escapedPrefix, nameSoFar, callback) {
        var type = typeof children;
        if ("undefined" === type || "boolean" === type) children = null;
        var invokeCallback = false;
        if (null === children) invokeCallback = true;
        else
          switch (type) {
            case "bigint":
            case "string":
            case "number":
              invokeCallback = true;
              break;
            case "object":
              switch (children.$$typeof) {
                case REACT_ELEMENT_TYPE:
                case REACT_PORTAL_TYPE:
                  invokeCallback = true;
                  break;
                case REACT_LAZY_TYPE:
                  return invokeCallback = children._init, mapIntoArray(
                    invokeCallback(children._payload),
                    array,
                    escapedPrefix,
                    nameSoFar,
                    callback
                  );
              }
          }
        if (invokeCallback) {
          invokeCallback = children;
          callback = callback(invokeCallback);
          var childKey = "" === nameSoFar ? "." + getElementKey(invokeCallback, 0) : nameSoFar;
          isArrayImpl(callback) ? (escapedPrefix = "", null != childKey && (escapedPrefix = childKey.replace(userProvidedKeyEscapeRegex, "$&/") + "/"), mapIntoArray(callback, array, escapedPrefix, "", function(c) {
            return c;
          })) : null != callback && (isValidElement(callback) && (null != callback.key && (invokeCallback && invokeCallback.key === callback.key || checkKeyStringCoercion(callback.key)), escapedPrefix = cloneAndReplaceKey(
            callback,
            escapedPrefix + (null == callback.key || invokeCallback && invokeCallback.key === callback.key ? "" : ("" + callback.key).replace(
              userProvidedKeyEscapeRegex,
              "$&/"
            ) + "/") + childKey
          ), "" !== nameSoFar && null != invokeCallback && isValidElement(invokeCallback) && null == invokeCallback.key && invokeCallback._store && !invokeCallback._store.validated && (escapedPrefix._store.validated = 2), callback = escapedPrefix), array.push(callback));
          return 1;
        }
        invokeCallback = 0;
        childKey = "" === nameSoFar ? "." : nameSoFar + ":";
        if (isArrayImpl(children))
          for (var i = 0; i < children.length; i++)
            nameSoFar = children[i], type = childKey + getElementKey(nameSoFar, i), invokeCallback += mapIntoArray(
              nameSoFar,
              array,
              escapedPrefix,
              type,
              callback
            );
        else if (i = getIteratorFn(children), "function" === typeof i)
          for (i === children.entries && (didWarnAboutMaps || console.warn(
            "Using Maps as children is not supported. Use an array of keyed ReactElements instead."
          ), didWarnAboutMaps = true), children = i.call(children), i = 0; !(nameSoFar = children.next()).done; )
            nameSoFar = nameSoFar.value, type = childKey + getElementKey(nameSoFar, i++), invokeCallback += mapIntoArray(
              nameSoFar,
              array,
              escapedPrefix,
              type,
              callback
            );
        else if ("object" === type) {
          if ("function" === typeof children.then)
            return mapIntoArray(
              resolveThenable(children),
              array,
              escapedPrefix,
              nameSoFar,
              callback
            );
          array = String(children);
          throw Error(
            "Objects are not valid as a React child (found: " + ("[object Object]" === array ? "object with keys {" + Object.keys(children).join(", ") + "}" : array) + "). If you meant to render a collection of children, use an array instead."
          );
        }
        return invokeCallback;
      }
      function mapChildren(children, func, context) {
        if (null == children) return children;
        var result = [], count = 0;
        mapIntoArray(children, result, "", "", function(child) {
          return func.call(context, child, count++);
        });
        return result;
      }
      function lazyInitializer(payload) {
        if (-1 === payload._status) {
          var ioInfo = payload._ioInfo;
          null != ioInfo && (ioInfo.start = ioInfo.end = performance.now());
          ioInfo = payload._result;
          var thenable = ioInfo();
          thenable.then(
            function(moduleObject) {
              if (0 === payload._status || -1 === payload._status) {
                payload._status = 1;
                payload._result = moduleObject;
                var _ioInfo = payload._ioInfo;
                null != _ioInfo && (_ioInfo.end = performance.now());
                void 0 === thenable.status && (thenable.status = "fulfilled", thenable.value = moduleObject);
              }
            },
            function(error) {
              if (0 === payload._status || -1 === payload._status) {
                payload._status = 2;
                payload._result = error;
                var _ioInfo2 = payload._ioInfo;
                null != _ioInfo2 && (_ioInfo2.end = performance.now());
                void 0 === thenable.status && (thenable.status = "rejected", thenable.reason = error);
              }
            }
          );
          ioInfo = payload._ioInfo;
          if (null != ioInfo) {
            ioInfo.value = thenable;
            var displayName = thenable.displayName;
            "string" === typeof displayName && (ioInfo.name = displayName);
          }
          -1 === payload._status && (payload._status = 0, payload._result = thenable);
        }
        if (1 === payload._status)
          return ioInfo = payload._result, void 0 === ioInfo && console.error(
            "lazy: Expected the result of a dynamic import() call. Instead received: %s\n\nYour code should look like: \n  const MyComponent = lazy(() => import('./MyComponent'))\n\nDid you accidentally put curly braces around the import?",
            ioInfo
          ), "default" in ioInfo || console.error(
            "lazy: Expected the result of a dynamic import() call. Instead received: %s\n\nYour code should look like: \n  const MyComponent = lazy(() => import('./MyComponent'))",
            ioInfo
          ), ioInfo.default;
        throw payload._result;
      }
      function resolveDispatcher() {
        var dispatcher = ReactSharedInternals.H;
        null === dispatcher && console.error(
          "Invalid hook call. Hooks can only be called inside of the body of a function component. This could happen for one of the following reasons:\n1. You might have mismatching versions of React and the renderer (such as React DOM)\n2. You might be breaking the Rules of Hooks\n3. You might have more than one copy of React in the same app\nSee https://react.dev/link/invalid-hook-call for tips about how to debug and fix this problem."
        );
        return dispatcher;
      }
      function releaseAsyncTransition() {
        ReactSharedInternals.asyncTransitions--;
      }
      function enqueueTask(task) {
        if (null === enqueueTaskImpl)
          try {
            var requireString = ("require" + Math.random()).slice(0, 7);
            enqueueTaskImpl = (module && module[requireString]).call(
              module,
              "timers"
            ).setImmediate;
          } catch (_err) {
            enqueueTaskImpl = function(callback) {
              false === didWarnAboutMessageChannel && (didWarnAboutMessageChannel = true, "undefined" === typeof MessageChannel && console.error(
                "This browser does not have a MessageChannel implementation, so enqueuing tasks via await act(async () => ...) will fail. Please file an issue at https://github.com/facebook/react/issues if you encounter this warning."
              ));
              var channel = new MessageChannel();
              channel.port1.onmessage = callback;
              channel.port2.postMessage(void 0);
            };
          }
        return enqueueTaskImpl(task);
      }
      function aggregateErrors(errors) {
        return 1 < errors.length && "function" === typeof AggregateError ? new AggregateError(errors) : errors[0];
      }
      function popActScope(prevActQueue, prevActScopeDepth) {
        prevActScopeDepth !== actScopeDepth - 1 && console.error(
          "You seem to have overlapping act() calls, this is not supported. Be sure to await previous act() calls before making a new one. "
        );
        actScopeDepth = prevActScopeDepth;
      }
      function recursivelyFlushAsyncActWork(returnValue, resolve, reject) {
        var queue = ReactSharedInternals.actQueue;
        if (null !== queue)
          if (0 !== queue.length)
            try {
              flushActQueue(queue);
              enqueueTask(function() {
                return recursivelyFlushAsyncActWork(returnValue, resolve, reject);
              });
              return;
            } catch (error) {
              ReactSharedInternals.thrownErrors.push(error);
            }
          else ReactSharedInternals.actQueue = null;
        0 < ReactSharedInternals.thrownErrors.length ? (queue = aggregateErrors(ReactSharedInternals.thrownErrors), ReactSharedInternals.thrownErrors.length = 0, reject(queue)) : resolve(returnValue);
      }
      function flushActQueue(queue) {
        if (!isFlushing) {
          isFlushing = true;
          var i = 0;
          try {
            for (; i < queue.length; i++) {
              var callback = queue[i];
              do {
                ReactSharedInternals.didUsePromise = false;
                var continuation = callback(false);
                if (null !== continuation) {
                  if (ReactSharedInternals.didUsePromise) {
                    queue[i] = callback;
                    queue.splice(0, i);
                    return;
                  }
                  callback = continuation;
                } else break;
              } while (1);
            }
            queue.length = 0;
          } catch (error) {
            queue.splice(0, i + 1), ReactSharedInternals.thrownErrors.push(error);
          } finally {
            isFlushing = false;
          }
        }
      }
      "undefined" !== typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ && "function" === typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart && __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart(Error());
      var REACT_ELEMENT_TYPE = /* @__PURE__ */ Symbol.for("react.transitional.element"), REACT_PORTAL_TYPE = /* @__PURE__ */ Symbol.for("react.portal"), REACT_FRAGMENT_TYPE = /* @__PURE__ */ Symbol.for("react.fragment"), REACT_STRICT_MODE_TYPE = /* @__PURE__ */ Symbol.for("react.strict_mode"), REACT_PROFILER_TYPE = /* @__PURE__ */ Symbol.for("react.profiler"), REACT_CONSUMER_TYPE = /* @__PURE__ */ Symbol.for("react.consumer"), REACT_CONTEXT_TYPE = /* @__PURE__ */ Symbol.for("react.context"), REACT_FORWARD_REF_TYPE = /* @__PURE__ */ Symbol.for("react.forward_ref"), REACT_SUSPENSE_TYPE = /* @__PURE__ */ Symbol.for("react.suspense"), REACT_SUSPENSE_LIST_TYPE = /* @__PURE__ */ Symbol.for("react.suspense_list"), REACT_MEMO_TYPE = /* @__PURE__ */ Symbol.for("react.memo"), REACT_LAZY_TYPE = /* @__PURE__ */ Symbol.for("react.lazy"), REACT_ACTIVITY_TYPE = /* @__PURE__ */ Symbol.for("react.activity"), MAYBE_ITERATOR_SYMBOL = Symbol.iterator, didWarnStateUpdateForUnmountedComponent = {}, ReactNoopUpdateQueue = {
        isMounted: function() {
          return false;
        },
        enqueueForceUpdate: function(publicInstance) {
          warnNoop(publicInstance, "forceUpdate");
        },
        enqueueReplaceState: function(publicInstance) {
          warnNoop(publicInstance, "replaceState");
        },
        enqueueSetState: function(publicInstance) {
          warnNoop(publicInstance, "setState");
        }
      }, assign = Object.assign, emptyObject = {};
      Object.freeze(emptyObject);
      Component.prototype.isReactComponent = {};
      Component.prototype.setState = function(partialState, callback) {
        if ("object" !== typeof partialState && "function" !== typeof partialState && null != partialState)
          throw Error(
            "takes an object of state variables to update or a function which returns an object of state variables."
          );
        this.updater.enqueueSetState(this, partialState, callback, "setState");
      };
      Component.prototype.forceUpdate = function(callback) {
        this.updater.enqueueForceUpdate(this, callback, "forceUpdate");
      };
      var deprecatedAPIs = {
        isMounted: [
          "isMounted",
          "Instead, make sure to clean up subscriptions and pending requests in componentWillUnmount to prevent memory leaks."
        ],
        replaceState: [
          "replaceState",
          "Refactor your code to use setState instead (see https://github.com/facebook/react/issues/3236)."
        ]
      };
      for (fnName in deprecatedAPIs)
        deprecatedAPIs.hasOwnProperty(fnName) && defineDeprecationWarning(fnName, deprecatedAPIs[fnName]);
      ComponentDummy.prototype = Component.prototype;
      deprecatedAPIs = PureComponent.prototype = new ComponentDummy();
      deprecatedAPIs.constructor = PureComponent;
      assign(deprecatedAPIs, Component.prototype);
      deprecatedAPIs.isPureReactComponent = true;
      var isArrayImpl = Array.isArray, REACT_CLIENT_REFERENCE = /* @__PURE__ */ Symbol.for("react.client.reference"), ReactSharedInternals = {
        H: null,
        A: null,
        T: null,
        S: null,
        actQueue: null,
        asyncTransitions: 0,
        isBatchingLegacy: false,
        didScheduleLegacyUpdate: false,
        didUsePromise: false,
        thrownErrors: [],
        getCurrentStack: null,
        recentlyCreatedOwnerStacks: 0
      }, hasOwnProperty = Object.prototype.hasOwnProperty, createTask = console.createTask ? console.createTask : function() {
        return null;
      };
      deprecatedAPIs = {
        react_stack_bottom_frame: function(callStackForError) {
          return callStackForError();
        }
      };
      var specialPropKeyWarningShown, didWarnAboutOldJSXRuntime;
      var didWarnAboutElementRef = {};
      var unknownOwnerDebugStack = deprecatedAPIs.react_stack_bottom_frame.bind(
        deprecatedAPIs,
        UnknownOwner
      )();
      var unknownOwnerDebugTask = createTask(getTaskName(UnknownOwner));
      var didWarnAboutMaps = false, userProvidedKeyEscapeRegex = /\/+/g, reportGlobalError = "function" === typeof reportError ? reportError : function(error) {
        if ("object" === typeof window && "function" === typeof window.ErrorEvent) {
          var event = new window.ErrorEvent("error", {
            bubbles: true,
            cancelable: true,
            message: "object" === typeof error && null !== error && "string" === typeof error.message ? String(error.message) : String(error),
            error
          });
          if (!window.dispatchEvent(event)) return;
        } else if ("object" === typeof process && "function" === typeof process.emit) {
          process.emit("uncaughtException", error);
          return;
        }
        console.error(error);
      }, didWarnAboutMessageChannel = false, enqueueTaskImpl = null, actScopeDepth = 0, didWarnNoAwaitAct = false, isFlushing = false, queueSeveralMicrotasks = "function" === typeof queueMicrotask ? function(callback) {
        queueMicrotask(function() {
          return queueMicrotask(callback);
        });
      } : enqueueTask;
      deprecatedAPIs = Object.freeze({
        __proto__: null,
        c: function(size) {
          return resolveDispatcher().useMemoCache(size);
        }
      });
      var fnName = {
        map: mapChildren,
        forEach: function(children, forEachFunc, forEachContext) {
          mapChildren(
            children,
            function() {
              forEachFunc.apply(this, arguments);
            },
            forEachContext
          );
        },
        count: function(children) {
          var n = 0;
          mapChildren(children, function() {
            n++;
          });
          return n;
        },
        toArray: function(children) {
          return mapChildren(children, function(child) {
            return child;
          }) || [];
        },
        only: function(children) {
          if (!isValidElement(children))
            throw Error(
              "React.Children.only expected to receive a single React element child."
            );
          return children;
        }
      };
      exports.Activity = REACT_ACTIVITY_TYPE;
      exports.Children = fnName;
      exports.Component = Component;
      exports.Fragment = REACT_FRAGMENT_TYPE;
      exports.Profiler = REACT_PROFILER_TYPE;
      exports.PureComponent = PureComponent;
      exports.StrictMode = REACT_STRICT_MODE_TYPE;
      exports.Suspense = REACT_SUSPENSE_TYPE;
      exports.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = ReactSharedInternals;
      exports.__COMPILER_RUNTIME = deprecatedAPIs;
      exports.act = function(callback) {
        var prevActQueue = ReactSharedInternals.actQueue, prevActScopeDepth = actScopeDepth;
        actScopeDepth++;
        var queue = ReactSharedInternals.actQueue = null !== prevActQueue ? prevActQueue : [], didAwaitActCall = false;
        try {
          var result = callback();
        } catch (error) {
          ReactSharedInternals.thrownErrors.push(error);
        }
        if (0 < ReactSharedInternals.thrownErrors.length)
          throw popActScope(prevActQueue, prevActScopeDepth), callback = aggregateErrors(ReactSharedInternals.thrownErrors), ReactSharedInternals.thrownErrors.length = 0, callback;
        if (null !== result && "object" === typeof result && "function" === typeof result.then) {
          var thenable = result;
          queueSeveralMicrotasks(function() {
            didAwaitActCall || didWarnNoAwaitAct || (didWarnNoAwaitAct = true, console.error(
              "You called act(async () => ...) without await. This could lead to unexpected testing behaviour, interleaving multiple act calls and mixing their scopes. You should - await act(async () => ...);"
            ));
          });
          return {
            then: function(resolve, reject) {
              didAwaitActCall = true;
              thenable.then(
                function(returnValue) {
                  popActScope(prevActQueue, prevActScopeDepth);
                  if (0 === prevActScopeDepth) {
                    try {
                      flushActQueue(queue), enqueueTask(function() {
                        return recursivelyFlushAsyncActWork(
                          returnValue,
                          resolve,
                          reject
                        );
                      });
                    } catch (error$0) {
                      ReactSharedInternals.thrownErrors.push(error$0);
                    }
                    if (0 < ReactSharedInternals.thrownErrors.length) {
                      var _thrownError = aggregateErrors(
                        ReactSharedInternals.thrownErrors
                      );
                      ReactSharedInternals.thrownErrors.length = 0;
                      reject(_thrownError);
                    }
                  } else resolve(returnValue);
                },
                function(error) {
                  popActScope(prevActQueue, prevActScopeDepth);
                  0 < ReactSharedInternals.thrownErrors.length ? (error = aggregateErrors(
                    ReactSharedInternals.thrownErrors
                  ), ReactSharedInternals.thrownErrors.length = 0, reject(error)) : reject(error);
                }
              );
            }
          };
        }
        var returnValue$jscomp$0 = result;
        popActScope(prevActQueue, prevActScopeDepth);
        0 === prevActScopeDepth && (flushActQueue(queue), 0 !== queue.length && queueSeveralMicrotasks(function() {
          didAwaitActCall || didWarnNoAwaitAct || (didWarnNoAwaitAct = true, console.error(
            "A component suspended inside an `act` scope, but the `act` call was not awaited. When testing React components that depend on asynchronous data, you must await the result:\n\nawait act(() => ...)"
          ));
        }), ReactSharedInternals.actQueue = null);
        if (0 < ReactSharedInternals.thrownErrors.length)
          throw callback = aggregateErrors(ReactSharedInternals.thrownErrors), ReactSharedInternals.thrownErrors.length = 0, callback;
        return {
          then: function(resolve, reject) {
            didAwaitActCall = true;
            0 === prevActScopeDepth ? (ReactSharedInternals.actQueue = queue, enqueueTask(function() {
              return recursivelyFlushAsyncActWork(
                returnValue$jscomp$0,
                resolve,
                reject
              );
            })) : resolve(returnValue$jscomp$0);
          }
        };
      };
      exports.cache = function(fn) {
        return function() {
          return fn.apply(null, arguments);
        };
      };
      exports.cacheSignal = function() {
        return null;
      };
      exports.captureOwnerStack = function() {
        var getCurrentStack = ReactSharedInternals.getCurrentStack;
        return null === getCurrentStack ? null : getCurrentStack();
      };
      exports.cloneElement = function(element, config, children) {
        if (null === element || void 0 === element)
          throw Error(
            "The argument must be a React element, but you passed " + element + "."
          );
        var props = assign({}, element.props), key = element.key, owner = element._owner;
        if (null != config) {
          var JSCompiler_inline_result;
          a: {
            if (hasOwnProperty.call(config, "ref") && (JSCompiler_inline_result = Object.getOwnPropertyDescriptor(
              config,
              "ref"
            ).get) && JSCompiler_inline_result.isReactWarning) {
              JSCompiler_inline_result = false;
              break a;
            }
            JSCompiler_inline_result = void 0 !== config.ref;
          }
          JSCompiler_inline_result && (owner = getOwner());
          hasValidKey(config) && (checkKeyStringCoercion(config.key), key = "" + config.key);
          for (propName in config)
            !hasOwnProperty.call(config, propName) || "key" === propName || "__self" === propName || "__source" === propName || "ref" === propName && void 0 === config.ref || (props[propName] = config[propName]);
        }
        var propName = arguments.length - 2;
        if (1 === propName) props.children = children;
        else if (1 < propName) {
          JSCompiler_inline_result = Array(propName);
          for (var i = 0; i < propName; i++)
            JSCompiler_inline_result[i] = arguments[i + 2];
          props.children = JSCompiler_inline_result;
        }
        props = ReactElement(
          element.type,
          key,
          props,
          owner,
          element._debugStack,
          element._debugTask
        );
        for (key = 2; key < arguments.length; key++)
          validateChildKeys(arguments[key]);
        return props;
      };
      exports.createContext = function(defaultValue) {
        defaultValue = {
          $$typeof: REACT_CONTEXT_TYPE,
          _currentValue: defaultValue,
          _currentValue2: defaultValue,
          _threadCount: 0,
          Provider: null,
          Consumer: null
        };
        defaultValue.Provider = defaultValue;
        defaultValue.Consumer = {
          $$typeof: REACT_CONSUMER_TYPE,
          _context: defaultValue
        };
        defaultValue._currentRenderer = null;
        defaultValue._currentRenderer2 = null;
        return defaultValue;
      };
      exports.createElement = function(type, config, children) {
        for (var i = 2; i < arguments.length; i++)
          validateChildKeys(arguments[i]);
        i = {};
        var key = null;
        if (null != config)
          for (propName in didWarnAboutOldJSXRuntime || !("__self" in config) || "key" in config || (didWarnAboutOldJSXRuntime = true, console.warn(
            "Your app (or one of its dependencies) is using an outdated JSX transform. Update to the modern JSX transform for faster performance: https://react.dev/link/new-jsx-transform"
          )), hasValidKey(config) && (checkKeyStringCoercion(config.key), key = "" + config.key), config)
            hasOwnProperty.call(config, propName) && "key" !== propName && "__self" !== propName && "__source" !== propName && (i[propName] = config[propName]);
        var childrenLength = arguments.length - 2;
        if (1 === childrenLength) i.children = children;
        else if (1 < childrenLength) {
          for (var childArray = Array(childrenLength), _i = 0; _i < childrenLength; _i++)
            childArray[_i] = arguments[_i + 2];
          Object.freeze && Object.freeze(childArray);
          i.children = childArray;
        }
        if (type && type.defaultProps)
          for (propName in childrenLength = type.defaultProps, childrenLength)
            void 0 === i[propName] && (i[propName] = childrenLength[propName]);
        key && defineKeyPropWarningGetter(
          i,
          "function" === typeof type ? type.displayName || type.name || "Unknown" : type
        );
        var propName = 1e4 > ReactSharedInternals.recentlyCreatedOwnerStacks++;
        return ReactElement(
          type,
          key,
          i,
          getOwner(),
          propName ? Error("react-stack-top-frame") : unknownOwnerDebugStack,
          propName ? createTask(getTaskName(type)) : unknownOwnerDebugTask
        );
      };
      exports.createRef = function() {
        var refObject = { current: null };
        Object.seal(refObject);
        return refObject;
      };
      exports.forwardRef = function(render) {
        null != render && render.$$typeof === REACT_MEMO_TYPE ? console.error(
          "forwardRef requires a render function but received a `memo` component. Instead of forwardRef(memo(...)), use memo(forwardRef(...))."
        ) : "function" !== typeof render ? console.error(
          "forwardRef requires a render function but was given %s.",
          null === render ? "null" : typeof render
        ) : 0 !== render.length && 2 !== render.length && console.error(
          "forwardRef render functions accept exactly two parameters: props and ref. %s",
          1 === render.length ? "Did you forget to use the ref parameter?" : "Any additional parameter will be undefined."
        );
        null != render && null != render.defaultProps && console.error(
          "forwardRef render functions do not support defaultProps. Did you accidentally pass a React component?"
        );
        var elementType = { $$typeof: REACT_FORWARD_REF_TYPE, render }, ownName;
        Object.defineProperty(elementType, "displayName", {
          enumerable: false,
          configurable: true,
          get: function() {
            return ownName;
          },
          set: function(name) {
            ownName = name;
            render.name || render.displayName || (Object.defineProperty(render, "name", { value: name }), render.displayName = name);
          }
        });
        return elementType;
      };
      exports.isValidElement = isValidElement;
      exports.lazy = function(ctor) {
        ctor = { _status: -1, _result: ctor };
        var lazyType = {
          $$typeof: REACT_LAZY_TYPE,
          _payload: ctor,
          _init: lazyInitializer
        }, ioInfo = {
          name: "lazy",
          start: -1,
          end: -1,
          value: null,
          owner: null,
          debugStack: Error("react-stack-top-frame"),
          debugTask: console.createTask ? console.createTask("lazy()") : null
        };
        ctor._ioInfo = ioInfo;
        lazyType._debugInfo = [{ awaited: ioInfo }];
        return lazyType;
      };
      exports.memo = function(type, compare) {
        null == type && console.error(
          "memo: The first argument must be a component. Instead received: %s",
          null === type ? "null" : typeof type
        );
        compare = {
          $$typeof: REACT_MEMO_TYPE,
          type,
          compare: void 0 === compare ? null : compare
        };
        var ownName;
        Object.defineProperty(compare, "displayName", {
          enumerable: false,
          configurable: true,
          get: function() {
            return ownName;
          },
          set: function(name) {
            ownName = name;
            type.name || type.displayName || (Object.defineProperty(type, "name", { value: name }), type.displayName = name);
          }
        });
        return compare;
      };
      exports.startTransition = function(scope) {
        var prevTransition = ReactSharedInternals.T, currentTransition = {};
        currentTransition._updatedFibers = /* @__PURE__ */ new Set();
        ReactSharedInternals.T = currentTransition;
        try {
          var returnValue = scope(), onStartTransitionFinish = ReactSharedInternals.S;
          null !== onStartTransitionFinish && onStartTransitionFinish(currentTransition, returnValue);
          "object" === typeof returnValue && null !== returnValue && "function" === typeof returnValue.then && (ReactSharedInternals.asyncTransitions++, returnValue.then(releaseAsyncTransition, releaseAsyncTransition), returnValue.then(noop, reportGlobalError));
        } catch (error) {
          reportGlobalError(error);
        } finally {
          null === prevTransition && currentTransition._updatedFibers && (scope = currentTransition._updatedFibers.size, currentTransition._updatedFibers.clear(), 10 < scope && console.warn(
            "Detected a large number of updates inside startTransition. If this is due to a subscription please re-write it to use React provided hooks. Otherwise concurrent mode guarantees are off the table."
          )), null !== prevTransition && null !== currentTransition.types && (null !== prevTransition.types && prevTransition.types !== currentTransition.types && console.error(
            "We expected inner Transitions to have transferred the outer types set and that you cannot add to the outer Transition while inside the inner.This is a bug in React."
          ), prevTransition.types = currentTransition.types), ReactSharedInternals.T = prevTransition;
        }
      };
      exports.unstable_useCacheRefresh = function() {
        return resolveDispatcher().useCacheRefresh();
      };
      exports.use = function(usable) {
        return resolveDispatcher().use(usable);
      };
      exports.useActionState = function(action, initialState, permalink) {
        return resolveDispatcher().useActionState(
          action,
          initialState,
          permalink
        );
      };
      exports.useCallback = function(callback, deps) {
        return resolveDispatcher().useCallback(callback, deps);
      };
      exports.useContext = function(Context) {
        var dispatcher = resolveDispatcher();
        Context.$$typeof === REACT_CONSUMER_TYPE && console.error(
          "Calling useContext(Context.Consumer) is not supported and will cause bugs. Did you mean to call useContext(Context) instead?"
        );
        return dispatcher.useContext(Context);
      };
      exports.useDebugValue = function(value, formatterFn) {
        return resolveDispatcher().useDebugValue(value, formatterFn);
      };
      exports.useDeferredValue = function(value, initialValue) {
        return resolveDispatcher().useDeferredValue(value, initialValue);
      };
      exports.useEffect = function(create, deps) {
        null == create && console.warn(
          "React Hook useEffect requires an effect callback. Did you forget to pass a callback to the hook?"
        );
        return resolveDispatcher().useEffect(create, deps);
      };
      exports.useEffectEvent = function(callback) {
        return resolveDispatcher().useEffectEvent(callback);
      };
      exports.useId = function() {
        return resolveDispatcher().useId();
      };
      exports.useImperativeHandle = function(ref, create, deps) {
        return resolveDispatcher().useImperativeHandle(ref, create, deps);
      };
      exports.useInsertionEffect = function(create, deps) {
        null == create && console.warn(
          "React Hook useInsertionEffect requires an effect callback. Did you forget to pass a callback to the hook?"
        );
        return resolveDispatcher().useInsertionEffect(create, deps);
      };
      exports.useLayoutEffect = function(create, deps) {
        null == create && console.warn(
          "React Hook useLayoutEffect requires an effect callback. Did you forget to pass a callback to the hook?"
        );
        return resolveDispatcher().useLayoutEffect(create, deps);
      };
      exports.useMemo = function(create, deps) {
        return resolveDispatcher().useMemo(create, deps);
      };
      exports.useOptimistic = function(passthrough, reducer) {
        return resolveDispatcher().useOptimistic(passthrough, reducer);
      };
      exports.useReducer = function(reducer, initialArg, init) {
        return resolveDispatcher().useReducer(reducer, initialArg, init);
      };
      exports.useRef = function(initialValue) {
        return resolveDispatcher().useRef(initialValue);
      };
      exports.useState = function(initialState) {
        return resolveDispatcher().useState(initialState);
      };
      exports.useSyncExternalStore = function(subscribe, getSnapshot, getServerSnapshot) {
        return resolveDispatcher().useSyncExternalStore(
          subscribe,
          getSnapshot,
          getServerSnapshot
        );
      };
      exports.useTransition = function() {
        return resolveDispatcher().useTransition();
      };
      exports.version = "19.2.8";
      "undefined" !== typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ && "function" === typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop && __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop(Error());
    })();
  }
});

// node_modules/react/index.js
var require_react = __commonJS({
  "node_modules/react/index.js"(exports, module) {
    "use strict";
    if (process.env.NODE_ENV === "production") {
      module.exports = require_react_production();
    } else {
      module.exports = require_react_development();
    }
  }
});

// lib/i18n.js
var import_react = __toESM(require_react());
function interpolate(text, vars) {
  if (!vars) return text;
  return text.replace(/\{(\w+)\}/g, (match, name) => name in vars ? String(vars[name]) : match);
}
var DICT = {
  "badge.first_step.title": { id: "Langkah pertama", en: "First step" },
  "badge.first_step.note": { id: "Mulai mencatat!", en: "Start logging!" },
  "badge.first_income.title": { id: "Cuan masuk", en: "Money in" },
  "badge.first_income.note": { id: "Pemasukan pertama", en: "First income logged" },
  "badge.five_logged.title": { id: "Rajin mencatat", en: "Logging regular" },
  "badge.five_logged.note": { id: "5 transaksi tercatat", en: "5 transactions logged" },
  "badge.logged_25.title": { id: "Kolektor momen", en: "Moment collector" },
  "badge.logged_25.note": { id: "25 transaksi tercatat", en: "25 transactions logged" },
  "badge.consistent_3d.title": { id: "Konsisten", en: "Consistent" },
  "badge.consistent_3d.note": { id: "Catat di 3 hari berbeda", en: "Logged on 3 different days" },
  "badge.wishlist_done.title": { id: "Wishlist tercapai", en: "Wishlist done" },
  "badge.wishlist_done.note": { id: "Satu impian berhasil diwujudkan", en: "One dream made real" },
  "badge.streak_7.title": { id: "Setia datang", en: "Loyal regular" },
  "badge.streak_7.note": { id: "Streak 7 hari beruntun", en: "7-day streak going" },
  "badge.challenge_1.title": { id: "Menang pertama", en: "First win" },
  "badge.challenge_1.note": { id: "Selesaikan 1 tantangan mingguan", en: "Complete 1 weekly challenge" },
  "badge.challenge_5.title": { id: "Pemburu tantangan", en: "Challenge hunter" },
  "badge.challenge_5.note": { id: "Selesaikan 5 tantangan mingguan", en: "Complete 5 weekly challenges" },
  "badge.level_6.title": { id: "Jagoan Anggaran", en: "Budget Boss" },
  "badge.level_6.note": { id: "Capai level 6", en: "Reach level 6" },
  "xp.title1": { id: "Pemula Nabung", en: "Savings Rookie" },
  "xp.title2": { id: "Rajin Cuan", en: "Grind Season" },
  "xp.title3": { id: "Jagoan Anggaran", en: "Budget Boss" },
  "xp.title4": { id: "Sultan Circle", en: "Old Money Club" },
  "ntf.channelName": { id: "Pengingat rapi", en: "rapi reminders" },
  "ntf.streakTitle": { id: "rapi \u{1F525}", en: "rapi \u{1F525}" },
  "ntf.streakBody": { id: "Streak-mu bakal putus nih! Catat transaksi hari ini bestie \u2728", en: "Your streak is about to break! Log today's transaction, bestie \u2728" },
  "ntf.dueTitle": { id: "{title} jatuh tempo", en: "{title} due today" },
  "ntf.dueBody": { id: "Transaksi rutin {title} terjadwal hari ini. Cek yuk!", en: "Recurring transaction {title} is scheduled today. Go check it!" },
  "ntf.testTitle": { id: "Tes pengingat rapi \u{1F4F3}", en: "rapi reminder test \u{1F4F3}" },
  "ntf.testBody": { id: "Mantap, notifikasinya jalan! Sampai jumpa di jam terjadwal.", en: "It works! See you at the scheduled time." },
  "pc.kicker": { id: "K A R T U   P E N G C A P A I A N   \u2728", en: "A C H I E V E M E N T   C A R D   \u2728" },
  "pc.statsStreak": { id: "{n} hari beruntun", en: "{n}-day streak" },
  "pc.statsBadge": { id: "{a}/{b} badge terkumpul", en: "{a}/{b} badges collected" },
  "pc.balanceLabel": { id: "SALDO", en: "BALANCE" },
  "pc.maskedNote": { id: "\u2022 disamarkan demi privasi \u2022", en: "\u2022 hidden for privacy \u2022" },
  "pc.footer": { id: "dibuat dengan rapi \u2728", en: "made with rapi \u2728" },
  "rpt.title": { id: "Laporan Transaksi \u2014 {range}", en: "Transaction Report \u2014 {range}" },
  "rpt.generatedAt": { id: "Dibuat {ts}", en: "Generated {ts}" },
  "rpt.sumIn": { id: "Total Masuk", en: "Total In" },
  "rpt.sumOut": { id: "Total Keluar", en: "Total Out" },
  "rpt.sumNet": { id: "Selisih", en: "Net" },
  "rpt.countLine": { id: "{n} transaksi tercatat pada rentang ini", en: "{n} transactions recorded in this range" },
  "rpt.colDate": { id: "Tanggal", en: "Date" },
  "rpt.colCategory": { id: "Kategori", en: "Category" },
  "rpt.colTitle": { id: "Judul", en: "Title" },
  "rpt.colType": { id: "Tipe", en: "Type" },
  "rpt.colWallet": { id: "Dompet", en: "Wallet" },
  "rpt.colAmount": { id: "NOMINAL", en: "AMOUNT" },
  "rpt.in": { id: "Masuk", en: "In" },
  "rpt.out": { id: "Keluar", en: "Out" },
  "rpt.pageOf": { id: "Halaman {p} dari {total} \xB7 dibuat dengan rapi \u2728", en: "Page {p} of {total} \xB7 made with rapi \u2728" },
  "csvErr.empty": { id: "File kosong", en: "Empty file" },
  "csvErr.header": { id: "Header harus memuat kolom: tanggal, tipe, kategori, judul, nominal", en: "Header must contain the columns: tanggal, tipe, kategori, judul, nominal" },
  "csvErr.badDate": { id: "tanggal harus YYYY-MM-DD yang valid", en: "tanggal must be a valid YYYY-MM-DD date" },
  "csvErr.badType": { id: "tipe harus income atau expense", en: "tipe must be income or expense" },
  "csvErr.badCategory": { id: "kategori kosong / terlalu panjang", en: "kategori empty or too long" },
  "csvErr.badTitle": { id: "judul kosong / terlalu panjang", en: "judul empty or too long" },
  "csvErr.badAmount": { id: "nominal harus angka polos > 0", en: "nominal must be a plain number > 0" },
  "common.loading": { id: "Memuat catatan Anda\u2026", en: "Loading your records\u2026" },
  "nav.aria": { id: "Navigasi utama", en: "Main navigation" },
  "nav.fabAria": { id: "Catat transaksi baru", en: "Add new transaction" },
  "nav.beranda": { id: "Beranda", en: "Home" },
  "nav.transaksi": { id: "Transaksi", en: "Money" },
  "nav.target": { id: "Target", en: "Goals" },
  "nav.profil": { id: "Profil", en: "Profile" },
  "err.nameShort": { id: "Nama pengguna minimal 3 karakter.", en: "Username must be at least 3 characters." },
  "err.passShort": { id: "Kata sandi minimal 6 karakter.", en: "Password must be at least 6 characters." },
  "err.nameTaken": { id: "Nama pengguna sudah digunakan. Coba nama lain.", en: "That username is taken. Try another one." },
  "err.passWeak": { id: "Kata sandi terlalu lemah, gunakan minimal 6 karakter.", en: "Password too weak \u2014 use at least 6 characters." },
  "err.rateLimit": { id: "Terlalu banyak percobaan. Tunggu sebentar lalu coba lagi ya.", en: "Too many attempts. Hang on a sec and try again." },
  "err.registerFailed": { id: "Pendaftaran gagal: {msg}", en: "Signup failed: {msg}" },
  "ok.accountCreated": { id: "Akun berhasil dibuat. Silakan masuk.", en: "Account created! Please sign in." },
  "err.badCreds": { id: "Nama pengguna atau kata sandi belum tepat.", en: "Wrong username or password." },
  "auth.kicker": { id: "Rekap Arus Pengeluaran dan Income", en: "Expense & Income Recap" },
  "auth.tagline1": { id: "Uang lebih tenang,", en: "Less money stress," },
  "auth.tagline2": { id: "hidup lebih lega.", en: "more room to live." },
  "auth.desc": { id: "Catat setiap pemasukan dan pengeluaran dengan cara yang sederhana, aman, dan sepenuhnya milik Anda.", en: "Track every income and expense the simple, secure way \u2014 and it's all yours." },
  "auth.privacyTitle": { id: "Pribadi di perangkat Anda", en: "Private to your device" },
  "auth.privacyNote": { id: "Data tersimpan di browser ini saja.", en: "Your data stays in this browser only." },
  "welcome.login": { id: "Selamat datang kembali", en: "Welcome back" },
  "welcome.register": { id: "Mulai catatan baru", en: "Start fresh" },
  "auth.titleLogin": { id: "Masuk ke akun Anda", en: "Sign in to your account" },
  "auth.titleRegister": { id: "Buat akun gratis", en: "Create a free account" },
  "auth.descLogin": { id: "Masukkan akun Anda untuk melanjutkan.", en: "Enter your account to continue." },
  "auth.descRegister": { id: "Tidak perlu email, hanya butuh nama pengguna dan kata sandi.", en: "No email needed \u2014 just a username and password." },
  "label.username": { id: "Nama pengguna", en: "Username" },
  "ph.username": { id: "Username", en: "Username" },
  "label.password": { id: "Kata sandi", en: "Password" },
  "ph.password": { id: "Minimal 6 karakter", en: "At least 6 characters" },
  "btn.processing": { id: "Memproses...", en: "Processing..." },
  "btn.login": { id: "Masuk", en: "Sign in" },
  "btn.register": { id: "Buat akun", en: "Create account" },
  "switch.toRegister": { id: "Belum punya akun?", en: "No account yet?" },
  "switch.toLogin": { id: "Sudah punya akun?", en: "Already have an account?" },
  "privacy.demo": { id: "Untuk aplikasi demo, akun dan data disimpan lokal di perangkat ini.", en: "Demo app \u2014 your account and data are stored locally on this device." },
  "home.kicker": { id: "RINGKASAN KEUANGAN", en: "MONEY SNAPSHOT" },
  "home.greeting": { id: "Halo, {name}.", en: "Hey, {name}." },
  "home.greetingEm": { id: "Bagaimana harimu?", en: "How's your day?" },
  "home.subline": { id: "Semua catatanmu ada di satu tempat.", en: "All your records in one place." },
  "btn.addTx": { id: "Catat transaksi", en: "Log transaction" },
  "stat.income": { id: "Pemasukan", en: "Income" },
  "stat.expense": { id: "Pengeluaran", en: "Expenses" },
  "balance.label": { id: "Saldo saat ini", en: "Current balance" },
  "balance.ariaShow": { id: "Tampilkan saldo", en: "Show balance" },
  "balance.ariaHide": { id: "Sembunyikan saldo", en: "Hide balance" },
  "balance.ok": { id: "Keuanganmu terlihat terjaga.", en: "Your finances look solid." },
  "balance.neg": { id: "Pengeluaran melebihi pemasukan.", en: "Spending is outpacing income." },
  "streak.active": { id: "{n} hari beruntun", en: "{n}-day streak" },
  "streak.start": { id: "Mulai streak-mu hari ini!", en: "Start your streak today!" },
  "rc.count": { id: "**{n}** {unit} tercatat periode ini.", en: "**{n}** {unit} logged this period." },
  "rc.refWeek": { id: "minggu lalu", en: "last week" },
  "rc.refMonth": { id: "bulan lalu", en: "last month" },
  "rc.zero": { id: "Nol pengeluaran \u2014 dompet aman banget \u{1F6E1}\uFE0F", en: "Zero spending all period \u2014 wallet fully secured \u{1F6E1}\uFE0F" },
  "rc.warnDelta": { id: "Pengeluaran **naik {n}%** dari {ref} \u{1F440}", en: "Spending is **up {n}%** from {ref} \u{1F440}" },
  "rc.warnCulprit": { id: "**{cat}** jadi biang keroknya (**{amt}**, {share}% dari total). Tenang masih sempat \u2014 gas geser 10% ke tabungan!", en: "**{cat}** is the main culprit (**{amt}**, {share}% of the total). Still fixable though \u2014 maybe shift 10% into savings!" },
  "rc.praiseDelta": { id: "Pengeluaran **turun {n}%** dari {ref} \u2014 self-control level dewa \u{1F525}", en: "Spending is **down {n}%** vs {ref} \u2014 self-control: god tier \u{1F525}" },
  "rc.praiseCat": { id: "**{cat}** masih favoritmu (**{amt}**), tapi semuanya aman terkendali. Pertahankan \u2728", en: "**{cat}** is still your go-to (**{amt}**), but everything stays under control. Keep it rolling \u2728" },
  "rc.neutralNoPrev": { id: "Belum ada pembanding periode lalu, mulai bangun riwayatmu ya.", en: "Nothing to compare against yet \u2014 start building that history." },
  "rc.neutralStable": { id: "Pengeluaran stabil dibanding {ref}.", en: "Spending stayed steady compared to {ref}." },
  "rc.neutralCat": { id: "**{cat}** menang besar periode ini (**{amt}**). Lancar terus \u2728", en: "**{cat}** takes the crown this period (**{amt}**). Keep it smooth \u2728" },
  "rc.record": { id: "Rekor satuan: **{title}** (**{amt}**).", en: "Biggest single splurge: **{title}** (**{amt}**)." },
  "rc.streak": { id: "Plus, streak-mu udah **{n} hari** \u2014 jangan sampai putus ya bestie!", en: "BTW, your streak is at **{n} days** \u2014 protect it at all costs, bestie!" },
  "xp.toNext": { id: "{a}/{b} XP menuju Lv {lvl}", en: "{a}/{b} XP to Lv {lvl}" },
  "recap.kicker": { id: "RECAP CERITA", en: "STORY RECAP" },
  "recap.title": { id: "Cerita keuanganmu", en: "Your money story" },
  "recap.toggleAria": { id: "Pilih periode recap", en: "Pick recap period" },
  "recap.week": { id: "Minggu", en: "Week" },
  "recap.month": { id: "Bulan", en: "Month" },
  "recap.empty": { id: "Belum ada cerita untuk periode ini. Catat transaksinya dulu, bestie \u2728", en: "No story for this period yet. Log some transactions first, bestie \u2728" },
  "recap.statIn": { id: "Masuk", en: "In" },
  "recap.statOut": { id: "Keluar", en: "Out" },
  "recap.statDays": { id: "Hari aktif", en: "Active days" },
  "recap.daysVal": { id: "{n} hari", en: "{n} days" },
  "insight.title": { id: "Money check-in", en: "Money check-in" },
  "insight.sub": { id: "Snapshot bulan ini, bestie \u{1F4AB}", en: "This month's snapshot, bestie \u{1F4AB}" },
  "insight.topKicker": { id: "Paling banyak di sini", en: "Biggest leak here" },
  "insight.none": { id: "Belum ada pengeluaran", en: "No spending yet" },
  "insight.captionTop": { id: "Terpakai untuk kategori ini sejauh ini.", en: "Spent on this category so far." },
  "insight.captionEmpty": { id: "Mulai catat transaksi untuk melihat insight personal.", en: "Start logging transactions to unlock insights." },
  "chart.title": { id: "Pengeluaran per kategori", en: "Spending by category" },
  "chart.period": { id: "Bulan ini", en: "This month" },
  "chart.empty": { id: "Grafik akan muncul setelah ada pengeluaran.", en: "The chart shows up once you log spending." },
  "budget.title": { id: "Budget bulan ini", en: "This month's budget" },
  "budget.sub": { id: "Jaga pengeluaran tetap on track \u2728", en: "Keep spending on track \u2728" },
  /* F4 — dompet */
  "wallet.switchAria": { id: "Pilih dompet", en: "Choose wallet" },
  "wallet.all": { id: "Semua dompet", en: "All wallets" },
  "budget.scopeAll": { id: "dihitung dari semua dompet", en: "counts every wallet" },
  /* F5 — tantangan hemat mingguan (minggu = Senin-Minggu; GLOBAL lintas dompet) */
  "ch.kicker": { id: "GAMIFIKASI", en: "GAMIFICATION" },
  "ch.title": { id: "Tantangan Minggu Ini", en: "This Week's Challenge" },
  "ch.pickTitle": { id: "Mau tantangan apa minggu ini?", en: "Which challenge this week?" },
  "ch.pickSub": { id: "Pilih satu, selesaikan, dapat bonus XP.", en: "Pick one, finish it, earn bonus XP." },
  "ch.pick": { id: "+ Pilih tantangan", en: "+ Pick a challenge" },
  "ch.onePerWeek": { id: "Satu tantangan aktif per minggu ya \u2014 fokus itu kuncinya. **Semua dompet dihitung**.", en: "One active challenge per week \u2014 focus is the key. **All wallets count**." },
  "ch.alreadyActive": { id: "Sudah jadi tantangan aktifmu", en: "Already your active challenge" },
  "ch.doneChip": { id: "Selesai!", en: "Done!" },
  "ch.doneNote": { id: "Bonus +{xp} XP sudah masuk. Mantap!", en: "+{xp} XP bonus is yours. Nice!" },
  "ch.daysLeft": { id: "{n} hari lagi", en: "{n} days left" },
  "ch.lastDay": { id: "hari terakhir!", en: "last day!" },
  "ch.failedNote": { id: "Peluit panjang buat minggu ini \u2014 coba lagi minggu depan ya.", en: "Better luck next week \u2014 try again Monday." },
  "ch.toastDone": { id: "\u{1F389} {name} selesai! +{xp} XP", en: "\u{1F389} {name} complete! +{xp} XP" },
  "ch.toastActive": { id: "{name} dimulai. Semangat!", en: "{name} started. Go get it!" },
  "err.saveChallenge": { id: "Gagal memulai tantangan. Coba lagi.", en: "Could not start the challenge. Try again." },
  "sim.kicker": { id: "SIMULASI", en: "SIMULATION" },
  "sim.title": { id: "Simulasi Nabung", en: "Savings Simulator" },
  "sim.sub": { id: "Proyeksi dari pola historismu \u2014 geser, lihat bedanya.", en: "Projected from your own history \u2014 drag and compare." },
  "sim.scopeAll": { id: "dihitung dari semua dompet", en: "counts all wallets" },
  "sim.sliderLabel": { id: "Nabung ekstra per bulan", en: "Extra savings per month" },
  "sim.baseline": { id: "Pola sekarang", en: "Current pattern" },
  "sim.withExtra": { id: "Dengan ekstra", en: "With extra" },
  "sim.months": { id: "\xB1{n} bulan", en: "\xB1{n} mo" },
  "sim.noBase": { id: "minus ({v}/bln)", en: "negative ({v}/mo)" },
  "sim.faster": { id: "{n} bulan lebih cepat", en: "{n} months sooner" },
  "sim.goalEta": { id: "Kalau konsisten seperti rata-rata 3 bulan terakhir, {goal} tercapai \xB1{eta}.", en: "If you keep your 3-month average, {goal} lands around {eta}." },
  "sim.goalEtaExtra": { id: "Dengan nabungan ekstra ini, {goal} tercapai \xB1{eta}.", en: "With this extra saving, {goal} lands around {eta}." },
  "sim.proj6": { id: "Dalam 6 bulan saldomu \xB1{v}.", en: "In 6 months you'd have about {v}." },
  "sim.proj12": { id: "Dalam 12 bulan saldomu \xB1{v}.", en: "In 12 months, about {v}." },
  "sim.deficit": { id: "Arus kas-mu masih minus ({v}/bln) \u2014 simulasi butuh surplus positif dulu.", en: "Your cash flow is negative ({v}/mo) \u2014 the simulation needs a positive surplus first." },
  "sim.reached": { id: "{goal} sudah tercapai \u2014 klaim di tab Target!", en: "{goal} is already reached \u2014 claim it in Targets!" },
  "sim.reachedPlain": { id: "Goal-mu sudah tercapai!", en: "Your goal is already reached!" },
  "sim.thinTitle": { id: "Belum cukup data", en: "Not enough data yet" },
  "sim.thin": { id: "Catat transaksi minimal 2 minggu biar simulasinya berarti.", en: "Log transactions for at least 2 weeks so the simulation means something." },
  "sim.disclaimer": { id: "Simulasi dari pola historismu, bukan janji hasil. Angka ikut berubah begitu datamu berubah.", en: "A projection from your own history, not a promise. Numbers change as your data does." },
  "sim.openFromGoal": { id: "Lihat simulasi nabung \u2192", en: "See savings simulation \u2192" },
  "ch.name.log_5_days": { id: "Rajin Catat", en: "Logging Streak" },
  "ch.name.no_spend_weekend": { id: "Weekend Zero", en: "Zero Weekend" },
  "ch.name.want_control": { id: "Kendali Keinginan", en: "Want Control" },
  "ch.name.save_20": { id: "Lebih Hemat 20%", en: "20% Saver" },
  "ch.rule.log_5_days": { id: "Catat transaksi di 5 hari berbeda minggu ini.", en: "Log transactions on 5 different days this week." },
  "ch.rule.no_spend_weekend": { id: "Sabtu & Minggu tanpa pengeluaran sedikit pun.", en: "No spending at all on Saturday & Sunday." },
  "ch.rule.want_control": { id: "Keinginan < 40% pengeluaran minggu ini (min. 3 catatan).", en: "Wants under 40% of this week's spend (min. 3 entries)." },
  "ch.rule.save_20": { id: "Belanja minggu ini < 80% rata-rata 4 minggu terakhir.", en: "Spend under 80% of your 4-week average." },
  "ch.prog.log5": { id: "{n}/5 hari tercatat", en: "{n}/5 days logged" },
  "ch.prog.weekend": { id: "{n}/2 hari weekend bersih", en: "{n}/2 clean weekend days" },
  "ch.prog.want": { id: "Keinginan {n}% dari belanja", en: "Wants are {n}% of spending" },
  "ch.prog.save": { id: "Pace {pct}% dari batas hemat", en: "At {pct}% of savings cap" },
  "ch.elig.history": { id: "Butuh riwayat belanja \xB12 minggu dulu", en: "Needs about 2 weeks of history first" },
  "ch.elig.weekendSpent": { id: "Weekend sudah ada pengeluaran", en: "Weekend already has spending" },
  "ch.elig.weekGone": { id: "Terlambat untuk minggu ini", en: "Too late for this week" },
  "prof.menu.dompet": { id: "Dompet", en: "Wallets" },
  "wallet.add": { id: "+ Dompet", en: "+ Wallet" },
  "wallet.defaultBadge": { id: "Dompet utama \xB7 default", en: "Primary \xB7 default" },
  "wallet.txCount": { id: "{n} transaksi", en: "{n} transactions" },
  "wallet.editAria": { id: "Edit dompet {{name}}", en: "Edit wallet {{name}}" },
  "wallet.limit": { id: "Maksimal 8 dompet ya.", en: "Up to 8 wallets." },
  "wallet.hint": { id: "Pisahkan uang per sumber dana, analitik tetap digabung.", en: "Split money by source; analytics stay combined." },
  "wallet.toastLast": { id: "Dompet terakhir/default nggak bisa dihapus.", en: "The last/default wallet can't be deleted." },
  "wallet.toastUsed": { id: "Masih ada transaksi/rutin di dompet ini. Pindahkan dulu ya.", en: "This wallet still has transactions or routines. Move them first." },
  "wallet.toastDeleted": { id: "Dompet dihapus.", en: "Wallet deleted." },
  "err.saveWallet": { id: "Gagal menyimpan dompet. Coba lagi.", en: "Could not save the wallet. Try again." },
  "form.wallet.kicker": { id: "MULTI-DOMPET", en: "MULTI-WALLET" },
  "form.wallet.new": { id: "Dompet baru", en: "New wallet" },
  "form.wallet.edit": { id: "Edit dompet", en: "Edit wallet" },
  "form.wallet.name": { id: "Nama dompet", en: "Wallet name" },
  "form.wallet.ph": { id: "cth. BCA, Gopay, Uang cash", en: "e.g. BCA, GoPay, Cash" },
  "form.wallet.emoji": { id: "Ikon", en: "Icon" },
  "form.wallet.select": { id: "Dompet", en: "Wallet" },
  "btn.saveWallet": { id: "Simpan dompet", en: "Save wallet" },
  "budget.add": { id: "+ Atur budget", en: "+ Set budget" },
  "budget.editAria": { id: "Ubah budget {cat}", en: "Edit budget for {cat}" },
  "budget.over": { id: "Kelebihan!", en: "Over!" },
  "budget.near": { id: "Hampir habis", en: "Almost gone" },
  "budget.safe": { id: "Aman", en: "Safe" },
  "budget.emptyT": { id: "Belum ada budget", en: "No budgets yet" },
  "budget.emptyD": { id: "Tentukan batas pengeluaran untuk kategori favoritmu.", en: "Set limits for your go-to categories." },
  "budget.createBtn": { id: "Buat budget", en: "Create budget" },
  "tx.title": { id: "Riwayat transaksi", en: "Transaction history" },
  "tx.count": { id: "{n} transaksi tercatat", en: "{n} transactions logged" },
  "filter.all": { id: "Semua", en: "All" },
  "filter.income": { id: "Masuk", en: "In" },
  "filter.expense": { id: "Keluar", en: "Out" },
  "tx.filterAria": { id: "Filter kategori", en: "Filter categories" },
  "tx.sortAria": { id: "Urutkan transaksi", en: "Sort transactions" },
  "sort.newest": { id: "Terbaru", en: "Newest" },
  "sort.biggest": { id: "Terbesar", en: "Largest" },
  "tx.deleteAria": { id: "Hapus {title}", en: "Delete {title}" },
  "empty.filtered": { id: "Tidak ada yang cocok", en: "Nothing matches" },
  "empty.all": { id: "Belum ada transaksi", en: "No transactions yet" },
  "empty.type": { id: "Tidak ada transaksi di sini", en: "Nothing of this type yet" },
  "empty.filteredHint": { id: "Coba longgarkan filter kategori atau tipenya ya.", en: "Try loosening the category or type filters." },
  "empty.hint": { id: "Mulai catat pemasukan atau pengeluaran pertamamu.", en: "Log your first income or expense." },
  "goal.kickerDone": { id: "WISHLIST TERCAPAI! \u{1F389}", en: "WISHLIST DONE! \u{1F389}" },
  "goal.kicker": { id: "TARGET TABUNGAN", en: "SAVINGS GOAL" },
  "goal.noGoal": { id: "Punya wishlist?", en: "Got a wishlist?" },
  "goal.of": { id: "dari", en: "of" },
  "goal.captionEmpty": { id: "Buat target kecil agar menabung terasa lebih seru.", en: "Set a small goal to make saving more fun." },
  "btn.claimBadge": { id: "Klaim badge \u{1F3C6}", en: "Claim badge \u{1F3C6}" },
  "btn.editGoal": { id: "Ubah target", en: "Edit goal" },
  "btn.newGoal": { id: "+ Buat target", en: "+ New goal" },
  "badge.kicker": { id: "KOLEKSI BADGE", en: "BADGE COLLECTION" },
  "badge.heading": { id: "Good job, bestie! \u2728", en: "Good job, bestie! \u2728" },
  "toast.autoLogged": { id: "{n} transaksi rutin otomatis tercatat \u2728", en: "{n} recurring transactions auto-logged \u2728" },
  "toast.customRange": { id: "Lengkapi rentang custom dulu ya \u{1F4C5}", en: "Fill in the custom range first \u{1F4C5}" },
  "toast.rangeEmpty": { id: "Tidak ada transaksi di rentang ini \u{1F937}", en: "No transactions in this range \u{1F937}" },
  "toast.pdfDone": { id: "Laporan PDF terunduh \u{1F4C4}", en: "PDF report downloaded \u{1F4C4}" },
  "toast.pdfFail": { id: "Gagal bikin PDF \u{1F635} coba lagi", en: "PDF failed \u{1F635} try again" },
  "toast.noExportData": { id: "Belum ada transaksi buat diekspor", en: "Nothing to export yet" },
  "toast.csvDone": { id: "CSV terunduh \u{1F9FE}", en: "CSV downloaded \u{1F9FE}" },
  "toast.fileTooBig": { id: "File kegedean (maksimal 5MB)", en: "File too big (max 5MB)" },
  "toast.fileUnreadable": { id: "File nggak bisa dibaca \u{1F635}", en: "Couldn't read that file \u{1F635}" },
  "toast.importPartial": { id: "Import gagal di tengah jalan \u{1F635} baris yang sudah masuk tidak diulang", en: "Import failed midway \u{1F635} rows already saved are not repeated" },
  "toast.imported": { id: "{n} transaksi diimpor \u2728", en: "{n} transactions imported \u2728" },
  "confirm.claimGoal": { id: "Klaim pencapaian \u201C{name}\u201D? Kamu bisa membuat wishlist baru setelahnya.", en: 'Claim "{name}"? You can create a new wishlist afterwards.' },
  "confirm.deleteAccount": { id: "Hapus akun {name} beserta seluruh catatan keuangannya? Tindakan ini tidak dapat dibatalkan.", en: "Delete account {name} along with all its records? This cannot be undone." },
  "form.expense": { id: "Pengeluaran", en: "Expenses" },
  "form.income": { id: "Pemasukan", en: "Income" },
  "label.name": { id: "Nama transaksi", en: "Transaction name" },
  "form.tx.kicker": { id: "TRANSAKSI BARU", en: "NEW TRANSACTION" },
  "form.tx.title": { id: "Catat aktivitas keuangan", en: "Log a money moment" },
  "form.tx.phIncome": { id: "Contoh: Gaji bulanan", en: "e.g. Monthly salary" },
  "form.tx.phExpense": { id: "Contoh: Makan siang", en: "e.g. Lunch" },
  "label.amount": { id: "Nominal", en: "Amount" },
  "opt.pickCategory": { id: "Pilih kategori", en: "Pick a category" },
  "label.date": { id: "Tanggal", en: "Date" },
  "btn.saveTx": { id: "Simpan transaksi", en: "Save transaction" },
  "err.completeTx": { id: "Lengkapi semua data transaksi dengan benar.", en: "Please complete every field correctly." },
  "common.cancel": { id: "Batal", en: "Cancel" },
  "form.budget.kicker": { id: "BUDGET BULANAN", en: "MONTHLY BUDGET" },
  "form.budget.edit": { id: "Ubah limit budget", en: "Edit budget limit" },
  "form.budget.new": { id: "Atur limit budget", en: "Set budget limit" },
  "label.category": { id: "Kategori", en: "Category" },
  "form.budget.ph": { id: "Contoh: 750000", en: "e.g. 750000" },
  "btn.saveBudget": { id: "Simpan budget", en: "Save budget" },
  "err.pickCategory": { id: "Pilih kategori terlebih dahulu.", en: "Pick a category first." },
  "common.close": { id: "Tutup", en: "Close" },
  "form.goal.edit": { id: "Ubah wishlist", en: "Edit wishlist" },
  "form.goal.new": { id: "Buat wishlist baru", en: "Create a new wishlist" },
  "form.goal.name": { id: "Nama target", en: "Goal name" },
  "form.goal.ph": { id: "Contoh: Dana impian", en: "e.g. Dream fund" },
  "form.goal.amount": { id: "Nominal target", en: "Target amount" },
  "form.goal.phAmount": { id: "Contoh: 5000000", en: "e.g. 5000000" },
  "btn.saveGoal": { id: "Simpan target", en: "Save goal" },
  "form.both": { id: "Keduanya", en: "Both" },
  "form.cat.kicker": { id: "KATEGORI BARU", en: "NEW CATEGORY" },
  "form.cat.title": { id: "Tambah kategori", en: "Add category" },
  "form.cat.name": { id: "Nama kategori", en: "Category name" },
  "form.cat.ph": { id: "Contoh: Jajan bubble", en: "e.g. Bubble tea" },
  "form.cat.emoji": { id: "Emoji", en: "Emoji" },
  "err.catDup": { id: "Kategori dengan nama itu sudah ada.", en: "A category with that name already exists." },
  "err.pickEmoji": { id: "Pilih satu emoji untuk kategorimu.", en: "Pick one emoji for your category." },
  "btn.saveCat": { id: "Simpan kategori", en: "Save category" },
  "form.rec.kicker": { id: "TRANSAKSI BERULANG", en: "RECURRING TRANSACTION" },
  "form.rec.title": { id: "Tambah biaya rutin", en: "Add a recurring bill" },
  "form.rec.name": { id: "Nama", en: "Name" },
  "form.rec.ph": { id: "Contoh: Netflix", en: "e.g. Netflix" },
  "form.rec.phAmount": { id: "Contoh: 54000", en: "e.g. 54000" },
  "form.rec.freq": { id: "Frekuensi", en: "Frequency" },
  "rec.monthly": { id: "Bulanan", en: "Monthly" },
  "rec.weekly": { id: "Mingguan", en: "Weekly" },
  "form.rec.billDate": { id: "Tanggal penagihan", en: "Billing date" },
  "rec.pickDay": { id: "Pilih tanggal", en: "Pick a date" },
  "rec.dayN": { id: "tgl {d}", en: "day {d}" },
  "form.rec.billDay": { id: "Hari penagihan", en: "Billing day" },
  "wd.1": { id: "Sen", en: "Mon" },
  "wd.2": { id: "Sel", en: "Tue" },
  "wd.3": { id: "Rab", en: "Wed" },
  "wd.4": { id: "Kam", en: "Thu" },
  "wd.5": { id: "Jum", en: "Fri" },
  "wd.6": { id: "Sab", en: "Sat" },
  "wd.7": { id: "Min", en: "Sun" },
  "form.rec.startDate": { id: "Mulai tanggal", en: "Start date" },
  "btn.saveRec": { id: "Simpan rutin", en: "Save recurring" },
  "err.pickBillDate": { id: "Pilih tanggal penagihan.", en: "Pick a billing date." },
  "err.pickBillDay": { id: "Pilih hari penagihan.", en: "Pick a billing day." },
  "err.pickStart": { id: "Pilih tanggal mulai.", en: "Pick a start date." },
  "import.kicker": { id: "IMPORT CSV", en: "IMPORT CSV" },
  "import.title": { id: "Pindahkan catatanmu", en: "Bring your records over" },
  "import.hint": { id: "File CSV harus punya kolom **tanggal, tipe, kategori, judul, nominal** (tipe: income/expense). Kategori baru otomatis dibuat \u{1F4E6} dan baris duplikat dilewati.", en: "Your CSV needs columns **tanggal, tipe, kategori, judul, nominal** (tipe: income/expense). New categories are created automatically \u{1F4E6} and duplicate rows are skipped." },
  "import.pick": { id: "\u{1F4C2} Pilih file CSV", en: "\u{1F4C2} Pick a CSV file" },
  "import.max": { id: "maksimal 5MB", en: "max 5MB" },
  "import.retry": { id: "Coba file lain", en: "Try another file" },
  "import.ready": { id: "{n} siap masuk", en: "{n} ready to import" },
  "import.dups": { id: "{n} duplikat dilewati", en: "{n} duplicates skipped" },
  "import.badRows": { id: "{n} baris error", en: "{n} bad rows" },
  "import.empty": { id: "File kosong \u2014 nggak ada yang bisa diimpor", en: "Empty file \u2014 nothing to import" },
  "import.row": { id: "Baris {n}", en: "Row {n}" },
  "import.moreErrors": { id: "+{n} error lain\u2026", en: "+{n} more errors\u2026" },
  "imp.thTitle": { id: "Judul", en: "Title" },
  "import.busy": { id: "Mengimpor\u2026", en: "Importing\u2026" },
  "import.confirm": { id: "Import {n} transaksi", en: "Import {n} transactions" },
  "share.kicker": { id: "KARTU PROFIL", en: "PROFILE CARD" },
  "share.title": { id: "Flex pencapaianmu \u2728", en: "Flex your wins \u2728" },
  "share.note": { id: "Generate kartu berisi level, streak, dan badge buat dibagikan ke story.", en: "Generate a card with your level, streak, and badges to share on your story." },
  "share.download": { id: "\u{1F5BC}\uFE0F Unduh kartu", en: "\u{1F5BC}\uFE0F Download card" },
  "share.shareBtn": { id: "Bagikan", en: "Share" },
  "share.navTitle": { id: "Kartu pencapaianku di rapi \u2728", en: "My rapi achievement card \u2728" },
  "settings.kicker": { id: "PENGATURAN", en: "SETTINGS" },
  "settings.title": { id: "Tampilan", en: "Appearance" },
  "settings.currency": { id: "Mata uang tampilan", en: "Display currency" },
  "settings.currencyAria": { id: "Pilih mata uang tampilan", en: "Pick display currency" },
  "settings.fontSize": { id: "Ukuran teks", en: "Text size" },
  "settings.language": { id: "Bahasa", en: "Language" },
  "settings.theme": { id: "Tema", en: "Theme" },
  "theme.system": { id: "Sistem", en: "System" },
  "theme.light": { id: "Terang", en: "Light" },
  "theme.dark": { id: "Gelap", en: "Dark" },
  "font.normal": { id: "Normal", en: "Normal" },
  "font.big": { id: "Besar", en: "Large" },
  "font.super": { id: "Super", en: "Super" },
  "fx.loading": { id: "Mengambil kurs terbaru\u2026", en: "Fetching latest rates\u2026" },
  "fx.unavailable": { id: "Kurs nggak tersedia \u2014 tampilan tetap Rupiah", en: "Rates unavailable \u2014 display stays in Rupiah" },
  "fx.asOf": { id: "Kurs per {date}", en: "Rates as of {date}" },
  "fx.staleSuffix": { id: " (tersimpan)", en: " (cached)" },
  "fx.noteIdr": { id: "Semua catatan tetap tersimpan dalam Rupiah.", en: "All records stay stored in Rupiah." },
  /* F1 — Saran finansial (engine rule-based, bukan nasihat investasi) */
  "prof.menu.saran": { id: "Saran finansial", en: "Money advice" },
  "adv.kicker": { id: "SARAN FINANSIAL", en: "MONEY ADVICE" },
  "adv.title": { id: "Saran buat kamu", en: "Advice for you" },
  "adv.sub": { id: "Dari pola catatanmu sendiri \u2014 murni soal kebiasaan, bukan nasihat investasi.", en: "From your own tracking patterns \u2014 habits only, not investment advice." },
  "adv.seeAll": { id: "Lihat semua saran", en: "See all advice" },
  "adv.teaserMore": { id: "+{n} saran lain", en: "+{n} more tips" },
  "adv.groupAction": { id: "Perlu tindakan", en: "Needs action" },
  "adv.groupReminder": { id: "Cuma pengingat", en: "Just a heads-up" },
  "adv.sev.tinggi": { id: "PENTING", en: "HIGH" },
  "adv.sev.sedang": { id: "WASPADA", en: "MEDIUM" },
  "adv.sev.ringan": { id: "RINGAN", en: "LIGHT" },
  "adv.empty.title": { id: "Belum ada saran \u{1F389}", en: "No advice yet \u{1F389}" },
  "adv.empty.msg": { id: "Catat transaksi minimal 2 minggu, nanti aku kasih saran dari pola belanjamu.", en: "Track transactions for at least 2 weeks and I'll share tips from your patterns." },
  "adv.disclaimer": { id: "Saran otomatis dari pola datamu \u2014 bukan nasihat keuangan profesional.", en: "Auto-generated from your data patterns \u2014 not professional financial advice." },
  "adv.budget_over.title": { id: "Budget kebobol", en: "Budget busted" },
  "adv.budget_over.msg": { id: "**{cat}** udah tembus budget: **{spent}** dari pagarnya {limit} ({pct}%){overLot}. Sisa {daysLeft} hari lagi \u2014 tahan dulu ya \u{1F4AA}", en: "**{cat}** already broke its budget: **{spent}** of the {limit} cap ({pct}%){overLot}. {daysLeft} days left this month \u2014 hang in there \u{1F4AA}" },
  "adv.budget_over.why": { id: "Karena pengeluaran {cat} bulan ini lewat batas yang kamu tentukan sendiri.", en: "Because your {cat} spending this month passed the limit you set." },
  "adv.overLot": { id: " \u2014 lemess {n}%", en: " \u2014 {n}% over" },
  "adv.pace_fast.title": { id: "Ritme ngebut", en: "Fast pace" },
  "adv.pace_fast.msg": { id: "Kalau lanjut ritme ini, **{cat}** diproyeksi **{projected}** di akhir bulan (budget {limit}, ~{pacePct}%). Masih bisa dikendalikan \u23F3", en: "At this pace, **{cat}** is projected to hit **{projected}** by month-end (budget {limit}, ~{pacePct}%). Still controllable \u23F3" },
  "adv.pace_fast.why": { id: "Proyeksi = rata-rata harian \xD7 jumlah hari bulan ini.", en: "Projection = daily average \xD7 days in month." },
  "adv.no_budget.title": { id: "Belum ada pagarnya", en: "No fence yet" },
  "adv.no_budget.msg": { id: "**{cat}** jadi kategori terbesar bulan ini ({share}% pengeluaran, **{amt}**) tapi belum punya budget. Bikinin pagarnya? \u{1F3AF}", en: "**{cat}** is your biggest category this month ({share}% of spend, **{amt}**) but has no budget yet. Want to set one? \u{1F3AF}" },
  "adv.no_budget.why": { id: "Kategori terbesar tanpa budget biasanya paling rawan melebar.", en: "Biggest category without a budget is usually the most likely to balloon." },
  "adv.recurring_burden.title": { id: "Rutin numpuk", en: "Recurring pile-up" },
  "adv.recurring_burden.msg": { id: "{count} langganan/rutin bulanan makan **~{recurring}** atau **{pct}% income**-mu (rata-rata {income}). Cek lagi, masih ada yang bisa di-unsubscribe? \u{1F50D}", en: "{count} monthly subscriptions/recurrings eat **~{recurring}** \u2014 that's **{pct}% of your income** (avg {income}). Worth checking what to unsubscribe \u{1F50D}" },
  "adv.recurring_burden.why": { id: "Beban rutin >50% income bikin ruang gerak nabung makin sempit.", en: "Recurring load above 50% of income squeezes your saving room." },
  "adv.ratio_worse.title": { id: "Arahnya menurun", en: "Slipping trend" },
  "adv.ratio_worse.msg": { id: "Sisa dari pemasukan bulan ini cuma **~{curPct}%**, turun dari ~{prevPct}% bulan lalu. Bukan drama, cuma pengingat \u2728", en: "What's left from this month's income is only **~{curPct}%**, down from ~{prevPct}% last month. No drama, just a nudge \u2728" },
  "adv.ratio_worse.why": { id: "Pengeluaran tumbuh lebih cepat daripada pemasukan.", en: "Spending is growing faster than income." },
  "adv.goal_slow.title": { id: "Target melambat", en: "Goal slowing down" },
  "adv.goal_slow.msg.months": { id: "Dengan ritme sekarang, **{name}** tuntas \xB1**{months} bulan**. Konsisten aja dulu \u{1F680}", en: "At your current pace, **{name}** finishes in \xB1**{months} months**. Just stay consistent \u{1F680}" },
  "adv.goal_slow.msg.boost": { id: "Dengan ritme sekarang, **{name}** tuntas \xB1**{months} bulan**. Nambah **{extra}/bulan** bisa mempercepat \xB13 bulan \u{1F680}", en: "At your current pace, **{name}** finishes in \xB1**{months} months**. Adding **{extra}/month** could cut it by ~3 months \u{1F680}" },
  "adv.goal_slow.msg.stall": { id: "**{name}** belum gerak karena surplus bulananmu kosong. Mulai sisihin {need}/bulan dulu? \u{1F680}", en: "**{name}** isn't moving because your monthly surplus is zero. Start setting aside {need}/month? \u{1F680}" },
  "adv.goal_slow.why": { id: "ETA dihitung dari rata-rata surplus bulanan vs nominal target.", en: "ETA is based on average monthly surplus vs the target amount." },
  "adv.thin_buffer.title": { id: "Bantalan tipis", en: "Thin cushion" },
  "adv.thin_buffer.msg": { id: "3 bulan terakhir cuma nambah **{saved}** \u2014 kurang dari pengeluaran bulanan ({monthly}). Tabungan darurat itu bantalan \u{1F6DF}", en: "Last 3 months you only added **{saved}** \u2014 less than one month of expenses ({monthly}). An emergency fund is your cushion \u{1F6DF}" },
  "adv.thin_buffer.why": { id: "Idealnya buffer 3\xD7 pengeluaran bulanan; sekarang fokus ke 1\xD7 dulu.", en: "Ideally aim for 3\xD7 monthly expenses; getting to 1\xD7 is a great start." },
  "adv.micro_leak.title": { id: "Kebocoran mini", en: "Mini leaks" },
  "adv.micro_leak.msg": { id: "**{n}\xD7** transaksi kecil di **{cat}** = **{total}** bulan ini \u{1F633} Kecil-kecil kepala lima juga kalau sering ya", en: "**{n}\xD7** small purchases at **{cat}** = **{total}** this month \u{1F633} Small but mighty indeed" },
  "adv.micro_leak.why": { id: "Banyak transaksi \u226425rb dalam satu kategori yang totalnya signifikan.", en: "Many \u226425k transactions in one category adding up significantly." },
  /* F2 — Skor kesehatan finansial (kondensasi sinyal jadi 0-100) */
  "adv.score.kicker": { id: "SKOR KESEHATAN", en: "HEALTH SCORE" },
  "adv.score.label": { id: "dari 100", en: "out of 100" },
  "adv.score.sehat": { id: "Sehat", en: "Healthy" },
  "adv.score.waspada": { id: "Waspada", en: "Watch out" },
  "adv.score.perhatian": { id: "Perlu perhatian", en: "Needs attention" },
  "adv.score.vsLast": { id: "vs bulan lalu", en: "vs last month" },
  "adv.score.basis": { id: "berbasis {n} komponen", en: "based on {n} components" },
  "adv.score.breakdown": { id: "Rincian skor", en: "Score breakdown" },
  "adv.score.comp.savings": { id: "Nabung", en: "Saving" },
  "adv.score.comp.budget": { id: "Disiplin budget", en: "Budget discipline" },
  "adv.score.comp.recurring": { id: "Beban rutin", en: "Recurring load" },
  "adv.score.comp.buffer": { id: "Dana darurat", en: "Emergency fund" },
  "adv.score.comp.momentum": { id: "Momentum", en: "Momentum" },
  /* F3 — Rekomendasi budget 50/30/20 (alokasi kategori) */
  "alloc.label": { id: "Alokasi budget", en: "Budget bucket" },
  "alloc.kebutuhan": { id: "Kebutuhan", en: "Needs" },
  "alloc.keinginan": { id: "Keinginan", en: "Wants" },
  "alloc.tabungan": { id: "Tabungan", en: "Savings" },
  "alloc.chipAria": { id: "Ubah alokasi {name}", en: "Change allocation of {name}" },
  "alloc.note": { id: "Chip = alokasi buat rekomendasi 50/30/20. Kategori lama otomatis Kebutuhan \u2014 tap chipnya buat ubah.", en: "Chip = bucket for the 50/30/20 recommendation. Older categories default to Needs \u2014 tap to change." },
  "alloc.migNeeded": { id: "Gagal simpan \u2014 jalankan dulu sql/f3_allocation_type.sql di Supabase ya.", en: "Save failed \u2014 run sql/f3_allocation_type.sql in Supabase first." },
  "alloc.kicker": { id: "BUDGET 50/30/20", en: "50/30/20 BUDGET" },
  "alloc.title": { id: "Pembagian ideal bulan ini", en: "This month's ideal split" },
  "alloc.base": { id: "dari income {amt}", en: "from income of {amt}" },
  "alloc.empty.title": { id: "Belum bisa dihitung", en: "Not enough data yet" },
  "alloc.empty.msg": { id: "Catat pemasukan & pengeluaran bulan ini dulu, nanti pembagian 50/30/20-nya muncul di sini.", en: "Log this month's income and expenses first and your 50/30/20 split will show up here." },
  "alloc.hintTabungan": { id: "Belum ada pengeluaran ke kategori tabungan \u2014 bikin kategori khusus nabung, yuk \u{1F4B0}", en: "No spending in a savings bucket yet \u2014 create a dedicated savings category \u{1F4B0}" },
  "alloc.status.pas": { id: "pas", en: "on track" },
  "alloc.status.over": { id: "lebih", en: "over" },
  "alloc.status.under": { id: "kurang", en: "under" },
  "alloc.msg.pas.kebutuhan": { id: "**Kebutuhan** on track \u2014 pertahankan \u{1F44C}", en: "**Needs** on track \u2014 keep it up \u{1F44C}" },
  "alloc.msg.pas.keinginan": { id: "**Keinginan** pas di pagarnya, mantap \u2728", en: "**Wants** right on target, nice \u2728" },
  "alloc.msg.pas.tabungan": { id: "**Tabungan** jalan sesuai target 20%, keren \u{1F525}", en: "**Savings** hitting the 20% target, awesome \u{1F525}" },
  "alloc.msg.over.kebutuhan": { id: "**Kebutuhan** lewat garis ideal **{gap}**. Cek yang bisa ditekan pelan-pelan \u{1F9D0}", en: "**Needs** is over the ideal line by **{gap}**. See what can be trimmed slowly \u{1F9D0}" },
  "alloc.msg.over.keinginan": { id: "**Keinginan** over **{gap}** dari porsi 30%. Tahan dulu sisa bulan ini? \u{1FAE2}", en: "**Wants** is **{gap}** over its 30% share. Hold back for the rest of the month? \u{1FAE2}" },
  "alloc.msg.over.tabungan": { id: "**Tabungan** over \u2014 malah bagus, sih. Pastikan tetap nyaman ya \u{1F604}", en: "**Savings** is above target \u2014 honestly great. Just make sure it stays comfortable \u{1F604}" },
  "alloc.msg.under.kebutuhan": { id: "**Kebutuhan** masih di bawah ideal \u2014 aman, jangan dipaksa ngejar \u{1F331}", en: "**Needs** is under the ideal \u2014 that's fine, no need to chase it \u{1F331}" },
  "alloc.msg.under.keinginan": { id: "**Keinginan** under budget, self-control level: dewa \u{1F9D8}", en: "**Wants** under budget, elite self-control \u{1F9D8}" },
  "alloc.msg.under.tabungan": { id: "**Tabungan** belum ketemu porsi 20% (**{gap}** lagi). Sisihkan di awal, bukan di akhir bulan \u{1F4B0}", en: "**Savings** hasn't reached its 20% share (**{gap}** to go). Set it aside early, not month-end \u{1F4B0}" },
  "cat.kicker": { id: "KATEGORI", en: "CATEGORIES" },
  "cat.title": { id: "Kelola kategori", en: "Manage categories" },
  "cat.add": { id: "+ Kategori", en: "+ Category" },
  "cat.defaultChip": { id: "default", en: "default" },
  "cat.deleteAria": { id: "Hapus kategori {name}", en: "Delete category {name}" },
  "recM.title": { id: "Langganan & tagihan rutin", en: "Subscriptions & regular bills" },
  "recM.add": { id: "+ Rutin", en: "+ Recurring" },
  "recM.empty": { id: "Belum ada biaya rutin. Tambahkan kayak kos, Netflix, atau gaji bulanan.", en: "No recurring bills yet. Add stuff like rent, Netflix, or a monthly salary." },
  "rec.next": { id: "Berikutnya:", en: "Next:" },
  "wdF.1": { id: "Senin", en: "Monday" },
  "wdF.2": { id: "Selasa", en: "Tuesday" },
  "wdF.3": { id: "Rabu", en: "Wednesday" },
  "wdF.4": { id: "Kamis", en: "Thursday" },
  "wdF.5": { id: "Jumat", en: "Friday" },
  "wdF.6": { id: "Sabtu", en: "Saturday" },
  "wdF.7": { id: "Minggu", en: "Sunday" },
  "data.kicker": { id: "DATA & BACKUP", en: "DATA & BACKUP" },
  "data.title": { id: "Ekspor & impor", en: "Export & import" },
  "data.note": { id: "Simpan laporan PDF sesuai rentang, backup seluruh riwayat ke CSV, atau pindahkan catatan dari aplikasi lain.", en: "Save a PDF report for any range, back up your full history to CSV, or move records over from another app." },
  "data.pdfRange": { id: "Rentang laporan PDF", en: "PDF report range" },
  "data.startAria": { id: "Tanggal mulai", en: "Start date" },
  "data.endAria": { id: "Tanggal selesai", en: "End date" },
  "data.exportPdf": { id: "\u{1F4C4} Export PDF", en: "\u{1F4C4} Export PDF" },
  "data.exportCsv": { id: "\u{1F9FE} Export CSV", en: "\u{1F9FE} Export CSV" },
  "data.importCsv": { id: "\u{1F4E5} Import CSV", en: "\u{1F4E5} Import CSV" },
  "pdf.thisMonth": { id: "Bulan ini", en: "This month" },
  "pdf.lastMonth": { id: "Bulan lalu", en: "Last month" },
  "pdf.custom": { id: "Custom", en: "Custom" },
  "pdf.to": { id: "s/d", en: "to" },
  "rem.kicker": { id: "PENGINGAT", en: "REMINDERS" },
  "rem.title": { id: "Jangan putus streak", en: "Keep the streak alive" },
  "rem.enable": { id: "Aktifkan pengingat", en: "Enable reminders" },
  "rem.desc": { id: "Catat transaksi tiap malam + tagihan rutin jatuh tempo.", en: "Log transactions nightly + get pinged when recurring bills fall due." },
  "rem.hour": { id: "Jam pengingat", en: "Reminder hour" },
  "rem.test": { id: "Tes notifikasi (15 dtk)", en: "Test notification (15s)" },
  "rem.permDenied": { id: "Izin notifikasi ditolak. Aktifkan dari pengaturan sistem ya.", en: "Notification permission denied. Turn it on from system settings." },
  "rem.scheduleFail": { id: "Gagal menjadwalkan pengingat. Coba lagi ya.", en: "Couldn't schedule reminders. Try again." },
  "rem.active": { id: "Pengingat aktif! Tes dikirim 15 detik dari sekarang \u{1F4F3}", en: "Reminders on! Test ping lands in 15 seconds \u{1F4F3}" },
  "danger.title": { id: "Hapus akun", en: "Delete account" },
  "danger.desc": { id: "Seluruh transaksi pada akun ini akan dihapus permanen dari perangkat.", en: "All transactions on this account will be permanently deleted." },
  "auth.logout": { id: "Keluar dari akun", en: "Sign out" },
  "stat.incomeSub": { id: "Total uang masuk", en: "Total money in" },
  "stat.expenseSub": { id: "Total uang keluar", en: "Total money out" },
  "err.saveTx": { id: "Transaksi gagal tersimpan. Coba lagi ya.", en: "Couldn't save the transaction. Try again." },
  "err.badLimit": { id: "Masukkan nominal limit yang benar.", en: "Enter a valid limit amount." },
  "err.saveBudget": { id: "Budget gagal disimpan. Coba lagi ya.", en: "Couldn't save the budget. Try again." },
  "err.goalName": { id: "Beri nama target impianmu dulu.", en: "Give your dream goal a name first." },
  "err.badGoalAmount": { id: "Masukkan nominal target yang benar.", en: "Enter a valid target amount." },
  "err.saveGoal": { id: "Target gagal disimpan. Coba lagi ya.", en: "Couldn't save the goal. Try again." },
  "err.catName": { id: "Beri nama kategorinya dulu.", en: "Name your category first." },
  "err.saveCat": { id: "Kategori gagal disimpan. Coba lagi ya.", en: "Couldn't save the category. Try again." },
  "err.recName": { id: "Beri nama langganan atau tagihannya dulu.", en: "Name the subscription or bill first." },
  "err.badAmount": { id: "Masukkan nominal yang benar.", en: "Enter a valid amount." },
  "err.saveRec": { id: "Transaksi rutin gagal disimpan. Coba lagi ya.", en: "Couldn't save the recurring rule. Try again." },
  "form.tx.phAmount": { id: "Contoh: 50000", en: "e.g. 50000" },
  "form.budget.limitLabel": { id: "Limit bulanan", en: "Monthly limit" },
  "xp.progressAria": { id: "Progress XP menuju level {lvl}", en: "XP progress toward level {lvl}" },
  "lvl.kicker": { id: "LEVEL UP!", en: "LEVEL UP!" },
  "lvl.title": { id: "Lv {level} tercapai!", en: "Lv {level} reached!" },
  "lvl.copy": { id: "Gila sih, bestie \u{1F60E} Kamu resmi naik gelar jadi", en: "Let's gooo, bestie \u{1F60E} You're officially promoted to" },
  "lvl.xp": { id: "+{n} XP dari transaksi terakhirmu \u2728", en: "+{n} XP from your latest transaction \u2728" },
  "lvl.cta": { id: "Gass lanjut!", en: "Onward!" },
  "meta.title": { id: "Rapi | Catatan Keuangan", en: "Rapi | Money Notes" },
  "prof.lvTitle": { id: "Lv {lvl} \xB7 {title}", en: "Lv {lvl} \xB7 {title}" },
  "prof.back": { id: "Kembali", en: "Back" },
  "prof.menu.kartu": { id: "Kartu profil & share", en: "Profile card & share" },
  "prof.menu.pengaturan": { id: "Pengaturan", en: "Settings" },
  "prof.menu.aria": { id: "Menu profil", en: "Profile menu" },
  "rec.everyMonthDay": { id: "tiap bulan tgl {d}", en: "monthly on day {d}" },
  "rec.everyWeekday": { id: "tiap {day}", en: "every {day}" }
};
function tl(lang, key, vars, fallback) {
  const entry = DICT[key];
  const text = entry ? entry[lang] : null;
  return interpolate(text ?? fallback ?? key, vars);
}
var LangContext = (0, import_react.createContext)("id");

// lib/advice.js
function parts(today) {
  const [y, m, d] = today.split("-").map(Number);
  return { y, m, d };
}
function monthKey(y, m) {
  return `${y}-${String(m).padStart(2, "0")}`;
}
function monthRange(y, m, upToDay = null) {
  const lastDay = new Date(y, m, 0).getDate();
  const end = upToDay ? String(upToDay).padStart(2, "0") : String(lastDay).padStart(2, "0");
  return { start: `${monthKey(y, m)}-01`, end: `${monthKey(y, m)}-${end}` };
}
function shiftMonth(y, m, delta) {
  const total = y * 12 + (m - 1) + delta;
  return { y: Math.floor(total / 12), m: total % 12 + 1 };
}
function summarize(transactions2, { start, end }) {
  let income = 0;
  let expense = 0;
  const byCategory = {};
  for (const tx of transactions2) {
    if (!tx || tx.date < start || tx.date > end) continue;
    if (tx.type === "income") {
      income += Number(tx.amount) || 0;
      continue;
    }
    const amount = Number(tx.amount) || 0;
    expense += amount;
    byCategory[tx.category] = (byCategory[tx.category] ?? 0) + amount;
  }
  return { income, expense, byCategory };
}
function defaultShort(n) {
  const value = Math.round(Number(n));
  if (value >= 1e6) return `Rp${(value / 1e6).toFixed(1).replace(".", ",").replace(",0", "")}jt`;
  if (value >= 1e3) return `Rp${Math.round(value / 1e3)}rb`;
  return `Rp${value}`;
}
function monthlyEquivalent(rule) {
  const amount = Number(rule.amount) || 0;
  return rule.frequency === "weekly" ? amount * (52 / 12) : amount;
}
function detectBudgetOver(ctx) {
  for (const [cat, limitRaw] of Object.entries(ctx.budgets)) {
    const limit = Number(limitRaw) || 0;
    if (limit <= 0) continue;
    const spent = ctx.cur.byCategory[cat];
    if (!spent || spent <= limit) continue;
    const pct = Math.round(spent / limit * 100);
    const overPct = Math.round((spent - limit) / limit * 100);
    const overTxt = overPct >= 20 ? tl(ctx.lang, "adv.overLot", { n: overPct }) : "";
    return {
      id: "budget_over",
      icon: "\u{1F6A8}",
      severity: "tinggi",
      score: 100 + Math.min(overPct, 50),
      vars: {
        cat: `${ctx.emoji(cat)} ${cat}`,
        spent: ctx.fmt(spent),
        limit: ctx.fmt(limit),
        pct,
        daysLeft: ctx.daysLeft,
        overLot: overTxt
      }
    };
  }
  return null;
}
function detectFastPace(ctx) {
  for (const [cat, limitRaw] of Object.entries(ctx.budgets)) {
    const limit = Number(limitRaw) || 0;
    if (limit <= 0 || ctx.dayOfMonth < 3) continue;
    const spent = ctx.cur.byCategory[cat];
    if (!spent || spent > limit) continue;
    const projected = spent / ctx.dayOfMonth * ctx.daysInMonth;
    if (projected <= limit * 1.15 || projected <= spent) continue;
    const pacePct = Math.round(projected / limit * 100);
    return {
      id: "pace_fast",
      icon: "\u23F3",
      severity: "sedang",
      score: 70,
      vars: {
        cat: `${ctx.emoji(cat)} ${cat}`,
        projected: ctx.fmt(projected),
        limit: ctx.fmt(limit),
        pacePct,
        daysLeft: ctx.daysLeft
      }
    };
  }
  return null;
}
function detectDominantNoBudget(ctx) {
  const entries = Object.entries(ctx.cur.byCategory).sort((a2, b2) => b2[1] - a2[1]);
  const top = entries[0];
  if (!top) return null;
  const [cat, total] = top;
  if (ctx.cur.expense <= 0 || total < ctx.cur.expense * 0.25) return null;
  if (ctx.budgets[cat] != null && Number(ctx.budgets[cat]) > 0) return null;
  const share = Math.round(total / ctx.cur.expense * 100);
  return {
    id: "no_budget",
    icon: "\u{1F3AF}",
    severity: "ringan",
    score: 50,
    vars: { cat: `${ctx.emoji(cat)} ${cat}`, share, amt: ctx.fmt(total) }
  };
}
function detectRecurringBurden(ctx) {
  if (!ctx.recurrings.length || ctx.avgIncome <= 0) return null;
  const monthlyRecurring = ctx.recurrings.filter((rule) => rule.type === "expense").reduce((sum, rule) => sum + monthlyEquivalent(rule), 0);
  if (monthlyRecurring <= 0) return null;
  const burdenPct = Math.round(monthlyRecurring / ctx.avgIncome * 100);
  if (burdenPct < 50) return null;
  return {
    id: "recurring_burden",
    icon: "\u{1F501}",
    severity: burdenPct > 70 ? "tinggi" : "sedang",
    score: burdenPct > 70 ? 85 : 65,
    vars: {
      pct: burdenPct,
      recurring: ctx.fmt(monthlyRecurring),
      income: ctx.fmt(ctx.avgIncome),
      count: ctx.recurrings.filter((rule) => rule.type === "expense").length
    }
  };
}
function detectRatioWorse(ctx) {
  if (ctx.prev.expense <= 0 || ctx.cur.income <= 0) return null;
  const curRate = 1 - ctx.cur.expense / ctx.cur.income;
  const prevRate = 1 - ctx.prev.expense / ctx.prev.income;
  if (ctx.prev.income <= 0) return null;
  const worsening = ctx.cur.expense / ctx.cur.income > ctx.prev.expense / ctx.prev.income;
  if (!worsening || curRate >= 0.1) return null;
  return {
    id: "ratio_worse",
    icon: "\u{1F4C9}",
    severity: curRate < 0 ? "tinggi" : "sedang",
    score: curRate < 0 ? 80 : 65,
    vars: { prevPct: Math.max(0, Math.round(prevRate * 100)), curPct: Math.max(0, Math.round(curRate * 100)) }
  };
}
function detectSlowGoal(ctx) {
  if (!ctx.goal || !ctx.goal.amount || ctx.surplusAvg == null) return null;
  const target = Number(ctx.goal.amount) || 0;
  if (target <= 0) return null;
  if (ctx.surplusAvg <= 0) {
    return {
      id: "goal_slow",
      icon: "\u{1F680}",
      severity: "sedang",
      score: 58,
      msgKey: "stall",
      vars: { name: ctx.goal.name, months: null, need: ctx.fmt(target / 6) }
    };
  }
  const months = Math.ceil(target / ctx.surplusAvg);
  if (months < 6) return null;
  const fasterMonths = Math.max(months - 3, 1);
  const extraNeeded = target / fasterMonths - ctx.surplusAvg;
  return {
    id: "goal_slow",
    icon: "\u{1F680}",
    severity: "ringan",
    score: 55,
    msgKey: extraNeeded > 0 ? "boost" : "months",
    vars: {
      name: ctx.goal.name,
      months,
      extra: extraNeeded > 0 ? ctx.fmt(extraNeeded) : ""
    }
  };
}
function detectThinBuffer(ctx) {
  if (ctx.buffer == null) return null;
  if (ctx.buffer.surplus3m >= ctx.buffer.monthlyExpense && ctx.buffer.monthlyExpense > 0) return null;
  if (ctx.buffer.monthlyExpense <= 0) return null;
  return {
    id: "thin_buffer",
    icon: "\u{1F6DF}",
    severity: "sedang",
    score: 60,
    vars: {
      saved: ctx.fmt(Math.max(ctx.buffer.surplus3m, 0)),
      monthly: ctx.fmt(ctx.buffer.monthlyExpense)
    }
  };
}
function detectMicroLeak(ctx) {
  if (ctx.cur.expense <= 0) return null;
  const micro = {};
  for (const tx of ctx.transactions) {
    if (tx.type !== "expense" || tx.date < ctx.cur.start || tx.date > ctx.cur.end) continue;
    if (Number(tx.amount) > ctx.microMax) continue;
    micro[tx.category] = micro[tx.category] ?? { count: 0, total: 0 };
    micro[tx.category].count += 1;
    micro[tx.category].total += Number(tx.amount);
  }
  let worst = null;
  for (const [cat, info] of Object.entries(micro)) {
    if (info.count < 10 || info.total < ctx.cur.expense * 0.05) continue;
    if (!worst || info.total > worst.total) worst = { cat, ...info };
  }
  if (!worst) return null;
  return {
    id: "micro_leak",
    icon: "\u2615",
    severity: "ringan",
    score: 45,
    vars: {
      n: worst.count,
      cat: `${ctx.emoji(worst.cat)} ${worst.cat}`,
      total: ctx.fmt(worst.total)
    }
  };
}
var DETECTORS = [
  detectBudgetOver,
  detectRecurringBurden,
  detectRatioWorse,
  detectThinBuffer,
  detectFastPace,
  detectSlowGoal,
  detectDominantNoBudget,
  detectMicroLeak
];
function computeStats(transactions2, today) {
  const { y, m, d } = parts(today);
  const cur = summarize(transactions2, monthRange(y, m, d));
  const pm = shiftMonth(y, m, -1);
  const prev = summarize(transactions2, monthRange(pm.y, pm.m));
  const p2 = shiftMonth(y, m, -2);
  const p3 = shiftMonth(y, m, -3);
  const lastMonths = [
    summarize(transactions2, monthRange(p3.y, p3.m)),
    summarize(transactions2, monthRange(p2.y, p2.m)),
    summarize(transactions2, monthRange(pm.y, pm.m))
  ];
  const incomesFull = lastMonths.map((s) => s.income).filter((v) => v > 0);
  const avgIncome = incomesFull.length ? incomesFull.reduce((a2, b2) => a2 + b2, 0) / incomesFull.length : cur.income > 0 ? cur.income : 0;
  const expensesFull = lastMonths.map((s) => s.expense).filter((v) => v > 0);
  const monthlyExpense = expensesFull.length ? expensesFull.reduce((a2, b2) => a2 + b2, 0) / expensesFull.length : cur.expense;
  const surplusList = lastMonths.map((s) => s.income - s.expense);
  const surplusAvg = surplusList.length ? surplusList.reduce((a2, b2) => a2 + b2, 0) / surplusList.length : null;
  const buffer = {
    surplus3m: surplusList.reduce((a2, b2) => a2 + b2, 0),
    monthlyExpense
  };
  const daysInMonth = new Date(y, m, 0).getDate();
  return {
    y,
    m,
    d,
    cur,
    prev,
    lastMonths,
    avgIncome,
    monthlyExpense,
    surplusList,
    surplusAvg,
    buffer,
    daysInMonth,
    daysLeft: daysInMonth - d
  };
}
function hasEnoughData(transactions2, today) {
  const dates = transactions2.map((tx) => tx?.date).filter(Boolean).sort();
  if (dates.length < 5 || !dates[0]) return false;
  const historyDays = Math.round((/* @__PURE__ */ new Date(`${today}T00:00:00`) - /* @__PURE__ */ new Date(`${dates[0]}T00:00:00`)) / 864e5);
  return historyDays >= 14;
}
function buildAdvice({
  transactions: transactions2 = [],
  budgets: budgets2 = {},
  goal: goal2 = null,
  recurrings: recurrings2 = [],
  lang = "id",
  money = null,
  today = null,
  emojiOf = null
}) {
  const fmt = money?.formatShort ?? ((n) => defaultShort(n));
  const emoji = emojiOf ?? (() => "\u2728");
  if (!today) today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  if (!hasEnoughData(transactions2, today)) return { items: [], checked: 0 };
  const stats = computeStats(transactions2, today);
  const ctx = {
    transactions: transactions2,
    budgets: budgets2,
    recurrings: recurrings2,
    goal: goal2,
    lang,
    fmt,
    emoji,
    ...stats,
    dayOfMonth: stats.d,
    microMax: 25e3
  };
  const candidates = [];
  let checked = 0;
  for (const detect of DETECTORS) {
    try {
      const result = detect(ctx);
      if (!result) continue;
      checked += 1;
      candidates.push(result);
    } catch {
    }
  }
  candidates.sort((a2, b2) => b2.score - a2.score);
  const seenCats = /* @__PURE__ */ new Set();
  const items = [];
  for (const cand of candidates) {
    const catName = typeof cand.vars?.cat === "string" ? cand.vars.cat.split(" ").slice(1).join(" ") : null;
    if (catName) {
      if (seenCats.has(catName)) continue;
      seenCats.add(catName);
    }
    items.push({
      id: cand.id,
      icon: cand.icon,
      severity: cand.severity,
      title: tl(lang, `adv.${cand.id}.title`, null, cand.id),
      message: tl(lang, `adv.${cand.id}.msg${cand.msgKey ? `.${cand.msgKey}` : ""}`, cand.vars),
      reason: tl(lang, `adv.${cand.id}.why`, cand.vars)
    });
  }
  return { items, checked };
}

// scripts/advice.smoke.mjs
var TODAY = "2026-08-23";
function monthTx(y, m, list) {
  const mm = String(m).padStart(2, "0");
  return list.map(([d, type, category, amount], i) => ({
    id: `${y}${mm}-${i}-${category}`,
    type,
    category,
    amount,
    title: `${category} ${i}`,
    date: `${y}-${mm}-${String(d).padStart(2, "0")}`
  }));
}
var transactions = [
  /* Income bulanan stabil 5jt (Mei–Agu) */
  ...monthTx(2026, 5, [[1, "income", "Gaji", 5e6]]),
  ...monthTx(2026, 6, [[1, "income", "Gaji", 5e6]]),
  ...monthTx(2026, 7, [[1, "income", "Gaji", 5e6]]),
  ...monthTx(2026, 8, [[1, "income", "Gaji", 5e6]]),
  /* Mei: hampir habis (surplus tipis utk S6/S7) */
  ...monthTx(2026, 5, [[3, "expense", "Lain-lain", 49e5]]),
  /* Juni: juga tipis */
  ...monthTx(2026, 6, [[5, "expense", "Lain-lain", 495e4]]),
  /* Juli: sedikit lebih sehat (utk S5 memburuk di Agu) */
  ...monthTx(2026, 7, [
    [4, "expense", "Transportasi", 1e6],
    [8, "expense", "Lain-lain", 16e5],
    [12, "expense", "Makan", 9e5]
  ]),
  /* Agustus berjalan: pemicu utama */
  ...monthTx(2026, 8, [
    [2, "expense", "Transportasi", 15e5],
    // S3 kandidat besar
    [4, "expense", "Lain-lain", 23e5],
    // S3 dominan tanpa budget + S5 (expense > income)
    [6, "expense", "Makan", 35e4],
    // S1
    [15, "expense", "Makan", 3e5],
    // S1 total 650rb dari limit 500rb
    [9, "expense", "Hiburan", 12e4],
    // S2 pacing
    [20, "expense", "Hiburan", 26e4],
    // S2 total 380rb dr 400rb, proyeksi nembus
    ...Array.from({ length: 14 }, (_, i) => [7 + i % 15, "expense", "Kopi", 2e4])
    // S8
  ])
];
var budgets = { Makan: 5e5, Hiburan: 4e5 };
var recurrings = [
  { id: "r1", type: "expense", title: "Streaming", amount: 16e5, category: "Langganan", frequency: "monthly", dayOfPeriod: 5, nextRunDate: "2026-09-05" },
  { id: "r2", type: "expense", title: "Cloud", amount: 12e5, category: "Langganan", frequency: "monthly", dayOfPeriod: 10, nextRunDate: "2026-09-10" }
];
var goal = { id: "g1", name: "PS5", amount: 6e6, is_active: true };
var failures = 0;
function check(name, cond, extra = "") {
  console.log(`${cond ? "PASS" : "FAIL"}  ${name}${extra ? ` \u2014 ${extra}` : ""}`);
  if (!cond) failures += 1;
}
var a = buildAdvice({ transactions, budgets, goal, recurrings, lang: "id", today: TODAY });
var ids = a.items.map((item) => item.id);
check("semua 8 detektor aktif", ids.length === 8, JSON.stringify(ids));
check("urutan prioritas: budget_over #1", ids[0] === "budget_over");
check("ratio_worse di 2 besar (expense > income)", ids.indexOf("ratio_worse") === 1);
check("micro_leak paling belakang", ids[ids.length - 1] === "micro_leak");
check("severity budget_over = tinggi", a.items[0].severity === "tinggi");
check("pesan mengandung highlight **", a.items[0].message.includes("**"));
check(
  "tanpa placeholder {var} tersisa",
  a.items.every((item) => !/\{\w+\}/.test(item.message + item.reason)),
  a.items.map((i) => i.message).join(" | ").match(/\{\w+\}/)?.[0] ?? ""
);
check("reason terisi semua", a.items.every((item) => item.reason.length > 5));
var b = buildAdvice({ transactions, budgets, goal, recurrings, lang: "id", today: TODAY });
check("deterministik (2x panggil identik)", JSON.stringify(a) === JSON.stringify(b));
var en = buildAdvice({ transactions, budgets, goal, recurrings, lang: "en", today: TODAY });
check('EN: judul pertama "Budget busted"', en.items[0]?.title === "Budget busted");
var min = buildAdvice({ transactions: transactions.slice(0, 3), budgets, lang: "id", today: TODAY });
check("data kurang \u2192 kosong", min.items.length === 0 && min.checked === 0);
console.log(failures ? `
${failures} GAGAL` : "\nSEMUA PASS");
process.exit(failures ? 1 : 0);
/*! Bundled license information:

react/cjs/react.production.js:
  (**
   * @license React
   * react.production.js
   *
   * Copyright (c) Meta Platforms, Inc. and affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)

react/cjs/react.development.js:
  (**
   * @license React
   * react.development.js
   *
   * Copyright (c) Meta Platforms, Inc. and affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)
*/
