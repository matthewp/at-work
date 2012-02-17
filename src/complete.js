function Complete() {
  this.elem = document.getElementsByName('end')[0];
}

Complete.prototype = extend(Button, {
  down: function() {
    this.elem.className += ' clicked';
  },

  up: function() {
    this.elem.className = null;
    WorkPage.saveSession();
  }
});
