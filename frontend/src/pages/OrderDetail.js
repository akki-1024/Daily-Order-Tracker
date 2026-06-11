import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ordersAPI } from "../api";
import { useOrders } from "../context/OrderContext";
import QRModal from "../components/QRModal";
import toast from "react-hot-toast";

function formatDate(d) {
  return new Date(d).toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { markPayment, deleteOrder } = useOrders();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showQR, setShowQR] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    ordersAPI
      .getById(id)
      .then(({ data }) => setOrder(data))
      .catch(() => toast.error("Order not found"))
      .finally(() => setLoading(false));
  }, [id]);

  const togglePayment = async (person) => {
    try {
      const updated = await markPayment(id, person._id, !person.paid);
      setOrder(updated);
      toast.success(person.paid ? "Marked as unpaid" : "Marked as paid ✓");
    } catch {
      toast.error("Failed to update payment");
    }
  };

  const handleDelete = async () => {
    await deleteOrder(id);
    navigate("/");
  };

  if (loading)
    return (
      <div className="main-content">
        <div className="loading-center">
          <div className="spinner" />
        </div>
      </div>
    );

  if (!order)
    return (
      <div className="main-content">
        <div className="empty-state">
          <div className="icon">🔍</div>
          <h3>Order not found</h3>
          <button className="btn btn-outline" onClick={() => navigate("/")}>
            Go Back
          </button>
        </div>
      </div>
    );

  const paidCount = order.persons.filter((p) => p.paid).length;
  const totalCount = order.persons.length;
  const paidAmount = order.persons
    .filter((p) => p.paid)
    .reduce((s, p) => s + p.totalAmount, 0);
  const pendingAmount = order.totalOrderAmount - paidAmount;

  return (
    <div className="main-content">
      <div style={{ display: "flex", gap: 12, marginBottom: 20, alignItems: "center" }}>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate("/")}>
          ← Back
        </button>
        <div style={{ flex: 1 }}>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "1.25rem",
            }}
          >
            {order.title}
          </h1>
          <p style={{ fontSize: 13, color: "var(--ink-3)" }}>
            {formatDate(order.date)}
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setShowQR(true)}
        >
          📱 Share QR
        </button>
      </div>

      {/* Summary */}
      <div className="summary-bar" style={{ marginBottom: 20 }}>
        <div className="summary-stat">
          <label>Total</label>
          <span className="val">₹{order.totalOrderAmount.toFixed(0)}</span>
        </div>
        <div className="summary-stat">
          <label>Collected</label>
          <span className="val green">₹{paidAmount.toFixed(0)}</span>
        </div>
        <div className="summary-stat">
          <label>Pending</label>
          <span className="val amber">₹{pendingAmount.toFixed(0)}</span>
        </div>
        <div className="summary-stat">
          <label>Progress</label>
          <span className="val">
            {paidCount}/{totalCount}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div
        style={{
          height: 6,
          background: "var(--border)",
          borderRadius: 99,
          marginBottom: 20,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${totalCount ? (paidCount / totalCount) * 100 : 0}%`,
            background: "var(--green)",
            borderRadius: 99,
            transition: "width 0.4s",
          }}
        />
      </div>

      {/* Persons list */}
      {order.persons.map((person) => (
        <div className="person-row" key={person._id}>
          <div className="person-row-header">
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 2,
                }}
              >
                <span className="person-name">{person.name}</span>
                <span
                  className={`badge ${
                    person.paid ? "badge-paid" : "badge-pending"
                  }`}
                >
                  {person.paid ? "✓ Paid" : "⏳ Pending"}
                </span>
              </div>
              {person.paid && person.paidAt && (
                <span style={{ fontSize: 11, color: "var(--ink-3)" }}>
                  Paid on{" "}
                  {new Date(person.paidAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              )}
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <span
                className="amount"
                style={{
                  fontSize: 16,
                  fontWeight: 600,
                  color: person.paid ? "var(--green)" : "var(--accent)",
                }}
              >
                ₹{person.totalAmount.toFixed(2)}
              </span>
              <button
                className={`btn btn-sm ${
                  person.paid ? "btn-outline" : "btn-success"
                }`}
                onClick={() => togglePayment(person)}
              >
                {person.paid ? "Undo" : "Mark Paid"}
              </button>
            </div>
          </div>

          {person.items && person.items.length > 0 && (
            <div className="person-items">
              {person.items.map((item, i) => (
                <div className="item-line" key={i}>
                  <span>
                    {item.itemName || "Item"} × {item.quantity}
                  </span>
                  <span className="amount">
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      {order.notes && (
        <div
          style={{
            marginTop: 20,
            padding: 14,
            background: "var(--accent-light)",
            borderRadius: "var(--radius)",
            fontSize: 13,
            color: "var(--accent-dark)",
          }}
        >
          📝 {order.notes}
        </div>
      )}

      {/* Danger zone */}
      <div
        style={{
          marginTop: 32,
          paddingTop: 20,
          borderTop: "1px solid var(--border)",
        }}
      >
        {!confirmDelete ? (
          <button
            className="btn btn-ghost btn-sm"
            style={{ color: "var(--red)" }}
            onClick={() => setConfirmDelete(true)}
          >
            🗑 Delete Order
          </button>
        ) : (
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{ fontSize: 13, color: "var(--ink-2)" }}>
              Are you sure?
            </span>
            <button className="btn btn-danger btn-sm" onClick={handleDelete}>
              Yes, Delete
            </button>
            <button
              className="btn btn-outline btn-sm"
              onClick={() => setConfirmDelete(false)}
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {showQR && (
        <QRModal orderId={id} onClose={() => setShowQR(false)} />
      )}
    </div>
  );
}
