Bram.element({
  tag: 'sessionlist-action-bar',
  template: '#sessionlistaction-template',
  useShadow: false,

  created: function(){
    var del = this.querySelector('#deletesession-button');
    var delEvents = Rx.Observable.fromEvent(del, 'click');

    delEvents.map(() => this.sessions)
      .map(sessions => {
        debugger;
      })
      .subscribe();
  }
})

function getSelectedSessions() {
    var base = SessionList.base;
    var checks = base.querySelectorAll('.sessionlist-item input');
    var selected = [].filter.call(checks, function(elem){
      return !!elem.checked;
    }).reduce(function(s, elem) {
      s[elem.dataset.id] = true;
      return s;
    }, {});

    var sessions = SessionList.sessions.filter(function(session){
      return !!selected[session.id];
    });

    return sessions;
}

function MergeSessionsButton(elem) {
  this.elem = elem;
}

MergeSessionsButton.prototype = extend(Button, {
  up: function(){
    this.mergeSessions();
  },

  mergeSessions: function() {
    var sessions = getSelectedSessions();

    // TODO sessions is an Array of Session objects. Merge them some how.
  }
});

function DeleteSessionsButton(elem) {
  this.elem = elem;
}

DeleteSessionsButton.prototype = extend(Button, {
  up: function() {
    this.deleteSessions()
      .then(function() {
        return Session.getAllP();
      })
      .then(function(sessions){
        SessionList.unload();
        SessionList.got(sessions);
        SessionList.show();
      });
  },

  deleteSessions: function() {
    var sessions = getSelectedSessions();
    var promises = sessions.map(function(session) {
      return session.destroy();
    });
    return Promise.all(promises);
  }
});

var SessionListActions = extend(Actions, {

  init: function() {
    if(this.inited) return;
    Actions.init.call(this);
    this.base = document.getElementById('actionbar');
    this.inited = true;
  },

  show: function(session) {
    if(this.showing) return;
    if(!this.inited) this.init();

    var base = this.base;
    base.innerHTML = '';

    var t = document.getElementById('sessionlistaction-template');
    var clone = document.importNode(t.content, true);

    this.addListener(
      new MergeSessionsButton(
        clone.getElementById('mergesession-button')).listen()
    );

    this.addListener(
      new DeleteSessionsButton(
        clone.getElementById('deletesession-button')).listen()
    );

    this.upgrade(clone);
    base.appendChild(clone);
    this.showing = true;
  },

  unload: function() {
    if(!this.inited) return;

    Actions.unload.call(this);
    this.base.innerHTML = '';
    this.showing = false;
  }

}, true);
