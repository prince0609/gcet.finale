-- =============================================================
-- ADMIN QUERIES
-- =============================================================

-- name: listRentalPeriodTypes
SELECT id, label, unit, is_active
FROM rental_period_types
ORDER BY id;

-- name: createRentalPeriodType
INSERT INTO rental_period_types (label, unit, is_active)
VALUES ($1, $2, $3)
RETURNING id, label, unit, is_active;

-- name: updateRentalPeriodType
UPDATE rental_period_types
SET label = COALESCE($2, label),
    unit = COALESCE($3, unit),
    is_active = COALESCE($4, is_active)
WHERE id = $1
RETURNING id, label, unit, is_active;

-- name: deleteRentalPeriodType
DELETE FROM rental_period_types WHERE id = $1 RETURNING id;

-- name: listTaxConfigurations
SELECT id, name, tax_type, rate, is_active, created_at
FROM tax_configurations
ORDER BY created_at DESC;

-- name: createTaxConfiguration
INSERT INTO tax_configurations (name, tax_type, rate, is_active)
VALUES ($1, $2, $3, $4)
RETURNING id, name, tax_type, rate, is_active, created_at;

-- name: updateTaxConfiguration
UPDATE tax_configurations
SET name = COALESCE($2, name),
    tax_type = COALESCE($3, tax_type),
    rate = COALESCE($4, rate),
    is_active = COALESCE($5, is_active)
WHERE id = $1
RETURNING id, name, tax_type, rate, is_active;

-- name: deleteTaxConfiguration
DELETE FROM tax_configurations WHERE id = $1 RETURNING id;

-- name: listProductAttributes
SELECT id, name, is_active, created_at
FROM product_attributes
ORDER BY name;

-- name: createProductAttribute
INSERT INTO product_attributes (name, is_active)
VALUES ($1, $2)
RETURNING id, name, is_active, created_at;

-- name: updateProductAttribute
UPDATE product_attributes
SET name = COALESCE($2, name),
    is_active = COALESCE($3, is_active)
WHERE id = $1
RETURNING id, name, is_active;

-- name: deleteProductAttribute
DELETE FROM product_attributes WHERE id = $1 RETURNING id;

-- name: listAttributeValues
SELECT pav.id, pav.attribute_id, pav.value, pav.created_at,
       pa.name as attribute_name
FROM product_attribute_values pav
JOIN product_attributes pa ON pa.id = pav.attribute_id
ORDER BY pa.name, pav.value;

-- name: listAttributeValuesByAttribute
SELECT id, attribute_id, value, created_at
FROM product_attribute_values
WHERE attribute_id = $1
ORDER BY value;

-- name: createAttributeValue
INSERT INTO product_attribute_values (attribute_id, value)
VALUES ($1, $2)
RETURNING id, attribute_id, value, created_at;

-- name: updateAttributeValue
UPDATE product_attribute_values
SET value = $2
WHERE id = $1
RETURNING id, attribute_id, value;

-- name: deleteAttributeValue
DELETE FROM product_attribute_values WHERE id = $1 RETURNING id;

-- name: createLateFeePolicy
INSERT INTO late_fee_policies (product_id, grace_period_days, fee_per_day, max_fee_multiplier)
VALUES ($1, $2, $3, $4)
RETURNING id, product_id, grace_period_days, fee_per_day, max_fee_multiplier;

-- name: updateLateFeePolicy
UPDATE late_fee_policies
SET grace_period_days = COALESCE($2, grace_period_days),
    fee_per_day = COALESCE($3, fee_per_day),
    max_fee_multiplier = COALESCE($4, max_fee_multiplier)
WHERE id = $1
RETURNING id, product_id, grace_period_days, fee_per_day, max_fee_multiplier;

-- name: listLateFeePolicies
SELECT id, product_id, grace_period_days, fee_per_day, max_fee_multiplier
FROM late_fee_policies
ORDER BY product_id NULLS FIRST;
