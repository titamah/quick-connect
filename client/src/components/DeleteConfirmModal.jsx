import React from 'react';
import { X } from 'lucide-react';

const DeleteConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  savedDesigns, 
  onDeleteDesign 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[var(--bg-main)] rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">
            Storage Full
          </h3>
          <button
            onClick={onClose}
            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <p className="text-[var(--text-secondary)] mb-6">
          You have reached the maximum of 5 saved designs. Please delete one to continue creating new designs.
        </p>
        
        <div className="space-y-3 mb-6">
          <h4 className="font-medium text-[var(--text-primary)]">Your Saved Designs:</h4>
          {savedDesigns.map((design) => (
            <div
              key={design.id}
              className="flex items-center justify-between p-3 bg-[var(--bg-secondary)] rounded-lg"
            >
              <div className="flex-1">
                <p className="text-sm font-medium text-[var(--text-primary)]">
                  {design.name || 'Untitled Design'}
                </p>
                <p className="text-xs text-[var(--text-secondary)]">
                  {new Date(design.lastModified).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={(e) => onDeleteDesign(design.id, e)}
                className="ml-3 px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
        
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-[var(--accent)] text-white rounded hover:opacity-90 transition-opacity"
          >
            Continue Editing
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
