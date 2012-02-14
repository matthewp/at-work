window.addEventListener('load', function winLoad(e) {
  window.removeEventListener('load', winLoad);
  Timer.init();
  SessionList.init();
  Section.init();
  (new Work()).listen();
  (new Log()).listen();
});
