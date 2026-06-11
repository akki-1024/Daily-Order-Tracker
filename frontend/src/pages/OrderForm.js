import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useOrders } from "../context/OrderContext";
import toast from "react-hot-toast";

const emptyItem = () => ({ itemName: "", quantity: 1, price: "" });
const emptyPerson = () => ({
  id: Date.now(),
  name: "",
  items: [emptyItem()],
});

export default function OrderForm() {
  const navigate = useNavigate();
  const { createOrder } = useOrders();
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [persons, setPersons] = useState([emptyPerson()]);
  const [saving, setSaving] = useState(false);

  const addPerson = () =>
    setPersons((p) => [...p, { ...emptyPerson(), id: Date.now() }]);

  const removePerson = (pid) =>
    setPersons((p) => p.filter((x) => x.id !== pid));

  const updatePerson = (pid, field, val) =>
    setPersons((p) =>
      p.map((x) => (x.id === pid ? { ...x, [field]: val } : x))
    );

  const addItem = (pid) =>
    setPersons((p) =>
      p.map((x) =>
        x.id === pid ? { ...x, items: [...x.items, emptyItem()] } : x
      )
    );

  const removeItem = (pid, idx) =>
    setPersons((p) =>
      p.map((x) =>
        x.id === pid
          ? { ...x, items: x.items.filter((_, i) => i !== idx) }
          : x
      )
    );

  const updateItem = (pid, idx, field, val) =>
    setPersons((p) =>
      p.map((x) =>
        x.id === pid
          ? {
              ...x,
              items: x.items.map((item, i) =>
                i === idx ? { ...item, [field]: val } : item
              ),
            }
          : x
      )
    );

  const personTotal = (person) =>
    person.items.reduce(
      (s, item) => s + (parseFloat(item.price) || 0) * (item.quantity || 1),
      0
    );

  const grandTotal = persons.reduce((s, p) => s + personTotal(p), 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return toast.error("Give the order a title");
    if (persons.some((p) => !p.name.trim()))
      return toast.error("All persons need a name");

    setSaving(true);
    try {
      const order = await createOrder({
        title,
        notes,
        persons: persons.map(({ id, ...p }) => p),
      });
      toast.success("Order created!");
      navigate(`/order/${order._id}`);
    } catch {
      toast.error("Failed to create order");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="main-content">
      <div className="page-header">
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => navigate("/")}
          >
            ← Back
          </button>
          <div>
            <h1 className="page-title">New Order</h1>
            <p className="page-subtitle">Add items per person — share to collect</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Order info */}
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-body">
            <div className="form-group">
              <label className="form-label">Order Title</label>
              <input
                className="form-input"
                placeholder="Morning Milk & Snacks — June 11"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Notes (optional)</label>
              <textarea
                className="form-textarea"
                placeholder="Any extra info…"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
              />
            </div>
          </div>
        </div>

        {/* Persons */}
        {persons.map((person, pi) => (
          <div className="card" key={person.id} style={{ marginBottom: 16 }}>
            <div className="card-header">
              <input
                className="form-input"
                style={{ fontWeight: 600, maxWidth: 220, border: "none", background: "transparent", padding: "4px 0", fontSize: 15 }}
                placeholder={`Person ${pi + 1} name`}
                value={person.name}
                onChange={(e) => updatePerson(person.id, "name", e.target.value)}
                required
              />
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span className="amount" style={{ color: "var(--accent)" }}>
                  ₹{personTotal(person).toFixed(2)}
                </span>
                {persons.length > 1 && (
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    style={{ color: "var(--red)" }}
                    onClick={() => removePerson(person.id)}
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
            <div className="card-body" style={{ paddingBottom: 0 }}>
              <div className="item-builder">
                {/* Header row */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 70px 90px 32px",
                    gap: 8,
                    padding: "6px 10px",
                    background: "var(--bg)",
                    borderBottom: "1px solid var(--border)",
                  }}
                >
                  {["Item", "Qty", "Price (₹)", ""].map((h) => (
                    <span key={h} style={{ fontSize: 11, fontWeight: 600, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                      {h}
                    </span>
                  ))}
                </div>
                {person.items.map((item, ii) => (
                  <div className="item-builder-row" key={ii}>
                    <input
                      className="form-input"
                      placeholder="Milk, Bread…"
                      value={item.itemName}
                      onChange={(e) =>
                        updateItem(person.id, ii, "itemName", e.target.value)
                      }
                    />
                    <input
                      className="form-input"
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) =>
                        updateItem(person.id, ii, "quantity", parseInt(e.target.value) || 1)
                      }
                      style={{ textAlign: "center" }}
                    />
                    <input
                      className="form-input"
                      type="number"
                      min="0"
                      step="0.5"
                      placeholder="0"
                      value={item.price}
                      onChange={(e) =>
                        updateItem(person.id, ii, "price", e.target.value)
                      }
                    />
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm btn-icon"
                      style={{ color: "var(--red)", padding: "6px" }}
                      onClick={() => removeItem(person.id, ii)}
                      disabled={person.items.length === 1}
                    >
                      ×
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className="item-builder-add"
                  onClick={() => addItem(person.id)}
                >
                  + Add item
                </button>
              </div>
            </div>
            <div style={{ padding: "12px 20px", textAlign: "right" }}>
              <span style={{ fontSize: 13, color: "var(--ink-3)" }}>
                Subtotal:{" "}
              </span>
              <span className="amount" style={{ fontWeight: 600 }}>
                ₹{personTotal(person).toFixed(2)}
              </span>
            </div>
          </div>
        ))}

        <button
          type="button"
          className="btn btn-outline"
          onClick={addPerson}
          style={{ width: "100%", marginBottom: 20, justifyContent: "center" }}
        >
          + Add Person
        </button>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 20px",
            background: "var(--ink)",
            borderRadius: "var(--radius-lg)",
            marginBottom: 24,
          }}
        >
          <div>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Grand Total
            </p>
            <p className="amount-large" style={{ color: "white" }}>
              ₹{grandTotal.toFixed(2)}
            </p>
          </div>
          <button
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={saving}
          >
            {saving ? "Saving…" : "Create Order →"}
          </button>
        </div>
      </form>
    </div>
  );
}
