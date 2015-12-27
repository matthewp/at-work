function ListSessionButton(elem, session){
  this.elem = elem;
  this.session = session;
}

ListSessionButton.prototype = extend(Button, {
  up: function(){
    visibility.hide(mainTabs());
    SessionList.unload();
    SessionPage.show(this.session);
    DrawerButton.back();
  }
});
