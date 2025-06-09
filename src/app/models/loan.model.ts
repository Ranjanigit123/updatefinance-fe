import { User } from './user.model';

export interface Loan {
  _id: string;
  owner: User;
  borrower: User;
  principalAmount: number;
  interestRate: number;
  totalAmount: number;
  duration: number; // in months
  monthlyAmount: number;
  amountPaid: number;
  balanceAmount: number;
  startDate: Date;
  nextPaymentDate: Date;
  lastPaymentDate?: Date;
  status: 'active' | 'completed' | 'overdue';
  paymentHistory: PaymentRecord[];
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentRecord {
  amount: number;
  date: Date;
  method: 'online' | 'cash';
  transactionId?: string;
  notes?: string;
}

export interface CreateLoanData {
  borrowerId: string;
  principalAmount: number;
  interestRate: number;
  duration: number;
}

export interface PaymentData {
  amount: number;
  method: 'online' | 'cash';
  transactionId?: string;
  notes?: string;
}

export interface UpdateLoanData {
  lastPaymentDate?: Date;
  amountPaid?: number;
}