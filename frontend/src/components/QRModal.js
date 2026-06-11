import React, { useEffect, useState } from "react";
import { ordersAPI } from "../api";
import toast from "react-hot-toast";

export default function QRModal({ orderId, onClose }) {
  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const baseUrl = window.location.origin;
    ordersAPI
      .getQR(orderId, baseUrl)
      .then(({ data }) => setQrData(data))
      .catch(() => toast.error("Failed to generate QR"))
      .finally(() => setLoading(false));
  }, [orderId]);

  const copyLink = () => {
    navigator.clipboard.writeText(qrData.shareUrl);
    toast.success("Link copied!");
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Share & Collect Payment</h2>
          <button className="btn btn-ghost btn-icon btn-sm" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="modal-body">
          {loading ? (
            <div className="loading-center">
              <div className="spinner" />
            </div>
          ) : qrData ? (
            <div className="qr-container">
              <p
                style={{
                  color: "var(--ink-3)",
                  fontSize: 13,
                  marginBottom: 16,
                }}
              >
                Show this QR or share the link — people can see what they owe
                and you mark them paid.
              </p>
              <img src={qrData.qr} alt="QR Code" />
              <div
                className="share-url-box"
                onClick={copyLink}
                title="Click to copy"
              >
                🔗 {qrData.shareUrl}
              </div>
              <p
                style={{
                  fontSize: 12,
                  color: "var(--ink-3)",
                  marginTop: 8,
                }}
              >
                Tap the link above to copy it
              </p>
            </div>
          ) : (
            <p>Failed to generate QR code</p>
          )}
        </div>
        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onClose}>
            Close
          </button>
          {qrData && (
            <button className="btn btn-primary" onClick={copyLink}>
              Copy Link
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
