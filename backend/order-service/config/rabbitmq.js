export const rabbitMQConfig = {
  url: process.env.RABBITMQ_URL || 'amqp://myuser:mypass@localhost:5672',
  exchanges: {
    orders: 'orders_exchange',
    restaurant: 'restaurant_exchange',
    delivery: 'delivery_exchange'
  },
  queues: {
    orderCreated: 'order_created_queue',
    orderCancelled: 'order_cancelled_queue',
    restaurantOrders: 'restaurant_orders_queue',
    deliveryOrders: 'delivery_orders_queue'
  },
  routingKeys: {
    orderCreated: 'order.created',
    orderCancelled: 'order.cancelled',
    orderAccepted: 'order.accepted',
    orderPrepared: 'order.prepared',
    orderPickedUp: 'order.pickedup',
    orderDelivered: 'order.delivered'
  }
};

export default rabbitMQConfig;
