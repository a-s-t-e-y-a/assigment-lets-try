import { v4 as uuidv4 } from 'uuid';
import { publishMessage } from '../utils/rabbitmq.js';
import rabbitMQConfig from '../config/rabbitmq.js';

const orders = new Map();

export class OrderService {
  static createOrder(orderData) {
    const orderId = uuidv4();
    const order = {
      id: orderId,
      userId: orderData.userId,
      restaurantId: orderData.restaurantId,
      items: orderData.items,
      totalAmount: orderData.totalAmount,
      deliveryAddress: orderData.deliveryAddress,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    orders.set(orderId, order);
    return order;
  }

  static getOrderById(orderId) {
    return orders.get(orderId);
  }

  static getAllOrders() {
    return Array.from(orders.values());
  }

  static getOrdersByUserId(userId) {
    return Array.from(orders.values()).filter(order => order.userId === userId);
  }

  static getOrdersByRestaurantId(restaurantId) {
    return Array.from(orders.values()).filter(order => order.restaurantId === restaurantId);
  }

  static updateOrderStatus(orderId, status) {
    const order = orders.get(orderId);
    if (!order) return null;

    order.status = status;
    order.updatedAt = new Date().toISOString();
    orders.set(orderId, order);
    return order;
  }

  static cancelOrder(orderId) {
    const order = orders.get(orderId);
    if (!order) return null;

    if (order.status !== 'PENDING') {
      throw new Error('Only pending orders can be cancelled');
    }

    order.status = 'CANCELLED';
    order.updatedAt = new Date().toISOString();
    orders.set(orderId, order);
    return order;
  }

  static async publishOrderCreated(order) {
    const message = {
      eventType: 'ORDER_CREATED',
      orderId: order.id,
      restaurantId: order.restaurantId,
      userId: order.userId,
      items: order.items,
      totalAmount: order.totalAmount,
      deliveryAddress: order.deliveryAddress,
      timestamp: new Date().toISOString()
    };

    await publishMessage(
      rabbitMQConfig.exchanges.orders,
      rabbitMQConfig.routingKeys.orderCreated,
      message
    );
  }

  static async publishOrderCancelled(order) {
    const message = {
      eventType: 'ORDER_CANCELLED',
      orderId: order.id,
      restaurantId: order.restaurantId,
      userId: order.userId,
      timestamp: new Date().toISOString()
    };

    await publishMessage(
      rabbitMQConfig.exchanges.orders,
      rabbitMQConfig.routingKeys.orderCancelled,
      message
    );
  }
}
