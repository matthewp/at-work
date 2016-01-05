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
