const express = require("express");
const router = express.Router();
const PublicController = require("../controllers/public.controller");

// No auth — publicly accessible
router.get("/passport/:username", PublicController.getPublicPassport);

module.exports = router;
