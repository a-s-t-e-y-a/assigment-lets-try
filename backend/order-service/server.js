import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import statusMonitor from 'express-status-monitor';
import routes from './routes.js';
import { connectRabbitMQ, closeConnection } from './utils/rabbitmq.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(statusMonitor({
  title: 'Order Service Monitor',
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
  res.status(200).json({ status: 'OK', service: 'order-service' });
});

const startServer = async () => {
  try {
    await connectRabbitMQ();
    
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Order Service running on port ${PORT}`);
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
