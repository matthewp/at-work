function Start() {
  this.elem = document.getElementsByName('start')[0];
}

Start.prototype = extends(Button, {
});
