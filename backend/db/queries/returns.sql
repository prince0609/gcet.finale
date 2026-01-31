-- =============================================================
-- RETURN QUERIES
-- =============================================================

-- name: createReturnDocument
INSERT INTO return_documents (rental_order_id, status, scheduled_date)
VALUES ($1, 'pending', $2)
RETURNING id, rental_order_id, status, scheduled_date, created_at;

-- name: createReturnLine
INSERT INTO return_lines (return_document_id, rental_order_line_id, quantity_expected)
VALUES ($1, $2, $3)
RETURNING id, return_document_id, rental_order_line_id, quantity_expected;

-- name: getReturnById
SELECT rd.id, rd.rental_order_id, rd.status, rd.scheduled_date, 
       rd.completed_at, rd.created_at,
       ro.customer_id, u.name as customer_name
FROM return_documents rd
JOIN rental_orders ro ON ro.id = rd.rental_order_id
JOIN users u ON u.id = ro.customer_id
WHERE rd.id = $1;

-- name: getReturnLines
SELECT rl.id, rl.return_document_id, rl.rental_order_line_id, rl.quantity_expected,
       rl.quantity_returned, rl.returned_at,
       rol.product_id, rol.variant_id, rol.rental_end, p.name as product_name, p.sku as product_sku
FROM return_lines rl
JOIN rental_order_lines rol ON rol.id = rl.rental_order_line_id
JOIN products p ON p.id = rol.product_id
WHERE rl.return_document_id = $1;

-- name: listReturnsForVendor
SELECT DISTINCT rd.id, rd.rental_order_id, rd.status, rd.scheduled_date, rd.created_at,
       u.name as customer_name
FROM return_documents rd
JOIN rental_orders ro ON ro.id = rd.rental_order_id
JOIN rental_order_lines rol ON rol.rental_order_id = ro.id
JOIN products p ON p.id = rol.product_id
JOIN users u ON u.id = ro.customer_id
WHERE p.vendor_id = $1
ORDER BY rd.scheduled_date ASC
LIMIT $2 OFFSET $3;

-- name: countReturnsForVendor
SELECT COUNT(DISTINCT rd.id) as total
FROM return_documents rd
JOIN rental_orders ro ON ro.id = rd.rental_order_id
JOIN rental_order_lines rol ON rol.rental_order_id = ro.id
JOIN products p ON p.id = rol.product_id
WHERE p.vendor_id = $1;

-- name: updateReturnStatus
UPDATE return_documents
SET status = $2
WHERE id = $1
RETURNING id, status;

-- name: completeReturn
UPDATE return_documents
SET status = 'received', completed_at = NOW()
WHERE id = $1
RETURNING id, status, completed_at;

-- name: updateReturnLine
UPDATE return_lines
SET quantity_returned = $2, returned_at = NOW()
WHERE id = $1
RETURNING id, quantity_returned, returned_at;

-- name: getReturnByOrderId
SELECT id, rental_order_id, status, scheduled_date, completed_at
FROM return_documents
WHERE rental_order_id = $1;

-- name: getLateFeePolicy
SELECT id, product_id, grace_period_days, fee_per_day, max_fee_multiplier
FROM late_fee_policies
WHERE product_id = $1 OR product_id IS NULL
ORDER BY product_id NULLS LAST
LIMIT 1;

-- name: createLateFee
INSERT INTO late_fees (return_line_id, rental_order_line_id, rental_end, actual_return_date, late_days, fee_amount)
VALUES ($1, $2, $3, $4, $5, $6)
RETURNING id, return_line_id, rental_order_line_id, rental_end, actual_return_date, late_days, fee_amount;

-- name: getLateFeesByReturnId
SELECT lf.id, lf.return_line_id, lf.rental_order_line_id, lf.rental_end, 
       lf.actual_return_date, lf.late_days, lf.fee_amount
FROM late_fees lf
JOIN return_lines rl ON rl.id = lf.return_line_id
WHERE rl.return_document_id = $1;
