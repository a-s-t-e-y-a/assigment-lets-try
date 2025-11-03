import express from 'express';
import { RestaurantController } from './restaurantController.js';
import { authenticateRole } from '../middleware/rbac.js';

const router = express.Router();

router.get('/orders', authenticateRole(['restaurant']), RestaurantController.getAllOrders);
router.get('/restaurants/:restaurantId/orders/pending', authenticateRole(['restaurant']), RestaurantController.getPendingOrders);
router.get('/orders/:orderId', authenticateRole(['restaurant']), RestaurantController.getOrderById);
router.put('/orders/:orderId/accept', authenticateRole(['restaurant']), RestaurantController.acceptOrder);
router.put('/orders/:orderId/prepare', authenticateRole(['restaurant']), RestaurantController.markOrderAsPrepared);

export default router;
