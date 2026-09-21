import { DeliveryZone } from '../../models/DeliveryZone.js';
import { Order } from '../../models/Order.js';
import {
    BadRequestError,
    NotFoundError,
    ConflictError,
} from '../../utils/errors.js';

const ZONE_FEE_MAP = {
    '0-3km': 15,
    '3-5km': 30,
};

/**
 * Admin: Create a new delivery zone/area.
 */
export const createZone = async ({ name, type, deliveryFee, isActive = true, sortOrder = 0 }) => {
    const trimmedName = name.trim();

    // Check for duplicate area name (case-insensitive)
    const existingZone = await DeliveryZone.findOne({
        name: { $regex: new RegExp(`^${trimmedName}$`, 'i') },
    });

    if (existingZone) {
        throw new ConflictError(`Delivery area "${trimmedName}" already exists`);
    }

    const fee = deliveryFee ?? ZONE_FEE_MAP[type];
    if (fee !== ZONE_FEE_MAP[type]) {
        throw new BadRequestError(
            `Delivery fee must correspond to zone type: ₹15 for 0-3km, ₹30 for 3-5km`
        );
    }

    const zone = new DeliveryZone({
        name: trimmedName,
        type,
        deliveryFee: fee,
        isActive,
        sortOrder,
    });

    await zone.save();
    return zone;
};

/**
 * Public: Retrieve active delivery zones/areas.
 * Returns only public-safe fields (_id, name, type, deliveryFee).
 */
export const getActiveZones = async () => {
    return DeliveryZone.find({ isActive: true })
        .select('_id name type deliveryFee')
        .sort({ sortOrder: 1, name: 1 })
        .lean();
};

/**
 * Admin: Retrieve all delivery zones (including inactive).
 */
export const getAllZonesAdmin = async () => {
    return DeliveryZone.find().sort({ sortOrder: 1, name: 1 });
};

/**
 * Admin: Retrieve a single delivery zone by ID.
 */
export const getZoneById = async (id) => {
    const zone = await DeliveryZone.findById(id);
    if (!zone) {
        throw new NotFoundError('Delivery zone not found');
    }
    return zone;
};

/**
 * Admin: Update an existing delivery zone.
 */
export const updateZone = async (id, updates) => {
    const zone = await DeliveryZone.findById(id);
    if (!zone) {
        throw new NotFoundError('Delivery zone not found');
    }

    if (updates.name && updates.name.trim().toLowerCase() !== zone.name.toLowerCase()) {
        const trimmedName = updates.name.trim();
        const duplicate = await DeliveryZone.findOne({
            _id: { $ne: id },
            name: { $regex: new RegExp(`^${trimmedName}$`, 'i') },
        });
        if (duplicate) {
            throw new ConflictError(`Delivery area "${trimmedName}" already exists`);
        }
        zone.name = trimmedName;
    }

    if (updates.type) {
        zone.type = updates.type;
        // Keep delivery fee strictly aligned with zone type
        zone.deliveryFee = updates.deliveryFee ?? ZONE_FEE_MAP[updates.type];
    } else if (updates.deliveryFee !== undefined) {
        if (updates.deliveryFee !== ZONE_FEE_MAP[zone.type]) {
            throw new BadRequestError(
                `Delivery fee must correspond to zone type: ₹15 for 0-3km, ₹30 for 3-5km`
            );
        }
        zone.deliveryFee = updates.deliveryFee;
    }

    if (updates.isActive !== undefined) {
        zone.isActive = updates.isActive;
    }

    if (updates.sortOrder !== undefined) {
        zone.sortOrder = updates.sortOrder;
    }

    await zone.save();
    return zone;
};

/**
 * Admin: Delete or soft-delete a delivery zone.
 * If orders reference this zone, deactivates (isActive=false) rather than hard deleting.
 */
export const deleteZone = async (id) => {
    const zone = await DeliveryZone.findById(id);
    if (!zone) {
        throw new NotFoundError('Delivery zone not found');
    }

    // Check if zone is referenced in existing orders
    const referencedOrderCount = await Order.countDocuments({
        'deliveryAddress.deliveryZoneId': id,
    });

    if (referencedOrderCount > 0) {
        // Soft delete / deactivate to preserve historical order integrity
        zone.isActive = false;
        await zone.save();
        return {
            softDeleted: true,
            zone,
            message: 'Delivery zone deactivated because it is referenced by existing orders.',
        };
    }

    await DeliveryZone.findByIdAndDelete(id);
    return {
        softDeleted: false,
        message: 'Delivery zone permanently deleted successfully.',
    };
};
