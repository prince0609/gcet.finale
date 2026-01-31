-- =============================================================
-- AUTH QUERIES
-- =============================================================

-- name: createUser
INSERT INTO users (name, email, password_hash, role)
VALUES ($1, $2, $3, $4)
RETURNING id, name, email, role, is_active, created_at;

-- name: findUserByEmail
SELECT id, name, email, password_hash, role, is_active, created_at, updated_at
FROM users
WHERE email = $1;

-- name: findUserById
SELECT id, name, email, role, is_active, created_at, updated_at
FROM users
WHERE id = $1;

-- name: createPasswordResetToken
INSERT INTO password_reset_tokens (user_id, token, expires_at)
VALUES ($1, $2, $3)
RETURNING id, token, expires_at;

-- name: findValidResetToken
SELECT prt.id, prt.user_id, prt.token, prt.expires_at, u.email
FROM password_reset_tokens prt
JOIN users u ON u.id = prt.user_id
WHERE prt.token = $1
  AND prt.used = FALSE
  AND prt.expires_at > NOW();

-- name: markResetTokenUsed
UPDATE password_reset_tokens
SET used = TRUE
WHERE id = $1;

-- name: updatePassword
UPDATE users
SET password_hash = $1, updated_at = NOW()
WHERE id = $2;

-- name: invalidateOldResetTokens
UPDATE password_reset_tokens
SET used = TRUE
WHERE user_id = $1 AND used = FALSE;
