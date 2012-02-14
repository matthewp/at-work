function Session(times) {
  this.times = times;
}

Session.prototype = {
  get totalmilliseconds () {
    var ms = 0;
    this.times.forEach(function(time) {
      ms += time.totalmilliseconds;
    });

    return ms;
  },

  get time () {
    if(this._time)
      return this._time;

    this._time = new TimeSpan(this.totalmilliseconds);
    return this._time;
  },

  id: 0,

  save: function() {
    var now = new Date();
    this.id = now.getTime();

    openDB(function(db) {
      var trans = db.transaction([OS_NAME], IDBTransaction.READ_WRITE);
            
      trans.onerror = function(e) {
        console.log(e);
      };

      var os = trans.objectStore(OS_NAME);
      os.add(this);
    }, this);
  }
};

Session.getAll = function(callback) {
  openDB(function(db) {
    var sessions = [];

    var trans = db.transaction([OS_NAME], IDBTransaction.READ_ONLY);
    trans.onerror = function(e) {
      console.log(e);
    };

