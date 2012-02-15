var WorkPage = {
  init: function() {
    this.elem = document.getElementById('current-time');

    if(this.start)
      this.start.unload();

    if(!this.timer)
      this.timer = new Timer();
    this.id = setInterval(this.update.bind(this), 500);

    this.start = new Start();
    this.start.up = this.startPressed;
  },

  pause: function() {
    clearInterval(this.id);
  },

  saveState: function(ts) {
    localStorage['enabled'] = this.timer.running;
    var strTime = JSON.stringify(ts);
    localStorage['time'] = strTime;
  },

  startPressed: function() {
    this.timer.running ? this.timer.stop() : this.timer.start();
  },

  unload: function() {
    this.start.unload();
  },

  update: function() {
    var ts = this.timer.elapsed;

    this.elem.textContent = ts.toString();
    this.saveState(ts);
  }
};
