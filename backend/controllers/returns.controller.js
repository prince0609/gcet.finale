const db = require('../config/db');
const { loadQueries } = require('../utils/queryLoader');
const { paginate, paginationResponse, calculateLateDays } = require('../utils/helpers');
const reservationService = require('../services/reservation.service');
const lateFeeService = require('../services/lateFee.service');

const returnQueries = loadQueries('returns.sql');
const orderQueries = loadQueries('orders.sql');

/**
 * GET /api/returns
 * List return documents
 */
const listReturns = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const { limit: queryLimit, offset } = paginate(page, limit);

        const vendorId = req.user.role === 'admin' ? req.query.vendorId : req.user.id;

        if (!vendorId && req.user.role !== 'admin') {
            return res.status(400).json({ error: 'Vendor ID is required' });
        }

        const [returnsResult, countResult] = await Promise.all([
            db.query(returnQueries.listReturnsForVendor, [vendorId || req.user.id, queryLimit, offset]),
            db.query(returnQueries.countReturnsForVendor, [vendorId || req.user.id])
        ]);

        res.json(paginationResponse(
            returnsResult.rows,
            parseInt(countResult.rows[0].total),
            page,
            limit
        ));
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/returns/:id
 * Get return details
 */
const getReturn = async (req, res, next) => {
    try {
        const { id } = req.params;

        const returnResult = await db.query(returnQueries.getReturnById, [id]);
        if (returnResult.rows.length === 0) {
            return res.status(404).json({ error: 'Return document not found' });
        }

        const [linesResult, lateFeesResult] = await Promise.all([
            db.query(returnQueries.getReturnLines, [id]),
            db.query(returnQueries.getLateFeesByReturnId, [id])
        ]);

        res.json({
            return: returnResult.rows[0],
            lines: linesResult.rows,
            lateFees: lateFeesResult.rows
        });
    } catch (error) {
        next(error);
    }
};

/**
 * PUT /api/returns/:id/status
 * Update return status
 */
const updateReturnStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({ error: 'Status is required' });
        }

        if (!['pending', 'in_transit', 'received', 'cancelled'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const result = await db.query(returnQueries.updateReturnStatus, [id, status]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Return document not found' });
        }

        res.json({
            message: 'Return status updated',
            return: result.rows[0]
        });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/returns/:id/complete
 * Complete return with late fee calculation
 */
const completeReturn = async (req, res, next) => {
    const client = await db.getClient();

    try {
        const { id } = req.params;
        const { lines, actualReturnDate } = req.body; // Array of { lineId, quantityReturned }

        await client.query('BEGIN');

        const returnResult = await client.query(returnQueries.getReturnById, [id]);
        if (returnResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'Return document not found' });
        }

        const returnDoc = returnResult.rows[0];
        const returnDate = actualReturnDate ? new Date(actualReturnDate) : new Date();

        // Get return lines
        const linesResult = await client.query(returnQueries.getReturnLines, [id]);
        const lateFees = [];

        // Process each line
        for (const line of linesResult.rows) {
            const quantityReturned = lines?.find(l => l.lineId === line.id)?.quantityReturned || line.quantity_expected;

            // Update return line
            await client.query(returnQueries.updateReturnLine, [line.id, quantityReturned]);

            // Calculate late fee
            const lateFee = await lateFeeService.calculateLateFee(
                line.product_id,
                line.rental_end,
                returnDate,
                line.unit_price || 0
            );

            if (lateFee.lateDays > 0 && lateFee.feeAmount > 0) {
                const feeResult = await client.query(returnQueries.createLateFee, [
                    line.id,
                    line.rental_order_line_id,
                    line.rental_end,
                    returnDate.toISOString().split('T')[0],
                    lateFee.lateDays,
                    lateFee.feeAmount
                ]);
                lateFees.push(feeResult.rows[0]);
            }
        }

        // Complete the return
        const result = await client.query(returnQueries.completeReturn, [id]);

        // Release reservations
        await reservationService.releaseReservations(returnDoc.rental_order_id);

        // Update order status to returned
        await client.query(orderQueries.updateOrderStatus, [returnDoc.rental_order_id, 'returned']);

        await client.query('COMMIT');

        res.json({
            message: 'Return completed',
            return: result.rows[0],
            lateFees
        });
    } catch (error) {
        await client.query('ROLLBACK');
        next(error);
    } finally {
        client.release();
    }
};

module.exports = {
    listReturns,
    getReturn,
    updateReturnStatus,
    completeReturn
};
