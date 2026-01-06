import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Button from '../components/Button';
import { User } from '../types';
import { supabase } from '../supabaseClient';

interface ExecutiveDashboardProps {
  user: User;
}

const ExecutiveDashboard: React.FC<ExecutiveDashboardProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'financial' | 'academic'>('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalRevenue: 0,
    outstandingBalance: 0,
    enrollmentRate: 0,
    recentPayments: 0
  });
  const [recentStudents, setRecentStudents] = useState<any[]>([]);
  const [topDebtors, setTopDebtors] = useState<any[]>([]);

  useEffect(() => {
    fetchExecutiveData();
  }, [activeTab]);

  const fetchExecutiveData = async () => {
    setIsLoading(true);
    try {
      // 1. Get Financial Stats (Total Success Transactions)
      const { data: txs } = await supabase
        .from('transactions')
        .select('amount')
        .eq('status', 'Sucesso');
      
      const totalRevenue = txs?.reduce((sum, tx) => sum + Number(tx.amount), 0) || 0;

      // 2. Get Student Stats (Total Registered Profiles with role 'student')
      const { count: studentCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'student');

      // 3. Outstanding (Simplified mock logic or sum of pending txs)
      const { data: pendingTxs } = await supabase
        .from('transactions')
        .select('amount')
        .eq('status', 'Pendente');
      
      const outstandingBalance = pendingTxs?.reduce((sum, tx) => sum + Number(tx.amount), 0) || 0;

      setStats({
        totalStudents: studentCount || 0,
        totalRevenue,
        outstandingBalance,
        enrollmentRate: 94, // Mock rate
        recentPayments: txs?.length || 0
      });

      // 4. Get Detailed lists based on context
      if (activeTab === 'academic') {
        const { data: students } = await supabase
          .from('profiles')
          .select('*')
          .eq('role', 'student')
          .order('created_at', { ascending: false })
          .limit(10);
        setRecentStudents(students || []);
      }

      if (activeTab === 'financial') {
        const { data: debtors } = await supabase
          .from('transactions')
          .select('*, profiles(name)')
          .eq('status', 'Pendente')
          .order('amount', { ascending: false })
          .limit(5);
        setTopDebtors(debtors || []);
      }

    } catch (err) {
      console.error('Error fetching executive data:', err);
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

  return (
    <Layout user={user} title="Painel de Direção">
      <div className="flex flex-col gap-6">
        {/* Header Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${
              activeTab === 'overview' ? 'bg-[#137FEC] text-white shadow-lg shadow-blue-200' : 'bg-white text-slate-500 hover:bg-slate-50'
            }`}
          >
            Visão Geral
          </button>
          <button 
            onClick={() => setActiveTab('financial')}
            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${
              activeTab === 'financial' ? 'bg-[#137FEC] text-white shadow-lg shadow-blue-200' : 'bg-white text-slate-500 hover:bg-slate-50'
            }`}
          >
            Análise Financeira
          </button>
          <button 
            onClick={() => setActiveTab('academic')}
            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${
              activeTab === 'academic' ? 'bg-[#137FEC] text-white shadow-lg shadow-blue-200' : 'bg-white text-slate-500 hover:bg-slate-50'
            }`}
          >
            Visão Académica
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#137FEC]"></div>
          </div>
        ) : (
          <>
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="p-6">
                  <p className="text-xs font-bold text-slate-400 uppercase">Total de Alunos</p>
                  <p className="text-3xl font-black text-slate-900 mt-2">{stats.totalStudents}</p>
                  <div className="mt-4 flex items-center text-xs text-green-600 font-bold">
                    <span className="material-symbols-outlined text-sm mr-1">trending_up</span>
                    +5% este ano
                  </div>
                </Card>
                <Card className="p-6">
                  <p className="text-xs font-bold text-slate-400 uppercase">Receita Total</p>
                  <p className="text-3xl font-black text-[#137FEC] mt-2">{formatCurrency(stats.totalRevenue)} MZN</p>
                  <div className="mt-4 flex items-center text-xs text-slate-400 font-bold">
                    Acumulado do período
                  </div>
                </Card>
                <Card className="p-6">
                  <p className="text-xs font-bold text-slate-400 uppercase">Valores em Dívida</p>
                  <p className="text-3xl font-black text-orange-600 mt-2">{formatCurrency(stats.outstandingBalance)} MZN</p>
                  <div className="mt-4 flex items-center text-xs text-orange-600 font-bold">
                    <span className="material-symbols-outlined text-sm mr-1">warning</span>
                    Requer cobrança
                  </div>
                </Card>
                <Card className="p-6">
                  <p className="text-xs font-bold text-slate-400 uppercase">Taxa de Matrícula</p>
                  <p className="text-3xl font-black text-green-600 mt-2">{stats.enrollmentRate}%</p>
                  <div className="mt-4 flex items-center text-xs text-green-600 font-bold">
                    Metas atingidas
                  </div>
                </Card>

                {/* Main Charts Placeholder Area */}
                <Card className="lg:col-span-3 p-6 min-h-[300px]">
                  <h3 className="font-bold text-slate-900 mb-6">Crescimento de Receita vs Projeção</h3>
                  <div className="flex items-center justify-center h-48 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    <p className="text-slate-400 font-bold italic text-sm">Espaço para Gráfico de Tendência</p>
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="font-bold text-slate-900 mb-4">Distribuição</h3>
                  <div className="space-y-4">
                     <div>
                       <div className="flex justify-between text-xs font-bold mb-1">
                         <span>Primário</span>
                         <span>45%</span>
                       </div>
                       <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                         <div className="bg-blue-500 h-full w-[45%]"></div>
                       </div>
                     </div>
                     <div>
                       <div className="flex justify-between text-xs font-bold mb-1">
                         <span>Secundário</span>
                         <span>55%</span>
                       </div>
                       <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                         <div className="bg-green-500 h-full w-[55%]"></div>
                       </div>
                     </div>
                  </div>
                </Card>
              </div>
            )}

            {activeTab === 'financial' && (
              <div className="space-y-6">
                <Card className="p-6">
                  <h3 className="text-xl font-bold text-slate-900 mb-6">Maiores Cobranças Pendentes</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-100">
                          <th className="text-left py-3 px-4 text-xs font-bold text-slate-400 uppercase">Estudante</th>
                          <th className="text-left py-3 px-4 text-xs font-bold text-slate-400 uppercase">Referência</th>
                          <th className="text-right py-3 px-4 text-xs font-bold text-slate-400 uppercase">Valor</th>
                          <th className="text-center py-3 px-4 text-xs font-bold text-slate-400 uppercase">Data</th>
                        </tr>
                      </thead>
                      <tbody>
                        {topDebtors.map(debt => (
                          <tr key={debt.id} className="border-b border-slate-50 hover:bg-slate-50">
                            <td className="py-4 px-4 font-bold text-slate-800">{debt.profiles?.name || 'Desconhecido'}</td>
                            <td className="py-4 px-4 font-mono text-sm text-slate-500">{debt.reference || '---'}</td>
                            <td className="py-4 px-4 text-right font-black text-red-600">{formatCurrency(debt.amount)} MZN</td>
                            <td className="py-4 px-4 text-center text-slate-500">{new Date(debt.created_at).toLocaleDateString()}</td>
                          </tr>
                        ))}
                        {topDebtors.length === 0 && (
                          <tr>
                            <td colSpan={4} className="py-10 text-center text-slate-400 italic">Sem cobranças pendentes no momento.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </Card>
                <Card className="p-10 text-center">
                  <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">insights</span>
                  <p className="text-slate-500 font-bold">Mais gráficos financeiros serão disponibilizados conforme a acumulação de dados.</p>
                </Card>
              </div>
            )}

            {activeTab === 'academic' && (
              <div className="space-y-6">
                <Card className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-slate-900">Alunos Registados Recentemente</h3>
                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">Total: {stats.totalStudents}</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-100">
                          <th className="text-left py-3 px-4 text-xs font-bold text-slate-400 uppercase">Nome</th>
                          <th className="text-left py-3 px-4 text-xs font-bold text-slate-400 uppercase">Email</th>
                          <th className="text-right py-3 px-4 text-xs font-bold text-slate-400 uppercase">Data de Registo</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentStudents.map(student => (
                          <tr key={student.id} className="border-b border-slate-50 hover:bg-slate-50">
                            <td className="py-4 px-4 font-bold text-slate-800">{student.name}</td>
                            <td className="py-4 px-4 text-slate-500">{student.email}</td>
                            <td className="py-4 px-4 text-right text-slate-400 text-sm">{new Date(student.created_at).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
                <Card className="p-10 text-center">
                   <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">groups</span>
                   <p className="text-slate-500 font-bold">Módulo de turmas e notas em desenvolvimento.</p>
                </Card>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default ExecutiveDashboard;
