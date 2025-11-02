import restaurants from './restaurants.js';
import menuItems from './menuItems.js';
import users from './users.js';
import deliveryPartners from './deliveryPartners.js';

const getAllRestaurants = () => {
  return restaurants;
};

const getRestaurantById = (restaurantId) => {
  return restaurants.find(restaurant => restaurant.id === restaurantId);
};

const getMenuItemsByRestaurant = (restaurantId) => {
  return menuItems[restaurantId] || [];
};

const getMenuItemById = (restaurantId, itemId) => {
  const restaurantItems = menuItems[restaurantId] || [];
  return restaurantItems.find(item => item.id === itemId);
};

const getAllMenuItems = () => {
  return menuItems;
};

const searchRestaurants = (query) => {
  const searchTerm = query.toLowerCase();
  return restaurants.filter(restaurant => 
    restaurant.name.toLowerCase().includes(searchTerm) ||
    restaurant.cuisine.toLowerCase().includes(searchTerm) ||
    restaurant.address.toLowerCase().includes(searchTerm)
  );
};

const searchMenuItems = (restaurantId, query) => {
  const restaurantItems = menuItems[restaurantId] || [];
  const searchTerm = query.toLowerCase();
  return restaurantItems.filter(item =>
    item.name.toLowerCase().includes(searchTerm) ||
    item.description.toLowerCase().includes(searchTerm) ||
    item.category.toLowerCase().includes(searchTerm)
  );
};

const getMenuItemsByCategory = (restaurantId, category) => {
  const restaurantItems = menuItems[restaurantId] || [];
  return restaurantItems.filter(item => 
    item.category.toLowerCase() === category.toLowerCase()
  );
};

const getAllUsers = () => {
  return users;
};

const getUserById = (userId) => {
  return users.find(user => user.id === userId);
};

const getUserByEmail = (email) => {
  return users.find(user => user.email === email);
};

const getAllDeliveryPartners = () => {
  return deliveryPartners;
};

const getDeliveryPartnerById = (partnerId) => {
  return deliveryPartners.find(partner => partner.id === partnerId);
};

const getAvailableDeliveryPartners = () => {
  return deliveryPartners.filter(partner => partner.status === 'available');
};

const getDeliveryPartnersByStatus = (status) => {
  return deliveryPartners.filter(partner => partner.status === status);
};

export {
  getAllRestaurants,
  getRestaurantById,
  getMenuItemsByRestaurant,
  getMenuItemById,
  getAllMenuItems,
  searchRestaurants,
  searchMenuItems,
  getMenuItemsByCategory,
  getAllUsers,
  getUserById,
  getUserByEmail,
  getAllDeliveryPartners,
  getDeliveryPartnerById,
  getAvailableDeliveryPartners,
  getDeliveryPartnersByStatus
};
