const db = require('../config/db');
const { loadQueries } = require('../utils/queryLoader');
const { paginate, paginationResponse, calculateRentalDays } = require('../utils/helpers');
const reservationService = require('../services/reservation.service');

const quotationQueries = loadQueries('quotations.sql');
const orderQueries = loadQueries('orders.sql');
const catalogQueries = loadQueries('catalog.sql');

/**
 * GET /api/quotations
 * List user's quotations
 */
const listQuotations = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const { limit: queryLimit, offset } = paginate(page, limit);

        const customerId = req.user.role === 'customer' ? req.user.id : req.query.customerId;

        if (!customerId) {
            return res.status(400).json({ error: 'Customer ID is required' });
        }

        const [quotationsResult, countResult] = await Promise.all([
            db.query(quotationQueries.listCustomerQuotations, [customerId, queryLimit, offset]),
            db.query(quotationQueries.countCustomerQuotations, [customerId])
        ]);

        res.json(paginationResponse(
            quotationsResult.rows,
            parseInt(countResult.rows[0].total),
            page,
            limit
        ));
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/quotations
 * Create a new quotation (cart)
 */
const createQuotation = async (req, res, next) => {
    try {
        // Check for existing draft quotation
        const existingResult = await db.query(quotationQueries.getDraftQuotationForCustomer, [req.user.id]);

        if (existingResult.rows.length > 0) {
            return res.json({
                message: 'Using existing draft quotation',
                quotation: existingResult.rows[0]
            });
        }

        const result = await db.query(quotationQueries.createQuotation, [req.user.id]);

        res.status(201).json({
            message: 'Quotation created successfully',
            quotation: result.rows[0]
        });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/quotations/:id
 * Get quotation details with lines
 */
const getQuotation = async (req, res, next) => {
    try {
        const { id } = req.params;

        let quotationResult;
        if (req.user.role === 'customer') {
            quotationResult = await db.query(quotationQueries.getQuotationByIdForCustomer, [id, req.user.id]);
        } else {
            quotationResult = await db.query(quotationQueries.getQuotationById, [id]);
        }

        if (quotationResult.rows.length === 0) {
            return res.status(404).json({ error: 'Quotation not found' });
        }

        const [linesResult, totalResult] = await Promise.all([
            db.query(quotationQueries.getQuotationLines, [id]),
            db.query(quotationQueries.getQuotationTotal, [id])
        ]);

        res.json({
            quotation: quotationResult.rows[0],
            lines: linesResult.rows,
            total: parseFloat(totalResult.rows[0].total)
        });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/quotations/:id/lines
 * Add item to quotation
 */
const addLine = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { productId, variantId, quantity, rentalStart, rentalEnd } = req.body;

        if (!productId || !rentalStart || !rentalEnd) {
            return res.status(400).json({ error: 'productId, rentalStart, and rentalEnd are required' });
        }

        // Verify quotation belongs to customer and is still draft
        const quotationResult = await db.query(quotationQueries.getQuotationByIdForCustomer, [id, req.user.id]);
        if (quotationResult.rows.length === 0) {
            return res.status(404).json({ error: 'Quotation not found' });
        }

        if (quotationResult.rows[0].status !== 'draft') {
            return res.status(400).json({ error: 'Cannot modify a non-draft quotation' });
        }

        // Verify product exists and is published
        const productResult = await db.query(catalogQueries.getPublishedProductById, [productId]);
        if (productResult.rows.length === 0) {
            return res.status(404).json({ error: 'Product not found or not available' });
        }

        const product = productResult.rows[0];
        const qty = quantity || 1;

        // Check availability
        const availability = await reservationService.checkAvailability(
            productId, variantId, rentalStart, rentalEnd, qty
        );

        if (!availability.isAvailable) {
            return res.status(400).json({
                error: 'Product not available for the requested dates and quantity',
                availability
            });
        }

        // Get pricing for the rental period
        const pricingResult = await db.query(catalogQueries.getProductPricingPublic, [productId]);
        const days = calculateRentalDays(rentalStart, rentalEnd);

        // Calculate unit price based on best pricing tier
        let unitPrice = product.sales_price;
        for (const pricing of pricingResult.rows) {
            if (pricing.period_unit === 'day') {
                unitPrice = parseFloat(pricing.price);
                break;
            }
        }

        // Multiply by rental days for total unit price
        const totalUnitPrice = unitPrice * days;

        const result = await db.query(quotationQueries.addQuotationLine, [
            id, productId, variantId || null, qty, rentalStart, rentalEnd, totalUnitPrice
        ]);

        res.status(201).json({
            message: 'Item added to quotation',
            line: result.rows[0]
        });
    } catch (error) {
        next(error);
    }
};

/**
 * PUT /api/quotations/:id/lines/:lineId
 * Update quotation line
 */
const updateLine = async (req, res, next) => {
    try {
        const { id, lineId } = req.params;
        const { quantity, rentalStart, rentalEnd } = req.body;

        // Verify quotation
        const quotationResult = await db.query(quotationQueries.getQuotationByIdForCustomer, [id, req.user.id]);
        if (quotationResult.rows.length === 0) {
            return res.status(404).json({ error: 'Quotation not found' });
        }

        if (quotationResult.rows[0].status !== 'draft') {
            return res.status(400).json({ error: 'Cannot modify a non-draft quotation' });
        }

        // Get existing line
        const lineResult = await db.query(quotationQueries.getQuotationLineById, [lineId, id]);
        if (lineResult.rows.length === 0) {
            return res.status(404).json({ error: 'Line not found' });
        }

        const line = lineResult.rows[0];
        const newQty = quantity || line.quantity;
        const newStart = rentalStart || line.rental_start;
        const newEnd = rentalEnd || line.rental_end;

        // If dates changed, recalculate price
        let newUnitPrice = line.unit_price;
        if (rentalStart || rentalEnd) {
            const productResult = await db.query(catalogQueries.getPublishedProductById, [line.product_id]);
            const pricingResult = await db.query(catalogQueries.getProductPricingPublic, [line.product_id]);
            const days = calculateRentalDays(newStart, newEnd);

            let dailyPrice = productResult.rows[0].sales_price;
            for (const pricing of pricingResult.rows) {
                if (pricing.period_unit === 'day') {
                    dailyPrice = parseFloat(pricing.price);
                    break;
                }
            }
            newUnitPrice = dailyPrice * days;
        }

        // Check availability
        const availability = await reservationService.checkAvailability(
            line.product_id, line.variant_id, newStart, newEnd, newQty
        );

        if (!availability.isAvailable) {
            return res.status(400).json({
                error: 'Not enough quantity available for the requested dates',
                availability
            });
        }

        const result = await db.query(quotationQueries.updateQuotationLine, [
            lineId, id, newQty, newStart, newEnd, newUnitPrice
        ]);

        res.json({
            message: 'Line updated successfully',
            line: result.rows[0]
        });
    } catch (error) {
        next(error);
    }
};

/**
 * DELETE /api/quotations/:id/lines/:lineId
 * Remove item from quotation
 */
const deleteLine = async (req, res, next) => {
    try {
        const { id, lineId } = req.params;

        // Verify quotation
        const quotationResult = await db.query(quotationQueries.getQuotationByIdForCustomer, [id, req.user.id]);
        if (quotationResult.rows.length === 0) {
            return res.status(404).json({ error: 'Quotation not found' });
        }

        if (quotationResult.rows[0].status !== 'draft') {
            return res.status(400).json({ error: 'Cannot modify a non-draft quotation' });
        }

        const result = await db.query(quotationQueries.deleteQuotationLine, [lineId, id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Line not found' });
        }

        res.json({ message: 'Line removed from quotation' });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/quotations/:id/confirm
 * Confirm quotation and create rental order
 */
const confirmQuotation = async (req, res, next) => {
    const client = await db.getClient();

    try {
        const { id } = req.params;
        const { billingAddressId, shippingAddressId } = req.body;

        await client.query('BEGIN');

        // Verify quotation
        const quotationResult = await client.query(quotationQueries.getQuotationByIdForCustomer, [id, req.user.id]);
        if (quotationResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'Quotation not found' });
        }

        if (quotationResult.rows[0].status !== 'draft') {
            await client.query('ROLLBACK');
            return res.status(400).json({ error: 'Quotation is not in draft status' });
        }

        // Get quotation lines
        const linesResult = await client.query(quotationQueries.getQuotationLines, [id]);
        if (linesResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(400).json({ error: 'Quotation has no items' });
        }

        // Check availability for all lines
        for (const line of linesResult.rows) {
            const availability = await reservationService.checkAvailability(
                line.product_id, line.variant_id, line.rental_start, line.rental_end, line.quantity
            );

            if (!availability.isAvailable) {
                await client.query('ROLLBACK');
                return res.status(400).json({
                    error: `Product ${line.product_name} not available for the requested dates and quantity`,
                    productId: line.product_id,
                    availability
                });
            }
        }

        // Create rental order
        const orderResult = await client.query(orderQueries.createRentalOrder, [
            id, req.user.id, billingAddressId || null, shippingAddressId || null
        ]);
        const order = orderResult.rows[0];

        // Create order lines and reservations
        for (const line of linesResult.rows) {
            // Create order line
            await client.query(orderQueries.createRentalOrderLine, [
                order.id, line.product_id, line.variant_id, line.quantity,
                line.rental_start, line.rental_end, line.unit_price
            ]);

            // Create reservation
            await client.query(orderQueries.createReservation, [
                order.id, line.product_id, line.variant_id, line.quantity,
                line.rental_start, line.rental_end
            ]);
        }

        // Update quotation status
        await client.query(quotationQueries.updateQuotationStatus, [id, 'confirmed']);

        await client.query('COMMIT');

        res.json({
            message: 'Quotation confirmed and order created',
            order: {
                id: order.id,
                status: order.status,
                createdAt: order.created_at
            }
        });
    } catch (error) {
        await client.query('ROLLBACK');
        next(error);
    } finally {
        client.release();
    }
};

module.exports = {
    listQuotations,
    createQuotation,
    getQuotation,
    addLine,
    updateLine,
    deleteLine,
    confirmQuotation
};
