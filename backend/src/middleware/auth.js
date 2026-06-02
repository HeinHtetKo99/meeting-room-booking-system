const store = require("../store/memoryStore");

function authenticate(req, res, next) {
  const userId = req.header("x-user-id");
  if (!userId) {
    return res.status(401).json({ error: "Missing or invalid x-user-id header." });
  }

  const currentUser = store.findUserById(userId);
  if (!currentUser) {
    return res.status(401).json({ error: "Missing or invalid x-user-id header." });
  }

  req.currentUser = currentUser;
  return next();
}

function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.currentUser.role)) {
      return res.status(403).json({ error: "Permission denied for this action." });
    }
    return next();
  };
}

module.exports = { authenticate, authorize };
