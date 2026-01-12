/**
 * Componente de Selecção de Método de Pagamento
 * Permite ao estudante escolher como pretende pagar
 */

import React from 'react';
import { PaymentMethodType, PAYMENT_METHODS } from '../types';

interface PaymentMethodSelectorProps {
  selected?: PaymentMethodType;
  onSelect: (method: PaymentMethodType) => void;
  showManualMethods?: boolean; // Mostrar métodos manuais (para balcão)
}

const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  selected,
  onSelect,
  showManualMethods = true
}) => {
  // Métodos automáticos (para estudantes online)
  const automaticMethods: PaymentMethodType[] = ['MPESA', 'EMOLA', 'BANK_TRANSFER'];
  
  // Métodos manuais (para pagamento presencial ou com comprovativo)
  const manualMethods: PaymentMethodType[] = ['BANK_DEPOSIT', 'CASH', 'CHEQUE'];
  
  const methods = showManualMethods 
    ? [...automaticMethods, ...manualMethods] 
    : automaticMethods;

  return (
    <div className="space-y-6">
      {/* Métodos Automáticos */}
      <div>
        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-sm">bolt</span>
          Pagamento Instantâneo
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {automaticMethods.map((methodCode) => {
            const method = PAYMENT_METHODS[methodCode];
            const isSelected = selected === methodCode;
            
            return (
              <button
                key={methodCode}
                onClick={() => onSelect(methodCode)}
                className={`
                  group relative p-4 rounded-2xl border-2 transition-all duration-300
                  ${isSelected 
                    ? 'border-[#137FEC] bg-blue-50/50 shadow-lg shadow-blue-100' 
                    : 'border-slate-100 bg-white hover:border-slate-200 hover:shadow-md'
                  }
                `}
              >
                {/* Indicador de selecção */}
                {isSelected && (
                  <div className="absolute top-2 right-2">
                    <span className="material-symbols-outlined text-[#137FEC] text-lg">check_circle</span>
                  </div>
                )}
                
                <div className="flex flex-col items-center text-center gap-2">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 overflow-hidden"
                    style={{ backgroundColor: isSelected ? 'transparent' : `${method.color}15` }}
                  >
                    {methodCode === 'MPESA' ? (
                      <img src="/image/mpesa.png" alt="M-Pesa" className="w-full h-full object-contain p-1" />
                    ) : methodCode === 'EMOLA' ? (
                      <img src="/image/emola.png" alt="e-Mola" className="w-full h-full object-contain p-1" />
                    ) : (
                      <span 
                        className="material-symbols-outlined text-2xl"
                        style={{ color: method.color }}
                      >
                        {method.icon}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 text-sm">{method.name}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{method.description}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Métodos Manuais */}
      {showManualMethods && (
        <div>
          <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">upload_file</span>
            Pagamento Manual (com comprovativo)
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {manualMethods.map((methodCode) => {
              const method = PAYMENT_METHODS[methodCode];
              const isSelected = selected === methodCode;
              
              return (
                <button
                  key={methodCode}
                  onClick={() => onSelect(methodCode)}
                  className={`
                    group relative p-4 rounded-2xl border-2 transition-all duration-300
                    ${isSelected 
                      ? 'border-[#137FEC] bg-blue-50/50 shadow-lg shadow-blue-100' 
                      : 'border-slate-100 bg-white hover:border-slate-200 hover:shadow-md'
                    }
                  `}
                >
                  {isSelected && (
                    <div className="absolute top-2 right-2">
                      <span className="material-symbols-outlined text-[#137FEC] text-lg">check_circle</span>
                    </div>
                  )}
                  
                  <div className="flex flex-col items-center text-center gap-2">
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
                      style={{ backgroundColor: `${method.color}15` }}
                    >
                      <span 
                        className="material-symbols-outlined text-2xl"
                        style={{ color: method.color }}
                      >
                        {method.icon}
                      </span>
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 text-sm">{method.name}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{method.description}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Informação adicional baseada na selecção */}
      {selected && (
        <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-[#137FEC]">info</span>
            <div>
              {(selected === 'MPESA' || selected === 'EMOLA') && (
                <p className="text-sm text-slate-600">
                  Será enviado um pedido de pagamento para o seu telemóvel. 
                  Confirme o pagamento no seu dispositivo para concluir.
                </p>
              )}
              {selected === 'BANK_TRANSFER' && (
                <p className="text-sm text-slate-600">
                  Será gerada uma referência de pagamento. 
                  Utilize-a no multibanco ou homebanking do seu banco.
                </p>
              )}
              {selected === 'BANK_DEPOSIT' && (
                <p className="text-sm text-slate-600">
                  Faça o depósito na conta da escola e submeta o comprovativo. 
                  O pagamento será validado em até 24 horas.
                </p>
              )}
              {selected === 'CASH' && (
                <p className="text-sm text-slate-600">
                  Dirija-se ao balcão de atendimento da escola com o valor exacto. 
                  Será emitido um recibo no momento do pagamento.
                </p>
              )}
              {selected === 'CHEQUE' && (
                <p className="text-sm text-slate-600">
                  Emita o cheque nominal à escola. 
                  O pagamento será confirmado após compensação bancária (3-5 dias úteis).
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentMethodSelector;
