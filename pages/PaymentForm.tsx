

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const [step, setStep] = useState<1 | 2>(1); // 1 = Dados, 2 = Método
  const [formData, setFormData] = useState<PaymentDetails>({
    ...initialData,
    entity: initialData?.entity || '',
    reference: initialData?.reference || '',
    amount: initialData?.amount || '',
    paymentMethod: initialData?.paymentMethod,
    phoneNumber: initialData?.phoneNumber || ''
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
      case 'phoneNumber':
        if (formData.paymentMethod && ['MPESA', 'EMOLA'].includes(formData.paymentMethod)) {
          if (!value) error = 'Número de telefone obrigatório';
          else if (!/^8[2-7]\d{7}$/.test(value.replace(/\s/g, ''))) {
            error = 'Número inválido (ex: 84 123 4567)';
          }
        }
        break;
    }

    setErrors(prev => ({ ...prev, [name]: error }));
    return error === '';
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

  const handlePaymentMethodSelect = (method: PaymentMethodType) => {
    setFormData(prev => ({ ...prev, paymentMethod: method }));
    setErrors(prev => ({ ...prev, paymentMethod: undefined }));
  };

  const isStep1Valid = 
    formData.entity && 
    formData.reference && 
    formData.amount && 
    !errors.entity && 
    !errors.reference && 
    !errors.amount;

  const isStep2Valid = () => {
    if (!formData.paymentMethod) return false;
    if (['MPESA', 'EMOLA'].includes(formData.paymentMethod)) {
      return formData.phoneNumber && !errors.phoneNumber;
    }
    return true;
  };

  const handleNext = () => {
    if (step === 1 && isStep1Valid) {
      setStep(2);
    } else if (step === 2 && isStep2Valid()) {
      onContinue(formData);
      navigate('/pay/confirm');
    }
  };

  const handleBack = () => {
    if (step === 2) setStep(1);
  };

  const requiresPhoneNumber = formData.paymentMethod && ['MPESA', 'EMOLA'].includes(formData.paymentMethod);

  return (
    <Layout title="Pagar">
      <div className="flex flex-col items-center justify-center min-h-[60vh] md:min-h-[70vh] py-6">
        <div className="w-full max-w-2xl">
          {/* Header */}
          <div className="mb-8 md:mb-12 text-center px-4">
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-slate-900 leading-tight">
              {step === 1 ? 'Dados do Pagamento' : 'Método de Pagamento'}
            </h2>
            <p className="mt-3 text-slate-500 text-sm md:text-lg font-medium max-w-md mx-auto leading-relaxed">
              {step === 1 
                ? 'Insira os dados da factura para processar a sua mensalidade.'
                : 'Escolha como pretende efectuar o pagamento.'
              }
            </p>
            
            {/* Progress Indicator */}
            <div className="flex items-center justify-center gap-3 mt-6">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                step === 1 ? 'bg-[#137FEC] text-white' : 'bg-slate-100 text-slate-400'
              }`}>
                <span className="material-symbols-outlined text-sm">receipt</span>
                Dados
              </div>
              <span className="material-symbols-outlined text-slate-300">arrow_forward</span>
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                step === 2 ? 'bg-[#137FEC] text-white' : 'bg-slate-100 text-slate-400'
              }`}>
                <span className="material-symbols-outlined text-sm">credit_card</span>
                Método
              </div>
            </div>
          </div>
          
          <div className="rounded-[2.5rem] md:rounded-[3.5rem] border border-slate-100 bg-white p-6 md:p-14 shadow-2xl shadow-slate-200/60 relative overflow-hidden transition-all">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/50 rounded-full -mr-16 -mt-16 blur-3xl pointer-events-none"></div>
            
            <div className="flex flex-col gap-6 md:gap-8 relative z-10">
              
              {/* STEP 1: Dados */}
              {step === 1 && (
                <>
                  {/* Campo Entidade */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between pointer-events-none">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest" htmlFor="entity">
                        Entidade
                      </label>
                      <span className="text-[10px] font-bold text-slate-300">5 DÍGITOS</span>
                    </div>
                    <Input
                        id="entity"
                        placeholder="21423"
                        value={formData.entity}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        type="text"
                        maxLength={5}
                        error={errors.entity}
                        className="font-bold text-lg py-4"
                    />
                  </div>

                  {/* Campo Referência */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between pointer-events-none">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest" htmlFor="reference">
                        Referência
                      </label>
                      <span className="text-[10px] font-bold text-slate-300">9 DÍGITOS</span>
                    </div>
                    <Input
                        id="reference"
                        placeholder="123 456 789"
                        value={formData.reference}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        type="text"
                        error={errors.reference}
                        className="font-bold text-lg py-4"
                    />
                  </div>

                  {/* Campo Montante */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between pointer-events-none">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest" htmlFor="amount">
                        Montante
                      </label>
                      <span className="text-[10px] font-bold text-slate-300">VALOR EM MZN</span>
                    </div>
                    <Input
                        id="amount"
                        placeholder="0,00"
                        value={formData.amount}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        type="text"
                        error={errors.amount}
                        startIcon={<span className="text-slate-400 font-black text-sm">MZN</span>}
                        className="font-black text-lg py-4"
                    />
                  </div>
                </>
              )}

              {/* STEP 2: Método de Pagamento */}
              {step === 2 && (
                <>
                  <PaymentMethodSelector
                    selected={formData.paymentMethod}
                    onSelect={handlePaymentMethodSelect}
                    showManualMethods={true}
                  />

                  {/* Campo de telefone para M-Pesa/e-Mola */}
                  {requiresPhoneNumber && (
                    <div className="space-y-2 mt-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                      <div className="flex items-center justify-between pointer-events-none">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest" htmlFor="phoneNumber">
                          Número {formData.paymentMethod === 'MPESA' ? 'M-Pesa' : 'e-Mola'}
                        </label>
                        <span className="text-[10px] font-bold text-slate-300">9 DÍGITOS</span>
                      </div>
                      <Input
                          id="phoneNumber"
                          placeholder="84 123 4567"
                          value={formData.phoneNumber || ''}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          type="tel"
                          error={errors.phoneNumber}
                          startIcon={<span className="text-slate-400 font-bold text-sm">+258</span>}
                          className="font-bold text-lg py-4"
                      />
                    </div>
                  )}

                  {/* Resumo do pagamento */}
                  {formData.paymentMethod && (
                    <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-slate-50 to-blue-50/30 border border-slate-100">
                      <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Resumo</h4>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-slate-400 text-xs">Entidade</p>
                          <p className="font-bold text-slate-800">{formData.entity}</p>
                        </div>
                        <div>
                          <p className="text-slate-400 text-xs">Referência</p>
                          <p className="font-bold text-slate-800">{formData.reference}</p>
                        </div>
                        <div>
                          <p className="text-slate-400 text-xs">Montante</p>
                          <p className="font-black text-slate-900">{formData.amount} MZN</p>
                        </div>
                        <div>
                          <p className="text-slate-400 text-xs">Método</p>
                          <p className="font-bold text-slate-800 flex items-center gap-1">
                            <span 
                              className="material-symbols-outlined text-sm"
                              style={{ color: PAYMENT_METHODS[formData.paymentMethod].color }}
                            >
                              {PAYMENT_METHODS[formData.paymentMethod].icon}
                            </span>
                            {PAYMENT_METHODS[formData.paymentMethod].name}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Botões de navegação */}
              <div className="flex gap-4 mt-6 md:mt-10">
                {step === 2 && (
                  <Button
                    onClick={handleBack}
                    variant="secondary"
                    className="flex-1 py-5 rounded-[1.25rem] text-base font-bold"
                  >
                    <span className="material-symbols-outlined text-lg mr-2">arrow_back</span>
                    Voltar
                  </Button>
                )}
                
                <Button
                  onClick={handleNext}
                  disabled={step === 1 ? !isStep1Valid : !isStep2Valid()}
                  variant={(step === 1 ? isStep1Valid : isStep2Valid()) ? 'primary' : 'secondary'}
                  className={`flex-1 py-5 rounded-[1.25rem] text-base md:text-lg font-black uppercase tracking-widest shadow-2xl ${
                       (step === 1 ? !isStep1Valid : !isStep2Valid()) ? 'bg-slate-200 text-slate-400 shadow-none border-0' : ''
                  }`}
                >
                  {step === 1 ? 'Escolher Método' : 'Confirmar Pagamento'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PaymentForm;

