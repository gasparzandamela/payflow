
import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import FinancialDashboard from './pages/FinancialDashboard';
import ExecutiveDashboard from './pages/ExecutiveDashboard';
import SecretariatDashboard from './pages/SecretariatDashboard';
import Settings from './pages/Settings';
import PaymentForm from './pages/PaymentForm';
import PaymentConfirm from './pages/PaymentConfirm';
import PaymentSuccess from './pages/PaymentSuccess';
import { PaymentDetails, User, Transaction } from './types';
import { supabase } from './supabaseClient';

const App: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [history, setHistory] = useState<Transaction[]>([]);
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails>({
    entity: '',
    reference: '',
    amount: ''
  });

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch('/api/proxy/auth/v1/user');
        
        if (response.ok) {
          const u = await response.json();
          
          // Buscar perfil do utilizador para obter o papel
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', u.id)
            .single();
          
          setUser({
            id: u.id,
            name: u.user_metadata?.name || u.email?.split('@')[0] || 'Usuário',
            email: u.email || '',
            role: profile?.role || 'student'
          });
          
          // Fetch transactions after user is identified
          fetchTransactions();
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error('Session check failed:', err);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, []);

  const fetchTransactions = async () => {
    try {
        const { data, error } = await supabase
          .from('transactions')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching transactions:', error);
        } else if (data) {
          const formatted: Transaction[] = data.map(tx => ({
            id: tx.id,
            description: tx.description,
            date: new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' }).format(new Date(tx.created_at)),
            amount: `${tx.amount} MZN`,
            status: tx.status,
            paymentMethod: tx.payment_method
          }));
          setHistory(formatted);
        }
    } catch (err) {
        console.error('Exception fetching transactions:', err);
    }
  };

  const completePayment = async (details: PaymentDetails) => {
    try {
      // 1. Process via API (Simulado ou real)
      const response = await fetch('/api/payments/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(details),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || result.error || 'Erro ao processar pagamento');
      }

      // 2. Registar transação na BD (Se a API já não o fizer)
      await supabase.from('transactions').insert([{
        student_id: user?.id,
        description: details.chargeId ? 'Pagamento de Propina' : 'Pagamento Avulso',
        amount: parseFloat(details.amount),
        status: 'Sucesso',
        payment_method: details.paymentMethod,
        entity: details.entity,
        reference: details.reference
      }]);

      // 3. Se vier de uma cobrança, marcar como paga
      if (details.chargeId) {
        await supabase
          .from('charges')
          .update({ status: 'paid' })
          .eq('id', details.chargeId);
      }

      await fetchTransactions();
      navigate('/pay/success');
    } catch (err: any) {
      console.error('Payment error:', err);
      alert(err.message || 'Erro ao processar pagamento. Tente novamente.');
    }
  };

  // Determinar dashboard baseado no papel
  const getDashboardRedirect = () => {
    if (!user) return '/login';
    if (user.role === 'admin_financeiro') return '/financeiro';
    if (user.role === 'direcao') return '/direcao';
    if (user.role === 'secretaria') return '/secretaria';
    return '/dashboard';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#137FEC]"></div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Rotas de Autenticação */}
      <Route 
        path="/login" 
        element={!user ? <Login onLogin={(u) => setUser(u)} /> : <Navigate to={getDashboardRedirect()} />} 
      />
      <Route 
        path="/register" 
        element={!user ? <Register onRegister={(u) => setUser(u)} /> : <Navigate to={getDashboardRedirect()} />} 
      />
      
      {/* Dashboard do Estudante */}
      <Route 
        path="/dashboard" 
        element={user ? <Dashboard user={user} history={history} /> : <Navigate to="/login" />} 
      />
      
      {/* Dashboard Financeiro (apenas para admin_financeiro) */}
      <Route 
        path="/financeiro" 
        element={
          user?.role === 'admin_financeiro' 
            ? <FinancialDashboard user={user} /> 
            : <Navigate to={user ? '/dashboard' : '/login'} />
        } 
      />

      {/* Dashboard da Direcção (Transversal) */}
      <Route 
        path="/direcao" 
        element={
          user?.role === 'direcao' 
            ? <ExecutiveDashboard user={user} /> 
            : <Navigate to={user ? '/dashboard' : '/login'} />
        } 
      />
      

      {/* Dashboard da Secretaria */}
      <Route 
        path="/secretaria" 
        element={
          user?.role === 'secretaria' 
            ? <SecretariatDashboard user={user} /> 
            : <Navigate to={user ? '/dashboard' : '/login'} />
        } 
      />

      {/* Configurações */}
      <Route 
        path="/configuracoes" 
        element={user ? <Settings user={user} /> : <Navigate to="/login" />} 
      />
      
      {/* Fluxo de Pagamento (estudantes) */}
      <Route 
        path="/pay" 
        element={
          user ? (
            <PaymentForm 
              onContinue={(details) => setPaymentDetails(details)} 
              initialData={paymentDetails}
            />
          ) : <Navigate to="/login" />
        } 
      />
      
      <Route 
        path="/pay/confirm" 
        element={
          user ? (
            <PaymentConfirm 
              details={paymentDetails} 
              onConfirm={() => completePayment(paymentDetails)}
            />
          ) : <Navigate to="/login" />
        } 
      />
      
      <Route 
        path="/pay/success" 
        element={
          user ? (
            <PaymentSuccess 
              details={paymentDetails} 
              user={user}
            />
          ) : <Navigate to="/login" />
        } 
      />

      {/* Rota padrão - redireciona baseado no papel */}
      <Route path="/" element={<Navigate to={getDashboardRedirect()} />} />
    </Routes>
  );
};

export default App;

