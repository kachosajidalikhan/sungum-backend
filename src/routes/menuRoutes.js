const express = require('express');
const router = express.Router();
const {
    getMenuItems,
    addEventMenuItem,
    updateEventMenuItem,
    deleteEventMenuItem,
} = require('../controllers/menuController');

router.post('/event', addEventMenuItem);
router.get('/event', getMenuItems);
router.put('/event/:id', updateEventMenuItem);
router.delete('/event/:id', deleteEventMenuItem);

module.exports = router;
