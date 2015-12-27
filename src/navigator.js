var Navigator = {
  go: function(state){
    var page = state.page;
    switch(page) {
      case 'work':
        App.work.up(true);
        break;
      case 'log':
        App.log.up(true);
        break;
    }
  },

  save: function(state, title, url){
    return;

    var currentState = history.state || {};
    if(state.page !== currentState.page) {
      history.pushState(state, title, url);
    }
  }
};
