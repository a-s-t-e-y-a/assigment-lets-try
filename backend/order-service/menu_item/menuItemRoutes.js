import express from 'express';
import {
  getAllRestaurantsController,
  getRestaurantByIdController,
  getMenuItemsByRestaurantController,
  getMenuItemByIdController,
  searchController
} from './menuItemController.js';

const router = express.Router();

router.get('/restaurants', getAllRestaurantsController);

router.get('/restaurants/:id', getRestaurantByIdController);

router.get('/restaurants/:id/menu', getMenuItemsByRestaurantController);

router.get('/restaurants/:id/menu/:itemId', getMenuItemByIdController);

router.get('/search', searchController);

export default router;
