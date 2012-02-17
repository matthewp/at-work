function TimeSpan(ms) {
  if(ms) {
    this.totalmilliseconds = ms;
    this.seconds = Math.floor(ms/1000) % 60;
    this.minutes = Math.floor(ms/60000) % 60;
    this.hours = Math.floor(ms/3600000) % 24;
  }
}

TimeSpan.prototype = {
  totalmilliseconds: 0,
  seconds: 0,
  minutes: 0,
  hours: 0,
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
