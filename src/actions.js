// TODO not sure what this will do, but this is action items.
var Actions = extend(Listener, {
  init: function() {
    Listener.call(this);
  },

  upgrade: function(elem){
    var buttons = elem.querySelectorAll('button') || [];
    [].forEach(function(button){
      componentHandler.upgradeElement(button);
    });
  }
});
