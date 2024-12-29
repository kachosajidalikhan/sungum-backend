const db = require('../config/database');

const RoomPayment = {
    getAll: async () => {
        const [rows] = await db.query('SELECT * FROM room_payments');
        return rows;
    },
    create: async (data) => {
        const {
            room_number,
            booked_by,
            account_title,
            account_number,
            payment_date,
            total_payment,
            paid_amount,
            payment_status,
            email,
            phone,
            cnic,
            checkin_date,
            checkout_date } = data;
        const [result] = await db.query(
            `INSERT INTO room_payments(
            room_number,
             booked_by, 
             account_title, 
             account_number, 
             payment_date, 
             total_payment, 
             paid_amount, 
             payment_status, 
             email,
             phone,
             cnic,
             checkin_date,
             checkout_date)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?,?,?,?,?)`,
            [room_number, booked_by, account_title, account_number, payment_date, total_payment, paid_amount, payment_status, email, phone, cnic, checkin_date, checkout_date]
        );
        return result.insertId;
    },
    update: async (id, data) => {
        const { payment_date, paid_amount, payment_status } = data;

        await db.query(
            `UPDATE room_payments
           SET payment_date = ?, paid_amount = ?, payment_status = ? 
           WHERE id = ?`,
            [payment_date, paid_amount, payment_status, id]
        );
    },
    delete: async (id) => {
        await db.query('DELETE FROM room_payments WHERE id = ?', [id]);
    },
};
module.exports = RoomPayment;
