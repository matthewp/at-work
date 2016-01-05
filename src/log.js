function Log() {
  this.elem = document.getElementById('log');
}

Log.prototype = extend(Button, {
  up: withMainPage(function(fromEvent) {
    WorkPage.pause();
    WorkPage.unload();

    SessionList.show();

    if(fromEvent === true) {
      this.elem.show();
    }
  })
});
