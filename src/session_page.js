Bram.element({
  tag: "session-page",
  template: "#sessionpage-template",
  useShadow: false,

  setters: {
    session: function(bind, session){
      var date = session.beginDate;
      this.querySelector('.date').textContent = getMonthName(date) +
        ' ' + date.getDate();

      this.querySelector('.time').textContent = session.time.toString();
    }
  }
});
