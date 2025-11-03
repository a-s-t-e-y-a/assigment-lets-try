import { getUserById } from '../config/index.js';
import restaurants from '../config/restaurants.js';
import deliveryPartners from '../config/deliveryPartners.js';

export const authenticateRole = (allowedRoles) => {
  return (req, res, next) => {
    const { userId, restaurantId, driverId } = req.body || {};
    const userIdFromQuery = req.query.userId;
    const restaurantIdFromQuery = req.query.restaurantId;
    const driverIdFromQuery = req.query.driverId;

    const actualUserId = userId || userIdFromQuery;
    const actualRestaurantId = restaurantId || restaurantIdFromQuery;
    const actualDriverId = driverId || driverIdFromQuery;

    let userRole = null;
    let userEntity = null;

    if (actualUserId) {
      userEntity = getUserById(actualUserId);
      if (userEntity && userEntity.role === 'customer') {
        userRole = 'customer';
      }
    }

    if (!userRole && actualRestaurantId) {
      const restaurant = restaurants.find(r => r.id === actualRestaurantId);
      if (restaurant && restaurant.role === 'restaurant') {
        userRole = 'restaurant';
        userEntity = restaurant;
      }
    }

    if (!userRole && actualDriverId) {
      const driver = deliveryPartners.find(d => d.id === actualDriverId);
      if (driver && driver.role === 'delivery_partner') {
        userRole = 'delivery_partner';
        userEntity = driver;
      }
    }

    if (!userRole || !userEntity) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please provide valid userId, restaurantId, or driverId'
      });
    }

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. This action requires one of these roles: ${allowedRoles.join(', ')}`
      });
    }

    req.user = userEntity;
    req.userRole = userRole;
    next();
  };
};
