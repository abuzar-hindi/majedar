import { BadRequestError } from '../utils/errors.js';

/**
 * Centralized restaurant business configuration.
 * Controls store operational status, minimum order thresholds, and tiered delivery fee calculations.
 */
export const restaurantConfig = {
    isOpen: process.env.RESTAURANT_IS_OPEN !== 'false',
    deliveryTiers: {
        tier1: {
            id: 'tier1',
            label: '0–3 km',
            maxDistanceKm: 3,
            fee: parseInt(process.env.DELIVERY_FEE_TIER1, 10) || 15,
        },
        tier2: {
            id: 'tier2',
            label: '3–5 km',
            maxDistanceKm: 5,
            fee: parseInt(process.env.DELIVERY_FEE_TIER2, 10) || 30,
        },
    },
    minimumOrderAmount: parseInt(process.env.MINIMUM_ORDER_AMOUNT, 10) || 100,
    city: 'Ayodhya',
};

export const isRestaurantOpen = () => {
    return restaurantConfig.isOpen;
};

export const getDeliveryTiers = () => {
    return [
        { ...restaurantConfig.deliveryTiers.tier1 },
        { ...restaurantConfig.deliveryTiers.tier2 },
    ];
};

export const getAllowedDeliveryFees = () => {
    return [
        restaurantConfig.deliveryTiers.tier1.fee,
        restaurantConfig.deliveryTiers.tier2.fee,
    ];
};

/**
 * Calculate or validate the delivery fee.
 * Easily upgradable to automatic distance calculation later.
 */
export const calculateDeliveryFee = ({
    orderType = 'delivery',
    subtotal = 0,
    address = null,
    selectedDeliveryFee = null,
    distanceKm = null,
} = {}) => {
    if (orderType === 'pickup' || orderType === 'dine_in') {
        return 0;
    }

    // Upgradable hook: If distance is provided (future automatic calculation)
    if (typeof distanceKm === 'number') {
        if (distanceKm <= restaurantConfig.deliveryTiers.tier1.maxDistanceKm) {
            return restaurantConfig.deliveryTiers.tier1.fee;
        }
        if (distanceKm <= restaurantConfig.deliveryTiers.tier2.maxDistanceKm) {
            return restaurantConfig.deliveryTiers.tier2.fee;
        }
        throw new BadRequestError('Delivery address is beyond our 5 km delivery service radius.');
    }

    const allowedFees = getAllowedDeliveryFees();

    // If client provided a selected delivery fee, validate it strictly against allowed tiers
    if (selectedDeliveryFee !== undefined && selectedDeliveryFee !== null) {
        const feeNum = Number(selectedDeliveryFee);
        if (!allowedFees.includes(feeNum)) {
            throw new BadRequestError(
                `Invalid delivery fee. Allowed fees are ₹${allowedFees.join(' (0–3 km) and ₹')} (3–5 km).`
            );
        }
        return feeNum;
    }

    // Default fallback: Tier 1 fee (0–3 km)
    return restaurantConfig.deliveryTiers.tier1.fee;
};

export const setRestaurantOpen = (status) => {
    restaurantConfig.isOpen = Boolean(status);
};

export const setDeliveryFeeTier1 = (fee) => {
    restaurantConfig.deliveryTiers.tier1.fee = Number(fee);
};

export const setDeliveryFeeTier2 = (fee) => {
    restaurantConfig.deliveryTiers.tier2.fee = Number(fee);
};

// Setter helper for testing
export const setDeliveryFee = (fee) => {
    setDeliveryFeeTier1(fee);
};

export const setMinimumOrderAmount = (amount) => {
    restaurantConfig.minimumOrderAmount = Number(amount);
};
