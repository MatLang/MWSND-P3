!function a(i,u,c){function s(n,e){if(!u[n]){if(!i[n]){var t="function"==typeof require&&require;if(!e&&t)return t(n,!0);if(l)return l(n,!0);var r=new Error("Cannot find module '"+n+"'");throw r.code="MODULE_NOT_FOUND",r}var o=u[n]={exports:{}};i[n][0].call(o.exports,function(e){var t=i[n][1][e];return s(t||e)},o,o.exports,a,i,u,c)}return u[n].exports}for(var l="function"==typeof require&&require,e=0;e<c.length;e++)s(c[e]);return s}({1:[function(e,t,n){"use strict";var r=function(){function r(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(e,t,n){return t&&r(e.prototype,t),n&&r(e,n),e}}();var o,a,i=e("idb"),u=(o=i)&&o.__esModule?o:{default:o},c=function(){function i(){!function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,i)}return r(i,null,[{key:"fetchRestaurants",value:function(t){this.getCachedMessages().then(function(e){if(0<e.length)return t(null,e);fetch("http://localhost:1337/restaurants").then(function(e){return e.json()}).then(function(n){return Promise.all(n.map(function(t){return fetch("http://localhost:1337/reviews/?restaurant_id="+t.id).then(function(e){return e.json()}).then(function(e){return t.reviews=e,a.then(function(e){if(e){var t=i.openObjectStore(e,"restaurants","readwrite");return n.forEach(function(e){return t.put(e)}),t.openCursor(null,"prev").then(function(e){return e.advance(30)}).then(function e(t){if(t)return t.delete(),t.continue().then(e)})}})})})).then(function(e){return t(null,n)})})})}},{key:"fetchRestaurantById",value:function(r,o){i.fetchRestaurants(function(e,t){if(e)o(e,null);else{var n=t.find(function(e){return e.id==r});n?o(null,n):o("Restaurant does not exist",null)}})}},{key:"fetchRestaurantByCuisine",value:function(r,o){i.fetchRestaurants(function(e,t){if(e)o(e,null);else{var n=t.filter(function(e){return e.cuisine_type==r});o(null,n)}})}},{key:"fetchRestaurantByNeighborhood",value:function(r,o){i.fetchRestaurants(function(e,t){if(e)o(e,null);else{var n=t.filter(function(e){return e.neighborhood==r});o(null,n)}})}},{key:"fetchRestaurantByCuisineAndNeighborhood",value:function(r,o,a){i.fetchRestaurants(function(e,t){if(e)a(e,null);else{var n=t;"all"!=r&&(n=n.filter(function(e){return e.cuisine_type==r})),"all"!=o&&(n=n.filter(function(e){return e.neighborhood==o})),a(null,n)}})}},{key:"fetchNeighborhoods",value:function(o){i.fetchRestaurants(function(e,n){var r,t;e?o(e,null):(r=n.map(function(e,t){return n[t].neighborhood}),t=r.filter(function(e,t){return r.indexOf(e)==t}),o(null,t))})}},{key:"fetchCuisines",value:function(o){i.fetchRestaurants(function(e,n){var r,t;e?o(e,null):(r=n.map(function(e,t){return n[t].cuisine_type}),t=r.filter(function(e,t){return r.indexOf(e)==t}),o(null,t))})}},{key:"urlForRestaurant",value:function(e){return"./restaurant.html?id="+e.id}},{key:"imageUrlForRestaurant",value:function(e){return 10==e.id?"images/10.webp":"images/"+e.photograph+".webp"}},{key:"mapMarkerForRestaurant",value:function(e,t){return new google.maps.Marker({position:e.latlng,title:e.name,url:i.urlForRestaurant(e),map:t,animation:google.maps.Animation.DROP})}},{key:"openObjectStore",value:function(e,t){var n=arguments.length<=2||void 0===arguments[2]?"readonly":arguments[2];return e.transaction(t,n).objectStore(t)},enumerable:!0},{key:"openDatabase",value:u.default.open("restaurants",1,function(e){e.objectStoreNames.contains("restaurants")||e.createObjectStore("restaurants",{keyPath:"id"}),e.objectStoreNames.contains("favqueue")||e.createObjectStore("favqueue"),e.objectStoreNames.contains("reviewqueue")||e.createObjectStore("reviewqueue")}),enumerable:!0},{key:"getCachedMessages",value:function(){return(a=this.openDatabase).then(function(e){if(e)return i.openObjectStore(e,"restaurants").getAll()})},enumerable:!0}]),i}();t.exports=c},{idb:3}],2:[function(e,t,n){"use strict";var r,o=e("./dbhelper"),m=(r=o)&&r.__esModule?r:{default:r},v=function(){navigator.serviceWorker.ready.then(function(e){e.sync.register("reviewqueue")})};document.getElementById("submit-button").addEventListener("click",function(){var e=document.getElementById("reviews-form"),t=document.getElementById("reviewer-name").value,n=e.textarea.value,r=document.querySelectorAll('input[type="radio"]'),o=window.location.href.split("=")[1],a=0,i=!0,u=!1,c=void 0;try{for(var s,l=r[Symbol.iterator]();!(i=(s=l.next()).done);i=!0){var f=s.value;if(1==f.checked){f.id,a=f.value,f.checked=!1;break}}}catch(e){u=!0,c=e}finally{try{!i&&l.return&&l.return()}finally{if(u)throw c}}var d={restaurant_id:o,name:t,rating:a,comments:n,createdAt:Date.now(),updatedAt:Date.now()};e.textarea.value="",document.getElementById("reviewer-name").value="";var p,h=y(d);return document.getElementById("reviews-list").appendChild(h),p=d,m.default.openDatabase.then(function(o){return m.default.openObjectStore(o,"restaurants","readonly").get(parseInt(p.restaurant_id)).then(function(e){var t,n,r;return e.reviews.push(p),Promise.all([(r=m.default.openObjectStore(o,"reviewqueue","readwrite"),r.put(p,p.createdAt),r.complete),(t=e,n=m.default.openObjectStore(o,"restaurants","readwrite"),n.put(t),n.complete)]).then(function(){return v()})})})}),window.initMap=function(){a(function(e,t){e?console.error("error",e):s()})};var a=function(n){if(self.restaurant)n(null,self.restaurant);else{var e=l("id");e?m.default.fetchRestaurantById(e,function(e,t){(self.restaurant=t)?(i(),n(null,t)):console.error(e)}):(error="No restaurant id in URL",n(error,null))}},i=function(){var e=arguments.length<=0||void 0===arguments[0]?self.restaurant:arguments[0],t=(e.latlng,e.latlng.lat),n=e.latlng.lng,r="https://maps.googleapis.com/maps/api/staticmap?center="+t+","+n+"&zoom=13&size=1000x700&maptype=roadmap&markers=color:red%7Clabel:C%7C"+t+","+n+"&key=AIzaSyDVxFd5ZApqxb_0P4jR0gHRBRnwyipiZSI",o=document.getElementById("map"),a=document.createElement("img");a.src=r,a.id="map-image",o.appendChild(a),document.getElementById("restaurant-name").innerHTML=e.name,document.getElementById("restaurant-address").innerHTML=e.address;var i=document.getElementById("restaurant-img");i.className="restaurant-img",i.alt="Picture of restaurant: "+e.name,i.src=m.default.imageUrlForRestaurant(e),document.getElementById("restaurant-cuisine").innerHTML=e.cuisine_type,e.operating_hours&&u(),c()},u=function(){var e=arguments.length<=0||void 0===arguments[0]?self.restaurant.operating_hours:arguments[0],t=document.getElementById("restaurant-hours");for(var n in e){var r=document.createElement("tr"),o=document.createElement("td");o.innerHTML=n,r.appendChild(o);var a=document.createElement("td");a.innerHTML=e[n],r.appendChild(a),t.appendChild(r)}},c=function(){var e=arguments.length<=0||void 0===arguments[0]?self.restaurant.reviews:arguments[0],t=document.getElementById("reviews-container"),n=document.createElement("h3");if(n.innerHTML="Reviews",t.appendChild(n),!e){var r=document.createElement("p");return r.setAttribute("class","white"),r.innerHTML="No reviews yet!",void t.appendChild(r)}var o=document.getElementById("reviews-list");e.forEach(function(e){o.appendChild(y(e))}),t.appendChild(o)},y=function(e){var t=document.createElement("li");t.setAttribute("tabindex",0);var n=document.createElement("p");n.innerHTML=e.name,t.appendChild(n);var r=document.createElement("p");r.innerHTML=new Date(e.createdAt).toDateString(),t.appendChild(r);var o=document.createElement("p");o.innerHTML="Rating: "+e.rating,t.appendChild(o);var a=document.createElement("p");return a.innerHTML=e.comments,t.appendChild(a),t},s=function(){var e=arguments.length<=0||void 0===arguments[0]?self.restaurant:arguments[0],t=document.getElementById("breadcrumb"),n=document.createElement("li");return n.innerHTML=e.name,n.setAttribute("aria-current","page"),t.appendChild(n),t},l=function(e,t){t||(t=window.location.href),e=e.replace(/[\[\]]/g,"\\$&");var n=new RegExp("[?&]"+e+"(=([^&#]*)|&|#|$)").exec(t);return n?n[2]?decodeURIComponent(n[2].replace(/\+/g," ")):"":null};document.getElementById("toggle").addEventListener("click",function(e){var t=self.map;HTMLElement;this.hasAttribute("checked")?(this.removeAttribute("checked"),this.innerHTML="Open Map",this.setAttribute("aria-label","Open Map")):(this.setAttribute("checked",""),this.setAttribute("aria-label","Hide Map"),this.innerHTML="Hide Map")})},{"./dbhelper":1}],3:[function(e,p,t){"use strict";!function(){function i(n){return new Promise(function(e,t){n.onsuccess=function(){e(n.result)},n.onerror=function(){t(n.error)}})}function a(n,r,o){var a,e=new Promise(function(e,t){i(a=n[r].apply(n,o)).then(e,t)});return e.request=a,e}function e(e,n,t){t.forEach(function(t){Object.defineProperty(e.prototype,t,{get:function(){return this[n][t]},set:function(e){this[n][t]=e}})})}function t(t,n,r,e){e.forEach(function(e){e in r.prototype&&(t.prototype[e]=function(){return a(this[n],e,arguments)})})}function n(t,n,r,e){e.forEach(function(e){e in r.prototype&&(t.prototype[e]=function(){return this[n][e].apply(this[n],arguments)})})}function r(e,r,t,n){n.forEach(function(n){n in t.prototype&&(e.prototype[n]=function(){return e=this[r],(t=a(e,n,arguments)).then(function(e){if(e)return new u(e,t.request)});var e,t})})}function o(e){this._index=e}function u(e,t){this._cursor=e,this._request=t}function c(e){this._store=e}function s(n){this._tx=n,this.complete=new Promise(function(e,t){n.oncomplete=function(){e()},n.onerror=function(){t(n.error)},n.onabort=function(){t(n.error)}})}function l(e,t,n){this._db=e,this.oldVersion=t,this.transaction=new s(n)}function f(e){this._db=e}e(o,"_index",["name","keyPath","multiEntry","unique"]),t(o,"_index",IDBIndex,["get","getKey","getAll","getAllKeys","count"]),r(o,"_index",IDBIndex,["openCursor","openKeyCursor"]),e(u,"_cursor",["direction","key","primaryKey","value"]),t(u,"_cursor",IDBCursor,["update","delete"]),["advance","continue","continuePrimaryKey"].forEach(function(n){n in IDBCursor.prototype&&(u.prototype[n]=function(){var t=this,e=arguments;return Promise.resolve().then(function(){return t._cursor[n].apply(t._cursor,e),i(t._request).then(function(e){if(e)return new u(e,t._request)})})})}),c.prototype.createIndex=function(){return new o(this._store.createIndex.apply(this._store,arguments))},c.prototype.index=function(){return new o(this._store.index.apply(this._store,arguments))},e(c,"_store",["name","keyPath","indexNames","autoIncrement"]),t(c,"_store",IDBObjectStore,["put","add","delete","clear","get","getAll","getKey","getAllKeys","count"]),r(c,"_store",IDBObjectStore,["openCursor","openKeyCursor"]),n(c,"_store",IDBObjectStore,["deleteIndex"]),s.prototype.objectStore=function(){return new c(this._tx.objectStore.apply(this._tx,arguments))},e(s,"_tx",["objectStoreNames","mode"]),n(s,"_tx",IDBTransaction,["abort"]),l.prototype.createObjectStore=function(){return new c(this._db.createObjectStore.apply(this._db,arguments))},e(l,"_db",["name","version","objectStoreNames"]),n(l,"_db",IDBDatabase,["deleteObjectStore","close"]),f.prototype.transaction=function(){return new s(this._db.transaction.apply(this._db,arguments))},e(f,"_db",["name","version","objectStoreNames"]),n(f,"_db",IDBDatabase,["close"]),["openCursor","openKeyCursor"].forEach(function(a){[c,o].forEach(function(e){e.prototype[a.replace("open","iterate")]=function(){var e,t=(e=arguments,Array.prototype.slice.call(e)),n=t[t.length-1],r=this._store||this._index,o=r[a].apply(r,t.slice(0,-1));o.onsuccess=function(){n(o.result)}}})}),[o,c].forEach(function(e){e.prototype.getAll||(e.prototype.getAll=function(e,n){var r=this,o=[];return new Promise(function(t){r.iterateCursor(e,function(e){e?(o.push(e.value),void 0===n||o.length!=n?e.continue():t(o)):t(o)})})})});var d={open:function(e,t,n){var r=a(indexedDB,"open",[e,t]),o=r.request;return o.onupgradeneeded=function(e){n&&n(new l(o.result,e.oldVersion,o.transaction))},r.then(function(e){return new f(e)})},delete:function(e){return a(indexedDB,"deleteDatabase",[e])}};void 0!==p?p.exports=d:self.idb=d}()},{}]},{},[2]);
//# sourceMappingURL=restaurant_info.js.map
