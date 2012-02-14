function Log() {
  this.elem = document.getElementById('log');
}

Log.prototype = extends(Button, {
  up: function() {
    SessionList.show();
    Section.right();
  }
});
