var App = {};

window.addEventListener('load', function winLoad(e) {
  window.removeEventListener('load', winLoad);
  WorkPage.init();
  SessionList.init();
  SessionPage.init();
  DrawerButton.init();
  App.work = new Work();
  App.work.listen();

  App.log = new Log();
  App.log.listen();

  /*var session = new Session([new TimeSpan(30000)]);
  session.beginDate = new Date(new Date() - 30000);
  new ListSessionButton(null, session).up();*/

});

window.addEventListener('popstate', function(e) {
  Navigator.go(e.state || {page: 'work'});
});
