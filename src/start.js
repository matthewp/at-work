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
    this.elem.classList.add('started');
  },

  stop: function() {
    this.setBtnText("Start");
    this.elem.classList.remove('started');
  },

  up: function() {
    //this.elem.className = this.elem.className.replace(' clicked', '');
    //this.elem.classList.remove('clicked');
    WorkPage.startPressed();
  }
});
