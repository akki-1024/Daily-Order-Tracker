const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// POST /api/auth/login
router.post("/login", async (req, res) => {
  const { password } = req.body;
  if (!password) return res.status(400).json({ error: "Password required" });

  const hash = process.env.ADMIN_PASSWORD_HASH;
  if (!hash) {
    return res.status(500).json({ error: "Server not configured (no ADMIN_PASSWORD_HASH in .env)" });
  }

  const match = await bcrypt.compare(password, hash);
  if (!match) return res.status(401).json({ error: "Wrong password" });

  const token = jwt.sign({ role: "admin" }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });

  res.json({ token });
});

// POST /api/auth/verify  — frontend uses this on load to check token is still valid
router.post("/verify", (req, res) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ valid: false });
  }
  try {
    const jwt_ = require("jsonwebtoken");
    jwt_.verify(header.slice(7), process.env.JWT_SECRET);
    res.json({ valid: true });
  } catch {
    res.status(401).json({ valid: false });
  }
});

module.exports = router;
