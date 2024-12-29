const express = require('express');
const router = express.Router();
const eventRequestController = require('../controllers/eventRequestController');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Add this before configuring multer
const uploadDir = 'uploads/receipts';
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ 
    storage: storage,
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|pdf/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        if (extname) {
            return cb(null, true);
        }
        cb(new Error('Only jpeg, jpg, png, and pdf files are allowed!'));
    }
});

// Get all booking requests
router.get('/', eventRequestController.getAllRequests);
// Confirm booking request
router.post('/:id/confirm', eventRequestController.confirmRequest);
// Reject booking request
router.post('/:id/reject', eventRequestController.rejectRequest);
// Create new booking request
router.post('/', upload.single('receipt'), eventRequestController.createRequest);
module.exports = router;