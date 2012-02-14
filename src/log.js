function Log() {
  this.elem = document.getElementById('log');
}

Log.prototype = extend(Button, {
  up: function() {
    SessionList.show();
    Section.right();
  }
});
