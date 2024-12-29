const express = require('express');
const router = express.Router();
const {
  getRoomPayments,
  getEventPayments,
  updateRoomPayment,
  updateEventPayment,
  createRoomPayment,
  createEventPayment,
  deleteEventPayment,
  deleteRoomPayment
} = require('../controllers/paymentController');

router.get('/rooms', getRoomPayments);
router.get('/events', getEventPayments);

router.post('/rooms' ,createRoomPayment);
router.post('/events' ,createEventPayment);

router.put('/rooms/:id', updateRoomPayment);
router.put('/events/:id', updateEventPayment);

module.exports = router;
