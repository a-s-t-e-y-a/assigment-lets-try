import { publishMessage } from '../utils/rabbitmq.js';
import rabbitMQConfig from '../config/rabbitmq.js';
import { RestaurantOrder } from '../models/Order.js';

export class RestaurantService {
  static async handleOrderCreated(orderData) {
    const existingOrder = await RestaurantOrder.findOne({ orderId: orderData.orderId });
    
    if (existingOrder) {
      console.log(`Order ${orderData.orderId} already exists with status ${existingOrder.status}`);
      return existingOrder;
    }

    const order = await RestaurantOrder.create({
      orderId: orderData.orderId,
      restaurantId: orderData.restaurantId,
      userId: orderData.userId,
      items: orderData.items,
      totalAmount: orderData.totalAmount,
      deliveryAddress: orderData.deliveryAddress,
      status: 'PENDING',
      createdAt: orderData.timestamp || new Date()
    });

    console.log(`Order ${order.orderId} received and stored with status PENDING`);
    return order;
  }

  static async handleOrderCancelled(orderData) {
    const order = await RestaurantOrder.findOneAndUpdate(
      { orderId: orderData.orderId },
      { status: 'CANCELLED' },
      { new: true }
    );
    
    if (order) {
      console.log(`Order ${order.orderId} cancelled`);
    }
    return order;
  }

  static async getAllOrders(filters = {}) {
    const query = {};
    
    if (filters.status) {
      query.status = filters.status;
    }
    
    if (filters.restaurantId) {
      query.restaurantId = filters.restaurantId;
    }

    const sortBy = filters.sortBy || 'createdAt';
    const sortOrder = filters.sortOrder === 'asc' ? 1 : -1;
    
    const orders = await RestaurantOrder.find(query).sort({ [sortBy]: sortOrder });
    return orders;
  }

  static async getPendingOrders(restaurantId) {
    return await RestaurantOrder.find({ 
      restaurantId, 
      status: 'PENDING' 
    });
  }

  static async getOrderById(orderId) {
    return await RestaurantOrder.findOne({ orderId });
  }

  static async acceptOrder(orderId) {
    const order = await RestaurantOrder.findOne({ orderId });
    
    if (!order) {
      throw new Error('Order not found');
    }

    if (order.status !== 'PENDING') {
      throw new Error(`Cannot accept order with status ${order.status}. Only PENDING orders can be accepted.`);
    }

    order.status = 'ACCEPTED';
    order.acceptedAt = new Date();
    await order.save();

    console.log(`Order ${orderId} accepted and saved to database with status ACCEPTED`);

    await this.publishOrderAccepted(order);

    return order;
  }

  static async markOrderAsPrepared(orderId) {
    const order = await RestaurantOrder.findOne({ orderId });
    
    if (!order) {
      throw new Error('Order not found');
    }

    if (order.status !== 'ACCEPTED') {
      throw new Error(`Cannot mark order as prepared with status ${order.status}. Only ACCEPTED orders can be prepared.`);
    }

    order.status = 'PREPARED';
    order.preparedAt = new Date();
    await order.save();

    console.log(`Order ${orderId} marked as prepared and saved to database with status PREPARED`);

    await this.publishOrderPrepared(order);

    return order;
  }

  static async publishOrderAccepted(order) {
    const message = {
      eventType: 'ORDER_ACCEPTED',
      orderId: order.orderId,
      restaurantId: order.restaurantId,
      userId: order.userId,
      acceptedAt: order.acceptedAt,
      timestamp: new Date().toISOString()
    };

    await publishMessage(
      rabbitMQConfig.exchanges.restaurant,
      rabbitMQConfig.routingKeys.orderAccepted,
      message
    );
  }

  static async publishOrderPrepared(order) {
    const message = {
      eventType: 'ORDER_PREPARED',
      orderId: order.orderId,
      restaurantId: order.restaurantId,
      userId: order.userId,
      deliveryAddress: order.deliveryAddress,
      totalAmount: order.totalAmount,
      preparedAt: order.preparedAt,
      timestamp: new Date().toISOString()
    };

    await publishMessage(
      rabbitMQConfig.exchanges.restaurant,
      rabbitMQConfig.routingKeys.orderPrepared,
      message
    );
  }
}
