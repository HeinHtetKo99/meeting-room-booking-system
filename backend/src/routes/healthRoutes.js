const express = require("express");
const healthController = require("../controllers/healthController");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

router.get("/health", healthController.getHealth);
router.get("/me", authenticate, healthController.getCurrentUser);

module.exports = router;
