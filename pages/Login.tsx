

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User } from '../types';
import AuthLayout from '../components/AuthLayout';
import Input from '../components/Input';
import Button from '../components/Button';
import Logo from '../components/Logo';
import { supabase } from '../supabaseClient';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || result.message || 'Falha na autenticação');
      }

      if (result.user) {
        // App.tsx auth observer won't work automatically now because we aren't using Supabase Auth client state
        // We might need to refresh the page or call a callback
        onLogin({
          name: result.user.user_metadata?.name || result.user.email?.split('@')[0] || 'Usuário',
          email: result.user.email || '',
        });
        navigate('/dashboard');
      }

    } catch (err: any) {
      setError(err.message || 'Erro ao fazer login.');
    } finally {
      setLoading(false);
    }
  };

  const Decoration = (
    <>
      <div className="absolute inset-0 z-0">
        <div 
          className="w-full h-full bg-cover bg-center opacity-60" 
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1633156199268-dc80ef96700c?q=80&w=2000&auto=format&fit=crop')" }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#137FEC]/90 to-blue-900/40 mix-blend-multiply"></div>
      </div>
      <div className="relative z-10">
        <Logo white variant="full" size="lg" className="hover:opacity-100" />
      </div>
      <div className="relative z-10 flex gap-4 text-blue-200 text-sm font-medium">
        <span>© 2026 PayFlow Inc.</span>
        <a className="hover:text-white transition-colors" href="#">Política de Privacidade</a>
        <a className="hover:text-white transition-colors" href="#">Termos</a>
      </div>
    </>
  );

  return (
    <AuthLayout decoration={Decoration}>
          <div className="w-full max-w-md space-y-8">
            <div className="lg:hidden flex justify-center mb-6">
               <Logo />
            </div>
            
            <div className="text-center lg:text-left">
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">Bem-vindo de volta</h1>
              <p className="mt-2 text-slate-500">Por favor, insira seus dados para entrar.</p>
            </div>
  
            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
              {error && (
                <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg">
                  {error}
                </div>
              )}
              <div className="space-y-4">
                  <Input 
                    label="Endereço de E-mail"
                    id="email"
                    type="email"
                    startIcon={<span className="material-symbols-outlined text-[20px]">mail</span>}
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
  
                  <div>
                    <Input 
                      label="Senha"
                      id="password"
                      type={showPassword ? 'text' : 'password'}
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
                      placeholder="Insira sua senha"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <div className="flex justify-end mt-2">
                       <Link className="text-sm font-medium text-[#137FEC] hover:text-blue-600" to="#">Esqueceu a Senha?</Link>
                    </div>
                  </div>
              </div>
  
              <Button type="submit" fullWidth isLoading={loading} disabled={loading}>
                Entrar
              </Button>
            </form>
  
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-100"></div>
              </div>
              <div className="relative flex justify-center text-sm font-medium leading-6">
                <span className="bg-white px-4 text-slate-500">Ou continue com</span>
              </div>
            </div>
  
            <div className="grid grid-cols-2 gap-4">
              <Button variant="secondary" icon={<img src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png" className="w-5 h-5" alt="Google" />}>
                 Google
              </Button>
              <Button variant="secondary" icon={<span className="material-symbols-outlined text-[20px]">apple</span>}>
                 Apple
              </Button>
            </div>
  
            <div className="text-center">
              <p className="text-sm text-slate-500">
                Não tem uma conta? 
                <Link to="/register" className="ml-1 font-semibold text-[#137FEC] hover:text-blue-600 transition-colors">Cadastre-se</Link>
              </p>
            </div>
          </div>
    </AuthLayout>
  );
};

export default Login;

