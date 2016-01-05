/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */

(function(undefined) {
'use strict';

(function(undefined) {
'use strict';
/*[global-shim-start]*/
(function (exports, global){
	var origDefine = global.define;

	var get = function(name){
		var parts = name.split("."),
			cur = global,
			i;
		for(i = 0 ; i < parts.length; i++){
			if(!cur) {
				break;
			}
			cur = cur[parts[i]];
		}
		return cur;
	};
	var modules = (global.define && global.define.modules) ||
		(global._define && global._define.modules) || {};
	var ourDefine = global.define = function(moduleName, deps, callback){
		var module;
		if(typeof deps === "function") {
			callback = deps;
			deps = [];
		}
		var args = [],
			i;
		for(i =0; i < deps.length; i++) {
			args.push( exports[deps[i]] ? get(exports[deps[i]]) : ( modules[deps[i]] || get(deps[i]) )  );
		}
		// CJS has no dependencies but 3 callback arguments
		if(!deps.length && callback.length) {
			module = { exports: {} };
			var require = function(name) {
				return exports[name] ? get(exports[name]) : modules[name];
			};
			args.push(require, module.exports, module);
		}
		// Babel uses the exports and module object.
		else if(!args[0] && deps[0] === "exports") {
			module = { exports: {} };
			args[0] = module.exports;
			if(deps[1] === "module") {
				args[1] = module;
			}
		} else if(!args[0] && deps[0] === "module") {
			args[0] = { id: moduleName };
		}

		global.define = origDefine;
		var result = callback ? callback.apply(null, args) : undefined;
		global.define = ourDefine;

		// Favor CJS module.exports over the return value
		modules[moduleName] = module && module.exports ? module.exports : result;
	};
	global.define.orig = origDefine;
	global.define.modules = modules;
	global.define.amd = true;
	ourDefine("@loader", [], function(){
		// shim for @@global-helpers
		var noop = function(){};
		return {
			get: function(){
				return { prepareGlobal: noop, retrieveGlobal: noop };
			},
			global: global,
			__exec: function(__load){
				eval("(function() { " + __load.source + " \n }).call(global);");
			}
		};
	});
})({},window)
/*can@2.3.8#util/can*/
define('can/util/can', [], function () {
    var glbl = typeof window !== 'undefined' ? window : typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope ? self : global;
    var can = {};
    if (typeof GLOBALCAN === 'undefined' || GLOBALCAN !== false) {
        glbl.can = can;
    }
    can.global = glbl;
    can.k = function () {
    };
    can.isDeferred = can.isPromise = function (obj) {
        return obj && typeof obj.then === 'function' && typeof obj.pipe === 'function';
    };
    can.isMapLike = function (obj) {
        return can.Map && (obj instanceof can.Map || obj && obj.___get);
    };
    var cid = 0;
    can.cid = function (object, name) {
        if (!object._cid) {
            cid++;
            object._cid = (name || '') + cid;
        }
        return object._cid;
    };
    can.VERSION = '@EDGE';
    can.simpleExtend = function (d, s) {
        for (var prop in s) {
            d[prop] = s[prop];
        }
        return d;
    };
    can.last = function (arr) {
        return arr && arr[arr.length - 1];
    };
    can.isDOM = function (el) {
        return (el.ownerDocument || el) === can.global.document;
    };
    can.childNodes = function (node) {
        var childNodes = node.childNodes;
        if ('length' in childNodes) {
            return childNodes;
        } else {
            var cur = node.firstChild;
            var nodes = [];
            while (cur) {
                nodes.push(cur);
                cur = cur.nextSibling;
            }
            return nodes;
        }
    };
    var protoBind = Function.prototype.bind;
    if (protoBind) {
        can.proxy = function (fn, context) {
            return protoBind.call(fn, context);
        };
    } else {
        can.proxy = function (fn, context) {
            return function () {
                return fn.apply(context, arguments);
            };
        };
    }
    can.frag = function (item, doc) {
        var document = doc || can.document || can.global.document;
        var frag;
        if (!item || typeof item === 'string') {
            frag = can.buildFragment(item == null ? '' : '' + item, document);
            if (!frag.childNodes.length) {
                frag.appendChild(document.createTextNode(''));
            }
            return frag;
        } else if (item.nodeType === 11) {
            return item;
        } else if (typeof item.nodeType === 'number') {
            frag = document.createDocumentFragment();
            frag.appendChild(item);
            return frag;
        } else if (typeof item.length === 'number') {
            frag = document.createDocumentFragment();
            can.each(item, function (item) {
                frag.appendChild(can.frag(item));
            });
            return frag;
        } else {
            frag = can.buildFragment('' + item, document);
            if (!can.childNodes(frag).length) {
                frag.appendChild(document.createTextNode(''));
            }
            return frag;
        }
    };
    can.scope = can.viewModel = function (el, attr, val) {
        el = can.$(el);
        var scope = can.data(el, 'scope') || can.data(el, 'viewModel');
        if (!scope) {
            scope = new can.Map();
            can.data(el, 'scope', scope);
            can.data(el, 'viewModel', scope);
        }
        switch (arguments.length) {
        case 0:
        case 1:
            return scope;
        case 2:
            return scope.attr(attr);
        default:
            scope.attr(attr, val);
            return el;
        }
    };
    var parseURI = function (url) {
        var m = String(url).replace(/^\s+|\s+$/g, '').match(/^([^:\/?#]+:)?(\/\/(?:[^:@]*(?::[^:@]*)?@)?(([^:\/?#]*)(?::(\d*))?))?([^?#]*)(\?[^#]*)?(#[\s\S]*)?/);
        return m ? {
            href: m[0] || '',
            protocol: m[1] || '',
            authority: m[2] || '',
            host: m[3] || '',
            hostname: m[4] || '',
            port: m[5] || '',
            pathname: m[6] || '',
            search: m[7] || '',
            hash: m[8] || ''
        } : null;
    };
    can.joinURIs = function (base, href) {
        function removeDotSegments(input) {
            var output = [];
            input.replace(/^(\.\.?(\/|$))+/, '').replace(/\/(\.(\/|$))+/g, '/').replace(/\/\.\.$/, '/../').replace(/\/?[^\/]*/g, function (p) {
                if (p === '/..') {
                    output.pop();
                } else {
                    output.push(p);
                }
            });
            return output.join('').replace(/^\//, input.charAt(0) === '/' ? '/' : '');
        }
        href = parseURI(href || '');
        base = parseURI(base || '');
        return !href || !base ? null : (href.protocol || base.protocol) + (href.protocol || href.authority ? href.authority : base.authority) + removeDotSegments(href.protocol || href.authority || href.pathname.charAt(0) === '/' ? href.pathname : href.pathname ? (base.authority && !base.pathname ? '/' : '') + base.pathname.slice(0, base.pathname.lastIndexOf('/') + 1) + href.pathname : base.pathname) + (href.protocol || href.authority || href.pathname ? href.search : href.search || base.search) + href.hash;
    };
    can['import'] = function (moduleName, parentName) {
        var deferred = new can.Deferred();
        if (typeof window.System === 'object' && can.isFunction(window.System['import'])) {
            window.System['import'](moduleName, { name: parentName }).then(can.proxy(deferred.resolve, deferred), can.proxy(deferred.reject, deferred));
        } else if (window.define && window.define.amd) {
            window.require([moduleName], function (value) {
                deferred.resolve(value);
            });
        } else if (window.steal) {
            steal.steal(moduleName, function (value) {
                deferred.resolve(value);
            });
        } else if (window.require) {
            deferred.resolve(window.require(moduleName));
        } else {
            deferred.resolve();
        }
        return deferred.promise();
    };
    can.__observe = function () {
    };
    can.isNode = typeof process === 'object' && {}.toString.call(process) === '[object process]';
    can.isBrowserWindow = typeof window !== 'undefined' && typeof document !== 'undefined' && typeof SimpleDOM === 'undefined';
    can.isWebWorker = typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope;
    return can;
});
/*extend@3.0.0#index*/
define('extend/index', function (require, exports, module) {
    'use strict';
    var hasOwn = Object.prototype.hasOwnProperty;
    var toStr = Object.prototype.toString;
    var isArray = function isArray(arr) {
        if (typeof Array.isArray === 'function') {
            return Array.isArray(arr);
        }
        return toStr.call(arr) === '[object Array]';
    };
    var isPlainObject = function isPlainObject(obj) {
        if (!obj || toStr.call(obj) !== '[object Object]') {
            return false;
        }
        var hasOwnConstructor = hasOwn.call(obj, 'constructor');
        var hasIsPrototypeOf = obj.constructor && obj.constructor.prototype && hasOwn.call(obj.constructor.prototype, 'isPrototypeOf');
        if (obj.constructor && !hasOwnConstructor && !hasIsPrototypeOf) {
            return false;
        }
        var key;
        for (key in obj) {
        }
        return typeof key === 'undefined' || hasOwn.call(obj, key);
    };
    module.exports = function extend() {
        var options, name, src, copy, copyIsArray, clone, target = arguments[0], i = 1, length = arguments.length, deep = false;
        if (typeof target === 'boolean') {
            deep = target;
            target = arguments[1] || {};
            i = 2;
        } else if (typeof target !== 'object' && typeof target !== 'function' || target == null) {
            target = {};
        }
        for (; i < length; ++i) {
            options = arguments[i];
            if (options != null) {
                for (name in options) {
                    src = target[name];
                    copy = options[name];
                    if (target !== copy) {
                        if (deep && copy && (isPlainObject(copy) || (copyIsArray = isArray(copy)))) {
                            if (copyIsArray) {
                                copyIsArray = false;
                                clone = src && isArray(src) ? src : [];
                            } else {
                                clone = src && isPlainObject(src) ? src : {};
                            }
                            target[name] = extend(deep, clone, copy);
                        } else if (typeof copy !== 'undefined') {
                            target[name] = copy;
                        }
                    }
                }
            }
        }
        return target;
    };
});
/*ccompute@0.0.1#util*/
define('ccompute/util', function (require, exports, module) {
    var can = require('can/util/can');
    var has = Object.prototype.hasOwnProperty;
    var slice = Array.prototype.slice;
    can.simpleExtend = function (a, b) {
        for (var p in b) {
            if (has.call(b, p)) {
                a[p] = b[p];
            }
        }
    };
    can.extend = require('extend/index');
    can.makeArray = function (arr) {
        return slice.call(arr);
    };
    can.each = function (arr, cb) {
        var i = 0, len = arr.length;
        if (len) {
            for (; i < len; i++) {
                cb(i, arr[i]);
            }
        } else {
            for (var p in arr) {
                if (has.call(arr, p)) {
                    cb(p, arr[p]);
                }
            }
        }
        return this;
    };
    can.isEmptyObject = function (obj) {
        for (var p in obj) {
            if (has.call(obj, p)) {
                return false;
            }
        }
        return true;
    };
    module.exports = can;
});
/*ccompute@0.0.1#other/batch*/
define('ccompute/other/batch', function (require, exports, module) {
    var batchNum = 1, transactions = 0, dispatchingBatch = null, collectingBatch = null, batches = [], dispatchingBatches = false;
    module.exports = {
        start: function (batchStopHandler) {
            transactions++;
            if (transactions === 1) {
                var batch = {
                    events: [],
                    callbacks: [],
                    number: batchNum++
                };
                batches.push(batch);
                if (batchStopHandler) {
                    batch.callbacks.push(batchStopHandler);
                }
                collectingBatch = batch;
            }
        },
        stop: function (force, callStart) {
            if (force) {
                transactions = 0;
            } else {
                transactions--;
            }
            if (transactions === 0) {
                collectingBatch = null;
                var batch;
                if (dispatchingBatches === false) {
                    dispatchingBatches = true;
                    while (batch = batches.shift()) {
                        var events = batch.events;
                        var callbacks = batch.callbacks;
                        dispatchingBatch = batch;
                        can.batch.batchNum = batch.number;
                        var i, len;
                        if (callStart) {
                            can.batch.start();
                        }
                        for (i = 0, len = events.length; i < len; i++) {
                            can.dispatch.apply(events[i][0], events[i][1]);
                        }
                        can.batch._onDispatchedEvents(batch.number);
                        for (i = 0; i < callbacks.length; i++) {
                            callbacks[i]();
                        }
                        dispatchingBatch = null;
                        can.batch.batchNum = undefined;
                    }
                    dispatchingBatches = false;
                }
            }
        },
        _onDispatchedEvents: function () {
        },
        trigger: function (item, event, args) {
            if (!item.__inSetup) {
                event = typeof event === 'string' ? { type: event } : event;
                if (collectingBatch) {
                    event.batchNum = collectingBatch.number;
                    collectingBatch.events.push([
                        item,
                        [
                            event,
                            args
                        ]
                    ]);
                } else {
                    if (dispatchingBatch) {
                        event.batchNum = dispatchingBatch.number;
                    }
                    can.dispatch.call(item, event, args);
                }
            }
        },
        afterPreviousEvents: function (handler) {
            var batch = can.last(batches);
            if (batch) {
                batch.callbacks.push(handler);
            } else {
                handler({});
            }
        },
        after: function (handler) {
            var batch = collectingBatch || dispatchingBatch;
            if (batch) {
                batch.callbacks.push(handler);
            } else {
                handler({});
            }
        }
    };
});
/*ccompute@0.0.1#other/event*/
define('ccompute/other/event', function (require, exports, module) {
    var can = require('ccompute/util');
    exports.addEvent = function (event, handler) {
        var allEvents = this.__bindEvents || (this.__bindEvents = {}), eventList = allEvents[event] || (allEvents[event] = []);
        eventList.push({
            handler: handler,
            name: event
        });
        return this;
    };
    exports.listenTo = function (other, event, handler) {
        var idedEvents = this.__listenToEvents;
        if (!idedEvents) {
            idedEvents = this.__listenToEvents = {};
        }
        var otherId = can.cid(other);
        var othersEvents = idedEvents[otherId];
        if (!othersEvents) {
            othersEvents = idedEvents[otherId] = {
                obj: other,
                events: {}
            };
        }
        var eventsEvents = othersEvents.events[event];
        if (!eventsEvents) {
            eventsEvents = othersEvents.events[event] = [];
        }
        eventsEvents.push(handler);
        can.bind.call(other, event, handler);
    };
    exports.stopListening = function (other, event, handler) {
        var idedEvents = this.__listenToEvents, iterIdedEvents = idedEvents, i = 0;
        if (!idedEvents) {
            return this;
        }
        if (other) {
            var othercid = can.cid(other);
            (iterIdedEvents = {})[othercid] = idedEvents[othercid];
            if (!idedEvents[othercid]) {
                return this;
            }
        }
        for (var cid in iterIdedEvents) {
            var othersEvents = iterIdedEvents[cid], eventsEvents;
            other = idedEvents[cid].obj;
            if (!event) {
                eventsEvents = othersEvents.events;
            } else {
                (eventsEvents = {})[event] = othersEvents.events[event];
            }
            for (var eventName in eventsEvents) {
                var handlers = eventsEvents[eventName] || [];
                i = 0;
                while (i < handlers.length) {
                    if (handler && handler === handlers[i] || !handler) {
                        can.unbind.call(other, eventName, handlers[i]);
                        handlers.splice(i, 1);
                    } else {
                        i++;
                    }
                }
                if (!handlers.length) {
                    delete othersEvents.events[eventName];
                }
            }
            if (can.isEmptyObject(othersEvents.events)) {
                delete idedEvents[cid];
            }
        }
        return this;
    };
    exports.removeEvent = function (event, fn, __validate) {
        if (!this.__bindEvents) {
            return this;
        }
        var events = this.__bindEvents[event] || [], i = 0, ev, isFunction = typeof fn === 'function';
        while (i < events.length) {
            ev = events[i];
            if (__validate ? __validate(ev, event, fn) : isFunction && ev.handler === fn || !isFunction && (ev.cid === fn || !fn)) {
                events.splice(i, 1);
            } else {
                i++;
            }
        }
        return this;
    };
    can.dispatch = exports.dispatch = function (event, args) {
        var events = this.__bindEvents;
        if (!events) {
            return;
        }
        var eventName;
        if (typeof event === 'string') {
            eventName = event;
            event = { type: event };
        } else {
            eventName = event.type;
        }
        var handlers = events[eventName];
        if (!handlers) {
            return;
        } else {
            handlers = handlers.slice(0);
        }
        var passed = [event];
        if (args) {
            passed.push.apply(passed, args);
        }
        for (var i = 0, len = handlers.length; i < len; i++) {
            handlers[i].handler.apply(this, passed);
        }
        return event;
    };
    exports.one = function (event, handler) {
        var one = function () {
            can.unbind.call(this, event, one);
            return handler.apply(this, arguments);
        };
        can.bind.call(this, event, one);
        return this;
    };
    exports.event = {
        on: function () {
            return exports.addEvent.apply(this, arguments);
        },
        off: function () {
            return can.removeEvent.apply(this, arguments);
        },
        bind: exports.addEvent,
        unbind: exports.removeEvent,
        delegate: function (selector, event, handler) {
            return exports.addEvent.call(this, event, handler);
        },
        undelegate: function (selector, event, handler) {
            return exports.removeEvent.call(this, event, handler);
        },
        trigger: exports.dispatch,
        one: exports.one,
        addEvent: exports.addEvent,
        removeEvent: exports.removeEvent,
        listenTo: exports.listenTo,
        stopListening: exports.stopListening,
        dispatch: exports.dispatch
    };
});
/*ccompute@0.0.1#other/bind*/
define('ccompute/other/bind', function (require, exports, module) {
    var eevent = require('ccompute/other/event');
    exports.bindAndSetup = function () {
        eevent.addEvent.apply(this, arguments);
        if (!this.__inSetup) {
            if (!this._bindings) {
                this._bindings = 1;
                if (this._bindsetup) {
                    this._bindsetup();
                }
            } else {
                this._bindings++;
            }
        }
        return this;
    };
    exports.unbindAndTeardown = function (event, handler) {
        if (!this.__bindEvents) {
            return this;
        }
        var handlers = this.__bindEvents[event] || [];
        var handlerCount = handlers.length;
        eevent.removeEvent.apply(this, arguments);
        if (this._bindings === null) {
            this._bindings = 0;
        } else {
            this._bindings = this._bindings - (handlerCount - handlers.length);
        }
        if (!this._bindings && this._bindteardown) {
            this._bindteardown();
        }
        return this;
    };
});
/*ccompute@0.0.1#read*/
define('ccompute/read', ['ccompute/util'], function (can) {
    var proxy = function (fn, context) {
        return fn.bind(context);
    };
    var read = function (parent, reads, options) {
        options = options || {};
        var state = { foundObservable: false };
        var cur = readValue(parent, 0, reads, options, state), type, prev, readLength = reads.length, i = 0;
        while (i < readLength) {
            prev = cur;
            for (var r = 0, readersLength = read.propertyReaders.length; r < readersLength; r++) {
                var reader = read.propertyReaders[r];
                if (reader.test(cur)) {
                    cur = reader.read(cur, reads[i], i, options, state);
                    break;
                }
            }
            i = i + 1;
            cur = readValue(cur, i, reads, options, state, prev);
            type = typeof cur;
            if (i < reads.length && (cur === null || type !== 'function' && type !== 'object')) {
                if (options.earlyExit) {
                    options.earlyExit(prev, i - 1, cur);
                }
                return {
                    value: undefined,
                    parent: prev
                };
            }
        }
        if (cur === undefined) {
            if (options.earlyExit) {
                options.earlyExit(prev, i - 1);
            }
        }
        return {
            value: cur,
            parent: prev
        };
    };
    var isAt = function (index, reads) {
        var prevRead = reads[index - 1];
        return prevRead && prevRead.at;
    };
    var readValue = function (value, index, reads, options, state, prev) {
        var usedValueReader;
        do {
            usedValueReader = false;
            for (var i = 0, len = read.valueReaders.length; i < len; i++) {
                if (read.valueReaders[i].test(value, index, reads, options)) {
                    value = read.valueReaders[i].read(value, index, reads, options, state, prev);
                }
            }
        } while (usedValueReader);
        return value;
    };
    read.valueReaders = [
        {
            name: 'compute',
            test: function (value, i, reads, options) {
                return value && value.isComputed && !isAt(i, reads);
            },
            read: function (value, i, reads, options, state) {
                if (options.isArgument && i === reads.length) {
                    return value;
                }
                if (!state.foundObservable && options.foundObservable) {
                    options.foundObservable(value, i);
                    state.foundObservable = true;
                }
                return value instanceof can.Compute ? value.get() : value();
            }
        },
        {
            name: 'function',
            test: function (value, i, reads, options) {
                var type = typeof value;
                return type === 'function' && !value.isComputed && !(can.Construct && value.prototype instanceof can.Construct) && !(can.route && value === can.route);
            },
            read: function (value, i, reads, options, state, prev) {
                if (isAt(i, reads)) {
                    return i === reads.length ? proxy(value, prev) : value;
                } else if (options.callMethodsOnObservables && can.isMapLike(prev)) {
                    return value.apply(prev, options.args || []);
                } else if (options.isArgument && i === reads.length) {
                    return options.proxyMethods !== false ? proxy(value, prev) : value;
                }
                return value.apply(prev, options.args || []);
            }
        }
    ];
    read.propertyReaders = [
        {
            name: 'map',
            test: can.isMapLike,
            read: function (value, prop, index, options, state) {
                if (!state.foundObservable && options.foundObservable) {
                    options.foundObservable(value, index);
                    state.foundObservable = true;
                }
                var val = value[prop.key];
                if (typeof val === 'function' && value.constructor.prototype[prop.key] === val && !val.isComputed) {
                    return val;
                } else {
                    return value.attr(prop.key);
                }
            }
        },
        {
            name: 'promise',
            test: function (value) {
                return can.isPromise(value);
            },
            read: function (value, prop, index, options, state) {
                if (!state.foundObservable && options.foundObservable) {
                    options.foundObservable(value, index);
                    state.foundObservable = true;
                }
                var observeData = value.__observeData;
                if (!value.__observeData) {
                    observeData = value.__observeData = {
                        isPending: true,
                        state: 'pending',
                        isResolved: false,
                        isRejected: false,
                        value: undefined,
                        reason: undefined
                    };
                    can.cid(observeData);
                    can.simpleExtend(observeData, can.event);
                    value.then(function (value) {
                        observeData.isPending = false;
                        observeData.isResolved = true;
                        observeData.value = value;
                        observeData.state = 'resolved';
                        observeData.dispatch('state', [
                            'resolved',
                            'pending'
                        ]);
                    }, function (reason) {
                        observeData.isPending = false;
                        observeData.isRejected = true;
                        observeData.reason = reason;
                        observeData.state = 'rejected';
                        observeData.dispatch('state', [
                            'rejected',
                            'pending'
                        ]);
                    });
                }
                can.__observe(observeData, 'state');
                return prop.key in observeData ? observeData[prop.key] : value[prop.key];
            }
        },
        {
            name: 'object',
            test: function () {
                return true;
            },
            read: function (value, prop) {
                if (value == null) {
                    return undefined;
                } else {
                    if (prop.key in value) {
                        return value[prop.key];
                    } else if (prop.at && specialRead[prop.key] && '@' + prop.key in value) {
                        prop.at = false;
                        return value['@' + prop.key];
                    }
                }
            }
        }
    ];
    var specialRead = {
        index: true,
        key: true,
        event: true,
        element: true,
        viewModel: true
    };
    read.write = function (parent, key, value, options) {
        options = options || {};
        if (can.isMapLike(parent)) {
            if (!options.isArgument && parent._data && parent._data[key] && parent._data[key].isComputed) {
                return parent._data[key](value);
            } else {
                return parent.attr(key, value);
            }
        }
        if (parent[key] && parent[key].isComputed) {
            return parent[key](value);
        }
        if (typeof parent === 'object') {
            parent[key] = value;
        }
    };
    read.reads = function (key) {
        var keys = [];
        var last = 0;
        var at = false;
        if (key.charAt(0) === '@') {
            last = 1;
            at = true;
        }
        var keyToAdd = '';
        for (var i = last; i < key.length; i++) {
            var character = key.charAt(i);
            if (character === '.' || character === '@') {
                if (key.charAt(i - 1) !== '\\') {
                    keys.push({
                        key: keyToAdd,
                        at: at
                    });
                    at = character === '@';
                    keyToAdd = '';
                } else {
                    keyToAdd = keyToAdd.substr(0, keyToAdd.length - 1) + '.';
                }
            } else {
                keyToAdd += character;
            }
        }
        keys.push({
            key: keyToAdd,
            at: at
        });
        return keys;
    };
    return read;
});
/*ccompute@0.0.1#get_value_and_bind*/
define('ccompute/get_value_and_bind', function (require, exports, module) {
    var batch = require('ccompute/other/batch');
    exports.ObservedInfo = ObservedInfo;
    function ObservedInfo(func, context, compute) {
        this.newObserved = {};
        this.oldObserved = null;
        this.func = func;
        this.context = context;
        this.compute = compute;
        this.onDependencyChange = can.proxy(this.onDependencyChange, this);
        this.depth = null;
        this.childDepths = {};
        this.ignore = 0;
        this.inBatch = false;
        this.ready = false;
        compute.observedInfo = this;
        this.setReady = can.proxy(this._setReady, this);
    }
    can.simpleExtend(ObservedInfo.prototype, {
        _setReady: function () {
            this.ready = true;
        },
        getDepth: function () {
            if (this.depth !== null) {
                return this.depth;
            } else {
                return this.depth = this._getDepth();
            }
        },
        _getDepth: function () {
            var max = 0, childDepths = this.childDepths;
            for (var cid in childDepths) {
                if (childDepths[cid] > max) {
                    max = childDepths[cid];
                }
            }
            return max + 1;
        },
        addEdge: function (objEv) {
            objEv.obj.bind(objEv.event, this.onDependencyChange);
            if (objEv.obj.observedInfo) {
                this.childDepths[objEv.obj._cid] = objEv.obj.observedInfo.getDepth();
                this.depth = null;
            }
        },
        removeEdge: function (objEv) {
            objEv.obj.unbind(objEv.event, this.onDependencyChange);
            if (objEv.obj.observedInfo) {
                delete this.childDepths[objEv.obj._cid];
                this.depth = null;
            }
        },
        onDependencyChange: function (ev) {
            if (this.bound && this.ready) {
                if (ev.batchNum !== undefined) {
                    if (ev.batchNum !== this.batchNum) {
                        ObservedInfo.registerUpdate(this);
                        this.batchNum = ev.batchNum;
                    }
                } else {
                    this.updateCompute(ev.batchNum);
                }
            }
        },
        updateCompute: function (batchNum) {
            var oldValue = this.value;
            this.getValueAndBind();
            this.compute.updater(this.value, oldValue, batchNum);
        },
        getValueAndBind: function () {
            this.bound = true;
            this.oldObserved = this.newObserved || {};
            this.ignore = 0;
            this.newObserved = {};
            this.ready = false;
            observedInfoStack.push(this);
            this.value = this.func.call(this.context);
            observedInfoStack.pop();
            this.updateBindings();
            batch.afterPreviousEvents(this.setReady);
        },
        updateBindings: function () {
            var newObserved = this.newObserved, oldObserved = this.oldObserved, name, obEv;
            for (name in newObserved) {
                obEv = newObserved[name];
                if (!oldObserved[name]) {
                    this.addEdge(obEv);
                } else {
                    oldObserved[name] = null;
                }
            }
            for (name in oldObserved) {
                obEv = oldObserved[name];
                if (obEv) {
                    this.removeEdge(obEv);
                }
            }
        },
        teardown: function () {
            this.bound = false;
            for (var name in this.newObserved) {
                var ob = this.newObserved[name];
                this.removeEdge(ob);
            }
            this.newObserved = {};
        }
    });
    var updateOrder = [], curDepth = Infinity, maxDepth = 0;
    ObservedInfo.registerUpdate = function (observeInfo, batchNum) {
        var depth = observeInfo.getDepth() - 1;
        curDepth = Math.min(depth, curDepth);
        maxDepth = Math.max(maxDepth, depth);
        var objs = updateOrder[depth];
        if (!objs) {
            objs = updateOrder[depth] = [];
        }
        objs.push(observeInfo);
    };
    ObservedInfo.batchEnd = function (batchNum) {
        var cur;
        while (curDepth <= maxDepth) {
            var last = updateOrder[curDepth];
            if (last && (cur = last.pop())) {
                cur.updateCompute(batchNum);
            } else {
                curDepth++;
            }
        }
        updateOrder = [];
        curDepth = Infinity;
        maxDepth = 0;
    };
    var observedInfoStack = [];
    exports.__observe = function (obj, event) {
        var top = observedInfoStack[observedInfoStack.length - 1];
        if (top) {
            var evStr = event + '', name = obj._cid + '|' + evStr;
            if (top.traps) {
                top.traps.push({
                    obj: obj,
                    event: evStr,
                    name: name
                });
            } else if (!top.ignore && !top.newObserved[name]) {
                top.newObserved[name] = {
                    obj: obj,
                    event: evStr
                };
            }
        }
    };
    exports.__reading = exports.__observe;
    exports.__trapObserves = function () {
        if (observedInfoStack.length) {
            var top = observedInfoStack[observedInfoStack.length - 1];
            var traps = top.traps = [];
            return function () {
                top.traps = null;
                return traps;
            };
        } else {
            return function () {
                return [];
            };
        }
    };
    exports.__observes = function (observes) {
        var top = observedInfoStack[observedInfoStack.length - 1];
        if (top) {
            for (var i = 0, len = observes.length; i < len; i++) {
                var trap = observes[i], name = trap.name;
                if (!top.newObserved[name]) {
                    top.newObserved[name] = trap;
                }
            }
        }
    };
    exports.__isRecordingObserves = function () {
        var len = observedInfoStack.length;
        return len && observedInfoStack[len - 1].ignore === 0;
    };
    exports.__notObserve = function (fn) {
        return function () {
            if (observedInfoStack.length) {
                var top = observedInfoStack[observedInfoStack.length - 1];
                top.ignore++;
                var res = fn.apply(this, arguments);
                top.ignore--;
                return res;
            } else {
                return fn.apply(this, arguments);
            }
        };
    };
    batch._onDispatchedEvents = ObservedInfo.batchEnd;
});
/*ccompute@0.0.1#proto_compute*/
define('ccompute/proto_compute', function (require, exports, module) {
    var can = require('ccompute/util');
    var bbatch = require('ccompute/other/batch');
    var bbind = require('ccompute/other/bind');
    var eevent = require('ccompute/other/event');
    var read = require('ccompute/read');
    var getValueAndBind = require('ccompute/get_value_and_bind');
    var __notObserve = getValueAndBind.__notObserve;
    var __observe = getValueAndBind.__observe;
    var ObservedInfo = getValueAndBind.ObservedInfo;
    var extend = require('extend/index');
    var noop = function () {
    };
    can.__observe = getValueAndBind.__observe;
    var proxy = function (fn, context) {
        return fn.bind(context);
    };
    var Compute = function (getterSetter, context, eventName, bindOnce) {
        can.cid(this, 'compute');
        var args = [];
        for (var i = 0, arglen = arguments.length; i < arglen; i++) {
            args[i] = arguments[i];
        }
        var contextType = typeof args[1];
        if (typeof args[0] === 'function') {
            this._setupGetterSetterFn(args[0], args[1], args[2], args[3]);
        } else if (args[1]) {
            if (contextType === 'string') {
                this._setupProperty(args[0], args[1], args[2]);
            } else if (contextType === 'function') {
                this._setupSetter(args[0], args[1], args[2]);
            } else {
                if (args[1] && args[1].fn) {
                    this._setupAsyncCompute(args[0], args[1]);
                } else {
                    this._setupSettings(args[0], args[1]);
                }
            }
        } else {
            this._setupSimpleValue(args[0]);
        }
        this._args = args;
        this.isComputed = true;
    };
    extend(Compute.prototype, {
        _setupGetterSetterFn: function (getterSetter, context, eventName) {
            this._set = context ? proxy(getterSetter, context) : getterSetter;
            this._get = context ? proxy(getterSetter, context) : getterSetter;
            this._canObserve = eventName === false ? false : true;
            var handlers = setupComputeHandlers(this, getterSetter, context || this);
            this._on = handlers.on;
            this._off = handlers.off;
        },
        _setupProperty: function (target, propertyName, eventName) {
            var isObserve = can.isMapLike(target), self = this, handler;
            if (isObserve) {
                handler = function (ev, newVal, oldVal) {
                    self.updater(newVal, oldVal, ev.batchNum);
                };
                this.hasDependencies = true;
                this._get = function () {
                    return target.attr(propertyName);
                };
                this._set = function (val) {
                    target.attr(propertyName, val);
                };
            } else {
                handler = function () {
                    self.updater(self._get(), self.value);
                };
                this._get = function () {
                    return can.getObject(propertyName, [target]);
                };
                this._set = function (value) {
                    var properties = propertyName.split('.'), leafPropertyName = properties.pop(), targetProperty = can.getObject(properties.join('.'), [target]);
                    targetProperty[leafPropertyName] = value;
                };
            }
            this._on = function (update) {
                eevent.addEvent.call(target, eventName || propertyName, handler);
                this.value = this._get();
            };
            this._off = function () {
                return eevent.unbind.call(target, eventName || propertyName, handler);
            };
        },
        _setupSetter: function (initialValue, setter, eventName) {
            this.value = initialValue;
            this._set = setter;
            extend(this, eventName);
        },
        _setupSettings: function (initialValue, settings) {
            this.value = initialValue;
            this._set = settings.set || this._set;
            this._get = settings.get || this._get;
            if (!settings.__selfUpdater) {
                var self = this, oldUpdater = this.updater;
                this.updater = function () {
                    oldUpdater.call(self, self._get(), self.value);
                };
            }
            this._on = settings.on ? settings.on : this._on;
            this._off = settings.off ? settings.off : this._off;
        },
        _setupAsyncCompute: function (initialValue, settings) {
            var self = this;
            this.value = initialValue;
            this._setUpdates = true;
            this.lastSetValue = new Compute(initialValue);
            this._set = function (newVal) {
                if (newVal === self.lastSetValue.get()) {
                    return this.value;
                }
                return self.lastSetValue.set(newVal);
            };
            this._get = function () {
                return getter.call(settings.context, self.lastSetValue.get());
            };
            var getter = settings.fn, bindings;
            if (getter.length === 0) {
                bindings = setupComputeHandlers(this, getter, settings.context);
            } else if (getter.length === 1) {
                bindings = setupComputeHandlers(this, function () {
                    return getter.call(settings.context, self.lastSetValue.get());
                }, settings);
            } else {
                var oldUpdater = this.updater, setValue = function (newVal) {
                        oldUpdater.call(self, newVal, self.value);
                    };
                this.updater = function (newVal) {
                    oldUpdater.call(self, newVal, self.value);
                };
                bindings = setupComputeHandlers(this, function () {
                    var res = getter.call(settings.context, self.lastSetValue.get(), setValue);
                    return res !== undefined ? res : this.value;
                }, this);
            }
            this._on = bindings.on;
            this._off = bindings.off;
        },
        _setupSimpleValue: function (initialValue) {
            this.value = initialValue;
        },
        _bindsetup: __notObserve(function () {
            this.bound = true;
            this._on(this.updater);
        }),
        _bindteardown: function () {
            this._off(this.updater);
            this.bound = false;
        },
        bind: bbind.bindAndSetup,
        unbind: bbind.unbindAndTeardown,
        clone: function (context) {
            if (context && typeof this._args[0] === 'function') {
                this._args[1] = context;
            } else if (context) {
                this._args[2] = context;
            }
            return new Compute(this._args[0], this._args[1], this._args[2], this._args[3]);
        },
        _on: function () {
        },
        _off: function () {
        },
        get: function () {
            if (getValueAndBind.__isRecordingObserves() && this._canObserve !== false) {
                __observe(this, 'change');
                if (!this.bound) {
                    Compute.temporarilyBind(this);
                }
            }
            if (this.bound) {
                return this.value;
            } else {
                return this._get();
            }
        },
        _get: function () {
            return this.value;
        },
        set: function (newVal) {
            var old = this.value;
            var setVal = this._set(newVal, old);
            if (this._setUpdates) {
                return this.value;
            }
            if (this.hasDependencies) {
                return this._get();
            }
            if (setVal === undefined) {
                this.value = this._get();
            } else {
                this.value = setVal;
            }
            updateOnChange(this, this.value, old);
            return this.value;
        },
        _set: function (newVal) {
            return this.value = newVal;
        },
        updater: function (newVal, oldVal, batchNum) {
            this.value = newVal;
            updateOnChange(this, newVal, oldVal, batchNum);
        },
        toFunction: function () {
            return proxy(this._computeFn, this);
        },
        _computeFn: function (newVal) {
            if (arguments.length) {
                return this.set(newVal);
            }
            return this.get();
        }
    });
    var updateOnChange = function (compute, newValue, oldValue, batchNum) {
        var valueChanged = newValue !== oldValue && !(newValue !== newValue && oldValue !== oldValue);
        if (valueChanged) {
            bbatch.trigger(compute, {
                type: 'change',
                batchNum: batchNum
            }, [
                newValue,
                oldValue
            ]);
        }
    };
    var setupComputeHandlers = function (compute, func, context) {
        var readInfo = new ObservedInfo(func, context, compute);
        return {
            on: function () {
                readInfo.getValueAndBind();
                compute.value = readInfo.value;
                compute.hasDependencies = !can.isEmptyObject(readInfo.newObserved);
            },
            off: function () {
                readInfo.teardown();
            }
        };
    };
    Compute.temporarilyBind = function (compute) {
        var computeInstance = compute.computeInstance || compute;
        computeInstance.bind('change', noop);
        if (!computes) {
            computes = [];
            setTimeout(unbindComputes, 10);
        }
        computes.push(computeInstance);
    };
    var computes, unbindComputes = function () {
            for (var i = 0, len = computes.length; i < len; i++) {
                computes[i].unbind('change', noop);
            }
            computes = null;
        };
    Compute.async = function (initialValue, asyncComputer, context) {
        return new Compute(initialValue, {
            fn: asyncComputer,
            context: context
        });
    };
    Compute.truthy = function (compute) {
        return new Compute(function () {
            var res = compute.get();
            if (typeof res === 'function') {
                res = res.get();
            }
            return !!res;
        });
    };
    Compute.read = read;
    Compute.set = read.write;
    module.exports = Compute;
});
/*ccompute@0.0.1#compute*/
define('ccompute/compute', function (require, exports, module) {
    var can = require('ccompute/util');
    var Compute = require('ccompute/proto_compute');
    can.Compute = Compute;
    can.compute = exports.compute = function (getterSetter, context, eventName, bindOnce) {
        var internalCompute = new Compute(getterSetter, context, eventName, bindOnce);
        var bind = internalCompute.bind;
        var unbind = internalCompute.unbind;
        var compute = function (val) {
            if (arguments.length) {
                return internalCompute.set(val);
            }
            return internalCompute.get();
        };
        var cid = can.cid(compute, 'compute');
        var handlerKey = '__handler' + cid;
        compute.bind = function (ev, handler) {
            var computeHandler = handler && handler[handlerKey];
            if (handler && !computeHandler) {
                computeHandler = handler[handlerKey] = function () {
                    handler.apply(compute, arguments);
                };
            }
            return bind.call(internalCompute, ev, computeHandler);
        };
        compute.unbind = function (ev, handler) {
            var computeHandler = handler && handler[handlerKey];
            if (computeHandler) {
                delete handler[handlerKey];
                return internalCompute.unbind(ev, computeHandler);
            }
            return unbind.apply(internalCompute, arguments);
        };
        compute.isComputed = internalCompute.isComputed;
        compute.clone = function (ctx) {
            if (typeof getterSetter === 'function') {
                context = ctx;
            }
            return exports.compute(getterSetter, context, ctx, bindOnce);
        };
        compute.computeInstance = internalCompute;
        return compute;
    };
    exports.compute.truthy = function (compute) {
        return exports.compute(function () {
            var res = compute();
            if (typeof res === 'function') {
                res = res();
            }
            return !!res;
        });
    };
    exports.compute.async = function (initialValue, asyncComputer, context) {
        return exports.compute(initialValue, {
            fn: asyncComputer,
            context: context
        });
    };
    exports.compute.read = Compute.read;
    exports.compute.set = Compute.set;
    exports.compute.temporarilyBind = Compute.temporarilyBind;
    can.compute = module.exports = exports.compute;
});
/*[global-shim-end]*/
(function (){
	window._define = window.define;
	window.define = window.define.orig;
})();
var ccompute = can.compute;

var Bram = {};

var INTERNAL_PROPS = Bram.internalProps = typeof Symbol === "function" ?
  Symbol("[[Computes]]") : "[[Computes]]";

function setupProps(obj, props) {
  props.forEach(function (prop){
    Object.defineProperty(obj, prop, {
      get: function(){
        return getProps(this)[prop]();
      },
      set: function(val){
        getProps(this)[prop](val);
      }
    });
  });
}

function ensureProp(el, name) {
  if(!getProps(el))
    defineProps(el);
  if(!getProps(el)[name])
    getProps(el)[name] = ccompute();
}

function defineProps(obj) {
  Object.defineProperty(obj, INTERNAL_PROPS, {
    enumerable: false, writable: false, configurable: false,
    value: {}
  });
}

function getProps(obj) {
  return obj[INTERNAL_PROPS];
}

var forEach = Array.prototype.forEach;

Bram.element = function(defn){
  var parentProto = defn.extends ? defn.extends.prototype :
    HTMLDivElement.prototype;

  var proto = Object.create(parentProto);

  var protoFunctions = defn.proto || defn.prototype || {};
  Object.keys(protoFunctions).forEach(function(key){
    var desc = Object.getOwnPropertyDescriptor(protoFunctions, key);
    if(typeof desc.value === "function" || desc.get) {
      Object.defineProperty(proto, key, desc);
    }
  });

  if(defn.props) {
    setupProps(proto, defn.props);
  }

  proto.createdCallback = function(){
    if(defn.props) {
      if(!getProps(this)) defineProps(this);
      defn.props.forEach(function(name){
        if(!getProps(this)[name])
          getProps(this)[name] = ccompute();
      }.bind(this));
    }

    if(defn.template) {
      var t = document.querySelector(defn.template);
      var clone = document.importNode(t.content, true);

      var root = (defn.useShadow !== false && this.createShadowRoot) ?
        this.createShadowRoot() : this;
      root.appendChild(clone);

      if(defn.created) {
        this._bindings = new Bind(this, root);
        defn.created.call(this, this._bindings, root);
      }
    }
  };

  if(defn.attr) {
    proto.attributeChangedCallback = defn.attr;
  }

  proto.detachedCallback = function(){
    if(this._bindings)
      this._bindings._unbind();
  };

  return document.registerElement(defn.tag, {
    prototype: proto
  });
};

Bram.getOwnCompute = function(el, name){
  var props = getProps(el);
  return props ? props[name] : undefined;
};

Bram.observableToCompute = function(observable){
  var compute = ccompute();
  observable.subscribe(function(val){
    compute(val);
  });
  return compute;
};

Bram.compute = function(){
  return ccompute.apply(can, arguments);
};

function createStateProperty(obj, name){
  var desc = Object.getOwnPropertyDescriptor(obj, name);
  var compute;
  if(desc && desc.value) {
    compute = ccompute(desc.value);
  } else {
    compute = ccompute();
  }
  getProps(obj)[name] = compute;

  Object.defineProperty(obj, name, {
    get: function(){
      return getProps(this)[name]();
    },
    set: function(val){
      getProps(this)[name](val);
    }
  });
}

Bram.state = function(obj){
  var keys = Object.keys(obj);
  defineProps(obj);
  keys.forEach(function(key){
    createStateProperty(obj, key);
  });
  return obj;
};

function Bind(el, shadow){
  this.el = el;
  this.shadow = shadow;
  this._callbacks = [];
}

Bind.prototype._getElement = function(selector, root){
  root = root || this.shadow;
  return typeof selector === "string" ? root.querySelector(selector) : selector;
};

Bind.prototype._getCompute = function(prop){
  if(typeof prop !== "string") return prop;
  var el = this.el;

  var compute = Bram.getOwnCompute(el, prop);
  if(compute) {
    return compute;
  }

  var proto = Object.getPrototypeOf(el);
  var desc = Object.getOwnPropertyDescriptor(proto, prop);
  if(desc.get) {
    compute = ccompute(desc.get, el);
  } else {
    compute = desc.value;
  }
  return compute;
};

Bind.prototype._register = function(callback){
  this._callbacks.push(callback);
};

Bind.prototype._unbind = function(){
  this._callbacks.forEach(function(callback){
    callback();
  });
  this._callbacks = [];
};

Bind.prototype._setup = function(selector, prop, setter){
  var el = this._getElement(selector);
  var compute = this._getCompute(prop);
  var fn = function(){
    setter(el, compute);
  };

  compute.bind("change", fn);
  this._register(function(){
    compute.unbind("change", fn);
  });
  fn();

};

Bind.prototype.text = function(prop, selector){
  this._setup(selector, prop, function(el, compute){
    el.textContent = compute();
  });
};

Bind.prototype.attr = function(prop, selector, attrName){
  this._setup(selector, prop, function(el, compute){
    el.setAttribute(attrName, compute());
  });
};

Bind.prototype.form = function(prop, selector, event){
  event = event || "change";
  var el = this._getElement(selector);
  var compute = this._getCompute(prop);

  var setForm = function(){
    el.value = compute();
  };
  var setCompute = function(){
    compute(el.value);
  };

  el.addEventListener(event, setCompute);
  compute.bind("change", setForm);

  this._register(function(){
    el.removeEventListener(event, setCompute);
    compute.unbind("change", setForm);
  });

  if(compute()) {
    setForm();
  } else if(el.value) {
    setCompute();
  }
};

Bind.prototype.prop = function(prop, selector, name, observable){
  var nameType = typeof name;
  if(nameType === "object") {
    observable = name;
    name = prop;
  } else if(nameType === "function") {
    var nn = prop;
    prop = name;
    name = nn;
  }

  name = name || prop;
  var compute = this._getCompute(prop);
  var el = this._getElement(selector, this.el);

  ensureProp(el, name);
  ensureProp(this.el, name);

  var child = getProps(el)[name];
  var parent = compute;

  // If we are binding an observable
  if(observable) {
    parent = Bram.observableToCompute(observable);
  }

  var childToParent = function(ev, val){
    parent(child());
  };
  var parentToChild = function(ev, val){
    child(parent());
  };

  child.bind("change", childToParent);
  parent.bind("change", parentToChild);

  if(parent()) {
    parentToChild();
  } else if(child()) {
    childToParent();
  }

  this._register(function(){
    child.unbind("change", childToParent);
    parent.unbind("change", parentToChild);
  });
};

Bind.prototype.cond = function(prop, selector){
  var el = this._getElement(selector);
  var compute = this._getCompute(prop);
  var parent = el.parentNode;
  var ref = el.nextSibling;

  var position = function(){
    var inDom = !!el.parentNode;
    var show = compute();

    if(show) {
      if(!inDom) {
        if(parent !== ref.parentNode) {
          parent = ref.parentNode;
        }

        parent.insertBefore(el, ref);
      }
    } else {
      if(inDom) {
        ref = el.nextSibling;
        parent = el.parentNode;
        parent.removeChild(el);
      }
    }
  };

  compute.bind("change", position);

  this._register(function(){
    compute.unbind("change", position);
  });

  position();
};

Bind.prototype.each = function(list, selector, callback){
  var t = this._getElement(selector);

  var frag = document.createDocumentFragment();
  forEach.call(list, function(item, i){
    var clone = document.importNode(t.content, true);
    //var bindings = new Bind(this.el, clone);
    callback.call(this.el, clone, item, i);

   /* this._register(function(){
      bindings._unbind();
    });*/
    frag.appendChild(clone);
  }.bind(this));

  var parent = t.parentNode;
  if(t.nextSibling)
    parent.insertBefore(frag, t.nextSibling);
  else
    parent.appendChild(frag);
};

if(typeof module !== "undefined" && module.exports) {
  module.exports = Bram;
} else {
  window.Bram = Bram;
}

})();

var OS_NAME = 'sessions',
    DB_NAME = 'atwork',
    DB_VERSION = 1.2;

var indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.msIndexedDB;
var IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction;
var IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange;

function openDB(callback, context) {
  var req = indexedDB.open(DB_NAME, DB_VERSION);

  req.onerror = function(e) {
    console.log(e);
    callback(null);
  };

  req.onupgradeneeded = function(e) {
    var db = e.target.result;
    if(!db.objectStoreNames.contains(OS_NAME))
      var os = db.createObjectStore(OS_NAME, { keyPath: "id" });
  };

  req.onsuccess = function(e) {
    var db = e.target.result;

    console.log('Version: ' + db.version + ', DB_VERSION: ' + DB_VERSION);
    if(db.setVersion && db.version != DB_VERSION) {
      var verReq = db.setVersion(DB_VERSION);
      verReq.onfailure = req.onerror;
      verReq.onsuccess = function() {
        req.onupgradeneeded(e);
        openDB(callback, context);
      };

      return;
    }

    var func = context
      ? callback.bind(context)
      : callback;
    func(db);
  };
}

function extend(parent, proto, notAConstructor) {
  var toExtend = notAConstructor === true ? parent : parent.prototype;
  var base = Object.create(toExtend);

  Object.keys(proto).forEach(function(key) {
    base[key] = proto[key];
  });

  return base;
}

var visibility = {
  show: function(elem) {
    elem.style.display = elem._oldDisplay || 'block';
    elem._oldDisplay = undefined;
  },

  hide: function(elem) {
    elem._oldDisplay = elem.style.display;
    elem.style.display = 'none';
  },

  isShowing: function(elem) {
    return elem.style.display !== 'none';
  }
};

function TimeSpan(ms) {
  if(ms) {
    this.totalmilliseconds = ms;
    this.seconds = Math.floor(ms/1000) % 60;
    this.minutes = Math.floor(ms/60000) % 60;
    this.hours = Math.floor(ms/3600000) % 24;
  }
}

TimeSpan.prototype = {
  totalmilliseconds: 0,
  seconds: 0,
  minutes: 0,
  hours: 0,
  add: function(other) {
    other = typeof other === "number" ? other : other.totalmilliseconds;
    var ms = this.totalmilliseconds + other;
    return new TimeSpan(ms);
  },
  toString: function() {
    var str = "", self = this;
    [this.hours, this.minutes, this.seconds].forEach(function(num) {
      str += self._zeroFill(num,2) + ":";
    });
    return str.substr(0,str.length - 1);
  },
  _zeroFill: function(num,width) {
    width -= num.toString().length;
    if(width > 0)
      return new Array(width + (/\./.test(num) ? 2 : 1)).join('0') + num;
    
    return num;
  }

};

function Timer() {
  this.time = new TimeSpan();
}

Timer.prototype = {
  resume: function() {
    this.running = true;
  },

  running: false,
  start: function() {
    this.running = true;
    this.begin = new Date();  
  },

  stop: function() {
    this.running = false;
    this.time = this.elapsed;
  },

  get elapsed() {
    if(!this.begin)
      return undefined;

    var now = new Date();
    var ms = now - this.begin;
    return this.time.add(ms);
  }
};

function Listener() {
  this.listeners = [];
}

Listener.prototype.addListener = function(listener) {
  this.listeners.push(listener);
};

Listener.prototype.unload = function(){
  this.listeners.forEach(function(listener){
    listener.unload();
  });
  this.listeners = [];
};

var transPerm = {
  READ: 'readonly',
  WRITE: 'readwrite'
};

function Session(times) {
  this.times = times || [];
}

Session.prototype = {
  get totalmilliseconds () {
    var ms = 0;
    this.times.forEach(function(time) {
      ms += time.totalmilliseconds;
    });

    return ms;
  },

  get time () {
    if(this._time)
      return this._time;

    this._time = new TimeSpan(this.totalmilliseconds);
    return this._time;
  },

  id: 0,

  save: function() {
    var now = new Date();
    this.id = now.getTime();

    openDB(function(db) {
      var trans = db.transaction([OS_NAME], transPerm.WRITE);

      trans.onerror = function(e) {
        console.log(e);
      };

      var os = trans.objectStore(OS_NAME);
      var req = os.put(this);
      req.onsuccess = function(e) {
        console.log('Save successful.');
      };
      req.onerror = function(e) {
        console.log(e);
      };
    }, this);
  },

  destroy: function() {
    var self = this;

    return new Promise(function(resolve, reject) {
      openDB(function(db) {
        var trans = db.transaction([OS_NAME], transPerm.WRITE);

        trans.onerror = function(e) {
          console.error(e);
        };

        var os = trans.objectStore(OS_NAME);
        var req = os.delete(this.id);
        req.onsuccess = function() {
          console.log('Deleted', self.id);
          resolve();
        };
        req.onerror = function(e) {
          console.error(e);
          reject(e);
        };
      }, self);
    });
  }
};

Session.getAll = function(callback) {
  openDB(function(db) {
    var sessions = [];

    var trans = db.transaction([OS_NAME], transPerm.READ);
    trans.onerror = function(e) {
      console.log(e);
    };

    var os = trans.objectStore(OS_NAME);
    var keyRange = IDBKeyRange.lowerBound(0);

    var req = os.openCursor(keyRange);
    req.onerror = function(e) {
      console.error(e);
    };

    req.onsuccess = function(e) {
      var cursor = e.target.result;
      if(!cursor) {
        callback(sessions);
        return;
      }

      var session = Session.create(cursor.value);

      sessions.push(session);
      cursor.continue();
    };
  });
};

Session.getAllP = function() {
  return new Promise(function(resolve) {
    Session.getAll(resolve);
  });
};

Session.create = function(obj) {
  var session = new Session();
  session.id = obj.id;
  session.beginDate = obj.beginDate;
  obj.times.forEach(function(timeData) {
    var time = new TimeSpan(timeData.totalmilliseconds);
    session.times.push(time);
  });

  return session;
};

Session.findById = function(sessions, id) {
  return sessions.filter(function(session){
    return session.id === id;
  })[0];
};

function Button(elem) {
  this.elem = elem;
}

Button.prototype = {
  listen: function() {
    this.elem.addEventListener('click', this);
    return this;
  },

  unload: function() {
    this.elem.removeEventListener('click', this);
    return this;
  },

  down: function() { },
  up: function() { },

  handleEvent: function(e) {
    switch(e.type) {
      case 'touchstart':
      case 'mousedown':
        this.down(e);
        break;
      case 'touchend':
      case 'mouseup':
      case 'click':
        this.up(e);
        break;
    }

    //e.preventDefault();
  }
};

function Work() {
  this.elem = document.getElementById('work');
}

Work.prototype = extend(Button, {
  up: withMainPage(function(fromEvent) {
    WorkPage.show();

    if(fromEvent === true) {
      this.elem.show();
    }
  })
});

function Log() {
  this.elem = document.getElementById('log');
}

Log.prototype = extend(Button, {
  up: withMainPage(function(fromEvent) {
    WorkPage.pause();
    WorkPage.unload();

    SessionList.show();

    if(fromEvent === true) {
      this.elem.show();
    }
  })
});

Bram.element({
  tag: "work-page",
  template: "#work-template",
  useShadow: false,

  created: function(bind, shadow){
    debugger;
    this.inited ? this.resume() : this.init(shadow);
  },

  proto: {
    init: function(shadow) {
      this.elem = shadow.querySelector('#current-time');

      if(!this.timer)
        this.timer = new Timer();

      this.start = new Start();
      this.start.listen();

      this.complete = new Complete();
      this.complete.listen();

      if(localStorage['enabled'] === 'true') {
        this.restore();
      }

      this.inited = true;
    },

    get cachedBeginDate () {
      var cached = localStorage['begin'];
      if(cached === null)
        return undefined;

      var begin = new Date(cached);
      return begin;
    },

    pause: function() {
      clearInterval(this.id);
    },

    reset: function() {
      this.timer = new Timer();

      localStorage['enabled'] = false;
      localStorage['running'] = false;
      localStorage['time'] = null;
      delete localStorage['begin'];

      this.elem.textContent = null;
    },

    restore: function() {
      var running = localStorage['running'] === 'true';

      var state = JSON.parse(localStorage['prev']);
      if(!state)
        return;

      var time = this.timer.time;
      time.totalmilliseconds = state.totalmilliseconds || 0;
      time.hours = state.hours || 0;
      time.minutes = state.minutes || 0;
      time.seconds = state.seconds || 0;

      if(running) {
        this.timer.begin = this.cachedBeginDate;
        this.timer.resume();
        this.elem.textContent = this.timer.elapsed.toString();
        this.startTimer();
        this.start.start();
      } else {
        this.elem.textContent = time.toString();
      }
    },

    resume: function() {
      this.elem = document.getElementById('current-time');

      this.start = new Start();
      this.start.listen();

      this.complete = new Complete();
      this.complete.listen();

      if(typeof this.timer.elapsed !== "undefined") {
        if(this.timer.running) {
          this.elem.textContent  = this.timer.elapsed.toString();
          this.start.start();
          this.startTimer();
        } else {
          this.elem.textContent = this.timer.time.toString();
        }
      }
    },

    saveSession: function() {
      var time = this.timer.time;
      var session = new Session([time]);
      session.beginDate = this.cachedBeginDate;

      session.save();
      SessionList.add(session);
      this.reset();
    },

    saveState: function(ts) {
      localStorage['enabled'] = this.timer.running;
      var strTime = JSON.stringify(ts);
      localStorage['time'] = strTime;
      localStorage['prev'] = JSON.stringify(this.timer.time);
    },

    startPressed: function() {
      if(this.timer.running) {
        this.timer.stop();
        this.start.stop();
        this.pause();

        localStorage['running'] = false;
        localStorage['prev'] = localStorage['time'];
        return;
      }

      this.timer.start();
      this.start.start();
      this.startTimer();
      localStorage['running'] = true;
      localStorage['begin'] = (new Date()).toJSON();
    },

    startTimer: function() {
      this.id = setInterval(this.update.bind(this), 500);
    },

    unload: function() {
      this.start.unload();
      this.complete.unload();
    },

    update: function() {
      var ts = this.timer.elapsed;

      this.elem.textContent = ts.toString();
      this.saveState(ts);
    }


  }
});

var WorkPage = {
  init: function() {
    this.base = document.getElementById('work-content');
    this.elem = document.getElementById('current-time');

    if(!this.timer)
      this.timer = new Timer();

    this.start = new Start();
    this.start.listen();

    this.complete = new Complete();
    this.complete.listen();

    if(localStorage['enabled'] === 'true') {
      this.restore();
    }

    this.inited = true;
  },

  get cachedBeginDate () {
    var cached = localStorage['begin'];
    if(cached === null)
      return undefined;

    var begin = new Date(cached);
    return begin;
  },

  pause: function() {
    clearInterval(this.id);
  },

  reset: function() {
    this.timer = new Timer();

    localStorage['enabled'] = false;
    localStorage['running'] = false;
    localStorage['time'] = null;
    delete localStorage['begin'];

    this.elem.textContent = null;
  },

  restore: function() {
    var running = localStorage['running'] === 'true';

    var state = JSON.parse(localStorage['prev']);
    if(!state)
      return;

    var time = this.timer.time;
    time.totalmilliseconds = state.totalmilliseconds || 0;
    time.hours = state.hours || 0;
    time.minutes = state.minutes || 0;
    time.seconds = state.seconds || 0;

    if(running) {
      this.timer.begin = this.cachedBeginDate;
      this.timer.resume();
      this.elem.textContent = this.timer.elapsed.toString();
      this.startTimer();
      this.start.start();
    } else {
      this.elem.textContent = time.toString();
    }
  },

  resume: function() {
    this.elem = document.getElementById('current-time');

    this.start = new Start();
    this.start.listen();

    this.complete = new Complete();
    this.complete.listen();

    if(typeof this.timer.elapsed !== "undefined") {
      if(this.timer.running) {
        this.elem.textContent  = this.timer.elapsed.toString();
        this.start.start();
        this.startTimer();
      } else {
        this.elem.textContent = this.timer.time.toString();
      }
    }
  },

  saveSession: function() {
    var time = this.timer.time;
    var session = new Session([time]);
    session.beginDate = this.cachedBeginDate;

    session.save();
    SessionList.add(session);
    this.reset();
  },

  saveState: function(ts) {
    localStorage['enabled'] = this.timer.running;
    var strTime = JSON.stringify(ts);
    localStorage['time'] = strTime;
    localStorage['prev'] = JSON.stringify(this.timer.time);
  },

  startPressed: function() {
    if(this.timer.running) {
      this.timer.stop();
      this.start.stop();
      this.pause();

      localStorage['running'] = false;
      localStorage['prev'] = localStorage['time'];
      return;
    }

    this.timer.start();
    this.start.start();
    this.startTimer();
    localStorage['running'] = true;
    localStorage['begin'] = (new Date()).toJSON();
  },

  startTimer: function() {
    this.id = setInterval(this.update.bind(this), 500);
  },

  show: function() {
    var base = this.base;
    base.innerHTML = '';

    var t = document.getElementById('work-template');
    var clone = document.importNode(t.content, true);

    base.appendChild(clone);
    this.inited ? this.resume() : this.init();
  },

  unload: function() {
    this.start.unload();
    this.complete.unload();
  },

  update: function() {
    var ts = this.timer.elapsed;

    this.elem.textContent = ts.toString();
    this.saveState(ts);
  }
};

var state = Bram.state({
  page: "main"
});

Bram.element({
  tag: "main-page",
  template: "#main-template",
  useShadow: false,

  created: function(bind, shadow){
    componentHandler.upgradeElements(shadow.childNodes);

    this.log = new Log().listen();
    this.mdlUpgraded().then(work => work.show())
  },

  proto: {
    mdlUpgraded: function() {
      if(this._mdlUpgradePromise) return this.mdlUpgradePromise;
      return this._mdlPromise = new Promise(function(resolve){
        var work = document.getElementById("work");
        work.addEventListener("mdl-componentupgraded", function onupgrade(){
          work.removeEventListener("mdl-componentupgraded", onupgrade);
          resolve(work);
        });
      });
    }
  }

});

var MainPage = {
  init: function() {
    this.base = document.getElementsByTagName('main')[0];

    this.mainDom = {
      'fixed-tab-1': true,
      'fixed-tab-2': true
    };

    /*WorkPage.init();
    SessionList.init();
    SessionPage.init();
    DrawerButton.init();
    this.work = new Work();
    this.work.listen();

    this.log = new Log();
    this.log.listen();*/
  },

  show: function() {
    debugger;
    visibility.show(mainTabs());

    var base = this.base;
    var mainDom = this.mainDom;

    this.childEach(function(elem) {
      if(elem instanceof HTMLElement) {
        if(mainDom[elem.id]) {
          visibility.show(elem);
        } else {
          base.removeChild(elem);
        }
      }
    });
  },

  hide: function() {
    var base = this.base;
    var mainDom = this.mainDom;
    visibility.hide(mainTabs());

    this.childEach(function(elem){
      if(elem instanceof HTMLElement) {
        if(mainDom[elem.id]) {
          visibility.hide(elem);
        }
      }
    });
  },

  childEach: function(callback) {
    var elems = [].slice.call(this.base.childNodes);
    elems.forEach(callback);
  },

  isShowing: function() {
    var tabs = mainTabs();
    return visibility.isShowing(tabs);
  }
};

var monthNames = [
  'January', 'February', 'March',
  'April', 'May', 'June', 'July',
  'August', 'September', 'October',
  'November', 'December'
];

function getMonthName(date, short) {
  var mn = monthNames[date.getMonth()];
  return short ? mn.substr(0, 3) : mn;
}

var SessionList = {
  init: function() {
    this.sessions = [];
    this.base = document.getElementById('log-content');
    this.listeners = [];

    Session.getAll(this.got.bind(this));
  },

  unload: function() {
    this.listeners.forEach(function(button) { button.unload(); });
    this.listeners = [];
    SessionListActions.unload();
  },

  got: function(sessions) {
    this.sessions = sessions;
  },

  add: function(session) {
    this.sessions.push(session);
  },

  itemsSelected: function(){
    var base = this.base;
    var checks = base.querySelectorAll('.sessionlist-item input');
    var selected = [].some.call(checks, function(elem) {
      return !!elem.checked;
    });

    if(selected) {
      // TODO show the buttons
      SessionListActions.show();
    } else {
      // Don't show the buttons
      SessionListActions.unload();
    }
  },

  show: function() {
    var base = this.base;
    base.innerHTML = '';

    var ul = document.createElement('ul');
    ul.className = 'sessions';

    var t = document.getElementById('session-template');

    this.sessions.forEach(function(session){
      var clone = document.importNode(t.content, true);
      var li = clone.querySelector('li');
      li.id = session.id;
      this.listeners.push(new ListSessionButton(li, session).listen());

      var inputId = 'cb-' + session.id;
      var label = li.querySelector('label');
      label.setAttribute('for', inputId);
      this.listeners.push(new SessionCheckbox(label, this).listen());

      var input = li.querySelector('label input');
      input.id = inputId;
      input.dataset.id = session.id;
      componentHandler.upgradeElement(label);

      var date = session.beginDate;
      var left = clone.querySelector('.date');
      left.textContent = getMonthName(date, true)
        + ' ' + date.getDate();

      var right = clone.querySelector('.time');
      right.textContent = session.time.toString();

      ul.appendChild(clone);
    }.bind(this));

    base.appendChild(ul);

    Navigator.save({page:'log'}, null, "/log");
  }
};

var SessionPage = {
  init: function() {
    this.base = document.getElementsByTagName('main')[0];
  },

  show: function(session) {
    var base = this.base;

    var t = document.getElementById('sessionpage-template');
    var clone = document.importNode(t.content, true);

    var date = session.beginDate;
    clone.querySelector('.date').textContent = getMonthName(date) +
      ' ' + date.getDate();

    clone.querySelector('.time').textContent = session.time.toString();

    base.appendChild(clone);

    Navigator.save({page:'session'}, null, "/session/" + session.id);
  }
};

function ListSessionButton(elem, session){
  this.elem = elem;
  this.session = session;
}

ListSessionButton.prototype = extend(Button, {
  up: function(){
    MainPage.hide();
    SessionList.unload();
    SessionPage.show(this.session);
    DrawerButton.back();
  }
});

function SessionCheckbox(elem, SessionList) {
  this.elem = elem;
  this.SessionList = SessionList;
}

SessionCheckbox.prototype = extend(Button, {
  up: function(ev){
    ev.stopPropagation();

    SessionList.itemsSelected(ev);
  }
});

// TODO not sure what this will do, but this is action items.
var Actions = extend(Listener, {
  init: function() {
    Listener.call(this);
  },

  upgrade: function(elem){
    var buttons = elem.querySelectorAll('button') || [];
    [].forEach(function(button){
      componentHandler.upgradeElement(button);
    });
  }
});

function getSelectedSessions() {
    var base = SessionList.base;
    var checks = base.querySelectorAll('.sessionlist-item input');
    var selected = [].filter.call(checks, function(elem){
      return !!elem.checked;
    }).reduce(function(s, elem) {
      s[elem.dataset.id] = true;
      return s;
    }, {});

    var sessions = SessionList.sessions.filter(function(session){
      return !!selected[session.id];
    });

    return sessions;
}

function MergeSessionsButton(elem) {
  this.elem = elem;
}

MergeSessionsButton.prototype = extend(Button, {
  up: function(){
    this.mergeSessions();
  },

  mergeSessions: function() {
    var sessions = getSelectedSessions();

    // TODO sessions is an Array of Session objects. Merge them some how.
  }
});

function DeleteSessionsButton(elem) {
  this.elem = elem;
}

DeleteSessionsButton.prototype = extend(Button, {
  up: function() {
    this.deleteSessions()
      .then(function() {
        return Session.getAllP();
      })
      .then(function(sessions){
        SessionList.unload();
        SessionList.got(sessions);
        SessionList.show();
      });
  },

  deleteSessions: function() {
    var sessions = getSelectedSessions();
    var promises = sessions.map(function(session) {
      return session.destroy();
    });
    return Promise.all(promises);
  }
});

var SessionListActions = extend(Actions, {

  init: function() {
    if(this.inited) return;
    Actions.init.call(this);
    this.base = document.getElementById('actionbar');
    this.inited = true;
  },

  show: function(session) {
    if(this.showing) return;
    if(!this.inited) this.init();

    var base = this.base;
    base.innerHTML = '';

    var t = document.getElementById('sessionlistaction-template');
    var clone = document.importNode(t.content, true);

    this.addListener(
      new MergeSessionsButton(
        clone.getElementById('mergesession-button')).listen()
    );

    this.addListener(
      new DeleteSessionsButton(
        clone.getElementById('deletesession-button')).listen()
    );

    this.upgrade(clone);
    base.appendChild(clone);
    this.showing = true;
  },

  unload: function() {
    if(!this.inited) return;

    Actions.unload.call(this);
    this.base.innerHTML = '';
    this.showing = false;
  }

}, true);

function Start() {
  this.elem = document.getElementsByName('start')[0];
}

Start.prototype = extend(Button, {
  down: function() {
    this.elem.className += ' clicked';
  },

  setBtnText: function(text) {
    this.elem.textContent = text;
  },

  start: function() {
    this.setBtnText("Stop");
    this.elem.classList.add('started');
  },

  stop: function() {
    this.setBtnText("Start");
    this.elem.classList.remove('started');
  },

  up: function() {
    //this.elem.className = this.elem.className.replace(' clicked', '');
    //this.elem.classList.remove('clicked');
    WorkPage.startPressed();
  }
});

function Complete() {
  this.elem = document.getElementsByName('end')[0];
}

Complete.prototype = extend(Button, {
  down: function() {
    this.elem.classList.add('clicked');
  },

  up: function() {
    this.elem.classList.remove('clicked');
    WorkPage.saveSession();
  }
});

function mainTabs(){
  return document.getElementById('main-tabs').parentNode;
}

function withMainPage(callback) {
  return function(){
    if(!MainPage.isShowing()) {
      MainPage.show();
    }

    return callback.apply(this, arguments);
  };
}

var DrawerButton = {
  init: function() {
    this.base = document.querySelector('.mdl-layout__drawer-button');
  },

  drawer: function() {
    this.setIcon('menu');
    this.base.removeEventListener('click', this);
  },

  back: function() {
    this.setIcon('arrow_back');
    this.base.addEventListener('click', this, true);
  },

  handleEvent: function(e) {
    switch(e.type) {
      case 'click':
        e.stopPropagation();
        history.back();
        break;
    }
  },

  setIcon: function(txt) {
    this.base.querySelector('i').textContent = txt;
    componentHandler.upgradeElement(this.base);
  }
};

var Navigator = {
  go: function(state){
    var page = state.page;
    switch(page) {
      case 'work':
        MainPage.work.up(true);
        break;
      case 'log':
        MainPage.log.up(true);
        break;
    }
  },

  save: function(state, title, url){
    var currentState = history.state || {};
    if(state.page !== currentState.page) {
      history.pushState(state, title, url);
    }
  }
};

window.addEventListener('load', function winLoad(e) {
  window.removeEventListener('load', winLoad);

  MainPage.init();
});

window.addEventListener('popstate', function(e) {
  Navigator.go(e.state || {page: 'work'});
});

})();
