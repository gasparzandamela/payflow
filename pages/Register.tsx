
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User } from '../types';

interface RegisterProps {
  onRegister: (user: User) => void;
}

const Register: React.FC<RegisterProps> = ({ onRegister }) => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onRegister({ name: name || 'Usuário', email });
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex w-full">
      {/* Left Form Panel */}
      <div className="flex flex-col flex-1 justify-center items-center p-6 md:p-12 lg:p-16 bg-white w-full max-w-2xl xl:max-w-3xl border-r border-slate-100">
        <div className="w-full max-w-md flex flex-col gap-8">
          <div className="flex items-center gap-3">
            <div className="size-8 rounded bg-[#137FEC] flex items-center justify-center text-white">
              <span className="material-symbols-outlined text-xl">payments</span>
            </div>
            <h2 className="text-slate-900 text-xl font-bold tracking-tight">PayFlow</h2>
          </div>
          
          <div className="flex flex-col gap-2">
            <h1 className="text-slate-900 text-3xl md:text-4xl font-black leading-tight tracking-tight">Crie sua conta</h1>
            <p className="text-slate-500 text-base font-normal">
              Comece a gerenciar seus pagamentos com segurança hoje.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <button className="flex w-full items-center justify-center gap-3 rounded-xl h-12 px-4 bg-white border border-slate-200 text-slate-900 text-sm font-bold hover:bg-slate-50 transition-colors">
              <img src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png" alt="Google" className="w-5 h-5" />
              <span>Entrar com Google</span>
            </button>
            
            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-slate-100"></div>
              <span className="flex-shrink-0 mx-4 text-[10px] font-bold text-slate-400 tracking-wider">OU CONTINUE COM E-MAIL</span>
              <div className="flex-grow border-t border-slate-100"></div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <label className="flex flex-col gap-1.5 w-full">
              <p className="text-slate-900 text-sm font-medium">Nome Completo</p>
              <input 
                className="w-full rounded-xl border border-slate-200 bg-white h-12 px-4 text-sm focus:ring-2 focus:ring-[#137FEC]/20 focus:border-[#137FEC] transition-all" 
                placeholder="ex: João Silva" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </label>
            <label className="flex flex-col gap-1.5 w-full">
              <p className="text-slate-900 text-sm font-medium">Endereço de E-mail</p>
              <input 
                className="w-full rounded-xl border border-slate-200 bg-white h-12 px-4 text-sm focus:ring-2 focus:ring-[#137FEC]/20 focus:border-[#137FEC] transition-all" 
                placeholder="nome@exemplo.com" 
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </label>
            <div className="flex flex-col md:flex-row gap-4">
              <label className="flex flex-col gap-1.5 flex-1">
                <p className="text-slate-900 text-sm font-medium">Senha</p>
                <div className="relative">
                  <input 
                    className="w-full rounded-xl border border-slate-200 bg-white h-12 px-4 text-sm pr-10 focus:ring-2 focus:ring-[#137FEC]/20 focus:border-[#137FEC] transition-all" 
                    placeholder="••••••••" 
                    type={showPassword ? 'text' : 'password'}
                    required
                  />
                  <button 
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 outline-none" 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </label>
              <label className="flex flex-col gap-1.5 flex-1">
                <p className="text-slate-900 text-sm font-medium">Confirmar Senha</p>
                <div className="relative">
                  <input 
                    className="w-full rounded-xl border border-slate-200 bg-white h-12 px-4 text-sm pr-10 focus:ring-2 focus:ring-[#137FEC]/20 focus:border-[#137FEC] transition-all" 
                    placeholder="••••••••" 
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                  />
                  <button 
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 outline-none" 
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {showConfirmPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </label>
            </div>
            
            <label className="flex items-start gap-3 mt-2 cursor-pointer group">
              <input type="checkbox" className="mt-1 size-5 rounded border-slate-200 text-[#137FEC] focus:ring-[#137FEC]" required />
              <p className="text-slate-500 text-xs leading-relaxed">
                Concordo com os <a className="text-[#137FEC] font-bold hover:underline" href="#">Termos de Serviço</a> e <a className="text-[#137FEC] font-bold hover:underline" href="#">Política de Privacidade</a>.
              </p>
            </label>
            
            <button className="mt-4 w-full rounded-xl h-12 bg-[#137FEC] hover:bg-blue-600 text-white font-bold transition-all shadow-lg shadow-blue-500/20">
              Criar Conta
            </button>
          </form>

          <p className="text-center text-slate-500 text-sm">
            Já tem uma conta? <Link to="/login" className="text-[#137FEC] font-bold hover:underline">Entrar</Link>
          </p>
        </div>
      </div>

      {/* Right Info Panel */}
      <div className="hidden lg:flex flex-1 relative bg-slate-50 items-center justify-center p-12 overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-40 bg-[radial-gradient(#137fec_1px,transparent_1px)] [background-size:20px_20px]"></div>
        <div className="relative z-10 w-full max-w-lg flex flex-col gap-10">
          <div className="flex flex-col gap-4">
            <h2 className="text-slate-900 tracking-tight text-3xl font-bold leading-tight">
              Segurança bancária para seus pagamentos
            </h2>
            <p className="text-slate-500 text-lg font-normal">
              Junte-se a milhões de usuários que confiam no PayFlow para suas transações financeiras.
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
      </div>
    </div>
  );
};

export default Register;
