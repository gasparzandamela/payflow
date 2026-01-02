
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  containerClassName?: string;
}

const Input: React.FC<InputProps> = ({ 
  label, 
  error, 
  startIcon, 
  endIcon, 
  className = '', 
  containerClassName = '',
  id,
  ...props 
}) => {
  return (
    <div className={`w-full ${containerClassName}`}>
      {label && (
        <label 
          htmlFor={id} 
          className="mb-1.5 block text-sm font-medium text-slate-900"
        >
          {label}
        </label>
      )}
      <div className="relative group">
        {startIcon && (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 group-focus-within:text-[#137FEC] transition-colors">
            {startIcon}
          </div>
        )}
        
        <input 
          id={id}
          className={`
            block w-full rounded-xl border-0 py-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 
            placeholder:text-slate-400 
            focus:ring-2 focus:ring-inset focus:ring-[#137FEC] 
            disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500 disabled:ring-slate-200
            transition-all sm:text-sm sm:leading-6
            ${startIcon ? 'pl-10' : 'pl-3'}
            ${endIcon ? 'pr-10' : 'pr-3'}
            ${error ? 'ring-red-300 focus:ring-red-500' : ''}
            ${className}
          `}
          {...props}
        />
        
        {endIcon && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            {endIcon}
          </div>
        )}
      </div>
      
      {error && (
        <p className="mt-2 text-sm text-red-500 flex items-center gap-1 animate-in slide-in-from-top-1">
          <span className="material-symbols-outlined text-[16px]">error</span>
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;
