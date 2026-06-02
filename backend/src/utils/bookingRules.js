const store = require("../store/memoryStore");

/**
 * Overlap check handles identical ranges, partial overlaps,
 * and one range fully inside another.
 * Back-to-back is allowed: [10:00-11:00] and [11:00-12:00] do not overlap.
 */
function hasOverlap(startDate, endDate, ignoreBookingId = null) {
  return store.getAllBookings().some((booking) => {
    if (ignoreBookingId && booking.id === ignoreBookingId) {
      return false;
    }
    const existingStart = new Date(booking.startTime);
    const existingEnd = new Date(booking.endTime);
    return startDate < existingEnd && endDate > existingStart;
  });
}

function validateBookingTimes(startDate, endDate) {
  if (!startDate || !endDate) {
    return "startTime and endTime must be valid ISO datetime strings.";
  }
  if (startDate >= endDate) {
    return "startTime must be before endTime.";
  }
  if (startDate.getTime() < Date.now()) {
    return "startTime cannot be in the past.";
  }
  if (hasOverlap(startDate, endDate)) {
    return "Booking overlaps with an existing booking.";
  }
  return null;
}

module.exports = { hasOverlap, validateBookingTimes };
