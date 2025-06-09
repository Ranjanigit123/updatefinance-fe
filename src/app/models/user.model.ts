export interface User {
  _id: string;
  name: string;
  email: string;
  mobile: string;
  gpayAccess: string;
  role: 'owner' | 'borrower';
  qrCode?: string; // For owners
  address?: string; // For borrowers
  bankName?: string; // For borrowers
  accountHolderName?: string; // For borrowers
  photo?: string; // For borrowers
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface RegisterData {
  name: string;
  email: string;
  mobile: string;
  gpayAccess: string;
  password: string;
  confirmPassword: string;
  role: 'owner' | 'borrower';
  qrCode?: string;
  address?: string;
  bankName?: string;
  accountHolderName?: string;
  photo?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}