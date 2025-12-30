
import React from 'react';

interface ConfirmationPanelProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: 'danger' | 'info' | 'warning';
}

const ConfirmationPanel: React.FC<ConfirmationPanelProps> = ({
  isOpen,
  title,
  message,
  confirmLabel,
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  type = 'info'
}) => {
  if (!isOpen) return null;

  const typeStyles = {
    danger: 'bg-red-600',
    info: 'bg-blue-900',
    warning: 'bg-amber-500'
  };

  const typeIcons = {
    danger: 'fa-exclamation-triangle',
    info: 'fa-shield-halved',
    warning: 'fa-user-check'
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in duration-300">
        
        {/* Protocol Header */}
        <div className={`${typeStyles[type]} px-6 py-4 text-white flex items-center gap-3`}>
          <div className="w-8 h-8 bg-white/10 rounded flex items-center justify-center border border-white/20">
            <i className={`fas ${typeIcons[type]} text-xs`}></i>
          </div>
          <div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] leading-none">{title}</h3>
            <p className="text-[8px] font-bold opacity-60 tracking-widest uppercase mt-1">Institutional Protocol</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          <p className="text-sm font-bold text-slate-700 dark:text-slate-200 leading-relaxed mb-8">
            {message}
          </p>

          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
            >
              {cancelLabel}
            </button>
            <button
              onClick={onConfirm}
              className={`${typeStyles[type]} flex-1 px-4 py-3 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:brightness-110 active:scale-95 transition`}
            >
              {confirmLabel}
            </button>
          </div>
        </div>

        {/* Status Footer */}
        <div className="bg-slate-50 dark:bg-slate-950 px-6 py-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
           <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Protocol Active</span>
           <i className="fas fa-lock text-[8px] text-slate-200"></i>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationPanel;
