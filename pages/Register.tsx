

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User } from '../types';
import AuthLayout from '../components/AuthLayout';
import Input from '../components/Input';
import Button from '../components/Button';
import Logo from '../components/Logo';
import { supabase } from '../supabaseClient';

interface RegisterProps {
  onRegister: (user: User) => void;
}

const Register: React.FC<RegisterProps> = ({ onRegister }) => {
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
        setError("As senhas não coincidem");
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
        throw new Error(result.error || result.message || 'Falha ao criar conta');
      }

      if (result.user) {
         if (result.message === 'Check your email') {
             alert('Conta criada! Por favor, verifique seu e-mail para confirmar a conta.');
             navigate('/login');
         } else {
             // Auto-logged in
             onRegister({
               name: result.user.user_metadata?.name || result.user.email?.split('@')[0] || 'Usuário',
               email: result.user.email || '',
             });
             navigate('/dashboard');
         }
      }

    } catch (err: any) {
      setError(err.message || 'Erro ao criar conta.');
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
            Segurança bancária para seus pagamentos
          </h2>
          <p className="text-slate-500 text-lg font-normal">
            Junte-se a milhões de usuários que confiam no EduPay para suas transações financeiras.
          </p>
        </div>
        
        <div className="grid grid-cols-1 gap-4">
          {[
            { title: 'Criptografia de Ponta a Ponta', desc: 'Seus dados são criptografados usando protocolos padrão da indústria.', icon: 'lock' },
            { title: 'Proteção contra Fraude', desc: 'Sistemas de monitoramento em tempo real para detectar atividades suspeitas.', icon: 'shield' },
            { title: 'Suporte Dedicado 24/7', desc: 'Nossa equipe de especialistas está sempre disponível para ajudá-lo.', icon: 'support_agent' }
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
            <h1 className="text-slate-900 text-3xl md:text-4xl font-black leading-tight tracking-tight">Crie sua conta</h1>
            <p className="text-slate-500 text-base font-normal">
              Comece a gerenciar seus pagamentos com segurança hoje.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <Button variant="secondary" icon={<img src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png" alt="Google" className="w-5 h-5" />}>
               Entrar com Google
            </Button>
            
            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-slate-100"></div>
              <span className="flex-shrink-0 mx-4 text-[10px] font-bold text-slate-400 tracking-wider">OU CONTINUE COM E-MAIL</span>
              <div className="flex-grow border-t border-slate-100"></div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && (
                <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg">
                  {error}
                </div>
            )}
            <Input 
              label="Nome Completo"
              placeholder="ex: João Silva"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Input 
              label="Endereço de E-mail"
              type="email"
              autoComplete="email"
              placeholder="nome@exemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <div className="flex flex-col md:flex-row gap-4">
               <Input 
                  label="Senha"
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
                  label="Confirmar Senha"
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
                Concordo com os <a className="text-[#137FEC] font-bold hover:underline" href="#">Termos de Serviço</a> e <a className="text-[#137FEC] font-bold hover:underline" href="#">Política de Privacidade</a>.
              </p>
            </label>
            
            <Button type="submit" className="mt-4 shadow-lg shadow-blue-500/20" isLoading={loading} disabled={loading}>
              Criar Conta
            </Button>
          </form>

          <p className="text-center text-slate-500 text-sm">
            Já tem uma conta? <Link to="/login" className="text-[#137FEC] font-bold hover:underline">Entrar</Link>
          </p>
        </div>
    </AuthLayout>
  );
};

export default Register;

