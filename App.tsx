
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
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({
          name: session.user.user_metadata.name || session.user.email?.split('@')[0] || 'Usuário',
          email: session.user.email || '',
        });
      }
      setIsLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          name: session.user.user_metadata.name || session.user.email?.split('@')[0] || 'Usuário',
          email: session.user.email || '',
        });
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
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
        <Route path="/login" element={!user ? <Login onLogin={() => {}} /> : <Navigate to="/dashboard" />} />
        <Route path="/register" element={!user ? <Register onRegister={() => {}} /> : <Navigate to="/dashboard" />} />
        
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
