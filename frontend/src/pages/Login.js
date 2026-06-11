import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

export default function Login() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(password);
      navigate(from, { replace: true });
    } catch (err) {
      const msg = err.response?.data?.error || "Login failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <div style={{ width: "100%", maxWidth: 360 }}>
        {/* Brand */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: "2.5rem", marginBottom: 8 }}>🧾</div>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "1.8rem",
              marginBottom: 4,
            }}
          >
            HisaabBook
          </h1>
          <p style={{ color: "var(--ink-3)", fontSize: 14 }}>
            Admin access only
          </p>
        </div>

        <div className="card">
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  className="form-input"
                  type="password"
                  placeholder="Enter admin password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoFocus
                  required
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary btn-lg"
                disabled={loading}
                style={{ width: "100%", justifyContent: "center", marginTop: 4 }}
              >
                {loading ? "Checking…" : "Sign In →"}
              </button>
            </form>
          </div>
        </div>

        <p
          style={{
            textAlign: "center",
            fontSize: 12,
            color: "var(--ink-3)",
            marginTop: 20,
          }}
        >
          People with your shared link can still view their order without logging in.
        </p>
      </div>
    </div>
  );
}
