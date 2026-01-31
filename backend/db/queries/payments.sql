-- =============================================================
-- PAYMENT QUERIES
-- =============================================================

-- name: createPayment
INSERT INTO payments (invoice_id, amount, payment_type, gateway_transaction_id, stripe_payment_intent_id, status)
VALUES ($1, $2, $3, $4, $5, 'pending')
RETURNING id, invoice_id, amount, payment_type, gateway_transaction_id, stripe_payment_intent_id, status, created_at;

-- name: getPaymentById
SELECT p.id, p.invoice_id, p.amount, p.payment_type, p.gateway_transaction_id,
       p.stripe_payment_intent_id, p.status, p.paid_at, p.created_at,
       i.invoice_number, i.customer_id
FROM payments p
JOIN invoices i ON i.id = p.invoice_id
WHERE p.id = $1;

-- name: getPaymentByStripeIntentId
SELECT p.id, p.invoice_id, p.amount, p.payment_type, p.gateway_transaction_id,
       p.stripe_payment_intent_id, p.status, p.paid_at, p.created_at,
       i.invoice_number, i.customer_id
FROM payments p
JOIN invoices i ON i.id = p.invoice_id
WHERE p.stripe_payment_intent_id = $1;

-- name: updatePaymentStatus
UPDATE payments
SET status = $2, paid_at = CASE WHEN $2 = 'completed' THEN NOW() ELSE paid_at END
WHERE id = $1
RETURNING id, status, paid_at;

-- name: updatePaymentStatusByStripeIntent
UPDATE payments
SET status = $2, 
    gateway_transaction_id = COALESCE($3, gateway_transaction_id),
    paid_at = CASE WHEN $2 = 'completed' THEN NOW() ELSE paid_at END
WHERE stripe_payment_intent_id = $1
RETURNING id, invoice_id, status, paid_at;

-- name: listPaymentsByInvoice
SELECT id, invoice_id, amount, payment_type, gateway_transaction_id, status, paid_at, created_at
FROM payments
WHERE invoice_id = $1
ORDER BY created_at DESC;

-- name: listCustomerPayments
SELECT p.id, p.invoice_id, p.amount, p.payment_type, p.status, p.paid_at, p.created_at,
       i.invoice_number
FROM payments p
JOIN invoices i ON i.id = p.invoice_id
WHERE i.customer_id = $1
ORDER BY p.created_at DESC
LIMIT $2 OFFSET $3;

-- name: countCustomerPayments
SELECT COUNT(*) as total
FROM payments p
JOIN invoices i ON i.id = p.invoice_id
WHERE i.customer_id = $1;

-- name: getTotalPaidForInvoice
SELECT COALESCE(SUM(amount), 0) as total_paid
FROM payments
WHERE invoice_id = $1 AND status = 'completed';
