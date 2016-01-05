var Navigator = {
  go: function(state){
    var page = state.page;
    switch(page) {
      case 'work':
        MainPage.work.up(true);
        break;
      case 'log':
        MainPage.log.up(true);
        break;
    }
  },

  save: function(state, title, url){
    var currentState = history.state || {};
    if(state.page !== currentState.page) {
      history.pushState(state, title, url);
    }
  }
};
