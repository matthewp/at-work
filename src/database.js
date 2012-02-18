var OS_NAME = 'sessions',
    DB_NAME = 'atwork',
    DB_VERSION = 1.1;

window.indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.msIndexedDB;
window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction;
window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange;

function openDB(callback, context) {
  var req = window.indexedDB.open(DB_NAME, DB_VERSION);

  req.onerror = function(e) {
    console.log(e);
    callback(null);
  };

  req.onupgradeneeded = function(e) {
    var db = e.target.result;
    if(!db.objectStoreNames.contains(OS_NAME))
      var os = db.createObjectStore(OS_NAME, { keyPath: "id" });
  };

  req.onsuccess = function(e) {
    var db = e.target.result;

    console.log('Version: ' + db.version + ', DB_VERSION: ' + DB_VERSION);
    if(db.setVersion && db.version != DB_VERSION) {
      var verReq = db.setVersion(DB_VERSION);
      verReq.onfailure = req.onerror;
      verReq.onsuccess = function() {
        req.onupgradeneeded(e);
        openDB(callback, context);
      };

      return;
    }

    var func = context
      ? callback.bind(context)
      : callback;
    func(db);
  };
}
