const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const statusMonitor = require('express-status-monitor');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = process.env.PORT || 4000;

const ORDER_SERVICE_URL = process.env.ORDER_SERVICE_URL || 'http://localhost:3001';
const RESTAURANT_SERVICE_URL = process.env.RESTAURANT_SERVICE_URL || 'http://localhost:3002';
const DELIVERY_SERVICE_URL = process.env.DELIVERY_SERVICE_URL || 'http://localhost:3003';

app.use(statusMonitor({
  title: 'API Gateway Monitor',
  path: '/status',
  healthChecks: [
    {
      protocol: 'http',
      host: ORDER_SERVICE_URL.replace('http://', '').split(':')[0],
      path: '/health',
      port: 3001
    },
    {
      protocol: 'http',
      host: RESTAURANT_SERVICE_URL.replace('http://', '').split(':')[0], 
      path: '/health',
      port: 3002
    },
    {
      protocol: 'http',
      host: DELIVERY_SERVICE_URL.replace('http://', '').split(':')[0],
      path: '/health',
      port: 3003
    }
  ]
}));

app.use(cors());

app.use('/api/orders', createProxyMiddleware({
  target: ORDER_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: {
    '^/api/orders': ''
  },
  logLevel: 'debug'
}));

app.use('/api/restaurant', createProxyMiddleware({
  target: RESTAURANT_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: {
    '^/api/restaurant': ''
  },
  logLevel: 'debug'
}));

app.use('/api/delivery', createProxyMiddleware({
  target: DELIVERY_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: {
    '^/api/delivery': ''
  },
  logLevel: 'debug'
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    service: 'api-gateway',
    upstreamServices: {
      orderService: ORDER_SERVICE_URL,
      restaurantService: RESTAURANT_SERVICE_URL,
      deliveryService: DELIVERY_SERVICE_URL
    }
  });
});

app.get('/', (req, res) => {
  res.json({
    message: 'Food Order Lifecycle API Gateway',
    version: '1.0.0',
    endpoints: {
      orders: '/api/orders/*',
      restaurant: '/api/restaurant/*', 
      delivery: '/api/delivery/*',
      health: '/health',
      status: '/status'
    }
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`API Gateway running on port ${PORT}`);
});
