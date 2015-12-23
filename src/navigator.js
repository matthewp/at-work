var Navigator = {
  go: function(state){
    var page = state.page;
    switch(page) {
      case 'work':
        App.work.up();
        break;
      case 'log':
        App.log.up();
        break;
    }
  },

  save: function(state, title, url){
    return; // current disabled
    history.pushState(state, title, url);
  }
};
