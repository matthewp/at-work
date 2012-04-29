function Eventable() {
  this.events = new Dict();
}

Eventable.prototype = {

  on: function(evt, action) {
    var items = this.events.get(evt);

    if(!items) {
      items = [];

      this.events.set(evt, items);
    }

    items.push(action);
  },

  trigger: function(evt) {
    var items = this.events.get(evt) || [];

    items.forEach(function(action) {
      action();
    });
  },

  dispose: function() {
    this.trigger('dispose');

    this.events.del('dispose');
  }

};
