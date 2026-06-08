import { createContext, useContext, useMemo, useState } from "react";

const ToastContext = createContext(null);

let nextToastId = 1;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = (id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  };

  const showToast = (type, message) => {
    const id = nextToastId++;
    setToasts((current) => [...current, { id, type, message }]);

    window.setTimeout(() => {
      removeToast(id);
    }, 3500);
  };

  const value = useMemo(
    () => ({
      success: (message) => showToast("success", message),
      error: (message) => showToast("error", message),
      info: (message) => showToast("info", message),
    }),
    []
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-viewport">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast-card ${toast.type}`}>
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);

