import React, { useState, useRef, useEffect } from 'react';
import { useToast } from './Toast';
import { supabase } from '../supabaseClient';
import { User } from '../types';

interface Student extends User {
    [key: string]: any; // Allow indexing
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

  // Initialize Form Data from Student
  useEffect(() => {
    if (student) {
        const meta = student.raw_user_meta_data || {};
        setFormData({
            firstName: meta.first_name || student.first_name || '',
            middleName: meta.middle_name || student.middle_name || '',
            lastName: meta.last_name || student.last_name || '',
            birthDate: meta.birth_date ? formatDateForInput(meta.birth_date) : '',
            documentType: meta.document_type || student.document_type || 'Selecione',
            documentNumber: meta.document_number || student.document_number || '',
            nationality: meta.nationality || student.nationality || 'Moçambicana',
            gender: meta.gender === 'F' ? 'Feminino' : 'Masculino',
            birthPlace: meta.birth_place || '',
            phone: meta.phone_number || student.phone_number || '',
            address: meta.address || student.address || '',
            province: meta.province || 'Selecione',
            grade: meta.grade || '10ª Classe',
            
            fatherName: meta.father_name || student.father_name || '',
            motherName: meta.mother_name || student.mother_name || '',
            
            // Guardian
            guardianFirstName: meta.guardian_name ? parseName(meta.guardian_name).first : '',
            guardianLastName: meta.guardian_name ? parseName(meta.guardian_name).last : '',
            guardianRelationship: meta.guardian_relationship || 'Selecione',
            guardianPhone: meta.guardian_contact || '',
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
    return { first: parts[0], middle: '', last: parts[parts.length - 1] };
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleDateChange = (value: string) => {
    const digits = value.replace(/\D/g, '');
    let formatted = digits;
    if (digits.length > 2) formatted = `${digits.slice(0, 2)}/${digits.slice(2)}`;
    if (digits.length > 4) formatted = `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)}`;
    handleChange('birthDate', formatted);
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
        const guardianName = `${formData.guardianFirstName} ${formData.guardianLastName}`;
        
        let isoDate = null;
        if (formData.birthDate && formData.birthDate.length === 10) {
            const [day, month, year] = formData.birthDate.split('/');
            isoDate = `${year}-${month}-${day}`;
        }

        const updates = {
            first_name: formData.firstName,
            middle_name: formData.middleName,
            last_name: formData.lastName,
            full_name: fullName,
            name: fullName, // Update base name too
            birth_date: isoDate,
            document_type: formData.documentType,
            document_number: formData.documentNumber,
            nationality: formData.nationality,
            gender: formData.gender === 'Masculino' ? 'M' : 'F',
            phone_number: formData.phone,
            address: formData.address,
            province: formData.province,
            photo_url: photoPreview,
            
            // Meta Update
            raw_user_meta_data: {
                ...student.raw_user_meta_data, // Keep existing
                first_name: formData.firstName,
                middle_name: formData.middleName,
                last_name: formData.lastName,
                full_name: fullName,
                birth_date: isoDate,
                document_type: formData.documentType,
                document_number: formData.documentNumber,
                nationality: formData.nationality,
                gender: formData.gender === 'Masculino' ? 'M' : 'F',
                phone_number: formData.phone,
                address: formData.address,
                province: formData.province,
                photo_url: photoPreview,
                grade: formData.grade,
                
                father_name: formData.fatherName,
                mother_name: formData.motherName,
                guardian_name: guardianName,
                guardian_relationship: formData.guardianRelationship,
                guardian_contact: formData.guardianPhone,
                guardian_address: formData.guardianAddress
            }
        };

        const { error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', student.id);

        if (error) throw error;

        addToast('Dados atualizados com sucesso!', 'success');
        onSuccess();
      } catch (error: any) {
          console.error(error);
          addToast('Erro ao atualizar: ' + error.message, 'error');
      } finally {
          setLoading(false);
      }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 h-full flex flex-col">
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center">
             <div>
                <h2 className="text-xl font-bold text-slate-800">Editar Dados do Aluno</h2>
                <p className="text-sm text-slate-500">Atualize as informações pessoais e académicas</p>
             </div>
             <button onClick={onCancel} className="p-2 hover:bg-slate-100 rounded-full text-slate-400">
                 <span className="material-icons-outlined">close</span>
             </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8">
            <div className="max-w-4xl mx-auto space-y-8">
                
                {/* Photo & Basic Identity */}
                <div className="flex gap-8">
                     <div className="w-40 flex-shrink-0">
                        <div className="border border-slate-200 rounded-xl p-2 bg-slate-50 text-center mb-2">
                             <div className="w-full aspect-square bg-white rounded-lg mb-2 flex items-center justify-center text-slate-300 overflow-hidden relative">
                                  {photoPreview ? (
                                     <img src={photoPreview} className="w-full h-full object-cover" />
                                  ) : (
                                     <span className="material-icons-outlined text-6xl">person</span>
                                  )}
                             </div>
                             <button onClick={() => fileInputRef.current?.click()} className="text-xs font-bold text-[#137FEC] hover:underline">Alterar Foto</button>
                             <input type="file" ref={fileInputRef} onChange={handlePhotoSelect} className="hidden" accept="image/*" />
                        </div>
                     </div>

                     <div className="flex-1 grid grid-cols-2 gap-4">
                          <FormInput label="Nome Próprio" value={formData.firstName} onChange={v => handleChange('firstName', v)} />
                          <FormInput label="Apelido" value={formData.lastName} onChange={v => handleChange('lastName', v)} />
                          <FormInput label="Outros Nomes" value={formData.middleName} onChange={v => handleChange('middleName', v)} />
                          <FormInput label="Data de Nascimento" value={formData.birthDate} onChange={handleDateChange} placeholder="DD/MM/AAAA" />
                          <FormSelect label="Sexo" value={formData.gender} onChange={v => handleChange('gender', v)}>
                              <option>Masculino</option><option>Feminino</option>
                          </FormSelect>
                          <FormSelect label="Nacionalidade" value={formData.nationality} onChange={v => handleChange('nationality', v)}>
                              <option>Moçambicana</option><option>Estrangeira</option>
                          </FormSelect>
                     </div>
                </div>

                <div className="border-t border-slate-100 my-8"></div>

                {/* Documents & Contact */}
                <div>
                    <h3 className="text-[#137FEC] font-bold text-sm uppercase mb-4 flex items-center gap-2">
                        <span className="material-icons-outlined text-base">badge</span> Documentação e Contactos
                    </h3>
                    <div className="grid grid-cols-3 gap-4">
                         <FormSelect label="Tipo de Documento" value={formData.documentType} onChange={v => handleChange('documentType', v)}>
                             <option>BI</option><option>Passaporte</option>
                         </FormSelect>
                         <FormInput label="Número do Documento" value={formData.documentNumber} onChange={v => handleChange('documentNumber', v)} />
                         <FormSelect label="Província" value={formData.province} onChange={v => handleChange('province', v)}>
                             <option>Maputo Cidade</option><option>Maputo Província</option>
                         </FormSelect>
                         <div className="col-span-2">
                             <FormInput label="Morada" value={formData.address} onChange={v => handleChange('address', v)} />
                         </div>
                         <FormInput label="Telefone" value={formData.phone} onChange={v => handleChange('phone', v)} />
                    </div>
                </div>

                <div className="border-t border-slate-100 my-8"></div>

                {/* Parent/Guardian */}
                <div>
                     <h3 className="text-[#137FEC] font-bold text-sm uppercase mb-4 flex items-center gap-2">
                        <span className="material-icons-outlined text-base">family_restroom</span> Filiação e Encarregado
                    </h3>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                         <FormInput label="Nome do Pai" value={formData.fatherName} onChange={v => handleChange('fatherName', v)} />
                         <FormInput label="Nome da Mãe" value={formData.motherName} onChange={v => handleChange('motherName', v)} />
                    </div>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                        <h4 className="text-xs font-bold text-slate-500 uppercase mb-3">Dados do Encarregado</h4>
                        <div className="grid grid-cols-3 gap-4">
                             <FormInput label="Nome" value={formData.guardianFirstName} onChange={v => handleChange('guardianFirstName', v)} />
                             <FormInput label="Apelido" value={formData.guardianLastName} onChange={v => handleChange('guardianLastName', v)} />
                             <FormSelect label="Parentesco" value={formData.guardianRelationship} onChange={v => handleChange('guardianRelationship', v)}>
                                  <option>Pai</option><option>Mãe</option><option>Outro</option>
                             </FormSelect>
                             <FormInput label="Contacto" value={formData.guardianPhone} onChange={v => handleChange('guardianPhone', v)} />
                             <div className="col-span-2">
                                <FormInput label="Endereço" value={formData.guardianAddress} onChange={v => handleChange('guardianAddress', v)} />
                             </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-slate-200 flex justify-end gap-3 bg-slate-50 rounded-b-2xl">
            <button onClick={onCancel} className="px-6 py-2.5 rounded-xl border border-slate-300 text-slate-600 font-bold text-sm hover:bg-white transition-colors">Cancelar</button>
            <button onClick={handleSubmit} disabled={loading} className="px-6 py-2.5 rounded-xl bg-[#137FEC] text-white font-bold text-sm hover:bg-[#1565C0] shadow-lg shadow-blue-500/30 flex items-center gap-2 disabled:opacity-50">
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
        <label className="block text-xs font-bold text-slate-700 mb-1">{label}</label>
        <input 
            type="text" 
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#137FEC] focus:ring-1 focus:ring-[#137FEC]" 
            value={value} 
            onChange={e => onChange(e.target.value)} 
            placeholder={placeholder}
        />
    </div>
);

const FormSelect = ({ label, value, onChange, children }: any) => (
    <div>
         <label className="block text-xs font-bold text-slate-700 mb-1">{label}</label>
         <select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#137FEC] focus:ring-1 focus:ring-[#137FEC] bg-white" value={value} onChange={e => onChange(e.target.value)}>{children}</select>
    </div>
);

export default StudentEditForm;
