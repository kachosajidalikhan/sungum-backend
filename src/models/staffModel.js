const db = require('../config/database');

const Staff = {
  getAll: async () => {
    const [rows] = await db.query('SELECT * FROM Staff');
    return rows;
  },
  create: async (data) => {
    const { name, email, phone, joining_date, on_duty, role } = data;
    const [result] = await db.query(
      `INSERT INTO Staff (name, email, phone, joining_date, on_duty, role) VALUES (?, ?, ?, ?, ?, ?)`,
      [name, email, phone, joining_date, on_duty, role]
    );
    return result.insertId;
  },
  update: async (id, data) => {
    const { name, email, phone, joining_date, on_duty, role } = data;
    await db.query(
      `UPDATE Staff SET name = ?, email = ?, phone = ?, joining_date = ?, on_duty = ?, role = ? WHERE id = ?`,
      [name, email, phone, joining_date, on_duty, role, id]
    );
  },
  delete: async (id) => {
    await db.query('DELETE FROM Staff WHERE id = ?', [id]);
  },
};
module.exports = Staff;
