/* -*- Mode: Java; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- /
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */

(function() {
	function TimeSpan(ms) {
		if(ms) {
			this.totalmilliseconds = ms;
			this.seconds = Math.floor(ms/1000) % 60;
			this.minutes = Math.floor(ms/60000) % 60;
			this.hours = Math.floor(ms/3600000) % 24;
		}
	}

	TimeSpan.prototype = {
		totalmilliseconds: 0,
		seconds: 0,
		minutes: 0,
		hours: 0,
		add: function(other) {
			other = typeof other === "number" ? other : other.totalmilliseconds;
			var ms = this.totalmilliseconds + other;
			return new TimeSpan(ms);
		},
		toString: function() {
			var str = "", self = this;
			[this.hours, this.minutes, this.seconds].forEach(function(num) {
				str += self._zeroFill(num,2) + ":";
			});
			return str.substr(0,str.length - 1);
		},
		_zeroFill: function(num,width) {
			width -= num.toString().length;
			if(width > 0)
				return new Array(width + (/\./.test(num) ? 2 : 1)).join('0') + num;
			
			return num;
		}

	};

	function Timer() {
		this.time = new TimeSpan();
		this._elem = document.getElementById('current-time');
		this._btn = document.getElementsByName('start')[0];

		this._btn.addEventListener('click', this);
	}

	Timer.prototype = {
		running: false,
		start: function() {
			this.running = true;
			this._begin = new Date();
			this._id = setInterval(this.update.bind(this), 500);
		
			this.setBtnText("stop");
		},
		stop: function() {
			this.running = false;
			clearInterval(this._id);
			this._id = null;

			this.time = this.elapsed;

			this.setBtnText("start");
		},
		update: function() {
			var ts = this.elapsed;
			this._elem.innerHTML = ts.toString();
		},
		handleEvent: function timerHandle(e) {
      if(e.type === 'click')
			  this.running ? this.stop() : this.start();

      e.preventDefault();
		},
		setBtnText: function(text) {
			this._btn.innerHTML = text;
		},
		get elapsed() {
			if(!this._begin)
				return NaN;

			var now = new Date();
			var ms = now - this._begin;
			return this.time.add(ms);
		}
	};

	Timer.init = function() {
		this.timer = new Timer();
	};

	window.addEventListener('load', function winLoad(e) {
		window.removeEventListener('load', winLoad);
		Timer.init();
	});

}).call(this);
