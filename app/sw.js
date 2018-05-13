import DBHelper from './js/dbhelper';
import idb from 'idb';

const dbPromise = idb.open('restaurants', 1, upgradeDB => {

  switch (upgradeDB.oldVersion) {
    case 0:
      upgradeDB.createObjectStore('restaurants', { keyPath: 'id' });
    case 1:
      upgradeDB.createObjectStore('favqueue');
  }
});


/*  const dbPromise = DBHelper.openDatabase; */

var CACHE_NAME = 'restaurant-cache';
var urlsToCache = [
  '/',
  './index.html',
  './restaurant.html',
  './css/styles.css',
  './js/main.js',
  './js/restaurant_info.js',
  './js/dbhelper.js',
  './images/1.jpg',
  './images/2.jpg',
  './images/3.jpg',
  './images/4.jpg',
  './images/5.jpg',
  './images/6.jpg',
  './images/7.jpg',
  './images/8.jpg',
  './images/9.jpg',
  './images/10.jpg',
  './images/1.webp',
  './images/2.webp',
  './images/3.webp',
  './images/4.webp',
  './images/5.webp',
  './images/6.webp',
  './images/7.webp',
  './images/8.webp',
  './images/9.webp',
  './images/10.webp',
  './images/cutlery.svg',
  '../../manifest.json'
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
  event.respondWith(
    caches.match(event.request, { ignoreSearch: true }).then(response => {
      return response || fetch(event.request);
    })
      .catch(err => console.log(err, event.request))
  );
});

self.addEventListener('sync', function (event) {
  if (event.tag === 'favqueue') {
    console.log('favqueue');
    event.waitUntil(
      dbPromise.then(db => {
        console.log('in waituntil');
        return db.transaction('favqueue')
          .objectStore('favqueue').getAll()
      }).then(messages => {
        console.log('message', messages);
        return Promise.all(
          messages.map((message) => {
            console.log('fetching');
            return fetch(message.url, {
              method: message.method
            }).then(() => {
              return dbPromise.then(db => {
                console.log('deleting');
                const tx = db.transaction('favqueue', 'readwrite');
                tx.objectStore('favqueue').delete(message.id);
                return tx.complete;
              })
            })
          })
        )
      }).catch(err => console.log(err))
    )
  }
})