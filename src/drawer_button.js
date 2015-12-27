var DrawerButton = {
  init: function() {
    this.base = document.querySelector('.mdl-layout__drawer-button');
  },

  drawer: function() {
    this.setIcon('menu');
    this.base.removeEventListener('click', this);
  },

  back: function() {
    this.setIcon('arrow_back');
    this.base.addEventListener('click', this, true);
  },

  handleEvent: function(e) {
    switch(e.type) {
      case 'click':
        e.stopPropagation();
        history.back();
        break;
    }
  },

  setIcon: function(txt) {
    this.base.querySelector('i').textContent = txt;
    componentHandler.upgradeElement(this.base);
  }
};
