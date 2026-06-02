/**
 * Time handling assumptions (documented for reviewers):
 * - Clients should send UTC ISO strings (e.g. from datetime-local via toISOString()).
 * - All booking times are parsed from ISO 8601 strings and stored in UTC.
 * - Comparisons use native Date objects in server runtime.
 * - Back-to-back bookings are allowed when endTime === next startTime.
 */
const TIME_POLICY = {
  timezone: "UTC ISO strings",
  backToBackAllowed: true,
  overlapRule: "Ranges overlap when start < existingEnd AND end > existingStart",
};

module.exports = { TIME_POLICY };
