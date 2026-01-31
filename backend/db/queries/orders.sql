-- =============================================================
-- ORDER QUERIES
-- =============================================================

-- name: createRentalOrder
INSERT INTO rental_orders (quotation_id, customer_id, billing_address_id, shipping_address_id, status)
VALUES ($1, $2, $3, $4, 'confirmed')
RETURNING id, quotation_id, customer_id, billing_address_id, shipping_address_id, status, created_at;

-- name: createRentalOrderLine
INSERT INTO rental_order_lines (rental_order_id, product_id, variant_id, quantity, rental_start, rental_end, unit_price)
VALUES ($1, $2, $3, $4, $5, $6, $7)
RETURNING id, rental_order_id, product_id, variant_id, quantity, rental_start, rental_end, unit_price;

-- name: getOrderById
SELECT ro.id, ro.quotation_id, ro.customer_id, ro.billing_address_id, ro.shipping_address_id,
       ro.status, ro.created_at, ro.updated_at,
       u.name as customer_name, u.email as customer_email
FROM rental_orders ro
JOIN users u ON u.id = ro.customer_id
WHERE ro.id = $1;

-- name: getOrderByIdForCustomer
SELECT ro.id, ro.quotation_id, ro.customer_id, ro.billing_address_id, ro.shipping_address_id,
       ro.status, ro.created_at, ro.updated_at
FROM rental_orders ro
WHERE ro.id = $1 AND ro.customer_id = $2;

-- name: getOrderLines
SELECT rol.id, rol.rental_order_id, rol.product_id, rol.variant_id, rol.quantity,
       rol.rental_start, rol.rental_end, rol.unit_price,
       p.name as product_name, p.sku as product_sku, p.vendor_id,
       pv.sku as variant_sku
FROM rental_order_lines rol
JOIN products p ON p.id = rol.product_id
LEFT JOIN product_variants pv ON pv.id = rol.variant_id
WHERE rol.rental_order_id = $1
ORDER BY rol.id;

-- name: listCustomerOrders
SELECT ro.id, ro.quotation_id, ro.status, ro.created_at, ro.updated_at
FROM rental_orders ro
WHERE ro.customer_id = $1
ORDER BY ro.created_at DESC
LIMIT $2 OFFSET $3;

-- name: countCustomerOrders
SELECT COUNT(*) as total FROM rental_orders WHERE customer_id = $1;

-- name: listVendorOrders
SELECT DISTINCT ro.id, ro.customer_id, ro.status, ro.created_at, ro.updated_at,
       u.name as customer_name
FROM rental_orders ro
JOIN rental_order_lines rol ON rol.rental_order_id = ro.id
JOIN products p ON p.id = rol.product_id
JOIN users u ON u.id = ro.customer_id
WHERE p.vendor_id = $1
ORDER BY ro.created_at DESC
LIMIT $2 OFFSET $3;

-- name: countVendorOrders
SELECT COUNT(DISTINCT ro.id) as total
FROM rental_orders ro
JOIN rental_order_lines rol ON rol.rental_order_id = ro.id
JOIN products p ON p.id = rol.product_id
WHERE p.vendor_id = $1;

-- name: listAllOrders
SELECT ro.id, ro.customer_id, ro.status, ro.created_at, ro.updated_at,
       u.name as customer_name
FROM rental_orders ro
JOIN users u ON u.id = ro.customer_id
ORDER BY ro.created_at DESC
LIMIT $1 OFFSET $2;

-- name: countAllOrders
SELECT COUNT(*) as total FROM rental_orders;

-- name: updateOrderStatus
UPDATE rental_orders
SET status = $2, updated_at = NOW()
WHERE id = $1
RETURNING id, status, updated_at;

-- name: createReservation
INSERT INTO reservations (rental_order_id, product_id, variant_id, quantity, rental_start, rental_end, status)
VALUES ($1, $2, $3, $4, $5, $6, 'active')
RETURNING id, rental_order_id, product_id, variant_id, quantity, rental_start, rental_end, status;

-- name: releaseReservations
UPDATE reservations
SET status = 'released'
WHERE rental_order_id = $1
RETURNING id;

-- name: checkAvailability
SELECT COALESCE(SUM(quantity), 0) as reserved_qty
FROM reservations
WHERE product_id = $1
  AND (variant_id = $2 OR ($2 IS NULL AND variant_id IS NULL))
  AND status = 'active'
  AND rental_start < $4
  AND rental_end > $3;

-- name: getProductQuantity
SELECT qty_on_hand FROM products WHERE id = $1;

-- name: getVariantQuantity
SELECT qty_on_hand FROM product_variants WHERE id = $1;

-- name: getOrderByQuotationId
SELECT id, quotation_id, customer_id, status FROM rental_orders WHERE quotation_id = $1;
