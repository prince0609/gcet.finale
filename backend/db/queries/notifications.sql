-- =============================================================
-- NOTIFICATION QUERIES
-- =============================================================

-- name: createNotification
INSERT INTO notifications (user_id, rental_order_id, type, message, status, scheduled_at)
VALUES ($1, $2, $3, $4, 'pending', $5)
RETURNING id, user_id, rental_order_id, type, message, status, scheduled_at, created_at;

-- name: getUserNotifications
SELECT id, user_id, rental_order_id, type, message, status, scheduled_at, sent_at, created_at
FROM notifications
WHERE user_id = $1
ORDER BY created_at DESC
LIMIT $2 OFFSET $3;

-- name: countUserNotifications
SELECT COUNT(*) as total FROM notifications WHERE user_id = $1;

-- name: getUnreadNotifications
SELECT id, user_id, rental_order_id, type, message, status, scheduled_at, sent_at, created_at
FROM notifications
WHERE user_id = $1 AND status = 'pending'
ORDER BY created_at DESC;

-- name: markNotificationSent
UPDATE notifications
SET status = 'sent', sent_at = NOW()
WHERE id = $1
RETURNING id, status, sent_at;

-- name: markNotificationFailed
UPDATE notifications
SET status = 'failed'
WHERE id = $1
RETURNING id, status;

-- name: getPendingScheduledNotifications
SELECT n.id, n.user_id, n.rental_order_id, n.type, n.message, n.scheduled_at,
       u.email, u.name as user_name
FROM notifications n
JOIN users u ON u.id = n.user_id
WHERE n.status = 'pending' AND n.scheduled_at <= NOW()
ORDER BY n.scheduled_at ASC
LIMIT 100;

-- name: getOrderNotifications
SELECT id, user_id, type, message, status, scheduled_at, sent_at, created_at
FROM notifications
WHERE rental_order_id = $1
ORDER BY created_at DESC;
