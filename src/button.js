function Button(elem) {
  this.elem = elem;
}

Button.prototype = {
  listen: function() {
    this.elem.addEventListener('click', this);
  },

  unload: function() {
    this.elem.removeEventListener('click', this);
  },

  down: function() { },
  up: function() { },

  handleEvent: function(e) {
    switch(e.type) {
      case 'touchstart':
      case 'mousedown':
        this.down();
        break;
      case 'touchend':
      case 'mouseup':
      case 'click':
        this.up();
        break;
    }

    //e.preventDefault();
  }
};
