var CACHE_NAME = 'restaurant-cache';
var urlsToCache = [
  '/',
  './index.html',
  './restaurant.html',
  './build/public/css/styles.css',
  './build/public/js/main.js',
  './build/public/js/restaurant_info.js',
  './build/public/js/dbhelper.js',
  './build/public/images/1.jpg',
  './build/public/images/2.jpg',
  './build/public/images/3.jpg',
  './build/public/images/4.jpg',
  './build/public/images/5.jpg',
  './build/public/images/6.jpg',
  './build/public/images/7.jpg',
  './build/public/images/8.jpg',
  './build/public/images/9.jpg',
  './build/public/images/10.jpg',
  './build/public/images/1.webp',
  './build/public/images/2.webp',
  './build/public/images/3.webp',
  './build/public/images/4.webp',
  './build/public/images/5.webp',
  './build/public/images/6.webp',
  './build/public/images/7.webp',
  './build/public/images/8.webp',
  './build/public/images/9.webp',
  './build/public/images/10.webp',
  './build/public/images/cutlery.svg',
  './manifest.json'
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function (cache) {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', event => {
  /* if (event.request.method != 'GET') return; */

  event.respondWith(
    caches.match(event.request, { ignoreSearch: true }).then(response => {
      return response || fetch(event.request);
    })
      .catch(err => console.log(err, event.request))
  );
});