
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User } from '../types';
import AuthLayout from '../components/AuthLayout';
import Input from '../components/Input';
import Button from '../components/Button';
import Logo from '../components/Logo';
import { supabase } from '../supabaseClient';
import { useLanguage } from '../components/LanguageContext';
import { useToast } from '../components/Toast';
import Alert from '../components/Alert';

interface RegisterProps {
  onRegister: (user: User) => void;
}

const Register: React.FC<RegisterProps> = ({ onRegister }) => {
  const { t } = useLanguage();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password !== confirmPassword) {
        setError(t('passwords_do_not_match'));
        setLoading(false);
        return;
    }

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email, 
          password, 
          options: { data: { name } } 
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || result.message || t('failed_to_create_account'));
      }

      if (result.user) {
         if (result.message === 'Check your email') {
             addToast(t('account_created_check_email'), 'info');
             navigate('/login');
         } else {
             // Auto-logged in
             onRegister({
               name: result.user.user_metadata?.name || result.user.email?.split('@')[0] || t('user'),
               email: result.user.email || '',
             });
             navigate('/dashboard');
         }
      }

    } catch (err: any) {
      setError(err.message || t('error_creating_account'));
    } finally {
      setLoading(false);
    }
  };

  const Decoration = (
    <>
      <div className="absolute inset-0 z-0 opacity-40 bg-[radial-gradient(#137fec_1px,transparent_1px)] [background-size:20px_20px]"></div>
      <div className="relative z-10 w-full max-w-lg flex flex-col gap-10">
        <div className="flex flex-col gap-4">
          <h2 className="text-slate-900 tracking-tight text-3xl font-bold leading-tight">
            {t('security_title')}
          </h2>
          <p className="text-slate-500 text-lg font-normal">
            {t('security_subtitle')}
          </p>
        </div>
        
        <div className="grid grid-cols-1 gap-4">
          {[
            { title: t('encryption_title'), desc: t('encryption_desc'), icon: 'lock' },
            { title: t('fraud_protection_title'), desc: t('fraud_protection_desc'), icon: 'shield' },
            { title: t('support_title'), desc: t('support_desc'), icon: 'support_agent' }
          ].map((feature, i) => (
            <div key={i} className="flex gap-4 rounded-2xl border border-slate-200 bg-white/80 p-5 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow">
              <div className="size-12 rounded-full bg-blue-50 flex items-center justify-center text-[#137FEC] shrink-0">
                <span className="material-symbols-outlined">{feature.icon}</span>
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="text-slate-900 text-base font-bold leading-tight">{feature.title}</h3>
                <p className="text-slate-500 text-sm">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );

  return (
    <AuthLayout decoration={Decoration} reverse>
        <div className="w-full max-w-md flex flex-col gap-8">
          <div className="flex items-center gap-3">
            <Logo />
          </div>
          
          <div className="flex flex-col gap-2">
            <h1 className="text-slate-900 text-3xl md:text-4xl font-black leading-tight tracking-tight">{t('create_account_title')}</h1>
            <p className="text-slate-500 text-base font-normal">
              {t('create_account_subtitle')}
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <Button variant="secondary" icon={<img src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png" alt="Google" className="w-5 h-5" />}>
               {t('sign_in_with_google')}
            </Button>
            
            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-slate-100"></div>
              <span className="flex-shrink-0 mx-4 text-[10px] font-bold text-slate-400 tracking-wider">{t('or_continue_with_email')}</span>
              <div className="flex-grow border-t border-slate-100"></div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && (
                <Alert type="error" className="mb-2">
                  {error}
                </Alert>
            )}
            <Input 
              label={t('full_name_label')}
              placeholder={t('full_name_placeholder')}
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Input 
              label={t('email_address_label')}
              type="email"
              autoComplete="email"
              placeholder={t('email_address_placeholder')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <div className="flex flex-col md:flex-row gap-4">
               <Input 
                  label={t('password_label')}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  containerClassName="flex-1"
                  placeholder="••••••••"
                  startIcon={<span className="material-symbols-outlined text-[20px]">lock</span>}
                  endIcon={
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="flex items-center cursor-pointer hover:text-slate-600 outline-none"
                    >
                      <span className="material-symbols-outlined text-slate-400 text-[20px]">
                        {showPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  }
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                 <Input 
                  label={t('confirm_password')}
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  containerClassName="flex-1"
                  placeholder="••••••••"
                  startIcon={<span className="material-symbols-outlined text-[20px]">lock</span>}
                  endIcon={
                    <button 
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="flex items-center cursor-pointer hover:text-slate-600 outline-none"
                    >
                      <span className="material-symbols-outlined text-slate-400 text-[20px]">
                        {showConfirmPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  }
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
            </div>
            
            <label className="flex items-start gap-3 mt-2 cursor-pointer group">
              <input type="checkbox" className="mt-1 size-5 rounded border-slate-200 text-[#137FEC] focus:ring-[#137FEC]" required />
              <p className="text-slate-500 text-xs leading-relaxed">
                {t('i_agree')} <a className="text-[#137FEC] font-bold hover:underline" href="#">{t('terms_service')}</a> e <a className="text-[#137FEC] font-bold hover:underline" href="#">{t('privacy_policy')}</a>.
              </p>
            </label>
            
            <Button type="submit" className="mt-4 shadow-lg shadow-blue-500/20" isLoading={loading} disabled={loading}>
              {t('create_account')}
            </Button>
          </form>

          <p className="text-center text-slate-500 text-sm">
            {t('already_have_account')} <Link to="/login" className="text-[#137FEC] font-bold hover:underline">{t('login_action')}</Link>
          </p>
        </div>
    </AuthLayout>
  );
};

export default Register;

