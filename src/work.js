function Work() {
  this.elem = document.getElementById('work');
  this.timer = new Timer();
}

Work.prototype = extend(Button, {
  up: function() {
    // TODO show work page.
    
    Section.left();
  }
});
