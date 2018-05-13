import DBHelper from './dbhelper';

let restaurants,
  neighborhoods,
  cuisines
var map
var markers = [];

let dbPromise = DBHelper.openDatabase;
let openObjectStore = DBHelper.openObjectStore;


var triggerRequestQueueSync = function () {
  navigator.serviceWorker.ready.then(function (swRegistration) {
    swRegistration.sync.register('favqueue');
  });
}

window.toggleFavorite = function (subject) {
  dbPromise.then(function (db) {
    var restaurantStore = openObjectStore(db, 'restaurants', 'readonly')
    return restaurantStore.get(subject);

  }).then(restaurant => {
    const isFavorite = !(restaurant.is_favorite == 'true');
    restaurant.is_favorite = isFavorite.toString();
    dbPromise.then(function (db) {
      var restaurantStore = openObjectStore(db, 'restaurants', 'readwrite');
      restaurantStore.put(restaurant);
      var favStore = openObjectStore(db, 'favqueue', 'readwrite');
      restaurant.url = `http://localhost:1337/restaurants/${restaurant.id}/?is_favorite=${isFavorite}`;
      restaurant.method = "put";
      favStore.put(restaurant, restaurant.id);
      restaurantStore.complete;
      favStore.complete;
      triggerRequestQueueSync();
    })
  })
};

/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded. asd
 */

document.addEventListener('DOMContentLoaded', (event) => {
  fetchNeighborhoods();
  fetchCuisines();
  setEventListeners();

});

var setEventListeners = () => {
  var neighborHoodSelect = document.getElementById('neighborhoods-select');
  neighborHoodSelect.addEventListener('change', function () {
    updateRestaurants();
  });

  var cuisineSelect = document.getElementById('cuisines-select');
  cuisineSelect.addEventListener('change', function () {
    updateRestaurants();
  });
}

/**
 * Fetch all neighborhoods and set their HTML.
 */
var fetchNeighborhoods = () => {
  DBHelper.fetchNeighborhoods((error, neighborhoods) => {
    if (error) { // Got an error
      console.error(error);
    } else {
      self.neighborhoods = neighborhoods;
      fillNeighborhoodsHTML();
    }
  });
}

/**
 * Set neighborhoods HTML.
 */
var fillNeighborhoodsHTML = (neighborhoods = self.neighborhoods) => {
  const select = document.getElementById('neighborhoods-select');
  neighborhoods.forEach(neighborhood => {
    const option = document.createElement('option');
    option.innerHTML = neighborhood;
    option.value = neighborhood;
    select.append(option);
  });
}

/**
 * Fetch all cuisines and set their HTML.
 */
var fetchCuisines = () => {
  DBHelper.fetchCuisines((error, cuisines) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.cuisines = cuisines;
      fillCuisinesHTML();
    }
  });
}

/**
 * Set cuisines HTML.
 */
var fillCuisinesHTML = (cuisines = self.cuisines) => {
  const select = document.getElementById('cuisines-select');

  cuisines.forEach(cuisine => {
    const option = document.createElement('li');
    option.innerHTML = cuisine;
    option.value = cuisine;
    select.append(option);
  });
}

/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
  let loc = {
    lat: 40.722216,
    lng: -73.987501
  };
  self.map = new google.maps.Map(document.getElementById('map'), {
    zoom: 12,
    center: loc,
    scrollwheel: false
  });
  updateRestaurants();
}

/**
 * Update page and map for current restaurants.
 */
var updateRestaurants = () => {
  const cSelect = document.getElementById('cuisines-select');
  const nSelect = document.getElementById('neighborhoods-select');

  const cIndex = cSelect.selectedIndex;
  const nIndex = nSelect.selectedIndex;

  const cuisine = cSelect[cIndex].value;
  const neighborhood = nSelect[nIndex].value;

  DBHelper.fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, (error, restaurants) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      resetRestaurants(restaurants);
      fillRestaurantsHTML();
    }
  })
}

/**
 * Clear current restaurants, their HTML and remove their map markers.
 */
var resetRestaurants = (restaurants) => {
  // Remove all restaurants
  self.restaurants = [];
  const ul = document.getElementById('restaurants-list');
  ul.innerHTML = '';

  // Remove all map markers
  markers.forEach(m => m.setMap(null));
  markers = [];
  self.restaurants = restaurants;
}

/**
 * Create all restaurants HTML and add them to the webpage.
 */
var fillRestaurantsHTML = (restaurants = self.restaurants) => {
  let tabIndex = 3;
  const ul = document.getElementById('restaurants-list');
  restaurants.forEach(restaurant => {
    ul.append(createRestaurantHTML(restaurant, tabIndex));
    tabIndex++;
  });

  var lazyImages = [].slice.call(document.querySelectorAll("img.lazy"));

  if ("IntersectionObserver" in window) {
    let lazyImageObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          let lazyImage = entry.target;
          lazyImage.src = lazyImage.dataset.src;
          lazyImage.srcset = lazyImage.dataset.srcset;
          lazyImage.classList.remove("lazy");
          lazyImageObserver.unobserve(lazyImage);
        }
      });
    });

    lazyImages.forEach(function (lazyImage) {
      lazyImageObserver.observe(lazyImage);
    });
  } else {
    // Possibly fall back to a more compatible method here
  }
  addMarkersToMap();
}

/**
 * Create restaurant HTML.
 */
var createRestaurantHTML = (restaurant, tabIndex) => {
  const restaurantId = restaurant.id;

  const isRestaurantFavorite = restaurant.is_favorite;

  const li = document.createElement('li');

  const picture = document.createElement('picture');

  const favoriteButton = document.createElement('button');

  const image = document.createElement('img');
  image.className = 'restaurant-img lazy';
  image.tabIndex = 0;
  let src = DBHelper.imageUrlForRestaurant(restaurant);
  image.setAttribute('src', '');
  image.setAttribute('data-src', src);
  image.setAttribute('data-srcset', src);
  image.alt = '';
  picture.append(image);
  li.append(picture);

  const name = document.createElement('h2');
  name.innerHTML = restaurant.name;
  li.append(name);

  const buttonText = document.createTextNode('Mark as favorite');
  favoriteButton.appendChild(buttonText);
  favoriteButton.setAttribute('onclick', 'window.toggleFavorite(' + restaurantId + ')');
  favoriteButton.setAttribute('favorised', isRestaurantFavorite);
  favoriteButton.id = 'favoriteButton'

  li.append(favoriteButton);

  const neighborhood = document.createElement('p');
  neighborhood.innerHTML = restaurant.neighborhood;
  li.append(neighborhood);

  const address = document.createElement('p');
  address.innerHTML = restaurant.address;
  li.append(address);

  const more = document.createElement('a');
  more.innerHTML = 'View Details';
  more.setAttribute('tabIndex', tabIndex.toString());
  more.setAttribute('aria-label', 'Details for' + restaurant.name);
  more.href = DBHelper.urlForRestaurant(restaurant);
  li.append(more)


  return li
}

/**
 * Add markers for current restaurants to the map.
 */
var addMarkersToMap = (restaurants = self.restaurants) => {
  restaurants.forEach(restaurant => {
    // Add marker to the map
    const marker = DBHelper.mapMarkerForRestaurant(restaurant, map);
    google.maps.event.addListener(marker, 'click', () => {
      window.location.href = marker.url
    });
    markers.push(marker);
  });
}
