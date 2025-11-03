import express from 'express';
import {
  getAllRestaurantsController,
  getRestaurantByIdController,
  getMenuItemsByRestaurantController,
  getMenuItemByIdController,
  searchController
} from './menuItemController.js';
import { authenticateRole } from '../middleware/rbac.js';

const router = express.Router();

router.get('/restaurants', authenticateRole(['customer']), getAllRestaurantsController);

router.get('/restaurants/:id', authenticateRole(['customer']), getRestaurantByIdController);

router.get('/restaurants/:id/menu', authenticateRole(['customer']), getMenuItemsByRestaurantController);

router.get('/restaurants/:id/menu/:itemId', authenticateRole(['customer']), getMenuItemByIdController);

router.get('/search', authenticateRole(['customer']), searchController);

export default router;
