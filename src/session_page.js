var SessionPage = {
  init: function() {
    this.base = document.getElementsByTagName('main')[0];
  },

  show: function(session) {
    var base = this.base;
    base.innerHTML = '';

    var t = document.getElementById('sessionpage-template');
    var clone = document.importNode(t.content, true);

    var date = session.beginDate;
    clone.querySelector('span').textContent = getMonthName(date, true) +
      ' ' + date.getDate();

    base.appendChild(clone);
  }
};
