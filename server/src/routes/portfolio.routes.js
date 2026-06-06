const express = require("express");
const router = express.Router();
const PortfolioController = require("../controllers/portfolio.controller");
const authMiddleware = require("../middleware/auth");

router.post("/verify", authMiddleware, PortfolioController.verify);
router.get("/:userId", authMiddleware, PortfolioController.getByUser);
router.delete("/:id", authMiddleware, PortfolioController.remove);

module.exports = router;
