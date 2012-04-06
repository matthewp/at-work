var monthNames = [
  'January', 'February', 'March',
  'April', 'May', 'June', 'July',
  'August', 'September', 'October',
  'November', 'December'
];

function getMonthName(date, short) {
  var mn = monthNames[date.getMonth()];
  return short ? mn.substr(0, 3) : mn;
}

var SessionList = {
  init: function() {
    this.sessions = [];
    this.base = document.getElementById('main');

    Session.getAll(this.got.bind(this));
  },

  got: function(sessions) {
    this.sessions = sessions;
  },

  add: function(session) {
    this.sessions.push(session);
  },

  show: function() {
    var base = this.base;
    base.innerHTML = '';

    var ul = document.createElement('ul');
    ul.className = 'sessions';

    this.sessions.forEach(function(session) {
      var li = document.createElement('li');
      li.id = session.id;

      var date = session.beginDate;
      var left = document.createElement('span');
      left.className = 'date';
      left.textContent = getMonthName(date, true)
        + ' ' + date.getDate();

      var right = document.createElement('span');
      right.className = 'time';
      right.textContent = session.time.toString();

      var rule = document.createElement('hr');

      li.appendChild(left);
      li.appendChild(right);
      li.appendChild(rule);

      var hammer = new Hammer(li);
      hammer.ondragstart = this.dragStart;
      hammer.ondrag = this.dragging;
      hammer.ondragend = this.dragEnd;

      ul.appendChild(li);
    }, this);

    base.appendChild(ul);
  },

  dragStart: function(e) {
    var args = Array.prototype.slice.call(arguments);
  },

  dragging: function(e) {
    var args = Array.prototype.slice.call(arguments);
  },

  dragEnd: function(e) {
    var args = Array.prototype.slice.call(arguments);
  }
};
