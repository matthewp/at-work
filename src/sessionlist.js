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
      li.textContent = session.time.toString();

      ul.appendChild(li);
    });

    base.appendChild(ul);
  }
};
