const express = require('express');
const router = express.Router();
const { getStaff, addStaff, updateStaff, deleteStaff } = require('../controllers/staffController');

// Verify that these functions are correctly imported from the controller
router.get('/', getStaff);
router.post('/', addStaff);
router.put('/:id', updateStaff);
router.delete('/:id', deleteStaff);

module.exports = router;
