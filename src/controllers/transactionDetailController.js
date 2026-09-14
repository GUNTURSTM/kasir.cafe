const pool = require("../config/db");


// ========================================
// GET TRANSACTION BY ID
// ========================================

const getTransactionById = async (req, res) => {

    try {

        const { id } = req.params;


        // ========================================
        // AMBIL DATA TRANSAKSI
        // ========================================

        const transactions = await pool.query(`
            SELECT
                transactions.id,
                transactions.transaction_code,
                transactions.total_price,
                transactions.paid_amount,
                transactions.change_amount,
                transactions.payment_method,
                transactions.payment_status,
                transactions.created_at,
                users.name AS cashier_name

            FROM transactions

            JOIN users
                ON transactions.user_id = users.id

            WHERE transactions.id = ?
        `, [id]);


        // Jika transaksi tidak ditemukan
        if (transactions.length === 0) {

            return res.status(404).json({
                message: "Transaction not found"
            });
        }


        // ========================================
        // AMBIL DETAIL TRANSAKSI
        // ========================================

        const details = await pool.query(`
            SELECT
                transaction_details.id,
                transaction_details.menu_id,
                menus.name AS menu_name,
                transaction_details.quantity,
                transaction_details.price,
                transaction_details.subtotal

            FROM transaction_details

            JOIN menus
                ON transaction_details.menu_id = menus.id

            WHERE transaction_details.transaction_id = ?
        `, [id]);


        // ========================================
        // RESPONSE
        // ========================================

        res.json({

            transaction: transactions[0],

            details: details

        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
};


// ========================================
// GET RECEIPT
// ========================================

const getReceipt = async (req, res) => {

    try {

        const { id } = req.params;


        // ========================================
        // AMBIL DATA TRANSAKSI
        // ========================================

        const transactions = await pool.query(`
            SELECT
                transactions.id,
                transactions.transaction_code,
                transactions.total_price,
                transactions.paid_amount,
                transactions.change_amount,
                transactions.payment_method,
                transactions.payment_status,
                transactions.created_at,
                users.name AS cashier_name

            FROM transactions

            JOIN users
                ON transactions.user_id = users.id

            WHERE transactions.id = ?
        `, [id]);


        // Jika transaksi tidak ditemukan
        if (transactions.length === 0) {

            return res.status(404).json({
                message: "Transaction not found"
            });
        }


        // ========================================
        // AMBIL DETAIL TRANSAKSI
        // ========================================

        const details = await pool.query(`
            SELECT
                menus.name AS menu_name,
                transaction_details.quantity,
                transaction_details.price,
                transaction_details.subtotal

            FROM transaction_details

            JOIN menus
                ON transaction_details.menu_id = menus.id

            WHERE transaction_details.transaction_id = ?
        `, [id]);


        const transaction = transactions[0];


        // ========================================
        // RESPONSE STRUK
        // ========================================

        res.json({

            store: "Cafe POS",

            transaction: {
                id: Number(transaction.id),
                transaction_code: transaction.transaction_code,
                cashier: transaction.cashier_name,
                created_at: transaction.created_at
            },

            items: details.map(item => ({

                menu_name: item.menu_name,
                quantity: Number(item.quantity),
                price: Number(item.price),
                subtotal: Number(item.subtotal)

            })),

            payment: {

                total: Number(transaction.total_price),
                paid: Number(transaction.paid_amount),
                change: Number(transaction.change_amount),
                method: transaction.payment_method,
                status: transaction.payment_status

            }

        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
};


// ========================================
// EXPORT
// ========================================

module.exports = {
    getTransactionById,
    getReceipt
};