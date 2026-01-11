
// Métodos de Pagamento disponíveis
export type PaymentMethodType = 
  | 'MPESA' 
  | 'EMOLA' 
  | 'BANK_TRANSFER' 
  | 'BANK_DEPOSIT' 
  | 'CASH' 
  | 'CHEQUE';

export const PAYMENT_METHODS = {
  MPESA: { code: 'MPESA', name: 'M-Pesa', icon: 'phone_android', color: '#E31B23', description: 'Pague com o seu número M-Pesa' },
  EMOLA: { code: 'EMOLA', name: 'e-Mola', icon: 'phone_android', color: '#FF6B00', description: 'Pague com o seu número e-Mola' },
  BANK_TRANSFER: { code: 'BANK_TRANSFER', name: 'Transferência Bancária', icon: 'account_balance', color: '#1E40AF', description: 'Pague via homebanking ou multibanco' },
  BANK_DEPOSIT: { code: 'BANK_DEPOSIT', name: 'Depósito Bancário', icon: 'savings', color: '#059669', description: 'Faça um depósito e submeta o comprovativo' },
  CASH: { code: 'CASH', name: 'Numerário', icon: 'payments', color: '#16A34A', description: 'Pagamento presencial no balcão' },
  CHEQUE: { code: 'CHEQUE', name: 'Cheque', icon: 'receipt', color: '#7C3AED', description: 'Pagamento por cheque' },
} as const;

export interface PaymentDetails {
  entity: string;
  reference: string;
  amount: string;
  paymentMethod?: PaymentMethodType;
  phoneNumber?: string; // Para M-Pesa/e-Mola
  proofUrl?: string;    // Para comprovativo
  chargeId?: string;    // ID da cobrança se vier de uma notificação
}

export interface User {
  id?: string;
  name: string;
  email: string;
  role?: 'student' | 'admin_financeiro' | 'secretaria' | 'direcao';
  // Extended Profile Fields
  first_name?: string;
  middle_name?: string;
  last_name?: string;
  birth_date?: string;
  gender?: string;
  nationality?: string;
  address?: string;
  document_type?: 'BI' | 'PASSPORT' | 'DIRE' | 'OTHER';
  document_number?: string;
  phone_number?: string;
  father_name?: string;
  mother_name?: string;
  status?: string; // from previous migration
  pin?: string;
  avatar_url?: string;
}

export interface Transaction {
  id: string;
  description: string;
  date: string;
  amount: string;
  status: 'Sucesso' | 'Pendente' | 'Falhou';
  paymentMethod?: PaymentMethodType;
  entity?: string; // New field
  reference?: string; // New field
}
