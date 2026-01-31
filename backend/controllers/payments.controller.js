const Stripe = require('stripe');
const db = require('../config/db');
const { loadQueries } = require('../utils/queryLoader');
const { paginate, paginationResponse } = require('../utils/helpers');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const paymentQueries = loadQueries('payments.sql');
const invoiceQueries = loadQueries('invoices.sql');
const notificationQueries = loadQueries('notifications.sql');

/**
 * POST /api/payments
 * Create payment intent for an invoice
 */
const createPayment = async (req, res, next) => {
    try {
        const { invoiceId, amount, paymentType } = req.body;

        if (!invoiceId || !amount) {
            return res.status(400).json({ error: 'invoiceId and amount are required' });
        }

        const type = paymentType || 'full';
        if (!['full', 'partial', 'security_deposit'].includes(type)) {
            return res.status(400).json({ error: 'Invalid payment type' });
        }

        // Get invoice
        const invoiceResult = await db.query(invoiceQueries.getInvoiceById, [invoiceId]);
        if (invoiceResult.rows.length === 0) {
            return res.status(404).json({ error: 'Invoice not found' });
        }

        const invoice = invoiceResult.rows[0];

        // Verify customer owns the invoice
        if (req.user.role === 'customer' && invoice.customer_id !== req.user.id) {
            return res.status(403).json({ error: 'Access denied' });
        }

        // Validate amount
        if (amount > parseFloat(invoice.amount_due)) {
            return res.status(400).json({ error: 'Amount exceeds amount due' });
        }

        // Create Stripe Payment Intent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // Convert to paise/cents
            currency: 'inr',
            metadata: {
                invoiceId: invoiceId.toString(),
                invoiceNumber: invoice.invoice_number || '',
                customerId: invoice.customer_id.toString(),
                paymentType: type
            }
        });

        // Create payment record
        const paymentResult = await db.query(paymentQueries.createPayment, [
            invoiceId,
            amount,
            type,
            null, // gateway_transaction_id - will be set on completion
            paymentIntent.id
        ]);

        res.json({
            message: 'Payment intent created',
            payment: paymentResult.rows[0],
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id
        });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/payments
 * List payments
 */
const listPayments = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const { limit: queryLimit, offset } = paginate(page, limit);

        let paymentsResult, countResult;

        if (req.user.role === 'customer') {
            [paymentsResult, countResult] = await Promise.all([
                db.query(paymentQueries.listCustomerPayments, [req.user.id, queryLimit, offset]),
                db.query(paymentQueries.countCustomerPayments, [req.user.id])
            ]);
        } else {
            // For admin/vendor, list by invoice if provided
            const { invoiceId } = req.query;
            if (invoiceId) {
                paymentsResult = await db.query(paymentQueries.listPaymentsByInvoice, [invoiceId]);
                return res.json({ payments: paymentsResult.rows });
            }

            // Otherwise return customer payments (admin can filter)
            [paymentsResult, countResult] = await Promise.all([
                db.query(paymentQueries.listCustomerPayments, [req.query.customerId || req.user.id, queryLimit, offset]),
                db.query(paymentQueries.countCustomerPayments, [req.query.customerId || req.user.id])
            ]);
        }

        res.json(paginationResponse(
            paymentsResult.rows,
            parseInt(countResult.rows[0].total),
            page,
            limit
        ));
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/payments/:id
 * Get payment details
 */
const getPayment = async (req, res, next) => {
    try {
        const { id } = req.params;

        const paymentResult = await db.query(paymentQueries.getPaymentById, [id]);
        if (paymentResult.rows.length === 0) {
            return res.status(404).json({ error: 'Payment not found' });
        }

        const payment = paymentResult.rows[0];

        // Verify access
        if (req.user.role === 'customer' && payment.customer_id !== req.user.id) {
            return res.status(403).json({ error: 'Access denied' });
        }

        res.json({ payment });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/payments/webhook
 * Stripe webhook handler
 */
const stripeWebhook = async (req, res, next) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
        case 'payment_intent.succeeded':
            await handlePaymentSuccess(event.data.object);
            break;
        case 'payment_intent.payment_failed':
            await handlePaymentFailure(event.data.object);
            break;
        default:
            console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
};

/**
 * Handle successful payment
 */
const handlePaymentSuccess = async (paymentIntent) => {
    const client = await db.getClient();

    try {
        await client.query('BEGIN');

        // Update payment status
        const paymentResult = await client.query(paymentQueries.updatePaymentStatusByStripeIntent, [
            paymentIntent.id,
            'completed',
            paymentIntent.latest_charge
        ]);

        if (paymentResult.rows.length === 0) {
            console.error('Payment not found for intent:', paymentIntent.id);
            await client.query('ROLLBACK');
            return;
        }

        const payment = paymentResult.rows[0];

        // Update invoice amount_due
        await client.query(invoiceQueries.updateInvoiceAmountDue, [
            payment.invoice_id,
            payment.amount
        ]);

        // Get invoice details for notification
        const invoiceResult = await client.query(invoiceQueries.getInvoiceById, [payment.invoice_id]);
        if (invoiceResult.rows.length > 0) {
            const invoice = invoiceResult.rows[0];

            // Create notification
            await client.query(notificationQueries.createNotification, [
                invoice.customer_id,
                null,
                'payment_received',
                `Payment of ₹${payment.amount} received for invoice ${invoice.invoice_number || payment.invoice_id}`,
                null
            ]);
        }

        await client.query('COMMIT');
        console.log('Payment processed successfully:', paymentIntent.id);
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error processing payment:', error);
    } finally {
        client.release();
    }
};

/**
 * Handle failed payment
 */
const handlePaymentFailure = async (paymentIntent) => {
    try {
        await db.query(paymentQueries.updatePaymentStatusByStripeIntent, [
            paymentIntent.id,
            'failed',
            null
        ]);
        console.log('Payment marked as failed:', paymentIntent.id);
    } catch (error) {
        console.error('Error marking payment as failed:', error);
    }
};

module.exports = {
    createPayment,
    listPayments,
    getPayment,
    stripeWebhook
};
