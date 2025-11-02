import {
  getAllRestaurants,
  getRestaurantById,
  getMenuItemsByRestaurant,
  getMenuItemById,
  searchRestaurants,
  searchMenuItems
} from '../config/index.js';

export const getAllRestaurantsController = (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const allRestaurants = getAllRestaurants();
    const paginatedRestaurants = allRestaurants.slice(startIndex, endIndex);
    const totalPages = Math.ceil(allRestaurants.length / limit);

    res.status(200).json({
      success: true,
      data: paginatedRestaurants,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalItems: allRestaurants.length,
        itemsPerPage: limit,
        hasNextPage: endIndex < allRestaurants.length,
        hasPreviousPage: startIndex > 0
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch restaurants',
      error: error.message
    });
  }
};

export const getRestaurantByIdController = (req, res) => {
  try {
    const { id } = req.params;
    const restaurant = getRestaurantById(id);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    res.status(200).json({
      success: true,
      data: restaurant
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch restaurant',
      error: error.message
    });
  }
};

export const getMenuItemsByRestaurantController = (req, res) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const allMenuItems = getMenuItemsByRestaurant(id);

    if (!allMenuItems || allMenuItems.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No menu items found for this restaurant'
      });
    }

    const paginatedItems = allMenuItems.slice(startIndex, endIndex);
    const totalPages = Math.ceil(allMenuItems.length / limit);

    res.status(200).json({
      success: true,
      data: paginatedItems,
      restaurantId: id,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalItems: allMenuItems.length,
        itemsPerPage: limit,
        hasNextPage: endIndex < allMenuItems.length,
        hasPreviousPage: startIndex > 0
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch menu items',
      error: error.message
    });
  }
};

export const getMenuItemByIdController = (req, res) => {
  try {
    const { id, itemId } = req.params;
    const menuItem = getMenuItemById(id, itemId);

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }

    res.status(200).json({
      success: true,
      data: menuItem
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch menu item',
      error: error.message
    });
  }
};

export const searchController = (req, res) => {
  try {
    const { q } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    if (!q || q.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const allRestaurants = searchRestaurants(q);
    const allMenuItems = [];

    const restaurants = getAllRestaurants();
    restaurants.forEach(restaurant => {
      const items = searchMenuItems(restaurant.id, q);
      if (items.length > 0) {
        allMenuItems.push(...items.map(item => ({
          ...item,
          restaurantId: restaurant.id,
          restaurantName: restaurant.name
        })));
      }
    });

    const startIndexRestaurants = (page - 1) * limit;
    const endIndexRestaurants = page * limit;
    const paginatedRestaurants = allRestaurants.slice(startIndexRestaurants, endIndexRestaurants);

    const startIndexMenuItems = (page - 1) * limit;
    const endIndexMenuItems = page * limit;
    const paginatedMenuItems = allMenuItems.slice(startIndexMenuItems, endIndexMenuItems);

    res.status(200).json({
      success: true,
      data: {
        restaurants: paginatedRestaurants,
        menuItems: paginatedMenuItems
      },
      query: q,
      pagination: {
        currentPage: page,
        itemsPerPage: limit,
        restaurants: {
          totalItems: allRestaurants.length,
          totalPages: Math.ceil(allRestaurants.length / limit),
          hasNextPage: endIndexRestaurants < allRestaurants.length,
          hasPreviousPage: startIndexRestaurants > 0
        },
        menuItems: {
          totalItems: allMenuItems.length,
          totalPages: Math.ceil(allMenuItems.length / limit),
          hasNextPage: endIndexMenuItems < allMenuItems.length,
          hasPreviousPage: startIndexMenuItems > 0
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Search failed',
      error: error.message
    });
  }
};
