function Log() {
  this.elem = document.getElementById('log');
}

Log.prototype = extend(Button, {
  up: function() {
    WorkPage.pause();  

    SessionList.show();
    Section.right();
  }
});
