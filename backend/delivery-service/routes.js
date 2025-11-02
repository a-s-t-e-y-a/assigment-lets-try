import express from 'express';
import deliveryRoutes from './delivery/deliveryRoutes.js';

const router = express.Router();

router.use('/', deliveryRoutes);

export default router;
