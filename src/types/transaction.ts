export interface Transaction {
  id: number;
  wallet_id: number;
  user_id: number;
  kind: 'deposit' | 'withdraw';
  type: 'credit' | 'debit';
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  method: string;
  proof_url?: string;
  meta?: any;
  reference: string;
  admin_notes?: string;
  processed_at?: string;
  processed_by?: number;
  created_at: string;
  updated_at: string;
  formatted_amount?: string;
  user?: User;
  wallet?: Wallet;
  processedBy?: User;
}

export interface Wallet {
  id: number;
  user_id: number;
  available_balance: number;
  invested_balance: number;
  total_earnings: number;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  email_verified_at?: string;
  created_at: string;
  updated_at: string;
  wallet?: Wallet;
}

export interface TransactionState {
  transactions: Transaction[];
  userTransactions: Transaction[];
  loading: boolean;
  error: string | null;
  filters: {
    kind?: string;
    status?: string;
    user_id?: number;
    from?: string;
    to?: string;
  };
  summary: {
    total_count: number;
    total_amount: number;
    by_status: Record<string, number>;
    by_kind: Record<string, number>;
  };
}

export interface CreateTransactionData {
  kind: 'deposit' | 'withdraw';
  type: 'credit' | 'debit';
  amount: number;
  method: string;
  proof_url?: string;
  meta?: any;
}

export interface UpdateTransactionStatusData {
  status: 'pending' | 'completed' | 'failed';
  admin_notes?: string;
}

export interface UpdateTransactionData {
  kind?: 'deposit' | 'withdraw';
  type?: 'credit' | 'debit';
  amount?: number;
  status?: 'pending' | 'completed' | 'failed';
  method?: string;
  proof_url?: string;
  meta?: any;
  admin_notes?: string;
}

export interface TransactionFilters {
  kind?: 'deposit' | 'withdraw';
  status?: 'pending' | 'completed' | 'failed';
  user_id?: number;
  from?: string;
  to?: string;
  page?: number;
  per_page?: number;
}