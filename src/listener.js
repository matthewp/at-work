function Listener() {
  this.listeners = [];
}

Listener.prototype.addListener = function(listener) {
  this.listeners.push(listener);
};

Listener.prototype.unload = function(){
  this.listeners.forEach(function(listener){
    listener.unload();
  });
  this.listeners = [];
};
