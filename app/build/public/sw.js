!function u(i,a,c){function s(n,e){if(!a[n]){if(!i[n]){var t="function"==typeof require&&require;if(!e&&t)return t(n,!0);if(f)return f(n,!0);var r=new Error("Cannot find module '"+n+"'");throw r.code="MODULE_NOT_FOUND",r}var o=a[n]={exports:{}};i[n][0].call(o.exports,function(e){var t=i[n][1][e];return s(t||e)},o,o.exports,u,i,a,c)}return a[n].exports}for(var f="function"==typeof require&&require,e=0;e<c.length;e++)s(c[e]);return s}({1:[function(e,t,n){"use strict";var r=function(){function r(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(e,t,n){return t&&r(e.prototype,t),n&&r(e,n),e}}();var o,u,i=e("idb"),a=(o=i)&&o.__esModule?o:{default:o},c=function(){function i(){!function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,i)}return r(i,null,[{key:"fetchRestaurants",value:function(t){this.getCachedMessages().then(function(e){if(0<e.length)return t(null,e);fetch("http://localhost:1337/restaurants").then(function(e){return e.json()}).then(function(n){return Promise.all(n.map(function(t){return fetch("http://localhost:1337/reviews/?restaurant_id="+t.id).then(function(e){return e.json()}).then(function(e){return t.reviews=e,u.then(function(e){if(e){var t=i.openObjectStore(e,"restaurants","readwrite");return n.forEach(function(e){return t.put(e)}),t.openCursor(null,"prev").then(function(e){return e.advance(30)}).then(function e(t){if(t)return t.delete(),t.continue().then(e)})}})})})).then(function(e){return t(null,n)})})})}},{key:"fetchRestaurantById",value:function(r,o){i.fetchRestaurants(function(e,t){if(e)o(e,null);else{var n=t.find(function(e){return e.id==r});n?o(null,n):o("Restaurant does not exist",null)}})}},{key:"fetchRestaurantByCuisine",value:function(r,o){i.fetchRestaurants(function(e,t){if(e)o(e,null);else{var n=t.filter(function(e){return e.cuisine_type==r});o(null,n)}})}},{key:"fetchRestaurantByNeighborhood",value:function(r,o){i.fetchRestaurants(function(e,t){if(e)o(e,null);else{var n=t.filter(function(e){return e.neighborhood==r});o(null,n)}})}},{key:"fetchRestaurantByCuisineAndNeighborhood",value:function(r,o,u){i.fetchRestaurants(function(e,t){if(e)u(e,null);else{var n=t;"all"!=r&&(n=n.filter(function(e){return e.cuisine_type==r})),"all"!=o&&(n=n.filter(function(e){return e.neighborhood==o})),u(null,n)}})}},{key:"fetchNeighborhoods",value:function(o){i.fetchRestaurants(function(e,n){var r,t;e?o(e,null):(r=n.map(function(e,t){return n[t].neighborhood}),t=r.filter(function(e,t){return r.indexOf(e)==t}),o(null,t))})}},{key:"fetchCuisines",value:function(o){i.fetchRestaurants(function(e,n){var r,t;e?o(e,null):(r=n.map(function(e,t){return n[t].cuisine_type}),t=r.filter(function(e,t){return r.indexOf(e)==t}),o(null,t))})}},{key:"urlForRestaurant",value:function(e){return"./restaurant.html?id="+e.id}},{key:"imageUrlForRestaurant",value:function(e){return 10==e.id?"images/10.webp":"images/"+e.photograph+".webp"}},{key:"mapMarkerForRestaurant",value:function(e,t){return new google.maps.Marker({position:e.latlng,title:e.name,url:i.urlForRestaurant(e),map:t,animation:google.maps.Animation.DROP})}},{key:"openObjectStore",value:function(e,t){var n=arguments.length<=2||void 0===arguments[2]?"readonly":arguments[2];return e.transaction(t,n).objectStore(t)},enumerable:!0},{key:"openDatabase",value:a.default.open("restaurants",1,function(e){e.objectStoreNames.contains("restaurants")||e.createObjectStore("restaurants",{keyPath:"id"}),e.objectStoreNames.contains("favqueue")||e.createObjectStore("favqueue"),e.objectStoreNames.contains("reviewqueue")||e.createObjectStore("reviewqueue")}),enumerable:!0},{key:"getCachedMessages",value:function(){return(u=this.openDatabase).then(function(e){if(e)return i.openObjectStore(e,"restaurants").getAll()})},enumerable:!0}]),i}();t.exports=c},{idb:2}],2:[function(e,h,t){"use strict";!function(){function i(n){return new Promise(function(e,t){n.onsuccess=function(){e(n.result)},n.onerror=function(){t(n.error)}})}function u(n,r,o){var u,e=new Promise(function(e,t){i(u=n[r].apply(n,o)).then(e,t)});return e.request=u,e}function e(e,n,t){t.forEach(function(t){Object.defineProperty(e.prototype,t,{get:function(){return this[n][t]},set:function(e){this[n][t]=e}})})}function t(t,n,r,e){e.forEach(function(e){e in r.prototype&&(t.prototype[e]=function(){return u(this[n],e,arguments)})})}function n(t,n,r,e){e.forEach(function(e){e in r.prototype&&(t.prototype[e]=function(){return this[n][e].apply(this[n],arguments)})})}function r(e,r,t,n){n.forEach(function(n){n in t.prototype&&(e.prototype[n]=function(){return e=this[r],(t=u(e,n,arguments)).then(function(e){if(e)return new a(e,t.request)});var e,t})})}function o(e){this._index=e}function a(e,t){this._cursor=e,this._request=t}function c(e){this._store=e}function s(n){this._tx=n,this.complete=new Promise(function(e,t){n.oncomplete=function(){e()},n.onerror=function(){t(n.error)},n.onabort=function(){t(n.error)}})}function f(e,t,n){this._db=e,this.oldVersion=t,this.transaction=new s(n)}function l(e){this._db=e}e(o,"_index",["name","keyPath","multiEntry","unique"]),t(o,"_index",IDBIndex,["get","getKey","getAll","getAllKeys","count"]),r(o,"_index",IDBIndex,["openCursor","openKeyCursor"]),e(a,"_cursor",["direction","key","primaryKey","value"]),t(a,"_cursor",IDBCursor,["update","delete"]),["advance","continue","continuePrimaryKey"].forEach(function(n){n in IDBCursor.prototype&&(a.prototype[n]=function(){var t=this,e=arguments;return Promise.resolve().then(function(){return t._cursor[n].apply(t._cursor,e),i(t._request).then(function(e){if(e)return new a(e,t._request)})})})}),c.prototype.createIndex=function(){return new o(this._store.createIndex.apply(this._store,arguments))},c.prototype.index=function(){return new o(this._store.index.apply(this._store,arguments))},e(c,"_store",["name","keyPath","indexNames","autoIncrement"]),t(c,"_store",IDBObjectStore,["put","add","delete","clear","get","getAll","getKey","getAllKeys","count"]),r(c,"_store",IDBObjectStore,["openCursor","openKeyCursor"]),n(c,"_store",IDBObjectStore,["deleteIndex"]),s.prototype.objectStore=function(){return new c(this._tx.objectStore.apply(this._tx,arguments))},e(s,"_tx",["objectStoreNames","mode"]),n(s,"_tx",IDBTransaction,["abort"]),f.prototype.createObjectStore=function(){return new c(this._db.createObjectStore.apply(this._db,arguments))},e(f,"_db",["name","version","objectStoreNames"]),n(f,"_db",IDBDatabase,["deleteObjectStore","close"]),l.prototype.transaction=function(){return new s(this._db.transaction.apply(this._db,arguments))},e(l,"_db",["name","version","objectStoreNames"]),n(l,"_db",IDBDatabase,["close"]),["openCursor","openKeyCursor"].forEach(function(u){[c,o].forEach(function(e){e.prototype[u.replace("open","iterate")]=function(){var e,t=(e=arguments,Array.prototype.slice.call(e)),n=t[t.length-1],r=this._store||this._index,o=r[u].apply(r,t.slice(0,-1));o.onsuccess=function(){n(o.result)}}})}),[o,c].forEach(function(e){e.prototype.getAll||(e.prototype.getAll=function(e,n){var r=this,o=[];return new Promise(function(t){r.iterateCursor(e,function(e){e?(o.push(e.value),void 0===n||o.length!=n?e.continue():t(o)):t(o)})})})});var p={open:function(e,t,n){var r=u(indexedDB,"open",[e,t]),o=r.request;return o.onupgradeneeded=function(e){n&&n(new f(o.result,e.oldVersion,o.transaction))},r.then(function(e){return new l(e)})},delete:function(e){return u(indexedDB,"deleteDatabase",[e])}};void 0!==h?h.exports=p:self.idb=p}()},{}],3:[function(e,t,n){"use strict";function r(e){return e&&e.__esModule?e:{default:e}}var o=r(e("./js/dbhelper")),u=r(e("idb")).default.open("restaurants",1,function(e){switch(e.oldVersion){case 0:e.createObjectStore("restaurants",{keyPath:"id"});case 1:e.createObjectStore("favqueue")}}),i=["/","./index.html","./restaurant.html","./css/styles.css","./js/main.js","./js/restaurant_info.js","./js/dbhelper.js","./images/1.jpg","./images/2.jpg","./images/3.jpg","./images/4.jpg","./images/5.jpg","./images/6.jpg","./images/7.jpg","./images/8.jpg","./images/9.jpg","./images/10.jpg","./images/1.webp","./images/2.webp","./images/3.webp","./images/4.webp","./images/5.webp","./images/6.webp","./images/7.webp","./images/8.webp","./images/9.webp","./images/10.webp","./images/cutlery.svg","../../manifest.json"];self.addEventListener("install",function(e){e.waitUntil(caches.open("restaurant-cache").then(function(e){return e.addAll(i)}))}),self.addEventListener("activate",function(e){e.waitUntil(self.clients.claim())}),self.addEventListener("fetch",function(t){t.respondWith(caches.match(t.request,{ignoreSearch:!0}).then(function(e){return e||fetch(t.request)}).catch(function(e){return console.log(e,t.request)}))});self.addEventListener("sync",function(e){"favqueue"===e.tag?e.waitUntil(void u.then(function(e){return e.transaction("favqueue").objectStore("favqueue").getAll()}).then(function(e){return Promise.all(e.map(function(n){return fetch(n.url,{method:n.method}).then(function(e){return u.then(function(e){var t=e.transaction("favqueue","readwrite");return t.objectStore("favqueue").delete(n.id),t.complete})}).catch(function(e){console.log("res",e)})}))})):"reviewqueue"===e.tag&&e.waitUntil(u.then(function(r){return o.default.openObjectStore(r,"reviewqueue","readonly").getAll().then(function(e){return Promise.all(e.map(function(n){return console.log(n),fetch("http://localhost:1337/reviews/",{method:"post",body:JSON.stringify(n)}).then(function(e){var t=r.transaction("reviewqueue","readwrite");return t.objectStore("reviewqueue").delete(n.createdAt),t.complete}).catch(function(e){console.log("err",e)})})).catch(function(e){return console.log(e)})})}).catch(function(e){return console.log(e)}))})},{"./js/dbhelper":1,idb:2}]},{},[3]);
//# sourceMappingURL=sw.js.map
