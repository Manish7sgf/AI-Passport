const express = require("express");
const router = express.Router();
const AuthController = require("../controllers/auth.controller");
const authMiddleware = require("../middleware/auth");

router.post("/register", AuthController.register);
router.post("/login", AuthController.login);
router.get("/github", AuthController.githubRedirect);
router.get("/github/callback", AuthController.githubCallback);
router.get("/me", authMiddleware, AuthController.me);

module.exports = router;
