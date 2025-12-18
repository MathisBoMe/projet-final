const express = require("express");
const { 
    registerUser, 
    loginUser,
    refreshToken,
    logout,
    getUserByToken, 
    updateUserByToken, 
    deleteUserByToken,
    getUser,
    updateUser,
    deleteUser
} = require("../controllers/user.controller.js");
const { verifyToken } = require("../middlewares/user.js");
const { requireRole } = require("../middlewares/roles.js");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/refresh", refreshToken);
router.post("/logout", verifyToken, logout);
router.get("/me", verifyToken, requireRole("user"), getUserByToken);
router.put("/me", verifyToken, requireRole("user"), updateUserByToken);
router.delete("/me", verifyToken, requireRole("user"), deleteUserByToken);

router.get("/:id", verifyToken, requireRole("admin"), getUser);
router.put("/:id", verifyToken, requireRole("admin"), updateUser);
router.delete("/:id", verifyToken, requireRole("admin"), deleteUser);

module.exports = router;