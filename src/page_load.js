window.addEventListener('load', function winLoad(e) {
  window.removeEventListener('load', winLoad);
  Section.init();
  WorkPage.init();
  SessionList.init();
  (new Work()).listen();
  (new Log()).listen();
});
