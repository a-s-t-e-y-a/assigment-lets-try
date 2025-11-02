export const rabbitMQConfig = {
  url: process.env.RABBITMQ_URL || 'amqp://myuser:mypass@localhost:5672',
  exchanges: {
    restaurant: 'restaurant_exchange',
    delivery: 'delivery_exchange'
  },
  queues: {
    deliveryOrders: 'delivery_orders_queue'
  },
  routingKeys: {
    orderPrepared: 'order.prepared',
    orderPickedUp: 'order.pickedup',
    orderDelivered: 'order.delivered'
  }
};

export default rabbitMQConfig;
