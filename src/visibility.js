var visibility = {
  show: function(elem) {
    elem.style.display = elem._oldDisplay || 'block';
    elem._oldDisplay = undefined;
  },

  hide: function(elem) {
    elem._oldDisplay = elem.style.display;
    elem.style.display = 'none';
  }
};
