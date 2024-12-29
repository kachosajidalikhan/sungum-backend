const db = require('../config/database');

const findAll = async () => {
    try {
        const [rows] = await db.query(
            'SELECT * FROM event_booking_requests WHERE status = "pending" ORDER BY created_at DESC'
        );
        return rows;
    } catch (error) {
        throw error;
    }
};

const findById = async (id) => {
    try {
        const [rows] = await db.query(
            'SELECT * FROM event_booking_requests WHERE id = ?',
            [id]
        );
        return rows[0];
    } catch (error) {
        throw error;
    }
};

const create = async (bookingData) => {
    try {
        const [result] = await db.query(
            'INSERT INTO event_booking_requests SET ?',
            [bookingData]
        );
        return result.insertId;
    } catch (error) {
        throw error;
    }
};
const updateStatus = async (id, status) => {
    try {
        const [result] = await db.query(
            'UPDATE event_booking_requests SET status = ? WHERE id = ?',
            [status, id]
        );
        return result.affectedRows > 0;
    } catch (error) {
        throw error;
    }
};
const createPaymentRecord = async (paymentData) => {
    try {
        const [result] = await db.query(
            `INSERT INTO event_payments (
                booking_request_id, event_name, booked_by, 
                account_title, account_number, payment_date,
                total_payment, paid_amount, payment_status,
                email, phone, cnic, booking_date, booking_time, 
                number_of_guests, menu, stage, services, receipt, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                paymentData.booking_request_id,
                paymentData.event_name,
                paymentData.booked_by,
                paymentData.account_title,
                paymentData.account_number,
                paymentData.payment_date,
                paymentData.total_payment,
                paymentData.paid_amount,
                paymentData.payment_status,
                paymentData.email,
                paymentData.phone,
                paymentData.cnic,
                paymentData.booking_date,
                paymentData.booking_time,
                paymentData.number_of_guests,
                paymentData.menu,
                paymentData.stage,
                paymentData.services,
                paymentData.receipt,
                paymentData.created_at
            ]
        );
        return result.insertId;
    } catch (error) {
        throw error;
    }
};

module.exports = {
    findAll,
    findById,
    create,
    updateStatus,
    createPaymentRecord
};