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

const FinancialDashboard: React.FC<FinancialDashboardProps> = ({ user }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'charges' | 'payments' | 'reports' | 'create_charge'>('overview');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    student_id: '',
    description: '',
    amount: '',
    due_date: ''
  });
  const [students, setStudents] = useState<any[]>([]);

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
  const [dbCharges, setDbCharges] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
    fetchStudents();
    fetchChargesList();
  }, []);

  const fetchChargesList = async () => {
    const { data } = await supabase
      .from('charges')
      .select(`
        *,
        profiles:student_id (name)
      `)
      .order('due_date', { ascending: false });
    setDbCharges(data || []);
  };

  const fetchStudents = async () => {
    const { data } = await supabase.from('profiles').select('id, name').eq('role', 'student');
    setStudents(data || []);
  };

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

      // 2. Fetch Real Stats
      const { data: allSuccessfulTxs } = await supabase
        .from('transactions')
        .select('amount')
        .eq('status', 'Sucesso');
      
      const totalReceitas = allSuccessfulTxs?.reduce((sum, tx) => sum + Number(tx.amount), 0) || 0;

      const { data: charges } = await supabase
        .from('charges')
        .select('amount, status, due_date');
      
      const cobrancasPendentes = charges?.filter(c => c.status === 'pending').length || 0;
      const totalPendentes = charges?.filter(c => c.status === 'pending').reduce((sum, c) => sum + Number(c.amount), 0) || 0;
      
      const now = new Date();
      const inadimplentes = charges?.filter(c => c.status === 'pending' && new Date(c.due_date) < now).length || 0;

      // 3. Transactions Stats
      const firstDayMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();

      const { data: monthTxs } = await supabase
        .from('transactions')
        .select('amount')
        .eq('status', 'Sucesso')
        .gte('created_at', firstDayMonth);
      
      const receitasMes = monthTxs?.reduce((sum, tx) => sum + Number(tx.amount), 0) || 0;

      const { data: todayTxs } = await supabase
        .from('transactions')
        .select('amount')
        .eq('status', 'Sucesso')
        .gte('created_at', today);
      
      const valorPagamentosHoje = todayTxs?.reduce((sum, tx) => sum + Number(tx.amount), 0) || 0;
      const pagamentosHoje = todayTxs?.length || 0;

      setStats({
        totalReceitas,
        receitasMes,
        cobrancasPendentes,
        alunosInadimplentes: inadimplentes,
        pagamentosHoje,
        valorPagamentosHoje
      });

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCharge = async () => {
    if (!formData.student_id || !formData.amount || !formData.due_date) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      const { error } = await supabase.from('charges').insert([{
        student_id: formData.student_id,
        description: formData.description || 'Propina Mensal',
        amount: parseFloat(formData.amount),
        due_date: formData.due_date,
        created_by: user.id
      }]);

      if (error) throw error;
      
      setFormData({ student_id: '', description: '', amount: '', due_date: '' });
      setActiveTab('charges');
      fetchDashboardData();
      fetchChargesList();
      alert('Cobrança gerada com sucesso!');
    } catch (err: any) {
      alert('Erro ao gerar cobrança: ' + err.message);
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
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          {activeTab === 'create_charge' ? 'Gerar Cobrança' : 'Dashboard'}
        </h1>
        {activeTab !== 'create_charge' && (
          <Button onClick={() => setActiveTab('create_charge')} className="flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">add</span>
            Gerar Cobrança
          </Button>
        )}
      </div>

      {/* Conditionally Render Content based on activeTab */}
      {activeTab === 'create_charge' ? (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto py-12">
          <Card className="p-10 shadow-xl border-slate-100 flex flex-col gap-8 rounded-[2.5rem]">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-black text-slate-700 mb-3 uppercase tracking-wider">Estudante</label>
                <select 
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-5 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-bold text-slate-900 appearance-none"
                  value={formData.student_id}
                  onChange={(e) => setFormData({...formData, student_id: e.target.value})}
                >
                  <option value="">Seleccione um estudante</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              
              <Input 
                label="Descrição da Cobrança" 
                placeholder="Ex: Propina de Janeiro 2026" 
                className="bg-slate-50 border-slate-200 py-5 rounded-2xl"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input 
                  label="Montante (MZN)" 
                  type="number" 
                  placeholder="0.00" 
                  className="bg-slate-50 border-slate-200 py-5 rounded-2xl"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                />
                
                <Input 
                  label="Data de Vencimento" 
                  type="date" 
                  className="bg-slate-50 border-slate-200 py-5 rounded-2xl"
                  value={formData.due_date}
                  onChange={(e) => setFormData({...formData, due_date: e.target.value})}
                />
              </div>
            </div>

            <div className="flex gap-4 mt-4 pt-8 border-t border-slate-50">
              <Button 
                variant="secondary" 
                fullWidth 
                className="py-5 text-base font-black rounded-2xl"
                onClick={() => setActiveTab('overview')}
              >
                Cancelar
              </Button>
              <Button 
                fullWidth 
                className="py-5 text-base font-black rounded-2xl shadow-lg shadow-blue-200"
                onClick={handleCreateCharge}
              >
                Confirmar Cobrança
              </Button>
            </div>
          </Card>
        </div>
      ) : activeTab === 'overview' ? (
        <>
          {/* Stats Grid - 5 Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8 pulse-animation">
            {/* Receitas do Mês */}
            <div className="bg-[#EBFAF2] rounded-[1.5rem] p-6 border border-white shadow-sm flex items-center gap-4">
               <div className="size-12 rounded-xl bg-[#27AE60] flex items-center justify-center text-white">
                  <span className="material-symbols-outlined text-2xl font-black">payments</span>
               </div>
               <div>
                  <p className="text-2xl font-black text-[#27AE60] leading-tight">{formatCurrency(stats.receitasMes)}</p>
                  <p className="text-[11px] text-[#27AE60] font-black uppercase tracking-wider mt-0.5">Receitas</p>
               </div>
            </div>

            {/* Cobranças Pendentes */}
            <div className="bg-[#EBF5FF] rounded-[1.5rem] p-6 border border-white shadow-sm flex items-center gap-4">
               <div className="size-12 rounded-xl bg-[#137FEC] flex items-center justify-center text-white">
                  <span className="material-symbols-outlined text-2xl font-black">schedule</span>
               </div>
               <div>
                  <p className="text-2xl font-black text-[#137FEC] leading-tight">{stats.cobrancasPendentes}</p>
                  <p className="text-[11px] text-[#137FEC] font-black uppercase tracking-wider mt-0.5">Pendentes</p>
               </div>
            </div>

            {/* Inadimplentes */}
            <div className="bg-[#FFF9EB] rounded-[1.5rem] p-6 border border-white shadow-sm flex items-center gap-4">
               <div className="size-12 rounded-xl bg-[#F2994A] flex items-center justify-center text-white">
                  <span className="material-symbols-outlined text-2xl font-black">warning</span>
               </div>
               <div>
                  <p className="text-2xl font-black text-[#F2994A] leading-tight">{stats.alunosInadimplentes}</p>
                  <p className="text-[11px] text-[#F2994A] font-black uppercase tracking-wider mt-0.5">Em Atraso</p>
               </div>
            </div>

            <div className="bg-[#FEEBF0] rounded-[1.5rem] p-6 border border-white shadow-sm flex items-center gap-4">
               <div className="size-12 rounded-xl bg-[#EB5757] flex items-center justify-center text-white">
                  <span className="material-symbols-outlined text-2xl font-black">show_chart</span>
               </div>
               <div>
                  <p className="text-2xl font-black text-[#EB5757] leading-tight">{stats.pagamentosHoje}</p>
                  <p className="text-[11px] text-[#EB5757] font-black uppercase tracking-wider mt-0.5">Transacções Hoje</p>
               </div>
            </div>

            <div className="bg-[#EBF9FF] rounded-[1.5rem] p-6 border border-white shadow-sm flex items-center gap-4">
               <div className="size-12 rounded-xl bg-[#2D9CDB] flex items-center justify-center text-white">
                  <span className="material-symbols-outlined text-2xl font-black">account_balance</span>
               </div>
               <div>
                  <p className="text-2xl font-black text-[#2D9CDB] leading-tight">{formatCurrency(stats.valorPagamentosHoje)}</p>
                  <p className="text-[11px] text-[#2D9CDB] font-black uppercase tracking-wider mt-0.5">Total Hoje</p>
               </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Left Column (7/12) */}
            <div className="lg:col-span-7 space-y-8">
              <div className="bg-white rounded-[2rem] p-8 border border-slate-50 shadow-sm">
                <div className="flex items-center justify-between mb-10 pb-4 border-b border-slate-50">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[#EB5757] text-2xl font-black">warning</span>
                    <h3 className="font-black text-slate-800 tracking-tight text-lg">Cobranças em Atraso</h3>
                  </div>
                  <button onClick={() => setActiveTab('charges')} className="text-xs font-black text-[#137FEC] hover:underline uppercase tracking-tight">Ver todas</button>
                </div>
                
                <div className="py-14 flex flex-col items-center justify-center text-slate-400">
                  <p className="text-base font-bold tracking-tight text-center max-w-xs">
                    {stats.alunosInadimplentes === 0 ? (
                      <><span className="text-slate-900">Nenhuma cobrança</span> está atualmente em atraso.</>
                    ) : (
                      <>Existem <span className="text-slate-900 font-black">{stats.alunosInadimplentes} cobranças</span> em atraso.</>
                    )}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 ml-2">
                  <span className="material-symbols-outlined text-[#137FEC] text-2xl">history</span>
                  <h3 className="font-black text-slate-800 tracking-tight text-lg">Transacções Recentes</h3>
                </div>
                
                <div className="bg-white rounded-[2rem] p-8 border border-slate-50 shadow-sm">
                  {recentTransactions.length > 0 ? (
                    <div className="bg-slate-50/50 rounded-2xl p-6 border border-slate-100/50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-5">
                          <div className="size-12 rounded-full bg-[#EBF9F2] flex items-center justify-center text-[#27AE60] ring-4 ring-white shadow-sm">
                            <span className="material-symbols-outlined text-2xl font-black">check_circle</span>
                          </div>
                          <div>
                            <p className="font-black text-slate-800 text-base tracking-tight leading-tight">{recentTransactions[0].description}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="size-1 rounded-full bg-slate-300"></span>
                              <p className="text-xs text-slate-400 font-bold">{new Date(recentTransactions[0].created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                            </div>
                          </div>
                        </div>
                        <p className="font-black text-[#27AE60] text-2xl tracking-tighter">+{formatCurrency(recentTransactions[0].amount)} MZN</p>
                      </div>
                    </div>
                  ) : (
                    <div className="py-10 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">Sem transacções recentes</div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column (5/12) */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-[2rem] p-8 border border-slate-50 shadow-sm h-full flex flex-col">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="font-black text-slate-800 tracking-tight text-lg leading-none">Histórico</h3>
                  <button onClick={() => setActiveTab('payments')} className="text-xs font-black text-[#137FEC] hover:underline uppercase tracking-tight">Ver histórico</button>
                </div>

                <div className="relative mb-8">
                  <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">search</span>
                  <input type="text" placeholder="Buscar transacção..." className="w-full bg-[#F8FAFC] border border-[#F1F5F9] rounded-2xl py-4.5 pl-14 pr-6 text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/5 transition-all font-bold text-slate-900 placeholder:text-slate-400" />
                </div>

                <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                  {recentTransactions.map((tx) => (
                    <div key={tx.id} className="group flex items-center justify-between p-4 rounded-2xl border border-transparent hover:border-slate-50 hover:bg-slate-50/50 transition-all cursor-pointer">
                      <div className="flex items-center gap-4">
                        <div className="size-11 rounded-full bg-[#EBF9F2] flex items-center justify-center text-[#27AE60] ring-4 ring-white shadow-sm group-hover:scale-110 transition-transform">
                          <span className="material-symbols-outlined text-[20px] font-black">{tx.status === 'Sucesso' ? 'check_circle' : 'schedule'}</span>
                        </div>
                        <div>
                          <p className="font-black text-slate-800 text-[13px] tracking-tight leading-tight">{tx.description}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="size-1 rounded-full bg-slate-300"></span>
                            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-tight">{new Date(tx.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                          </div>
                        </div>
                      </div>
                      <p className={`font-black text-sm tracking-tighter shrink-0 ${tx.status === 'Sucesso' ? 'text-[#27AE60]' : 'text-orange-500'}`}>+{formatCurrency(tx.amount)} MZN</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      ) : activeTab === 'charges' ? (
        <div className="space-y-6 animate-in fade-in duration-500">
          <Card className="p-8 rounded-[2rem] border-slate-50 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black text-slate-900">Cobranças Ativas</h3>
              <Button onClick={() => setActiveTab('create_charge')} className="text-sm">
                <span className="material-symbols-outlined text-lg mr-1">add</span>
                Nova Cobrança
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left py-4 px-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Estudante</th>
                    <th className="text-left py-4 px-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Descrição</th>
                    <th className="text-right py-4 px-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Valor</th>
                    <th className="text-center py-4 px-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Vencimento</th>
                    <th className="text-center py-4 px-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {dbCharges.map(charge => (
                    <tr key={charge.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-5 px-4 font-black text-slate-800 text-sm tracking-tight">{charge.profiles?.name || 'Estudante'}</td>
                      <td className="py-5 px-4 text-slate-600 text-sm font-bold">{charge.description}</td>
                      <td className="py-5 px-4 text-right font-black text-slate-900 text-sm">{formatCurrency(charge.amount)} MZN</td>
                      <td className="py-5 px-4 text-center text-slate-600 font-bold text-sm tracking-tighter">{new Date(charge.due_date).toLocaleDateString()}</td>
                      <td className="py-5 px-4 text-center">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          charge.status === 'paid' ? 'bg-[#EBFAF2] text-[#27AE60]' : 'bg-[#FFF9EB] text-[#F2994A]'
                        }`}>
                          {charge.status === 'paid' ? 'Pago' : 'Pendente'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      ) : activeTab === 'payments' ? (
        <div className="animate-in fade-in duration-500">
          <Card className="p-8 rounded-[2rem] border-slate-50 shadow-sm">
            <h3 className="text-xl font-black text-slate-900 mb-8">Histórico de Transacções</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left py-4 px-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Descrição</th>
                    <th className="text-left py-4 px-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Método</th>
                    <th className="text-right py-4 px-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Valor</th>
                    <th className="text-center py-4 px-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                    <th className="text-center py-4 px-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Data</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {recentTransactions.map(tx => (
                    <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-5 px-4 font-black text-slate-800 text-sm tracking-tight">{tx.description}</td>
                      <td className="py-5 px-4 text-slate-600 font-bold text-sm">{tx.payment_method}</td>
                      <td className="py-5 px-4 text-right font-black text-[#27AE60] text-sm">+{formatCurrency(tx.amount)} MZN</td>
                      <td className="py-5 px-4 text-center">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          tx.status === 'Sucesso' ? 'bg-[#EBFAF2] text-[#27AE60]' : 'bg-[#FFF9EB] text-[#F2994A]'
                        }`}>
                          {tx.status}
                        </span>
                      </td>
                      <td className="py-5 px-4 text-center text-slate-500 font-bold text-sm tracking-tighter">{new Date(tx.created_at).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      ) : activeTab === 'reports' ? (
        <div className="space-y-6 animate-in fade-in duration-500">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-8 cursor-pointer hover:shadow-xl transition-all border-slate-50 hover:-translate-y-1 rounded-[2rem]" onClick={() => exportReport('pdf')}>
              <div className="flex items-center gap-6">
                <div className="size-16 bg-blue-50 rounded-[1.5rem] flex items-center justify-center">
                  <span className="material-symbols-outlined text-4xl text-blue-600 font-black">summarize</span>
                </div>
                <div>
                  <h4 className="font-black text-slate-900 text-lg">Fluxo de Caixa</h4>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Entradas e saídas</p>
                </div>
              </div>
            </Card>
            <Card className="p-8 cursor-pointer hover:shadow-xl transition-all border-slate-50 hover:-translate-y-1 rounded-[2rem]" onClick={() => exportReport('pdf')}>
              <div className="flex items-center gap-6">
                <div className="size-16 bg-orange-50 rounded-[1.5rem] flex items-center justify-center">
                  <span className="material-symbols-outlined text-4xl text-orange-600 font-black">assignment_late</span>
                </div>
                <div>
                  <h4 className="font-black text-slate-900 text-lg">Inadimplência</h4>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Alunos em atraso</p>
                </div>
              </div>
            </Card>
            <Card className="p-8 cursor-pointer hover:shadow-xl transition-all border-slate-50 hover:-translate-y-1 rounded-[2rem]" onClick={() => exportReport('csv')}>
              <div className="flex items-center gap-6">
                <div className="size-16 bg-green-50 rounded-[1.5rem] flex items-center justify-center">
                  <span className="material-symbols-outlined text-4xl text-green-600 font-black">table_chart</span>
                </div>
                <div>
                  <h4 className="font-black text-slate-900 text-lg">Exportar CSV</h4>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Download de dados</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      ) : null}

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
    </Layout>
  );
};

export default FinancialDashboard;

