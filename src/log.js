function Log() {
  this.elem = document.getElementById('log');
}

Log.prototype = extend(Button, {
  up: function() {
    WorkPage.pause();
    WorkPage.unload();

    SessionList.show();
    Section.right();
  }
});
