var WorkPage = {
  init: function() {
    this.elem = document.getElementById('current-time');

    if(!this.timer)
      this.timer = new Timer();

    if(localStorage['enabled'] === 'true') {
      this.restore();
    }

    this.id = setInterval(this.update.bind(this), 500);

    this.start = new Start();
    this.complete = new Complete();
  },

  pause: function() {
    clearInterval(this.id);
  },

  reset: function() {
    this.timer = new Timer();

    localStorage['enabled'] = false;
    localStorage['time'] = null;
  },

  restore: function() {
    var state = JSON.parse(localStorage['time']);
    this.timer.time.totalmilliseconds = state.totalmilliseconds;
    this.timer.time.hours = state.hours;
    this.timer.time.minutes = state.minutes;
    this.timer.time.seconds = state.seconds;
  },

  saveSession: function() {
    var time = this.timer.time;
    var session = new Session([time]);
    session.save();
    SessionList.add(session);
  },

  saveState: function(ts) {
    localStorage['enabled'] = this.timer.running;
    var strTime = JSON.stringify(ts);
    localStorage['time'] = strTime;
  },

  startPressed: function() {
    this.timer.running ? this.timer.stop() : this.timer.start();
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

    this.init();
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
