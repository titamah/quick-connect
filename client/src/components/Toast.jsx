import React, { useState, useEffect, createContext, useContext } from 'react';

// Toast Context
const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// Toast Provider Component
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = 'success', duration = 3000) => {
    const id = Date.now() + Math.random();
    const toast = { id, message, type, duration };
    
    setToasts(prev => [...prev, toast]);
    
    // Auto remove after duration
    setTimeout(() => {
      removeToast(id);
    }, duration);
    
    return id;
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const toast = {
    success: (message, options = {}) => showToast(message, 'success', options.autoClose || 3000),
    error: (message, options = {}) => showToast(message, 'error', options.autoClose || 4000),
  };

  return (
    <ToastContext.Provider value={{ toast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
};

// Toast Container Component
const ToastContainer = ({ toasts, onRemove }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[9999] space-y-2">
      {toasts.map(toast => (
        <ToastItem 
          key={toast.id} 
          toast={toast} 
          onRemove={onRemove} 
        />
      ))}
    </div>
  );
};

// Individual Toast Item
const ToastItem = ({ toast, onRemove }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const handleRemove = () => {
    setIsVisible(false);
    // Wait for exit animation before removing
    setTimeout(() => onRemove(toast.id), 200);
  };

  return (
    <div
      className={`
        px-4 py-2 rounded-full text-sm font-medium text-white
        transition-all duration-200 ease-in-out cursor-pointer
        transform ${isVisible ? 'translate-y-0 opacity-100 scale-100' : '-translate-y-2 opacity-0 scale-95'}
        ${toast.type === 'success' 
          ? 'bg-[var(--contrast-sheer)]' 
          : 'bg-red-500/90'
        }
        hover:scale-105 active:scale-95
        backdrop-blur-sm shadow-lg
        max-w-xs text-center
      `}
      onClick={handleRemove}
      style={{
        backgroundColor: toast.type === 'success' 
          ? 'var(--contrast-sheer)' 
          : 'rgba(239, 68, 68, 0.9)'
      }}
    >
      {toast.message}
    </div>
  );
};

export default ToastProvider;
