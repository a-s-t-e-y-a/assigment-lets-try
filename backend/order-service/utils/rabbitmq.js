import amqp from 'amqplib';
import rabbitMQConfig from '../config/rabbitmq.js';
import { OrderService } from '../order/orderService.js';

let connection = null;
let channel = null;

export const connectRabbitMQ = async () => {
  try {
    connection = await amqp.connect(rabbitMQConfig.url);
    channel = await connection.createConfirmChannel();

    await channel.assertExchange(rabbitMQConfig.exchanges.orders, 'topic', { durable: true });
    await channel.assertExchange(rabbitMQConfig.exchanges.restaurant, 'topic', { durable: true });
    await channel.assertExchange(rabbitMQConfig.exchanges.delivery, 'topic', { durable: true });

    await channel.assertQueue(rabbitMQConfig.queues.orderCreated, { durable: true });
    await channel.assertQueue(rabbitMQConfig.queues.orderCancelled, { durable: true });
    await channel.assertQueue(rabbitMQConfig.queues.restaurantOrders, { durable: true });
    await channel.assertQueue(rabbitMQConfig.queues.deliveryOrders, { durable: true });

    const orderStatusQueue = 'order-status-updates';
    await channel.assertQueue(orderStatusQueue, { durable: true });

    await channel.bindQueue(
      rabbitMQConfig.queues.orderCreated,
      rabbitMQConfig.exchanges.orders,
      rabbitMQConfig.routingKeys.orderCreated
    );

    await channel.bindQueue(
      rabbitMQConfig.queues.orderCancelled,
      rabbitMQConfig.exchanges.orders,
      rabbitMQConfig.routingKeys.orderCancelled
    );

    await channel.bindQueue(
      rabbitMQConfig.queues.restaurantOrders,
      rabbitMQConfig.exchanges.orders,
      'order.*'
    );

    await channel.bindQueue(
      rabbitMQConfig.queues.deliveryOrders,
      rabbitMQConfig.exchanges.orders,
      'order.*'
    );

    await channel.bindQueue(
      orderStatusQueue,
      rabbitMQConfig.exchanges.restaurant,
      'order.*'
    );

    await channel.bindQueue(
      orderStatusQueue,
      rabbitMQConfig.exchanges.delivery,
      'order.*'
    );

    channel.consume(orderStatusQueue, async (msg) => {
      if (msg !== null) {
        try {
          const message = JSON.parse(msg.content.toString());
          console.log('Received status update:', message.eventType, 'for order:', message.orderId);

          if (message.eventType === 'ORDER_ACCEPTED') {
            OrderService.updateOrderStatus(message.orderId, 'ACCEPTED');
            console.log(`Order ${message.orderId} status updated to ACCEPTED`);
          } else if (message.eventType === 'ORDER_PREPARED') {
            OrderService.updateOrderStatus(message.orderId, 'PREPARED');
            console.log(`Order ${message.orderId} status updated to PREPARED`);
          } else if (message.eventType === 'ORDER_PICKED_UP') {
            OrderService.updateOrderStatus(message.orderId, 'PICKED_UP');
            console.log(`Order ${message.orderId} status updated to PICKED_UP`);
          } else if (message.eventType === 'ORDER_DELIVERED') {
            OrderService.updateOrderStatus(message.orderId, 'DELIVERED');
            console.log(`Order ${message.orderId} status updated to DELIVERED`);
          }

          channel.ack(msg);
        } catch (error) {
          console.error('Error processing status update:', error);
          channel.nack(msg, false, false);
        }
      }
    });

    console.log('RabbitMQ connected and exchanges/queues setup complete');
    return channel;
  } catch (error) {
    console.error('Failed to connect to RabbitMQ:', error);
    throw error;
  }
};

export const getChannel = () => {
  if (!channel) {
    throw new Error('RabbitMQ channel not initialized');
  }
  return channel;
};

export const publishMessage = async (exchange, routingKey, message) => {
  try {
    const ch = getChannel();
    const messageBuffer = Buffer.from(JSON.stringify(message));
    
    return new Promise((resolve, reject) => {
      ch.publish(
        exchange,
        routingKey,
        messageBuffer,
        { persistent: true, mandatory: true },
        (err) => {
          if (err) {
            console.error('Failed to publish message:', err);
            reject(err);
          } else {
            console.log(`Message published to ${exchange} with routing key ${routingKey}`);
            resolve(true);
          }
        }
      );
    });
  } catch (error) {
    console.error('Failed to publish message:', error);
    throw error;
  }
};

export const closeConnection = async () => {
  try {
    if (channel) await channel.close();
    if (connection) await connection.close();
    console.log('RabbitMQ connection closed');
  } catch (error) {
    console.error('Error closing RabbitMQ connection:', error);
  }
};
