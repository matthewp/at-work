function Work() {
  this.elem = document.getElementById('work');
}

Work.prototype = extend(Button, {
  up: function() {
    WorkPage.show();
    Section.left();
  }
});
