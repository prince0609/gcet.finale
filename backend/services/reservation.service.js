const db = require('../config/db');
const { loadQueries } = require('../utils/queryLoader');

const orderQueries = loadQueries('orders.sql');
const productQueries = loadQueries('products.sql');

/**
 * Check availability for a product/variant during a date range
 */
const checkAvailability = async (productId, variantId, startDate, endDate, quantity) => {
    // Get total quantity
    let totalQty;
    if (variantId) {
        const variantResult = await db.query(orderQueries.getVariantQuantity, [variantId]);
        totalQty = variantResult.rows.length > 0 ? variantResult.rows[0].qty_on_hand : 0;
    } else {
        const productResult = await db.query(orderQueries.getProductQuantity, [productId]);
        totalQty = productResult.rows.length > 0 ? productResult.rows[0].qty_on_hand : 0;
    }

    // Get reserved quantity
    const reservedResult = await db.query(orderQueries.checkAvailability, [
        productId, variantId || null, startDate, endDate
    ]);
    const reservedQty = parseInt(reservedResult.rows[0].reserved_qty) || 0;

    const availableQty = totalQty - reservedQty;
    const isAvailable = availableQty >= quantity;

    return {
        productId,
        variantId,
        startDate,
        endDate,
        requestedQuantity: quantity,
        totalQuantity: totalQty,
        reservedQuantity: reservedQty,
        availableQuantity: availableQty,
        isAvailable
    };
};

/**
 * Create reservations for an order
 */
const createReservations = async (client, orderId, lines) => {
    for (const line of lines) {
        await client.query(orderQueries.createReservation, [
            orderId,
            line.product_id,
            line.variant_id,
            line.quantity,
            line.rental_start,
            line.rental_end
        ]);
    }
};

/**
 * Release reservations for an order (when cancelled or returned)
 */
const releaseReservations = async (orderId) => {
    await db.query(orderQueries.releaseReservations, [orderId]);
};

module.exports = {
    checkAvailability,
    createReservations,
    releaseReservations
};
