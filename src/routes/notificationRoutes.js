const express = require('express');
const router = express.Router();
const {
    getAllNotifications,
    getUnreadNotifications,
    markNotificationAsRead,
    createNotification,
} = require('../controllers/notificationController');

router.get('/', getAllNotifications);
router.get('/unread', getUnreadNotifications);
router.put('/:id/read', markNotificationAsRead);
router.post('/', createNotification);

module.exports = router;
