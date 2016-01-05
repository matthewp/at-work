function mainTabs(){
  return document.getElementById('main-tabs').parentNode;
}

function withMainPage(callback) {
  return function(){
    if(!MainPage.isShowing()) {
      MainPage.show();
    }

    return callback.apply(this, arguments);
  };
}
