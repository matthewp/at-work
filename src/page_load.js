var App = {};

window.addEventListener('load', function winLoad(e) {
  window.removeEventListener('load', winLoad);
  WorkPage.init();
  SessionList.init();
  SessionPage.init();
  App.work = new Work();
  App.work.listen();

  App.log = new Log();
  App.log.listen();
});

window.addEventListener('popstate', function(e) {
  Navigator.go(e.state || {page: 'work'});
});
