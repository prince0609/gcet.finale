const db = require('../config/db');
const { loadQueries } = require('../utils/queryLoader');
const { paginate, paginationResponse } = require('../utils/helpers');

const notificationQueries = loadQueries('notifications.sql');

/**
 * GET /api/notifications
 * List user notifications
 */
const listNotifications = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const { limit: queryLimit, offset } = paginate(page, limit);

        const [notificationsResult, countResult] = await Promise.all([
            db.query(notificationQueries.getUserNotifications, [req.user.id, queryLimit, offset]),
            db.query(notificationQueries.countUserNotifications, [req.user.id])
        ]);

        res.json(paginationResponse(
            notificationsResult.rows,
            parseInt(countResult.rows[0].total),
            page,
            limit
        ));
    } catch (error) {
        next(error);
    }
};

/**
 * PUT /api/notifications/:id/read
 * Mark notification as read/sent
 */
const markAsRead = async (req, res, next) => {
    try {
        const { id } = req.params;

        const result = await db.query(notificationQueries.markNotificationSent, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Notification not found' });
        }

        res.json({
            message: 'Notification marked as read',
            notification: result.rows[0]
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    listNotifications,
    markAsRead
};
