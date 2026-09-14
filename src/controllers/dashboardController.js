const pool = require("../config/db");

const getDashboard = async (req, res) => {
    try {
        const [totalTransactions] = await pool.query(`
            SELECT COUNT(*) AS total
            FROM transactions
            WHERE payment_status = 'paid'
        `);

        const [totalRevenue] = await pool.query(`
            SELECT COALESCE(SUM(total_price), 0) AS total
            FROM transactions
            WHERE payment_status = 'paid'
        `);

        const [todayTransactions] = await pool.query(`
            SELECT COUNT(*) AS total
            FROM transactions
            WHERE payment_status = 'paid'
            AND DATE(created_at) = CURDATE()
        `);

        const [todayRevenue] = await pool.query(`
            SELECT COALESCE(SUM(total_price), 0) AS total
            FROM transactions
            WHERE payment_status = 'paid'
            AND DATE(created_at) = CURDATE()
        `);

        // Top 5 menu terlaris
        const bestMenus = await pool.query(`
            SELECT
                menus.id,
                menus.name,
                SUM(transaction_details.quantity) AS total_quantity,
                SUM(transaction_details.subtotal) AS total_revenue
            FROM transaction_details
            JOIN menus
                ON transaction_details.menu_id = menus.id
            JOIN transactions
                ON transaction_details.transaction_id = transactions.id
            WHERE transactions.payment_status = 'paid'
            GROUP BY menus.id, menus.name
            ORDER BY total_quantity DESC
            LIMIT 5
        `);

        res.json({
            total_transactions: Number(totalTransactions.total),
            total_revenue: Number(totalRevenue.total),
            today_transactions: Number(todayTransactions.total),
            today_revenue: Number(todayRevenue.total),
            best_menus: bestMenus
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
};

module.exports = {
    getDashboard
};