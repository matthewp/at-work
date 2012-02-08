(function() {
'use strict';

var Installer = {
	init: function() {
		var apps = navigator.apps = navigator.apps || navigator.mozApps;
		if(!apps) {
      notSupported();
      return;
    }

    if(!apps.self) { // Not currently installed.
			var self = this;
			var btn = document.getElementsByName('install')[0];
			[ 'touchend', 'mouseup' ].forEach(function(evt) {
				btn.addEventListener(evt, self);
			});
		} else {
      console.log('At Work already installed.');
    }
	},
	handleEvent: function(e) {
		console.log('Triggering install.');
		this.install();	
	},
	install: function() {
		console.log('Starting install.');
		navigator.apps.install('manifest.webapp', this.installed, this.error);
	},
	installed: function() {
		console.log('Install successful!');
		window.location = 'atwork.html';
	},
	error: function(e) {
		console.log(e);
	}
};

function notSupported() {
  var link = document.getElementsByName('install')[0];
  link.style.display = 'none';

  var warn = document.createElement('span');
  warn.textContent = "Browser doesn't support installation.";
  document.body.appendChild(warn);
}

window.addEventListener('load', function winLoad(e) {
	window.removeEventListener('load', winLoad);
	Installer.init();
});

})();
