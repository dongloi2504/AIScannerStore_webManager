import React from "react";
import "../Styles/Toast.css"; // Make sure to import the CSS file

const Toast = ({ message, onClose, level = "info", hidden }) => {
  if (!message) return null;

  const bgColor = level === "success" ? "green" : level === "error" ? "red" : level === "warning" ? "yellow" : "blue";

  return (
    <div className={`toastx ${bgColor}`} hidden={hidden}>
      <div className="toastx-content">
        <span>{message}</span>
        <button className="toast-close" onClick={onClose}> × </button>
      </div>
    </div>
  );
};

export default Toast;