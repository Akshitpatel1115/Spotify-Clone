import { createContext, useContext, useState, useCallback } from "react";
import { FiCheckCircle, FiAlertCircle, FiInfo, FiX } from "react-icons/fi";

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "info", duration = 3000) => {
    const id = Date.now().toString() + Math.random().toString();
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const toast = {
    success: (msg, duration) => addToast(msg, "success", duration),
    error: (msg, duration) => addToast(msg, "error", duration),
    info: (msg, duration) => addToast(msg, "info", duration),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`flex items-center gap-3 min-w-[300px] max-w-sm rounded-xl p-4 shadow-lg shadow-black/50 backdrop-blur-md transform transition-all duration-300 ${
              t.type === "success" 
                ? "bg-green-500/20 border border-green-500/50 text-green-400" 
                : t.type === "error"
                ? "bg-red-500/20 border border-red-500/50 text-red-400"
                : "bg-blue-500/20 border border-blue-500/50 text-blue-400"
            }`}
          >
            {t.type === "success" && <FiCheckCircle className="text-xl shrink-0" />}
            {t.type === "error" && <FiAlertCircle className="text-xl shrink-0" />}
            {t.type === "info" && <FiInfo className="text-xl shrink-0" />}
            
            <p className="text-sm font-medium text-white flex-1">{t.message}</p>
            
            <button 
              onClick={() => removeToast(t.id)}
              className="text-text-secondary hover:text-white transition-colors"
            >
              <FiX />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
