Bram.element({
  tag: "action-bar",
  template: "#action-bar-template",
  useShadow: false,

  props: ['actions'],

  created: function(bind){
    this.actions.subscribe(detail => {
      if(detail.action === 'add')
        this.addActions(detail);
      else
        this.removeActions();
    });
  },

  proto: {
    addActions: function(detail){
      var el = document.createElement(detail.tag);
      detail.bind(el);
      this.current = el;
      this.appendChild(el);
    },
    removeActions: function(){
      if(this.current) {
        this.current.parentNode.removeChild(this.current);
        this.current = undefined;
      }
    }
  }

});
