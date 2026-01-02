
import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import PaymentForm from './pages/PaymentForm';
import PaymentConfirm from './pages/PaymentConfirm';
import PaymentSuccess from './pages/PaymentSuccess';
import { PaymentDetails, User, Transaction } from './types';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [history, setHistory] = useState<Transaction[]>([]);
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails>({
    entity: '',
    reference: '',
    amount: ''
  });

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

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login onLogin={(u) => setUser(u)} />} />
        <Route path="/register" element={<Register onRegister={(u) => setUser(u)} />} />
        
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
