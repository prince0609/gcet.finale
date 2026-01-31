-- =============================================================
-- PRODUCT QUERIES
-- =============================================================

-- name: createProduct
INSERT INTO products (vendor_id, name, sku, is_rentable, cost_price, sales_price, qty_on_hand, is_published, description, image_url)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
RETURNING id, vendor_id, name, sku, is_rentable, cost_price, sales_price, qty_on_hand, is_published, description, image_url, created_at;

-- name: getProductById
SELECT p.id, p.vendor_id, p.name, p.sku, p.is_rentable, p.cost_price, p.sales_price, 
       p.qty_on_hand, p.is_published, p.description, p.image_url, p.created_at, p.updated_at,
       u.name as vendor_name
FROM products p
JOIN users u ON u.id = p.vendor_id
WHERE p.id = $1;

-- name: getProductByIdForVendor
SELECT p.id, p.vendor_id, p.name, p.sku, p.is_rentable, p.cost_price, p.sales_price, 
       p.qty_on_hand, p.is_published, p.description, p.image_url, p.created_at, p.updated_at
FROM products p
WHERE p.id = $1 AND p.vendor_id = $2;

-- name: updateProduct
UPDATE products
SET name = COALESCE($3, name),
    sku = COALESCE($4, sku),
    is_rentable = COALESCE($5, is_rentable),
    cost_price = COALESCE($6, cost_price),
    sales_price = COALESCE($7, sales_price),
    qty_on_hand = COALESCE($8, qty_on_hand),
    is_published = COALESCE($9, is_published),
    description = COALESCE($10, description),
    image_url = COALESCE($11, image_url),
    updated_at = NOW()
WHERE id = $1 AND vendor_id = $2
RETURNING id, name, sku, is_rentable, cost_price, sales_price, qty_on_hand, is_published, description, image_url, updated_at;

-- name: deleteProduct
DELETE FROM products
WHERE id = $1 AND vendor_id = $2
RETURNING id;

-- name: listVendorProducts
SELECT p.id, p.name, p.sku, p.is_rentable, p.cost_price, p.sales_price, 
       p.qty_on_hand, p.is_published, p.description, p.image_url, p.created_at
FROM products p
WHERE p.vendor_id = $1
ORDER BY p.created_at DESC
LIMIT $2 OFFSET $3;

-- name: countVendorProducts
SELECT COUNT(*) as total FROM products WHERE vendor_id = $1;

-- name: publishProduct
UPDATE products
SET is_published = $3, updated_at = NOW()
WHERE id = $1 AND vendor_id = $2
RETURNING id, name, is_published;

-- name: getProductPricing
SELECT rp.id, rp.product_id, rp.period_type_id, rp.price, rp.is_active,
       rpt.label as period_label, rpt.unit as period_unit
FROM rental_pricing rp
JOIN rental_period_types rpt ON rpt.id = rp.period_type_id
WHERE rp.product_id = $1
ORDER BY rpt.id;

-- name: upsertProductPricing
INSERT INTO rental_pricing (product_id, period_type_id, price, is_active)
VALUES ($1, $2, $3, $4)
ON CONFLICT (product_id, period_type_id)
DO UPDATE SET price = $3, is_active = $4
RETURNING id, product_id, period_type_id, price, is_active;

-- name: deleteProductPricing
DELETE FROM rental_pricing
WHERE id = $1 AND product_id = $2
RETURNING id;

-- name: createVariant
INSERT INTO product_variants (product_id, sku, price_override, qty_on_hand, is_active)
VALUES ($1, $2, $3, $4, $5)
RETURNING id, product_id, sku, price_override, qty_on_hand, is_active, created_at;

-- name: getProductVariants
SELECT pv.id, pv.product_id, pv.sku, pv.price_override, pv.qty_on_hand, pv.is_active, pv.created_at
FROM product_variants pv
WHERE pv.product_id = $1
ORDER BY pv.created_at;

-- name: getVariantById
SELECT pv.id, pv.product_id, pv.sku, pv.price_override, pv.qty_on_hand, pv.is_active, pv.created_at
FROM product_variants pv
WHERE pv.id = $1 AND pv.product_id = $2;

-- name: updateVariant
UPDATE product_variants
SET sku = COALESCE($3, sku),
    price_override = COALESCE($4, price_override),
    qty_on_hand = COALESCE($5, qty_on_hand),
    is_active = COALESCE($6, is_active)
WHERE id = $1 AND product_id = $2
RETURNING id, sku, price_override, qty_on_hand, is_active;

-- name: deleteVariant
DELETE FROM product_variants
WHERE id = $1 AND product_id = $2
RETURNING id;

-- name: addVariantAttributeValue
INSERT INTO variant_attribute_values (variant_id, attribute_value_id)
VALUES ($1, $2)
ON CONFLICT (variant_id, attribute_value_id) DO NOTHING
RETURNING id, variant_id, attribute_value_id;

-- name: getVariantAttributeValues
SELECT vav.id, vav.variant_id, vav.attribute_value_id,
       pav.value, pa.name as attribute_name
FROM variant_attribute_values vav
JOIN product_attribute_values pav ON pav.id = vav.attribute_value_id
JOIN product_attributes pa ON pa.id = pav.attribute_id
WHERE vav.variant_id = $1;

-- name: mapAttributeToProduct
INSERT INTO product_attribute_mapping (product_id, attribute_id)
VALUES ($1, $2)
ON CONFLICT (product_id, attribute_id) DO NOTHING
RETURNING id, product_id, attribute_id;

-- name: getProductAttributes
SELECT pam.id, pam.product_id, pam.attribute_id, pa.name as attribute_name
FROM product_attribute_mapping pam
JOIN product_attributes pa ON pa.id = pam.attribute_id
WHERE pam.product_id = $1;

-- name: removeProductAttribute
DELETE FROM product_attribute_mapping
WHERE product_id = $1 AND attribute_id = $2
RETURNING id;
