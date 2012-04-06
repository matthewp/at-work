var monthNames = [
  'January', 'February', 'March',
  'April', 'May', 'June', 'July',
  'August', 'September', 'October',
  'November', 'December'
];

function getMonthName(date, short) {
  var mn = monthNames[date.getMonth()];
  return short ? mn.substr(0, 3) : mn;
}

var SessionList = {
  init: function() {
    this.sessions = [];
    this.base = document.getElementById('main');

    Session.getAll(this.got.bind(this));
  },

  got: function(sessions) {
    this.sessions = sessions;
  },

  add: function(session) {
    this.sessions.push(session);
  },

  show: function() {
    var base = this.base;
    base.innerHTML = '';

    var ul = document.createElement('ul');
    ul.className = 'sessions';

    this.sessions.forEach(function(session) {
      var li = document.createElement('li');
      li.id = session.id;

      var date = session.beginDate;
      var left = document.createElement('span');
      left.className = 'date';
      left.textContent = getMonthName(date, true)
        + ' ' + date.getDate();

      var right = document.createElement('span');
      right.className = 'time';
      right.textContent = session.time.toString();

      var rule = document.createElement('hr');

      li.appendChild(left);
      li.appendChild(right);
      li.appendChild(rule);

      var hammer = new Hammer(li);
      hammer.ondragstart = this.dragStart.bind(this);
      hammer.ondrag = this.dragging.bind(this);
      hammer.ondragend = this.dragEnd.bind(this);

      ul.appendChild(li);
    }, this);

    base.appendChild(ul);
  },

  dragStart: function(e) {
    if(e.direction !== 'left')
      return;

    this.isDragging = true;
    this.lastX = 0;
  },

  dragging: function(e) {
    if(!this.isDragging)
      return;

    var dx = e.distanceX - this.lastX,
        el = e.originalEvent.target;

    window.requestAnimationFrame(function() {
      el.style[transformStyle] = 'translateX(' + dx + 'px)';
    });
  },

  dragEnd: function(e) {
    this.isDragging = false;

    var w = window.innerWidth,
        p = w / e.distance,
        el = e.originalEvent.target,
        s = el.style,
        transVal = 'all .25s ease-in-out',
        frame;

    var remove = function(then) {
      var events = 'transitionend oTransitionEnd webkitTransitionEnd'.split(' ');

      events.forEach(function(evt) {
        el.addEventListener(evt, function untrans() {
          s[transitionStyle] = '';
          events.forEach(function(evt) {
            el.removeEventListener(evt, untrans);
          });

          (then || function(){})();
        });
      });
    }

    if(p > 3) {
      frame = function() {
        s[transitionStyle] = transVal;
        s[transformStyle] = 'translateX(0px)';
        remove();
      };
    } else {
      frame = function() {
        s[transitionStyle] = transVal;
        s[transformStyle] = 'translate(-' + w + 'px)';
        remove(function() {
          var ul = el.parentElement;
          ul.removeChild(el);
        });
      };
    }

    window.requestAnimationFrame(frame);
  }
};
