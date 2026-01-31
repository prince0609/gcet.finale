-- =============================================================
-- PICKUP QUERIES
-- =============================================================

-- name: createPickupDocument
INSERT INTO pickup_documents (rental_order_id, status, instructions, scheduled_date)
VALUES ($1, 'pending', $2, $3)
RETURNING id, rental_order_id, status, instructions, scheduled_date, created_at;

-- name: createPickupLine
INSERT INTO pickup_lines (pickup_document_id, rental_order_line_id, quantity_expected)
VALUES ($1, $2, $3)
RETURNING id, pickup_document_id, rental_order_line_id, quantity_expected;

-- name: getPickupById
SELECT pd.id, pd.rental_order_id, pd.status, pd.instructions, pd.scheduled_date, 
       pd.completed_at, pd.created_at,
       ro.customer_id, u.name as customer_name
FROM pickup_documents pd
JOIN rental_orders ro ON ro.id = pd.rental_order_id
JOIN users u ON u.id = ro.customer_id
WHERE pd.id = $1;

-- name: getPickupLines
SELECT pl.id, pl.pickup_document_id, pl.rental_order_line_id, pl.quantity_expected,
       pl.quantity_picked, pl.picked_at,
       rol.product_id, rol.variant_id, p.name as product_name, p.sku as product_sku
FROM pickup_lines pl
JOIN rental_order_lines rol ON rol.id = pl.rental_order_line_id
JOIN products p ON p.id = rol.product_id
WHERE pl.pickup_document_id = $1;

-- name: listPickupsForVendor
SELECT DISTINCT pd.id, pd.rental_order_id, pd.status, pd.scheduled_date, pd.created_at,
       u.name as customer_name
FROM pickup_documents pd
JOIN rental_orders ro ON ro.id = pd.rental_order_id
JOIN rental_order_lines rol ON rol.rental_order_id = ro.id
JOIN products p ON p.id = rol.product_id
JOIN users u ON u.id = ro.customer_id
WHERE p.vendor_id = $1
ORDER BY pd.scheduled_date ASC
LIMIT $2 OFFSET $3;

-- name: countPickupsForVendor
SELECT COUNT(DISTINCT pd.id) as total
FROM pickup_documents pd
JOIN rental_orders ro ON ro.id = pd.rental_order_id
JOIN rental_order_lines rol ON rol.rental_order_id = ro.id
JOIN products p ON p.id = rol.product_id
WHERE p.vendor_id = $1;

-- name: updatePickupStatus
UPDATE pickup_documents
SET status = $2
WHERE id = $1
RETURNING id, status;

-- name: completePickup
UPDATE pickup_documents
SET status = 'completed', completed_at = NOW()
WHERE id = $1
RETURNING id, status, completed_at;

-- name: updatePickupLine
UPDATE pickup_lines
SET quantity_picked = $2, picked_at = NOW()
WHERE id = $1
RETURNING id, quantity_picked, picked_at;

-- name: getPickupByOrderId
SELECT id, rental_order_id, status, scheduled_date, completed_at
FROM pickup_documents
WHERE rental_order_id = $1;
