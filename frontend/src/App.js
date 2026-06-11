import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { OrderProvider } from "./context/OrderContext";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import OrderForm from "./pages/OrderForm";
import OrderDetail from "./pages/OrderDetail";
import PayPage from "./pages/PayPage";
import Login from "./pages/Login";
import "./index.css";

function AppLayout({ children }) {
  return (
    <div className="app-shell">
      <Navbar />
      <main>{children}</main>
    </div>
  );
}

function AdminRoutes() {
  return (
    <OrderProvider>
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppLayout><Dashboard /></AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/new"
          element={
            <ProtectedRoute>
              <AppLayout><OrderForm /></AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/order/:id"
          element={
            <ProtectedRoute>
              <AppLayout><OrderDetail /></AppLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </OrderProvider>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              borderRadius: "10px",
              fontFamily: "var(--font-body)",
              fontSize: "14px",
              border: "1px solid var(--border)",
            },
          }}
        />
        <Routes>
          {/* Public — no auth needed */}
          <Route path="/pay/:token" element={<PayPage />} />
          <Route path="/login" element={<Login />} />

          {/* Admin — protected */}
          <Route path="/*" element={<AdminRoutes />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
