import React, { useState, useEffect } from 'react';
import { User, Transaction, PaymentMethodType } from '../types'; // Adjust path if necessary
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import Modal from '../components/Modal';
import { ToastProvider, useToast } from '../components/Toast';
import StudentRegistrationForm from '../components/StudentRegistrationForm';

interface Student extends User {
  created_at?: string;
  status?: string; // from migration
}

import { DashboardStats } from '../components/DashboardStats';
import { EnrollmentChart } from '../components/EnrollmentChart';

const DashboardContent: React.FC<{ user: User }> = ({ user }) => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'students' | 'registration' | 'financial' | 'services' | 'notifications'>('students');
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Financial View State
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [studentTransactions, setStudentTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    if (activeTab === 'students') {
       fetchStudents();
    }
  }, [activeTab]);

  const fetchStudents = async () => {
    setLoading(true);
    // Fetch profiles - ensuring we get the name correctly.
    // If the 'name' column is empty or ID-like, we try to use raw_user_meta_data if accessible or just rely on 'full_name' if the column exists.
    // Ideally the 'profiles' view/table has 'full_name' or 'name'.
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'student')
      .order('created_at', { ascending: false });
    
    if (error) {
        console.error('Error fetching students:', error);
        addToast('Erro ao carregar lista de estudantes.', 'error');
    }
    else {
        // Fix for name display: check if name is email-like or id-like, if so, look for other fields or format
        const cleanData = (data || []).map((s: any) => ({
            ...s,
            // Fallback strategy for name: full_name -> first+last -> name -> email
            name: s.full_name || (s.first_name ? `${s.first_name} ${s.last_name || ''}` : s.name),
            // Ensure status has a default
            status: s.status || 'Activo',
            // Mock grade if missing (for demo)
            grade: s.grade || (Math.floor(Math.random() * 5) + 8) + 'ª Classe'
        }));
        setStudents(cleanData);
    }
    setLoading(false);
  };

  const filteredStudents = students.filter(s => 
      s.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      s.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const loadStudentFinancials = async (studentId: string) => {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', studentId)
      .order('created_at', { ascending: false });

    if (data) {
        const formatted: Transaction[] = data.map(tx => ({
            id: tx.id,
            description: tx.description,
            date: new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' }).format(new Date(tx.created_at)),
            amount: `${tx.amount} MZN`,
            status: tx.status,
            paymentMethod: tx.payment_method as PaymentMethodType
          }));
        setStudentTransactions(formatted);
    }
  };

  // --- Actions ---
  const handleEnrollment = async (type: 'enrollment' | 'renewal') => {
      // ... (Same logic as before) ...
      if (!selectedStudent || !selectedStudent.id) return;
      const confirmMsg = type === 'enrollment' ? 'Confirmar Nova Matrícula?' : 'Confirmar Renovação?';
      if (!window.confirm(confirmMsg)) return;

      const amount = type === 'enrollment' ? 5000 : 2500; 
      const description = type === 'enrollment' ? 'Matrícula Inicial' : 'Renovação de Matrícula';

      const { error } = await supabase.from('transactions').insert({
          user_id: selectedStudent.id,
          description: description,
          amount: amount,
          status: 'Sucesso', 
          payment_method: 'CASH', 
          entity: 'SECRETARIA',
          reference: 'MANUAL-' + Date.now()
      });

      if (error) addToast('Erro: ' + error.message, 'error');
      else {
          addToast('Sucesso!', 'success');
          loadStudentFinancials(selectedStudent.id);
      }
  };

  const handleCancelEnrollment = async () => {
    // ... (Same logic as before) ...
    if (!selectedStudent || !selectedStudent.id) return;
    const reason = prompt('Motivo do cancelamento:');
    if (!reason) return;

    await supabase.from('service_logs').insert({ student_id: selectedStudent.id, staff_id: user.id, service_type: 'Cancelamento', description: reason });
    await supabase.from('profiles').update({ status: 'cancelled' }).eq('id', selectedStudent.id);
    
    addToast('Matrícula cancelada.', 'success');
    fetchStudents();
    setSelectedStudent(prev => prev ? ({ ...prev, status: 'cancelled' }) : null);
  };

  const handleLogout = async () => {
    try { await fetch('/api/logout', { method: 'POST' }); } catch (err) { console.error(err); }
    navigate('/login'); window.location.reload();
  };
  
  return (
    <div className="flex h-screen bg-[#F8F9FA]">
      {/* Sidebar - Same as before but updated styles if needed */}
      <div className="w-64 bg-white border-r border-slate-200 flex flex-col z-20 shadow-sm">
        <div className="p-6 border-b border-slate-100">
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span className="material-icons-outlined text-[#137FEC]">admin_panel_settings</span>
            Secretaria
          </h1>
          <p className="text-xs text-slate-500 mt-1 pl-8">Painel Administrativo</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <button onClick={() => setActiveTab('students')} className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all ${activeTab === 'students' ? 'bg-[#E3F2FD] text-[#137FEC] shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}>
            <span className="material-icons-outlined">dashboard</span> Visão Geral
          </button>
          <button onClick={() => setActiveTab('registration')} className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all ${activeTab === 'registration' ? 'bg-[#E3F2FD] text-[#137FEC] shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}>
            <span className="material-icons-outlined">person_add</span> Novo Aluno
          </button>
        </nav>
        <div className="p-4 border-t border-slate-100">
             <button onClick={() => setShowLogoutModal(true)} className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-[#FF5252] hover:bg-red-50 transition-all font-bold text-sm">
              <span className="material-icons-outlined">logout</span> Encerrar Sessão
            </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto relative">
         {/* Top Header */}
        <header className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center sticky top-0 z-10 shadow-sm">
            <h2 className="text-xl font-bold text-slate-800 capitalize">
                {activeTab === 'students' ? 'Visão Geral' : 
                 activeTab === 'registration' ? 'Matrícula de Novo Estudante' : 'Serviços'}
            </h2>
            {activeTab === 'students' && (
                <button onClick={() => setActiveTab('registration')} className="bg-[#137FEC] hover:bg-[#1565C0] text-white px-5 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-95">
                    <span className="material-icons-outlined text-[18px]">add</span>
                    Novo Aluno
                </button>
            )}
        </header>

        <div className="p-8 max-w-[1600px] mx-auto">
            {activeTab === 'registration' ? (
                <StudentRegistrationForm onSuccess={() => { setActiveTab('students'); fetchStudents(); }} onCancel={() => setActiveTab('students')} />
            ) : activeTab === 'students' ? (
                <div className="animate-in fade-in duration-500">
                    <DashboardStats />
                    
                    <div className="flex gap-8 items-start">
                        {/* Left Column: Student List */}
                        <div className="flex-[2] flex flex-col gap-6">
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
                                <div className="p-5 border-b border-slate-100 flex justify-between items-center">
                                    <h3 className="font-bold text-slate-800 text-lg">Gestão de Estudantes</h3>
                                    <button onClick={() => setActiveTab('registration')} className="text-[#137FEC] text-xs font-bold bg-[#E3F2FD] px-3 py-1.5 rounded hover:bg-[#BBDEFB] transition-colors">+ Novo Aluno</button>
                                </div>
                                
                                <div className="p-4">
                                    <div className="relative mb-4">
                                        <span className="material-icons-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                                        <input 
                                            type="text" 
                                            placeholder="Buscar..." 
                                            value={searchTerm}
                                            onChange={e => setSearchTerm(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#137FEC]/20 focus:border-[#137FEC]"
                                        />
                                    </div>

                                    {/* Compact Student Table */}
                                    <table className="w-full text-left text-sm text-slate-600">
                                        <thead className="text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                                            <tr>
                                                <th className="px-4 py-3">Nome do Estudante</th>
                                                <th className="px-4 py-3">Classe</th>
                                                <th className="px-4 py-3">Estado</th>
                                                <th className="px-4 py-3 text-right">Acção</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {loading ? (
                                                <tr><td colSpan={4} className="p-8 text-center text-slate-400">Carregando estudantes...</td></tr>
                                            ) : filteredStudents.length === 0 ? (
                                                <tr><td colSpan={4} className="p-8 text-center text-slate-400">Nenhum resultado encontrado.</td></tr>
                                            ) : filteredStudents.slice(0, 8).map(student => (
                                                <tr key={student.id} className="hover:bg-slate-50/80 transition-colors group">
                                                    <td className="px-4 py-3.5">
                                                        <div className="flex items-center gap-3">
                                                            {/* Avatar Placeholder */}
                                                            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 flex-shrink-0 font-bold text-xs overflow-hidden">
                                                                {student.photo_url ? (
                                                                    <img src={student.photo_url} alt="" className="w-full h-full object-cover" />
                                                                ) : (
                                                                    student.name?.[0]?.toUpperCase() || 'A'
                                                                )}
                                                            </div>
                                                            <div>
                                                                <div className="font-semibold text-slate-800 text-sm">{student.name}</div>
                                                                {/* <div className="text-[10px] text-slate-400">{student.id?.split('-')[0]}...</div> */}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3.5 text-slate-500">{student.grade || '10ª Classe'}</td>
                                                    <td className="px-4 py-3.5">
                                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                                            student.status === 'Activo' ? 'bg-[#E8F5E9] text-[#00984A]' : 
                                                            student.status === 'Pendente' ? 'bg-[#FFF8E1] text-[#F57F17]' :
                                                            'bg-red-50 text-red-500'
                                                        }`}>
                                                            {student.status === 'Pendente' && <span className="material-icons-outlined text-[10px] mr-1">warning</span>}
                                                            {student.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3.5 text-right">
                                                        <button 
                                                            onClick={() => { setSelectedStudent(student); loadStudentFinancials(student.id || ''); }}
                                                            className="text-[#137FEC] hover:text-[#1565C0] font-bold text-xs bg-[#E3F2FD] px-3 py-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                                                        >
                                                            Gerir
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    <div className="p-4 text-center border-t border-slate-50">
                                        <button className="text-[#137FEC] text-sm font-bold hover:underline flex items-center justify-center gap-1 mx-auto">
                                            Ver Todos <span className="material-icons-outlined text-sm">arrow_forward</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Alerts & Chart */}
                        <div className="flex-1 flex flex-col gap-6 w-full max-w-sm">
                             {/* Alerts Section */}
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="font-bold text-slate-800 text-lg">Alertas / Pendências</h3>
                                    <div className="p-1 bg-slate-50 border border-slate-200 rounded text-xs text-slate-500 flex items-center gap-1 px-2 cursor-pointer">
                                        <span className="material-icons-outlined text-sm">filter_list</span> Filtro
                                    </div>
                                </div>
                                
                                <div className="space-y-5">
                                    <div className="flex gap-3 items-start">
                                        <div className="w-8 h-8 rounded bg-[#FFF8E1] text-[#F57F17] flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <span className="material-icons-outlined text-lg">warning</span>
                                        </div>
                                        <div className="text-sm text-slate-600">
                                            <span className="font-bold text-slate-800">Maria João Gomes</span> precisa completar a documentação.
                                        </div>
                                    </div>

                                    <div className="flex gap-3 items-start">
                                        <div className="w-8 h-8 rounded bg-[#FFEBEE] text-[#D32F2F] flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <span className="material-icons-outlined text-lg">error_outline</span>
                                        </div>
                                        <div className="text-sm text-slate-600">
                                            <span className="font-bold text-slate-800">Cartões</span> de Estudante aguardam emissão.
                                        </div>
                                    </div>
                                    
                                    <div className="flex gap-3 items-start">
                                        <div className="w-8 h-8 rounded bg-[#FFF8E1] text-[#F57F17] flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <span className="material-icons-outlined text-lg">warning</span>
                                        </div>
                                        <div className="text-sm text-slate-600">
                                            <span className="font-bold text-slate-800">8 matrículas</span> pendentes de validação.
                                        </div>
                                    </div>

                                    <div className="flex gap-3 items-start">
                                        <div className="w-8 h-8 rounded bg-[#E3F2FD] text-[#137FEC] flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <span className="material-icons-outlined text-lg">mail</span>
                                        </div>
                                        <div className="text-sm text-slate-600">
                                            <span className="font-bold text-slate-800">3 mensagens</span> não lidas dos pais.
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-6 pt-4 border-t border-slate-50 text-right">
                                    <button className="text-[#137FEC] text-xs font-bold hover:underline">Ver Todos (12) &rarr;</button>
                                </div>
                            </div>
                            
                            {/* Enrollment Chart */}
                            <EnrollmentChart />
                        </div>
                    </div>
                </div>
            ) : (
                <div className="text-center py-20 text-slate-400">Módulo em desenvolvimento</div>
            )}
        </div>
      </div>

     {/* Student Detail Modal/Panel - Using the existing logic but maybe refactored later if requested. Keeping it simple for now (Modal-like) */}
     {selectedStudent && (
         <Modal 
            isOpen={!!selectedStudent} 
            onClose={() => setSelectedStudent(null)} 
            title={selectedStudent.name}
            description={selectedStudent.email || 'Detalhes do Estudante'}
            icon="school"
         >
             <div className="space-y-4">
                 <div className="flex gap-2">
                     <button onClick={() => handleEnrollment('enrollment')} className="flex-1 bg-[#137FEC] text-white py-3 rounded-xl font-bold text-sm hover:bg-[#1565C0]">Nova Matrícula</button>
                     <button onClick={handleCancelEnrollment} className="flex-1 bg-red-50 text-red-500 py-3 rounded-xl font-bold text-sm hover:bg-red-100">Cancelar</button>
                 </div>
                 <div className="border-t border-slate-100 pt-4">
                     <h4 className="font-bold mb-2">Transações</h4>
                     {studentTransactions.length === 0 ? <p className="text-sm text-slate-400">Sem transações</p> : (
                         <div className="max-h-40 overflow-y-auto space-y-2">
                             {studentTransactions.map(t => (
                                 <div key={t.id} className="text-xs flex justify-between p-2 bg-slate-50 rounded">
                                     <span>{t.description}</span>
                                     <span className="font-bold">{t.amount}</span>
                                 </div>
                             ))}
                         </div>
                     )}
                 </div>
             </div>
         </Modal>
     )}

      {/* Logout Confirmation Modal */}
      <Modal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        title="Deseja sair?"
        description="Sua sessão atual será encerrada."
        icon="logout"
        iconColor="text-red-500 bg-red-50"
      >
          <div className="flex w-full flex-col gap-3">
            <button onClick={handleLogout} className="w-full rounded-2xl bg-red-500 py-4.5 text-sm font-bold text-white shadow-xl shadow-red-500/30 hover:bg-red-600 transition-all">Confirmar saída</button>
            <button onClick={() => setShowLogoutModal(false)} className="w-full rounded-2xl bg-slate-100 py-4.5 text-sm font-bold text-slate-600 hover:bg-slate-200 transition-all">Cancelar</button>
          </div>
      </Modal>
    </div>
  );
};

const SecretariatDashboard: React.FC<{ user: User }> = ({ user }) => {
    return (
        <ToastProvider>
            <DashboardContent user={user} />
        </ToastProvider>
    );
};

export default SecretariatDashboard;
