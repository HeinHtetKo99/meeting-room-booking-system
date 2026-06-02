const express = require("express");
const bookingController = require("../controllers/bookingController");
const { authenticate, authorize } = require("../middleware/auth");
const { ROLES } = require("../constants/roles");

const router = express.Router();
const allRoles = [ROLES.ADMIN, ROLES.OWNER, ROLES.USER];
const ownerAndAdmin = [ROLES.ADMIN, ROLES.OWNER];

router.get("/", authenticate, authorize(...allRoles), bookingController.listBookings);
router.post("/", authenticate, authorize(...allRoles), bookingController.createBooking);
router.delete("/:id", authenticate, authorize(...allRoles), bookingController.deleteBooking);
router.get(
  "/grouped-by-user",
  authenticate,
  authorize(...ownerAndAdmin),
  bookingController.listBookingsGroupedByUser,
);
router.get("/summary", authenticate, authorize(...ownerAndAdmin), bookingController.getBookingsSummary);

module.exports = router;
