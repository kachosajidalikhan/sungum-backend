const db = require('../config/database');

class UserModel {
  static async getAll() {
    const [rows] = await db.query('SELECT * FROM users');
    return rows;
  }

  static async create(userData) {
    const { name, email } = userData;
    const [result] = await db.query(
      'INSERT INTO users (name, email) VALUES (?, ?)',
      [name, email]
    );
    return result;
  }
}

module.exports = UserModel;
