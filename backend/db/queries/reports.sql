-- =============================================================
-- REPORT QUERIES
-- =============================================================

-- name: getVendorRevenue
SELECT * FROM v_vendor_revenue;

-- name: getVendorRevenueById
SELECT * FROM v_vendor_revenue WHERE vendor_id = $1;

-- name: getMostRentedProducts
SELECT * FROM v_most_rented_products LIMIT $1;

-- name: getMostRentedProductsByVendor
SELECT pr.id AS product_id, pr.name AS product_name,
       SUM(rol.quantity) AS total_qty_rented,
       COUNT(DISTINCT ro.id) AS total_orders
FROM products pr
JOIN rental_order_lines rol ON rol.product_id = pr.id
JOIN rental_orders ro ON ro.id = rol.rental_order_id
WHERE ro.status NOT IN ('cancelled') AND pr.vendor_id = $1
GROUP BY pr.id, pr.name
ORDER BY total_qty_rented DESC
LIMIT $2;

-- name: getOrderTrends
SELECT * FROM v_order_trends WHERE month >= $1 AND month <= $2;

-- name: getOrderTrendsByVendor
SELECT DATE_TRUNC('month', ro.created_at) AS month,
       COUNT(DISTINCT ro.id) AS order_count,
       COALESCE(SUM(inv.total_amount), 0) AS revenue
FROM rental_orders ro
JOIN rental_order_lines rol ON rol.rental_order_id = ro.id
JOIN products p ON p.id = rol.product_id
LEFT JOIN invoices inv ON inv.rental_order_id = ro.id
WHERE ro.status NOT IN ('cancelled') 
  AND p.vendor_id = $1
  AND ro.created_at >= $2 AND ro.created_at <= $3
GROUP BY month
ORDER BY month;

-- name: getAdminDashboardStats
SELECT
    (SELECT COUNT(*) FROM users WHERE is_active = TRUE) as total_users,
    (SELECT COUNT(*) FROM users WHERE role = 'vendor') as total_vendors,
    (SELECT COUNT(*) FROM users WHERE role = 'customer') as total_customers,
    (SELECT COUNT(*) FROM products WHERE is_published = TRUE) as published_products,
    (SELECT COUNT(*) FROM rental_orders WHERE status NOT IN ('cancelled')) as total_orders,
    (SELECT COUNT(*) FROM rental_orders WHERE status = 'active') as active_orders,
    (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE status = 'completed') as total_revenue,
    (SELECT COUNT(*) FROM invoices WHERE status = 'posted') as pending_invoices;

-- name: getVendorDashboardStats
SELECT
    (SELECT COUNT(*) FROM products WHERE vendor_id = $1) as total_products,
    (SELECT COUNT(*) FROM products WHERE vendor_id = $1 AND is_published = TRUE) as published_products,
    (SELECT COUNT(DISTINCT ro.id) FROM rental_orders ro 
     JOIN rental_order_lines rol ON rol.rental_order_id = ro.id
     JOIN products p ON p.id = rol.product_id 
     WHERE p.vendor_id = $1 AND ro.status NOT IN ('cancelled')) as total_orders,
    (SELECT COUNT(DISTINCT ro.id) FROM rental_orders ro 
     JOIN rental_order_lines rol ON rol.rental_order_id = ro.id
     JOIN products p ON p.id = rol.product_id 
     WHERE p.vendor_id = $1 AND ro.status = 'active') as active_orders,
    (SELECT COALESCE(SUM(pay.amount), 0) FROM payments pay
     JOIN invoices i ON i.id = pay.invoice_id
     JOIN rental_orders ro ON ro.id = i.rental_order_id
     JOIN rental_order_lines rol ON rol.rental_order_id = ro.id
     JOIN products p ON p.id = rol.product_id
     WHERE p.vendor_id = $1 AND pay.status = 'completed') as total_revenue,
    (SELECT COUNT(*) FROM pickup_documents pd
     JOIN rental_orders ro ON ro.id = pd.rental_order_id
     JOIN rental_order_lines rol ON rol.rental_order_id = ro.id
     JOIN products p ON p.id = rol.product_id
     WHERE p.vendor_id = $1 AND pd.status = 'pending') as pending_pickups,
    (SELECT COUNT(*) FROM return_documents rd
     JOIN rental_orders ro ON ro.id = rd.rental_order_id
     JOIN rental_order_lines rol ON rol.rental_order_id = ro.id
     JOIN products p ON p.id = rol.product_id
     WHERE p.vendor_id = $1 AND rd.status = 'pending') as pending_returns;

-- name: getCustomerDashboardStats
SELECT
    (SELECT COUNT(*) FROM rental_orders WHERE customer_id = $1 AND status NOT IN ('cancelled')) as total_orders,
    (SELECT COUNT(*) FROM rental_orders WHERE customer_id = $1 AND status = 'active') as active_orders,
    (SELECT COUNT(*) FROM invoices WHERE customer_id = $1 AND amount_due > 0) as pending_payments,
    (SELECT COALESCE(SUM(amount), 0) FROM payments p 
     JOIN invoices i ON i.id = p.invoice_id 
     WHERE i.customer_id = $1 AND p.status = 'completed') as total_spent;

-- name: getRevenueByDateRange
SELECT DATE(created_at) as date, 
       COUNT(*) as order_count,
       COALESCE(SUM(inv.total_amount), 0) as revenue
FROM rental_orders ro
LEFT JOIN invoices inv ON inv.rental_order_id = ro.id
WHERE ro.status NOT IN ('cancelled')
  AND ro.created_at >= $1 AND ro.created_at <= $2
GROUP BY DATE(created_at)
ORDER BY date;

-- name: getRevenueByDateRangeForVendor
SELECT DATE(ro.created_at) as date, 
       COUNT(DISTINCT ro.id) as order_count,
       COALESCE(SUM(inv.total_amount), 0) as revenue
FROM rental_orders ro
JOIN rental_order_lines rol ON rol.rental_order_id = ro.id
JOIN products p ON p.id = rol.product_id
LEFT JOIN invoices inv ON inv.rental_order_id = ro.id
WHERE ro.status NOT IN ('cancelled')
  AND p.vendor_id = $1
  AND ro.created_at >= $2 AND ro.created_at <= $3
GROUP BY DATE(ro.created_at)
ORDER BY date;
