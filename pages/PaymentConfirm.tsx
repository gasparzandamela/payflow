

import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { PaymentDetails, PAYMENT_METHODS } from '../types';
import Card from '../components/Card';
import Button from '../components/Button';
import Logo from '../components/Logo';

interface PaymentConfirmProps {
  details: PaymentDetails;
  onConfirm: () => void;
}

const PaymentConfirm: React.FC<PaymentConfirmProps> = ({ details, onConfirm }) => {
  const navigate = useNavigate();
  const method = details.paymentMethod ? PAYMENT_METHODS[details.paymentMethod] : null;

  const handleConfirm = () => {
    onConfirm();
    navigate('/pay/success');
  };

  const isMobileMoney = details.paymentMethod === 'MPESA' || details.paymentMethod === 'EMOLA';

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-slate-50 overflow-x-hidden">
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-slate-200 bg-white/80 backdrop-blur-md px-10 py-4">
        <Logo size="md" />
      </header>
      
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-12">
        <Card className="w-full max-w-[480px] p-0 overflow-hidden shadow-2xl shadow-slate-200 ring-1 ring-slate-100">
          <div className="px-10 pt-10 pb-6 text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
              <span className="material-symbols-outlined text-4xl text-[#137FEC]">verified_user</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Confirmar Detalhes</h1>
            <p className="mt-2 text-sm text-slate-500 leading-relaxed font-medium">
              Verifique as informações antes de confirmar o pagamento.
            </p>
          </div>
          
          <div className="px-10 py-2">
            <div className="rounded-2xl bg-slate-50 border border-slate-100 p-8 space-y-6">
              {/* Method Header */}
              <div className="flex items-center gap-4 pb-6 border-b border-slate-200 border-dashed">
                 <div className="size-12 rounded-xl flex items-center justify-center text-white shrink-0" style={{ backgroundColor: method?.color }}>
                    <span className="material-symbols-outlined">{method?.icon}</span>
                 </div>
                 <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Método de Pagamento</p>
                    <p className="font-black text-slate-800 text-lg">{method?.name}</p>
                 </div>
              </div>

              {isMobileMoney ? (
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Número de Telefone</span>
                  <div className="mt-1 flex items-center gap-3">
                    <span className="material-symbols-outlined text-slate-400">contact_phone</span>
                    <span className="font-mono text-xl font-black text-slate-900 tracking-[0.2em]">+258 {details.phoneNumber}</span>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Entidade</span>
                    <div className="mt-1 flex items-center gap-3">
                      <span className="material-symbols-outlined text-slate-400">corporate_fare</span>
                      <span className="font-mono text-xl font-black text-slate-900 tracking-widest">{details.entity}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Referência</span>
                    <div className="mt-1 flex items-center gap-3">
                      <span className="material-symbols-outlined text-slate-400">qr_code</span>
                      <span className="font-mono text-xl font-black text-slate-900 tracking-widest">{details.reference}</span>
                    </div>
                  </div>
                </>
              )}
              
              <div className="flex items-center justify-between pt-6 border-t border-slate-200 border-dashed">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Valor Total</span>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-3xl font-black text-slate-900 tracking-tighter">{details.amount}</span>
                    <span className="text-lg font-bold text-slate-400">MZN</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-10 flex flex-col gap-4">
            <Button 
                onClick={handleConfirm}
                className="w-full py-5 rounded-2xl gap-2 shadow-xl shadow-blue-500/20 font-black uppercase tracking-widest group"
            >
                Confirmar e Finalizar
                <span className="material-symbols-outlined transition-transform duration-300 group-hover:translate-x-1">arrow_forward</span>
            </Button>
            
            <Link to="/pay" className="w-full">
                <Button variant="ghost" fullWidth className="text-slate-400 font-bold uppercase text-xs tracking-widest hover:text-slate-900">
                   Editar informações
                </Button>
            </Link>
          </div>
        </Card>
      </main>
      
      <footer className="w-full py-8 text-center text-sm text-slate-400 font-medium">
        <p>© 2026 PayFlow. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
};

export default PaymentConfirm;

