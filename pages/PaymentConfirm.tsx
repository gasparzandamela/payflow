

import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { PaymentDetails } from '../types';
import Card from '../components/Card';
import Button from '../components/Button';
import Logo from '../components/Logo';

interface PaymentConfirmProps {
  details: PaymentDetails;
  onConfirm: () => void;
}

const PaymentConfirm: React.FC<PaymentConfirmProps> = ({ details, onConfirm }) => {
  const navigate = useNavigate();

  const handleConfirm = () => {
    onConfirm();
    navigate('/pay/success');
  };

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
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Confirmar Pagamento</h1>
            <p className="mt-2 text-sm text-slate-500 leading-relaxed font-medium">
              Por favor, verifique os dados abaixo com atenção antes de finalizar a transação.
            </p>
          </div>
          
          <div className="px-10 py-2">
            <div className="rounded-2xl bg-slate-50 border border-slate-100 p-8 space-y-8">
              <div className="flex items-center justify-between border-b border-slate-200 pb-4 border-dashed">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Entidade</span>
                  <div className="mt-1 flex items-center gap-3">
                    <span className="material-symbols-outlined text-slate-400">corporate_fare</span>
                    <span className="font-mono text-xl font-black text-slate-900 tracking-widest">{details.entity || '21423'}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between border-b border-slate-200 pb-4 border-dashed">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Referência</span>
                  <div className="mt-1 flex items-center gap-3">
                    <span className="material-symbols-outlined text-slate-400">qr_code</span>
                    <span className="font-mono text-xl font-black text-slate-900 tracking-widest">{details.reference || '123 456 789'}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-2">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Montante Total</span>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-3xl font-black text-slate-900 tracking-tighter">{details.amount || '150,00'}</span>
                    <span className="text-lg font-bold text-slate-400">MZN</span>
                  </div>
                </div>
                <div className="size-14 items-center justify-center rounded-full bg-[#137FEC]/10 flex">
                  <span className="material-symbols-outlined text-[#137FEC] text-2xl">payments</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-10 flex flex-col gap-4">
            <Button 
                onClick={handleConfirm}
                className="w-full gap-2 shadow-lg shadow-blue-500/30 group"
                icon={<span className="material-symbols-outlined transition-transform duration-300 group-hover:translate-x-1">arrow_forward</span>}
            >
                Confirmar e Pagar
            </Button>
            
            <Link to="/pay" className="w-full">
                <Button variant="ghost" fullWidth className="text-slate-400 hover:text-slate-900">
                   Voltar para editar dados
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

