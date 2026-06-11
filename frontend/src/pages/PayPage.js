import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ordersAPI } from "../api";

function formatDate(d) {
  return new Date(d).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function PayPage() {
  const { token } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    ordersAPI
      .getByToken(token)
      .then(({ data }) => setOrder(data))
      .catch(() => setError("Order not found or link is invalid."))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading)
    return (
      <div className="pay-page">
        <div className="loading-center" style={{ width: "100%" }}>
          <div className="spinner" />
        </div>
      </div>
    );

  if (error)
    return (
      <div className="pay-page">
        <div className="pay-card">
          <div className="pay-header">
            <h1>🧾 HisaabBook</h1>
          </div>
          <div style={{ padding: 32, textAlign: "center", color: "var(--ink-3)" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>😕</div>
            <p>{error}</p>
          </div>
        </div>
      </div>
    );

  const totalPending = order.persons
    .filter((p) => !p.paid)
    .reduce((s, p) => s + p.totalAmount, 0);

  return (
    <div className="pay-page">
      <div className="pay-card">
        <div className="pay-header">
          <h1>🧾 HisaabBook</h1>
          <p>Payment summary for this order</p>
        </div>

        <div style={{ padding: 20 }}>
          <div style={{ marginBottom: 20 }}>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "1.15rem",
                marginBottom: 4,
              }}
            >
              {order.title}
            </h2>
            <p style={{ fontSize: 13, color: "var(--ink-3)" }}>
              📅 {formatDate(order.date)}
            </p>
          </div>

          {/* Pending persons */}
          {order.persons.filter((p) => !p.paid).length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <h3
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "var(--ink-3)",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  marginBottom: 10,
                }}
              >
                Pending Payment
              </h3>
              {order.persons
                .filter((p) => !p.paid)
                .map((person) => (
                  <div className="person-row" key={person._id} style={{ marginBottom: 10 }}>
                    <div className="person-row-header">
                      <div>
                        <span className="person-name">{person.name}</span>
                        <span
                          className="badge badge-pending"
                          style={{ marginLeft: 8 }}
                        >
                          ⏳ Pending
                        </span>
                      </div>
                      <span
                        className="amount"
                        style={{
                          fontWeight: 600,
                          fontSize: 16,
                          color: "var(--accent)",
                        }}
                      >
                        ₹{person.totalAmount.toFixed(2)}
                      </span>
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
            </div>
          )}

          {/* Already paid */}
          {order.persons.filter((p) => p.paid).length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <h3
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "var(--ink-3)",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  marginBottom: 10,
                }}
              >
                Already Paid
              </h3>
              {order.persons
                .filter((p) => p.paid)
                .map((person) => (
                  <div
                    key={person._id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "10px 14px",
                      background: "var(--green-light)",
                      borderRadius: 8,
                      marginBottom: 6,
                    }}
                  >
                    <span style={{ fontWeight: 500 }}>{person.name}</span>
                    <span
                      style={{ display: "flex", alignItems: "center", gap: 8 }}
                    >
                      <span className="badge badge-paid">✓ Paid</span>
                      <span className="amount" style={{ color: "var(--green)" }}>
                        ₹{person.totalAmount.toFixed(2)}
                      </span>
                    </span>
                  </div>
                ))}
            </div>
          )}

          <div
            style={{
              background: "var(--ink)",
              borderRadius: "var(--radius)",
              padding: "14px 18px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <p
                style={{
                  fontSize: 11,
                  color: "rgba(255,255,255,0.5)",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                Outstanding
              </p>
              <p
                className="amount"
                style={{
                  color: totalPending > 0 ? "var(--accent)" : "#6FCF97",
                  fontSize: "1.4rem",
                }}
              >
                ₹{totalPending.toFixed(2)}
              </p>
            </div>
            <div style={{ textAlign: "right" }}>
              <p
                style={{
                  fontSize: 11,
                  color: "rgba(255,255,255,0.5)",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                Order Total
              </p>
              <p className="amount" style={{ color: "white", fontSize: "1.1rem" }}>
                ₹{order.totalOrderAmount.toFixed(2)}
              </p>
            </div>
          </div>

          {order.notes && (
            <div
              style={{
                marginTop: 14,
                padding: 12,
                background: "var(--accent-light)",
                borderRadius: 8,
                fontSize: 13,
                color: "var(--accent-dark)",
              }}
            >
              📝 {order.notes}
            </div>
          )}

          <br/>

          <p style={{
            fontSize: '1.2rem',
            fontWeight: '600',
            textAlign: 'center'
          }}>SCAN TO PAY</p>

          <br/>
          
          <img src="/QR.png" style={{
            width: '100%',
            height: '300px',
            objectFit: 'contain'
          }}/>

        </div>
      </div>
    </div>
  );
}
