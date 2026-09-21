import { Router } from 'express';
import {
    createDeliveryZone,
    getAdminDeliveryZones,
    getAdminDeliveryZoneById,
    updateAdminDeliveryZone,
    deleteAdminDeliveryZone,
} from '../controllers/delivery-zone.controller.js';
import { authenticateAdmin } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validation.middleware.js';
import {
    createDeliveryZoneSchema,
    updateDeliveryZoneSchema,
    zoneIdParamSchema,
} from '../validators/delivery-zone.validator.js';

const router = Router();

// All admin delivery-zone endpoints require admin authentication
router.use(authenticateAdmin);

router.post('/', validate(createDeliveryZoneSchema), createDeliveryZone);
router.get('/', getAdminDeliveryZones);
router.get('/:id', validate(zoneIdParamSchema, 'params'), getAdminDeliveryZoneById);
router.patch(
    '/:id',
    validate(zoneIdParamSchema, 'params'),
    validate(updateDeliveryZoneSchema),
    updateAdminDeliveryZone
);
router.delete('/:id', validate(zoneIdParamSchema, 'params'), deleteAdminDeliveryZone);

export default router;
