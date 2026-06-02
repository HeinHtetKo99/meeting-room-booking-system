const userService = require("../services/userService");
const { sendServiceResult } = require("../utils/http");

function listUsers(req, res) {
  return res.json(userService.listUsers());
}

function createUser(req, res) {
  return sendServiceResult(res, userService.createUser(req.body), 201);
}

function updateUserRole(req, res) {
  return sendServiceResult(
    res,
    userService.changeUserRole(req.params.id, req.body.role, req.currentUser.id),
  );
}

function deleteUser(req, res) {
  return sendServiceResult(res, userService.removeUser(req.params.id, req.currentUser.id));
}

module.exports = {
  listUsers,
  createUser,
  updateUserRole,
  deleteUser,
};
