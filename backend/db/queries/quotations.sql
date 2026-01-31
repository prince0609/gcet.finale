-- =============================================================
-- QUOTATION QUERIES
-- =============================================================

-- name: createQuotation
INSERT INTO quotations (customer_id, status)
VALUES ($1, 'draft')
RETURNING id, customer_id, status, created_at, updated_at;

-- name: getQuotationById
SELECT q.id, q.customer_id, q.status, q.created_at, q.updated_at,
       u.name as customer_name, u.email as customer_email
FROM quotations q
JOIN users u ON u.id = q.customer_id
WHERE q.id = $1;

-- name: getQuotationByIdForCustomer
SELECT id, customer_id, status, created_at, updated_at
FROM quotations
WHERE id = $1 AND customer_id = $2;

-- name: listCustomerQuotations
SELECT q.id, q.customer_id, q.status, q.created_at, q.updated_at
FROM quotations q
WHERE q.customer_id = $1
ORDER BY q.created_at DESC
LIMIT $2 OFFSET $3;

-- name: countCustomerQuotations
SELECT COUNT(*) as total FROM quotations WHERE customer_id = $1;

-- name: updateQuotationStatus
UPDATE quotations
SET status = $2, updated_at = NOW()
WHERE id = $1
RETURNING id, status, updated_at;

-- name: addQuotationLine
INSERT INTO quotation_lines (quotation_id, product_id, variant_id, quantity, rental_start, rental_end, unit_price)
VALUES ($1, $2, $3, $4, $5, $6, $7)
RETURNING id, quotation_id, product_id, variant_id, quantity, rental_start, rental_end, unit_price;

-- name: getQuotationLines
SELECT ql.id, ql.quotation_id, ql.product_id, ql.variant_id, ql.quantity, 
       ql.rental_start, ql.rental_end, ql.unit_price,
       p.name as product_name, p.sku as product_sku,
       pv.sku as variant_sku
FROM quotation_lines ql
JOIN products p ON p.id = ql.product_id
LEFT JOIN product_variants pv ON pv.id = ql.variant_id
WHERE ql.quotation_id = $1
ORDER BY ql.id;

-- name: getQuotationLineById
SELECT ql.id, ql.quotation_id, ql.product_id, ql.variant_id, ql.quantity, 
       ql.rental_start, ql.rental_end, ql.unit_price
FROM quotation_lines ql
WHERE ql.id = $1 AND ql.quotation_id = $2;

-- name: updateQuotationLine
UPDATE quotation_lines
SET quantity = COALESCE($3, quantity),
    rental_start = COALESCE($4, rental_start),
    rental_end = COALESCE($5, rental_end),
    unit_price = COALESCE($6, unit_price)
WHERE id = $1 AND quotation_id = $2
RETURNING id, quantity, rental_start, rental_end, unit_price;

-- name: deleteQuotationLine
DELETE FROM quotation_lines
WHERE id = $1 AND quotation_id = $2
RETURNING id;

-- name: getDraftQuotationForCustomer
SELECT id, customer_id, status, created_at, updated_at
FROM quotations
WHERE customer_id = $1 AND status = 'draft'
ORDER BY created_at DESC
LIMIT 1;

-- name: getQuotationTotal
SELECT COALESCE(SUM(quantity * unit_price), 0) as total
FROM quotation_lines
WHERE quotation_id = $1;
