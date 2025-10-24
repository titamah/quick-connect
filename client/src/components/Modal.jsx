import React, { useEffect } from 'react';
import { useDevice } from "../contexts/DeviceContext";
import { createPortal } from 'react-dom';

const Modal = ({ 
  open, 
  onOk, 
  onCancel, 
  okText = 'OK', 
  cancelText = 'Cancel',
  maskClosable = true,
  children,
  style = {},
  width = '520px'
}) => {
    const {isMobile} = useDevice();
  // Handle ESC key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && open) {
        onCancel?.();
      }
    };
    
    if (open) {
      document.addEventListener('keydown', handleEsc);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [open, onCancel]);

  if (!open) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && maskClosable) {
      onCancel?.();
    }
  };

  const modalContent = (
    <div 
      className={`fixed inset-0 z-[1000] w-[100vw] flex items-center justify-center ${isMobile ? "mt-[40px] h-[calc(100vh-40px)]" : "mt-[60px] h-[calc(100vh-60px)]"}`}
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm pointer-events-auto"
        onClick={onCancel}
      />
      
      {/* Modal Content */}
      <div 
        className="relative flex flex-col items-center justify-center max-w-[80vw] max-h-[80vh] p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="max-w-full max-h-[90vh] flex items-center justify-center mb-6">
          <div style={{ 
            maxWidth: '100%',
            maxHeight: 'calc(100% - 120px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {children}
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex justify-center gap-4">
          <button
            onClick={onCancel}
            className="cursor-pointer px-6 py-2 text-sm font-medium text-[var(--text-secondary)] bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg hover:bg-[var(--bg-secondary)] transition-colors shadow-lg"
          >
            {cancelText}
          </button>
          <button
            onClick={onOk}
            className="cursor-pointer px-6 py-2 text-sm font-medium text-white bg-[var(--accent)] rounded-lg hover:opacity-90 transition-opacity shadow-lg"
          >
            {okText}
          </button>
        </div>
      </div>
    </div>
  );

  // Render modal at document.body level to escape any container constraints
  return createPortal(modalContent, document.body);
};

export default Modal;
