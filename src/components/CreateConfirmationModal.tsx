import React from 'react';
import { HelpCircle, Calendar, Sparkles, AlertCircle, Check } from 'lucide-react';

interface CreateConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  type?: 'success' | 'info' | 'warning';
}

export const CreateConfirmationModal: React.FC<CreateConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirmar",
  type = "info",
}) => {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <Check className="w-6 h-6 text-emerald-600" />;
      case 'warning':
        return <AlertCircle className="w-6 h-6 text-amber-600" />;
      default:
        return <HelpCircle className="w-6 h-6 text-brand-moss" />;
    }
  };

  const getIconBg = () => {
    switch (type) {
      case 'success':
        return 'bg-emerald-50 border-emerald-200/50';
      case 'warning':
        return 'bg-amber-50 border-amber-200/50';
      default:
        return 'bg-brand-moss/10 border-brand-moss/20';
    }
  };

  const getConfirmBtnClass = () => {
    switch (type) {
      case 'success':
        return 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-100';
      case 'warning':
        return 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-100';
      default:
        return 'bg-brand-moss hover:bg-brand-moss-hover text-white shadow-brand-moss/10';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-brand-clay/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-brand-beige-dark/20 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-xl border shrink-0 ${getIconBg()}`}>
            {getIcon()}
          </div>
          <div className="space-y-1.5 flex-1">
            <h3 className="text-base font-bold text-brand-clay font-sans">{title}</h3>
            <p className="text-sm text-brand-clay-light leading-relaxed">{message}</p>
          </div>
        </div>
        
        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-brand-beige hover:bg-brand-beige-dark/50 text-brand-clay rounded-xl text-sm font-sans transition-colors cursor-pointer"
          >
            Voltar
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-4 py-2 rounded-xl text-sm font-sans font-semibold transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm ${getConfirmBtnClass()}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
