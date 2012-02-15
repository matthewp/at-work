function Start() {
  this.elem = document.getElementsByName('start')[0];
}

Start.prototype = extend(Button, {
  setBtnText: function(text) {
    this.elem.textContent = text;
  },
  start: function() {
    this.setBtnText("Stop");
    this.elem.className = 'started';
  },
  stop: function() {
    this.setBtnText("Start");
    this.elem.className = null;
  }
});
