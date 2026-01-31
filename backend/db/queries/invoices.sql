-- =============================================================
-- INVOICE QUERIES
-- =============================================================

-- name: createInvoice
INSERT INTO invoices (rental_order_id, customer_id, billing_address_id, status, subtotal, total_tax, total_amount, amount_due)
VALUES ($1, $2, $3, 'draft', $4, $5, $6, $6)
RETURNING id, rental_order_id, customer_id, billing_address_id, status, invoice_number, subtotal, total_tax, total_amount, amount_due, created_at;

-- name: createInvoiceLine
INSERT INTO invoice_lines (invoice_id, rental_order_line_id, description, quantity, unit_price, line_total)
VALUES ($1, $2, $3, $4, $5, $6)
RETURNING id, invoice_id, rental_order_line_id, description, quantity, unit_price, line_total;

-- name: createInvoiceTax
INSERT INTO invoice_taxes (invoice_line_id, tax_config_id, tax_amount)
VALUES ($1, $2, $3)
RETURNING id, invoice_line_id, tax_config_id, tax_amount;

-- name: getInvoiceById
SELECT i.id, i.rental_order_id, i.customer_id, i.billing_address_id, i.status,
       i.invoice_number, i.subtotal, i.total_tax, i.total_amount, i.amount_due,
       i.created_at, i.updated_at,
       u.name as customer_name, u.email as customer_email
FROM invoices i
JOIN users u ON u.id = i.customer_id
WHERE i.id = $1;

-- name: getInvoiceByIdForCustomer
SELECT i.id, i.rental_order_id, i.customer_id, i.billing_address_id, i.status,
       i.invoice_number, i.subtotal, i.total_tax, i.total_amount, i.amount_due,
       i.created_at, i.updated_at
FROM invoices i
WHERE i.id = $1 AND i.customer_id = $2;

-- name: getInvoiceLines
SELECT il.id, il.invoice_id, il.rental_order_line_id, il.description, 
       il.quantity, il.unit_price, il.line_total
FROM invoice_lines il
WHERE il.invoice_id = $1
ORDER BY il.id;

-- name: getInvoiceLineTaxes
SELECT it.id, it.invoice_line_id, it.tax_config_id, it.tax_amount,
       tc.name as tax_name, tc.tax_type, tc.rate as tax_rate
FROM invoice_taxes it
JOIN tax_configurations tc ON tc.id = it.tax_config_id
WHERE it.invoice_line_id = $1;

-- name: listCustomerInvoices
SELECT i.id, i.rental_order_id, i.status, i.invoice_number, i.total_amount, 
       i.amount_due, i.created_at
FROM invoices i
WHERE i.customer_id = $1
ORDER BY i.created_at DESC
LIMIT $2 OFFSET $3;

-- name: countCustomerInvoices
SELECT COUNT(*) as total FROM invoices WHERE customer_id = $1;

-- name: listVendorInvoices
SELECT DISTINCT i.id, i.rental_order_id, i.customer_id, i.status, i.invoice_number, 
       i.total_amount, i.amount_due, i.created_at,
       u.name as customer_name
FROM invoices i
JOIN rental_orders ro ON ro.id = i.rental_order_id
JOIN rental_order_lines rol ON rol.rental_order_id = ro.id
JOIN products p ON p.id = rol.product_id
JOIN users u ON u.id = i.customer_id
WHERE p.vendor_id = $1
ORDER BY i.created_at DESC
LIMIT $2 OFFSET $3;

-- name: countVendorInvoices
SELECT COUNT(DISTINCT i.id) as total
FROM invoices i
JOIN rental_orders ro ON ro.id = i.rental_order_id
JOIN rental_order_lines rol ON rol.rental_order_id = ro.id
JOIN products p ON p.id = rol.product_id
WHERE p.vendor_id = $1;

-- name: listAllInvoices
SELECT i.id, i.rental_order_id, i.customer_id, i.status, i.invoice_number, 
       i.total_amount, i.amount_due, i.created_at,
       u.name as customer_name
FROM invoices i
JOIN users u ON u.id = i.customer_id
ORDER BY i.created_at DESC
LIMIT $1 OFFSET $2;

-- name: countAllInvoices
SELECT COUNT(*) as total FROM invoices;

-- name: postInvoice
UPDATE invoices
SET status = 'posted', invoice_number = $2, updated_at = NOW()
WHERE id = $1
RETURNING id, status, invoice_number;

-- name: getNextInvoiceSequence
SELECT COALESCE(MAX(CAST(SUBSTRING(invoice_number FROM 10) AS INTEGER)), 0) + 1 as next_seq
FROM invoices
WHERE invoice_number LIKE 'INV-' || EXTRACT(YEAR FROM NOW()) || '-%';

-- name: updateInvoiceAmountDue
UPDATE invoices
SET amount_due = amount_due - $2,
    status = CASE WHEN amount_due - $2 <= 0 THEN 'paid' ELSE 'partial' END,
    updated_at = NOW()
WHERE id = $1
RETURNING id, status, amount_due;

-- name: getInvoiceByOrderId
SELECT id, rental_order_id, customer_id, status, invoice_number, total_amount, amount_due
FROM invoices
WHERE rental_order_id = $1;

-- name: getActiveTaxConfigs
SELECT id, name, tax_type, rate
FROM tax_configurations
WHERE is_active = TRUE;
