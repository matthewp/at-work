var SessionPage = {
  init: function() {
    this.base = document.getElementsByTagName('main')[0];
  },

  show: function(session) {
    var base = this.base;

    var t = document.getElementById('sessionpage-template');
    var clone = document.importNode(t.content, true);

    var date = session.beginDate;
    clone.querySelector('.date').textContent = getMonthName(date) +
      ' ' + date.getDate();

    clone.querySelector('.time').textContent = session.time.toString();

    base.appendChild(clone);

    Navigator.save({page:'session'}, null, "/session/" + session.id);
  }
};
