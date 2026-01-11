
import React, { useState } from 'react';
import Layout from '../components/Layout';
import { User } from '../types';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import { supabase } from '../supabaseClient';

interface SettingsProps {
  user: User;
}

const Settings: React.FC<SettingsProps> = ({ user }) => {
  const [pin, setPin] = useState(user.pin || '');
  const [avatarUrl, setAvatarUrl] = useState(user.avatar_url || '');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleUpdateProfile = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ pin, avatar_url: avatarUrl })
        .eq('id', user.id);

      if (error) throw error;
      setMessage({ type: 'success', text: 'Perfil atualizado com sucesso!' });
      
      // Enviar evento de atualização se necessário (ou o App.tsx vai recarregar na navegação)
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setMessage({ type: 'error', text: 'Erro ao atualizar perfil: ' + err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout user={user} title="Configurações">
      <div className="max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-2">Configurações</h1>
          <p className="text-slate-500 font-medium">Gerencie sua segurança e aparência do perfil.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Card: Perfil/Avatar */}
          <Card className="p-8 space-y-6">
            <div className="flex items-center gap-4 mb-2">
              <div className="size-12 rounded-2xl bg-blue-50 text-[#137FEC] flex items-center justify-center">
                <span className="material-symbols-outlined">person</span>
              </div>
              <div>
                <h3 className="font-black text-slate-800 text-lg leading-none">Avatar e Perfil</h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">Personalize sua conta</p>
              </div>
            </div>

            <div className="flex flex-col items-center py-6">
               <div className="size-32 rounded-full border-4 border-white ring-2 ring-slate-100 shadow-xl overflow-hidden bg-slate-50 mb-6">
                  <img src={avatarUrl || "https://picsum.photos/seed/user/150/150"} alt="Preview" className="w-full h-full object-cover" />
               </div>
               
               <div className="w-full space-y-2">
                 <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">URL da Foto</label>
                 <Input 
                   type="text" 
                   placeholder="https://exemplo.com/foto.jpg" 
                   value={avatarUrl}
                   onChange={(e) => setAvatarUrl(e.target.value)}
                 />
                 <p className="text-[10px] text-slate-400 italic px-1">Insira a URL de uma imagem para o seu avatar.</p>
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
                <h3 className="font-black text-slate-800 text-lg leading-none">Segurança</h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">Mude seu código de acesso</p>
              </div>
            </div>

            <div className="space-y-6 py-4">
               <div className="space-y-2">
                 <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">PIN de Acesso</label>
                 <Input 
                   type="password" 
                   placeholder="****" 
                   maxLength={4}
                   value={pin}
                   onChange={(e) => setPin(e.target.value)}
                   className="text-center text-2xl tracking-[0.5em] font-black"
                 />
                 <p className="text-[10px] text-slate-400 italic px-1">O seu PIN deve ter 4 dígitos numéricos.</p>
               </div>
            </div>
            
            <div className="pt-4">
               <Button 
                 onClick={handleUpdateProfile} 
                 disabled={loading}
                 className="w-full py-4 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-2"
               >
                 {loading ? (
                   <div className="size-5 border-2 border-white/30 border-t-white animate-spin rounded-full"></div>
                 ) : (
                   <>
                     <span className="material-symbols-outlined text-lg">save</span>
                     <span>Salvar Alterações</span>
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
