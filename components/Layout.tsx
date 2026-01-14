

import React, { ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Modal from './Modal';
import Logo from './Logo';
import { supabase } from '../supabaseClient';

import { User } from '../types';
import { useLanguage } from './LanguageContext';

interface LayoutProps {
  children: ReactNode;
  user?: User;
  title?: string;
}

const getMenuItems = (role?: string) => {
  if (role === 'admin_financeiro') {
    return [
      { name: 'Dashboard', icon: 'home', path: '/financeiro?tab=overview' },
      { name: 'Cobranças', icon: 'assignment', path: '/financeiro?tab=charges' },
      { name: 'Pagamentos', icon: 'payments', path: '/financeiro?tab=payments' },
      { name: 'Relatórios', icon: 'bar_chart', path: '/financeiro?tab=reports' },
      { name: 'Configurações', icon: 'settings', path: '/configuracoes' },
    ];
  }
  
  if (role === 'direcao') {
    return [
      { name: 'Direção', icon: 'monitoring', path: '/direcao' },
      { name: 'Financeiro', icon: 'payments', path: '/direcao' },
      { name: 'Académico', icon: 'school', path: '/direcao' },
    ];
  }

  // Default Student Menu
  return [
    { name: 'menu_home', icon: 'home', path: '/dashboard' },
    { name: 'menu_pay', icon: 'payments', path: '/pay' },
    { name: 'menu_finance', icon: 'settings', path: '/configuracoes' },
  ];
};

interface NavLinkProps {
  item: { name: string, icon: string, path: string };
  onClick?: () => void;
}

const NavLink: React.FC<NavLinkProps> = ({ item, onClick }) => {
  const { t } = useLanguage();
  const location = useLocation();
  const isActive = (location.pathname + location.search) === item.path;
  return (
    <Link
      to={item.path}
      onClick={onClick}
      className={`flex items-center gap-3 rounded-xl px-4 py-3 transition-all ${
        isActive
          ? 'bg-[#137FEC] text-white shadow-md shadow-blue-500/20'
          : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
      }`}
    >
      <span className={`material-symbols-outlined text-[22px] ${isActive ? 'fill-1' : ''}`}>
        {item.icon}
      </span>
      <span className="text-sm font-bold">{t(item.name as any)}</span>
    </Link>
  );
};

const Layout: React.FC<LayoutProps> = ({ children, user, title }) => {
  const { t, language, setLanguage } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const currentMenuItems = getMenuItems(user?.role);

  const handleLogout = async () => {
    try {
      await fetch('/api/logout', { method: 'POST' });
    } catch (err) {
      console.error('Logout error:', err);
    }
    navigate('/login');
    // Force a reload might be cleaner to clear all memory states
    window.location.reload();
  };
  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex w-72 flex-col border-r border-slate-200 bg-white">
        <div className="flex h-20 items-center px-8 border-b border-slate-100">
          <Logo />
        </div>
        <nav className="flex flex-1 flex-col overflow-y-auto px-4 py-8">
          <div className="flex flex-col gap-2 flex-1">
            {currentMenuItems.map((item) => (
              <NavLink key={item.name} item={item} />
            ))}
          </div>
          <div className="mt-auto border-t border-slate-100 pt-6 px-2">
            <button 
              onClick={() => setShowLogoutModal(true)}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-red-500 hover:bg-red-50 transition-all group font-bold text-sm"
            >
              <span className="material-symbols-outlined text-[22px] transition-transform group-hover:-translate-x-1">logout</span>
              <span>{t('logout')}</span>
            </button>
          </div>
        </nav>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>
          <aside className="absolute inset-y-0 left-0 w-72 bg-white shadow-2xl animate-in slide-in-from-left duration-300">
            <div className="flex h-20 items-center justify-between px-6 border-b border-slate-100">
              <Logo size="md" />
              <button onClick={() => setIsMobileMenuOpen(false)} className="text-slate-400">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <nav className="p-4 space-y-2">
              {currentMenuItems.map((item) => (
                <NavLink key={item.name} item={item} onClick={() => setIsMobileMenuOpen(false)} />
              ))}
            </nav>
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-16 md:h-20 items-center justify-between border-b border-slate-200 bg-white/80 backdrop-blur-md px-4 md:px-8 shrink-0 z-40 sticky top-0">
          <div className="flex items-center gap-3 lg:hidden">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="size-10 flex items-center justify-center rounded-xl bg-slate-100 text-slate-600 active:scale-95 transition-transform"
            >
              <span className="material-symbols-outlined">menu</span>
            </button>
            <span className="font-black text-slate-900 tracking-tight text-lg">EduPay</span>
          </div>

          <nav aria-label="Breadcrumb" className="hidden lg:flex">
            <ol className="flex items-center space-x-3 text-sm">
              <li>
                <Link to="/" className="text-slate-400 hover:text-[#137FEC] transition-colors">
                  <span className="material-symbols-outlined text-[20px]">home</span>
                </Link>
              </li>
              <li><span className="text-slate-300">/</span></li>
              <li><span className="font-bold text-slate-900 tracking-tight uppercase text-xs">{t(title as any || 'dashboard')}</span></li>
            </ol>
          </nav>

          <div className="flex items-center gap-2 md:gap-4 ml-auto">
            {/* Language Toggle */}
            <button 
              onClick={() => setLanguage(language === 'pt' ? 'en' : 'pt')}
              className="size-10 flex items-center justify-center rounded-xl bg-slate-100 text-[#137FEC] hover:bg-blue-50 transition-colors"
              title={language === 'pt' ? 'Switch to English' : 'Mudar para Português'}
            >
              <span className="material-symbols-outlined">translate</span>
              <span className="text-[10px] font-black ml-0.5 uppercase">{language}</span>
            </button>

            {user && (
              <div className="hidden sm:flex flex-col text-right ml-2">
                <span className="text-xs font-black text-slate-900 tracking-tight">{user.name.toUpperCase()}</span>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none mt-0.5">
                  {user.role === 'admin_financeiro' ? t('role_finance') : 
                   user.role === 'direcao' ? t('role_direction') : t('role_student')}
                </span>
              </div>
            )}
            <div 
              onClick={() => navigate('/configuracoes')}
              className="size-9 md:size-11 rounded-full border-2 border-white shadow-sm ring-1 ring-slate-200 overflow-hidden bg-slate-200 cursor-pointer hover:ring-[#137FEC] transition-all"
            >
               <img 
                src={user?.avatar_url || "https://picsum.photos/seed/user/100/100"} 
                alt="Profile" 
                className="w-full h-full object-cover"
               />
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-10">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </div>

        {/* Mobile Navigation (Bottom) */}
        <nav className="lg:hidden sticky bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 flex justify-around py-2.5 z-50 px-2 pb-safe">
          {currentMenuItems.map((item) => {
            const isActive = (location.pathname + location.search) === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex flex-1 flex-col items-center gap-0.5 py-1 px-2 rounded-xl transition-all ${
                  isActive ? 'text-[#137FEC]' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <span className={`material-symbols-outlined text-[24px] ${isActive ? 'fill-1' : ''}`}>{item.icon}</span>
                <span className="text-[9px] font-black uppercase tracking-tighter">{item.name.split('-')[0]}</span>
              </Link>
            );
          })}
        </nav>
      </main>

      {/* Logout Confirmation Modal */}
      <Modal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        title={t('logout_title')}
        description={t('logout_desc')}
        icon="logout"
        iconColor="text-red-500 bg-red-50"
      >
          <div className="flex w-full flex-col gap-3">
            <button 
              onClick={handleLogout}
              className="w-full rounded-2xl bg-red-500 py-4.5 text-sm font-bold text-white shadow-xl shadow-red-500/30 hover:bg-red-600 active:scale-[0.98] transition-all"
            >
              {t('logout_confirm')}
            </button>
            <button 
              onClick={() => setShowLogoutModal(false)}
              className="w-full rounded-2xl bg-slate-100 py-4.5 text-sm font-bold text-slate-600 hover:bg-slate-200 active:scale-[0.98] transition-all"
            >
              {t('logout_cancel')}
            </button>
          </div>
      </Modal>
    </div>
  );
};

export default Layout;

