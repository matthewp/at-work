function Timer() {
  this.time = new TimeSpan();
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

  get elapsed() {
    if(!this.begin)
      return NaN;

    var now = new Date();
    var ms = now - this.begin;
    return this.time.add(ms);
  }
};
