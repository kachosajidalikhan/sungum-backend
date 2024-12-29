// File: models/Event.js
const db = require('../config/database');

const Event = {
    create: async (data) => {
        const query = 'INSERT INTO events (name, price, description, capacity, images) VALUES (?, ?, ?, ?, ?)';
        const [result] = await db.query(query, [data.name, data.price, data.description, data.capacity, data.images]);
        return result;
    },

    getAll: async () => {
        const [results] = await db.query('SELECT * FROM events');
        return results;
    },

    getById: async (id) => {
        const [results] = await db.query('SELECT * FROM events WHERE id = ?', [id]);
        return results;
    },

    update: async (id, data) => {
        const query = 'UPDATE events SET name = ?, price = ?, description = ?, capacity = ?, images = ? WHERE id = ?';
        const [result] = await db.query(query, [data.name, data.price, data.description, data.capacity, data.images, id]);
        return result;
    },

    delete: async (id) => {
        const [result] = await db.query('DELETE FROM events WHERE id = ?', [id]);
        return result;
    },
    isEventAvailable: async (date, time) => {
        try {
            const [results] = await db.query(
                `
                SELECT COUNT(*) as count
                FROM event_payments
                WHERE booking_date = ? AND booking_time = ?
                `,
                [date, time]
            );
            return results[0].count === 0;
        } catch (error) {
            throw error; // Pass the error to the caller for handling
        }
    }
};

module.exports = Event;