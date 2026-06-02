const { ROLES } = require("../constants/roles");
const store = require("../store/memoryStore");
const { parseISODate, toUTCISO } = require("../utils/dates");
const { validateBookingTimes } = require("../utils/bookingRules");

function enrichBooking(booking) {
  const owner = store.findUserById(booking.userId);
  return {
    ...booking,
    userName: owner ? owner.name : "Unknown User",
    userRole: owner ? owner.role : "deleted",
  };
}

function listBookings() {
  return store.getAllBookings().map(enrichBooking);
}

function createBooking(currentUser, { startTime, endTime }) {
  const startDate = parseISODate(startTime);
  const endDate = parseISODate(endTime);
  const validationError = validateBookingTimes(startDate, endDate);
  if (validationError) {
    const status = validationError.includes("overlap") ? 409 : 400;
    return { error: { status, message: validationError } };
  }

  const booking = {
    id: store.nextBookingId(),
    userId: currentUser.id,
    startTime: toUTCISO(startDate),
    endTime: toUTCISO(endDate),
    createdAt: toUTCISO(new Date()),
  };

  return { data: store.addBooking(booking) };
}

function deleteBooking(currentUser, bookingId) {
  const booking = store.findBookingById(bookingId);
  if (!booking) {
    return { error: { status: 404, message: "Booking not found." } };
  }

  const canDeleteAny =
    currentUser.role === ROLES.ADMIN || currentUser.role === ROLES.OWNER;
  const canDeleteOwn = booking.userId === currentUser.id;

  if (!canDeleteAny && !canDeleteOwn) {
    return { error: { status: 403, message: "You can only delete your own bookings." } };
  }

  store.deleteBookingById(bookingId);
  return { data: { message: "Booking deleted." } };
}

function getBookingsGroupedByUser() {
  return store.getAllUsers().map((user) => ({
    userId: user.id,
    name: user.name,
    role: user.role,
    bookings: store.getAllBookings().filter((booking) => booking.userId === user.id),
  }));
}

function getUsageSummary() {
  const bookings = store.getAllBookings();
  return {
    totalBookings: bookings.length,
    byUser: store.getAllUsers().map((user) => ({
      userId: user.id,
      name: user.name,
      role: user.role,
      totalBookings: bookings.filter((booking) => booking.userId === user.id).length,
    })),
  };
}

module.exports = {
  listBookings,
  createBooking,
  deleteBooking,
  getBookingsGroupedByUser,
  getUsageSummary,
};
