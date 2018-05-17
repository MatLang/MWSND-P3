import DBHelper from './dbhelper';

let restaurant;
var map;

const triggerReviewRequestQueueSync = function () {
  navigator.serviceWorker.ready.then(function (swRegistration) {
    swRegistration.sync.register('reviewqueue');
  });
}

function submitReview(body) {
  return DBHelper.openDatabase
    .then(db => {
      let restaurantStore = DBHelper.openObjectStore(db, 'restaurants', 'readonly');
      return restaurantStore.get(parseInt(body.restaurant_id)).then((restaurant) => {

        const updateRestaurants = function (restaurant) {
          let restaurantStore = DBHelper.openObjectStore(db, 'restaurants', 'readwrite');
          restaurantStore.put(restaurant);
          return restaurantStore.complete;
        }

        const updateReviewQueue = function (restaurant) {
          let reviewQueue = DBHelper.openObjectStore(db, 'reviewqueue', 'readwrite');
          reviewQueue.put(body, body.createdAt);
          return reviewQueue.complete;
        }

        restaurant.reviews.push(body)

        return Promise.all([updateReviewQueue(restaurant), updateRestaurants(restaurant)])
          .then(() => {
            return triggerReviewRequestQueueSync();
          })
      });
    })
}

const submitButton = document.getElementById('submit-button');
submitButton.addEventListener('click', function () {
  const form = document.getElementById("reviews-form");
  let reviewerName = document.getElementById('reviewer-name').value;
  const comment = form.textarea.value;
  const ratings = document.querySelectorAll('input[type="radio"]');
  const restaurantId = window.location.href.split('=')[1];
  let rating = 0;
  let ratingId;
  for (var item of ratings) {
    if (item.checked == true) {
      ratingId = item.id;
      rating = item.value;
      item.checked = false;
      break;
    }
  }

  const body = {
    'restaurant_id': restaurantId,
    'name': reviewerName,
    'rating': rating,
    'comments': comment,
    'createdAt': Date.now(),
    'updatedAt': Date.now()
  }

  form.textarea.value = '';
  document.getElementById('reviewer-name').value = '';

  const review = createReviewHTML(body);
  const ul = document.getElementById('reviews-list');
  ul.appendChild(review);
  return submitReview(body);
})

/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error('error', error);
    } else {
      /* self.map = new google.maps.Map(document.getElementById('map'), {
        zoom: 16,
        center: restaurant.latlng,
        scrollwheel: false
      }); */
      fillBreadcrumb();
      /* DBHelper.mapMarkerForRestaurant(self.restaurant, self.map); */
    }
  });
}

/**
 * Get current restaurant from page URL.
 */
var fetchRestaurantFromURL = (callback) => {
  if (self.restaurant) {
    callback(null, self.restaurant)
    return;
  }
  const id = getParameterByName('id');
  if (!id) { 
    error = 'No restaurant id in URL'
    callback(error, null);
  } else {
    DBHelper.fetchRestaurantById(id, (error, restaurant) => {
      self.restaurant = restaurant;
      if (!restaurant) {
        console.error(error);
        return;
      }
      fillRestaurantHTML();
      callback(null, restaurant)
    });
  }
}

/**
 * Create restaurant HTML and add it to the webpage
 */
var fillRestaurantHTML = (restaurant = self.restaurant) => {
  const imageCenter = restaurant.latlng;
  const restaurantLat = restaurant.latlng.lat;
  const restaurantLng = restaurant.latlng.lng;

  const mapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${restaurantLat},${restaurantLng}&zoom=13&size=1000x700&maptype=roadmap&markers=color:red%7Clabel:C%7C${restaurantLat},${restaurantLng}&key=AIzaSyDVxFd5ZApqxb_0P4jR0gHRBRnwyipiZSI`;

  const mapContainer = document.getElementById('map');
  const mapImage = document.createElement('img');
  mapImage.src = mapUrl;
  mapImage.id = 'map-image'
  mapContainer.appendChild(mapImage);

  const name = document.getElementById('restaurant-name');
  name.innerHTML = restaurant.name;

  const address = document.getElementById('restaurant-address');
  address.innerHTML = restaurant.address;

  const image = document.getElementById('restaurant-img');
  image.className = 'restaurant-img'
  image.alt = "Picture of restaurant: " + restaurant.name;
  image.src = DBHelper.imageUrlForRestaurant(restaurant);

  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = restaurant.cuisine_type;

  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }
  // fill reviews
  fillReviewsHTML();
}

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
var fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
  const hours = document.getElementById('restaurant-hours');
  for (let key in operatingHours) {
    const row = document.createElement('tr');

    const day = document.createElement('td');
    day.innerHTML = key;
    row.appendChild(day);

    const time = document.createElement('td');
    time.innerHTML = operatingHours[key];
    row.appendChild(time);

    hours.appendChild(row);
  }
}

/**
 * Create all reviews HTML and add them to the webpage.
 */


var fillReviewsHTML = (reviews = self.restaurant.reviews) => {
  const container = document.getElementById('reviews-container');
  const title = document.createElement('h3');
  title.innerHTML = 'Reviews';
  container.appendChild(title);

  if (!reviews) {
    const noReviews = document.createElement('p');
    noReviews.setAttribute('class', 'white')
    noReviews.innerHTML = 'No reviews yet!';
    container.appendChild(noReviews);
    return;
  }

  const ul = document.getElementById('reviews-list');
  reviews.forEach(review => {
    ul.appendChild(createReviewHTML(review));
  });
  container.appendChild(ul);
}

/**
 * Create review HTML and add it to the webpage.
 */



var createReviewHTML = (review) => {
  const li = document.createElement('li');
  li.setAttribute('tabindex', 0);
  const name = document.createElement('p');
  name.innerHTML = review.name;
  li.appendChild(name);

  const date = document.createElement('p');
  date.innerHTML = new Date(review.createdAt).toDateString();
  li.appendChild(date);

  const rating = document.createElement('p');
  rating.innerHTML = `Rating: ${review.rating}`;
  li.appendChild(rating);

  const comments = document.createElement('p');
  comments.innerHTML = review.comments;
  li.appendChild(comments);

  return li;
}

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
var fillBreadcrumb = (restaurant = self.restaurant) => {
  const breadcrumb = document.getElementById('breadcrumb');
  const li = document.createElement('li');
  li.innerHTML = restaurant.name;
  li.setAttribute('aria-current', 'page')
  breadcrumb.appendChild(li);
  return breadcrumb;
}

/**
 * Get a parameter by name from page URL.
 */
var getParameterByName = (name, url) => {
  if (!url)
    url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results)
    return null;
  if (!results[2])
    return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

// Map toggle button

const checkDomMapContent = (map) => {
  if (map instanceof HTMLElement) {
    return true;
  } else {
    return false;
  }
}

const trigger = document.getElementById('toggle');
trigger.addEventListener('click', function (event) {
  const map = self.map;
  let isMapEmpty = checkDomMapContent(map);
  let isChecked = this.hasAttribute('checked');

  if (!isChecked) {
    this.setAttribute('checked', '');
    this.setAttribute('aria-label', 'Hide Map');
    this.innerHTML = 'Hide Map';
  } else {
    this.removeAttribute('checked');
    this.innerHTML = 'Open Map';
    this.setAttribute('aria-label', 'Open Map');
  }
  return;
})
