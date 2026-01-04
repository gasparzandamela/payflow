
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import PaymentForm from './pages/PaymentForm';
import PaymentConfirm from './pages/PaymentConfirm';
import PaymentSuccess from './pages/PaymentSuccess';
import { PaymentDetails, User, Transaction } from './types';
import { supabase } from './supabaseClient';

const App: React.FC = () => {
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
          setUser({
            name: u.user_metadata?.name || u.email?.split('@')[0] || 'Usuário',
            email: u.email || '',
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
        status: tx.status
      }));
      setHistory(formatted);
    }
  };

  const completePayment = async (details: PaymentDetails) => {
    const { error } = await supabase
      .from('transactions')
      .insert({
        entity: details.entity,
        reference: details.reference,
        amount: parseFloat(details.amount.replace(',', '.')),
        description: `Pagamento de Mensalidade - Entidade ${details.entity}`,
        status: 'Sucesso'
      });

    if (error) {
      console.error('Error saving transaction:', error);
      alert('Erro ao processar pagamento no servidor. Verifique o console.');
    } else {
      fetchTransactions(); // Refresh history
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#137FEC]"></div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={!user ? <Login onLogin={(u) => setUser(u)} /> : <Navigate to="/dashboard" />} />
        <Route path="/register" element={!user ? <Register onRegister={(u) => setUser(u)} /> : <Navigate to="/dashboard" />} />
        
        <Route 
          path="/dashboard" 
          element={user ? <Dashboard user={user} history={history} /> : <Navigate to="/login" />} 
        />
        
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

        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
