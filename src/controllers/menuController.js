const EventMenu = require('../models/eventMenuModel');


const getMenuItems = async (req, res) => {
  try {
    const event = await EventMenu.getAll();
    res.status(200).json(event);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


const addEventMenuItem = async (req, res) => {
  const { category, items } = req.body;

  // Validation: Ensure required fields are present and `items` is a valid array
  if (!category || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Category and a valid items array are required.' });
  }

  try {
    const id = await EventMenu.create({ category, items });
    res.status(201).json({ message: 'Menu item added successfully.', id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateEventMenuItem = async (req, res) => {
  const { id } = req.params;
  const { category, items } = req.body;

  // Validation: Ensure required fields are present and `items` is a valid array
  if (!category || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Category and a valid items array are required.' });
  }

  try {
    await EventMenu.update(id, { category, items });
    res.status(200).json({ message: 'Menu item updated successfully.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteEventMenuItem = async (req, res) => {
  const { id } = req.params;

  try {
    await EventMenu.delete(id);
    res.status(200).json({ message: 'Menu item deleted successfully.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getMenuItems,
  addEventMenuItem,
  updateEventMenuItem,
  deleteEventMenuItem,
};
