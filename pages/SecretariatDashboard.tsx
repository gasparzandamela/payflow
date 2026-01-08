import React, { useState, useEffect } from 'react';
import { User, Transaction, PaymentMethodType, PAYMENT_METHODS } from '../types'; // Adjust path if necessary
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

// Icons (using Material Icons strings as per other files)
// Assumes a component/library renders them, but here we just pass strings or use simple placeholders if no Icon component exists.
// Looking at types.ts, icons are just strings. `Layout.tsx` probably renders them.
// I will use a simple Icon helper here for local use if needed, or just standard HTML/CSS.

interface Student extends User {
  created_at?: string;
  status?: string; // from migration
}

const SecretariatDashboard: React.FC<{ user: User }> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<'students' | 'financial' | 'services' | 'notifications'>('students');
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Student Management State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newStudent, setNewStudent] = useState({ name: '', email: '', password: '' });
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // Financial View State
  const [studentTransactions, setStudentTransactions] = useState<Transaction[]>([]);

  // Enrollment State
  const [enrollmentType, setEnrollmentType] = useState<'enrollment' | 'renewal' | 'cancellation' | null>(null);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'student')
      .order('name');
    
    if (error) console.error('Error fetching students:', error);
    else setStudents(data || []);
    setLoading(false);
  };

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/students/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStudent)
      });
      
      if (response.ok) {
        alert('Estudante criado com sucesso!');
        setShowCreateModal(false);
        setNewStudent({ name: '', email: '', password: '' });
        fetchStudents();
      } else {
        const err = await response.json();
        alert('Erro ao criar: ' + (err.message || err.error));
      }
    } catch (error) {
      console.error('Error creating student:', error);
      alert('Erro de conexão.');
    }
  };

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
      if (!selectedStudent || !selectedStudent.id) return;
      
      const confirmMsg = type === 'enrollment' ? 'Confirmar Nova Matrícula?' : 'Confirmar Renovação?';
      if (!window.confirm(confirmMsg)) return;

      const amount = type === 'enrollment' ? 5000 : 2500; // Example values
      const description = type === 'enrollment' ? 'Matrícula Inicial' : 'Renovação de Matrícula';

      // Insert Transaction directly (Secretariat has permission via policy or we assume functionality)
      // Note: If policy doesn't allow Insert for 'secretaria', this will fail.
      // We added `is_admin` to include `secretaria` in the migration, so they should be able to insert if logic uses `is_admin`.
      
      const { error } = await supabase.from('transactions').insert({
          user_id: selectedStudent.id,
          description: description,
          amount: amount,
          status: 'Sucesso', // Setup as paid/confirmed immediately by secretariat? Or Pendente? Assuming Sucesso for manual entry.
          payment_method: 'CASH', // Default or ask.
          entity: 'SECRETARIA',
          reference: 'MANUAL-' + Date.now()
      });

      if (error) {
          alert('Erro ao registrar matrícula: ' + error.message);
      } else {
          alert('Matrícula registrada com sucesso!');
          loadStudentFinancials(selectedStudent.id);
      }
  };

  const handleCancelEnrollment = async () => {
    if (!selectedStudent || !selectedStudent.id) return;
    const reason = prompt('Motivo do cancelamento:');
    if (!reason) return;

    // Log this cancellation (Service Log)
    // Assuming service_logs table exists from migration
    const { error } = await supabase.from('service_logs').insert({
        student_id: selectedStudent.id,
        staff_id: user.id || user.id, // Authenticated user
        service_type: 'Cancelamento',
        description: reason
    });

    if (error) {
        console.error('Log error', error);
        // Fallback if table doesn't exist yet, just alert
    }

    // Update profile status if column exists
    const { error: profileError } = await supabase
        .from('profiles')
        .update({ status: 'cancelled' }) // Assumes status column
        .eq('id', selectedStudent.id);

    if (profileError) {
        alert('Erro ao cancelar: ' + profileError.message);
    } else {
        alert('Matrícula cancelada.');
        fetchStudents(); // Refresh list to show status
    }
  };
  
  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar / Navigation */}
      <div className="w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-6 border-b border-slate-100">
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span className="material-icons-outlined text-[#137FEC]">admin_panel_settings</span>
            Secretaria
          </h1>
          <p className="text-xs text-slate-500 mt-1">Painel Administrativo</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          <button 
            onClick={() => setActiveTab('students')}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-colors ${
              activeTab === 'students' 
                ? 'bg-[#137FEC]/10 text-[#137FEC]' 
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span className="material-icons-outlined">people</span>
            Estudantes
          </button>
          
          <button 
            onClick={() => setActiveTab('services')}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-colors ${
              activeTab === 'services' 
                ? 'bg-[#137FEC]/10 text-[#137FEC]' 
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span className="material-icons-outlined">support_agent</span>
            Atendimento
          </button>
        </nav>
        
        <div className="p-4 border-t border-slate-100">
            <div className="flex items-center gap-3 px-4 py-3">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-medium text-xs">
                    {user.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{user.name}</p>
                    <p className="text-xs text-slate-500 truncate capitalize">{user.role}</p>
                </div>
            </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <header className="bg-white border-b border-slate-200 px-8 py-5 flex justify-between items-center sticky top-0 z-10">
            <h2 className="text-xl font-bold text-slate-800 capitalize">
                {activeTab === 'students' ? 'Gestão de Estudantes' : 'Atendimento e Serviços'}
            </h2>
            {activeTab === 'students' && (
                <button 
                    onClick={() => setShowCreateModal(true)}
                    className="bg-[#137FEC] hover:bg-[#137FEC]/90 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
                >
                    <span className="material-icons-outlined text-[18px]">add</span>
                    Novo Aluno
                </button>
            )}
        </header>

        <div className="p-8">
            {activeTab === 'students' && (
                <div className="flex gap-6">
                    {/* Student List */}
                    <div className={`${selectedStudent ? 'w-1/2' : 'w-full'} transition-all duration-300`}>
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                            <table className="w-full text-left text-sm text-slate-600">
                                <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-700">
                                    <tr>
                                        <th className="px-6 py-4">Nome</th>
                                        <th className="px-6 py-4">Email</th>
                                        <th className="px-6 py-4">Estado</th>
                                        <th className="px-6 py-4">Ação</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {loading ? (
                                        <tr><td colSpan={4} className="p-6 text-center">Carregando...</td></tr>
                                    ) : students.map(student => (
                                        <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-slate-900">{student.name}</td>
                                            <td className="px-6 py-4">{student.email}</td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                    student.status === 'cancelled' 
                                                        ? 'bg-red-100 text-red-800' 
                                                        : 'bg-green-100 text-green-800'
                                                }`}>
                                                    {student.status || 'Activo'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <button 
                                                    onClick={() => {
                                                        setSelectedStudent(student);
                                                        if (student.id) loadStudentFinancials(student.id);
                                                    }}
                                                    className="text-[#137FEC] hover:text-[#137FEC]/80 font-medium"
                                                >
                                                    Gerir
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Selected Student Detail Panel */}
                    {selectedStudent && (
                        <div className="w-1/2 flex flex-col gap-6">
                            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-800">{selectedStudent.name}</h3>
                                        <p className="text-slate-500 text-sm">{selectedStudent.email}</p>
                                    </div>
                                    <button onClick={() => setSelectedStudent(null)} className="text-slate-400 hover:text-slate-600">
                                        <span className="material-icons-outlined">close</span>
                                    </button>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <button 
                                        onClick={() => handleEnrollment('enrollment')}
                                        className="p-4 rounded-xl border border-slate-200 hover:border-[#137FEC] hover:bg-[#137FEC]/5 transition-all text-left group"
                                    >
                                        <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center mb-3 group-hover:bg-[#137FEC] group-hover:text-white transition-colors">
                                            <span className="material-icons-outlined">school</span>
                                        </div>
                                        <div className="font-semibold text-slate-800">Nova Matrícula</div>
                                        <div className="text-xs text-slate-500 mt-1">Registrar pagamento de matrícula</div>
                                    </button>

                                    <button 
                                        onClick={() => handleEnrollment('renewal')}
                                        className="p-4 rounded-xl border border-slate-200 hover:border-green-500 hover:bg-green-50 transition-all text-left group"
                                    >
                                        <div className="w-10 h-10 rounded-lg bg-green-100 text-green-600 flex items-center justify-center mb-3 group-hover:bg-green-500 group-hover:text-white transition-colors">
                                            <span className="material-icons-outlined">autorenew</span>
                                        </div>
                                        <div className="font-semibold text-slate-800">Renovar</div>
                                        <div className="text-xs text-slate-500 mt-1">Renovação anual</div>
                                    </button>
                                    
                                    <button 
                                        onClick={handleCancelEnrollment}
                                        className="p-4 rounded-xl border border-slate-200 hover:border-red-500 hover:bg-red-50 transition-all text-left group"
                                    >
                                        <div className="w-10 h-10 rounded-lg bg-red-100 text-red-600 flex items-center justify-center mb-3 group-hover:bg-red-500 group-hover:text-white transition-colors">
                                            <span className="material-icons-outlined">block</span>
                                        </div>
                                        <div className="font-semibold text-slate-800">Cancelar</div>
                                        <div className="text-xs text-slate-500 mt-1">Cancelar matrícula</div>
                                    </button>
                                </div>

                                <h4 className="font-semibold text-slate-800 mb-4 border-t border-slate-100 pt-4">Histórico Financeiro</h4>
                                <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                                    {studentTransactions.length === 0 ? (
                                        <p className="text-sm text-slate-400 italic">Sem transações registradas.</p>
                                    ) : (
                                        studentTransactions.map(tx => (
                                            <div key={tx.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                                                <div>
                                                    <p className="text-sm font-medium text-slate-900">{tx.description}</p>
                                                    <p className="text-xs text-slate-500">{tx.date} • {tx.paymentMethod}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-bold text-slate-900">{tx.amount}</p>
                                                    <span className="text-[10px] uppercase font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                                                        {tx.status}
                                                    </span>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'services' && (
                <div className="max-w-2xl mx-auto">
                    <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm text-center">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                            <span className="material-icons-outlined text-3xl">construction</span>
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 mb-2">Em Desenvolvimento</h3>
                        <p className="text-slate-500">
                            O módulo de registro de atendimento e envio de notificações está sendo implementado.
                        </p>
                    </div>
                </div>
            )}
        </div>
      </div>

      {/* Create Student Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 m-4">
            <h3 className="text-xl font-bold text-slate-800 mb-4">Adicionar Novo Aluno</h3>
            <form onSubmit={handleCreateStudent} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nome Completo</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:border-[#137FEC] focus:ring-2 focus:ring-[#137FEC]/20 outline-none transition-all"
                  value={newStudent.name}
                  onChange={e => setNewStudent({...newStudent, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email Institucional</label>
                <input
                  type="email"
                  required
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:border-[#137FEC] focus:ring-2 focus:ring-[#137FEC]/20 outline-none transition-all"
                  value={newStudent.email}
                  onChange={e => setNewStudent({...newStudent, email: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Senha Temporária</label>
                <input
                  type="password"
                  required
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:border-[#137FEC] focus:ring-2 focus:ring-[#137FEC]/20 outline-none transition-all"
                  value={newStudent.password}
                  onChange={e => setNewStudent({...newStudent, password: e.target.value})}
                />
              </div>
              
              <div className="flex gap-3 mt-8 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 text-slate-600 font-medium hover:bg-slate-50 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-[#137FEC] text-white font-medium rounded-lg hover:bg-[#137FEC]/90 transition-colors shadow-sm shadow-blue-200"
                >
                  Criar Aluno
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SecretariatDashboard;
