import React, { useEffect } from 'react';
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
      className="fixed inset-0 z-[1000] flex items-center justify-center"
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      
      {/* Modal Content - Just a container for ReactCrop */}
      <div 
        className="relative flex flex-col items-center justify-center"
        style={{ 
          paddingLeft: "5vw",
          paddingRight: "5vw", 
          paddingTop: "5vh",
          paddingBottom: "5vh",
          maxWidth: "90vw",
          maxHeight: "90vh",
          ...style 
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ maxHeight: "85%" }}>
          {children}
        </div>
        
        {/* Action Buttons - Positioned at bottom */}
        <div className="flex justify-center gap-4 mt-6">
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
