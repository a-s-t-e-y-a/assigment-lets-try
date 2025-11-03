import express from 'express';
import {
  placeOrderController,
  getOrderByIdController,
  getAllOrdersController,
  cancelOrderController,
  getUserOrdersController
} from './orderController.js';
import { validate } from '../utils/validation.js';
import {
  placeOrderSchema,
  getOrderByIdSchema,
  getAllOrdersSchema,
  cancelOrderSchema,
  getUserOrdersSchema
} from './orderValidation.js';
import { authenticateRole } from '../middleware/rbac.js';

const router = express.Router();

router.post('/orders', authenticateRole(['customer']), validate(placeOrderSchema), placeOrderController);

router.get('/orders', authenticateRole(['customer', 'restaurant', 'delivery_partner']), validate(getAllOrdersSchema), getAllOrdersController);

router.get('/orders/:id', authenticateRole(['customer', 'restaurant', 'delivery_partner']), validate(getOrderByIdSchema), getOrderByIdController);

router.put('/orders/:id/cancel', authenticateRole(['customer']), validate(cancelOrderSchema), cancelOrderController);

router.get('/users/:userId/orders', authenticateRole(['customer']), validate(getUserOrdersSchema), getUserOrdersController);

export default router;
