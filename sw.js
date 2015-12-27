var VERSION = 2.4;
console.log("Service Worker version", VERSION);

importScripts('/js/cache-polyfill.js');

self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open('atwork').then(function(cache) {
      return cache.addAll([
        // /
        '/',
        '/index.html',

        // /js
        '/js/atwork.js',
        '/js/material.min.js',
        '/js/material.min.js.map',

        // /style
        '/style/atwork.css',

        // /style/fonts
        '/style/fonts/iconic_fill.afm',
        '/style/fonts/iconic_fill.css',
        '/style/fonts/iconic_fill.eot',
        '/style/fonts/iconic_fill.otf',
        '/style/fonts/iconic_fill.svg',
        '/style/fonts/iconic_fill.ttf',
        '/style/fonts/iconic_stroke.afm',
        '/style/fonts/iconic_stroke.css',
        '/style/fonts/iconic_stroke.eot',
        '/style/fonts/iconic_stroke.otf',
        '/style/fonts/iconic_stroke.svg',
        '/style/fonts/iconic_stroke.ttf'
      ]).then(function() {
        return self.skipWaiting();
      });
    })
  );
});

self.addEventListener('activate', function(event) {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', function(event) {
  console.log(event.request.url);

  event.respondWith(
    caches.match(event.request).then(function(response) {
      return response || fetch(event.request);
    })
  );
});
