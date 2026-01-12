

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
    if (!formData.paymentMethod) {
      setErrors({ paymentMethod: 'Seleccione um método de pagamento' });
      return;
    }

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
  };

  const isMobileMoney = formData.paymentMethod === 'MPESA' || formData.paymentMethod === 'EMOLA';
  const isBankTransfer = formData.paymentMethod === 'BANK_TRANSFER';

  return (
    <Layout title="Efectuar Pagamento">
      <div className="flex flex-col items-center justify-center min-h-[70vh] py-12">
        <div className="w-full max-w-2xl px-4">
          {/* Header */}
          <div className="mb-10 text-center">
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-slate-900 leading-tight">
              Pagar Mensalidade
            </h2>
            <p className="mt-3 text-slate-500 font-medium max-w-md mx-auto">
              Escolha um método e preencha os detalhes para completar o seu pagamento com segurança.
            </p>
          </div>

          <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 md:p-12 shadow-2xl shadow-slate-200 relative overflow-hidden">
            <div className="space-y-10">
              {/* Method Selector - Always Visible */}
              <div className="space-y-4">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] pl-1">Escolha o Método</label>
                <PaymentMethodSelector
                  selected={formData.paymentMethod}
                  onSelect={handlePaymentMethodSelect}
                  showManualMethods={false}
                />
                {errors.paymentMethod && <p className="text-red-500 text-xs font-bold text-center mt-2">{errors.paymentMethod}</p>}
              </div>

              {/* Dynamic Fields Section */}
              {formData.paymentMethod && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="h-px bg-slate-50 w-full" />
                  
                  {/* Amount Handling */}
                  <div className="space-y-2">
                     <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] pl-1">Valor a Pagar (MZN)</label>
                     <Input 
                       type="text" 
                       value={formData.amount} 
                       onChange={(e) => setFormData({...formData, amount: e.target.value})} 
                       readOnly={!!chargeFromState}
                       className={`text-2xl font-black tracking-tight ${chargeFromState ? 'bg-slate-50 text-slate-400' : ''}`}
                       error={errors.amount}
                     />
                     {chargeFromState && <p className="text-[10px] text-slate-400 font-bold px-1 italic">Mensalidade: {chargeFromState.description}</p>}
                  </div>

                  {/* Mobile Money Inputs */}
                  {isMobileMoney && (
                     <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                        <div className="space-y-2">
                          <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] pl-1">Número de Telefone</label>
                          <Input 
                            type="tel" 
                            placeholder="84 000 0000" 
                            value={formData.phoneNumber} 
                            onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                            error={errors.phoneNumber}
                            className="text-lg font-bold"
                            startIcon={<span className="text-slate-400 font-bold">+258</span>}
                          />
                        </div>
                        <div className="bg-blue-50/50 p-4 rounded-2xl flex items-start gap-3">
                           <span className="material-symbols-outlined text-blue-500 text-lg mt-0.5">info</span>
                           <p className="text-[11px] text-blue-700 font-black leading-relaxed uppercase tracking-tight">
                              Será enviado um pedido USSD para o seu telemóvel para confirmar o PIN de transacção.
                           </p>
                        </div>
                     </div>
                  )}

                  {/* Bank Transfer Inputs */}
                  {isBankTransfer && (
                     <div className="space-y-6 animate-in fade-in slide-in-from-top-2">
                        {!isGenerated ? (
                           <div className="py-2">
                              <Button onClick={generateBankData} className="w-full py-4.5 rounded-2xl font-black uppercase tracking-widest bg-slate-900 shadow-xl">
                                 <span className="material-symbols-outlined text-lg mr-2">analytics</span>
                                 Gerar Dados Bancários
                              </Button>
                              <p className="text-[10px] text-center text-slate-400 mt-4 font-bold uppercase tracking-wider">A Entidade e Referência serão geradas exclusivamente para este valor.</p>
                           </div>
                        ) : (
                           <div className="grid grid-cols-2 gap-4 animate-in zoom-in-95 duration-300">
                              <div className="p-5 rounded-[1.5rem] bg-blue-50/50 border-2 border-white shadow-inner flex flex-col items-center">
                                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Entidade</p>
                                 <p className="text-2xl font-black text-slate-800 tracking-[0.2em]">{formData.entity}</p>
                              </div>
                              <div className="p-5 rounded-[1.5rem] bg-blue-50/50 border-2 border-white shadow-inner flex flex-col items-center">
                                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Referência</p>
                                 <p className="text-2xl font-black text-slate-800 tracking-[0.2em]">{formData.reference}</p>
                              </div>
                           </div>
                        )}
                     </div>
                  )}

                  <div className="pt-6">
                    <Button onClick={handleContinue} className="w-full py-5 rounded-2xl font-black uppercase tracking-widest text-lg shadow-2xl flex items-center justify-center gap-3">
                       <span>Confirmar Pagamento</span>
                       <span className="material-symbols-outlined font-black">arrow_forward</span>
                    </Button>
                  </div>
                </div>
              )}

              {!formData.paymentMethod && (
                <div className="py-12 flex flex-col items-center justify-center text-slate-300">
                   <span className="material-symbols-outlined text-5xl mb-4">touch_app</span>
                   <p className="font-black text-xs uppercase tracking-[0.2em]">Selecione um método acima</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PaymentForm;

