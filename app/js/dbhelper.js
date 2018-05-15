import idb from 'idb';

/**
 * Common database helper functions.
 */

var dbPromise;

class DBHelper {

  static openObjectStore = (db, storeName, transactionMode = 'readonly') => {
    return db.transaction(storeName, transactionMode).objectStore(storeName);
  }

  static openDatabase = function () {
    return idb.open('restaurants', 1, function (upgradeDb) {
      if (!upgradeDb.objectStoreNames.contains('restaurants')) {
        upgradeDb.createObjectStore('restaurants', { keyPath: 'id' });
      }
      if (!upgradeDb.objectStoreNames.contains('favqueue')) {
        upgradeDb.createObjectStore('favqueue');
      }
      if (!upgradeDb.objectStoreNames.contains('reviewqueue')) {
        upgradeDb.createObjectStore('reviewqueue');
      }
    })
  }();

  /**
     * Fetch all restaurants.
     */
  static getCachedMessages = function () {
    dbPromise = this.openDatabase;
    return dbPromise.then(function (db) {

      if (!db) return;

      return DBHelper.openObjectStore(db, 'restaurants').getAll();

    })
  }

  /**
   * Fetch all restaurants.
   */
  static fetchRestaurants(callback) {
    this.getCachedMessages().then((data) => {
      if (data.length > 0) {
        return callback(null, data);
      }

      fetch('http://localhost:1337/restaurants').then((response) => {
        return response.json();
      }).then(restaurants => {
        return Promise.all(
          restaurants.map((restaurant) => {
            return fetch(`http://localhost:1337/reviews/?restaurant_id=${restaurant.id}`)
              .then((response) => {
                return response.json()
              }).then((reviews) => {
                restaurant.reviews = reviews;
                return dbPromise.then((db) => {
                  if (!db) return;
                  var store = DBHelper.openObjectStore(db, 'restaurants', 'readwrite')
                  restaurants.forEach(restaurant => store.put(restaurant));
                  return store.openCursor(null, 'prev').then((cursor) => {
                    return cursor.advance(30);
                  }).then(function deleteRest(cursor) {
                    if (!cursor) return;
                    cursor.delete();
                    return cursor.continue()
                      .then(deleteRest);
                  })
                })
              })
          })
        ).then((res) => {
          return callback(null, restaurants);
        });
      })
    })
  }

  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id, callback) {
    // fetch all restaurants with proper error handling.
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        const restaurant = restaurants.find(r => r.id == id);
        if (restaurant) { // Got the restaurant
          callback(null, restaurant);
        } else { // Restaurant does not exist in the database
          callback('Restaurant does not exist', null);
        }
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine, callback) {
    // Fetch all restaurants  with proper error handling
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given cuisine type
        const results = restaurants.filter(r => r.cuisine_type == cuisine);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given neighborhood
        const results = restaurants.filter(r => r.neighborhood == neighborhood);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        let results = restaurants
        if (cuisine != 'all') { // filter by cuisine
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != 'all') { // filter by neighborhood
          results = results.filter(r => r.neighborhood == neighborhood);
        }
        callback(null, results);
      }
    });
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all neighborhoods from all restaurants
        const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i)
        callback(null, uniqueNeighborhoods);
      }
    });
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all cuisines from all restaurants
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type)
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i)
        callback(null, uniqueCuisines);
      }
    });
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }

  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant(restaurant) {
    if (restaurant.id == 10) return (`images/10.webp`);
    return (`images/${restaurant.photograph}.webp`);
  }

  /**
   * Map marker for a restaurant.
   */
  static mapMarkerForRestaurant(restaurant, map) {
    const marker = new google.maps.Marker({
      position: restaurant.latlng,
      title: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant),
      map: map,
      animation: google.maps.Animation.DROP
    }
    );
    return marker;
  }

}

module.exports = DBHelper;
