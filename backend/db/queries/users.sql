-- =============================================================
-- USER QUERIES
-- =============================================================

-- name: getUserProfile
SELECT u.id, u.name, u.email, u.role, u.is_active, u.created_at, u.updated_at,
       c.id as company_id, c.name as company_name, c.gstin
FROM users u
LEFT JOIN companies c ON c.user_id = u.id
WHERE u.id = $1;

-- name: updateUserProfile
UPDATE users
SET name = COALESCE($2, name),
    updated_at = NOW()
WHERE id = $1
RETURNING id, name, email, role, is_active, updated_at;

-- name: createCompany
INSERT INTO companies (user_id, name, gstin)
VALUES ($1, $2, $3)
RETURNING id, name, gstin, created_at;

-- name: updateCompany
UPDATE companies
SET name = COALESCE($2, name),
    gstin = COALESCE($3, gstin)
WHERE user_id = $1
RETURNING id, name, gstin;

-- name: getCompanyByUserId
SELECT id, user_id, name, gstin, created_at
FROM companies
WHERE user_id = $1;

-- name: getUserAddresses
SELECT id, label, address_type, line1, line2, city, state, pincode, country, is_default, created_at
FROM user_addresses
WHERE user_id = $1
ORDER BY is_default DESC, created_at DESC;

-- name: getAddressById
SELECT id, user_id, label, address_type, line1, line2, city, state, pincode, country, is_default, created_at
FROM user_addresses
WHERE id = $1 AND user_id = $2;

-- name: createAddress
INSERT INTO user_addresses (user_id, label, address_type, line1, line2, city, state, pincode, country, is_default)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
RETURNING id, label, address_type, line1, line2, city, state, pincode, country, is_default, created_at;

-- name: updateAddress
UPDATE user_addresses
SET label = COALESCE($3, label),
    address_type = COALESCE($4, address_type),
    line1 = COALESCE($5, line1),
    line2 = COALESCE($6, line2),
    city = COALESCE($7, city),
    state = COALESCE($8, state),
    pincode = COALESCE($9, pincode),
    country = COALESCE($10, country),
    is_default = COALESCE($11, is_default)
WHERE id = $1 AND user_id = $2
RETURNING id, label, address_type, line1, line2, city, state, pincode, country, is_default;

-- name: deleteAddress
DELETE FROM user_addresses
WHERE id = $1 AND user_id = $2
RETURNING id;

-- name: clearDefaultAddresses
UPDATE user_addresses
SET is_default = FALSE
WHERE user_id = $1 AND address_type = $2;

-- name: listAllUsers
SELECT id, name, email, role, is_active, created_at, updated_at
FROM users
ORDER BY created_at DESC
LIMIT $1 OFFSET $2;

-- name: countAllUsers
SELECT COUNT(*) as total FROM users;

-- name: updateUserStatus
UPDATE users
SET is_active = $2, updated_at = NOW()
WHERE id = $1
RETURNING id, name, email, role, is_active;
