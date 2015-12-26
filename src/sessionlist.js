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
    this.base = document.getElementById('log-content');

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

    var t = document.getElementById('session-template');

    this.sessions.forEach(function(session){
      var li = t.content.querySelector('li');
      li.id = session.id;
      li.onclick = function(){
        console.log('you clicked', session.id);
      };

      var date = session.beginDate;
      var left = t.content.querySelector('.date');
      left.textContent = getMonthName(date, true)
        + ' ' + date.getDate();

      var right = t.content.querySelector('.time');
      right.textContent = session.time.toString();

      var clone = document.importNode(t.content, true);
      ul.appendChild(clone);
    });

    base.appendChild(ul);

    Navigator.save({page:'log'}, null, "/log");
  }
};
