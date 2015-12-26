function extend(parent, proto, notAConstructor) {
  var toExtend = notAConstructor === true ? parent : parent.prototype;
  var base = Object.create(toExtend);

  Object.keys(proto).forEach(function(key) {
    base[key] = proto[key];
  });

  return base;
}
