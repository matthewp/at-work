(function() {
'use strict';

var Installer = {
	init: function() {
		var apps = navigator.apps = navigator.apps || navigator.mozApps;
		if(apps && !apps.self) { // Not currently installed.
			var self = this;
			var btn = document.getElementsByName('install')[0];
			[ 'touchend', 'mouseup' ].forEach(function(evt) {
				btn.addEventListener(evt, self);
			});
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

window.addEventListener('load', function winLoad(e) {
	window.removeEventListener('load', winLoad);
	Installer.init();
});

})();
