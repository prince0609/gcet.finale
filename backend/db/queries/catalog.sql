-- =============================================================
-- CATALOG QUERIES (Public product browsing)
-- =============================================================

-- name: listPublishedProducts
SELECT p.id, p.name, p.sku, p.sales_price, p.qty_on_hand, p.description,
       p.created_at, u.name as vendor_name
FROM products p
JOIN users u ON u.id = p.vendor_id
WHERE p.is_published = TRUE AND p.is_rentable = TRUE
ORDER BY p.created_at DESC
LIMIT $1 OFFSET $2;

-- name: countPublishedProducts
SELECT COUNT(*) as total 
FROM products 
WHERE is_published = TRUE AND is_rentable = TRUE;

-- name: searchProducts
SELECT p.id, p.name, p.sku, p.sales_price, p.qty_on_hand, p.description,
       p.created_at, u.name as vendor_name
FROM products p
JOIN users u ON u.id = p.vendor_id
WHERE p.is_published = TRUE AND p.is_rentable = TRUE
  AND (p.name ILIKE '%' || $1 || '%' OR p.description ILIKE '%' || $1 || '%')
ORDER BY p.created_at DESC
LIMIT $2 OFFSET $3;

-- name: countSearchProducts
SELECT COUNT(*) as total 
FROM products 
WHERE is_published = TRUE AND is_rentable = TRUE
  AND (name ILIKE '%' || $1 || '%' OR description ILIKE '%' || $1 || '%');

-- name: getPublishedProductById
SELECT p.id, p.name, p.sku, p.sales_price, p.qty_on_hand, p.description,
       p.created_at, p.vendor_id, u.name as vendor_name
FROM products p
JOIN users u ON u.id = p.vendor_id
WHERE p.id = $1 AND p.is_published = TRUE AND p.is_rentable = TRUE;

-- name: getProductPricingPublic
SELECT rp.id, rp.period_type_id, rp.price,
       rpt.label as period_label, rpt.unit as period_unit
FROM rental_pricing rp
JOIN rental_period_types rpt ON rpt.id = rp.period_type_id
WHERE rp.product_id = $1 AND rp.is_active = TRUE AND rpt.is_active = TRUE
ORDER BY rpt.id;

-- name: getProductVariantsPublic
SELECT pv.id, pv.sku, pv.price_override, pv.qty_on_hand
FROM product_variants pv
WHERE pv.product_id = $1 AND pv.is_active = TRUE
ORDER BY pv.created_at;

-- name: checkProductAvailability
SELECT 
    CASE 
        WHEN $3 IS NOT NULL THEN (SELECT qty_on_hand FROM product_variants WHERE id = $3)
        ELSE (SELECT qty_on_hand FROM products WHERE id = $1)
    END as total_qty,
    COALESCE(SUM(r.quantity), 0) as reserved_qty
FROM reservations r
WHERE r.product_id = $1
  AND (r.variant_id = $3 OR ($3 IS NULL AND r.variant_id IS NULL))
  AND r.status = 'active'
  AND r.rental_start < $5
  AND r.rental_end > $4;
