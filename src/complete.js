function Complete() {
  this.elem = document.getElementsByName('end')[0];
}

Complete.prototype = extend(Button, {
  down: function() {
    this.elem.classList.add('clicked');
  },

  up: function() {
    this.elem.classList.remove('clicked');
    WorkPage.saveSession();
  }
});
