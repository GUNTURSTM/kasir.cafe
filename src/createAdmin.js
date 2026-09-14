const bcrypt = require("bcryptjs");
const pool = require("./config/db");

async function createAdmin() {
    try {
        const name = "Administrator";
        const username = "admin";
        const password = "admin123";
        const role = "admin";

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