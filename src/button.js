function Button(elem) {
  this.elem = elem;
}

Button.prototype = {
  listen: function() {
    this.elem.addEventListener('click', this);
    return this;
  },

  unload: function() {
    this.elem.removeEventListener('click', this);
    return this;
  },

  down: function() { },
  up: function() { },

  handleEvent: function(e) {
    switch(e.type) {
      case 'touchstart':
      case 'mousedown':
        this.down(e);
        break;
      case 'touchend':
      case 'mouseup':
      case 'click':
        this.up(e);
        break;
    }

    //e.preventDefault();
  }
};
