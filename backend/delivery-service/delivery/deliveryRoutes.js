import express from 'express';
import { DeliveryController } from './deliveryController.js';

const router = express.Router();

router.get('/orders', DeliveryController.getAllOrders);
router.get('/orders/prepared', DeliveryController.getPreparedOrders);
router.get('/orders/:orderId', DeliveryController.getOrderById);
router.put('/orders/:orderId/pickup', DeliveryController.pickupOrder);
router.put('/orders/:orderId/deliver', DeliveryController.deliverOrder);

export default router;
