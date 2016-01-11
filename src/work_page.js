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
