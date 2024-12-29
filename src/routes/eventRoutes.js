const express = require('express');
const router = express.Router();
const { 
    getAllEvents, 
    createEvent, 
    updateEvent, 
    deleteEvent, 
    getEventById, 
    upload,
    checkEventAvailability
} = require('../controllers/eventController');

router.post('/check-availability', checkEventAvailability);
router.get('/', getAllEvents);
router.post('/', createEvent);
router.get('/:id', getEventById);
router.put('/:id', upload, updateEvent);
router.delete('/:id', deleteEvent);

module.exports = router;