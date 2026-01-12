
import React from 'react';
import { Link } from 'react-router-dom';

interface LogoProps {
  variant?: 'full' | 'icon';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  white?: boolean;
}

const Logo: React.FC<LogoProps> = ({ variant = 'full', size = 'md', className = '', white = false }) => {
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  const iconSizes = {
    sm: 'size-8 text-[18px]',
    md: 'size-9 text-[20px]',
    lg: 'size-10 text-[24px]',
  };

  const textColor = white ? 'text-white' : 'text-slate-900';
  const iconBg = white ? 'bg-white text-[#137FEC]' : 'bg-[#137FEC] text-white';

  return (
    <Link to="/" className={`flex items-center gap-3 ${className}`}>
      <div className={`rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 ${iconSizes[size].split(' ')[0]} ${iconBg}`}>
        <span className={`material-symbols-outlined font-bold ${iconSizes[size].split(' ')[1]}`}>payments</span>
      </div>
      {variant === 'full' && (
        <span className={`font-black tracking-tighter uppercase ${sizeClasses[size]} ${textColor}`}>
          EduPay
        </span>
      )}
    </Link>
  );
};

export default Logo;
