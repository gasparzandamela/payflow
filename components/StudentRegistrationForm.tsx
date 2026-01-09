import React, { useState } from 'react';
import { useToast } from '../components/Toast';

interface StudentFormData {
  // Dados do Aluno (Tab 1)
  fullName: string;
  birthDate: string;
  documentType: string;
  documentNumber: string;
  nationality: string;
  gender: string;
  birthPlace: string;
  phone: string;
  address: string;
  district: string;
  province: string;
  
  // Other Tabs (Placeholders for now, keeping some previous data)
  email: string;
  fatherName: string;
  motherName: string;
}

const initialData: StudentFormData = {
  fullName: '',
  birthDate: '',
  documentType: 'Selecione',
  documentNumber: '',
  nationality: 'Selecione',
  gender: 'Masculino',
  birthPlace: '',
  phone: '',
  address: '',
  district: 'Selecione',
  province: 'Selecione',
  
  email: '',
  fatherName: '',
  motherName: ''
};

interface Props {
  onSuccess: () => void;
  onCancel: () => void;
}

const StudentRegistrationForm: React.FC<Props> = ({ onSuccess, onCancel }) => {
  const { addToast } = useToast();
  const [formData, setFormData] = useState<StudentFormData>(initialData);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('Dados do Aluno');

  const tabs = [
    'Dados do Aluno',
    'Encarregado de Educação',
    'Documentos',
    'Informações Acadêmicas',
    'Adicionais (Opcional)'
  ];

  const handleChange = (field: keyof StudentFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validate = (): boolean => {
    // Basic validation for the visible tab
    if (activeTab === 'Dados do Aluno') {
        if (!formData.fullName) {
             addToast('Por favor, insira o Nome Completo.', 'error');
             return false;
        }
        if (!formData.birthDate) {
            addToast('Por favor, insira a Data de Nascimento.', 'error');
            return false;
        }
        if (formData.documentType === 'Selecione') {
            addToast('Por favor, selecione o Tipo de Documento.', 'error');
            return false;
        }
        if (!formData.documentNumber) {
            addToast('Por favor, insira o Número do Documento.', 'error');
            return false;
        }
        if (formData.nationality === 'Selecione') {
             addToast('Por favor, selecione a Nacionalidade.', 'error');
             return false;
        }
        if (!formData.address) {
             addToast('Por favor, insira a Morada.', 'error');
             return false;
        }
    }
    return true;
  };

  const splitName = (fullName: string) => {
    const parts = fullName.trim().split(/\s+/);
    const firstName = parts[0] || '';
    const lastName = parts.length > 1 ? parts[parts.length - 1] : '';
    const middleName = parts.length > 2 ? parts.slice(1, -1).join(' ') : '';
    return { firstName, middleName, lastName };
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      const { firstName, middleName, lastName } = splitName(formData.fullName);

      // Construct payload compatible with backend
      const payload = {
        email: formData.email || `student.${Date.now()}@payflow.com`, // Fallback generation if email hidden
        password: 'temporary-pass',
        user_metadata: {
            first_name: firstName,
            middle_name: middleName,
            last_name: lastName,
            full_name: formData.fullName,
            document_type: formData.documentType,
            document_number: formData.documentNumber,
            phone_number: formData.phone,
            nationality: formData.nationality,
            address: formData.address,
            // New fields mapping
            birth_place: formData.birthPlace,
            district: formData.district,
            province: formData.province,
            gender: formData.gender === 'Masculino' ? 'M' : 'F',
            
            father_name: formData.fatherName,
            mother_name: formData.motherName,
            birth_date: formData.birthDate,
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
    <div className="bg-white rounded-md shadow-sm border border-slate-200 w-full max-w-6xl mx-auto flex flex-col h-[85vh]">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
            <div className="bg-[#137FEC] p-2 rounded-lg">
                <span className="material-icons-outlined text-white text-xl">school</span>
            </div>
            <h2 className="text-xl font-bold text-slate-800">Cadastro de Aluno</h2>
        </div>
        <div className="flex items-center gap-3">
            <button className="px-4 py-2 text-sm font-medium text-[#137FEC] border border-[#137FEC]/30 rounded bg-[#137FEC]/5 hover:bg-[#137FEC]/10 transition-colors">
                Matricula Provisória
            </button>
            <button className="px-4 py-2 text-sm font-medium text-slate-600 border border-slate-300 rounded hover:bg-slate-50 transition-colors">
                Guardar Rascunho
            </button>
            <button 
                onClick={handleSubmit} 
                className="px-4 py-2 text-sm font-bold text-white bg-[#00984A] rounded hover:bg-[#00984A]/90 transition-colors flex items-center gap-2"
                disabled={loading}
            >
                {loading ? 'Processando...' : 'Submeter Matrícula'}
                <span className="material-icons-outlined text-sm">chevron_right</span>
            </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 bg-slate-50 px-6">
        {tabs.map((tab) => (
            <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-4 text-sm font-medium transition-colors relative ${
                    activeTab === tab 
                        ? 'text-white bg-[#137FEC]' 
                        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                }`}
                style={{
                    borderTopLeftRadius: '6px',
                    borderTopRightRadius: '6px',
                    marginBottom: '-1px' // Overlap border
                }}
            >
                {tab}
            </button>
        ))}
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-8 bg-white">
        {activeTab === 'Dados do Aluno' && (
            <div className="flex gap-8">
                {/* Photo Upload */}
                <div className="w-48 flex-shrink-0">
                    <div className="border border-slate-200 rounded-lg p-2 bg-slate-50 text-center">
                        <div className="w-full aspect-[3/4] bg-slate-200 rounded-md mb-3 flex items-center justify-center text-slate-400 overflow-hidden">
                             <span className="material-icons-outlined text-6xl">person</span>
                        </div>
                        <button className="w-full py-1.5 bg-white border border-slate-300 rounded text-xs font-medium text-slate-600 hover:bg-slate-50">
                            Carregar Foto
                        </button>
                    </div>
                </div>

                {/* Form Fields */}
                <div className="flex-1 space-y-8">
                    {/* Identificação */}
                    <section>
                        <h3 className="text-[#137FEC] font-bold mb-4 text-sm">Dados de Identificação</h3>
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 gap-4">
                                <FormRow label="Nome Completo" required>
                                    <input 
                                        type="text" 
                                        className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#137FEC] focus:ring-1 focus:ring-[#137FEC]"
                                        value={formData.fullName}
                                        onChange={(e) => handleChange('fullName', e.target.value)}
                                    />
                                </FormRow>
                            </div>
                            
                            <div className="flex gap-4">
                                <div className="w-1/3">
                                    <FormRow label="Data de Nascimento" required>
                                        <div className="relative">
                                            <input 
                                                type="date" 
                                                className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#137FEC] focus:ring-1 focus:ring-[#137FEC] pr-10"
                                                value={formData.birthDate}
                                                onChange={(e) => handleChange('birthDate', e.target.value)}
                                            />
                                        </div>
                                    </FormRow>
                                </div>
                                <div className="w-1/3">
                                    <FormRow label="Tipo de Documento" required>
                                        <select 
                                            className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#137FEC] focus:ring-1 focus:ring-[#137FEC] bg-white"
                                            value={formData.documentType}
                                            onChange={(e) => handleChange('documentType', e.target.value)}
                                        >
                                            <option>Selecione</option>
                                            <option value="BI">Bilhete de Identidade</option>
                                            <option value="PASSPORT">Passaporte</option>
                                            <option value="DIRE">DIRE</option>
                                        </select>
                                    </FormRow>
                                </div>
                            </div>

                            <div className="flex gap-4 items-start">
                                <div className="w-1/2">
                                     <FormRow label="Número do Documento" required>
                                        <input 
                                            type="text" 
                                            className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#137FEC] focus:ring-1 focus:ring-[#137FEC]"
                                            value={formData.documentNumber}
                                            onChange={(e) => handleChange('documentNumber', e.target.value)}
                                        />
                                        <p className="text-[10px] text-slate-400 mt-1">Documento provisório sujeito a validação.</p>
                                    </FormRow>
                                </div>
                                <div className="w-1/2">
                                     <FormRow label="Nacionalidade">
                                        <select 
                                            className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#137FEC] focus:ring-1 focus:ring-[#137FEC] bg-white"
                                            value={formData.nationality}
                                            onChange={(e) => handleChange('nationality', e.target.value)}
                                        >
                                            <option>Selecione</option>
                                            <option value="Moçambicana">Moçambicana</option>
                                            <option value="Estrangeira">Estrangeira</option>
                                        </select>
                                    </FormRow>
                                </div>
                            </div>
                        </div>
                    </section>
                    
                    <hr className="border-slate-100" />

                    {/* Dados Pessoais */}
                    <section>
                        <h3 className="text-[#137FEC] font-bold mb-4 text-sm">Dados Pessoais</h3>
                        <div className="space-y-4">
                            <FormRow label="Sexo" required>
                                <div className="flex gap-6 py-2">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input 
                                            type="radio" 
                                            name="gender" 
                                            value="Masculino" 
                                            checked={formData.gender === 'Masculino'}
                                            onChange={(e) => handleChange('gender', e.target.value)}
                                            className="text-[#137FEC] focus:ring-[#137FEC]"
                                        />
                                        <span className="text-sm text-slate-700">Masculino</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input 
                                            type="radio" 
                                            name="gender" 
                                            value="Feminino" 
                                            checked={formData.gender === 'Feminino'}
                                            onChange={(e) => handleChange('gender', e.target.value)}
                                            className="text-[#137FEC] focus:ring-[#137FEC]"
                                        />
                                        <span className="text-sm text-slate-700">Feminino</span>
                                    </label>
                                </div>
                            </FormRow>

                            <FormRow label="Local de Nascimento">
                                <input 
                                    type="text" 
                                    className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#137FEC] focus:ring-1 focus:ring-[#137FEC]"
                                    value={formData.birthPlace}
                                    onChange={(e) => handleChange('birthPlace', e.target.value)}
                                />
                            </FormRow>

                            <div className="w-1/2">
                                <FormRow label="Telefone do Aluno (Opcional)">
                                    <div className="flex">
                                        <span className="inline-flex items-center px-3 rounded-l border border-r-0 border-slate-300 bg-slate-50 text-slate-500 text-sm">
                                            +258
                                        </span>
                                        <input 
                                            type="text" 
                                            className="w-full border border-slate-300 rounded-r px-3 py-2 text-sm focus:outline-none focus:border-[#137FEC] focus:ring-1 focus:ring-[#137FEC]"
                                            value={formData.phone}
                                            onChange={(e) => handleChange('phone', e.target.value)}
                                        />
                                    </div>
                                </FormRow>
                            </div>
                        </div>
                    </section>

                     <hr className="border-slate-100" />

                    {/* Endereço */}
                    <section>
                        <h3 className="text-[#137FEC] font-bold mb-4 text-sm">Endereço de Residência</h3>
                        <div className="space-y-4">
                            <FormRow label="Morada" required>
                                <input 
                                    type="text" 
                                    className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#137FEC] focus:ring-1 focus:ring-[#137FEC]"
                                    placeholder="ex: Bairro, Localidade"
                                    value={formData.address}
                                    onChange={(e) => handleChange('address', e.target.value)}
                                />
                            </FormRow>

                            <div className="flex gap-4">
                                <div className="w-1/2">
                                    <FormRow label="Distrito">
                                         <select 
                                            className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#137FEC] focus:ring-1 focus:ring-[#137FEC] bg-white"
                                            value={formData.district}
                                            onChange={(e) => handleChange('district', e.target.value)}
                                        >
                                            <option>Selecione</option>
                                            <option value="Maputo">Maputo</option>
                                            <option value="Matola">Matola</option>
                                        </select>
                                    </FormRow>
                                </div>
                                <div className="w-1/2">
                                    <FormRow label="Província">
                                         <select 
                                            className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#137FEC] focus:ring-1 focus:ring-[#137FEC] bg-white"
                                            value={formData.province}
                                            onChange={(e) => handleChange('province', e.target.value)}
                                        >
                                            <option>Selecione</option>
                                            <option value="Maputo Cidade">Maputo Cidade</option>
                                            <option value="Maputo Província">Maputo Província</option>
                                        </select>
                                    </FormRow>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        )}
        
        {activeTab !== 'Dados do Aluno' && (
            <div className="flex items-center justify-center h-full text-slate-400 flex-col gap-4">
                <span className="material-icons-outlined text-6xl">engineering</span>
                <p>Módulo em desenvolvimento...</p>
            </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50">
        <button 
           onClick={onCancel}
           className="px-6 py-2 rounded text-slate-600 font-medium border border-slate-300 bg-white hover:bg-slate-50 transition-colors"
        >
            Cancelar
        </button>
        <button 
           onClick={() => {
                // If on last tab, submit, else next tab
                const currentIndex = tabs.indexOf(activeTab);
                if (currentIndex < tabs.length - 1) {
                    setActiveTab(tabs[currentIndex + 1]);
                } else {
                    handleSubmit();
                }
           }}
           className="px-6 py-2 rounded text-white font-medium bg-[#00984A] hover:bg-[#00984A]/90 transition-colors flex items-center gap-2"
        >
            Próximo
             <span className="material-icons-outlined text-sm">chevron_right</span>
        </button>
      </div>
    </div>
  );
};

// Helper Component for Form Layout logic
const FormRow: React.FC<{ label: string; required?: boolean; children: React.ReactNode }> = ({ label, required, children }) => (
    <div className="grid grid-cols-[160px_1fr] items-center gap-4">
        <label className="text-sm font-bold text-slate-700 text-right">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div>
            {children}
        </div>
    </div>
);

export default StudentRegistrationForm;
