const express = require("express");
const cors = require("cors");
const healthRoutes = require("./routes/healthRoutes");
const userRoutes = require("./routes/userRoutes");
const bookingRoutes = require("./routes/bookingRoutes");

function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.use(healthRoutes);
  app.use("/users", userRoutes);
  app.use("/bookings", bookingRoutes);

  return app;
}

module.exports = { createApp };
