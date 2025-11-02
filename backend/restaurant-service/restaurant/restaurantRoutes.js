import express from 'express';
import { RestaurantController } from './restaurantController.js';

const router = express.Router();

router.get('/orders', RestaurantController.getAllOrders);
router.get('/restaurants/:restaurantId/orders/pending', RestaurantController.getPendingOrders);
router.get('/orders/:orderId', RestaurantController.getOrderById);
router.put('/orders/:orderId/accept', RestaurantController.acceptOrder);
router.put('/orders/:orderId/prepare', RestaurantController.markOrderAsPrepared);

export default router;
