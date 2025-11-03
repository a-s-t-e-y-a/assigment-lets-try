import { RestaurantService } from './restaurantService.js';

export class RestaurantController {
  static async getAllOrders(req, res) {
    try {
      const { status, sortBy, sortOrder, page = 1, limit = 10 } = req.query;
      const restaurantId = req.user.id;
      
      const filters = {
        status,
        restaurantId,
        sortBy: sortBy || 'createdAt',
        sortOrder: sortOrder || 'desc'
      };

      let orders = await RestaurantService.getAllOrders(filters);

      const startIndex = (parseInt(page) - 1) * parseInt(limit);
      const endIndex = startIndex + parseInt(limit);
      const paginatedOrders = orders.slice(startIndex, endIndex);

      res.json({
        success: true,
        data: {
          orders: paginatedOrders,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(orders.length / parseInt(limit)),
            totalItems: orders.length,
            itemsPerPage: parseInt(limit)
          }
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  static async getPendingOrders(req, res) {
    try {
      const restaurantId = req.user.id;

      if (req.params.restaurantId && req.params.restaurantId !== restaurantId) {
        return res.status(403).json({
          success: false,
          error: 'You can only view orders for your restaurant'
        });
      }

      const orders = await RestaurantService.getPendingOrders(restaurantId);

      res.json({
        success: true,
        data: {
          orders,
          count: orders.length
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  static async getOrderById(req, res) {
    try {
      const { orderId } = req.params;
      const restaurantId = req.user.id;
      const order = await RestaurantService.getOrderById(orderId);

      if (!order) {
        return res.status(404).json({
          success: false,
          error: 'Order not found'
        });
      }

      if (order.restaurantId !== restaurantId) {
        return res.status(403).json({
          success: false,
          error: 'You can only view orders for your restaurant'
        });
      }

      res.json({
        success: true,
        data: order
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  static async acceptOrder(req, res) {
    try {
      const { orderId } = req.params;
      const restaurantId = req.user.id;

      const order = await RestaurantService.getOrderById(orderId);
      
      if (!order) {
        return res.status(404).json({
          success: false,
          error: 'Order not found'
        });
      }

      if (order.restaurantId !== restaurantId) {
        return res.status(403).json({
          success: false,
          error: 'You can only accept orders for your restaurant'
        });
      }

      const updatedOrder = await RestaurantService.acceptOrder(orderId);

      res.json({
        success: true,
        message: 'Order accepted successfully',
        data: updatedOrder
      });
    } catch (error) {
      const statusCode = error.message.includes('not found') ? 404 : 400;
      res.status(statusCode).json({
        success: false,
        error: error.message
      });
    }
  }

  static async markOrderAsPrepared(req, res) {
    try {
      const { orderId } = req.params;
      const restaurantId = req.user.id;

      const order = await RestaurantService.getOrderById(orderId);
      
      if (!order) {
        return res.status(404).json({
          success: false,
          error: 'Order not found'
        });
      }

      if (order.restaurantId !== restaurantId) {
        return res.status(403).json({
          success: false,
          error: 'You can only prepare orders for your restaurant'
        });
      }

      const updatedOrder = await RestaurantService.markOrderAsPrepared(orderId);

      res.json({
        success: true,
        message: 'Order marked as prepared successfully',
        data: updatedOrder
      });
    } catch (error) {
      const statusCode = error.message.includes('not found') ? 404 : 400;
      res.status(statusCode).json({
        success: false,
        error: error.message
      });
    }
  }
}
