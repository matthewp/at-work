/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */

(function() {
'use strict';
var OS_NAME = 'sessions',
    DB_NAME = 'atwork',
    DB_VERSION = 1;

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

function extend(parent, proto) {
  var base = Object.create(parent.prototype);

  Object.keys(proto).forEach(function(key) {
    base[key] = proto[key];
  });

  return base;
}

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
      return NaN;

    var now = new Date();
    var ms = now - this.begin;
    return this.time.add(ms);
  }
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
  obj.times.forEach(function(timeData) {
    var time = new TimeSpan(timeData.totalmilliseconds);
    session.times.push(time);
  });

  return session;
};

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

  show: function() {
    var base = this.base;
    base.innerHTML = '';

    var ul = document.createElement('ul');
    ul.className = 'sessions';

    this.sessions.forEach(function(session) {
      var li = document.createElement('li');
      li.id = session.id;
      li.textContent = session.time.toString();

      ul.appendChild(li);
    });

    base.appendChild(ul);
  }
};

var WorkPage = {
  init: function() {
    this.elem = document.getElementById('current-time');

    if(!this.timer)
      this.timer = new Timer();

    if(localStorage['enabled'] === 'true') {
      this.restore();
    }
    
    this.start = new Start();
    this.start.listen();

    this.complete = new Complete();
    this.complete.listen();

    this.inited = true;
  },

  pause: function() {
    clearInterval(this.id);
  },

  reset: function() {
    this.timer = new Timer();

    localStorage['enabled'] = false;
    localStorage['time'] = null;

    this.elem.textContent = null;
  },

  restore: function() {
    var state = JSON.parse(localStorage['time']);
    if(!state)
      return;

    var time = this.timer.time;

    time.totalmilliseconds = state.totalmilliseconds;
    time.hours = state.hours;
    time.minutes = state.minutes;
    time.seconds = state.seconds;

    this.elem.textContent = time.toString();

    if(localStorage['running'] === 'true') {
      this.timer.resume();
      this.id = setInterval(this.update.bind(this), 500);
    } 
  },

  resume: function() {
    this.elem = document.getElementById('current-time');

    this.start = new Start();
    this.start.listen();

    this.complete = new Complete();
    this.complete.listen();

    if(this.timer.time) {
      this.elem.textContent = this.timer.time.toString();

      if(localStorage['running'] === 'true') {
        this.start.start();
        this.id = setInterval(this.update.bind(this), 500);
      }
    }
  },

  saveSession: function() {
    var time = this.timer.time;
    var session = new Session([time]);
    session.save();
    SessionList.add(session);
    this.reset();
  },

  saveState: function(ts) {
    localStorage['enabled'] = this.timer.running;
    var strTime = JSON.stringify(ts);
    localStorage['time'] = strTime;
  },

  startPressed: function() {
    if(this.timer.running) {
      this.timer.stop();
      this.start.stop();
      this.pause();

      localStorage['running'] = false;

      return;
    }

    this.timer.start();
    this.start.start();
    this.id = setInterval(this.update.bind(this), 500);
    localStorage['running'] = true;
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
