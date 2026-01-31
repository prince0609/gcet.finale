const db = require('../config/db');
const { loadQueries } = require('../utils/queryLoader');
const { paginate, paginationResponse } = require('../utils/helpers');

const pickupQueries = loadQueries('pickups.sql');
const notificationQueries = loadQueries('notifications.sql');

/**
 * GET /api/pickups
 * List pickup documents
 */
const listPickups = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const { limit: queryLimit, offset } = paginate(page, limit);

        const vendorId = req.user.role === 'admin' ? req.query.vendorId : req.user.id;

        if (!vendorId && req.user.role !== 'admin') {
            return res.status(400).json({ error: 'Vendor ID is required' });
        }

        const [pickupsResult, countResult] = await Promise.all([
            db.query(pickupQueries.listPickupsForVendor, [vendorId || req.user.id, queryLimit, offset]),
            db.query(pickupQueries.countPickupsForVendor, [vendorId || req.user.id])
        ]);

        res.json(paginationResponse(
            pickupsResult.rows,
            parseInt(countResult.rows[0].total),
            page,
            limit
        ));
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/pickups/:id
 * Get pickup details
 */
const getPickup = async (req, res, next) => {
    try {
        const { id } = req.params;

        const pickupResult = await db.query(pickupQueries.getPickupById, [id]);
        if (pickupResult.rows.length === 0) {
            return res.status(404).json({ error: 'Pickup document not found' });
        }

        const linesResult = await db.query(pickupQueries.getPickupLines, [id]);

        res.json({
            pickup: pickupResult.rows[0],
            lines: linesResult.rows
        });
    } catch (error) {
        next(error);
    }
};

/**
 * PUT /api/pickups/:id/status
 * Update pickup status
 */
const updatePickupStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({ error: 'Status is required' });
        }

        if (!['pending', 'dispatched', 'completed', 'cancelled'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const result = await db.query(pickupQueries.updatePickupStatus, [id, status]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Pickup document not found' });
        }

        // Create notification for customer
        if (status === 'dispatched') {
            const pickupResult = await db.query(pickupQueries.getPickupById, [id]);
            const pickup = pickupResult.rows[0];

            await db.query(notificationQueries.createNotification, [
                pickup.customer_id,
                pickup.rental_order_id,
                'pickup_scheduled',
                'Your rental items are ready for pickup/delivery.',
                null
            ]);
        }

        res.json({
            message: 'Pickup status updated',
            pickup: result.rows[0]
        });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/pickups/:id/complete
 * Complete pickup (all items picked)
 */
const completePickup = async (req, res, next) => {
    const client = await db.getClient();

    try {
        const { id } = req.params;
        const { lines } = req.body; // Array of { lineId, quantityPicked }

        await client.query('BEGIN');

        const pickupResult = await client.query(pickupQueries.getPickupById, [id]);
        if (pickupResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'Pickup document not found' });
        }

        // Update pickup lines if provided
        if (lines && lines.length > 0) {
            for (const line of lines) {
                await client.query(pickupQueries.updatePickupLine, [line.lineId, line.quantityPicked]);
            }
        } else {
            // Mark all lines as fully picked
            const linesResult = await client.query(pickupQueries.getPickupLines, [id]);
            for (const line of linesResult.rows) {
                await client.query(pickupQueries.updatePickupLine, [line.id, line.quantity_expected]);
            }
        }

        // Complete the pickup
        const result = await client.query(pickupQueries.completePickup, [id]);

        await client.query('COMMIT');

        res.json({
            message: 'Pickup completed',
            pickup: result.rows[0]
        });
    } catch (error) {
        await client.query('ROLLBACK');
        next(error);
    } finally {
        client.release();
    }
};

module.exports = {
    listPickups,
    getPickup,
    updatePickupStatus,
    completePickup
};
