const express = require("express");

const {
    createTransaction,
    getTransactions
} = require("../controllers/transactionController");

const {
    getTransactionById,
    getReceipt
} = require("../controllers/transactionDetailController");

const {
    authenticateToken
} = require("../middleware/authMiddleware");

const router = express.Router();


// ========================================
// CREATE TRANSACTION
// ========================================

router.post(
    "/",
    authenticateToken,
    createTransaction
);


// ========================================
// GET ALL TRANSACTIONS
// ========================================

router.get(
    "/",
    authenticateToken,
    getTransactions
);


// ========================================
// GET TRANSACTION RECEIPT
// ========================================

router.get(
    "/:id/receipt",
    authenticateToken,
    getReceipt
);


// ========================================
// GET TRANSACTION DETAIL
// ========================================

router.get(
    "/:id",
    authenticateToken,
    getTransactionById
);


module.exports = router;