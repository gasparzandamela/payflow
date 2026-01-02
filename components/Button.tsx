
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  fullWidth?: boolean;
  isLoading?: boolean;
  icon?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  fullWidth = false, 
  isLoading = false, 
  icon,
  className = '',
  disabled,
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center rounded-xl font-bold transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50";
  
  const variants = {
    primary: "bg-[#137FEC] text-white hover:bg-blue-600 shadow-lg shadow-blue-500/25 active:scale-[0.98]",
    secondary: "bg-white text-slate-900 border border-slate-200 hover:bg-slate-50 shadow-sm",
    outline: "bg-transparent text-[#137FEC] border border-[#137FEC] hover:bg-blue-50",
    ghost: "bg-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-100",
    danger: "bg-red-500 text-white hover:bg-red-600 shadow-xl shadow-red-500/30 active:scale-[0.98]"
  };

  const sizes = "py-3.5 px-6 text-sm md:text-base";

  return (
    <button 
      className={`
        ${baseStyles} 
        ${variants[variant]} 
        ${sizes} 
        ${fullWidth ? 'w-full' : ''} 
        ${className}
      `}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading ? (
        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : icon ? (
        <span className="mr-2 flex items-center">{icon}</span>
      ) : null}
      {children}
    </button>
  );
};

export default Button;
