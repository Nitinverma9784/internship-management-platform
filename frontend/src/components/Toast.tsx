import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, X } from 'lucide-react';
import { ToastMessage } from '../types';

interface ToastListProps {
  toasts: ToastMessage[];
  onCloseToast: (id: string) => void;
}

export default function ToastList({ toasts, onCloseToast }: ToastListProps) {
  if (toasts.length === 0) return null;

  return (
    <div 
      id="toast-stack-container"
      className="fixed bottom-6 right-6 z-50 flex flex-col gap-3.5 max-w-sm w-full select-none pointer-events-none"
    >
      {toasts.map((toast) => {
        let Icon = CheckCircle2;
        let colorClass = 'border-emerald-250 bg-emerald-50 text-emerald-800';
        if (toast.type === 'error') {
          Icon = XCircle;
          colorClass = 'border-rose-250 bg-rose-50 text-rose-800';
        } else if (toast.type === 'info') {
          Icon = AlertTriangle;
          colorClass = 'border-blue-200 bg-blue-50 text-blue-800';
        }

        return (
          <div
            key={toast.id}
            id={`toast-item-${toast.id}`}
            className={`pointer-events-auto border rounded-xl p-4 shadow-lg flex items-start gap-3 transition-all duration-300 transform translate-y-0 scale-100 bg-cream-bg ${colorClass} animate-fadeInUp`}
          >
            <div className="shrink-0 mt-0.5">
              <Icon size={16} />
            </div>
            
            <div className="flex-1 text-left">
              <h5 className="text-xs font-semibold font-sans leading-none">{toast.title}</h5>
              <p className="text-[11px] font-sans opacity-95 leading-normal mt-1 pr-2">{toast.text}</p>
            </div>

            <button
              id={`close-toast-${toast.id}`}
              onClick={() => onCloseToast(toast.id)}
              className="p-0.5 rounded hover:bg-black/5 text-gray-500 hover:text-gray-800 transition-colors cursor-pointer shrink-0"
              title="Close notification"
            >
              <X size={13} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
