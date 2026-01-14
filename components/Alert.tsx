import React from 'react';

type AlertType = 'success' | 'error' | 'info' | 'warning';

interface AlertProps {
  type?: AlertType;
  title?: string;
  children: React.ReactNode;
  onClose?: () => void;
  className?: string;
}

const Alert: React.FC<AlertProps> = ({ 
  type = 'info', 
  title, 
  children, 
  onClose,
  className = ''
}) => {
  const styles = {
    success: {
      container: 'bg-green-50 border-green-100',
      icon: 'text-green-400',
      title: 'text-green-800',
      body: 'text-green-700',
      button: 'bg-green-50 text-green-500 hover:bg-green-100 focus:ring-green-600 focus:ring-offset-green-50',
      iconName: 'check_circle'
    },
    error: {
      container: 'bg-red-50 border-red-100',
      icon: 'text-red-400',
      title: 'text-red-800',
      body: 'text-red-700',
      button: 'bg-red-50 text-red-500 hover:bg-red-100 focus:ring-red-600 focus:ring-offset-red-50',
      iconName: 'cancel'
    },
    warning: {
      container: 'bg-yellow-50 border-yellow-100',
      icon: 'text-yellow-400',
      title: 'text-yellow-800',
      body: 'text-yellow-700',
      button: 'bg-yellow-50 text-yellow-500 hover:bg-yellow-100 focus:ring-yellow-600 focus:ring-offset-yellow-50',
      iconName: 'warning'
    },
    info: {
      container: 'bg-blue-50 border-blue-100',
      icon: 'text-blue-400',
      title: 'text-blue-800',
      body: 'text-blue-700',
      button: 'bg-blue-50 text-blue-500 hover:bg-blue-100 focus:ring-blue-600 focus:ring-offset-blue-50',
      iconName: 'info'
    }
  };

  const currentStatus = styles[type];

  return (
    <div className={`rounded-2xl border p-4 animate-in fade-in duration-300 ${currentStatus.container} ${className}`}>
      <div className="flex">
        <div className="shrink-0">
          <span className={`material-symbols-outlined ${currentStatus.icon}`}>
            {currentStatus.iconName}
          </span>
        </div>
        <div className="ml-3 flex-1">
          {title && (
            <h3 className={`text-sm font-black tracking-tight ${currentStatus.title}`}>
              {title}
            </h3>
          )}
          <div className={`text-sm font-bold ${title ? 'mt-1' : ''} ${currentStatus.body}`}>
            {children}
          </div>
        </div>
        {onClose && (
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                type="button"
                onClick={onClose}
                className={`inline-flex rounded-xl p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all ${currentStatus.button}`}
              >
                <span className="sr-only">Fechar</span>
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Alert;
