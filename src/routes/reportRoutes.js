const express = require("express");

const {
    getSalesReport
} = require("../controllers/reportController");

const {
    authenticateToken,
    authorizeRole
} = require("../middleware/authMiddleware");

const router = express.Router();

router.get(
    "/sales",
    authenticateToken,
    authorizeRole("admin"),
    getSalesReport
);

module.exports = router;