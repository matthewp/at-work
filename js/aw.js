/*=esdown=*/'use strict'; var _esdown = {}; (function() { var exports = _esdown;

var VERSION = "1.0.8";

var GLOBAL = (function() {

    try { return global.global } catch (x) {}
    try { return self.self } catch (x) {}
    return null;
})();

var ownNames = Object.getOwnPropertyNames,
      ownSymbols = Object.getOwnPropertySymbols,
      getDesc = Object.getOwnPropertyDescriptor,
      defineProp = Object.defineProperty;

function toObject(val) {

    if (val == null) // null or undefined
        throw new TypeError(val + " is not an object");

    return Object(val);
}

// Iterates over the descriptors for each own property of an object
function forEachDesc(obj, fn) {

    ownNames(obj).forEach(function(name) { return fn(name, getDesc(obj, name)); });
    if (ownSymbols) ownSymbols(obj).forEach(function(name) { return fn(name, getDesc(obj, name)); });
}

// Installs a property into an object, merging "get" and "set" functions
function mergeProp(target, name, desc, enumerable) {

    if (desc.get || desc.set) {

        var d$0 = { configurable: true };
        if (desc.get) d$0.get = desc.get;
        if (desc.set) d$0.set = desc.set;
        desc = d$0;
    }

    desc.enumerable = enumerable;
    defineProp(target, name, desc);
}

// Installs properties on an object, merging "get" and "set" functions
function mergeProps(target, source, enumerable) {

    forEachDesc(source, function(name, desc) { return mergeProp(target, name, desc, enumerable); });
}

// Builds a class
function makeClass(def) {

    var parent = Object.prototype,
        proto = Object.create(parent),
        statics = {};

    def(function(obj) { return mergeProps(proto, obj, false); },
        function(obj) { return mergeProps(statics, obj, false); });

    var ctor = proto.constructor;
    ctor.prototype = proto;

    // Set class "static" methods
    forEachDesc(statics, function(name, desc) { return defineProp(ctor, name, desc); });

    return ctor;
}

// Support for computed property names
function computed(target) {

    for (var i$0 = 1; i$0 < arguments.length; i$0 += 3) {

        var desc$0 = getDesc(arguments[i$0 + 1], "_");
        mergeProp(target, arguments[i$0], desc$0, true);

        if (i$0 + 2 < arguments.length)
            mergeProps(target, arguments[i$0 + 2], true);
    }

    return target;
}

// Support for async functions
function asyncFunction(iter) {

    return new Promise(function(resolve, reject) {

        resume("next", void 0);

        function resume(type, value) {

            try {

                var result$0 = iter[type](value);

                if (result$0.done) {

                    resolve(result$0.value);

                } else {

                    Promise.resolve(result$0.value).then(
                        function(x) { return resume("next", x); },
                        function(x) { return resume("throw", x); });
                }

            } catch (x) { reject(x) }
        }
    });
}

// Support for for-await
function asyncIterator(obj) {

    var method = obj[Symbol.asyncIterator] || obj[Symbol.iterator];
    return method.call(obj);
}

// Support for async generators
function asyncGenerator(iter) {

    var front = null, back = null;

    var aIter = {

        next: function(val) { return send("next", val) },
        throw: function(val) { return send("throw", val) },
        return: function(val) { return send("return", val) },
    };

    aIter[Symbol.asyncIterator] = function() { return this };
    return aIter;

    function send(type, value) {

        return new Promise(function(resolve, reject) {

            var x = { type: type, value: value, resolve: resolve, reject: reject, next: null };

            if (back) {

                // If list is not empty, then push onto the end
                back = back.next = x;

            } else {

                // Create new list and resume generator
                front = back = x;
                resume(type, value);
            }
        });
    }

    function fulfill(type, value) {

        switch (type) {

            case "return":
                front.resolve({ value: value, done: true });
                break;

            case "throw":
                front.reject(value);
                break;

            default:
                front.resolve({ value: value, done: false });
                break;
        }

        front = front.next;

        if (front) resume(front.type, front.value);
        else back = null;
    }

    function resume(type, value) {

        // HACK: If the generator does not support the "return" method, then
        // emulate it (poorly) using throw.  (V8 circa 2015-02-13 does not support
        // generator.return.)
        if (type === "return" && !(type in iter)) {

            type = "throw";
            value = { value: value, __return: true };
        }

        try {

            var result$1 = iter[type](value);
            value = result$1.value;

            if (value && typeof value === "object" && "_esdown_await" in value) {

                if (result$1.done)
                    throw new Error("Invalid async generator return");

                Promise.resolve(value._esdown_await).then(
                    function(x) { return resume("next", x); },
                    function(x) { return resume("throw", x); });

            } else {

                Promise.resolve(value).then(
                    function(x) { return fulfill(result$1.done ? "return" : "normal", x); },
                    function(x) { return fulfill("throw", x); });
            }

        } catch (x) {

            // HACK: Return-as-throw
            if (x && x.__return === true)
                return fulfill("return", x.value);

            fulfill("throw", x);
        }
    }
}

// Support for spread operations
function spread(initial) {

    return {

        a: initial || [],

        // Add items
        s: function() {

            for (var i$1 = 0; i$1 < arguments.length; ++i$1)
                this.a.push(arguments[i$1]);

            return this;
        },

        // Add the contents of iterables
        i: function(list) {

            if (Array.isArray(list)) {

                this.a.push.apply(this.a, list);

            } else {

                for (var __$0 = (list)[Symbol.iterator](), __$1; __$1 = __$0.next(), !__$1.done;)
                    { var item$0 = __$1.value; this.a.push(item$0); }
            }

            return this;
        },

    };
}

// Support for object destructuring
function objd(obj) {

    return toObject(obj);
}

// Support for array destructuring
function arrayd(obj) {

    if (Array.isArray(obj)) {

        return {

            at: function(skip, pos) { return obj[pos] },
            rest: function(skip, pos) { return obj.slice(pos) },
        };
    }

    var iter = toObject(obj)[Symbol.iterator]();

    return {

        at: function(skip) {

            var r;

            while (skip--)
                r = iter.next();

            return r.value;
        },

        rest: function(skip) {

            var a = [], r;

            while (--skip)
                r = iter.next();

            while (r = iter.next(), !r.done)
                a.push(r.value);

            return a;
        },
    };
}










exports.computed = computed;
exports.spread = spread;
exports.objd = objd;
exports.arrayd = arrayd;
exports.class = makeClass;
exports.version = VERSION;
exports.global = GLOBAL;
exports.async = asyncFunction;
exports.asyncGen = asyncGenerator;
exports.asyncIter = asyncIterator;


})();

/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */

(function(undefined) {
'use strict';
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

var MainPage = {
  init: function() {
    this.base = document.getElementsByTagName('main')[0];

    this.mainDom = {
      'fixed-tab-1': true,
      'fixed-tab-2': true
    };

    WorkPage.init();
    SessionList.init();
    SessionPage.init();
    DrawerButton.init();
    this.work = new Work();
    this.work.listen();

    this.log = new Log();
    this.log.listen();
  },

  show: function() {
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
