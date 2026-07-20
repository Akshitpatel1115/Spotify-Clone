import React from 'react';
import { FiAlertTriangle } from 'react-icons/fi';

const ConfirmDialog = ({ isOpen, title, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div 
        className="w-full max-w-md rounded-2xl bg-surface border border-border/50 p-6 shadow-2xl shadow-black/80 transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-4 mb-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-500/20 text-red-500">
            <FiAlertTriangle className="text-2xl" />
          </div>
          <h3 className="text-xl font-bold text-white">{title}</h3>
        </div>
        
        <p className="text-text-secondary leading-relaxed mb-8">
          {message}
        </p>
        
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onCancel();
            }}
            className="rounded-full px-5 py-2.5 text-sm font-bold text-white hover:bg-surface-hover transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onConfirm();
            }}
            className="rounded-full bg-red-500 hover:bg-red-600 active:scale-95 px-5 py-2.5 text-sm font-bold text-white transition-all shadow-lg shadow-red-500/20"
          >
            Yes, delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
