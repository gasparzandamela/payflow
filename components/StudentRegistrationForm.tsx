import React, { useState, useRef } from 'react';
import { useToast } from '../components/Toast';

interface StudentFormData {
  // Dados do Aluno (Tab 1)
  firstName: string;
  middleName: string;
  lastName: string;
  
  birthDate: string; // Stored as DD/MM/YYYY text for input, converted for API
  documentType: string;
  documentNumber: string;
  nationality: string;
  gender: string;
  birthPlace: string;
  phone: string;
  address: string;
  province: string;
  
  // Encarregado de Educação (Tab 2)
  guardianName: string;
  guardianRelationship: string;
  guardianDocumentType: string;
  guardianDocumentNumber: string;
  guardianNationality: string;
  guardianPhone: string;
  guardianEmail: string;
  guardianAddress: string;
  guardianDistrict: string;

  // Other Tabs
  email: string; // Student email
  fatherName: string;
  motherName: string;
}

const initialData: StudentFormData = {
  firstName: '',
  middleName: '',
  lastName: '',
  
  birthDate: '',
  documentType: 'Selecione',
  documentNumber: '',
  nationality: 'Selecione',
  gender: 'Masculino',
  birthPlace: '',
  phone: '',
  address: '',
  province: 'Selecione',
  
  guardianName: '',
  guardianRelationship: 'Selecione',
  guardianDocumentType: 'Selecione',
  guardianDocumentNumber: '',
  guardianNationality: 'Selecione',
  guardianPhone: '',
  guardianEmail: '',
  guardianAddress: '',
  guardianDistrict: 'Selecione',

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
  
  // Photos
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [guardianPhotoPreview, setGuardianPhotoPreview] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const guardianFileInputRef = useRef<HTMLInputElement>(null);

  const tabs = [
    'Dados do Aluno',
    'Encarregado de Educação',
    'Documentos'
  ];

  const handleChange = (field: keyof StudentFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDateChange = (value: string) => {
    // Remove non-digits
    const digits = value.replace(/\D/g, '');
    let formatted = digits;
    if (digits.length > 2) {
        formatted = `${digits.slice(0, 2)}/${digits.slice(2)}`;
    }
    if (digits.length > 4) {
        formatted = `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)}`;
    }
    handleChange('birthDate', formatted);
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>, isGuardian: boolean = false) => {
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
                if (isGuardian) {
                    setGuardianPhotoPreview(ev.target.result as string);
                } else {
                    setPhotoPreview(ev.target.result as string);
                }
            }
        };
        reader.readAsDataURL(file);
    }
  };

  const validate = (): boolean => {
    if (activeTab === 'Dados do Aluno') {
        if (!formData.firstName) { addToast('Por favor, insira o Nome.', 'error'); return false; }
        if (!formData.lastName) { addToast('Por favor, insira o Apelido.', 'error'); return false; }
        if (!formData.birthDate || formData.birthDate.length !== 10) { addToast('Por favor, insira a Data de Nascimento completa (dd/mm/aaaa).', 'error'); return false; }
        if (formData.documentType === 'Selecione') { addToast('Por favor, selecione o Tipo de Documento.', 'error'); return false; }
        if (!formData.documentNumber) { addToast('Por favor, insira o Número do Documento.', 'error'); return false; }
        if (formData.nationality === 'Selecione') { addToast('Por favor, selecione a Nacionalidade.', 'error'); return false; }
        if (!formData.address) { addToast('Por favor, insira a Morada.', 'error'); return false; }
    } else if (activeTab === 'Encarregado de Educação') {
        if (!formData.guardianName) { addToast('Por favor, insira o Nome do Encarregado.', 'error'); return false; }
        if (formData.guardianRelationship === 'Selecione') { addToast('Por favor, selecione o Grau de Parentesco.', 'error'); return false; }
        if (formData.guardianDocumentType === 'Selecione') { addToast('Por favor, selecione o Tipo de Documento do Encarregado.', 'error'); return false; }
        if (!formData.guardianPhone) { addToast('Por favor, insira o Telefone do Encarregado.', 'error'); return false; }
        if (!formData.guardianAddress) { addToast('Por favor, insira a Morada do Encarregado.', 'error'); return false; }
    }
    return true;
  };

  const handleSubmit = async () => {
    // If called from Documentos tab (final submission)
    setLoading(true);
    try {
      // Reconstruct full name and formatted date for backend
      const fullName = `${formData.firstName} ${formData.middleName ? formData.middleName + ' ' : ''}${formData.lastName}`;
      
      // Convert DD/MM/YYYY to YYYY-MM-DD for backend/DB if needed, or keep as string
      const [day, month, year] = formData.birthDate.split('/');
      const isoDate = `${year}-${month}-${day}`;

      const payload = {
        email: formData.email || `student.${Date.now()}@payflow.com`,
        password: 'temporary-pass',
        user_metadata: {
            first_name: formData.firstName, middle_name: formData.middleName, last_name: formData.lastName,
            full_name: fullName, document_type: formData.documentType,
            document_number: formData.documentNumber, phone_number: formData.phone,
            nationality: formData.nationality, address: formData.address,
            birth_place: formData.birthPlace, province: formData.province,
            gender: formData.gender === 'Masculino' ? 'M' : 'F',
            birth_date: isoDate, role: 'student',
            photo_url: photoPreview,
            
            // Guardian Data
            guardian_name: formData.guardianName,
            guardian_relationship: formData.guardianRelationship,
            guardian_contact: formData.guardianPhone,
            guardian_email: formData.guardianEmail,
            guardian_document_type: formData.guardianDocumentType,
            guardian_document_number: formData.guardianDocumentNumber,
            guardian_address: formData.guardianAddress,
            guardian_district: formData.guardianDistrict,
            guardian_photo_url: guardianPhotoPreview
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

  const handleNext = () => {
      if (!validate()) return;
      
      if (activeTab === 'Dados do Aluno') {
          setActiveTab('Encarregado de Educação');
      } else if (activeTab === 'Encarregado de Educação') {
          setActiveTab('Documentos');
      } else {
          handleSubmit();
      }
  };

const handleBack = () => {
    if (activeTab === 'Encarregado de Educação') {
        setActiveTab('Dados do Aluno');
    } else if (activeTab === 'Documentos') {
        setActiveTab('Encarregado de Educação');
    } else {
        onCancel();
    }
};

  return (
    <div className="bg-white rounded-lg shadow-sm w-full h-full flex flex-col">
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
                            onChange={(e) => handlePhotoSelect(e, false)} 
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

                {/* Form Fields Column */}
                <div className="flex-1 flex flex-col gap-4">
                    {/* Identificação */}
                    <div>
                        <h3 className="text-[#137FEC] font-bold mb-2 text-xs uppercase tracking-wider border-b border-slate-100 pb-1">Dados de Identificação</h3>
                        <div className="grid grid-cols-12 gap-3">
                            <div className="col-span-4">
                                <FormInput label="Nome" required value={formData.firstName} onChange={v => handleChange('firstName', v)} />
                            </div>
                            <div className="col-span-4">
                                <FormInput label="Outros Nomes" value={formData.middleName} onChange={v => handleChange('middleName', v)} />
                            </div>
                            <div className="col-span-4">
                                <FormInput label="Apelido" required value={formData.lastName} onChange={v => handleChange('lastName', v)} />
                            </div>

                            <div className="col-span-3">
                                <FormInput 
                                    label="Data Nascimento" 
                                    required 
                                    value={formData.birthDate} 
                                    onChange={handleDateChange} 
                                    placeholder="dd/mm/aaaa"
                                    maxLength={10}
                                />
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
                            <div className="col-span-9">
                                <FormInput label="Morada" required value={formData.address} onChange={v => handleChange('address', v)} placeholder="Bairro" />
                            </div>
                            <div className="col-span-3">
                                <FormSelect label="Província" value={formData.province} onChange={v => handleChange('province', v)}>
                                    <option>Selecione</option><option value="Maputo Cidade">Maputo Cidade</option><option value="Maputo Província">Maputo Província</option>
                                </FormSelect>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex justify-end gap-3 mt-auto pt-4 border-t border-slate-100">
                        <button onClick={onCancel} className="px-5 py-2 rounded text-xs font-bold text-slate-600 border border-slate-300 hover:bg-slate-50">Cancelar</button>
                        <button onClick={handleNext} className="px-5 py-2 rounded text-xs font-bold text-white bg-[#00984A] hover:bg-[#00984A]/90 flex items-center gap-1">Próximo <span className="material-icons-outlined text-sm">chevron_right</span></button>
                    </div>
                </div>
            </div>
        ) : activeTab === 'Encarregado de Educação' ? (
             <div className="flex gap-6 h-full">
                {/* Guardian Photo Upload Column */}
                <div className="w-48 flex-shrink-0">
                    <div className="border border-slate-200 rounded-lg p-3 bg-slate-50 text-center">
                        <div 
                            className="w-full aspect-[3/4] bg-slate-200 rounded-md mb-3 flex items-center justify-center text-slate-400 overflow-hidden relative cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => guardianFileInputRef.current?.click()}
                        >
                             {guardianPhotoPreview ? (
                                <img src={guardianPhotoPreview} alt="Preview" className="w-full h-full object-cover" />
                             ) : (
                                <span className="material-icons-outlined text-6xl">person</span>
                             )}
                        </div>
                        <input 
                            type="file" 
                            ref={guardianFileInputRef} 
                            onChange={(e) => handlePhotoSelect(e, true)} 
                            accept="image/*" 
                            className="hidden" 
                        />
                        <button 
                            onClick={() => guardianFileInputRef.current?.click()}
                            className="w-full py-2 bg-white border border-slate-300 rounded text-xs font-bold text-slate-600 hover:bg-slate-50"
                        >
                            Carregar Foto
                        </button>
                    </div>
                </div>

                {/* Guardian Form Fields Column */}
                <div className="flex-1 flex flex-col gap-4">
                    {/* Informações do Encarregado */}
                    <div>
                        <h3 className="text-[#137FEC] font-bold mb-2 text-xs uppercase tracking-wider border-b border-slate-100 pb-1">Informações do Encarregado</h3>
                        <div className="grid grid-cols-12 gap-3">
                            <div className="col-span-12">
                                <FormInput label="Nome Completo" required value={formData.guardianName} onChange={v => handleChange('guardianName', v)} />
                            </div>
                            <div className="col-span-4">
                                <FormSelect label="Grau de Parentesco" required value={formData.guardianRelationship} onChange={v => handleChange('guardianRelationship', v)}>
                                    <option>Selecione</option>
                                    <option value="Pai">Pai</option>
                                    <option value="Mãe">Mãe</option>
                                    <option value="Tio(a)">Tio(a)</option>
                                    <option value="Avô(ó)">Avô(ó)</option>
                                    <option value="Irmão(ã)">Irmão(ã)</option>
                                    <option value="Outro">Outro</option>
                                </FormSelect>
                            </div>
                            <div className="col-span-4">
                                <FormSelect label="Tipo de Documento" required value={formData.guardianDocumentType} onChange={v => handleChange('guardianDocumentType', v)}>
                                    <option>Selecione</option><option value="BI">BI</option><option value="PASSPORT">Passaporte</option><option value="DIRE">DIRE</option>
                                </FormSelect>
                            </div>
                             <div className="col-span-4">
                                <FormSelect label="Nacionalidade" value={formData.guardianNationality} onChange={v => handleChange('guardianNationality', v)}>
                                    <option>Selecione</option><option value="Moçambicana">Moçambicana</option><option value="Estrangeira">Estrangeira</option>
                                </FormSelect>
                            </div>
                            <div className="col-span-6">
                                <FormInput label="Número do Documento" value={formData.guardianDocumentNumber} onChange={v => handleChange('guardianDocumentNumber', v)} />
                            </div>
                        </div>
                    </div>

                    {/* Contacto do Encarregado */}
                    <div>
                        <h3 className="text-[#137FEC] font-bold mb-2 text-xs uppercase tracking-wider border-b border-slate-100 pb-1">Contacto do Encarregado</h3>
                        <div className="grid grid-cols-12 gap-3">
                            <div className="col-span-6">
                                <FormInput label="Telefone de Contacto" required value={formData.guardianPhone} onChange={v => handleChange('guardianPhone', v)} placeholder="+258..." />
                            </div>
                            <div className="col-span-6">
                                <FormInput label="Email (Opcional)" value={formData.guardianEmail} onChange={v => handleChange('guardianEmail', v)} />
                            </div>
                        </div>
                    </div>

                    {/* Endereço do Encarregado */}
                    <div>
                        <h3 className="text-[#137FEC] font-bold mb-2 text-xs uppercase tracking-wider border-b border-slate-100 pb-1">Endereço do Encarregado (Opcional)</h3>
                        <div className="grid grid-cols-12 gap-3">
                            <div className="col-span-8">
                                <FormInput label="Morada" required value={formData.guardianAddress} onChange={v => handleChange('guardianAddress', v)} placeholder="ex: Bairro, Localidade" />
                            </div>
                            <div className="col-span-4">
                                <FormSelect label="Distrito" value={formData.guardianDistrict} onChange={v => handleChange('guardianDistrict', v)}>
                                    <option>Selecione</option>
                                    <option value="Kamavota">KaMavota</option>
                                    <option value="KaMpfumu">KaMpfumu</option>
                                    <option value="KaMaxaquene">KaMaxaquene</option>
                                    <option value="KaMubukwana">KaMubukwana</option>
                                    <option value="KaTembe">KaTembe</option>
                                    <option value="KaNyaka">KaNyaka</option>
                                    <option value="Matola">Matola</option>
                                    <option value="Boane">Boane</option>
                                    <option value="Outro">Outro</option>
                                </FormSelect>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-between gap-3 mt-auto pt-4 border-t border-slate-100">
                         <button onClick={handleBack} className="px-5 py-2 rounded text-xs font-bold text-slate-600 border border-slate-300 hover:bg-slate-50">Voltar</button>
                        <div className="flex gap-3">
                             <button onClick={onCancel} className="px-5 py-2 rounded text-xs font-bold text-slate-600 border border-slate-300 hover:bg-slate-50">Cancelar</button>
                            <button onClick={handleNext} className="px-5 py-2 rounded text-xs font-bold text-white bg-[#00984A] hover:bg-[#00984A]/90 flex items-center gap-1">Próximo <span className="material-icons-outlined text-sm">chevron_right</span></button>
                        </div>
                    </div>
                </div>
            </div>
        ) : (
            <div className="bg-slate-50 border border-dashed border-slate-300 rounded-lg h-full flex items-center justify-center flex-col text-slate-400">
                <span className="material-icons-outlined text-4xl mb-2">folder_open</span>
                <p className="text-sm">Envio de Documentos</p>
                <div className="flex justify-between w-full px-6 mt-8">
                     <button onClick={handleBack} className="px-5 py-2 rounded text-xs font-bold text-slate-600 border border-slate-300 hover:bg-slate-50">Voltar</button>
                     <div className="flex gap-3">
                         <button onClick={onCancel} className="px-5 py-2 rounded text-xs font-bold text-slate-600 border border-slate-300 hover:bg-slate-50">Cancelar</button>
                         <button onClick={handleSubmit} className="px-5 py-2 rounded text-xs font-bold text-white bg-[#00984A] hover:bg-[#00984A]/90 flex items-center gap-1">
                             {loading ? 'Processando...' : 'Finalizar Inscrição'}
                             {!loading && <span className="material-icons-outlined text-sm">check</span>}
                         </button>
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

const FormInput = ({ label, required, value, onChange, type = "text", placeholder, maxLength }: any) => (
    <div>
        <label className="block text-[10px] font-bold text-slate-700 mb-1 uppercase">{label} {required && <span className="text-red-500">*</span>}</label>
        <input 
            type={type} 
            className="w-full border border-slate-300 rounded px-2 py-1.5 text-xs focus:outline-none focus:border-[#137FEC] focus:ring-1 focus:ring-[#137FEC]" 
            value={value} 
            onChange={e => onChange(e.target.value)} 
            placeholder={placeholder}
            maxLength={maxLength}
        />
    </div>
);
const FormSelect = ({ label, required, value, onChange, children }: any) => (
    <div>
         <label className="block text-[10px] font-bold text-slate-700 mb-1 uppercase">{label} {required && <span className="text-red-500">*</span>}</label>
         <select className="w-full border border-slate-300 rounded px-2 py-1.5 text-xs focus:outline-none focus:border-[#137FEC] focus:ring-1 focus:ring-[#137FEC] bg-white" value={value} onChange={e => onChange(e.target.value)}>{children}</select>
    </div>
);

export default StudentRegistrationForm;
