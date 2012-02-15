function Complete() {
  this.elem = document.getElementsByName('complete')[0];
}

Complete.prototype = extend(Button, {
  down: function() [
    this.elem.className += ' clicked';
  },

  up: function() {
    this.elem.className = null;
    WorkPage.saveSession();
  }
});
