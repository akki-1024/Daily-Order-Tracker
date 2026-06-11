require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:3000" }));
app.use(express.json());

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/orders", require("./routes/orders"));

// Health check
app.get("/api/health", (req, res) =>
  res.json({ status: "ok", time: new Date() })
);

// Connect to MongoDB and start server
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/order-tracker")
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });
