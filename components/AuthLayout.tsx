
import React, { ReactNode } from 'react';

interface AuthLayoutProps {
  children: ReactNode;
  decoration: ReactNode;
  reverse?: boolean; // If true, decoration is on the right (Register style). Default false (Login style).
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children, decoration, reverse = false }) => {
  return (
    <div className="min-h-screen flex w-full">
      {/* First Panel (Left) */}
      {!reverse ? (
        <div className="hidden lg:flex w-1/2 relative bg-[#137FEC]/5 overflow-hidden flex-col justify-between p-12">
            {decoration}
        </div>
      ) : (
        <div className="flex flex-col flex-1 justify-center items-center p-6 md:p-12 lg:p-16 bg-white w-full max-w-2xl xl:max-w-3xl border-r border-slate-100">
           {children}
        </div>
      )}

      {/* Second Panel (Right) */}
      {!reverse ? (
         <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 md:p-12 lg:p-24 bg-white overflow-y-auto">
            {children}
         </div>
      ) : (
        <div className="hidden lg:flex flex-1 relative bg-slate-50 items-center justify-center p-12 overflow-hidden">
            {decoration}
        </div>
      )}
    </div>
  );
};

export default AuthLayout;
