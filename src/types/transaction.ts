export interface Transaction {
  id: number;
  wallet_id: number;
  user_id: number;
  kind: 'deposit' | 'withdraw';
  type: 'credit' | 'debit';
  amount: string;
  status: 'pending' | 'completed' | 'failed';
  method: string;
  network?: string;
  proof_url?: string;
  withdrawal_details?: {
    account_number?: string;
    bank_name?: string;
    account_name?: string;
    wallet_address?: string;
    network?: string;
  };
  admin_notes?: string;
  meta?: any;
  reference: string;
  processed_at?: string;
  processed_by?: number;
  created_at: string;
  updated_at: string;
  user?: {
    id: number;
    name: string;
    email: string;
  };
  wallet?: {
    id: number;
    available_balance: string;
    total_balance: string;
  };
  processedBy?: {
    id: number;
    name: string;
    email: string;
  };
}

export interface CreateTransactionData {
  kind: 'deposit' | 'withdraw';
  amount: number;
  network?: string;
  proof_url?: string;
  method?: 'crypto' | 'bank';
  withdrawal_details?: {
    account_number?: string;
    bank_name?: string;
    account_name?: string;
    wallet_address?: string;
    network?: string;
  };
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
  network?: string;
  proof_url?: string;
  withdrawal_details?: any;
  admin_notes?: string;
}

export interface TransactionFilters {
  kind?: 'deposit' | 'withdraw';
  status?: 'pending' | 'completed' | 'failed';
  user_id?: number;
  from?: string;
  to?: string;
}

export interface TransactionState {
  transactions: Transaction[];
  userTransactions: Transaction[];
  pendingTransactions: Transaction[];
  loading: boolean;
  error: string | null;
  filters: TransactionFilters;
  summary: {
    total_count: number;
    total_amount: number;
    by_status: Record<string, number>;
    by_kind: Record<string, number>;
  };
  walletAddress: {
    wallet_address: string;
    qr_code: string;
    network: string;
  } | null;
}