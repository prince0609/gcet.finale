const db = require('../config/db');
const { loadQueries } = require('../utils/queryLoader');
const { paginate, paginationResponse } = require('../utils/helpers');
const reservationService = require('../services/reservation.service');

const orderQueries = loadQueries('orders.sql');
const pickupQueries = loadQueries('pickups.sql');
const returnQueries = loadQueries('returns.sql');
const notificationQueries = loadQueries('notifications.sql');

/**
 * GET /api/orders
 * List orders (role-based)
 */
const listOrders = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const { limit: queryLimit, offset } = paginate(page, limit);

        let ordersResult, countResult;

        if (req.user.role === 'customer') {
            [ordersResult, countResult] = await Promise.all([
                db.query(orderQueries.listCustomerOrders, [req.user.id, queryLimit, offset]),
                db.query(orderQueries.countCustomerOrders, [req.user.id])
            ]);
        } else if (req.user.role === 'vendor') {
            [ordersResult, countResult] = await Promise.all([
                db.query(orderQueries.listVendorOrders, [req.user.id, queryLimit, offset]),
                db.query(orderQueries.countVendorOrders, [req.user.id])
            ]);
        } else {
            // Admin sees all
            [ordersResult, countResult] = await Promise.all([
                db.query(orderQueries.listAllOrders, [queryLimit, offset]),
                db.query(orderQueries.countAllOrders)
            ]);
        }

        res.json(paginationResponse(
            ordersResult.rows,
            parseInt(countResult.rows[0].total),
            page,
            limit
        ));
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/orders/:id
 * Get order details
 */
const getOrder = async (req, res, next) => {
    try {
        const { id } = req.params;

        let orderResult;
        if (req.user.role === 'customer') {
            orderResult = await db.query(orderQueries.getOrderByIdForCustomer, [id, req.user.id]);
        } else {
            orderResult = await db.query(orderQueries.getOrderById, [id]);
        }

        if (orderResult.rows.length === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }

        const order = orderResult.rows[0];

        // For vendors, check if they have products in this order
        if (req.user.role === 'vendor') {
            const linesResult = await db.query(orderQueries.getOrderLines, [id]);
            const vendorProducts = linesResult.rows.filter(line => line.vendor_id === req.user.id);
            if (vendorProducts.length === 0) {
                return res.status(403).json({ error: 'Access denied' });
            }
        }

        // Get order lines
        const linesResult = await db.query(orderQueries.getOrderLines, [id]);

        // Get pickup and return documents if they exist
        const [pickupResult, returnResult] = await Promise.all([
            db.query(pickupQueries.getPickupByOrderId, [id]),
            db.query(returnQueries.getReturnByOrderId, [id])
        ]);

        res.json({
            order,
            lines: linesResult.rows,
            pickup: pickupResult.rows[0] || null,
            return: returnResult.rows[0] || null
        });
    } catch (error) {
        next(error);
    }
};

/**
 * PUT /api/orders/:id/status
 * Update order status
 */
const updateOrderStatus = async (req, res, next) => {
    const client = await db.getClient();

    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({ error: 'Status is required' });
        }

        if (!['confirmed', 'active', 'returned', 'cancelled'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        await client.query('BEGIN');

        const orderResult = await client.query(orderQueries.getOrderById, [id]);
        if (orderResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'Order not found' });
        }

        const order = orderResult.rows[0];

        // Handle status transitions
        if (status === 'active' && order.status === 'confirmed') {
            // Create pickup document when order becomes active
            const linesResult = await client.query(orderQueries.getOrderLines, [id]);
            const earliestStart = linesResult.rows.reduce((min, line) =>
                line.rental_start < min ? line.rental_start : min, linesResult.rows[0].rental_start
            );

            const pickupResult = await client.query(pickupQueries.createPickupDocument, [
                id, 'Ready for pickup', earliestStart
            ]);

            // Create pickup lines
            for (const line of linesResult.rows) {
                await client.query(pickupQueries.createPickupLine, [
                    pickupResult.rows[0].id, line.id, line.quantity
                ]);
            }

            // Create return document
            const latestEnd = linesResult.rows.reduce((max, line) =>
                line.rental_end > max ? line.rental_end : max, linesResult.rows[0].rental_end
            );

            const returnResult = await client.query(returnQueries.createReturnDocument, [
                id, latestEnd
            ]);

            // Create return lines
            for (const line of linesResult.rows) {
                await client.query(returnQueries.createReturnLine, [
                    returnResult.rows[0].id, line.id, line.quantity
                ]);
            }

            // Create notification
            await client.query(notificationQueries.createNotification, [
                order.customer_id, id, 'order_confirmed',
                'Your rental order has been confirmed and is ready for pickup.',
                null
            ]);
        }

        if (status === 'cancelled') {
            // Release reservations
            await reservationService.releaseReservations(id);
        }

        // Update order status
        const result = await client.query(orderQueries.updateOrderStatus, [id, status]);

        await client.query('COMMIT');

        res.json({
            message: 'Order status updated successfully',
            order: result.rows[0]
        });
    } catch (error) {
        await client.query('ROLLBACK');
        next(error);
    } finally {
        client.release();
    }
};

module.exports = {
    listOrders,
    getOrder,
    updateOrderStatus
};
