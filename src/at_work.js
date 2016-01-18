Bram.element({
  tag: "at-work",
  template: "#atwork-template",
  useShadow: false,

  created: function(bind){
    this.mdlUpgraded().then(work => work.show());
    this.current = {
      page: 'main',
      el: this.querySelector('main-page')
    };

    var poppedRoute = Rx.Observable.fromEvent(window, 'popstate')
      .map(ev => Object.assign({ setRoute: false }, ev.state || {page: 'main'}));

    Bram.send(this, poppedRoute, 'page-change');

    var pageSet = Rx.Observable.fromEvent(this, 'page-change')
      .map(ev => ev.detail);

    pageSet.subscribe((ev) => {
      if(ev.page === this.current.page) return;

      var page = this.pages[ev.page];

      var t = this.querySelector(page.template);
      var clone = document.importNode(t.content, true);
      var newEl = page.bind(clone, ev);

      var placeHolder = document.createTextNode('');
      var parent = this.current.el.parentNode;

      parent.insertBefore(placeHolder, this.current.el);

      // Remove the current node
      if(this.current.page === 'main') {
        this.querySelector('main-page').style.display = 'none';
      } else {
        parent.removeChild(this.current.el);
      }

      // Insert the new page
      if(ev.page === 'main') {
        this.querySelector('main-page').style.display = '';
      } else {
        parent.insertBefore(clone, placeHolder);
      }
      parent.removeChild(placeHolder);

      this.current = {
        page: ev.page,
        el: ev.page === 'main' ? this.querySelector('main-page') : newEl
      };

      if(ev.setRoute !== false && page.route) {
        var route = page.route(ev);
        this.saveHistory(route, ev);
      }
    });

    var mainTabs = this.querySelector('#main-tabs');
    var mainTabsReady = Rx.Observable.fromEvent(mainTabs, 'mdl-componentupgraded')
      .startWith(false)
      .map(val => val && !!this.querySelector('.mdl-layout__tab-bar-container'))
      .filter(val => val);

    // Hide the tab bar when not on the main page.
    var hideTabBar = pageSet.map(ev => ev.page !== 'main').startWith(false)
    mainTabsReady.first().subscribe(() => {
      bind.condAttr('.mdl-layout__tab-bar-container', 'hidden', hideTabBar);
    });

    // Action bar
    var actionBarChange = Rx.Observable.fromEvent(this, 'action-bar-change')
      .map(ev => ev.detail);
    this.querySelector('action-bar').actions = actionBarChange;
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
    },

    saveHistory: function(route, state){
      history.pushState(state, route.title, route.url);
    },

    pages: {
      main: {
        template: '#mainpage-tag-template',
        bind: function(frag){
          return frag.querySelector('main-page');
        },
        route: function(){
          return { url: '/', title: 'At Work' };
        }
      },

      session: {
        template: '#session-tag-template',
        bind: function(frag, event){
          var sp = frag.querySelector('session-page');
          sp.session = event.data;
          return sp;
        },
        route: function(event){
          var session = event.data;
          return {
            url: '/session/' + session.id,
            title: 'Session'
          };
        }
      }
    }
  }
});
