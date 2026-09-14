const pool = require("../config/db");

const getSalesReport = async (req, res) => {
    try {
        const { start_date, end_date } = req.query;

        let dateCondition = "";
        const params = [];

        if (start_date && end_date) {
            dateCondition = `
                AND DATE(created_at) BETWEEN ? AND ?
            `;
            params.push(start_date, end_date);
        } else if (start_date) {
            dateCondition = `
                AND DATE(created_at) >= ?
            `;
            params.push(start_date);
        } else if (end_date) {
            dateCondition = `
                AND DATE(created_at) <= ?
            `;
            params.push(end_date);
        }

        const summary = await pool.query(`
            SELECT
                COUNT(*) AS total_transactions,
                COALESCE(SUM(total_price), 0) AS total_revenue,
                COALESCE(SUM(paid_amount), 0) AS total_paid,
                COALESCE(SUM(change_amount), 0) AS total_change
            FROM transactions
            WHERE payment_status = 'paid'
            ${dateCondition}
        `, params);

        const paymentMethods = await pool.query(`
            SELECT
                payment_method,
                COUNT(*) AS total_transactions,
                COALESCE(SUM(total_price), 0) AS total_revenue
            FROM transactions
            WHERE payment_status = 'paid'
            ${dateCondition}
            GROUP BY payment_method
            ORDER BY total_revenue DESC
        `, params);

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
            ${dateCondition.replace(
                /created_at/g,
                "transactions.created_at"
            )}
            GROUP BY menus.id, menus.name
            ORDER BY total_quantity DESC
            LIMIT 5
        `, params);

        // Ubah BigInt menjadi Number
        const formattedPaymentMethods = paymentMethods.map(item => ({
            ...item,
            total_transactions: Number(item.total_transactions),
            total_revenue: Number(item.total_revenue)
        }));

        const formattedBestMenus = bestMenus.map(item => ({
            ...item,
            id: Number(item.id),
            total_quantity: Number(item.total_quantity),
            total_revenue: Number(item.total_revenue)
        }));

        res.json({
            period: {
                start_date: start_date || null,
                end_date: end_date || null
            },

            summary: {
                total_transactions: Number(summary[0].total_transactions),
                total_revenue: Number(summary[0].total_revenue),
                total_paid: Number(summary[0].total_paid),
                total_change: Number(summary[0].total_change)
            },

            payment_methods: formattedPaymentMethods,

            best_menus: formattedBestMenus
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
};

module.exports = {
    getSalesReport
};