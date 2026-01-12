

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PaymentDetails, User, PAYMENT_METHODS } from '../types';
import Card from '../components/Card';
import Button from '../components/Button';

interface PaymentSuccessProps {
  details: PaymentDetails;
  user: User;
}

const PaymentSuccess: React.FC<PaymentSuccessProps> = ({ details, user }) => {
  const navigate = useNavigate();

  const getCurrentMonthName = () => {
    return new Intl.DateTimeFormat('pt-PT', { month: 'long' }).format(new Date());
  };

  const getPaymentType = (entity: string) => {
    const mapping: Record<string, { label: string; icon: string; color: string }> = {
      '21423': { label: 'Pagamento de Mensalidade', icon: 'school', color: 'text-blue-500' },
      '21500': { label: 'Taxa de Exame', icon: 'edit_note', color: 'text-purple-500' },
      '21600': { label: 'Material Didático', icon: 'menu_book', color: 'text-orange-500' },
    };
    return mapping[entity] || { label: 'Pagamento de Factura', icon: 'receipt', color: 'text-slate-500' };
  };

  const paymentInfo = getPaymentType(details.entity);
  const currentMonth = getCurrentMonthName();
  const studentName = user.name.split(' ')[0];
  const transactionId = `TXN${Date.now().toString().slice(-10)}`;
  const currentDate = new Date().toLocaleString('pt-PT', { 
    day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' 
  });

  // Função para gerar e baixar o recibo em PDF
  const downloadReceipt = () => {
    const paymentMethodName = details.paymentMethod 
      ? PAYMENT_METHODS[details.paymentMethod]?.name || details.paymentMethod 
      : 'N/A';

    const receiptHTML = `
      <!DOCTYPE html>
      <html lang="pt">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Recibo - PayFlow</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&display=swap" rel="stylesheet">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: 'Inter', sans-serif; 
            background: #f8fafc; 
            padding: 40px;
            color: #1e293b;
          }
          .receipt {
            max-width: 500px;
            margin: 0 auto;
            background: white;
            border-radius: 24px;
            box-shadow: 0 25px 50px -12px rgba(0,0,0,0.1);
            overflow: hidden;
          }
          .header {
            background: linear-gradient(135deg, #137FEC, #0ea5e9);
            color: white;
            padding: 32px;
            text-align: center;
          }
          .header h1 { font-size: 24px; font-weight: 900; letter-spacing: -0.5px; }
          .header p { font-size: 12px; opacity: 0.8; margin-top: 4px; }
          .success-badge {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            background: #22c55e;
            color: white;
            padding: 8px 16px;
            border-radius: 50px;
            font-size: 12px;
            font-weight: 700;
            text-transform: uppercase;
            margin-top: 16px;
          }
          .content { padding: 32px; }
          .amount {
            text-align: center;
            padding: 24px;
            background: #f8fafc;
            border-radius: 16px;
            margin-bottom: 24px;
          }
          .amount-label { font-size: 10px; text-transform: uppercase; color: #94a3b8; letter-spacing: 1px; font-weight: 700; }
          .amount-value { font-size: 36px; font-weight: 900; color: #0f172a; margin-top: 8px; }
          .amount-currency { font-size: 16px; color: #64748b; }
          .details { border-top: 1px dashed #e2e8f0; padding-top: 24px; }
          .detail-row { 
            display: flex; 
            justify-content: space-between; 
            padding: 12px 0; 
            border-bottom: 1px solid #f1f5f9;
          }
          .detail-row:last-child { border-bottom: none; }
          .detail-label { font-size: 12px; color: #94a3b8; text-transform: uppercase; font-weight: 700; }
          .detail-value { font-size: 14px; font-weight: 600; color: #1e293b; }
          .footer {
            text-align: center;
            padding: 24px;
            background: #f8fafc;
            font-size: 11px;
            color: #94a3b8;
          }
          .footer p { margin: 4px 0; }
          @media print {
            body { background: white; padding: 0; }
            .receipt { box-shadow: none; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="receipt">
          <div class="header">
            <h1>PAYFLOW</h1>
            <p>Comprovativo de Pagamento</p>
            <div class="success-badge">
              ✓ Pagamento Confirmado
            </div>
          </div>
          
          <div class="content">
            <div class="amount">
              <div class="amount-label">Montante Pago</div>
              <div class="amount-value">
                ${details.amount} <span class="amount-currency">MZN</span>
              </div>
            </div>
            
            <div class="details">
              <div class="detail-row">
                <span class="detail-label">ID Transacção</span>
                <span class="detail-value">${transactionId}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Estudante</span>
                <span class="detail-value">${user.name}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Entidade</span>
                <span class="detail-value">${details.entity}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Referência</span>
                <span class="detail-value">${details.reference}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Tipo de Serviço</span>
                <span class="detail-value">${paymentInfo.label}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Método de Pagamento</span>
                <span class="detail-value">${paymentMethodName}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Data/Hora</span>
                <span class="detail-value">${currentDate}</span>
              </div>
            </div>
          </div>
          
          <div class="footer">
            <p><strong>EduPay</strong> - Sistema de Pagamentos</p>
            <p>Este documento serve como comprovativo oficial de pagamento.</p>
            <p>Guarde este recibo para referência futura.</p>
          </div>
        </div>
        
        <div class="no-print" style="text-align: center; margin-top: 24px;">
          <button onclick="window.print()" style="
            background: #137FEC;
            color: white;
            border: none;
            padding: 12px 32px;
            border-radius: 12px;
            font-size: 14px;
            font-weight: 700;
            cursor: pointer;
          ">
            Imprimir / Guardar como PDF
          </button>
        </div>
      </body>
      </html>
    `;

    // Abrir nova janela com o recibo
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(receiptHTML);
      printWindow.document.close();
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col overflow-x-hidden font-inter">
      <header className="w-full border-b border-slate-200 bg-white/80 backdrop-blur-md px-6 md:px-10 py-4 md:h-20 flex items-center">
        <div className="flex items-center gap-3 max-w-[1200px] mx-auto w-full">
            <div className={`size-8 md:size-10 rounded-xl bg-green-500 flex items-center justify-center text-white shadow-lg shadow-green-500/20`}>
                <span className={`material-symbols-outlined text-xl md:text-2xl font-bold`}>check</span>
            </div>
             <span className={`font-black tracking-tighter uppercase text-lg md:text-xl text-slate-900`}>
              PayFlow
            </span>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center p-4 md:p-8">
        <div className="flex flex-col max-w-[580px] w-full animate-in zoom-in-95 duration-500">
          <Card className="rounded-[2.5rem] md:rounded-[3.5rem] shadow-2xl shadow-slate-200/50 relative overflow-hidden p-0">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-1 bg-green-500 rounded-b-full"></div>
            
            <div className="pt-10 md:pt-16 pb-6 px-6 md:px-14 flex flex-col items-center text-center">
              <div className="size-20 md:size-24 rounded-full bg-green-50 flex items-center justify-center mb-6 md:mb-8 ring-8 ring-green-50/50 animate-bounce-subtle">
                 <span className="material-symbols-outlined text-5xl md:text-6xl text-green-500 font-bold">verified</span>
              </div>
              
              <div className="flex items-center gap-2 mb-2 px-4 py-1.5 rounded-full bg-slate-50 border border-slate-100">
                <span className={`material-symbols-outlined text-sm ${paymentInfo.color}`}>{paymentInfo.icon}</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{paymentInfo.label}</span>
              </div>

              <h1 className="text-slate-900 tracking-tight text-3xl md:text-4xl font-black leading-tight pb-4">
                Pagamento Concluído!
              </h1>
              
              <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4 md:p-6 mb-2">
                <p className="text-slate-700 text-sm md:text-lg font-medium leading-relaxed">
                  Olá <span className="text-blue-600 font-black">{studentName}</span>, o seu pagamento do mês de <span className="text-blue-600 font-black capitalize">{currentMonth}</span> foi processado com sucesso.
                </p>
              </div>
            </div>

            <div className="px-6 md:px-10 py-4">
              <div className="bg-slate-50/80 rounded-[2rem] p-6 md:p-8 border border-slate-100 space-y-5">
                <div className="flex justify-between items-center border-b border-slate-200/50 pb-4 border-dashed last:border-0 last:pb-0">
                  <span className="text-slate-400 text-[10px] md:text-xs font-black uppercase tracking-widest">Referência</span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-900 text-sm md:text-base font-black font-mono tracking-wider tabular-nums">{details.reference}</span>
                    <button 
                      onClick={() => navigator.clipboard.writeText(details.reference)}
                      className="text-green-500 hover:text-green-600 transition-colors active:scale-90"
                      title="Copiar referência"
                    >
                      <span className="material-symbols-outlined text-[18px]">content_copy</span>
                    </button>
                  </div>
                </div>
                <div className="flex justify-between items-center border-b border-slate-200/50 pb-4 border-dashed last:border-0 last:pb-0">
                  <span className="text-slate-400 text-[10px] md:text-xs font-black uppercase tracking-widest">Montante Pago</span>
                  <span className="text-slate-900 text-xl md:text-2xl font-black tabular-nums">{details.amount} <span className="text-sm text-slate-400">MZN</span></span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-200/50 pb-4 border-dashed last:border-0 last:pb-0">
                  <span className="text-slate-400 text-[10px] md:text-xs font-black uppercase tracking-widest">Método</span>
                  <span className="text-slate-900 text-xs md:text-sm font-bold">
                    {details.paymentMethod ? PAYMENT_METHODS[details.paymentMethod]?.name || details.paymentMethod : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-[10px] md:text-xs font-black uppercase tracking-widest">Data & Hora</span>
                  <span className="text-slate-900 text-xs md:text-sm font-bold uppercase">{new Date().toLocaleString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            </div>

            <div className="px-6 md:px-10 pb-12 pt-6 flex flex-col sm:flex-row gap-3">
              <Button 
                onClick={() => navigate('/dashboard')}
                className="bg-slate-900 hover:bg-black text-white h-14 md:h-16 shadow-xl shadow-slate-900/20"
                fullWidth
              >
                Voltar ao Início
              </Button>
              <Button 
                onClick={downloadReceipt}
                variant="secondary"
                className="h-14 md:h-16 flex items-center justify-center gap-2 group"
                icon={<span className="material-symbols-outlined text-xl transition-transform group-hover:-translate-y-0.5">download</span>}
                fullWidth
              >
                 Recibo PDF
              </Button>
            </div>
          </Card>
        </div>
      </main>
      
      <style>{`
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        .animate-bounce-subtle {
          animation: bounce-subtle 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default PaymentSuccess;
