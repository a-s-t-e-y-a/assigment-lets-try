import { OrderService } from './orderService.js';
import {
  getRestaurantById,
  getMenuItemById,
  getUserById
} from '../config/index.js';

export const placeOrderController = async (req, res) => {
  try {
    const { userId, restaurantId, items, deliveryAddress } = req.body;

    const user = getUserById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const restaurant = getRestaurantById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    let totalAmount = 0;
    const validatedItems = [];

    for (const item of items) {
      const menuItem = getMenuItemById(restaurantId, item.itemId);
      if (!menuItem) {
        return res.status(404).json({
          success: false,
          message: `Menu item ${item.itemId} not found in restaurant ${restaurantId}`
        });
      }

      const quantity = item.quantity || 1;
      validatedItems.push({
        itemId: menuItem.id,
        name: menuItem.name,
        price: menuItem.price,
        quantity: quantity,
        subtotal: menuItem.price * quantity
      });

      totalAmount += menuItem.price * quantity;
    }

    const orderData = {
      userId,
      restaurantId,
      items: validatedItems,
      totalAmount: parseFloat(totalAmount.toFixed(2)),
      deliveryAddress: deliveryAddress || user.address
    };

    const order = OrderService.createOrder(orderData);

    await OrderService.publishOrderCreated(order);

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      data: {
        ...order,
        restaurant: {
          id: restaurant.id,
          name: restaurant.name,
          cuisine: restaurant.cuisine
        },
        user: {
          id: user.id,
          name: user.name,
          email: user.email
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to place order',
      error: error.message
    });
  }
};

export const getOrderByIdController = (req, res) => {
  try {
    const { id } = req.params;
    const order = OrderService.getOrderById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order',
      error: error.message
    });
  }
};

export const getAllOrdersController = (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder || 'desc';
    
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    let allOrders = OrderService.getAllOrders();

    if (status) {
      allOrders = allOrders.filter(order => order.status === status);
    }

    allOrders.sort((a, b) => {
      let comparison = 0;
      
      if (sortBy === 'createdAt') {
        comparison = new Date(a.createdAt) - new Date(b.createdAt);
      } else if (sortBy === 'status') {
        const statusOrder = ['PENDING', 'ACCEPTED' ,'CANCELLED'];
        comparison = statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status);
      } else if (sortBy === 'totalAmount') {
        comparison = a.totalAmount - b.totalAmount;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    const paginatedOrders = allOrders.slice(startIndex, endIndex);
    const totalPages = Math.ceil(allOrders.length / limit);

    res.status(200).json({
      success: true,
      data: paginatedOrders,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalItems: allOrders.length,
        itemsPerPage: limit,
        hasNextPage: endIndex < allOrders.length,
        hasPreviousPage: startIndex > 0
      },
      filters: {
        status: status || 'all',
        sortBy,
        sortOrder
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
      error: error.message
    });
  }
};

export const cancelOrderController = async (req, res) => {
  try {
    const { id } = req.params;
    const order = OrderService.getOrderById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const cancelledOrder = OrderService.cancelOrder(id);

    await OrderService.publishOrderCancelled(cancelledOrder);

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
      data: cancelledOrder
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const getUserOrdersController = (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder || 'desc';
    
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    let allUserOrders = OrderService.getOrdersByUserId(userId);

    if (status) {
      allUserOrders = allUserOrders.filter(order => order.status === status);
    }

    allUserOrders.sort((a, b) => {
      let comparison = 0;
      
      if (sortBy === 'createdAt') {
        comparison = new Date(a.createdAt) - new Date(b.createdAt);
      } else if (sortBy === 'status') {
        const statusOrder = ['PENDING', 'ACCEPTED', 'PREPARING', 'READY', 'PICKED_UP', 'DELIVERED', 'CANCELLED'];
        comparison = statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status);
      } else if (sortBy === 'totalAmount') {
        comparison = a.totalAmount - b.totalAmount;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    const paginatedOrders = allUserOrders.slice(startIndex, endIndex);
    const totalPages = Math.ceil(allUserOrders.length / limit);

    res.status(200).json({
      success: true,
      data: paginatedOrders,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalItems: allUserOrders.length,
        itemsPerPage: limit,
        hasNextPage: endIndex < allUserOrders.length,
        hasPreviousPage: startIndex > 0
      },
      filters: {
        status: status || 'all',
        sortBy,
        sortOrder
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user orders',
      error: error.message
    });
  }
};
