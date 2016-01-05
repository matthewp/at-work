function Work() {
  this.elem = document.getElementById('work');
}

Work.prototype = extend(Button, {
  up: withMainPage(function(fromEvent) {
    WorkPage.show();

    if(fromEvent === true) {
      this.elem.show();
    }
  })
});
