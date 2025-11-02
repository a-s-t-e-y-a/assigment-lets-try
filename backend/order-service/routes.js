import express from 'express';
import menuItemRoutes from './menu_item/menuItemRoutes.js';
import orderRoutes from './order/orderRoutes.js';

const router = express.Router();

router.use('/menu-item', menuItemRoutes);
router.use('/', orderRoutes);

export default router;
