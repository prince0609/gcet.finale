const db = require('../config/db');
const { loadQueries } = require('../utils/queryLoader');
const { paginate, paginationResponse, generateInvoiceNumber } = require('../utils/helpers');

const invoiceQueries = loadQueries('invoices.sql');
const orderQueries = loadQueries('orders.sql');

/**
 * GET /api/invoices
 * List invoices (role-based)
 */
const listInvoices = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const { limit: queryLimit, offset } = paginate(page, limit);

        let invoicesResult, countResult;

        if (req.user.role === 'customer') {
            [invoicesResult, countResult] = await Promise.all([
                db.query(invoiceQueries.listCustomerInvoices, [req.user.id, queryLimit, offset]),
                db.query(invoiceQueries.countCustomerInvoices, [req.user.id])
            ]);
        } else if (req.user.role === 'vendor') {
            [invoicesResult, countResult] = await Promise.all([
                db.query(invoiceQueries.listVendorInvoices, [req.user.id, queryLimit, offset]),
                db.query(invoiceQueries.countVendorInvoices, [req.user.id])
            ]);
        } else {
            [invoicesResult, countResult] = await Promise.all([
                db.query(invoiceQueries.listAllInvoices, [queryLimit, offset]),
                db.query(invoiceQueries.countAllInvoices)
            ]);
        }

        res.json(paginationResponse(
            invoicesResult.rows,
            parseInt(countResult.rows[0].total),
            page,
            limit
        ));
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/invoices
 * Create invoice from order
 */
const createInvoice = async (req, res, next) => {
    const client = await db.getClient();

    try {
        const { rentalOrderId, billingAddressId } = req.body;

        if (!rentalOrderId) {
            return res.status(400).json({ error: 'rentalOrderId is required' });
        }

        await client.query('BEGIN');

        // Check if invoice already exists for this order
        const existingResult = await client.query(invoiceQueries.getInvoiceByOrderId, [rentalOrderId]);
        if (existingResult.rows.length > 0) {
            await client.query('ROLLBACK');
            return res.status(400).json({
                error: 'Invoice already exists for this order',
                invoice: existingResult.rows[0]
            });
        }

        // Get order details
        const orderResult = await client.query(orderQueries.getOrderById, [rentalOrderId]);
        if (orderResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'Order not found' });
        }

        const order = orderResult.rows[0];
        const linesResult = await client.query(orderQueries.getOrderLines, [rentalOrderId]);

        // Calculate totals
        let subtotal = 0;
        for (const line of linesResult.rows) {
            subtotal += parseFloat(line.unit_price) * line.quantity;
        }

        // Get active tax configs and calculate tax
        const taxConfigsResult = await client.query(invoiceQueries.getActiveTaxConfigs);
        let totalTax = 0;

        // For simplicity, apply first active tax config (IGST or CGST+SGST)
        const igstConfig = taxConfigsResult.rows.find(t => t.tax_type === 'IGST');

        if (igstConfig) {
            totalTax = subtotal * (parseFloat(igstConfig.rate) / 100);
        }

        const totalAmount = subtotal + totalTax;

        // Create invoice
        const invoiceResult = await client.query(invoiceQueries.createInvoice, [
            rentalOrderId,
            order.customer_id,
            billingAddressId || order.billing_address_id,
            subtotal,
            totalTax,
            totalAmount
        ]);

        const invoice = invoiceResult.rows[0];

        // Create invoice lines
        for (const line of linesResult.rows) {
            const lineTotal = parseFloat(line.unit_price) * line.quantity;
            const description = `${line.product_name}${line.variant_sku ? ` (${line.variant_sku})` : ''} - ${line.rental_start} to ${line.rental_end}`;

            const lineResult = await client.query(invoiceQueries.createInvoiceLine, [
                invoice.id,
                line.id,
                description,
                line.quantity,
                line.unit_price,
                lineTotal
            ]);

            // Create tax entry for this line
            if (igstConfig) {
                const lineTax = lineTotal * (parseFloat(igstConfig.rate) / 100);
                await client.query(invoiceQueries.createInvoiceTax, [
                    lineResult.rows[0].id,
                    igstConfig.id,
                    lineTax
                ]);
            }
        }

        await client.query('COMMIT');

        res.status(201).json({
            message: 'Invoice created successfully',
            invoice
        });
    } catch (error) {
        await client.query('ROLLBACK');
        next(error);
    } finally {
        client.release();
    }
};

/**
 * GET /api/invoices/:id
 * Get invoice details
 */
const getInvoice = async (req, res, next) => {
    try {
        const { id } = req.params;

        let invoiceResult;
        if (req.user.role === 'customer') {
            invoiceResult = await db.query(invoiceQueries.getInvoiceByIdForCustomer, [id, req.user.id]);
        } else {
            invoiceResult = await db.query(invoiceQueries.getInvoiceById, [id]);
        }

        if (invoiceResult.rows.length === 0) {
            return res.status(404).json({ error: 'Invoice not found' });
        }

        const invoice = invoiceResult.rows[0];
        const linesResult = await db.query(invoiceQueries.getInvoiceLines, [id]);

        // Get taxes for each line
        for (const line of linesResult.rows) {
            const taxesResult = await db.query(invoiceQueries.getInvoiceLineTaxes, [line.id]);
            line.taxes = taxesResult.rows;
        }

        res.json({
            invoice,
            lines: linesResult.rows
        });
    } catch (error) {
        next(error);
    }
};

/**
 * PUT /api/invoices/:id/post
 * Post invoice (generate invoice number)
 */
const postInvoice = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Get invoice
        const invoiceResult = await db.query(invoiceQueries.getInvoiceById, [id]);
        if (invoiceResult.rows.length === 0) {
            return res.status(404).json({ error: 'Invoice not found' });
        }

        const invoice = invoiceResult.rows[0];

        if (invoice.status !== 'draft') {
            return res.status(400).json({ error: 'Invoice is already posted' });
        }

        // Generate invoice number
        const seqResult = await db.query(invoiceQueries.getNextInvoiceSequence);
        const nextSeq = seqResult.rows[0].next_seq;
        const invoiceNumber = generateInvoiceNumber(nextSeq);

        // Post invoice
        const result = await db.query(invoiceQueries.postInvoice, [id, invoiceNumber]);

        res.json({
            message: 'Invoice posted successfully',
            invoice: result.rows[0]
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    listInvoices,
    createInvoice,
    getInvoice,
    postInvoice
};
