const express = require("express");

const {
    getMenus,
    getMenuById,
    createMenu,
    updateMenu,
    deleteMenu
} = require("../controllers/menuController");

const {
    authenticateToken,
    authorizeRole
} = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", authenticateToken, getMenus);

router.get("/:id", authenticateToken, getMenuById);

router.post(
    "/",
    authenticateToken,
    authorizeRole("admin"),
    createMenu
);

router.put(
    "/:id",
    authenticateToken,
    authorizeRole("admin"),
    updateMenu
);

router.delete(
    "/:id",
    authenticateToken,
    authorizeRole("admin"),
    deleteMenu
);

module.exports = router;