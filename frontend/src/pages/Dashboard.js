import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useOrders } from "../context/OrderContext";

function formatDate(d) {
  return new Date(d).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function Dashboard() {
  const { orders, loading, fetchOrders } = useOrders();
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const totalPending = orders.reduce((sum, o) => {
    return (
      sum +
      o.persons
        .filter((p) => !p.paid)
        .reduce((s, p) => s + p.totalAmount, 0)
    );
  }, 0);

  const totalCollected = orders.reduce((sum, o) => {
    return (
      sum +
      o.persons
        .filter((p) => p.paid)
        .reduce((s, p) => s + p.totalAmount, 0)
    );
  }, 0);

  return (
    <div className="main-content">
      <div className="page-header" style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <h1 className="page-title">Hisaab Book</h1>
          <p className="page-subtitle">Track daily orders & collect payments</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate("/new")}>
          + New Order
        </button>
      </div>

      {orders.length > 0 && (
        <div className="summary-bar">
          <div className="summary-stat">
            <label>Total Orders</label>
            <span className="val">{orders.length}</span>
          </div>
          <div className="summary-stat">
            <label>Collected</label>
            <span className="val green">₹{totalCollected.toFixed(0)}</span>
          </div>
          <div className="summary-stat">
            <label>Pending</label>
            <span className="val amber">₹{totalPending.toFixed(0)}</span>
          </div>
        </div>
      )}

      {loading ? (
        <div className="loading-center">
          <div className="spinner" />
        </div>
      ) : orders.length === 0 ? (
        <div className="empty-state">
          <div className="icon">📋</div>
          <h3>No orders yet</h3>
          <p style={{ marginBottom: 20 }}>
            Create your first order and start collecting payments.
          </p>
          <button className="btn btn-primary" onClick={() => navigate("/new")}>
            Create First Order
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {orders.map((order) => {
            const paid = order.persons.filter((p) => p.paid).length;
            const total = order.persons.length;
            const pending = order.persons
              .filter((p) => !p.paid)
              .reduce((s, p) => s + p.totalAmount, 0);

            return (
              <Link
                key={order._id}
                to={`/order/${order._id}`}
                className="order-card"
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <div>
                    <div className="order-card-title">{order.title}</div>
                    <div className="order-card-meta">
                      <span>📅 {formatDate(order.date)}</span>
                      <span>👥 {total} persons</span>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div
                      className="amount"
                      style={{ fontWeight: 600, fontSize: 16 }}
                    >
                      ₹{order.totalOrderAmount.toFixed(0)}
                    </div>
                  </div>
                </div>
                <div className="order-card-footer">
                  <div style={{ display: "flex", gap: 6 }}>
                    {paid > 0 && (
                      <span className="badge badge-paid">
                        ✓ {paid} paid
                      </span>
                    )}
                    {paid < total && (
                      <span className="badge badge-pending">
                        ⏳ {total - paid} pending
                      </span>
                    )}
                  </div>
                  {pending > 0 && (
                    <span
                      style={{
                        fontSize: 13,
                        color: "var(--accent-dark)",
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      ₹{pending.toFixed(0)} to collect
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
