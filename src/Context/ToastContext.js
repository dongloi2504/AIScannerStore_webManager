import React, { createContext, useContext, useState } from "react";
import Toast from "../components/Toast";

const ToastContext = createContext(null);

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
  const [toast, setToast] = useState({ message: "", level: "info" });
  const [show, setShow] = useState(false);

  const showToast = (message, level = "info") => {
    setToast({ message, level });
	setShow(true);
    setTimeout(() => {
		setToast({ message: "", level });
		setShow(false);
	}, 4000);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Toast
        message={toast.message}
        level={toast.level}
		hidden={!show}
        onClose={() => setToast({ message: "", level: "info" })}
      />
    </ToastContext.Provider>
  );
};