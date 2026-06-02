const express = require("express");
const userController = require("../controllers/userController");
const { authenticate, authorize } = require("../middleware/auth");
const { ROLES } = require("../constants/roles");

const router = express.Router();

router.get("/", authenticate, authorize(ROLES.ADMIN, ROLES.OWNER), userController.listUsers);
router.post("/", authenticate, authorize(ROLES.ADMIN), userController.createUser);
router.patch("/:id/role", authenticate, authorize(ROLES.ADMIN), userController.updateUserRole);
router.delete("/:id", authenticate, authorize(ROLES.ADMIN), userController.deleteUser);

module.exports = router;
