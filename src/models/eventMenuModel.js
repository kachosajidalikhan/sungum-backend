const db = require('../config/database');

const EventMenu = {
    // Get all menu items
    getAll: async () => {
        const [rows] = await db.query('SELECT * FROM EventMenus');
        return rows;
    },

    // Create a new menu item
    create: async (data) => {
        const { category, items } = data; // `items` is expected to be a JSON array
        if (!Array.isArray(items)) {
            throw new Error("Invalid data format: 'items' must be an array.");
        }

        const [result] = await db.query(
            `INSERT INTO EventMenus (category, items) VALUES (?, ?)`,
            [category, JSON.stringify(items)]
        );

        return result.insertId;
    },

    // Update an existing menu item
    update: async (id, data) => {
        const { category, items } = data; // `items` is expected to be a JSON array
        if (!Array.isArray(items)) {
            throw new Error("Invalid data format: 'items' must be an array.");
        }

        await db.query(
            `UPDATE EventMenus SET category = ?, items = ? WHERE id = ?`,
            [category, JSON.stringify(items), id]
        );
    },

    // Delete a menu item
    delete: async (id) => {
        await db.query(`DELETE FROM EventMenus WHERE id = ?`, [id]);
    },
};

module.exports = EventMenu;
