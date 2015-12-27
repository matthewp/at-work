function Log() {
  this.elem = document.getElementById('log');
}

Log.prototype = extend(Button, {
  up: function(fromEvent) {
    WorkPage.pause();
    WorkPage.unload();

    SessionList.show();

    if(fromEvent) {
      this.elem.show();
    }
  }
});
