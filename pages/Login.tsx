
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User } from '../types';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('gaspar@exemplo.com');
  const [password, setPassword] = useState('********');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin({ name: 'Gaspar', email });
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex w-full">
      {/* Left Decoration Panel */}
      <div className="hidden lg:flex w-1/2 relative bg-[#137FEC]/5 overflow-hidden flex-col justify-between p-12">
        <div className="absolute inset-0 z-0">
          <div 
            className="w-full h-full bg-cover bg-center opacity-60" 
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1633156199268-dc80ef96700c?q=80&w=2000&auto=format&fit=crop')" }}
          ></div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#137FEC]/90 to-blue-900/40 mix-blend-multiply"></div>
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="size-8 bg-white rounded flex items-center justify-center text-[#137FEC]">
              <span className="material-symbols-outlined text-[20px] font-bold">payments</span>
            </div>
            <span className="text-white font-bold text-xl tracking-tight">PayFlow</span>
          </div>
        </div>
        <div className="relative z-10 flex gap-4 text-blue-200 text-sm font-medium">
          <span>© 2026 PayFlow Inc.</span>
          <a className="hover:text-white transition-colors" href="#">Política de Privacidade</a>
          <a className="hover:text-white transition-colors" href="#">Termos</a>
        </div>
      </div>

      {/* Right Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 md:p-12 lg:p-24 bg-white overflow-y-auto">
        <div className="w-full max-w-md space-y-8">
          <div className="lg:hidden flex justify-center mb-6">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-[#137FEC] rounded-lg flex items-center justify-center text-white">
                <span className="material-symbols-outlined text-[24px]">payments</span>
              </div>
              <span className="text-slate-900 font-bold text-2xl tracking-tight">PayFlow</span>
            </div>
          </div>
          
          <div className="text-center lg:text-left">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Bem-vindo de volta</h1>
            <p className="mt-2 text-slate-500">Por favor, insira seus dados para entrar.</p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium leading-6 text-slate-900" htmlFor="email">Endereço de E-mail</label>
                <div className="relative mt-2">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <span className="material-symbols-outlined text-slate-400 text-[20px]">mail</span>
                  </div>
                  <input 
                    className="block w-full rounded-xl border-0 py-3 pl-10 text-slate-900 ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-[#137FEC] sm:text-sm" 
                    id="email" 
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com" 
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium leading-6 text-slate-900" htmlFor="password">Senha</label>
                </div>
                <div className="relative mt-2">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <span className="material-symbols-outlined text-slate-400 text-[20px]">lock</span>
                  </div>
                  <input 
                    className="block w-full rounded-xl border-0 py-3 pl-10 pr-10 text-slate-900 ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-[#137FEC] sm:text-sm" 
                    id="password" 
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Insira sua senha" 
                    required
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer hover:text-slate-600 outline-none"
                  >
                    <span className="material-symbols-outlined text-slate-400 text-[20px]">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
                <div className="flex justify-end mt-2">
                  <a className="text-sm font-medium text-[#137FEC] hover:text-blue-600" href="#">Esqueceu a Senha?</a>
                </div>
              </div>
            </div>

            <div>
              <button 
                type="submit"
                className="flex w-full justify-center rounded-xl bg-[#137FEC] px-3 py-3.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-blue-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#137FEC] transition-all"
              >
                Entrar
              </button>
            </div>
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
            <button className="flex w-full items-center justify-center gap-3 rounded-xl bg-white px-3 py-2.5 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 hover:bg-slate-50 transition-colors">
               <img src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png" className="w-5 h-5" alt="Google" />
               <span>Google</span>
            </button>
            <button className="flex w-full items-center justify-center gap-3 rounded-xl bg-white px-3 py-2.5 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 hover:bg-slate-50 transition-colors">
               <span className="material-symbols-outlined text-[20px]">apple</span>
               <span>Apple</span>
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-slate-500">
              Não tem uma conta? 
              <Link to="/register" className="ml-1 font-semibold text-[#137FEC] hover:text-blue-600 transition-colors">Cadastre-se</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
