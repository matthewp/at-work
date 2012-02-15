function Work() {
  this.elem = document.getElementById('work');
}

Work.prototype = extend(Button, {
  up: function() {
    WorkPage.init();    
    Section.left();
  }
});
