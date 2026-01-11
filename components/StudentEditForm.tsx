import React, { useState, useRef, useEffect } from 'react';
import { useToast } from './Toast';
import { supabase } from '../supabaseClient';
import { User } from '../types';

interface Student extends User {
    [key: string]: any;
}

interface Props {
  student: Student;
  onSuccess: () => void;
  onCancel: () => void;
}

const StudentEditForm: React.FC<Props> = ({ student, onSuccess, onCancel }) => {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [showGuardian, setShowGuardian] = useState(false);

  // Initialize Form Data
  useEffect(() => {
    if (student) {
        const meta = student.raw_user_meta_data || {};
        
        // Check if guardian info exists to auto-open toggle
        if (meta.guardian_name || meta.guardian_contact) setShowGuardian(true);

        setFormData({
            firstName: meta.first_name || student.first_name || '',
            middleName: meta.middle_name || student.middle_name || '',
            lastName: meta.last_name || student.last_name || '',
            
            birthDate: meta.birth_date ? formatDateForInput(meta.birth_date) : '',
            documentType: meta.document_type || 'Selecione',
            documentNumber: meta.document_number || '',
            nationality: meta.nationality || 'Moçambicana',
            
            grade: meta.grade || '10ª Classe',
            gender: meta.gender === 'F' ? 'Feminino' : 'Masculino',
            birthPlace: meta.birth_place || '',
            
            phone: meta.phone_number || student.phone_number || '',
            address: meta.address || student.address || '',
            province: meta.province || 'Selecione',
            
            fatherName: meta.father_name || '',
            motherName: meta.mother_name || '',
            
            // Guardian
            guardianFirstName: meta.guardian_name ? parseName(meta.guardian_name).first : '',
            guardianMiddleName: meta.guardian_name ? parseName(meta.guardian_name).middle : '',
            guardianLastName: meta.guardian_name ? parseName(meta.guardian_name).last : '',
            guardianRelationship: meta.guardian_relationship || 'Selecione',
            guardianDocType: meta.guardian_doc_type || 'Selecione',
            guardianNationality: meta.guardian_nationality || 'Moçambicana',
            guardianDocNumber: meta.guardian_doc_number || '',
            guardianPhone: meta.guardian_contact || '',
            guardianEmail: meta.guardian_email || '',
            guardianAddress: meta.guardian_address || '',
        });
        if (student.photo_url || meta.photo_url) {
            setPhotoPreview(student.photo_url || meta.photo_url);
        }
    }
  }, [student]);

  const formatDateForInput = (isoDate: string) => {
      try {
        const [year, month, day] = isoDate.split('-');
        return `${day}/${month}/${year}`;
      } catch (e) { return ''; }
  };

  const parseName = (fullName: string) => {
    const parts = fullName.trim().split(/\s+/);
    if (parts.length === 0) return { first: '', middle: '', last: '' };
    if (parts.length === 1) return { first: parts[0], middle: '', last: '' };
    if (parts.length === 2) return { first: parts[0], middle: '', last: parts[1] };
    const first = parts[0];
    const last = parts[parts.length - 1];
    const middle = parts.slice(1, parts.length - 1).join(' ');
    return { first, middle, last };
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = (ev) => {
            if (ev.target?.result) setPhotoPreview(ev.target.result as string);
        };
        reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
      setLoading(true);
      try {
        const fullName = `${formData.firstName} ${formData.middleName ? formData.middleName + ' ' : ''}${formData.lastName}`;
        const guardianName = `${formData.guardianFirstName} ${formData.guardianMiddleName ? formData.guardianMiddleName + ' ' : ''}${formData.guardianLastName}`;
        
        let isoDate = null;
        if (formData.birthDate && formData.birthDate.length >= 8) {
             // Basic validation/conversion logic if needed
             const parts = formData.birthDate.split('/');
             if (parts.length === 3) isoDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
        }

        const updates = {
            first_name: formData.firstName,
            middle_name: formData.middleName,
            last_name: formData.lastName,
            full_name: fullName,
            name: fullName, 
            birth_date: isoDate,
            phone_number: formData.phone,
            address: formData.address,
            // Meta Update
            raw_user_meta_data: {
                ...student.raw_user_meta_data,
                first_name: formData.firstName,
                middle_name: formData.middleName,
                last_name: formData.lastName,
                full_name: fullName,
                birth_date: isoDate,
                document_type: formData.documentType,
                document_number: formData.documentNumber,
                nationality: formData.nationality,
                grade: formData.grade,
                gender: formData.gender === 'Masculino' ? 'M' : 'F',
                birth_place: formData.birthPlace,
                province: formData.province,
                photo_url: photoPreview,
                
                father_name: formData.fatherName,
                mother_name: formData.motherName,
                
                guardian_name: guardianName,
                guardian_relationship: formData.guardianRelationship,
                guardian_doc_type: formData.guardianDocType,
                guardian_nationality: formData.guardianNationality,
                guardian_doc_number: formData.guardianDocNumber,
                guardian_contact: formData.guardianPhone,
                guardian_email: formData.guardianEmail,
                guardian_address: formData.guardianAddress
            }
        };

        const { error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', student.id);

        if (error) throw error;
        addToast('Perfil atualizado com sucesso!', 'success');
        onSuccess();
      } catch (error: any) {
          console.error(error);
          addToast('Erro ao atualizar: ' + error.message, 'error');
      } finally {
          setLoading(false);
      }
  };

  return (
    <div className="bg-white rounded-t-2xl h-full flex flex-col">
        
        {/* Header */}
        <div className="px-8 py-5 border-b border-slate-200 flex justify-between items-center">
             <div>
                <h2 className="text-xl font-bold text-slate-800">Editar Dados do Aluno</h2>
                <p className="text-sm text-slate-500">Atualize as informações pessoais e académicas</p>
             </div>
             <button onClick={onCancel} className="text-slate-400 hover:text-slate-600">
                 <span className="material-icons-outlined">close</span>
             </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-10">
            
            {/* TOP SECTION: Photo + Identity/Personal/Address */}
            <div className="flex gap-10">
                {/* Left Col: Photo */}
                <div className="w-64 flex-shrink-0">
                    <div className="bg-slate-100 rounded-lg h-64 flex items-center justify-center border border-slate-200 overflow-hidden mb-3 relative">
                        {photoPreview ? (
                            <img src={photoPreview} className="w-full h-full object-cover" />
                        ) : (
                            <span className="material-icons-outlined text-6xl text-slate-300">person</span>
                        )}
                    </div>
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full py-2 border border-slate-300 rounded-lg text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors"
                    >
                        Carregar Foto
                    </button>
                    <input type="file" ref={fileInputRef} onChange={handlePhotoSelect} className="hidden" accept="image/*" />
                </div>

                {/* Right Col: Forms */}
                <div className="flex-1 space-y-8">
                    
                    {/* DADOS DE IDENTIFICAÇÃO */}
                    <div>
                        <h3 className="text-[#137FEC] font-bold text-xs uppercase mb-4 tracking-wide">DADOS DE IDENTIFICAÇÃO</h3>
                        <div className="grid grid-cols-3 gap-4 mb-4">
                            <FormInput label="NOME *" value={formData.firstName} onChange={v => handleChange('firstName', v)} />
                            <FormInput label="OUTROS NOMES" value={formData.middleName} onChange={v => handleChange('middleName', v)} />
                            <FormInput label="APELIDO *" value={formData.lastName} onChange={v => handleChange('lastName', v)} />
                        </div>
                        <div className="grid grid-cols-4 gap-4">
                            <FormInput label="DATA NASCIMENTO *" value={formData.birthDate} onChange={v => handleChange('birthDate', v)} placeholder="dd/mm/aaaa" />
                            <FormSelect label="TIPO DOCUMENTO *" value={formData.documentType} onChange={v => handleChange('documentType', v)}>
                                <option>Selecione</option>
                                <option>BI</option>
                                <option>Passaporte</option>
                            </FormSelect>
                            <FormInput label="NR. DOCUMENTO *" value={formData.documentNumber} onChange={v => handleChange('documentNumber', v)} placeholder="" />
                            <FormSelect label="NACIONALIDADE" value={formData.nationality} onChange={v => handleChange('nationality', v)}>
                                <option>Moçambicana</option>
                                <option>Estrangeira</option>
                            </FormSelect>
                        </div>
                    </div>

                    {/* DADOS PESSOAIS */}
                    <div>
                        <h3 className="text-[#137FEC] font-bold text-xs uppercase mb-4 tracking-wide">DADOS PESSOAIS</h3>
                        <div className="grid grid-cols-3 gap-6 items-end">
                            <FormSelect label="CLASSE *" value={formData.grade} onChange={v => handleChange('grade', v)}>
                                <option>10ª Classe</option>
                                <option>11ª Classe</option>
                                <option>12ª Classe</option>
                            </FormSelect>
                            
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2">SEXO *</label>
                                <div className="flex items-center gap-4">
                                     <label className="flex items-center gap-2 cursor-pointer">
                                         <input 
                                            type="radio" 
                                            name="gender" 
                                            checked={formData.gender === 'Masculino'} 
                                            onChange={() => handleChange('gender', 'Masculino')}
                                            className="text-[#137FEC] focus:ring-[#137FEC]"
                                         />
                                         <span className="text-sm text-slate-700">Masculino</span>
                                     </label>
                                     <label className="flex items-center gap-2 cursor-pointer">
                                         <input 
                                            type="radio" 
                                            name="gender" 
                                            checked={formData.gender === 'Feminino'} 
                                            onChange={() => handleChange('gender', 'Feminino')}
                                            className="text-[#137FEC] focus:ring-[#137FEC]"
                                         />
                                         <span className="text-sm text-slate-700">Feminino</span>
                                     </label>
                                </div>
                            </div>

                            <FormInput label="LOCAL DE NASCIMENTO" value={formData.birthPlace} onChange={v => handleChange('birthPlace', v)} />
                        </div>
                    </div>

                    {/* ENDEREÇO DE RESIDÊNCIA */}
                    <div>
                        <h3 className="text-[#137FEC] font-bold text-xs uppercase mb-4 tracking-wide">ENDEREÇO DE RESIDÊNCIA</h3>
                        <div className="grid grid-cols-3 gap-4">
                            <FormInput label="TELEFONE" value={formData.phone} onChange={v => handleChange('phone', v)} placeholder="+258..." />
                            <FormInput label="MORADA *" value={formData.address} onChange={v => handleChange('address', v)} placeholder="Bairro" />
                            <FormSelect label="PROVÍNCIA" value={formData.province} onChange={v => handleChange('province', v)}>
                                <option>Selecione</option>
                                <option>Maputo Cidade</option>
                                <option>Maputo Província</option>
                                <option>Gaza</option>
                                <option>Inhambane</option>
                            </FormSelect>
                        </div>
                    </div>

                </div>
            </div>

            <div className="border-t border-slate-200"></div>

            {/* BOTTOM SECTION: Parents & Guardian */}
            <div>
                 {/* DADOS DA FILIAÇÃO */}
                 <div className="mb-6">
                    <h3 className="text-[#137FEC] font-bold text-xs uppercase mb-4 tracking-wide">DADOS DA FILIAÇÃO</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <FormInput label="NOME DO PAI" value={formData.fatherName} onChange={v => handleChange('fatherName', v)} placeholder="Nome completo do pai" />
                        <FormInput label="NOME DA MÃE" value={formData.motherName} onChange={v => handleChange('motherName', v)} placeholder="Nome completo da mãe" />
                    </div>
                 </div>

                 {/* Guardian Toggle */}
                 <div className="mb-6">
                     <button 
                        onClick={() => setShowGuardian(!showGuardian)}
                        className="flex items-center gap-2 bg-[#E3F2FD] text-[#137FEC] px-4 py-2 rounded-lg font-bold text-xs uppercase hover:bg-[#BBDEFB] transition-colors"
                     >
                         <span className="material-icons-outlined text-sm">{showGuardian ? 'expand_less' : 'expand_more'}</span>
                         Informações do Encarregado
                     </button>
                 </div>

                 {/* Guardian Fields - Collapsible */}
                 {showGuardian && (
                     <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-6 animate-in slide-in-from-top-2 duration-200">
                         {/* DADOS DO ENCARREGADO */}
                         <div>
                            <h3 className="text-slate-600 font-bold text-xs uppercase mb-4 tracking-wide border-l-4 border-[#137FEC] pl-2">DADOS DO ENCARREGADO</h3>
                            <div className="grid grid-cols-3 gap-4 mb-4">
                                <FormInput label="NOME *" value={formData.guardianFirstName} onChange={v => handleChange('guardianFirstName', v)} />
                                <FormInput label="OUTROS NOMES" value={formData.guardianMiddleName} onChange={v => handleChange('guardianMiddleName', v)} />
                                <FormInput label="APELIDO *" value={formData.guardianLastName} onChange={v => handleChange('guardianLastName', v)} />
                            </div>
                            <div className="grid grid-cols-3 gap-4 mb-4">
                                <FormSelect label="GRAU DE PARENTESCO *" value={formData.guardianRelationship} onChange={v => handleChange('guardianRelationship', v)}>
                                    <option>Selecione</option>
                                    <option>Pai</option>
                                    <option>Mãe</option>
                                    <option>Tio(a)</option>
                                    <option>Outro</option>
                                </FormSelect>
                                <FormSelect label="TIPO DE DOCUMENTO *" value={formData.guardianDocType} onChange={v => handleChange('guardianDocType', v)}>
                                    <option>Selecione</option>
                                    <option>BI</option>
                                    <option>Passaporte</option>
                                </FormSelect>
                                <FormSelect label="NACIONALIDADE" value={formData.guardianNationality} onChange={v => handleChange('guardianNationality', v)}>
                                    <option>Moçambicana</option>
                                </FormSelect>
                            </div>
                            <div>
                                <FormInput label="NÚMERO DO DOCUMENTO" value={formData.guardianDocNumber} onChange={v => handleChange('guardianDocNumber', v)} />
                            </div>
                         </div>

                         {/* CONTACTO E ENDEREÇO */}
                         <div>
                            <h3 className="text-slate-600 font-bold text-xs uppercase mb-4 tracking-wide border-l-4 border-[#137FEC] pl-2">CONTACTO E ENDEREÇO</h3>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <FormInput label="TELEFONE DE CONTACTO *" value={formData.guardianPhone} onChange={v => handleChange('guardianPhone', v)} placeholder="+258..." />
                                <FormInput label="EMAIL (OPCIONAL)" value={formData.guardianEmail} onChange={v => handleChange('guardianEmail', v)} />
                            </div>
                            <FormInput label="MORADA *" value={formData.guardianAddress} onChange={v => handleChange('guardianAddress', v)} placeholder="Bairro" />
                         </div>
                     </div>
                 )}
            </div>

        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-slate-200 flex justify-end gap-3 bg-slate-50">
            <button onClick={onCancel} className="px-6 py-2.5 rounded-lg border border-slate-300 text-slate-600 font-bold text-sm hover:bg-white transition-colors">Cancelar</button>
            <button onClick={handleSubmit} disabled={loading} className="px-6 py-2.5 rounded-lg bg-[#137FEC] text-white font-bold text-sm hover:bg-[#1565C0] shadow-md flex items-center gap-2">
                {loading ? 'Salvando...' : 'Salvar Alterações'}
                {!loading && <span className="material-icons-outlined text-sm">check</span>}
            </button>
        </div>
    </div>
  );
};

// Helper Components
const FormInput = ({ label, value, onChange, placeholder }: any) => (
    <div>
        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2">{label}</label>
        <input 
            type="text" 
            className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#137FEC] focus:ring-1 focus:ring-[#137FEC] text-slate-700 placeholder-slate-400" 
            value={value} 
            onChange={e => onChange(e.target.value)} 
            placeholder={placeholder}
        />
    </div>
);

const FormSelect = ({ label, value, onChange, children }: any) => (
    <div>
         <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2">{label}</label>
         <div className="relative">
             <select className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#137FEC] focus:ring-1 focus:ring-[#137FEC] bg-white appearance-none text-slate-700" value={value} onChange={e => onChange(e.target.value)}>{children}</select>
             <span className="material-icons-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-lg">expand_more</span>
         </div>
    </div>
);

export default StudentEditForm;
