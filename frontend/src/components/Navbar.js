import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        🧾 Hisaab<span>Book</span>
      </Link>
      <div className="navbar-actions">
        <button
          className="btn btn-primary btn-sm"
          onClick={() => navigate("/new")}
        >
          + New Order
        </button>
        <button
          className="btn btn-ghost btn-sm"
          style={{ color: "rgba(255,255,255,0.65)" }}
          onClick={logout}
          title="Log out"
        >
          Sign out
        </button>
      </div>
    </nav>
  );
}
