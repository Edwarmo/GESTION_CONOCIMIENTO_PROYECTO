"use client";

import { useEffect } from "react";

export default function ToastAlert({ type, message, visible, onClose }) {
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        onClose();
      }, 4000); // Auto-dismiss after 4 seconds
      return () => clearTimeout(timer);
    }
  }, [visible, onClose]);

  if (!visible) return null;

  // Determine styling based on type
  const typeConfig = {
    success: { className: "toast-success", icon: "✓" },
    warning: { className: "toast-warning", icon: "!" },
    error: { className: "toast-error", icon: "✕" }
  };

  const config = typeConfig[type] || typeConfig.success;

  return (
    <div className={`toast-container animate-toast ${config.className}`}>
      <div className="toast-content">
        <span className="toast-icon">{config.icon}</span>
        <p className="toast-message">{message}</p>
        <button type="button" className="toast-close" onClick={onClose} aria-label="Close">
          &times;
        </button>
      </div>
      <div className="toast-progress-bar-container">
        <div className="toast-progress-bar" />
      </div>
    </div>
  );
}
