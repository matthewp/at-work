/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */

(function(undefined) {
'use strict';

(function(undefined) {
'use strict';
var Bram = {};

var supportsSymbol = typeof Symbol === "function";
var INTERNAL_PROPS = supportsSymbol ? Symbol("[[ObservableProps]]") : "[[ObservableProps]]";
var INTERNAL_PROPIDS = supportsSymbol ? Symbol("[[ObservablePropIds]]") : "[[ObservablePropIds]]";
var CID = supportsSymbol ? Symbol("[[BramCID]]") : "[[BramCID]]";

var slice = Array.prototype.slice;

function makeObservable(element, eventName) {
  return Bram.listen(element, eventName)
    .map(function(ev) {
      ev.stopPropagation();
      return ev.detail;
    });
}

function setupProps(obj, props) {
  Object.defineProperty(obj, CID, {
    enumerable: false, writable: true, configurable: false,
    value: 0
  });

  props.forEach(function(prop){
    Object.defineProperty(obj, prop, {
      get: function(){
        return getProps(this)[prop];
      },
      set: function(val){
        // Trigger a custom event that this observable will get
        var id = getPropIds(this)[prop];
        Bram.send(this, val, id, false);
      }
    });
  });
}

function makeProps(element, propNames) {
  var tag = element.tagName.toLowerCase();
  var proto = Object.getPrototypeOf(element);
  var propIds = getPropIds(element);
  var props = getProps(element);
  propNames.forEach(function(prop){
    var id = propIds[prop] = tag + "-" + prop + "-" + proto[CID]++;
    props[prop] = makeObservable(element, id);
  });
}

function defineProps(obj) {
  Object.defineProperty(obj, INTERNAL_PROPS, {
    enumerable: false, writable: false, configurable: false,
    value: {}
  });
  Object.defineProperty(obj, INTERNAL_PROPIDS, {
    enumerable: false, writable: false, configurable: false,
    value: {}
  });
}

function getProps(obj) {
  return obj[INTERNAL_PROPS];
}

function getPropIds(obj) {
  return obj[INTERNAL_PROPIDS];
}

Bram.element = function(defn){
  var parentProto;
  if(defn.extends) {
    parentProto = defn.extends.proto ? defn.extends.proto : defn.extends;
  } else {
    parentProto = HTMLElement.prototype;
  }

  var proto = Object.create(parentProto);

  var protoFunctions = defn.proto || defn.prototype || {};
  Object.keys(protoFunctions).forEach(function(key){
    var desc = Object.getOwnPropertyDescriptor(protoFunctions, key);
    var type = typeof desc.value;
    if(type === "function" || type === "object" || desc.get) {
      Object.defineProperty(proto, key, desc);
    }
  });

  if(defn.props) {
    setupProps(proto, defn.props);
  }

  proto.createdCallback = function(){
    if(defn.props && !getProps(this)) {
      defineProps(this);
      makeProps(this, defn.props);
    }

    var root;
    if(defn.template) {
      var t = document.querySelector(defn.template);
      var clone = document.importNode(t.content, true);

      root = (defn.useShadow !== false && this.createShadowRoot) ?
        this.createShadowRoot() : this;
      root.appendChild(clone);

      this._bindings = new Bind(this, root);
    }

    if(defn.created) {
      defn.created.call(this, this._bindings, root);
    }
  };

  if(defn.attr) {
    proto.attributeChangedCallback = defn.attr;
  }

  proto.attachedCallback = function(){
    if(this._bindings)
      this._bindings._bind();
    if(defn.attached)
      return defn.attached.apply(this, arguments);
  }

  proto.detachedCallback = function(){
    if(this._bindings)
      this._bindings._unbind();
    if(defn.detached)
      return defn.detached.apply(this, arguments);
  };

  var registerOptions = {
    prototype: proto
  };
  if(defn.extends && defn.extends.tag)
    registerOptions.extends = defn.extends.tag;

  return document.registerElement(defn.tag, registerOptions);
};

if(typeof Rx === 'object' && Rx.Observable)
  Bram.Observable = Rx.Observable;
else if(typeof Observable === 'function')
  Bram.Observable = Observable;
else {
  console.error('Bram requires an Observable');
  return;
}

Bram.listen = function(element, eventName){
  return Bram.Observable.fromEvent
    ? Bram.Observable.fromEvent(element, eventName)
    : new Bram.Observable(function(observer){
    // Create an event handler which sends data to the sink
    var handler = function(event) { observer.next(event); }

    // Attach the event handler
    element.addEventListener(eventName, handler, true);

    // Return a function which will cancel the event stream
    return function(){
      // Detach the event handler from the element
      element.removeEventListener(eventName, handler, true);
    };
  });
}

Bram.mailbox = function(element){
  var address = 'bram-appchange';
  if(arguments.length === 1) {
    // element-contextual address
    if(!element.prototype[CID]) {
      Object.defineProperty(element.prototype, CID, {
        enumerable: false, writable: false, configurable: false,
        value: 0
      });
    }
    var cid = element.prototype[CID]++;
    address = address + '-' + element.tagName.toLowerCase() + '-' + cid;

    element.send = function(observable){
      Bram.send(this, observable, address, false);
    };
  }
  element = element || document.body;

  var observable = Bram.listen(element, address);
  return observable.map(function(ev) {
    ev.stopPropagation();
    return ev.detail;
  });
};

Bram.trigger = function(el, val, eventName, bubbles){
  var event = new CustomEvent(eventName, {
    bubbles: bubbles !== false,
    detail: val
  });
  el.dispatchEvent(event);
};

Bram.send = function(el, observable, eventName, bubbles){
  if(arguments.length === 2) {
    eventName = 'bram-appchange';
  }

  // TODO save this subscription
  var subscription = observable.subscribe(function(val){
    Bram.trigger(el, val, eventName, bubbles);
  });

};

function Binding(on, off){
  this._on = on;
  this._off = off;
};

Binding.prototype.on = function(){
  if(!this.bound) {
    this._on();
    this.bound = true;
  }
};

Binding.prototype.off = function(){
  if(this.bound) {
    this._off();
    this.bound = false;
  }
};

function Bind(el, shadow){
  this.el = el;
  this.shadow = shadow;
  this._bindings = [];
}

Bind.prototype._getElement = function(selector, root){
  root = root || this.shadow;
  return typeof selector === "string" ? root.querySelector(selector) : selector;
};

Bind.prototype._register = function(binding){
  this._bindings.push(binding);
  binding.on();
};

Bind.prototype._bind = function(){
  this._bindings.forEach(function(binding){
    binding.on();
  });
};

Bind.prototype._unbind = function(){
  this._bindings.forEach(function(binding){
    binding.off();
  });
};

Bind.prototype._setup = function(selector, observable, setter){
  var el = this._getElement(selector);
  observable.subscribe(function(value){
    setter(el, value);
  });
};

Bind.prototype.text = function(selector, observable){
  this._setup(selector, observable, function(el, value){
    el.textContent = value;
  });
};

Bind.prototype.value = function(selector, observable){
  this._setup(selector, observable, function(el, value){
    if(el.value !== value) {
      el.value = value;
    }
  });
};

Bind.prototype.condAttr = function(selector, attrName, observable){
  var el = this._getElement(selector);

  observable.subscribe(function(value){
    if(value) {
      el.setAttribute(attrName, true);
    } else {
      el.removeAttribute(attrName);
    }
  });
};

Bind.prototype.hideWhen = function(selector, observable){
  var current = this._getElement(selector).style.display;
  this._setup(selector, observable, function(el, hide){
    var val = hide ? 'none': current;
    if(el.style.display !== val) {
      el.style.display = val;
    }
  });
};

Bind.prototype.list = function(observable, key, templateSelector,
                               hostSelector, callback){
  var t = this._getElement(templateSelector);
  var parent = this._getElement(hostSelector);
  var el = this.el;
  var inserted = {};

  observable.subscribe(function(list){
    var ids = list.reduce(function(acc, item, i){
      var id = item[key];
      var inDom = inserted[id];
      if(!inDom) {
        var clone = document.importNode(t.content, true);
        var bindings = new Bind(el, clone);
        callback.call(el, clone, item, i);

        inserted[id] = slice.call(clone.childNodes);
        parent.appendChild(clone);
      }
      acc[id] = true;
      return acc;
    }, {});

    Object.keys(inserted).forEach(function(id){
      var inList = ids[id];
      if(!inList) {
        var nodes = inserted[id];
        nodes.forEach(function(node){
          node.parentNode.removeChild(node);
        });
        delete inserted[id];
      }
    });
  });
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

var BaseButton = Bram.element({
  tag: "base-button",
  extends: {
    proto: HTMLButtonElement.prototype,
    tag: "button"
  },

  attached: function(){
    this.addEventListener('click', this);
  },

  detached: function(){
    this.removeEventListener('click', this);
  },

  proto: {
    up: function() { },

    handleEvent: function(e) {
      switch(e.type) {
        case 'click':
          this.up(e);
          break;
      }
    }
  }
});

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

Bram.element({
  tag: "action-bar",
  template: "#action-bar-template",
  useShadow: false,

  props: ['actions'],

  created: function(bind){
    this.actions.subscribe(detail => {
      if(detail.action === 'add')
        this.addActions(detail);
      else
        this.removeActions();
    });
  },

  proto: {
    addActions: function(detail){
      var el = document.createElement(detail.tag);
      detail.bind(el);
      this.current = el;
      this.appendChild(el);
    },
    removeActions: function(){
      if(this.current) {
        this.current.parentNode.removeChild(this.current);
        this.current = undefined;
      }
    }
  }

});

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

Bram.element({
  tag: "work-page",
  template: "#work-template",
  useShadow: false,

  created: function(bind, shadow){
    this.elem = shadow.querySelector('#current-time');

    if(!this.timer)
      this.timer = new Timer();

    var startButton = this.querySelector('[name=start]');
    var startText = Rx.Observable.fromEvent(startButton, 'click')
      .startWith(!this.timer.running)
      .scan(val => !val)
      .map(running => {
        this.onStartPressed();
        return running ? 'Stop' : 'Start'
      });

    bind.text(startButton, startText);

    var completeButton = this.querySelector('[name=end]');
    var timeText = Rx.Observable.fromEvent(completeButton, 'click')
      .map(() => null);

    bind.text(completeButton, timeText);

    if(this.inited)
      this.resume();
    else {
      if(localStorage['enabled'] === 'true') {
        this.restore();
      }

      this.inited = true;
    }

    componentHandler.upgradeElements(this.children);
  },

  proto: {
    get cachedBeginDate () {
      var cached = localStorage['begin'];
      if(cached === null)
        return undefined;

      var begin = new Date(cached);
      return begin;
    },

    get startText() {
      return this.startPressed ? 'Stop' : 'Start';
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

      //this.elem.textContent = null;
    },

    restore: function() {
      var running = localStorage['running'] === 'true';
      this.startPressed = running;

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
      } else {
        this.elem.textContent = time.toString();
      }
    },

    resume: function() {
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

    onStartPressed: function() {
      if(this.timer.running) {
        this.timer.stop();
        this.pause();

        localStorage['running'] = false;
        localStorage['prev'] = localStorage['time'];
        return;
      }

      this.timer.start();
      this.startTimer();
      localStorage['running'] = true;
      localStorage['begin'] = (new Date()).toJSON();
    },

    startTimer: function() {
      this.id = setInterval(this.update.bind(this), 500);
    },

    update: function() {
      var ts = this.timer.elapsed;

      this.elem.textContent = ts.toString();
      this.saveState(ts);
    }

  }
});

Bram.element({
  tag: "main-page",
  template: "#main-template",
  useShadow: false,

  created: function(bind, shadow){
    componentHandler.upgradeElements(shadow.childNodes);
  }

});

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

Bram.element({
  tag: "session-list",
  template: "#sessionlist-template",
  useShadow: false,

  props: ["sessions"],

  created: function(bind){
    var anyLabelSelected = Rx.Observable.fromEvent(this, 'label-clicked')
      .map(ev => {
        ev.detail.stopPropagation();
        return ev.detail.target.checked ? 1 : -1
      })
      .startWith(0)
      .scan((acc, value) => acc + value)
      .map(val => val > 0)
      .distinctUntilChanged();

    bind.list(this.sessions, 'id', 'template', '.sessions', function(el, session){
      var date = session.beginDate;
      el.querySelector('.date').textContent = getMonthName(date, true)
        + ' ' + date.getDate();

      el.querySelector('.time').textContent = session.time;

      // Upgrade input element
      var label = el.querySelector('label input');
      componentHandler.upgradeElement(label);

      var li = el.querySelector('li');
      var sessionClicked = Rx.Observable.fromEvent(li, 'click')
        .map(() => ({ page: 'session', data: session }));

      Bram.send(this, sessionClicked, 'page-change');

      var label = li.querySelector('label');
      var labelsClicked = Rx.Observable.fromEvent(label, 'click')
      Bram.send(this, labelsClicked, 'label-clicked');
    });

    var sessionActions = this.sessions.flatMap(sessions => {
      return anyLabelSelected.map(selected => ({
        selected: selected,
        sessions: sessions
      }));
    }).map(ev => {
      return {
        action: ev.selected ? 'add' : 'remove',
        tag: 'sessionlist-action-bar',
        bind: function(el){
          el.sessions = ev.sessions;
        }
      };
    });
    Bram.send(this, sessionActions, 'action-bar-change');
  }
});

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

Bram.element({
  tag: "session-page",
  template: "#sessionpage-template",
  useShadow: false,

  proto: {
    get session() {
      return this._session;
    },

    set session(session){
      var date = session.beginDate;
      this.querySelector('.date').textContent = getMonthName(date) +
        ' ' + date.getDate();

      this.querySelector('.time').textContent = session.time.toString();
      this._session = session;
    }
  }
});

Bram.element({
  tag: "at-work",
  template: "#atwork-template",
  useShadow: false,

  created: function(bind){
    this.mdlUpgraded().then(work => work.show());
    this.current = {
      page: 'main',
      el: this.querySelector('main-page')
    };

    var poppedRoute = Rx.Observable.fromEvent(window, 'popstate')
      .map(ev => Object.assign({ setRoute: false }, ev.state || {page: 'main'}));

    Bram.send(this, poppedRoute, 'page-change');

    var pageSet = Rx.Observable.fromEvent(this, 'page-change')
      .map(ev => ev.detail);

    pageSet.subscribe((ev) => {
      if(ev.page === this.current.page) return;

      var page = this.pages[ev.page];

      var t = this.querySelector(page.template);
      var clone = document.importNode(t.content, true);
      var newEl = page.bind(clone, ev);

      var placeHolder = document.createTextNode('');
      var parent = this.current.el.parentNode;

      parent.insertBefore(placeHolder, this.current.el);

      // Remove the current node
      if(this.current.page === 'main') {
        this.querySelector('main-page').style.display = 'none';
      } else {
        parent.removeChild(this.current.el);
      }

      // Insert the new page
      if(ev.page === 'main') {
        this.querySelector('main-page').style.display = '';
      } else {
        parent.insertBefore(clone, placeHolder);
      }
      parent.removeChild(placeHolder);

      this.current = {
        page: ev.page,
        el: ev.page === 'main' ? this.querySelector('main-page') : newEl
      };

      if(ev.setRoute !== false && page.route) {
        var route = page.route(ev);
        this.saveHistory(route, ev);
      }
    });

    var mainTabs = this.querySelector('#main-tabs');
    var mainTabsReady = Rx.Observable.fromEvent(mainTabs, 'mdl-componentupgraded')
      .startWith(false)
      .map(val => val && !!this.querySelector('.mdl-layout__tab-bar-container'))
      .filter(val => val);

    // Hide the tab bar when not on the main page.
    var hideTabBar = pageSet.map(ev => ev.page !== 'main').startWith(false)
    mainTabsReady.first().subscribe(() => {
      bind.condAttr('.mdl-layout__tab-bar-container', 'hidden', hideTabBar);
    });

    // Action bar
    var actionBarChange = Rx.Observable.fromEvent(this, 'action-bar-change')
      .map(ev => ev.detail);
    this.querySelector('action-bar').actions = actionBarChange;
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
    },

    saveHistory: function(route, state){
      history.pushState(state, route.title, route.url);
    },

    pages: {
      main: {
        template: '#mainpage-tag-template',
        bind: function(frag){
          return frag.querySelector('main-page');
        },
        route: function(){
          return { url: '/', title: 'At Work' };
        }
      },

      session: {
        template: '#session-tag-template',
        bind: function(frag, event){
          var sp = frag.querySelector('session-page');
          sp.session = event.data;
          return sp;
        },
        route: function(event){
          var session = event.data;
          return {
            url: '/session/' + session.id,
            title: 'Session'
          };
        }
      }
    }
  }
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

Bram.element({
  tag: 'sessionlist-action-bar',
  template: '#sessionlistaction-template',
  useShadow: false,

  created: function(){
    var del = this.querySelector('#deletesession-button');
    var delEvents = Rx.Observable.fromEvent(del, 'click');

    delEvents.map(() => this.sessions)
      .map(sessions => {
        debugger;
      })
      .subscribe();
  }
})

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

window.addEventListener('load', function winLoad(e) {
  window.removeEventListener('load', winLoad);

  var sessions = Rx.Observable.fromPromise(Session.getAllP());
  document.querySelector('session-list').sessions = sessions;
});

})();
