const bcrypt = require("bcryptjs");
const pool = require("./config/db");
require("dotenv").config();

async function createAdmin() {
    try {
        const name = "Administrator";
        const username = "admin";
        const password = process.env.ADMIN_PASSWORD;
        const role = "admin";

        if (!password) {
            throw new Error("ADMIN_PASSWORD belum diatur di file .env");
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await pool.query(
            `INSERT INTO users (name, username, password, role)
             VALUES (?, ?, ?, ?)`,
            [name, username, hashedPassword, role]
        );

        console.log("Admin berhasil dibuat!");

        process.exit(0);
    } catch (error) {
        console.error("Gagal membuat admin:", error);
        process.exit(1);
    }
}

createAdmin();