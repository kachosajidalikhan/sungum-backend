const express = require('express');
const router = express.Router();
const {
    fetchRoomIncomeReport,
    fetchEventIncomeReport,
} = require('../controllers/incomeController');

router.get('/rooms', fetchRoomIncomeReport);
router.get('/events', fetchEventIncomeReport);

module.exports = router;
