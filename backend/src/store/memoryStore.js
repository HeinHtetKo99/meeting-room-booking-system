const { ROLES } = require("../constants/roles");

const state = {
  users: [
    { id: "u1", name: "Alice Admin", role: ROLES.ADMIN },
    { id: "u2", name: "Oscar Owner", role: ROLES.OWNER },
    { id: "u3", name: "Uma User", role: ROLES.USER },
  ],
  bookings: [],
  userIdCounter: 4,
  bookingIdCounter: 1,
};

function findUserById(userId) {
  return state.users.find((user) => user.id === userId) || null;
}

function getAllUsers() {
  return state.users;
}

function getAllBookings() {
  return state.bookings;
}

function addUser(user) {
  state.users.push(user);
  return user;
}

function nextUserId() {
  return `u${state.userIdCounter++}`;
}

function nextBookingId() {
  return `b${state.bookingIdCounter++}`;
}

function updateUserRole(userId, role) {
  const user = findUserById(userId);
  if (!user) {
    return null;
  }
  user.role = role;
  return user;
}

function deleteUserById(userId) {
  const userIndex = state.users.findIndex((user) => user.id === userId);
  if (userIndex < 0) {
    return null;
  }

  const [deletedUser] = state.users.splice(userIndex, 1);
  const beforeCount = state.bookings.length;
  state.bookings = state.bookings.filter((booking) => booking.userId !== userId);
  const deletedBookings = beforeCount - state.bookings.length;

  return { deletedUser, deletedBookings };
}

function addBooking(booking) {
  state.bookings.push(booking);
  return booking;
}

function findBookingById(bookingId) {
  return state.bookings.find((booking) => booking.id === bookingId) || null;
}

function deleteBookingById(bookingId) {
  const bookingIndex = state.bookings.findIndex((booking) => booking.id === bookingId);
  if (bookingIndex < 0) {
    return null;
  }
  const [deletedBooking] = state.bookings.splice(bookingIndex, 1);
  return deletedBooking;
}

module.exports = {
  findUserById,
  getAllUsers,
  getAllBookings,
  addUser,
  nextUserId,
  nextBookingId,
  updateUserRole,
  deleteUserById,
  addBooking,
  findBookingById,
  deleteBookingById,
};
