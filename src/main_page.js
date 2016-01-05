var state = Bram.state({
  page: "main"
});

Bram.element({
  tag: "main-page",
  template: "#main-template",
  useShadow: false,

  created: function(bind, shadow){
    componentHandler.upgradeElements(shadow.childNodes);

    this.log = new Log().listen();
    this.mdlUpgraded().then(work => work.show())
  },

  proto: {
    mdlUpgraded: function() {
      if(this._mdlUpgradePromise) return this.mdlUpgradePromise;
      return this._mdlPromise = new Promise(function(resolve){
        var work = document.getElementById("work");
        work.addEventListener("mdl-componentupgraded", function onupgrade(){
          work.removeEventListener("mdl-componentupgraded", onupgrade);
          resolve(work);
        });
      });
    }
  }

});

var MainPage = {
  init: function() {
    this.base = document.getElementsByTagName('main')[0];

    this.mainDom = {
      'fixed-tab-1': true,
      'fixed-tab-2': true
    };

    /*WorkPage.init();
    SessionList.init();
    SessionPage.init();
    DrawerButton.init();
    this.work = new Work();
    this.work.listen();

    this.log = new Log();
    this.log.listen();*/
  },

  show: function() {
    debugger;
    visibility.show(mainTabs());

    var base = this.base;
    var mainDom = this.mainDom;

    this.childEach(function(elem) {
      if(elem instanceof HTMLElement) {
        if(mainDom[elem.id]) {
          visibility.show(elem);
        } else {
          base.removeChild(elem);
        }
      }
    });
  },

  hide: function() {
    var base = this.base;
    var mainDom = this.mainDom;
    visibility.hide(mainTabs());

    this.childEach(function(elem){
      if(elem instanceof HTMLElement) {
        if(mainDom[elem.id]) {
          visibility.hide(elem);
        }
      }
    });
  },

  childEach: function(callback) {
    var elems = [].slice.call(this.base.childNodes);
    elems.forEach(callback);
  },

  isShowing: function() {
    var tabs = mainTabs();
    return visibility.isShowing(tabs);
  }
};
