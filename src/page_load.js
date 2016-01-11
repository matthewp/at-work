window.addEventListener('load', function winLoad(e) {
  window.removeEventListener('load', winLoad);

  var sessions = Rx.Observable.fromPromise(Session.getAllP());
  document.querySelector('session-list').sessions = sessions;
});
