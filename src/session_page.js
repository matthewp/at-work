var SessionPage = {
  init: function() {
    this.base = document.getElementById('main');
  },

  show: function(session) {
    var base = this.base;
    base.innerHTML = '';

    var container = document.createElement('section');
    container.className = 'session-page';

    var date = session.beginDate;
    var left = document.createElement('span');
    left.className = 'date';
    left.textContent = getMonthName(date, true) + ' ' + date.getDate();

    container.appendChild(left);
    base.appendChild(container);
  }
};
