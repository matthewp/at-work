function Button(elem) {
  this.elem = elem;
}

Button.prototype = {
  events: function(action) {
    [ 'touchstart', 'touchend', 'mousedown', 'mouseup' ].forEach(function(evt) {
      action(evt);
    });
  },

  listen: function() {
    var self = this;
    self.events(function(evt) {
      self.elem.addEventListener(evt, self);
    });
  },

  unload: function() {
    var self = this;
    self.events(function(evt) {
      self.elem.removeEventListener(evt, self);
    });
  },

  down: function() { },
  up: function() { },

  handleEvent: function(e) {
    switch(e.type) {
      case 'touchstart':
      case 'mousedown':
        // TODO Colors
        this.down();
        break;
      case 'touchend':
      case 'mouseup':
        // TODO Colors
        this.up();
        break;
    }
  }
};
