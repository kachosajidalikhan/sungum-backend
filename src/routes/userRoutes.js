const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Test route
router.get('/hello', (req, res) => {
    res.json({ message: 'Hello, API is working!' });
});

// Existing routes
router.get('/', userController.getUsers);
router.post('/', userController.createUser);

module.exports = router;
