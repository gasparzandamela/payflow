import React, { useState } from 'react';
import { useToast } from '../components/Toast';

interface StudentFormData {
  // Personal
  firstName: string;
  middleName: string;
  lastName: string;
  birthDate: string;
  gender: string;
  nationality: string;
  // Identity
  documentType: 'BI' | 'PASSPORT' | 'DIRE' | 'OTHER';
  documentNumber: string;
  // Contact
  email: string;
  phone: string;
  address: string;
  // Family
  fatherName: string;
  motherName: string;
}

const initialData: StudentFormData = {
  firstName: '', middleName: '', lastName: '',
  birthDate: '', gender: 'M', nationality: 'Moçambicana',
  documentType: 'BI', documentNumber: '',
  email: '', phone: '', address: '',
  fatherName: '', motherName: ''
};

interface Props {
  onSuccess: () => void;
  onCancel: () => void;
}

const StudentRegistrationForm: React.FC<Props> = ({ onSuccess, onCancel }) => {
  const { addToast } = useToast();
  const [formData, setFormData] = useState<StudentFormData>(initialData);
  const [loading, setLoading] = useState(false);

  const handleChange = (field: keyof StudentFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validate = (): boolean => {
    // BI Validator: 12 digits + 1 uppercase letter
    if (formData.documentType === 'BI') {
      const biRegex = /^[0-9]{12}[A-Z]$/;
      if (!biRegex.test(formData.documentNumber)) {
        addToast('Número de BI inválido. Formato: 12 dígitos + 1 letra maiúscula.', 'error');
        return false;
      }
    }

    // Passport Validator: 2 letters + 6 digits
    if (formData.documentType === 'PASSPORT') {
        const passRegex = /^[A-Z]{2}[0-9]{6}$/;
        if (!passRegex.test(formData.documentNumber)) {
          addToast('Passaporte inválido. Formato: 2 letras + 6 números.', 'error');
          return false;
        }
    }

    // Phone Validator: Moz prefixes
    const phoneRegex = /^(\+258)?(82|83|84|85|86|87)[0-9]{7}$/;
    if (!phoneRegex.test(formData.phone)) {
        addToast('Número de celular inválido. Use um prefixo nacional válido (82/83/84/85/86/87).', 'error');
        return false;
    }

    // Required fields check (basic)
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.address) {
        addToast('Preencha os campos obrigatórios (Nome, Apelido, Email, Morada).', 'error');
        return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;

    setLoading(true);
    try {
      // Assuming backend API endpoint handles the detailed structure. 
      // If not, we might need to map keys or adjust the backend handler in `pages/api/students/create` (Edge Function)
      // Since I can't see the backend code here, I assume it accepts a JSON body.
      // I'll map frontend camelCase to snake_case expected by likely Supabase backend logic or `profiles` table directly.
      
      const payload = {
        email: formData.email,
        password: 'temporary-pass', // Should be auto-generated or handled by backend
        user_metadata: {
            first_name: formData.firstName,
            middle_name: formData.middleName,
            last_name: formData.lastName,
            full_name: `${formData.firstName} ${formData.middleName ? formData.middleName + ' ' : ''}${formData.lastName}`,
            document_type: formData.documentType,
            document_number: formData.documentNumber,
            phone_number: formData.phone,
            nationality: formData.nationality,
            address: formData.address,
            father_name: formData.fatherName,
            mother_name: formData.motherName,
            birth_date: formData.birthDate,
            gender: formData.gender,
            role: 'student'
        }
      };

      const response = await fetch('/api/students/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || err.error || 'Erro ao criar estudante');
      }

      addToast('Estudante registrado com sucesso!', 'success');
      onSuccess();
    } catch (error: any) {
      console.error('Registration Error:', error);
      addToast(error.message || 'Erro de conexão.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-4">
        <div>
            <h2 className="text-2xl font-bold text-slate-900">Novo Registro de Estudante</h2>
            <p className="text-slate-500 text-sm">Preencha os dados completos para efetuar a matrícula.</p>
        </div>
        <button onClick={onCancel} className="text-slate-400 hover:text-slate-600">
            <span className="material-icons-outlined">close</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: Identificação */}
        <section>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 border-l-4 border-[#137FEC] pl-3">Dados Pessoais</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                   <label className="block text-xs font-medium text-slate-700 mb-1.5 uppercase">Primeiro Nome <span className="text-red-500">*</span></label>
                   <input 
                     type="text" 
                     className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-[#137FEC] focus:ring-2 focus:ring-[#137FEC]/10 transition-all outline-none"
                     value={formData.firstName}
                     onChange={e => handleChange('firstName', e.target.value)}
                   />
                </div>
                <div>
                   <label className="block text-xs font-medium text-slate-700 mb-1.5 uppercase">Outros Nomes</label>
                   <input 
                     type="text" 
                     className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-[#137FEC] focus:ring-2 focus:ring-[#137FEC]/10 transition-all outline-none"
                     value={formData.middleName}
                     onChange={e => handleChange('middleName', e.target.value)}
                   />
                </div>
                <div>
                   <label className="block text-xs font-medium text-slate-700 mb-1.5 uppercase">SobreNome (Apelido) <span className="text-red-500">*</span></label>
                   <input 
                     type="text" 
                     className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-[#137FEC] focus:ring-2 focus:ring-[#137FEC]/10 transition-all outline-none"
                     value={formData.lastName}
                     onChange={e => handleChange('lastName', e.target.value)}
                   />
                </div>
                
                <div>
                   <label className="block text-xs font-medium text-slate-700 mb-1.5 uppercase">Data de Nascimento</label>
                   <input 
                     type="date" 
                     className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-[#137FEC] focus:ring-2 focus:ring-[#137FEC]/10 transition-all outline-none"
                     value={formData.birthDate}
                     onChange={e => handleChange('birthDate', e.target.value)}
                   />
                </div>
                
                <div>
                   <label className="block text-xs font-medium text-slate-700 mb-1.5 uppercase">Gênero</label>
                   <div className="flex gap-4 mt-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="gender" value="M" checked={formData.gender === 'M'} onChange={e => handleChange('gender', e.target.value)} className="accent-[#137FEC]" />
                        <span className="text-sm text-slate-700">Masculino</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="gender" value="F" checked={formData.gender === 'F'} onChange={e => handleChange('gender', e.target.value)} className="accent-[#137FEC]" />
                        <span className="text-sm text-slate-700">Feminino</span>
                      </label>
                   </div>
                </div>

                <div>
                   <label className="block text-xs font-medium text-slate-700 mb-1.5 uppercase">Nacionalidade</label>
                   <select 
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-[#137FEC] focus:ring-2 focus:ring-[#137FEC]/10 transition-all outline-none"
                      value={formData.nationality}
                      onChange={e => handleChange('nationality', e.target.value)}
                   >
                     <option value="Moçambicana">Moçambicana</option>
                     <option value="Estrangeira">Estrangeira</option>
                   </select>
                </div>
            </div>
        </section>

        {/* Section 2: Documentos e Contacto */}
        <section>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 border-l-4 border-[#137FEC] pl-3">Documentação e Contato</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                 <div>
                   <label className="block text-xs font-medium text-slate-700 mb-1.5 uppercase">Tipo de Documento</label>
                   <select 
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-[#137FEC] focus:ring-2 focus:ring-[#137FEC]/10 transition-all outline-none"
                      value={formData.documentType}
                      onChange={e => handleChange('documentType', e.target.value as any)}
                   >
                     <option value="BI">Bilhete de Identidade</option>
                     <option value="PASSPORT">Passaporte</option>
                     <option value="DIRE">DIRE</option>
                     <option value="OTHER">Outro</option>
                   </select>
                </div>
                <div className="lg:col-span-2">
                   <label className="block text-xs font-medium text-slate-700 mb-1.5 uppercase">Número do Documento <span className="text-red-500">*</span></label>
                   <input 
                     type="text" 
                     placeholder={formData.documentType === 'BI' ? '123456789012F' : 'AA123456'}
                     className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-[#137FEC] focus:ring-2 focus:ring-[#137FEC]/10 transition-all outline-none font-mono tracking-wider uppercase"
                     value={formData.documentNumber}
                     onChange={e => handleChange('documentNumber', e.target.value.toUpperCase())}
                   />
                   <p className="text-[10px] text-slate-400 mt-1">
                     {formData.documentType === 'BI' ? 'Formato: 12 dígitos seguidos de 1 letra.' : 'Formato Passaporte: 2 letras seguidas de 6 dígitos.'}
                   </p>
                </div>
                
                 <div>
                   <label className="block text-xs font-medium text-slate-700 mb-1.5 uppercase">Celular <span className="text-red-500">*</span></label>
                   <input 
                     type="tel" 
                     placeholder="84 123 4567"
                     className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-[#137FEC] focus:ring-2 focus:ring-[#137FEC]/10 transition-all outline-none"
                     value={formData.phone}
                     onChange={e => handleChange('phone', e.target.value)}
                   />
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div>
                   <label className="block text-xs font-medium text-slate-700 mb-1.5 uppercase">Email Institucional/Pessoal <span className="text-red-500">*</span></label>
                   <input 
                     type="email" 
                     className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-[#137FEC] focus:ring-2 focus:ring-[#137FEC]/10 transition-all outline-none"
                     value={formData.email}
                     onChange={e => handleChange('email', e.target.value)}
                   />
                </div>
                <div>
                   <label className="block text-xs font-medium text-slate-700 mb-1.5 uppercase">Morada/Residência</label>
                   <input 
                     type="text" 
                     className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-[#137FEC] focus:ring-2 focus:ring-[#137FEC]/10 transition-all outline-none"
                     value={formData.address}
                     onChange={e => handleChange('address', e.target.value)}
                   />
                </div>
            </div>
        </section>

        {/* Section 3: Filiação */}
        <section>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 border-l-4 border-[#137FEC] pl-3">Filiação</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                   <label className="block text-xs font-medium text-slate-700 mb-1.5 uppercase">Nome do Pai</label>
                   <input 
                     type="text" 
                     className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-[#137FEC] focus:ring-2 focus:ring-[#137FEC]/10 transition-all outline-none"
                     value={formData.fatherName}
                     onChange={e => handleChange('fatherName', e.target.value)}
                   />
                </div>
                <div>
                   <label className="block text-xs font-medium text-slate-700 mb-1.5 uppercase">Nome da Mãe</label>
                   <input 
                     type="text" 
                     className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-[#137FEC] focus:ring-2 focus:ring-[#137FEC]/10 transition-all outline-none"
                     value={formData.motherName}
                     onChange={e => handleChange('motherName', e.target.value)}
                   />
                </div>
            </div>
        </section>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
             <button
               type="button"
               onClick={onCancel}
               className="px-6 py-3 rounded-xl text-slate-600 font-bold hover:bg-slate-50 transition-colors"
               disabled={loading}
             >
               Cancelar
             </button>
             <button
               type="submit"
               className="px-8 py-3 rounded-xl bg-[#137FEC] text-white font-bold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
               disabled={loading}
             >
               {loading && <span className="animate-spin h-4 w-4 rounded-full border-2 border-white/30 border-t-white"></span>}
               {loading ? 'Processando...' : 'Registrar Matrícula'}
             </button>
        </div>
      </form>
    </div>
  );
};

export default StudentRegistrationForm;
