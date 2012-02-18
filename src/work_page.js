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

  get cachedBeginDate () {
    var cached = localStorage['begin'];
    if(cached === null)
      return undefined;

    var gt = parseInt(localStorage['begin']);
    var begin = new Date();
    begin.setTime(gt);

    return begin;
  }

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
      this.timer.begin = this.cachedBeginDate;
      this.timer.resume();
    } 
  },

  resume: function() {
    this.elem = document.getElementById('current-time');

    this.start = new Start();
    this.start.listen();

    this.complete = new Complete();
    this.complete.listen();

    if(this.timer.elapsed !== NaN) {
      if(timer.timer.running) {
        this.elem.textContent  = this.timer.elapsed.toString();
        this.start.start();
        this.id = setInterval(this.update.bind(this), 500);
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
    localStorage['begin'] = localStorage['begin']
      || (new Date()).getTime();
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
    this.saveState(ts, new Date());
  }
};