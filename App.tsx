
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
        // Try to get the user from Supabase via our proxy
        // This will succeed only if the httpOnly cookies are valid
        const response = await fetch('/api/proxy/auth/v1/user');
        
        if (response.ok) {
          const user = await response.json();
          setUser({
            name: user.user_metadata?.name || user.email?.split('@')[0] || 'Usuário',
            email: user.email || '',
          });
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

  const completePayment = (details: PaymentDetails) => {
    const newTransaction: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      description: `Pagamento de Mensalidade - Entidade ${details.entity}`,
      date: new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' }).format(new Date()),
      amount: `${details.amount} MZN`,
      status: 'Sucesso'
    };
    setHistory(prev => [newTransaction, ...prev]);
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
