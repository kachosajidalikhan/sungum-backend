// File: models/Room.js
const db = require('../config/database');

const Room = {
    create: async (data) => {
        const query = 'INSERT INTO rooms (name, number, price, description, capacity, number_of_beds, images) VALUES (?, ?, ?, ?, ?, ?, ?)';
        const [result] = await db.query(query, [data.name, data.number, data.price, data.description, data.capacity, data.number_of_beds, data.images]);
        return result;
    },

    getAll: async () => {
        const [results] = await db.query('SELECT * FROM rooms');
        return results;
    },

    getById: async (id) => {
        const [results] = await db.query('SELECT * FROM rooms WHERE id = ?', [id]);
        return results;
    },

    update: async (id, data) => {
        const query = 'UPDATE rooms SET name = ?, number = ?, price = ?, number_of_beds = ?,description = ?, capacity = ?, images = ? WHERE id = ?';
        const [result] = await db.query(query, [data.name, data.number, data.price, data.number_of_beds, data.description, data.capacity, data.images, id]);
        return result;
    },

    delete: async (id) => {
        const [result] = await db.query('DELETE FROM rooms WHERE id = ?', [id]);
        return result;
    },

    getAvailableRooms: async (checkIn, checkOut) => {
        try {
            // Modified query to handle same-day bookings and exact date comparisons
            const query = `
                SELECT DISTINCT r.*
                FROM rooms r
                WHERE r.number NOT IN (
                    SELECT DISTINCT rp.room_number
                    FROM room_payments rp
                    WHERE 
                        -- Check if the dates overlap
                        NOT (
                            rp.checkout_date < ? -- New booking starts after existing booking ends
                            OR 
                            rp.checkin_date > ? -- New booking ends before existing booking starts
                        )
                        AND rp.payment_status IN ('full', 'partial')
                )
                ORDER BY r.number
            `;

            // For debugging
            console.log('Checking availability for:', {
                checkIn,
                checkOut,
            });

            const [rooms] = await db.query(query, [
                checkIn,  // Compare with checkout_date
                checkOut  // Compare with checkin_date
            ]);

            // Log results for debugging
            console.log(`Found ${rooms.length} available rooms`);
            console.log('Excluded rooms with bookings between', checkIn, 'and', checkOut);

            // Query to show conflicting bookings (for debugging)
            const [conflicts] = await db.query(`
                SELECT room_number, checkin_date, checkout_date 
                FROM room_payments 
                WHERE NOT (checkout_date < ? OR checkin_date > ?)
                AND payment_status IN ('full', 'partial')
            `, [checkIn, checkOut]);

            console.log('Conflicting bookings:', conflicts);

            return rooms;
        } catch (error) {
            console.error('Error in getAvailableRooms:', error);
            throw error;
        }
    },

    isRoomAvailable: async (roomId, checkIn, checkOut) => {
        try {
            const query = `
                SELECT COUNT(*) as bookingCount
                FROM room_payments
                WHERE room_number = ?
                AND payment_status IN ('full', 'partial')
                AND (
                    (checkin_date <= ? AND checkout_date >= ?) -- Overlaps with requested check-in
                    OR
                    (checkin_date <= ? AND checkout_date >= ?) -- Overlaps with requested check-out
                    OR
                    (checkin_date >= ? AND checkout_date <= ?) -- Falls entirely within requested dates
                )
            `;

            // For debugging
            console.log('Checking availability for room:', roomId);
            console.log('Check-in:', checkIn);
            console.log('Check-out:', checkOut);

            const [result] = await db.query(query, [
                roomId,
                checkOut, checkOut,  // For check-in overlap
                checkIn, checkIn,    // For check-out overlap
                checkIn, checkOut    // For contained bookings
            ]);

            // Debug query results
            console.log('Booking count:', result[0].bookingCount);

            // Also fetch conflicting bookings for debugging
            const [conflicts] = await db.query(`
                SELECT checkin_date, checkout_date 
                FROM room_payments 
                WHERE room_number = ?
                AND payment_status IN ('full', 'partial')
                AND (
                    (checkin_date <= ? AND checkout_date >= ?)
                    OR
                    (checkin_date <= ? AND checkout_date >= ?)
                    OR
                    (checkin_date >= ? AND checkout_date <= ?)
                )
            `, [
                roomId,
                checkOut, checkOut,
                checkIn, checkIn,
                checkIn, checkOut
            ]);

            console.log('Conflicting bookings:', conflicts);

            return result[0].bookingCount === 0;
        } catch (error) {
            console.error('Error in isRoomAvailable:', error);
            throw error;
        }
    }
};

module.exports = Room;
