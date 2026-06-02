const { ALL_ROLES } = require("../constants/roles");
const store = require("../store/memoryStore");

function isNameTaken(name) {
  const normalized = name.trim().toLowerCase();
  return store.getAllUsers().some((user) => user.name.toLowerCase() === normalized);
}

function listUsers() {
  return store.getAllUsers();
}

function createUser({ name, role }) {
  if (!name || typeof name !== "string" || !name.trim()) {
    return { error: { status: 400, message: "Name is required." } };
  }
  if (!ALL_ROLES.includes(role)) {
    return { error: { status: 400, message: "Role must be one of: admin, owner, user." } };
  }

  const trimmedName = name.trim();
  if (isNameTaken(trimmedName)) {
    return {
      error: {
        status: 409,
        message: "A user with this name already exists. Please choose a different name.",
      },
    };
  }

  const user = {
    id: store.nextUserId(),
    name: trimmedName,
    role,
  };
  return { data: store.addUser(user) };
}

function changeUserRole(userId, role) {
  if (!ALL_ROLES.includes(role)) {
    return { error: { status: 400, message: "Role must be one of: admin, owner, user." } };
  }

  const user = store.updateUserRole(userId, role);
  if (!user) {
    return { error: { status: 404, message: "User not found." } };
  }
  return { data: user };
}

function removeUser(userId, actingAdminId) {
  if (userId === actingAdminId) {
    return { error: { status: 400, message: "Admin cannot delete themselves." } };
  }

  const result = store.deleteUserById(userId);
  if (!result) {
    return { error: { status: 404, message: "User not found." } };
  }

  return {
    data: {
      message: "User deleted.",
      deletedUserId: result.deletedUser.id,
      deletedBookings: result.deletedBookings,
      policy: "Bookings created by deleted users are also deleted.",
    },
  };
}

module.exports = {
  listUsers,
  createUser,
  changeUserRole,
  removeUser,
};
