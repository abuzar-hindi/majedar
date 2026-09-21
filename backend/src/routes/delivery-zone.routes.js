import { Router } from 'express';
import { getPublicDeliveryZones } from '../controllers/delivery-zone.controller.js';

const router = Router();

// GET /api/delivery-zones - Public endpoint to retrieve active delivery zones
router.get('/', getPublicDeliveryZones);

export default router;
