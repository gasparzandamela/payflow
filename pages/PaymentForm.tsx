
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { PaymentDetails } from '../types';

interface PaymentFormProps {
  onContinue: (details: PaymentDetails) => void;
  initialData: PaymentDetails;
}

interface FormErrors {
  entity?: string;
  reference?: string;
  amount?: string;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ onContinue, initialData }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<PaymentDetails>(initialData || {
    entity: '',
    reference: '',
    amount: ''
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isTouched, setIsTouched] = useState<{ [key: string]: boolean }>({});

  const validate = (name: string, value: string) => {
    let error = '';

    switch (name) {
      case 'entity':
        if (!value) error = 'Campo obrigatório';
        else if (!/^\d+$/.test(value)) error = 'Apenas números são permitidos';
        else if (value.length !== 5) error = 'A entidade deve ter exatamente 5 dígitos';
        break;
      case 'reference':
        const cleanRef = value.replace(/\s/g, '');
        if (!cleanRef) error = 'Campo obrigatório';
        else if (!/^\d+$/.test(cleanRef)) error = 'Apenas números são permitidos';
        else if (cleanRef.length !== 9) error = 'A referência deve ter exatamente 9 dígitos';
        break;
      case 'amount':
        const numericValue = parseFloat(value.replace(',', '.'));
        if (!value) error = 'Campo obrigatório';
        else if (isNaN(numericValue)) error = 'Insira um valor numérico válido';
        else if (numericValue <= 0) error = 'O montante deve ser maior que zero';
        break;
    }

    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
    if (isTouched[id]) {
      validate(id, value);
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setIsTouched(prev => ({ ...prev, [id]: true }));
    validate(id, value);
  };

  const isFormValid = 
    formData.entity && 
    formData.reference && 
    formData.amount && 
    !errors.entity && 
    !errors.reference && 
    !errors.amount;

  const handleContinue = () => {
    if (isFormValid) {
      onContinue(formData);
      navigate('/pay/confirm');
    }
  };

  return (
    <Layout title="Pagar">
      <div className="flex flex-col items-center justify-center min-h-[60vh] md:min-h-[70vh] py-6">
        <div className="w-full max-w-xl">
          <div className="mb-8 md:mb-12 text-center px-4">
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-slate-900 leading-tight">Pagamento Simples</h2>
            <p className="mt-3 text-slate-500 text-sm md:text-lg font-medium max-w-md mx-auto leading-relaxed">Insira os dados da factura para processar a sua mensalidade.</p>
          </div>
          
          <div className="rounded-[2.5rem] md:rounded-[3.5rem] border border-slate-100 bg-white p-6 md:p-14 shadow-2xl shadow-slate-200/60 relative overflow-hidden transition-all">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/50 rounded-full -mr-16 -mt-16 blur-3xl pointer-events-none"></div>
            
            <div className="flex flex-col gap-6 md:gap-8 relative z-10">
              
              {/* Campo Entidade */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest" htmlFor="entity">
                    Entidade
                  </label>
                  <span className="text-[10px] font-bold text-slate-300">5 DÍGITOS</span>
                </div>
                <div className="relative group">
                  <input 
                    className={`block w-full rounded-2xl border bg-slate-50/50 px-5 py-4.5 text-slate-900 font-bold placeholder-slate-300 focus:ring-4 transition-all outline-none ${
                      errors.entity 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-100' 
                        : 'border-slate-200 focus:border-[#137FEC] focus:ring-blue-50 group-hover:border-slate-300'
                    }`} 
                    id="entity"
                    placeholder="21423"
                    value={formData.entity}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    type="text" 
                    maxLength={5}
                  />
                  {errors.entity && (
                    <p className="mt-2 text-[11px] font-bold text-red-500 flex items-center gap-1.5 animate-in slide-in-from-top-1">
                      <span className="material-symbols-outlined text-[14px]">error</span>
                      {errors.entity}
                    </p>
                  )}
                </div>
              </div>

              {/* Campo Referência */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest" htmlFor="reference">
                    Referência
                  </label>
                  <span className="text-[10px] font-bold text-slate-300">9 DÍGITOS</span>
                </div>
                <div className="relative group">
                  <input 
                    className={`block w-full rounded-2xl border bg-slate-50/50 px-5 py-4.5 text-slate-900 font-bold placeholder-slate-300 focus:ring-4 transition-all outline-none ${
                      errors.reference 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-100' 
                        : 'border-slate-200 focus:border-[#137FEC] focus:ring-blue-50 group-hover:border-slate-300'
                    }`} 
                    id="reference" 
                    placeholder="123 456 789"
                    value={formData.reference}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    type="text" 
                  />
                  {errors.reference && (
                    <p className="mt-2 text-[11px] font-bold text-red-500 flex items-center gap-1.5 animate-in slide-in-from-top-1">
                      <span className="material-symbols-outlined text-[14px]">error</span>
                      {errors.reference}
                    </p>
                  )}
                </div>
              </div>

              {/* Campo Montante */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest" htmlFor="amount">
                    Montante
                  </label>
                  <span className="text-[10px] font-bold text-slate-300">VALOR EM MZN</span>
                </div>
                <div className="relative group">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-black text-sm pointer-events-none select-none">
                    MZN
                  </div>
                  <input 
                    className={`block w-full rounded-2xl border bg-slate-50/50 pl-16 pr-5 py-4.5 text-slate-900 font-black text-lg placeholder-slate-300 focus:ring-4 transition-all outline-none tabular-nums ${
                      errors.amount 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-100' 
                        : 'border-slate-200 focus:border-[#137FEC] focus:ring-blue-50 group-hover:border-slate-300'
                    }`} 
                    id="amount" 
                    placeholder="0,00"
                    value={formData.amount}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    type="text" 
                  />
                  {errors.amount && (
                    <p className="mt-2 text-[11px] font-bold text-red-500 flex items-center gap-1.5 animate-in slide-in-from-top-1">
                      <span className="material-symbols-outlined text-[14px]">error</span>
                      {errors.amount}
                    </p>
                  )}
                </div>
              </div>

              <button 
                onClick={handleContinue}
                disabled={!isFormValid}
                className={`mt-6 md:mt-10 flex w-full items-center justify-center rounded-[1.25rem] py-5 text-base md:text-lg font-black uppercase tracking-widest text-white transition-all shadow-2xl ${
                  isFormValid 
                    ? 'bg-[#137FEC] shadow-blue-500/30 hover:bg-blue-600 hover:shadow-blue-500/40 active:scale-[0.98]' 
                    : 'bg-slate-200 cursor-not-allowed shadow-none text-slate-400'
                }`}
              >
                Prosseguir
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PaymentForm;
