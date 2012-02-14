var WorkPage = {
  init: function() {
    this.elem = document

    if(this.start)
      this.start.unload();

    this.timer = new Timer();
    setInterval(this.update.bind(this), 500);

    this.start = new Start();
    this.start.up = this.startPressed;
  },

  saveState: function(ts) {
    localStorage['enabled'] = this.timer.running;
    var strTime = JSON.stringify(ts);
    localStorage['time'] = strTime;
  },

  startPressed: function() {
    this.timer.running ? this.timer.stop() : this.timer.start();
  },

  update: function() {
    var ts = this.timer.elapsed;

    this.elem.textContent = ts.toString();
    this.saveState(ts);
  }
};
