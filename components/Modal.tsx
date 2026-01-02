
import React, { ReactNode, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  description?: string;
  icon?: string;
  iconColor?: string; // e.g. "text-red-500 bg-red-50"
}

const Modal: React.FC<ModalProps> = ({ 
  isOpen, 
  onClose, 
  children,
  title,
  description,
  icon,
  iconColor = "text-[#137FEC] bg-blue-50"
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300"
        onClick={onClose}
      ></div>
      <div className="relative w-full max-w-sm rounded-[2.5rem] bg-white p-8 shadow-2xl animate-in zoom-in slide-in-from-bottom-4 duration-300">
        {(icon || title) && (
          <div className="flex flex-col items-center text-center">
            {icon && (
              <div className={`mb-6 flex h-16 w-16 items-center justify-center rounded-full shadow-inner ${iconColor}`}>
                <span className="material-symbols-outlined text-4xl">{icon}</span>
              </div>
            )}
            {title && <h3 className="text-2xl font-black text-slate-900 tracking-tight">{title}</h3>}
            {description && (
              <p className="mt-3 text-sm text-slate-500 font-medium leading-relaxed">
                {description}
              </p>
            )}
          </div>
        )}
        <div className="mt-6">
            {children}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default Modal;
