import { publishMessage } from '../utils/rabbitmq.js';
import rabbitMQConfig from '../config/rabbitmq.js';
import { DeliveryOrder } from '../models/Order.js';

export class DeliveryService {
  static async handleOrderPrepared(orderData) {
    const existingOrder = await DeliveryOrder.findOne({ orderId: orderData.orderId });
    
    if (existingOrder) {
      console.log(`Order ${orderData.orderId} already exists in delivery service with status ${existingOrder.status}`);
      return existingOrder;
    }

    const order = await DeliveryOrder.create({
      orderId: orderData.orderId,
      restaurantId: orderData.restaurantId,
      userId: orderData.userId,
      deliveryAddress: orderData.deliveryAddress,
      totalAmount: orderData.totalAmount,
      status: 'PREPARED',
      preparedAt: orderData.preparedAt,
      createdAt: orderData.timestamp || new Date()
    });

    console.log(`Order ${order.orderId} received and stored with status PREPARED`);
    return order;
  }

  static async getAllOrders(filters = {}) {
    const query = {};
    
    if (filters.status) {
      query.status = filters.status;
    }

    const sortBy = filters.sortBy || 'createdAt';
    const sortOrder = filters.sortOrder === 'asc' ? 1 : -1;
    
    const orders = await DeliveryOrder.find(query).sort({ [sortBy]: sortOrder });
    return orders;
  }

  static async getPreparedOrders() {
    return await DeliveryOrder.find({ status: 'PREPARED' });
  }

  static async getOrderById(orderId) {
    return await DeliveryOrder.findOne({ orderId });
  }

  static async pickupOrder(orderId, driverId) {
    const order = await DeliveryOrder.findOne({ orderId });
    
    if (!order) {
      throw new Error('Order not found');
    }

    if (order.status !== 'PREPARED') {
      throw new Error(`Cannot pickup order with status ${order.status}. Only PREPARED orders can be picked up.`);
    }

    order.status = 'PICKED_UP';
    order.driverId = driverId;
    order.pickedUpAt = new Date();
    await order.save();

    console.log(`Order ${orderId} picked up by driver ${driverId} and saved to database with status PICKED_UP`);

    await this.publishOrderPickedUp(order);

    return order;
  }

  static async deliverOrder(orderId) {
    const order = await DeliveryOrder.findOne({ orderId });
    
    if (!order) {
      throw new Error('Order not found');
    }

    if (order.status !== 'PICKED_UP') {
      throw new Error(`Cannot deliver order with status ${order.status}. Only PICKED_UP orders can be delivered.`);
    }

    order.status = 'DELIVERED';
    order.deliveredAt = new Date();
    await order.save();

    console.log(`Order ${orderId} delivered and saved to database with status DELIVERED`);

    await this.publishOrderDelivered(order);

    return order;
  }

  static async publishOrderPickedUp(order) {
    const message = {
      eventType: 'ORDER_PICKED_UP',
      orderId: order.orderId,
      driverId: order.driverId,
      restaurantId: order.restaurantId,
      userId: order.userId,
      pickedUpAt: order.pickedUpAt,
      timestamp: new Date().toISOString()
    };

    await publishMessage(
      rabbitMQConfig.exchanges.delivery,
      rabbitMQConfig.routingKeys.orderPickedUp,
      message
    );
  }

  static async publishOrderDelivered(order) {
    const message = {
      eventType: 'ORDER_DELIVERED',
      orderId: order.orderId,
      driverId: order.driverId,
      restaurantId: order.restaurantId,
      userId: order.userId,
      deliveredAt: order.deliveredAt,
      timestamp: new Date().toISOString()
    };

    await publishMessage(
      rabbitMQConfig.exchanges.delivery,
      rabbitMQConfig.routingKeys.orderDelivered,
      message
    );
  }
}
