const express = require('express');
const router = express.Router();
const { 
    getAllRooms, 
    createRoom, 
    updateRoom, 
    deleteRoom,
    getRoomById,
    getRoomAvailability,
    upload,
    checkRoomAvailability
} = require('../controllers/roomController');

router.get('/available', getRoomAvailability);
router.get('/:id', getRoomById);
router.get('/', getAllRooms);
router.post('/', createRoom);
router.put('/:id', upload, updateRoom);
router.delete('/:id', deleteRoom);
router.get('/:id/check-availability', checkRoomAvailability);

module.exports = router;