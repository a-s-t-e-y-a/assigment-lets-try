import amqp from 'amqplib';
import rabbitMQConfig from '../config/rabbitmq.js';

let connection = null;
let channel = null;

export const connectRabbitMQ = async () => {
  try {
    connection = await amqp.connect(rabbitMQConfig.url);
    channel = await connection.createChannel();

    await channel.assertExchange(rabbitMQConfig.exchanges.restaurant, 'topic', { durable: true });
    await channel.assertExchange(rabbitMQConfig.exchanges.delivery, 'topic', { durable: true });

    await channel.assertQueue(rabbitMQConfig.queues.deliveryOrders, { durable: true });

    await channel.bindQueue(
      rabbitMQConfig.queues.deliveryOrders,
      rabbitMQConfig.exchanges.restaurant,
      'order.prepared'
    );

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
    const messageId = message.orderId + '_' + message.eventType + '_' + Date.now();
    ch.publish(exchange, routingKey, messageBuffer, { 
      persistent: true,
      messageId: messageId
    });
    console.log(`Message published to ${exchange} with routing key ${routingKey}`);
    return true;
  } catch (error) {
    console.error('Failed to publish message:', error);
    throw error;
  }
};

export const consumeMessages = async (queueName, callback) => {
  try {
    const ch = getChannel();
    
    const processedMessages = new Set();
    
    await ch.consume(queueName, async (msg) => {
      if (msg) {
        const messageId = msg.properties.messageId || msg.content.toString();
        
        if (processedMessages.has(messageId)) {
          ch.ack(msg);
          console.log(`Duplicate message detected: ${messageId}`);
          return;
        }
        
        try {
          const content = JSON.parse(msg.content.toString());
          await callback(content);
          processedMessages.add(messageId);
          ch.ack(msg);
          console.log(`Message processed and acknowledged: ${messageId}`);
        } catch (error) {
          console.error('Error processing message:', error);
          ch.nack(msg, false, true);
        }
      }
    }, { noAck: false });
    console.log(`Started consuming from queue: ${queueName} (messages will persist until acknowledged)`);
  } catch (error) {
    console.error('Failed to consume messages:', error);
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
