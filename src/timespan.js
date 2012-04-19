function TimeSpan(ms) {
  this.totalmilliseconds = ms || 0;
  this.seconds = (ms && Math.floor(ms/1000) % 60) || 0;
  this.minutes = (ms && Math.floor(ms/60000) % 60) || 0;
  this.hours = (ms && Math.floor(ms/3600000) % 24) || 0;
}

TimeSpan.prototype = {
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
