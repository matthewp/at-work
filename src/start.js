function Start() {
  this.elem = document.getElementsByName('start')[0];
}

Start.prototype = extend(Button, {
  down: function() {
    this.elem.className += ' clicked';
  },

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
  },

  up: function() {
    this.elem.className = this.elem.className.replace(' clicked', '');
    WorkPage.startPressed();
  }
});
