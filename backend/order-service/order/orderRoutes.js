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

const router = express.Router();

router.post('/orders', validate(placeOrderSchema), placeOrderController);

router.get('/orders', validate(getAllOrdersSchema), getAllOrdersController);

router.get('/orders/:id', validate(getOrderByIdSchema), getOrderByIdController);

router.put('/orders/:id/cancel', validate(cancelOrderSchema), cancelOrderController);

router.get('/users/:userId/orders', validate(getUserOrdersSchema), getUserOrdersController);

export default router;
