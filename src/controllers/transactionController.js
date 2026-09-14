const pool = require("../config/db");


// ========================================
// CREATE TRANSACTION
// ========================================

const createTransaction = async (req, res) => {
    const conn = await pool.getConnection();

    try {
        const {
            items,
            payment_method,
            paid_amount
        } = req.body;

        // Validasi items
        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                message: "Transaction items are required"
            });
        }

        // Validasi metode pembayaran
        const allowedPaymentMethods = [
            "cash",
            "qris",
            "transfer"
        ];

        if (!allowedPaymentMethods.includes(payment_method)) {
            return res.status(400).json({
                message: "Invalid payment method"
            });
        }

        // Mulai transaction database
        await conn.beginTransaction();

        let totalPrice = 0;
        const details = [];

        // ========================================
        // CEK MENU
        // ========================================

        for (const item of items) {

            // Validasi menu_id
            if (!item.menu_id) {
                throw new Error("Menu ID is required");
            }

            // Validasi quantity
            const quantity = Number(item.quantity);

            if (!Number.isInteger(quantity) || quantity <= 0) {
                throw new Error(
                    "Quantity must be a positive integer"
                );
            }

            // Ambil data menu
            const rows = await conn.query(
                `SELECT id, name, price, status
                 FROM menus
                 WHERE id = ?`,
                [item.menu_id]
            );

            // Menu tidak ditemukan
            if (rows.length === 0) {
                throw new Error(
                    `Menu ${item.menu_id} not found`
                );
            }

            const menu = rows[0];

            // Cek status menu
            if (menu.status !== "available") {
                throw new Error(
                    `${menu.name} is unavailable`
                );
            }

            // Ambil harga dari database
            const price = Number(menu.price);

            // Hitung subtotal
            const subtotal = price * quantity;

            // Tambahkan ke total
            totalPrice += subtotal;

            // Simpan detail sementara
            details.push({
                menu_id: menu.id,
                quantity,
                price,
                subtotal
            });
        }


        // ========================================
        // HITUNG PEMBAYARAN
        // ========================================

        let paidAmount;
        let changeAmount = 0;

        // Pembayaran CASH
        if (payment_method === "cash") {

            paidAmount = Number(paid_amount);

            if (!Number.isFinite(paidAmount) || paidAmount <= 0) {
                throw new Error(
                    "Paid amount must be greater than 0"
                );
            }

            // Uang kurang
            if (paidAmount < totalPrice) {
                throw new Error(
                    "Paid amount is less than total price"
                );
            }

            // Hitung kembalian
            changeAmount = paidAmount - totalPrice;

        } else {

            // QRIS / Transfer
            paidAmount = totalPrice;
            changeAmount = 0;
        }


        // ========================================
        // BUAT KODE TRANSAKSI
        // ========================================

        const transactionCode =
            "TRX-" + Date.now();


        // ========================================
        // SIMPAN TRANSAKSI
        // ========================================

        const transactionResult = await conn.query(
            `INSERT INTO transactions
            (
                user_id,
                transaction_code,
                total_price,
                paid_amount,
                change_amount,
                payment_method,
                payment_status
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                req.user.id,
                transactionCode,
                totalPrice,
                paidAmount,
                changeAmount,
                payment_method,
                "paid"
            ]
        );

        const transactionId =
            Number(transactionResult.insertId);


        // ========================================
        // SIMPAN DETAIL TRANSAKSI
        // ========================================

        for (const detail of details) {

            await conn.query(
                `INSERT INTO transaction_details
                (
                    transaction_id,
                    menu_id,
                    quantity,
                    price,
                    subtotal
                )
                VALUES (?, ?, ?, ?, ?)`,
                [
                    transactionId,
                    detail.menu_id,
                    detail.quantity,
                    detail.price,
                    detail.subtotal
                ]
            );
        }


        // Simpan perubahan
        await conn.commit();


        // ========================================
        // RESPONSE
        // ========================================

        res.status(201).json({
            message: "Transaction created successfully",

            transaction: {
                id: transactionId,
                transaction_code: transactionCode,
                total_price: totalPrice,
                paid_amount: paidAmount,
                change_amount: changeAmount,
                payment_method: payment_method,
                payment_status: "paid"
            }
        });

    } catch (error) {

        await conn.rollback();

        console.error(error);

        res.status(400).json({
            message: error.message
        });

    } finally {

        conn.release();
    }
};


// ========================================
// GET ALL TRANSACTIONS
// ========================================

const getTransactions = async (req, res) => {

    try {

        const rows = await pool.query(`
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

            ORDER BY transactions.id DESC
        `);

        res.json(rows);

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
    createTransaction,
    getTransactions
};