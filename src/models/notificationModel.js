const db = require('../config/database');

const Notification = {
    // Fetch all notifications
    getAll: async () => {
        try {
            const [rows] = await db.query('SELECT * FROM Notifications ORDER BY created_at DESC');
            return rows;
        } catch (error) {
            console.error('Error fetching all notifications:', error.message);
            throw new Error('Failed to fetch notifications.');
        }
    },

    // Fetch unread notifications
    getUnread: async () => {
        try {
            const [rows] = await db.query('SELECT * FROM Notifications WHERE `read` = FALSE ORDER BY created_at DESC');
            return rows;
        } catch (error) {
            console.error('Error fetching unread notifications:', error.message);
            throw new Error('Failed to fetch unread notifications.');
        }
    },

    // Mark a notification as read
    markAsRead: async (id) => {
        try {
            const [result] = await db.query('UPDATE Notifications SET `read` = TRUE WHERE id = ?', [id]);
            return result.affectedRows; // Returns the number of rows affected
        } catch (error) {
            console.error('Error marking notification as read:', error.message);
            throw new Error('Failed to mark notification as read.');
        }
    },

    // Create a new notification
    create: async (data) => {
        const { type, message } = data;
        if (!type || !message) {
            throw new Error('Type and message are required to create a notification.');
        }

        try {
            const [result] = await db.query(
                'INSERT INTO Notifications (type, message) VALUES (?, ?)',
                [type, message]
            );
            return result.insertId; // Returns the ID of the newly created notification
        } catch (error) {
            console.error('Error creating notification:', error.message);
            throw new Error('Failed to create notification.');
        }
    },
};

module.exports = Notification;
