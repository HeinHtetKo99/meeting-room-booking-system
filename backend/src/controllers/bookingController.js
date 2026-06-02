const bookingService = require("../services/bookingService");
const { sendServiceResult } = require("../utils/http");

function listBookings(req, res) {
  return res.json(bookingService.listBookings());
}

function createBooking(req, res) {
  return sendServiceResult(res, bookingService.createBooking(req.currentUser, req.body), 201);
}

function deleteBooking(req, res) {
  return sendServiceResult(res, bookingService.deleteBooking(req.currentUser, req.params.id));
}

function listBookingsGroupedByUser(req, res) {
  return res.json(bookingService.getBookingsGroupedByUser());
}

function getBookingsSummary(req, res) {
  return res.json(bookingService.getUsageSummary());
}

module.exports = {
  listBookings,
  createBooking,
  deleteBooking,
  listBookingsGroupedByUser,
  getBookingsSummary,
};
