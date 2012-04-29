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

    Eventable.call(this);
    var self = this,
        proto = Eventable.prototype;

    Object.keys(proto).forEach(function(key) {
      if(Eventable.hasOwnProperty(key) {
        self[key] = proto[key];
      }
    });
  },

  got: function(sessions) {
    this.sessions = sessions;
  },

  add: function(session) {
    this.sessions.push(session);
  },

  on: function(evt, action) {

  },

  show: function() {
    var base = this.base,
        ce = document.createElement.bind(document);

    base.innerHTML = '';

    var ul = ce('ul');
    ul.className = 'sessions';

    this.sessions.forEach(function(session) {
      var li = ce('li');
      li.id = session.id;

      var div = ce('div');
      div.className = 'item';

      var info = ce('div');
      info.className = 'info';

      var date = session.beginDate;
      var left = ce('span');
      left.className = 'date';
      left.textContent = getMonthName(date, true)
        + ' ' + date.getDate();

      var right = ce('span');
      right.className = 'time';
      right.textContent = session.time.toString();

      var rule = ce('hr');
      info.appendChild(left);
      info.appendChild(right);
      info.appendChild(rule);
      div.appendChild(info);

      var del = ce('div');
      del.className = 'del';

      var confirm = ce('span');
      confirm.textContent = 'Delete?';

      var cancel = ce('span');
      cancel.textContent = 'Cancel';

      del.appendChild(confirm);
      del.appendChild(cancel);
      div.appendChild(del);
      li.appendChild(div);

      var hammer = new Hammer(info);
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
