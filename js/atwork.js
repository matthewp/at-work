(function() {
	var timer;

	function TimeSpan(ms) {
		this.seconds = Math.floor(ms / 1000);
		this.minutes = Math.floor(this.seconds / 60);
		this.hours = Math.floor(this.minutes / 60);
	}

	function Timer() {
		this._elem = document.getElementById('current-time');
	}

	Timer.prototype = {
		start: function() {
			this._begin = new Date();
			this._id = setInterval(this.update.bind(this), 500);
		},
		stop: function() {
			clearInterval(this._id);
		},
		update: function() {
			var now = new Date();
			var ms = now - this._begin;
			var ts = new TimeSpan(ms);
			this._elem.innerText = ts.minutes + ":" + ts.seconds;
		}
	};

	window.addEventListener('load', function winLoad(e) {
		window.removeEventListener('load', winLoad);

		var startTimer = function(e) {
			timer = new Timer();
			timer.start();
			e.preventDefault();
		};
		
		document.getElementById('btn').addEventListener('click', startTimer);
	});

}).call(this);
