const db = require('../config/database');

const EventPayment = {
    getAll: async () => {
        const [rows] = await db.query('SELECT * FROM event_payments');
        return rows;
    },
    create: async (data) => {
        const {
            event_name,
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
            booked_date,
            time,
            no_of_guests,
            menu,
            services,
            custom_stage,
        } = data;

        const [result] = await db.query(
            `INSERT INTO event_payments 
             (event_name, booked_by, account_title, account_number, payment_date, total_payment, paid_amount, payment_status, email, phone, cnic, services,booked_date, time, no_of_guests, menu, custom_stage) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                event_name,
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
                booked_date,
                time, // "morning" or "evening"
                no_of_guests,
                menu, // "Yes" or "No"
                services, // "Yes" or "No"
                custom_stage, // "Yes" or "No"
            ]
        );

        return result.insertId;
    },
    update: async (id, data) => {
        const { payment_date, paid_amount, payment_status } = data;

        await db.query(
            `UPDATE event_payments 
             SET payment_date = ?, paid_amount = ?, payment_status = ?
             WHERE id = ?`,
            [payment_date, paid_amount, payment_status, id]
        );
    }
};

module.exports = EventPayment;
