window.addEventListener('load', function winLoad(e) {
  window.removeEventListener('load', winLoad);

  MainPage.init();
});

window.addEventListener('popstate', function(e) {
  Navigator.go(e.state || {page: 'work'});
});
