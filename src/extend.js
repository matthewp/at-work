function extend(parent, proto) {
  var base = Object.create(parent.prototype);

  Object.keys(proto).forEach(function(key) {
    base[key] = proto[key];
  });

  return base;
}
