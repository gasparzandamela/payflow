
export interface PaymentDetails {
  entity: string;
  reference: string;
  amount: string;
}

export interface User {
  name: string;
  email: string;
}

export interface Transaction {
  id: string;
  description: string;
  date: string;
  amount: string;
  status: 'Sucesso' | 'Pendente' | 'Falhou';
}
