import React, { useEffect, useState } from 'react';
import { User, Transaction } from '../types';
import { supabase } from '../supabaseClient';
import { useToast } from './Toast';

interface Props {
    student: User;
    onEditStudent: () => void;
    onBack: () => void;
}

const StudentDetailView: React.FC<Props> = ({ student, onEditStudent, onBack }) => {
    const { addToast } = useToast();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchTransactions();
    }, [student.id]);

    const fetchTransactions = async () => {
        setLoading(true);
        if (!student.id) return;
        
        const { data, error } = await supabase
            .from('transactions')
            .select('*')
            .eq('user_id', student.id)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching transactions:', error);
            addToast('Erro ao carregar pagamentos.', 'error');
        } else if (data) {
             const formatted: Transaction[] = data.map(tx => ({
                id: tx.id,
                description: tx.description,
                date: new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(tx.created_at)),
                amount: `${tx.amount} MZN`,
                status: tx.status,
                entity: tx.entity || '12345', // Default entity if missing
                reference: tx.reference || 'REF-000',
                paymentMethod: tx.payment_method
              }));
            setTransactions(formatted);
        }
        setLoading(false);
    };

    return (
        <div className="flex flex-col h-full bg-[#faedd900]"> {/* Transparent/White Bg */}
            
            {/* Header / Profile Card */}
            <div className="bg-white p-8 border-b border-slate-200">
                 <div className="flex items-start justify-between">
                     <div>
                        <h2 className="text-2xl font-bold text-slate-800 mb-1">Perfil do Estudante</h2>
                        {/* No Breadcrumbs */}
                     </div>
                     <button 
                        onClick={onBack}
                        className="flex items-center gap-2 text-slate-500 hover:text-slate-700 font-bold text-sm bg-slate-50 px-4 py-2 rounded-lg transition-colors"
                     >
                        <span className="material-icons-outlined text-lg">arrow_back</span>
                        Voltar
                     </button>
                 </div>

                 <div className="mt-8 flex items-center justify-between">
                     <div className="flex items-center gap-6">
                         <div className="w-16 h-16 rounded-full bg-[#E3F2FD] text-[#137FEC] flex items-center justify-center text-2xl font-bold border-2 border-white shadow-sm overflow-hidden">
                            {(student as any).photo_url ? (
                                <img src={(student as any).photo_url} className="w-full h-full object-cover" />
                            ) : (
                                <span className="material-icons-outlined text-3xl">school</span>
                            )}
                         </div>
                         <div>
                             <h1 className="text-2xl font-bold text-slate-900">{student.name}</h1>
                             <div className="flex items-center gap-3 mt-1">
                                 <span className="text-slate-500 text-sm">{student.email}</span>
                                 <span className="px-2 py-0.5 bg-[#E8F5E9] text-[#00984A] text-[10px] font-bold uppercase rounded">
                                     {student.status || 'Activo'}
                                 </span>
                             </div>
                         </div>
                     </div>
                     
                     {/* "Dados do Aluno" Button - Primary Action for Edit */}
                     <button 
                        onClick={onEditStudent}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-2.5 rounded-lg font-bold text-sm transition-all"
                     >
                        Dados do Aluno
                     </button>
                 </div>
            </div>

            {/* Main Content - Single View - Financial Table */}
            <div className="p-8 flex-1 overflow-auto bg-[#F8F9FA]">
                 
                 {/* Table Card */}
                 <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                     
                     <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                         {/* Removed "Nova Matrícula" as per red circle removal instructions if it was adjacent to search */}
                         <div className="relative w-96">
                             <span className="material-icons-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                             <input 
                                type="text" 
                                placeholder="Buscar..." 
                                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#137FEC]"
                             />
                         </div>
                     </div>

                     <table className="w-full text-left text-sm text-slate-600">
                         <thead className="text-xs font-bold text-slate-500 uppercase tracking-wider bg-slate-50/50 border-b border-slate-100">
                             <tr>
                                 <th className="px-6 py-4">Descrição</th>
                                 <th className="px-6 py-4">Referencia</th> 
                                 <th className="px-6 py-4">Montante</th>
                                 <th className="px-6 py-4">Data</th>
                             </tr>
                         </thead>
                         <tbody className="divide-y divide-slate-50">
                             {loading ? (
                                 <tr><td colSpan={4} className="p-8 text-center text-slate-400">Carregando...</td></tr>
                             ) : transactions.length === 0 ? (
                                 <tr><td colSpan={4} className="p-8 text-center text-slate-400">Nenhum pagamento encontrado.</td></tr>
                             ) : transactions.map(tx => (
                                 <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                                     <td className="px-6 py-4 font-medium text-slate-800">{tx.description}</td>
                                     <td className="px-6 py-4 font-mono text-slate-500">{tx.reference || '---'}</td>
                                     <td className="px-6 py-4 font-bold text-slate-800">{tx.amount}</td>
                                     <td className="px-6 py-4 text-slate-500">{tx.date}</td>
                                 </tr>
                             ))}
                         </tbody>
                     </table>
                      
                      <div className="p-4 border-t border-slate-50 flex justify-end gap-2">
                           <div className="flex gap-1">
                               <button className="w-8 h-8 flex items-center justify-center rounded bg-[#137FEC] text-white text-xs font-bold">1</button>
                               <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-slate-100 text-slate-600 text-xs font-bold">2</button>
                               <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-slate-100 text-slate-600 text-xs font-bold"><span className="material-icons-outlined text-xs">chevron_right</span></button>
                           </div>
                      </div>
                 </div>
            </div>
        </div>
    );
};

export default StudentDetailView;
