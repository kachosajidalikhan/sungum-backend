const Staff = require('../models/staffModel');

const getStaff = async (req, res) => {
  try {
    const staff = await Staff.getAll();
    res.status(200).json(staff);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const addStaff = async (req, res) => {
  const { name, email, phone, joining_date, on_duty, role } = req.body;
  try {
    const id = await Staff.create({ name, email, phone, joining_date, on_duty, role });
    res.status(201).json({ message: 'Staff added successfully', id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateStaff = async (req, res) => {
  const { id } = req.params;
  const { name, email, phone, joining_date, on_duty, role } = req.body;
  try {
    await Staff.update(id, { name, email, phone, joining_date, on_duty, role });
    res.status(200).json({ message: 'Staff updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteStaff = async (req, res) => {
  const { id } = req.params;
  try {
    await Staff.delete(id);
    res.status(200).json({ message: 'Staff deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getStaff, addStaff, updateStaff, deleteStaff };
