function Work() {
  this.elem = document.getElementById('work');
  this.timer = new Timer();
}

Work.prototype = extends(Button, {
  up: function() {
    var self = this;

    // TODO show work page.


    Section.left();
  }
});
