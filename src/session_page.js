Bram.element({
  tag: "session-page",
  template: "#sessionpage-template",
  useShadow: false,

  proto: {
    get session() {
      return this._session;
    },

    set session(session){
      var date = session.beginDate;
      this.querySelector('.date').textContent = getMonthName(date) +
        ' ' + date.getDate();

      this.querySelector('.time').textContent = session.time.toString();
      this._session = session;
    }
  }
});
