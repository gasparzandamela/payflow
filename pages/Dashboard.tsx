

import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { User, Transaction } from '../types';
import Card from '../components/Card';
import Button from '../components/Button';

interface DashboardProps {
  user: User;
  history: Transaction[];
}

const Dashboard: React.FC<DashboardProps> = ({ user, history }) => {
  return (
    <Layout user={user} title="Dia-a-Dia">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-8">
        {/* Next Payment Card */}
        <Card hoverEffect className="flex flex-col justify-between group">
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-xs md:text-sm font-bold text-slate-400 uppercase tracking-widest">Próxima Mensalidade</p>
              <h3 className="text-2xl md:text-3xl font-black text-slate-900 mt-1 tracking-tight">Março 2026</h3>
              <p className="text-[10px] md:text-xs text-red-500 mt-1.5 font-black uppercase flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">warning</span>
                Vence em 5 dias
              </p>
            </div>
            <div className="p-3 md:p-4 bg-blue-50 rounded-2xl text-[#137FEC] group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-2xl">calendar_month</span>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mt-6 gap-4">
            <div>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mb-1">Valor Total</p>
              <p className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter">4.500,00 <span className="text-lg text-slate-400">MZN</span></p>
            </div>
            
            <Link to="/pay">
                <Button className="flex items-center gap-2 group/btn">
                    <span>Pagar agora</span>
                    <span className="material-symbols-outlined text-sm transition-transform group-hover/btn:translate-x-1">arrow_forward</span>
                </Button>
            </Link>
          </div>
        </Card>

        {/* Status Card */}
        <Card hoverEffect className="flex flex-col justify-between group">
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-xs md:text-sm font-bold text-slate-400 uppercase tracking-widest">Status Académico</p>
              <h3 className="text-2xl md:text-3xl font-black text-slate-900 mt-1 tracking-tight">Matrícula Activa</h3>
              <p className="text-[10px] md:text-xs text-green-600 mt-1.5 font-black uppercase flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">verified</span>
                Situação Regular
              </p>
            </div>
            <div className="p-3 md:p-4 bg-green-50 rounded-2xl text-green-600 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-2xl">school</span>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between text-[11px] md:text-xs mb-3">
              <span className="text-slate-600 font-black uppercase tracking-wider">12ª Classe / Turma B</span>
              <span className="text-slate-400 font-bold uppercase">Semestre 1</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden shadow-inner">
              <div className="bg-green-500 h-3 rounded-full transition-all duration-1000" style={{ width: '100%' }}></div>
            </div>
          </div>
        </Card>
      </div>

      {/* History Table Section */}
      <Card className="rounded-[2.5rem] p-6 md:p-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div>
            <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">Histórico Recente</h2>
            <p className="text-sm text-slate-400 font-medium">Seus últimos pagamentos efetuados</p>
          </div>
          <button className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all">
            <span className="material-symbols-outlined text-[18px]">download</span>
            <span>Relatório Completo</span>
          </button>
        </div>
        
        <div className="overflow-x-auto -mx-6 md:mx-0 px-6 md:px-0 scrollbar-hide">
          <div className="min-w-[600px]">
            {history.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-400 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
                <div className="size-16 rounded-full bg-white flex items-center justify-center mb-4 shadow-sm">
                  <span className="material-symbols-outlined text-3xl opacity-30">receipt_long</span>
                </div>
                <p className="text-sm font-bold uppercase tracking-widest opacity-60">Nenhum registo encontrado</p>
              </div>
            ) : (
              <table className="w-full text-left border-separate border-spacing-y-2">
                <thead>
                  <tr className="text-slate-400 text-[10px] uppercase font-black tracking-[0.2em]">
                    <th className="pb-4 pl-4">Transação</th>
                    <th className="pb-4 text-center">Data</th>
                    <th className="pb-4 text-right">Valor</th>
                    <th className="pb-4 text-center pr-4">Status</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {history.map((tx) => (
                    <tr key={tx.id} className="group bg-white hover:bg-slate-50 transition-all shadow-sm ring-1 ring-slate-100 rounded-2xl animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <td className="py-5 pl-4 rounded-l-2xl">
                        <div className="flex items-center gap-4">
                          <div className="size-10 rounded-xl flex items-center justify-center bg-blue-50 text-[#137FEC] group-hover:bg-blue-100 transition-colors">
                            <span className="material-symbols-outlined text-xl">payments</span>
                          </div>
                          <div>
                            <span className="block font-black text-slate-900 tracking-tight leading-none mb-1">{tx.description}</span>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Ref: {tx.id.toUpperCase()}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-5 text-center text-slate-500 font-bold text-xs uppercase">{tx.date}</td>
                      <td className="py-5 text-right font-black text-slate-900 tabular-nums">{tx.amount}</td>
                      <td className="py-5 text-center pr-4 rounded-r-2xl">
                        <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20">
                          {tx.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </Card>
      
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </Layout>
  );
};

export default Dashboard;

