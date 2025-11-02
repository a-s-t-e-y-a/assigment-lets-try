import express from 'express';
import restaurantRoutes from './restaurant/restaurantRoutes.js';

const router = express.Router();

router.use('/', restaurantRoutes);

export default router;
