/* -*- Mode: Java; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- /
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */

(function() {
'use strict';
var OS_NAME = 'sessions';
var DB_NAME = 'atwork';
var DB_VERSION = 1;

window.indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.msIndexedDB;

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
    var func = context
      ? callback.bind(context)
      : callback;
    func(db);
  };
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

function Session(times) {
  this.times = times;
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
  },

  get id () {
    return this._id;
  },

  set id (i) {
    this._id = i;
  },

  save: function() {
    // TODO save this session.
    var now = new Date();
    this.id = now.getTime();

    openDB(function(db) {
      var trans = db.transaction([OS_NAME], IDBTransaction.READ_WRITE);
            
      trans.onerror = function(e) {
        console.log(e);
      };

      var os = trans.objectStore(OS_NAME);
      os.add(this);
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
    os.openCursor().onsuccess = function(e) {
      var cursor = e.target.result;
      if(!cursor) {
        callback(sessions);
        return;
      }

      sessions.push(cursor.value);
      cursor.continue();
    };
  });
};

var SessionList = {
  init: function() {
    Session.getAll(this.got.bind(this));
  },
  got: function(sessions) {
    this.sessions = sessions;
  },
  add: function(session) {
    this.sessions.push(session);
  }
};

function Timer() {
  this.time = new TimeSpan();
  this._elem = document.getElementById('current-time');
  this._btn = document.getElementsByName('start')[0];
  this._endBtn = document.getElementsByName('end')[0];

  var self = this;
  [ 'touchstart', 'touchend', 'mousedown', 'mouseup' ].forEach(function(evt) {
    self._btn.addEventListener(evt, self);
    self._endBtn.addEventListener(evt, self);
  });
}

Timer.prototype = {
  running: false,
  start: function() {
    this.running = true;
    this._begin = new Date();
    this._id = setInterval(this.update.bind(this), 500);
  
    this.setBtnText("Stop");
    this._btn.className = 'started';
  },
  stop: function() {
    this.running = false;
    clearInterval(this._id);
    this._id = null;

    this.time = this.elapsed;

    this.setBtnText("Start");
    this._btn.className = null;
  },
  complete: function() {
    var session = new Session([this.time]);
    session.save();
    SessionList.add(session);

    this._endBtn.className = null;
  },
  update: function() {
    var ts = this.elapsed;
    this._elem.innerHTML = ts.toString();
    this.saveState(ts);
  },
  handleEvent: function timerHandle(e) {
    var elem = e.target.name === 'end'
      ? this._endBtn : this._btn;

    switch(e.type) {
      case 'touchstart':
      case 'mousedown':
        elem.className += ' clicked';
        break;
      case 'touchend':
      case 'mouseup':
        if(e.target.name === 'start')
          this.running ? this.stop() : this.start();
        else
          this.complete();
        break;
    }

    e.preventDefault();
  },
  setBtnText: function(text) {
    this._btn.textContent = text;
  },
  get elapsed() {
    if(!this._begin)
      return NaN;

    var now = new Date();
    var ms = now - this._begin;
    return this.time.add(ms);
  },
  saveState: function(ts) {
    localStorage['enabled'] = this.running;
    var strTime = JSON.stringify(ts);
    localStorage['time'] = strTime;
  }
};

Timer.init = function() {
  this.timer = new Timer();

  if(localStorage['enabled'] === 'true') {
    this.restore();
  }
};

Timer.restore = function() {
  var state = JSON.parse(localStorage['time']);
  this.timer.time.totalmilliseconds = state.totalmilliseconds;
  this.timer.time.hours = state.hours;
  this.timer.time.minutes = state.minutes;
  this.timer.time.seconds = state.seconds;

  this.timer._elem.innerHTML = this.timer.time.toString();
};

window.addEventListener('load', function winLoad(e) {
  window.removeEventListener('load', winLoad);
  Timer.init();
  SessionList.init();
});

})();
