const db = require('../config/database');

const Gallery = {
  getAll: async () => {
    const [rows] = await db.query('SELECT * FROM Gallery');
    return rows;
  },
  create: async (data) => {
    const { image, alt_text, tags } = data;
    const [result] = await db.query(
      `INSERT INTO Gallery (image, alt_text, tags) VALUES (?, ?, ?)`,
      [image, alt_text, tags]
    );
    return result.insertId; // Only returning the ID
  },
  delete: async (id) => {
    await db.query('DELETE FROM Gallery WHERE id = ?', [id]);
  },
};
module.exports = Gallery;
