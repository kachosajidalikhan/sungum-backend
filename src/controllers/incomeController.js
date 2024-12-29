const db = require('../config/database');

const fetchIncomeReport = async (req, res, table) => {
    const { timeframe } = req.query;

    if (!timeframe || !['week', 'month', 'year'].includes(timeframe)) {
        return res.status(400).json({ error: 'Invalid or missing timeframe parameter.' });
    }

    let dateCondition;
    switch (timeframe) {
        case 'week':
            dateCondition = 'payment_date >= NOW() - INTERVAL 7 DAY';
            break;
        case 'month':
            dateCondition = 'YEAR(payment_date) = YEAR(CURDATE()) AND MONTH(payment_date) = MONTH(CURDATE())';
            break;
        case 'year':
            dateCondition = 'YEAR(payment_date) = YEAR(CURDATE())';
            break;
    }

    try {
        const query = `
            SELECT SUM(paid_amount) AS total_income
            FROM ${table}
            WHERE ${dateCondition};
        `;
        const [rows] = await db.query(query);

        res.status(200).json({
            timeframe,
            total_income: rows[0]?.total_income || 0,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const fetchRoomIncomeReport = async (req, res) => {
    await fetchIncomeReport(req, res, 'RoomPayments');
};

const fetchEventIncomeReport = async (req, res) => {
    await fetchIncomeReport(req, res, 'EventPayments');
};

module.exports = {
    fetchRoomIncomeReport,
    fetchEventIncomeReport,
};
