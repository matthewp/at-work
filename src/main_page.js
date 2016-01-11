Bram.element({
  tag: "main-page",
  template: "#main-template",
  useShadow: false,

  created: function(bind, shadow){
    componentHandler.upgradeElements(shadow.childNodes);
  }

});
