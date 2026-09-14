const pool = require("../config/db");

const getMenus = async (req, res) => {
    try {
        const rows = await pool.query(`
            SELECT 
                menus.id,
                menus.name,
                menus.price,
                menus.status,
                menus.description,
                menus.image,
                categories.name AS category_name
            FROM menus
            JOIN categories 
                ON menus.category_id = categories.id
            ORDER BY menus.id DESC
        `);

        res.json(rows);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
};

const getMenuById = async (req, res) => {
    try {
        const { id } = req.params;

        const rows = await pool.query(`
            SELECT 
                menus.id,
                menus.category_id,
                menus.name,
                menus.price,
                menus.status,
                menus.description,
                menus.image,
                categories.name AS category_name
            FROM menus
            JOIN categories 
                ON menus.category_id = categories.id
            WHERE menus.id = ?
        `, [id]);

        if (rows.length === 0) {
            return res.status(404).json({
                message: "Menu not found"
            });
        }

        res.json(rows[0]);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
};

const createMenu = async (req, res) => {
    try {
        const {
            category_id,
            name,
            price,
            status,
            description,
            image
        } = req.body;

        if (!category_id || !name || !price) {
            return res.status(400).json({
                message: "Category, name, and price are required"
            });
        }

        const result = await pool.query(`
            INSERT INTO menus
            (category_id, name, price, status, description, image)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [
            category_id,
            name,
            price,
            status || "available",
            description || null,
            image || null
        ]);

        res.status(201).json({
            message: "Menu created successfully",
            id: Number(result.insertId)
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
};

const updateMenu = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            category_id,
            name,
            price,
            status,
            description,
            image
        } = req.body;

        if (!category_id || !name || !price) {
            return res.status(400).json({
                message: "Category, name, and price are required"
            });
        }

        const result = await pool.query(`
            UPDATE menus
            SET
                category_id = ?,
                name = ?,
                price = ?,
                status = ?,
                description = ?,
                image = ?
            WHERE id = ?
        `, [
            category_id,
            name,
            price,
            status || "available",
            description || null,
            image || null,
            id
        ]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Menu not found"
            });
        }

        res.json({
            message: "Menu updated successfully"
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
};

const deleteMenu = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            "DELETE FROM menus WHERE id = ?",
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Menu not found"
            });
        }

        res.json({
            message: "Menu deleted successfully"
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
};

module.exports = {
    getMenus,
    getMenuById,
    createMenu,
    updateMenu,
    deleteMenu
};