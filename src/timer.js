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
