function Timer() {
  this.time = new TimeSpan();
  this._elem = document.getElementById('current-time');
  this._elem.innerHTML = '';
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
    this.begin = new Date();  
  },
  stop: function() {
    this.running = false;
    this.time = this.elapsed;
  },
  complete: function() {
    var session = new Session([this.time]);
    session.save();
    SessionList.add(session);

    this._endBtn.className = null;

    Timer.reset();
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
    if(!this.begin)
      return NaN;

    var now = new Date();
    var ms = now - this.begin;
    return this.time.add(ms);
  },
  unload: function() {
    var self = this;
    [ 'touchstart', 'touchend', 'mousedown', 'mouseup' ].forEach(function(evt) {
      self._btn.removeEventListener(evt, self);
      self._endBtn.removeEventListener(evt, self);
    });
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

Timer.reset = function() {
  this.timer.unload();
  this.timer = new Timer();

  localStorage['enabled'] = false;
  localStorage['time'] = null;
};
