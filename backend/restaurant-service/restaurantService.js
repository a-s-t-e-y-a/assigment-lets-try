import { publishMessage } from './utils/rabbitmq.js';
import rabbitMQConfig from './config/rabbitmq.js';

// In-memory store for orders
const orders = new Map();

export class RestaurantService {
  // Handle incoming order from RabbitMQ
  static handleOrderCreated(orderData) {
    const order = {
      id: orderData.orderId,
      restaurantId: orderData.restaurantId,
      userId: orderData.userId,
      items: orderData.items,
      totalAmount: orderData.totalAmount,
      deliveryAddress: orderData.deliveryAddress,
      status: 'PENDING',
      createdAt: orderData.timestamp || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    orders.set(order.id, order);
    console.log(`Order ${order.id} received and stored with status PENDING`);
    return order;
  }

  // Handle order cancellation from RabbitMQ
  static handleOrderCancelled(orderData) {
    const order = orders.get(orderData.orderId);
    if (order) {
      order.status = 'CANCELLED';
      order.updatedAt = new Date().toISOString();
      orders.set(order.id, order);
      console.log(`Order ${order.id} cancelled`);
    }
    return order;
  }

  // Get all orders
  static getAllOrders(filters = {}) {
    let orderList = Array.from(orders.values());

    // Filter by status
    if (filters.status) {
      orderList = orderList.filter(order => order.status === filters.status);
    }

    // Filter by restaurant
    if (filters.restaurantId) {
      orderList = orderList.filter(order => order.restaurantId === filters.restaurantId);
    }

    // Sort
    if (filters.sortBy) {
      orderList.sort((a, b) => {
        const aVal = a[filters.sortBy];
        const bVal = b[filters.sortBy];
        const order = filters.sortOrder === 'desc' ? -1 : 1;
        
        if (aVal < bVal) return -1 * order;
        if (aVal > bVal) return 1 * order;
        return 0;
      });
    }

    return orderList;
  }

  // Get pending orders for a specific restaurant
  static getPendingOrders(restaurantId) {
    return Array.from(orders.values()).filter(
      order => order.restaurantId === restaurantId && order.status === 'PENDING'
    );
  }

  // Get order by ID
  static getOrderById(orderId) {
    return orders.get(orderId);
  }

  // Accept a pending order
  static async acceptOrder(orderId) {
    const order = orders.get(orderId);
    
    if (!order) {
      throw new Error('Order not found');
    }

    if (order.status !== 'PENDING') {
      throw new Error(`Cannot accept order with status ${order.status}. Only PENDING orders can be accepted.`);
    }

    // Update order status
    order.status = 'ACCEPTED';
    order.acceptedAt = new Date().toISOString();
    order.updatedAt = new Date().toISOString();
    orders.set(orderId, order);

    // Publish event to RabbitMQ
    await this.publishOrderAccepted(order);

    console.log(`Order ${orderId} accepted`);
    return order;
  }

  // Mark order as prepared
  static async markOrderAsPrepared(orderId) {
    const order = orders.get(orderId);
    
    if (!order) {
      throw new Error('Order not found');
    }

    if (order.status !== 'ACCEPTED') {
      throw new Error(`Cannot mark order as prepared with status ${order.status}. Only ACCEPTED orders can be prepared.`);
    }

    // Update order status
    order.status = 'PREPARED';
    order.preparedAt = new Date().toISOString();
    order.updatedAt = new Date().toISOString();
    orders.set(orderId, order);

    // Publish event to RabbitMQ
    await this.publishOrderPrepared(order);

    console.log(`Order ${orderId} marked as prepared`);
    return order;
  }

  // Publish order accepted event
  static async publishOrderAccepted(order) {
    const message = {
      eventType: 'ORDER_ACCEPTED',
      orderId: order.id,
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

  // Publish order prepared event
  static async publishOrderPrepared(order) {
    const message = {
      eventType: 'ORDER_PREPARED',
      orderId: order.id,
      restaurantId: order.restaurantId,
      userId: order.userId,
      deliveryAddress: order.deliveryAddress,
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
