const mongoose = require("mongoose");

const personItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  items: [
    {
      itemName: String,
      quantity: { type: Number, default: 1 },
      price: { type: Number, required: true },
    },
  ],
  totalAmount: { type: Number, default: 0 },
  paid: { type: Boolean, default: false },
  paidAt: Date,
  upiRef: String,
});

const orderSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    date: { type: Date, default: Date.now },
    persons: [personItemSchema],
    shareToken: { type: String, unique: true },
    totalOrderAmount: { type: Number, default: 0 },
    notes: String,
    createdBy: { type: String, default: "admin" },
  },
  { timestamps: true }
);

// Recalculate totals before save
orderSchema.pre("save", function (next) {
  this.persons.forEach((person) => {
    person.totalAmount = person.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
  });
  this.totalOrderAmount = this.persons.reduce(
    (sum, p) => sum + p.totalAmount,
    0
  );
  next();
});

module.exports = mongoose.model("Order", orderSchema);
