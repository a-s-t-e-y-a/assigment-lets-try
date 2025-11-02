export const rabbitMQConfig = {
  url: process.env.RABBITMQ_URL || 'amqp://myuser:mypass@localhost:5672',
  exchanges: {
    orders: 'orders_exchange',
    restaurant: 'restaurant_exchange'
  },
  queues: {
    restaurantOrders: 'restaurant_orders_queue'
  },
  routingKeys: {
    orderCreated: 'order.created',
    orderCancelled: 'order.cancelled',
    orderAccepted: 'order.accepted',
    orderPrepared: 'order.prepared'
  }
};

export default rabbitMQConfig;
