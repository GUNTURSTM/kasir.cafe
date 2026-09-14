const express = require("express");

const {
    getCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory
} = require("../controllers/categoryController");

const {
    authenticateToken,
    authorizeRole
} = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", authenticateToken, getCategories);

router.get("/:id", authenticateToken, getCategoryById);

router.post(
    "/",
    authenticateToken,
    authorizeRole("admin"),
    createCategory
);

router.put(
    "/:id",
    authenticateToken,
    authorizeRole("admin"),
    updateCategory
);

router.delete(
    "/:id",
    authenticateToken,
    authorizeRole("admin"),
    deleteCategory
);

module.exports = router;