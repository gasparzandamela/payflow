

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Layout from '../components/Layout';
import { PaymentDetails, PaymentMethodType, PAYMENT_METHODS } from '../types';
import Input from '../components/Input';
import Button from '../components/Button';
import PaymentMethodSelector from '../components/PaymentMethodSelector';

interface PaymentFormProps {
  onContinue: (details: PaymentDetails) => void;
  initialData: PaymentDetails;
}

interface FormErrors {
  entity?: string;
  reference?: string;
  amount?: string;
  paymentMethod?: string;
  phoneNumber?: string;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ onContinue, initialData }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const chargeFromState = location.state?.charge;

  const [step, setStep] = useState<1 | 2>(1); // 1 = Método, 2 = Dados/Confirmação
  const [formData, setFormData] = useState<PaymentDetails>({
    entity: '',
    reference: '',
    amount: chargeFromState?.amount?.toString() || initialData?.amount || '',
    paymentMethod: undefined,
    phoneNumber: '',
    chargeId: chargeFromState?.id
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isGenerated, setIsGenerated] = useState(false);

  const validatePhone = (method: PaymentMethodType, value: string) => {
    const cleanPhone = value.replace(/\s/g, '');
    if (!cleanPhone) return 'Campo obrigatório';
    if (!/^\d{9}$/.test(cleanPhone)) return 'O número deve ter 9 dígitos';
    
    if (method === 'MPESA') {
      if (!/^8[45]/.test(cleanPhone)) return 'M-Pesa deve começar com 84 ou 85';
    } else if (method === 'EMOLA') {
      if (!/^8[67]/.test(cleanPhone)) return 'e-Mola deve começar com 86 ou 87';
    }
    return '';
  };

  const handlePaymentMethodSelect = (method: PaymentMethodType) => {
    setFormData(prev => ({ ...prev, paymentMethod: method }));
    setErrors(prev => ({ ...prev, paymentMethod: undefined }));
    setIsGenerated(false);
  };

  const generateBankData = () => {
    // Simulação de geração de dados bancários
    setFormData(prev => ({
      ...prev,
      entity: '21423',
      reference: Math.floor(100000000 + Math.random() * 900000000).toString()
    }));
    setIsGenerated(true);
  };

  const handleContinue = () => {
    if (step === 1) {
      if (!formData.paymentMethod) {
        setErrors({ paymentMethod: 'Seleccione um método' });
        return;
      }
      setStep(2);
    } else {
        // Validações antes de finalizar
        let newErrors: FormErrors = {};
        
        // Validar montante se não veio de uma cobrança
        if (!chargeFromState && (!formData.amount || parseFloat(formData.amount) <= 0)) {
            newErrors.amount = 'Insira um valor válido';
        }

        // Validar telefone se for Mobile Money
        if (formData.paymentMethod === 'MPESA' || formData.paymentMethod === 'EMOLA') {
            const phoneErr = validatePhone(formData.paymentMethod, formData.phoneNumber || '');
            if (phoneErr) newErrors.phoneNumber = phoneErr;
        }

        // Validar se gerou dados para transferência
        if (formData.paymentMethod === 'BANK_TRANSFER' && !isGenerated) {
            alert('Por favor, gere os dados de pagamento primeiro.');
            return;
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        onContinue(formData);
        navigate('/pay/confirm');
    }
  };

  const isMobileMoney = formData.paymentMethod === 'MPESA' || formData.paymentMethod === 'EMOLA';
  const isBankTransfer = formData.paymentMethod === 'BANK_TRANSFER';

  return (
    <Layout title="Pagar">
      <div className="flex flex-col items-center justify-center min-h-[60vh] py-6">
        <div className="w-full max-w-2xl px-4">
          {/* Header */}
          <div className="mb-10 text-center">
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-slate-900 leading-tight">
              {step === 1 ? 'Método de Pagamento' : 'Confirmar Detalhes'}
            </h2>
            <p className="mt-3 text-slate-500 font-medium max-w-md mx-auto">
              {step === 1 
                ? 'Escolha como pretende efectuar o pagamento da sua mensalidade.'
                : 'Preencha as informações necessárias para concluir.'
              }
            </p>
          </div>

          <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 md:p-12 shadow-2xl shadow-slate-200 relative overflow-hidden">
            {step === 1 ? (
              <div className="space-y-8">
                <PaymentMethodSelector
                  selected={formData.paymentMethod}
                  onSelect={handlePaymentMethodSelect}
                  showManualMethods={false}
                />
                {errors.paymentMethod && <p className="text-red-500 text-xs font-bold text-center">{errors.paymentMethod}</p>}
                
                <Button onClick={handleContinue} className="w-full py-5 rounded-2xl font-black uppercase tracking-widest text-lg">
                  Próximo Passo
                </Button>
              </div>
            ) : (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
                {/* Visual Feedback of Selection */}
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                   <div className="size-12 rounded-xl flex items-center justify-center text-white" style={{ backgroundColor: PAYMENT_METHODS[formData.paymentMethod!].color }}>
                      <span className="material-symbols-outlined">{PAYMENT_METHODS[formData.paymentMethod!].icon}</span>
                   </div>
                   <div>
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Método Seleccionado</p>
                      <p className="font-black text-slate-800 text-lg">{PAYMENT_METHODS[formData.paymentMethod!].name}</p>
                   </div>
                   <button onClick={() => setStep(1)} className="ml-auto text-[#137FEC] font-black text-xs uppercase hover:underline">Alterar</button>
                </div>

                {/* Amount Handling */}
                <div className="space-y-2">
                   <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Valor a Pagar (MZN)</label>
                   <Input 
                     type="text" 
                     value={formData.amount} 
                     onChange={(e) => setFormData({...formData, amount: e.target.value})} 
                     readOnly={!!chargeFromState}
                     className={`text-2xl font-black tracking-tight ${chargeFromState ? 'bg-slate-50 text-slate-400' : ''}`}
                     error={errors.amount}
                   />
                   {chargeFromState && <p className="text-[10px] text-slate-400 font-bold px-1 italic">Este valor é referente à cobrança: {chargeFromState.description}</p>}
                </div>

                {/* Mobile Money Inputs */}
                {isMobileMoney && (
                   <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Número de Telefone</label>
                      <Input 
                        type="tel" 
                        placeholder="84 000 0000" 
                        value={formData.phoneNumber} 
                        onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                        error={errors.phoneNumber}
                        className="text-lg font-bold"
                        startIcon={<span className="text-slate-400 font-bold">+258</span>}
                      />
                      <p className="text-[10px] text-slate-400 font-bold px-1">
                        Será enviado um pedido USSD para o seu telemóvel para confirmar o PIN.
                      </p>
                   </div>
                )}

                {/* Bank Transfer Inputs */}
                {isBankTransfer && (
                   <div className="space-y-6 animate-in fade-in slide-in-from-top-2">
                      {!isGenerated ? (
                         <div className="py-6 text-center">
                            <p className="text-sm text-slate-500 mb-6 font-medium">Os dados de pagamento (Entidade e Referência) serão gerados agora para este valor.</p>
                            <Button onClick={generateBankData} variant="secondary" className="w-full py-4 border-2 border-slate-200 rounded-2xl font-black uppercase tracking-widest">
                               <span className="material-symbols-outlined text-lg mr-2">analytics</span>
                               Gerar Dados de Pagamento
                            </Button>
                         </div>
                      ) : (
                         <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100">
                               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Entidade</p>
                               <p className="text-xl font-black text-slate-800 tracking-widest">{formData.entity}</p>
                            </div>
                            <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100">
                               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Referência</p>
                               <p className="text-xl font-black text-slate-800 tracking-widest">{formData.reference}</p>
                            </div>
                         </div>
                      )}
                   </div>
                )}

                <div className="flex gap-4 pt-4">
                   <Button onClick={() => setStep(1)} variant="secondary" className="flex-1 py-5 rounded-2xl font-black uppercase tracking-widest">
                      Voltar
                   </Button>
                   <Button onClick={handleContinue} className="flex-1 py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl">
                      Próximo
                   </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PaymentForm;

