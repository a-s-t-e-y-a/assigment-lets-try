import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import statusMonitor from 'express-status-monitor';
import routes from './routes.js';
import { connectRabbitMQ, closeConnection, consumeMessages } from './utils/rabbitmq.js';
import rabbitMQConfig from './config/rabbitmq.js';
import { RestaurantService } from './restaurant/restaurantService.js';
import { connectDB } from './config/database.js';

const app = express();
const PORT = process.env.PORT || 3002;

app.use(statusMonitor({
  title: 'Restaurant Service Monitor',
  path: '/status',
  healthChecks: [{
    protocol: 'http',
    host: 'localhost',
    path: '/health',
    port: PORT
  }]
}));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/', routes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', service: 'restaurant-service' });
});

const startConsumingOrders = async () => {
  await consumeMessages(rabbitMQConfig.queues.restaurantOrders, async (message) => {
    console.log('Received message:', message);
    
    if (message.eventType === 'ORDER_CREATED') {
      await RestaurantService.handleOrderCreated(message);
    } else if (message.eventType === 'ORDER_CANCELLED') {
      await RestaurantService.handleOrderCancelled(message);
    }
  });
};

const startServer = async () => {
  try {
    await connectDB();
    await connectRabbitMQ();
    await startConsumingOrders();
    
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Restaurant Service running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

process.on('SIGINT', async () => {
  await closeConnection();
  process.exit(0);
});

startServer();
