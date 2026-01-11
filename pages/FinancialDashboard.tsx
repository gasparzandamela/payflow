import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Modal from '../components/Modal';
import { User, PAYMENT_METHODS, PaymentMethodType } from '../types';
import { supabase } from '../supabaseClient';

interface FinancialDashboardProps {
  user: User;
}

// Dados estáticos para funcionalidades ainda não ligadas à BD
const TUITION_PLANS = [
  { id: 'p1', name: 'Ensino Primário', classes: '1ª - 6ª', value: 3500, students: 245 },
  { id: 'p2', name: 'Ensino Secundário 1º Ciclo', classes: '7ª - 9ª', value: 4000, students: 180 },
  { id: 'p3', name: 'Ensino Secundário 2º Ciclo', classes: '10ª - 12ª', value: 5000, students: 156 },
];

const PENDING_PAYMENTS_MOCK = [
  { id: '1', studentName: 'João Silva', studentId: 'STU001', class: '10ª B', amount: 4500, dueDate: '2026-01-05', daysOverdue: 1, reference: 'REF001234' },
  { id: '2', studentName: 'Maria Santos', studentId: 'STU002', class: '12ª A', amount: 5000, dueDate: '2026-01-03', daysOverdue: 3, reference: 'REF001235' },
  { id: '3', studentName: 'Pedro Costa', studentId: 'STU003', class: '8ª C', amount: 4000, dueDate: '2026-01-01', daysOverdue: 5, reference: 'REF001236' },
];

const FinancialDashboard: React.FC<FinancialDashboardProps> = ({ user }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'charges' | 'payments' | 'reports'>('overview');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showChargeModal, setShowChargeModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  
  // Real Data States
  const [stats, setStats] = useState({
    totalReceitas: 0,
    receitasMes: 0,
    cobrancasPendentes: 0,
    alunosInadimplentes: 0,
    pagamentosHoje: 0,
    valorPagamentosHoje: 0
  });
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch Recent Transactions
      const { data: txs, error: txError } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (txError) throw txError;
      setRecentTransactions(txs || []);

      // 2. Calculate Stats
      const now = new Date();
      const firstDayMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();

      // Receitas do Mês
      const { data: monthTxs } = await supabase
        .from('transactions')
        .select('amount')
        .eq('status', 'Sucesso')
        .gte('created_at', firstDayMonth);
      
      const receitasMes = monthTxs?.reduce((sum, tx) => sum + Number(tx.amount), 0) || 0;

      // Pagamentos Hoje
      const { data: todayTxs } = await supabase
        .from('transactions')
        .select('amount')
        .eq('status', 'Sucesso')
        .gte('created_at', today);
      
      const valorPagamentosHoje = todayTxs?.reduce((sum, tx) => sum + Number(tx.amount), 0) || 0;
      const pagamentosHoje = todayTxs?.length || 0;

      setStats({
        totalReceitas: 0, // Poderia ser calculado também
        receitasMes,
        cobrancasPendentes: 0, // Mock por enquanto (seria da tabela 'charges' se existisse)
        alunosInadimplentes: 0,
        pagamentosHoje,
        valorPagamentosHoje
      });

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-MZ', {
      style: 'decimal',
      minimumFractionDigits: 2
    }).format(value);
  };

  // Exportar relatório
  const exportReport = (format: 'pdf' | 'csv') => {
    const data = {
      title: 'Relatório Financeiro',
      date: new Date().toLocaleDateString('pt-PT'),
      stats: stats,
      transactions: recentTransactions
    };

    if (format === 'csv') {
      const csvContent = [
        'Descrição,Montante,Método,Status,Data',
        ...recentTransactions.map(t => 
          `"${t.description}",${t.amount},${t.payment_method},${t.status},${t.created_at}`
        )
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `relatorio_financeiro_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
    } else {
      // Para PDF, abrir nova janela com versão imprimível
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
          <head>
            <title>Relatório Financeiro</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 40px; }
              h1 { color: #1e293b; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { border: 1px solid #e2e8f0; padding: 12px; text-align: left; }
              th { background: #f8fafc; }
              .stats { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin: 20px 0; }
              .stat { background: #f8fafc; padding: 16px; border-radius: 8px; }
            </style>
          </head>
          <body>
            <h1>PayFlow - Relatório Financeiro</h1>
            <p>Data: ${new Date().toLocaleDateString('pt-PT')}</p>
            <div class="stats">
              <div class="stat"><strong>Receitas do Mês:</strong> ${formatCurrency(stats.receitasMes)} MZN</div>
              <div class="stat"><strong>Cobranças Pendentes:</strong> ${stats.cobrancasPendentes}</div>
              <div class="stat"><strong>Inadimplentes:</strong> ${stats.alunosInadimplentes}</div>
              <div class="stat"><strong>Pagamentos Hoje:</strong> ${stats.pagamentosHoje}</div>
            </div>
            <h2>Transacções Recentes</h2>
            <table>
              <tr><th>Descrição</th><th>Montante</th><th>Método</th><th>Status</th></tr>
              ${recentTransactions.map(t => `<tr><td>${t.description}</td><td>${formatCurrency(t.amount)} MZN</td><td>${t.payment_method}</td><td>${t.status}</td></tr>`).join('')}
            </table>
            <button onclick="window.print()" style="margin-top: 20px; padding: 12px 24px; background: #137FEC; color: white; border: none; border-radius: 8px; cursor: pointer;">Imprimir / Guardar PDF</button>
          </body>
          </html>
        `);
        printWindow.document.close();
      }
    }
  };

  if (isLoading) {
    return (
      <Layout user={user} title="Finanças">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#137FEC]"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout user={user} title="Administração Financeira">
      {/* Tabs / Navigation */}
      <div className="mb-8">
        <div className="flex gap-2 overflow-x-auto pb-4 hide-scrollbar">
          {[
            { id: 'overview', label: 'Visão Geral', icon: 'grid_view' },
            { id: 'charges', label: 'Cobranças', icon: 'assignment' },
            { id: 'payments', label: 'Pagamentos', icon: 'payments' },
            { id: 'reports', label: 'Relatórios', icon: 'bar_chart' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-[#137FEC] text-white shadow-lg shadow-blue-200'
                  : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-100'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">{tab.icon}</span>
              <span className="capitalize">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* TAB: Visão Geral */}
      {activeTab === 'overview' && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card: Receitas */}
            <Card className="hover:scale-[1.02] transition-transform duration-300">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.1em] mb-2">Receitas do Mês</p>
                  <p className="text-3xl font-black text-slate-900 leading-none">
                    {formatCurrency(stats.receitasMes)}
                  </p>
                  <div className="flex items-center gap-1 mt-4">
                    <span className="material-symbols-outlined text-green-500 text-sm font-black">trending_up</span>
                    <span className="text-xs text-green-600 font-bold">+12% vs mês anterior</span>
                  </div>
                </div>
                <div className="size-10 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
                  <span className="material-symbols-outlined text-2xl">trending_up</span>
                </div>
              </div>
            </Card>

            {/* Card: Cobranças */}
            <Card className="hover:scale-[1.02] transition-transform duration-300">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.1em] mb-2">Cobranças Pendentes</p>
                  <p className="text-3xl font-black text-slate-900 leading-none">{stats.cobrancasPendentes}</p>
                  <div className="flex items-center gap-1 mt-4">
                    <span className="material-symbols-outlined text-orange-500 text-sm font-black">schedule</span>
                    <span className="text-xs text-orange-600 font-bold">Aguardando pagamento</span>
                  </div>
                </div>
                <div className="size-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600">
                  <span className="material-symbols-outlined text-2xl">assignment_late</span>
                </div>
              </div>
            </Card>

            {/* Card: Inadimplentes */}
            <Card className="hover:scale-[1.02] transition-transform duration-300">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.1em] mb-2">Inadimplentes</p>
                  <p className="text-3xl font-black text-slate-900 leading-none">{stats.alunosInadimplentes}</p>
                  <div className="flex items-center gap-1 mt-4">
                    <span className="material-symbols-outlined text-red-500 text-sm font-black">warning</span>
                    <span className="text-xs text-red-600 font-bold">Requer atenção</span>
                  </div>
                </div>
                <div className="size-10 rounded-xl bg-red-50 flex items-center justify-center text-red-600">
                  <span className="material-symbols-outlined text-2xl">person_off</span>
                </div>
              </div>
            </Card>

            {/* Card: Pagamentos */}
            <Card className="hover:scale-[1.02] transition-transform duration-300">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.1em] mb-2">Pagamentos Hoje</p>
                  <p className="text-3xl font-black text-slate-900 leading-none">{stats.pagamentosHoje}</p>
                  <div className="flex items-center gap-1 mt-4 text-blue-600">
                    <span className="material-symbols-outlined text-sm font-black">account_balance_wallet</span>
                    <span className="text-xs font-bold">{formatCurrency(stats.valorPagamentosHoje)} MZN</span>
                  </div>
                </div>
                <div className="size-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                  <span className="material-symbols-outlined text-2xl">account_balance_wallet</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Main Content Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Column 1: Cobranças em Atraso */}
            <Card className="min-h-[400px]">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-red-500">warning</span>
                  <h3 className="font-black text-slate-900 tracking-tight uppercase text-sm">Cobranças em Atraso</h3>
                </div>
                <button onClick={() => setActiveTab('charges')} className="text-xs font-black text-[#137FEC] hover:underline uppercase tracking-tight">
                  Ver todas
                </button>
              </div>
              
              <div className="flex flex-col gap-4">
                {recentTransactions.filter(t => t.status === 'Pendente').length === 0 ? (
                  <div className="py-20 flex flex-col items-center justify-center text-slate-300">
                    <span className="material-symbols-outlined text-6xl mb-2">inventory_2</span>
                    <p className="text-sm font-bold">Nenhuma pendência encontrada</p>
                  </div>
                ) : (
                  recentTransactions.filter(t => t.status === 'Pendente').map((payment) => (
                    <div key={payment.id} className="group flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                      <div className="flex items-center gap-4">
                        <div className="size-12 rounded-full bg-red-50 flex items-center justify-center text-red-600">
                           <span className="material-symbols-outlined">person</span>
                        </div>
                        <div>
                          <p className="font-black text-slate-900 text-sm tracking-tight">{payment.studentName || 'Estudante'}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{payment.class || 'Classe'} • {payment.daysOverdue || 0} dias em atraso</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-slate-900 text-base">{formatCurrency(payment.amount)} MZN</p>
                        <button className="text-[10px] font-black text-[#137FEC] hover:underline mt-1 uppercase">Notificar</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>

            {/* Column 2: Transacções Recentes */}
            <Card className="min-h-[400px]">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-blue-500">history</span>
                  <h3 className="font-black text-slate-900 tracking-tight uppercase text-sm">Transacções Recentes</h3>
                </div>
                <button onClick={() => setActiveTab('payments')} className="text-xs font-black text-[#137FEC] hover:underline uppercase tracking-tight">
                  Ver histórico
                </button>
              </div>

              <div className="flex flex-col gap-2">
                {recentTransactions.length === 0 ? (
                  <div className="py-20 flex flex-col items-center justify-center text-slate-300">
                    <span className="material-symbols-outlined text-6xl mb-2">history_toggle_off</span>
                    <p className="text-sm font-bold">Sem transacções hoje</p>
                  </div>
                ) : (
                  recentTransactions.map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100 group">
                      <div className="flex items-center gap-4">
                        <div className={`size-10 rounded-full flex items-center justify-center ${tx.status === 'Sucesso' ? 'bg-green-50 text-green-500' : 'bg-orange-50 text-orange-500'}`}>
                          <span className="material-symbols-outlined text-2xl font-black">
                            {tx.status === 'Sucesso' ? 'check_circle' : 'schedule'}
                          </span>
                        </div>
                        <div>
                          <p className="font-black text-slate-700 text-sm tracking-tight leading-tight">{tx.description}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                             <span className="size-1 rounded-full bg-slate-300"></span>
                             <p className="text-[11px] text-slate-400 font-bold">{new Date(tx.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}</p>
                          </div>
                        </div>
                      </div>
                      <p className="font-black text-green-600 text-lg">+{formatCurrency(tx.amount)} MZN</p>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* TAB: Cobranças */}
      {activeTab === 'charges' && (
        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-900">Planos de Propinas</h3>
              <Button variant="secondary" className="text-sm">
                <span className="material-symbols-outlined text-lg mr-1">add</span>
                Novo Plano
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left py-3 px-4 text-xs font-bold text-slate-400 uppercase">Plano</th>
                    <th className="text-left py-3 px-4 text-xs font-bold text-slate-400 uppercase">Classes</th>
                    <th className="text-right py-3 px-4 text-xs font-bold text-slate-400 uppercase">Valor Mensal</th>
                    <th className="text-right py-3 px-4 text-xs font-bold text-slate-400 uppercase">Alunos</th>
                    <th className="text-right py-3 px-4 text-xs font-bold text-slate-400 uppercase">Acções</th>
                  </tr>
                </thead>
                <tbody>
                  {TUITION_PLANS.map(plan => (
                    <tr key={plan.id} className="border-b border-slate-50 hover:bg-slate-50">
                      <td className="py-4 px-4 font-bold text-slate-800">{plan.name}</td>
                      <td className="py-4 px-4 text-slate-600">{plan.classes}</td>
                      <td className="py-4 px-4 text-right font-black text-slate-900">{formatCurrency(plan.value)} MZN</td>
                      <td className="py-4 px-4 text-right text-slate-600">{plan.students}</td>
                      <td className="py-4 px-4 text-right">
                        <button className="text-[#137FEC] hover:underline text-sm font-bold">Editar</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-900">Cobranças Pendentes</h3>
              <div className="flex gap-2">
                <Button variant="secondary" className="text-sm">Gerar Mensais</Button>
                <Button className="text-sm">Reemitir Seleccionadas</Button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left py-3 px-4 text-xs font-bold text-slate-400 uppercase">Estudante</th>
                    <th className="text-left py-3 px-4 text-xs font-bold text-slate-400 uppercase">Referência</th>
                    <th className="text-right py-3 px-4 text-xs font-bold text-slate-400 uppercase">Valor</th>
                    <th className="text-center py-3 px-4 text-xs font-bold text-slate-400 uppercase">Vencimento</th>
                    <th className="text-center py-3 px-4 text-xs font-bold text-slate-400 uppercase">Status</th>
                    <th className="text-right py-3 px-4 text-xs font-bold text-slate-400 uppercase">Acções</th>
                  </tr>
                </thead>
                <tbody>
                  {PENDING_PAYMENTS_MOCK.map(payment => (
                    <tr key={payment.id} className="border-b border-slate-50 hover:bg-slate-50">
                      <td className="py-4 px-4">
                        <p className="font-bold text-slate-800">{payment.studentName}</p>
                        <p className="text-xs text-slate-400">{payment.class}</p>
                      </td>
                      <td className="py-4 px-4 font-mono text-sm text-slate-600">{payment.reference}</td>
                      <td className="py-4 px-4 text-right font-black text-slate-900">{formatCurrency(payment.amount)} MZN</td>
                      <td className="py-4 px-4 text-center text-slate-600">{payment.dueDate}</td>
                      <td className="py-4 px-4 text-center">
                        <span className="px-2 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">
                          {payment.daysOverdue}d atraso
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <button 
                          onClick={() => { setSelectedPayment(payment); setShowPaymentModal(true); }}
                          className="text-[#137FEC] hover:underline text-sm font-bold"
                        >
                          Registar Pagamento
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* TAB: Pagamentos */}
      {activeTab === 'payments' && (
        <div className="space-y-6">
          <div className="flex gap-4 mb-4">
            <Button onClick={() => setShowPaymentModal(true)} className="flex items-center gap-2">
              <span className="material-symbols-outlined">add</span>
              Registar Pagamento Manual
            </Button>
            <Button variant="secondary" className="flex items-center gap-2">
              <span className="material-symbols-outlined">upload_file</span>
              Validar Comprovativos
            </Button>
          </div>

          <Card className="p-6">
            <h3 className="text-xl font-bold text-slate-900 mb-6">Histórico de Pagamentos</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left py-3 px-4 text-xs font-bold text-slate-400 uppercase">Descrição</th>
                    <th className="text-left py-3 px-4 text-xs font-bold text-slate-400 uppercase">Método</th>
                    <th className="text-right py-3 px-4 text-xs font-bold text-slate-400 uppercase">Valor</th>
                    <th className="text-center py-3 px-4 text-xs font-bold text-slate-400 uppercase">Status</th>
                    <th className="text-center py-3 px-4 text-xs font-bold text-slate-400 uppercase">Hora</th>
                    <th className="text-right py-3 px-4 text-xs font-bold text-slate-400 uppercase">Acções</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTransactions.map(tx => (
                    <tr key={tx.id} className="border-b border-slate-50 hover:bg-slate-50">
                      <td className="py-4 px-4 font-bold text-slate-800">{tx.description}</td>
                      <td className="py-4 px-4 text-slate-600">{tx.payment_method}</td>
                      <td className="py-4 px-4 text-right font-black text-green-600">+{formatCurrency(tx.amount)} MZN</td>
                      <td className="py-4 px-4 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                          tx.status === 'Sucesso' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                        }`}>
                          {tx.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center text-slate-600">{new Date(tx.created_at).toLocaleTimeString()}</td>
                      <td className="py-4 px-4 text-right">
                        <button className="text-[#137FEC] hover:underline text-sm font-bold mr-3">Recibo</button>
                        <button className="text-slate-400 hover:text-slate-600 text-sm font-bold">Factura</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* TAB: Relatórios */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-6 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => exportReport('pdf')}>
              <div className="flex items-center gap-4">
                <div className="p-4 bg-blue-50 rounded-xl">
                  <span className="material-symbols-outlined text-3xl text-blue-600">summarize</span>
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">Fluxo de Caixa</h4>
                  <p className="text-sm text-slate-500">Entradas e saídas do mês</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-6 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => exportReport('pdf')}>
              <div className="flex items-center gap-4">
                <div className="p-4 bg-orange-50 rounded-xl">
                  <span className="material-symbols-outlined text-3xl text-orange-600">assignment_late</span>
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">Inadimplência</h4>
                  <p className="text-sm text-slate-500">Alunos com pagamentos em atraso</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-6 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => exportReport('csv')}>
              <div className="flex items-center gap-4">
                <div className="p-4 bg-green-50 rounded-xl">
                  <span className="material-symbols-outlined text-3xl text-green-600">table_chart</span>
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">Exportar Dados</h4>
                  <p className="text-sm text-slate-500">Download em CSV</p>
                </div>
              </div>
            </Card>
          </div>

          <Card className="p-6">
            <h3 className="text-xl font-bold text-slate-900 mb-6">Resumo Mensal</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-slate-50 rounded-xl">
                <p className="text-3xl font-black text-slate-900">{formatCurrency(stats.receitasMes)}</p>
                <p className="text-sm text-slate-500 mt-1">Receitas</p>
              </div>
              <div className="text-center p-4 bg-slate-50 rounded-xl">
                <p className="text-3xl font-black text-slate-900">{stats.pagamentosHoje * 30}</p>
                <p className="text-sm text-slate-500 mt-1">Pagamentos (Est.)</p>
              </div>
              <div className="text-center p-4 bg-slate-50 rounded-xl">
                <p className="text-3xl font-black text-orange-600">{stats.cobrancasPendentes}</p>
                <p className="text-sm text-slate-500 mt-1">Pendentes</p>
              </div>
              <div className="text-center p-4 bg-slate-50 rounded-xl">
                <p className="text-3xl font-black text-red-600">{stats.alunosInadimplentes}</p>
                <p className="text-sm text-slate-500 mt-1">Inadimplentes</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Modal: Registar Pagamento */}
      {showPaymentModal && (
        <Modal 
          isOpen={showPaymentModal} 
          onClose={() => { setShowPaymentModal(false); setSelectedPayment(null); }}
          title="Registar Pagamento Manual"
        >
          <div className="space-y-4">
            {selectedPayment && (
              <div className="p-4 bg-blue-50 rounded-xl mb-4">
                <p className="text-sm text-blue-800">
                  <strong>{selectedPayment.studentName}</strong> - {selectedPayment.class}
                </p>
                <p className="text-lg font-black text-blue-900 mt-1">
                  {formatCurrency(selectedPayment.amount)} MZN
                </p>
              </div>
            )}
            <Input label="Estudante" placeholder="Nome ou ID do estudante" />
            <Input label="Montante (MZN)" type="number" placeholder="0.00" />
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Método de Pagamento</label>
              <select className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#137FEC]">
                {Object.values(PAYMENT_METHODS).map(method => (
                  <option key={method.code} value={method.code}>{method.name}</option>
                ))}
              </select>
            </div>
            <Input label="Referência" placeholder="Número da referência" />
            <div className="flex gap-3 mt-6">
              <Button variant="secondary" fullWidth onClick={() => setShowPaymentModal(false)}>Cancelar</Button>
              <Button fullWidth onClick={() => { alert('Pagamento registado!'); setShowPaymentModal(false); }}>Confirmar</Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal: Nova Cobrança */}
      {showChargeModal && (
        <Modal isOpen={showChargeModal} onClose={() => setShowChargeModal(false)} title="Gerar Nova Cobrança">
          <div className="space-y-4">
            <Input label="Estudante" placeholder="Nome ou ID do estudante" />
            <Input label="Descrição" placeholder="Ex: Propina Janeiro 2026" />
            <Input label="Montante (MZN)" type="number" placeholder="0.00" />
            <Input label="Data de Vencimento" type="date" />
            <div className="flex gap-3 mt-6">
              <Button variant="secondary" fullWidth onClick={() => setShowChargeModal(false)}>Cancelar</Button>
              <Button fullWidth onClick={() => { alert('Cobrança gerada!'); setShowChargeModal(false); }}>Gerar Cobrança</Button>
            </div>
          </div>
        </Modal>
      )}
    </Layout>
  );
};

export default FinancialDashboard;

