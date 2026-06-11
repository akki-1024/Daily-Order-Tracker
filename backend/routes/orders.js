const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const QRCode = require("qrcode");
const { v4: uuidv4 } = require("uuid");
const requireAuth = require("../middleware/auth");

// ── PUBLIC ────────────────────────────────────────────────────────────────────

// GET order by share token — anyone with the link can view
router.get("/share/:token", async (req, res) => {
  try {
    const order = await Order.findOne({ shareToken: req.params.token });
    if (!order) return res.status(404).json({ error: "Order not found" });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── PROTECTED (admin only) ────────────────────────────────────────────────────

// GET all orders
router.get("/", requireAuth, async (req, res) => {
  try {
    const orders = await Order.find().sort({ date: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single order by ID
router.get("/:id", requireAuth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: "Order not found" });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create order
router.post("/", requireAuth, async (req, res) => {
  try {
    const shareToken = uuidv4().replace(/-/g, "").substring(0, 12);
    const order = new Order({ ...req.body, shareToken });
    await order.save();
    res.status(201).json(order);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT update order
router.put("/:id", requireAuth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: "Order not found" });
    Object.assign(order, req.body);
    await order.save();
    res.json(order);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PATCH mark person as paid/unpaid
router.patch("/:orderId/person/:personId/payment", requireAuth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) return res.status(404).json({ error: "Order not found" });

    const person = order.persons.id(req.params.personId);
    if (!person) return res.status(404).json({ error: "Person not found" });

    person.paid = req.body.paid;
    person.paidAt = req.body.paid ? new Date() : null;
    person.upiRef = req.body.upiRef || person.upiRef;

    await order.save();
    res.json(order);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET QR code for order share link
router.get("/:id/qr", requireAuth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: "Order not found" });

    const { baseUrl } = req.query;
    const shareUrl = `${baseUrl || "http://localhost:3000"}/pay/${order.shareToken}`;
    const qrDataUrl = await QRCode.toDataURL(shareUrl, {
      width: 300,
      margin: 2,
      color: { dark: "#1a1a1a", light: "#ffffff" },
    });

    res.json({ qr: qrDataUrl, shareUrl });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE order
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.json({ message: "Order deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
