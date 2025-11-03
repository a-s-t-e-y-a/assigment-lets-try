import express from 'express';
import { DeliveryController } from './deliveryController.js';
import { authenticateRole } from '../middleware/rbac.js';

const router = express.Router();

router.get('/orders', authenticateRole(['delivery_partner']), DeliveryController.getAllOrders);
router.get('/orders/prepared', authenticateRole(['delivery_partner']), DeliveryController.getPreparedOrders);
router.get('/orders/:orderId', authenticateRole(['delivery_partner']), DeliveryController.getOrderById);
router.put('/orders/:orderId/pickup', authenticateRole(['delivery_partner']), DeliveryController.pickupOrder);
router.put('/orders/:orderId/deliver', authenticateRole(['delivery_partner']), DeliveryController.deliverOrder);

export default router;
