const Notification = require('../models/notificationModel');

// Get all notifications
const getAllNotifications = async (req, res) => {
    try {
        const notifications = await Notification.getAll();
        res.status(200).json({ notifications });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch notifications. Please try again.' });
    }
};

// Get unread notifications
const getUnreadNotifications = async (req, res) => {
    try {
        const unreadNotifications = await Notification.getUnread();
        res.status(200).json({ notifications: unreadNotifications });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch unread notifications. Please try again.' });
    }
};

// Mark a notification as read
const markNotificationAsRead = async (req, res) => {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({ error: 'Notification ID is required.' });
    }

    try {
        const result = await Notification.markAsRead(id);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Notification not found.' });
        }
        res.status(200).json({ message: 'Notification marked as read.' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to mark notification as read. Please try again.' });
    }
};

// Create a new notification
const createNotification = async (req, res) => {
    const { type, message } = req.body;
    if (!type || !message) {
        return res.status(400).json({ error: 'Type and message are required.' });
    }

    try {
        const id = await Notification.create({ type, message });
        const newNotification = { id, type, message, read: false, created_at: new Date() };

        res.status(201).json({ message: 'Notification created successfully.', notification: newNotification });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create notification. Please try again.' });
    }
};

module.exports = {
    getAllNotifications,
    getUnreadNotifications,
    markNotificationAsRead,
    createNotification,
};
