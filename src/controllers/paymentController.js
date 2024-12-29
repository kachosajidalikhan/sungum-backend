const RoomPayment = require('../models/roomPaymentModel');
const EventPayment = require('../models/eventPaymentModel');

exports.getRoomPayments = async (req, res) => {
  try {
    const payments = await RoomPayment.getAll();
    res.status(200).json(payments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getEventPayments = async (req, res) => {
  try {
    const payments = await EventPayment.getAll();
    res.status(200).json(payments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createRoomPayment = async (req, res) => {
  const data = req.body;

  try {
    const id = await RoomPayment.create(data);
    res.status(201).json({ message: "Room payment added successfully", id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createEventPayment = async (req, res) => {
  const data = req.body;

  try {
    const id = await EventPayment.create(data);
    res.status(201).json({ message: "Event payment added successfully", id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateRoomPayment = async (req, res) => {
  const { id } = req.params; // Payment ID
  const data = req.body;

  try {
    await RoomPayment.update(id, data);
    res.status(200).json({ message: "Room payment updated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateEventPayment = async (req, res) => {
  const { id } = req.params; // Payment ID
  const data = req.body;

  try {
    await EventPayment.update(id, data);
    res.status(200).json({ message: "Event payment updated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteEventPayment = async (req, res) => {
  const { id } = req.params;
  try {
    await EventPayment.delete(id);
    res.status(200).json({ message: 'event deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteRoomPayment = async (req, res) => {
  const { id } = req.params;
  try {
    await RoomPayment.delete(id);
    res.status(200).json({ message: 'room booking deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};