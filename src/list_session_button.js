function ListSessionButton(elem, session){
  this.elem = elem;
  this.session = session;
}

ListSessionButton.prototype = extend(Button, {
  up: function(){
    MainPage.hide();
    SessionList.unload();
    SessionPage.show(this.session);
    DrawerButton.back();
  }
});
