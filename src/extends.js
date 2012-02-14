function extends(parent, proto) {
  var base = parent.prototype;

  Object.keys(proto).forEach(function(key) {
    base[key] = proto[key];
  });

  return base;
}
