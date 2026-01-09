import React, { useState, useRef } from 'react';
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
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        if (file.size > 2 * 1024 * 1024) {
            addToast('Imagem muito grande. Máximo 2MB.', 'error');
            return;
        }
        if (!file.type.startsWith('image/')) {
            addToast('Por favor selecione um arquivo de imagem.', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = (ev) => {
            if (ev.target?.result) {
                setPhotoPreview(ev.target.result as string);
            }
        };
        reader.readAsDataURL(file);
    }
  };

  const validate = (): boolean => {
    if (activeTab === 'Dados do Aluno') {
        if (!formData.fullName) { addToast('Por favor, insira o Nome Completo.', 'error'); return false; }
        if (!formData.birthDate) { addToast('Por favor, insira a Data de Nascimento.', 'error'); return false; }
        if (formData.documentType === 'Selecione') { addToast('Por favor, selecione o Tipo de Documento.', 'error'); return false; }
        if (!formData.documentNumber) { addToast('Por favor, insira o Número do Documento.', 'error'); return false; }
        if (formData.nationality === 'Selecione') { addToast('Por favor, selecione a Nacionalidade.', 'error'); return false; }
        if (!formData.address) { addToast('Por favor, insira a Morada.', 'error'); return false; }
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
      const payload = {
        email: formData.email || `student.${Date.now()}@payflow.com`,
        password: 'temporary-pass',
        user_metadata: {
            first_name: firstName, middle_name: middleName, last_name: lastName,
            full_name: formData.fullName, document_type: formData.documentType,
            document_number: formData.documentNumber, phone_number: formData.phone,
            nationality: formData.nationality, address: formData.address,
            birth_place: formData.birthPlace, district: formData.district, province: formData.province,
            gender: formData.gender === 'Masculino' ? 'M' : 'F',
            father_name: formData.fatherName, mother_name: formData.motherName,
            birth_date: formData.birthDate, role: 'student',
            photo_url: photoPreview // In real app, upload this to storage first
        }
      };
      
      const response = await fetch('/api/students/create', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const err = await response.json(); throw new Error(err.message || err.error || 'Erro ao criar estudante');
      }
      addToast('Estudante registrado com sucesso!', 'success');
      onSuccess();
    } catch (error: any) {
      console.error('Registration Error:', error); addToast(error.message || 'Erro de conexão.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm w-full h-full flex flex-col">
       {/* Removed Top Header as requested */}
       
       <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-2">
        {tabs.map((tab) => (
            <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-3 text-xs font-bold uppercase tracking-wide transition-colors relative ${
                    activeTab === tab 
                        ? 'text-white bg-[#137FEC]' 
                        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                }`}
                style={{
                    borderTopLeftRadius: '6px', borderTopRightRadius: '6px', marginBottom: '-1px'
                }}
            >
                {tab}
            </button>
        ))}
      </div>

      <div className="flex-1 p-6 overflow-hidden flex flex-col">
        {activeTab === 'Dados do Aluno' ? (
            <div className="flex gap-6 h-full">
                {/* Photo Upload Column */}
                <div className="w-48 flex-shrink-0">
                    <div className="border border-slate-200 rounded-lg p-3 bg-slate-50 text-center">
                        <div 
                            className="w-full aspect-[3/4] bg-slate-200 rounded-md mb-3 flex items-center justify-center text-slate-400 overflow-hidden relative cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => fileInputRef.current?.click()}
                        >
                             {photoPreview ? (
                                <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                             ) : (
                                <span className="material-icons-outlined text-6xl">person</span>
                             )}
                        </div>
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handlePhotoSelect} 
                            accept="image/*" 
                            className="hidden" 
                        />
                        <button 
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full py-2 bg-white border border-slate-300 rounded text-xs font-bold text-slate-600 hover:bg-slate-50"
                        >
                            Carregar Foto
                        </button>
                    </div>
                </div>

                {/* Form Fields Column - Compact Layout */}
                <div className="flex-1 flex flex-col gap-4">
                    {/* Identificação */}
                    <div>
                        <h3 className="text-[#137FEC] font-bold mb-2 text-xs uppercase tracking-wider border-b border-slate-100 pb-1">Dados de Identificação</h3>
                        <div className="grid grid-cols-12 gap-3">
                            <div className="col-span-12">
                                <FormInput label="Nome Completo" required value={formData.fullName} onChange={v => handleChange('fullName', v)} />
                            </div>
                            <div className="col-span-3">
                                <FormInput label="Data Nascimento" type="date" required value={formData.birthDate} onChange={v => handleChange('birthDate', v)} />
                            </div>
                            <div className="col-span-3">
                                 <FormSelect label="Tipo Documento" required value={formData.documentType} onChange={v => handleChange('documentType', v)}>
                                    <option>Selecione</option><option value="BI">BI</option><option value="PASSPORT">Passaporte</option>
                                 </FormSelect>
                            </div>
                            <div className="col-span-3">
                                <FormInput label="Nr. Documento" required value={formData.documentNumber} onChange={v => handleChange('documentNumber', v)} placeholder="Provisório..." />
                            </div>
                            <div className="col-span-3">
                                <FormSelect label="Nacionalidade" value={formData.nationality} onChange={v => handleChange('nationality', v)}>
                                    <option>Selecione</option><option value="Moçambicana">Moçambicana</option>
                                </FormSelect>
                            </div>
                        </div>
                    </div>
                    
                    {/* Pessoais */}
                    <div>
                        <h3 className="text-[#137FEC] font-bold mb-2 text-xs uppercase tracking-wider border-b border-slate-100 pb-1">Dados Pessoais</h3>
                        <div className="grid grid-cols-12 gap-3 items-end">
                            <div className="col-span-4">
                                <span className="block text-[10px] font-bold text-slate-700 mb-1">Sexo <span className="text-red-500">*</span></span>
                                <div className="flex gap-3 h-[34px] items-center">
                                    <label className="flex items-center gap-1 cursor-pointer"><input type="radio" name="gender" value="Masculino" checked={formData.gender === 'Masculino'} onChange={e => handleChange('gender', e.target.value)} className="accent-[#137FEC]" /><span className="text-xs text-slate-700">Masculino</span></label>
                                    <label className="flex items-center gap-1 cursor-pointer"><input type="radio" name="gender" value="Feminino" checked={formData.gender === 'Feminino'} onChange={e => handleChange('gender', e.target.value)} className="accent-[#137FEC]" /><span className="text-xs text-slate-700">Feminino</span></label>
                                </div>
                            </div>
                            <div className="col-span-5">
                                <FormInput label="Local de Nascimento" value={formData.birthPlace} onChange={v => handleChange('birthPlace', v)} />
                            </div>
                            <div className="col-span-3">
                                <FormInput label="Telefone" value={formData.phone} onChange={v => handleChange('phone', v)} placeholder="+258..." />
                            </div>
                        </div>
                    </div>

                     {/* Endereço */}
                    <div>
                        <h3 className="text-[#137FEC] font-bold mb-2 text-xs uppercase tracking-wider border-b border-slate-100 pb-1">Endereço de Residência</h3>
                         <div className="grid grid-cols-12 gap-3">
                            <div className="col-span-6">
                                <FormInput label="Morada" required value={formData.address} onChange={v => handleChange('address', v)} placeholder="Bairro, Rua, Casa..." />
                            </div>
                            <div className="col-span-3">
                                <FormSelect label="Distrito" value={formData.district} onChange={v => handleChange('district', v)}>
                                    <option>Selecione</option><option value="Maputo">Maputo</option><option value="Matola">Matola</option>
                                </FormSelect>
                            </div>
                            <div className="col-span-3">
                                <FormSelect label="Província" value={formData.province} onChange={v => handleChange('province', v)}>
                                    <option>Selecione</option><option value="Maputo Cidade">Maputo Cidade</option><option value="Maputo Província">Maputo Província</option>
                                </FormSelect>
                            </div>
                        </div>
                    </div>
                    
                    {/* Buttons Row - moved inside to save space or kept at bottom */}
                    <div className="flex justify-end gap-3 mt-auto pt-4 border-t border-slate-100">
                        <button onClick={onCancel} className="px-5 py-2 rounded text-xs font-bold text-slate-600 border border-slate-300 hover:bg-slate-50">Cancelar</button>
                        <button onClick={() => { if(activeTab === 'Dados do Aluno') setActiveTab(tabs[1]); else handleSubmit(); }} className="px-5 py-2 rounded text-xs font-bold text-white bg-[#00984A] hover:bg-[#00984A]/90 flex items-center gap-1">Próximo <span className="material-icons-outlined text-sm">chevron_right</span></button>
                    </div>
                </div>
            </div>
        ) : (
            <div className="bg-slate-50 border border-dashed border-slate-300 rounded-lg h-full flex items-center justify-center flex-col text-slate-400">
                <span className="material-icons-outlined text-4xl mb-2">construction</span>
                <p className="text-sm">Seção em desenvolvimento</p>
                <div className="flex justify-end gap-3 w-full px-6 mt-8">
                     <button onClick={onCancel} className="px-5 py-2 rounded text-xs font-bold text-slate-600 border border-slate-300 hover:bg-slate-50">Cancelar</button>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

// Compact Form Components
const FormInput = ({ label, required, value, onChange, type = "text", placeholder }: any) => (
    <div>
        <label className="block text-[10px] font-bold text-slate-700 mb-1 uppercase">{label} {required && <span className="text-red-500">*</span>}</label>
        <input type={type} className="w-full border border-slate-300 rounded px-2 py-1.5 text-xs focus:outline-none focus:border-[#137FEC] focus:ring-1 focus:ring-[#137FEC]" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
    </div>
);
const FormSelect = ({ label, required, value, onChange, children }: any) => (
    <div>
         <label className="block text-[10px] font-bold text-slate-700 mb-1 uppercase">{label} {required && <span className="text-red-500">*</span>}</label>
         <select className="w-full border border-slate-300 rounded px-2 py-1.5 text-xs focus:outline-none focus:border-[#137FEC] focus:ring-1 focus:ring-[#137FEC] bg-white" value={value} onChange={e => onChange(e.target.value)}>{children}</select>
    </div>
);

export default StudentRegistrationForm;
