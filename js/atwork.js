/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */

(function(undefined) {
'use strict';
(function() {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] 
                                   || window[vendors[x]+'CancelRequestAnimationFrame'];
    }
 
    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); }, 
              timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };
 
    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
}());

function gimmePrefix(prop){
  var prefixes = ['Moz','Khtml','Webkit','O','ms'],
      elem     = document.createElement('div'),
      upper    = prop.charAt(0).toUpperCase() + prop.slice(1);

  if (prop in elem.style)
    return prop;
        
  for (var len = prefixes.length; len--; ){
    if ((prefixes[len] + upper)  in elem.style)
      return (prefixes[len] + upper);
  }
  

  return false;
}

var transformStyle = gimmePrefix('transform');
var transitionStyle = gimmePrefix('transition');

function Dict() {
  this.items = {};

  return this;
}

Dict.prototype = {
  
  prop: function(key) {
    return ':' + key;
  },

  get: function(key, def) {
    var p = this.prop(key),
        k = this.items;

    return k.hasOwnProperty(p) ? k[p] : def;
  },

  set: function(key, value) {
    var p = this.prop(key);

    this.items[p] = value;

    return value;
  },

  count: function() {
    return Object.keys(this.items).length;
  },

  has: function(key) {
    var p = this.prop(key);

    return this.items.hasOwnProperty(p);
  },

  del: function(key) {
    var p = this.prop(key),
        k = this.items;

    if(k.hasOwnProperty(p))
      delete k[p];
  },

  keys: function() {
    return Object.keys(this.items).map(function(key) {
      return key.substring(1);
    });
  }

};

var OS_NAME = 'sessions',
    DB_NAME = 'atwork',
    DB_VERSION = 1.1;

window.indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.msIndexedDB;
window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction;
window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange;

function openDB(callback, context) {
  var req = window.indexedDB.open(DB_NAME, DB_VERSION);

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

function extend(parent, proto) {
  var base = Object.create(parent.prototype);

  Object.keys(proto).forEach(function(key) {
    base[key] = proto[key];
  });

  return base;
}

function TimeSpan(ms) {
  this.totalmilliseconds = ms || 0;
  this.seconds = (ms && Math.floor(ms/1000) % 60) || 0;
  this.minutes = (ms && Math.floor(ms/60000) % 60) || 0;
  this.hours = (ms && Math.floor(ms/3600000) % 24) || 0;
}

TimeSpan.prototype = {
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

function Session(times) {
  this.times = times || [];
  this.id = 0;
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

  save: function() {
    var now = new Date();
    this.id = now.getTime();

    openDB(function(db) {
      var trans = db.transaction([OS_NAME], IDBTransaction.READ_WRITE);
            
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
  }
};

Session.getAll = function(callback) {
  openDB(function(db) {
    var sessions = [];

    var trans = db.transaction([OS_NAME], IDBTransaction.READ_ONLY);
    trans.onerror = function(e) {
      console.log(e);
    };

    var os = trans.objectStore(OS_NAME);
    var keyRange = IDBKeyRange.lowerBound(0);

    var req = os.openCursor(keyRange);
    req.onerror = function(e) {
      console.log(e);
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
    this.base = document.getElementById('main');

    Session.getAll(this.got.bind(this));
  },

  got: function(sessions) {
    this.sessions = sessions;
  },

  add: function(session) {
    this.sessions.push(session);
  },

  on: function(evt, action) {

  },

  show: function() {
    var base = this.base,
        ce = document.createElement.bind(document);

    base.innerHTML = '';

    var ul = ce('ul');
    ul.className = 'sessions';

    this.sessions.forEach(function(session) {
      var li = ce('li');
      li.id = session.id;

      var div = ce('div');
      div.className = 'item';

      var info = ce('div');
      info.className = 'info';

      var date = session.beginDate;
      var left = ce('span');
      left.className = 'date';
      left.textContent = getMonthName(date, true)
        + ' ' + date.getDate();

      var right = ce('span');
      right.className = 'time';
      right.textContent = session.time.toString();

      var rule = ce('hr');
      info.appendChild(left);
      info.appendChild(right);
      info.appendChild(rule);
      div.appendChild(info);

      var del = ce('div');
      del.className = 'del';

      var confirm = ce('span');
      confirm.textContent = 'Delete?';

      var cancel = ce('span');
      cancel.textContent = 'Cancel';

      del.appendChild(confirm);
      del.appendChild(cancel);
      div.appendChild(del);
      li.appendChild(div);

      var hammer = new Hammer(info);
      hammer.ondragstart = this.dragStart.bind(this);
      hammer.ondrag = this.dragging.bind(this);
      hammer.ondragend = this.dragEnd.bind(this);

      ul.appendChild(li);
    }, this);

    base.appendChild(ul);
  },

  dragStart: function(e) {
    if(e.direction !== 'left')
      return;

    this.isDragging = true;
    this.lastX = 0;
  },

  dragging: function(e) {
    if(!this.isDragging)
      return;

    var dx = e.distanceX - this.lastX,
        el = e.originalEvent.target;

    window.requestAnimationFrame(function() {
      el.style[transformStyle] = 'translateX(' + dx + 'px)';
    });
  },

  dragEnd: function(e) {
    this.isDragging = false;

    var w = window.innerWidth,
        p = w / e.distance,
        el = e.originalEvent.target,
        s = el.style,
        transVal = 'all .25s ease-in-out',
        frame;

    var remove = function(then) {
      var events = 'transitionend oTransitionEnd webkitTransitionEnd'.split(' ');

      events.forEach(function(evt) {
        el.addEventListener(evt, function untrans() {
          s[transitionStyle] = '';
          events.forEach(function(evt) {
            el.removeEventListener(evt, untrans);
          });

          (then || function(){})();
        });
      });
    }

    if(p > 3) {
      frame = function() {
        s[transitionStyle] = transVal;
        s[transformStyle] = 'translateX(0px)';
        remove();
      };
    } else {
      frame = function() {
        s[transitionStyle] = transVal;
        s[transformStyle] = 'translate(-' + w + 'px)';
        remove(function() {
          var ul = el.parentElement;
          ul.removeChild(el);
        });
      };
    }

    window.requestAnimationFrame(frame);
  }
};

var WorkPage = {
  init: function() {
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
    var base = document.getElementById('main');
    base.innerHTML = '';

    var action = document.createElement('section');
    action.className = 'action';

    var start = document.createElement('a');
    start.name = 'start';
    start.textContent = 'Start';

    var end = document.createElement('a');
    end.name = 'end';
    end.textContent = 'End';

    action.appendChild(start);
    action.appendChild(end);

    var current = document.createElement('div');
    current.id = current.className = 'current-time';

    base.appendChild(action);
    base.appendChild(current);

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
  events: function(action) {
    [ 'touchstart', 'touchend', 'mousedown', 'mouseup' ].forEach(function(evt) {
      action(evt);
    });
  },

  listen: function() {
    var self = this;
    self.events(function(evt) {
      self.elem.addEventListener(evt, self);
    });
  },

  unload: function() {
    var self = this;
    self.events(function(evt) {
      self.elem.removeEventListener(evt, self);
    });
  },

  down: function() { },
  up: function() { },

  handleEvent: function(e) {
    switch(e.type) {
      case 'touchstart':
      case 'mousedown':
        this.down();
        break;
      case 'touchend':
      case 'mouseup':
        this.up();
        break;
    }

    e.preventDefault();
  }
};

var Section = {
  init: function() {
    this.elem = document.getElementById('active');
  },

  left: function() {
    this.elem.className = 'left';
  },

  right: function() {
    this.elem.className = 'right';
  }
};

function Work() {
  this.elem = document.getElementById('work');
}

Work.prototype = extend(Button, {
  up: function() {
    WorkPage.show();    
    Section.left();
  }
});

function Log() {
  this.elem = document.getElementById('log');
}

Log.prototype = extend(Button, {
  up: function() {
    WorkPage.pause();
    WorkPage.unload();

    SessionList.show();
    Section.right();
  }
});

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
    this.elem.className = 'started';
  },

  stop: function() {
    this.setBtnText("Start");
    this.elem.className = null;
  },

  up: function() {
    this.elem.className = this.elem.className.replace(' clicked', '');
    WorkPage.startPressed();
  }
});

function Complete() {
  this.elem = document.getElementsByName('end')[0];
}

Complete.prototype = extend(Button, {
  down: function() {
    this.elem.className += ' clicked';
  },

  up: function() {
    this.elem.className = null;
    WorkPage.saveSession();
  }
});

window.addEventListener('load', function winLoad(e) {
  window.removeEventListener('load', winLoad);
  Section.init();
  WorkPage.init();
  SessionList.init();
  (new Work()).listen();
  (new Log()).listen();
});

})();
