function Work() {
  this.elem = document.getElementById('work');
}

Work.prototype = extend(Button, {
  up: function(fromEvent) {
    WorkPage.show();

    if(fromEvent) {
      this.elem.show();
    }
  }
});
