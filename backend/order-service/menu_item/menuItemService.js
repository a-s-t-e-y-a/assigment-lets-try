import {
  getAllRestaurants,
  getRestaurantById,
  getMenuItemsByRestaurant,
  getMenuItemById,
  searchRestaurants,
  searchMenuItems,
  getMenuItemsByCategory
} from '../config/index.js';

export class MenuItemService {
  static getAllRestaurants() {
    return getAllRestaurants();
  }

  static getRestaurantById(restaurantId) {
    return getRestaurantById(restaurantId);
  }

  static getMenuItemsByRestaurant(restaurantId) {
    return getMenuItemsByRestaurant(restaurantId);
  }

  static getMenuItemById(restaurantId, itemId) {
    return getMenuItemById(restaurantId, itemId);
  }

  static searchRestaurants(query) {
    return searchRestaurants(query);
  }

  static searchMenuItems(restaurantId, query) {
    return searchMenuItems(restaurantId, query);
  }

  static getMenuItemsByCategory(restaurantId, category) {
    return getMenuItemsByCategory(restaurantId, category);
  }

  static getRestaurantWithMenu(restaurantId) {
    const restaurant = this.getRestaurantById(restaurantId);
    if (!restaurant) return null;

    const menuItems = this.getMenuItemsByRestaurant(restaurantId);
    return {
      ...restaurant,
      menu: menuItems,
      menuCount: menuItems.length
    };
  }

  static getPopularItems(limit = 10) {
    const allItems = [];
    const restaurants = this.getAllRestaurants();

    restaurants.forEach(restaurant => {
      const items = this.getMenuItemsByRestaurant(restaurant.id);
      allItems.push(...items.map(item => ({
        ...item,
        restaurantId: restaurant.id,
        restaurantName: restaurant.name,
        restaurantRating: restaurant.rating
      })));
    });

    return allItems
      .sort((a, b) => b.price - a.price)
      .slice(0, limit);
  }

  static getItemsByPriceRange(minPrice, maxPrice) {
    const allItems = [];
    const restaurants = this.getAllRestaurants();

    restaurants.forEach(restaurant => {
      const items = this.getMenuItemsByRestaurant(restaurant.id);
      allItems.push(...items
        .filter(item => item.price >= minPrice && item.price <= maxPrice)
        .map(item => ({
          ...item,
          restaurantId: restaurant.id,
          restaurantName: restaurant.name
        }))
      );
    });

    return allItems;
  }
}
