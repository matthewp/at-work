var Section = {
  init: function() {
    this.elem = document.getElementById('active');
  },

  left: function() {
    this.elem.className = 'left';
  },

  right: function() {
    this.elem.className = 'right';
  }
};
