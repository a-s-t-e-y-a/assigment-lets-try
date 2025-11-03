import { DeliveryService } from './deliveryService.js';

export class DeliveryController {
  static async getAllOrders(req, res) {
    try {
      const { status, sortBy, sortOrder, page = 1, limit = 10 } = req.query;
      
      const filters = {
        status,
        sortBy: sortBy || 'createdAt',
        sortOrder: sortOrder || 'desc'
      };

      let orders = await DeliveryService.getAllOrders(filters);

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

  static async getPreparedOrders(req, res) {
    try {
      const orders = await DeliveryService.getPreparedOrders();

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
      const order = await DeliveryService.getOrderById(orderId);

      if (!order) {
        return res.status(404).json({
          success: false,
          error: 'Order not found'
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

  static async pickupOrder(req, res) {
    try {
      const { orderId } = req.params;
      const driverId = req.user.id;

      const order = await DeliveryService.pickupOrder(orderId, driverId);

      res.json({
        success: true,
        message: 'Order picked up successfully',
        data: order
      });
    } catch (error) {
      const statusCode = error.message.includes('not found') ? 404 : 400;
      res.status(statusCode).json({
        success: false,
        error: error.message
      });
    }
  }

  static async deliverOrder(req, res) {
    try {
      const { orderId } = req.params;
      const driverId = req.user.id;

      const order = await DeliveryService.getOrderById(orderId);
      
      if (!order) {
        return res.status(404).json({
          success: false,
          error: 'Order not found'
        });
      }

      if (order.deliveryPartnerId && order.deliveryPartnerId !== driverId) {
        return res.status(403).json({
          success: false,
          error: 'You can only deliver orders assigned to you'
        });
      }

      const updatedOrder = await DeliveryService.deliverOrder(orderId);

      res.json({
        success: true,
        message: 'Order delivered successfully',
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
