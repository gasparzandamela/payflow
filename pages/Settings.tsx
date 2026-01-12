
import React, { useState } from 'react';
import Layout from '../components/Layout';
import { User } from '../types';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import { supabase } from '../supabaseClient';
import { useLanguage } from '../components/LanguageContext';

interface SettingsProps {
  user: User;
}

const Settings: React.FC<SettingsProps> = ({ user }) => {
  const { t } = useLanguage();
  const [pin, setPin] = useState(user.pin || '');
  const [avatarUrl, setAvatarUrl] = useState(user.avatar_url || '');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validations
    if (file.size > 2 * 1024 * 1024) {
      setMessage({ type: 'error', text: t('file_too_large') });
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setAvatarUrl(publicUrl);
      setMessage({ type: 'success', text: t('photo_uploaded_save') });
    } catch (err: any) {
      console.error('Error uploading avatar:', err);
      setMessage({ type: 'error', text: t('upload_error') + err.message });
    } finally {
      setUploading(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (pin && pin.length !== 6) {
      setMessage({ type: 'error', text: t('pin_must_be_6') });
      return;
    }

    setLoading(true);
    setMessage(null);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ pin, avatar_url: avatarUrl })
        .eq('id', user.id);

      if (error) throw error;
      setMessage({ type: 'success', text: t('profile_updated') });
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setMessage({ type: 'error', text: t('profile_updated_error') + err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout user={user} title={t('settings_desc') as any}>
      <div className="max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-2">{t('settings')}</h1>
          <p className="text-slate-500 font-medium">{t('manage_security_appearance')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Card: Perfil/Avatar */}
          <Card className="p-8 space-y-6">
            <div className="flex items-center gap-4 mb-2">
              <div className="size-12 rounded-2xl bg-blue-50 text-[#137FEC] flex items-center justify-center">
                <span className="material-symbols-outlined">person</span>
              </div>
              <div>
                <h3 className="font-black text-slate-800 text-lg leading-none">{t('avatar_profile')}</h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">{t('personalize_account')}</p>
              </div>
            </div>

            <div className="flex flex-col items-center py-6">
               <div className="relative group">
                 <div className="size-32 rounded-full border-4 border-white ring-2 ring-slate-100 shadow-xl overflow-hidden bg-slate-50 mb-4 transition-transform group-hover:scale-105">
                    <img src={avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} alt="Preview" className="w-full h-full object-cover" />
                 </div>
                 {uploading && (
                   <div className="absolute inset-0 size-32 rounded-full bg-black/40 flex items-center justify-center">
                     <div className="size-6 border-2 border-white/30 border-t-white animate-spin rounded-full"></div>
                   </div>
                 )}
               </div>
               
               <div className="w-full">
                 <label className="flex flex-col items-center justify-center w-full h-12 px-4 py-2 bg-white text-blue-600 rounded-xl border border-blue-100 cursor-pointer hover:bg-blue-50 transition-colors font-bold text-sm">
                   <div className="flex items-center gap-2">
                     <span className="material-symbols-outlined text-lg">cloud_upload</span>
                     <span>{uploading ? t('wait_loading') : t('change_photo')}</span>
                   </div>
                   <input type='file' className="hidden" accept="image/*" onChange={handleFileUpload} disabled={uploading} />
                 </label>
                 <p className="text-[10px] text-center text-slate-400 font-medium mt-3 px-1 uppercase tracking-tight">{t('photo_formats')}</p>
               </div>
            </div>
          </Card>

          {/* Card: PIN / Segurança */}
          <Card className="p-8 space-y-6">
            <div className="flex items-center gap-4 mb-2">
              <div className="size-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center">
                <span className="material-symbols-outlined">lock</span>
              </div>
              <div>
                <h3 className="font-black text-slate-800 text-lg leading-none">{t('security')}</h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">{t('change_pin')}</p>
              </div>
            </div>

            <div className="space-y-6 py-4">
               <div className="space-y-2">
                 <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">{t('access_pin')}</label>
                 <Input 
                   type="text" 
                   placeholder="******" 
                   maxLength={6}
                   value={pin}
                   onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                   className="text-center text-2xl tracking-[0.5em] font-black"
                 />
                 <p className="text-[10px] text-slate-400 italic px-1 font-medium">{t('pin_notice')}</p>
               </div>
            </div>
            
            <div className="pt-4">
               <Button 
                 onClick={handleUpdateProfile} 
                 disabled={loading || uploading}
                 className="w-full py-4 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-2"
               >
                 {loading ? (
                   <div className="size-5 border-2 border-white/30 border-t-white animate-spin rounded-full"></div>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-lg">save</span>
                      <span>{t('save')}</span>
                    </>
                  )}
               </Button>
            </div>

            {message && (
              <div className={`mt-4 p-4 rounded-xl text-sm font-bold animate-in fade-in slide-in-from-top-2 flex items-center gap-2 ${
                message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
              }`}>
                <span className="material-symbols-outlined text-lg">
                  {message.type === 'success' ? 'check_circle' : 'error'}
                </span>
                {message.text}
              </div>
            )}
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;
