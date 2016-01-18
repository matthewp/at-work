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

Bram.element({
  tag: "session-list",
  template: "#sessionlist-template",
  useShadow: false,

  props: ["sessions"],

  created: function(bind){
    var anyLabelSelected = Rx.Observable.fromEvent(this, 'label-clicked')
      .map(ev => {
        ev.detail.stopPropagation();
        return ev.detail.target.checked ? 1 : -1
      })
      .startWith(0)
      .scan((acc, value) => acc + value)
      .map(val => val > 0)
      .distinctUntilChanged();

    bind.list(this.sessions, 'id', 'template', '.sessions', function(el, session){
      var date = session.beginDate;
      el.querySelector('.date').textContent = getMonthName(date, true)
        + ' ' + date.getDate();

      el.querySelector('.time').textContent = session.time;

      // Upgrade input element
      var label = el.querySelector('label input');
      componentHandler.upgradeElement(label);

      var li = el.querySelector('li');
      var sessionClicked = Rx.Observable.fromEvent(li, 'click')
        .map(() => ({ page: 'session', data: session }));

      Bram.send(this, sessionClicked, 'page-change');

      var label = li.querySelector('label');
      var labelsClicked = Rx.Observable.fromEvent(label, 'click')
      Bram.send(this, labelsClicked, 'label-clicked');
    });

    var sessionActions = this.sessions.flatMap(sessions => {
      return anyLabelSelected.map(selected => ({
        selected: selected,
        sessions: sessions
      }));
    }).map(ev => {
      return {
        action: ev.selected ? 'add' : 'remove',
        tag: 'sessionlist-action-bar',
        bind: function(el){
          el.sessions = ev.sessions;
        }
      };
    });
    Bram.send(this, sessionActions, 'action-bar-change');
  }
});

var SessionList = {
  init: function() {
    this.sessions = [];
    this.base = document.getElementById('log-content');
    this.listeners = [];

    Session.getAll(this.got.bind(this));
  },

  unload: function() {
    this.listeners.forEach(function(button) { button.unload(); });
    this.listeners = [];
    SessionListActions.unload();
  },

  got: function(sessions) {
    this.sessions = sessions;
  },

  add: function(session) {
    this.sessions.push(session);
  },

  itemsSelected: function(){
    var base = this.base;
    var checks = base.querySelectorAll('.sessionlist-item input');
    var selected = [].some.call(checks, function(elem) {
      return !!elem.checked;
    });

    if(selected) {
      // TODO show the buttons
      SessionListActions.show();
    } else {
      // Don't show the buttons
      SessionListActions.unload();
    }
  },

  show: function() {
    var base = this.base;
    base.innerHTML = '';

    var ul = document.createElement('ul');
    ul.className = 'sessions';

    var t = document.getElementById('session-template');

    this.sessions.forEach(function(session){
      var clone = document.importNode(t.content, true);
      var li = clone.querySelector('li');
      li.id = session.id;
      this.listeners.push(new ListSessionButton(li, session).listen());

      var inputId = 'cb-' + session.id;
      var label = li.querySelector('label');
      label.setAttribute('for', inputId);
      this.listeners.push(new SessionCheckbox(label, this).listen());

      var input = li.querySelector('label input');
      input.id = inputId;
      input.dataset.id = session.id;
      componentHandler.upgradeElement(label);

      var date = session.beginDate;
      var left = clone.querySelector('.date');
      left.textContent = getMonthName(date, true)
        + ' ' + date.getDate();

      var right = clone.querySelector('.time');
      right.textContent = session.time.toString();

      ul.appendChild(clone);
    }.bind(this));

    base.appendChild(ul);

    Navigator.save({page:'log'}, null, "/log");
  }
};
