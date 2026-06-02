const { TIME_POLICY } = require("../config/timePolicy");

function getHealth(req, res) {
  return res.json({
    status: "ok",
    timezone: `All times are interpreted and stored as ${TIME_POLICY.timezone}.`,
    backToBackPolicy: TIME_POLICY.backToBackAllowed
      ? "Allowed (endTime equal to another booking startTime is valid)."
      : "Not allowed.",
    overlapRule: TIME_POLICY.overlapRule,
    pastStartPolicy: TIME_POLICY.pastStartAllowed
      ? "Past start times are allowed."
      : "Rejected — startTime must be in the future.",
  });
}

function getCurrentUser(req, res) {
  return res.json(req.currentUser);
}

module.exports = { getHealth, getCurrentUser };
