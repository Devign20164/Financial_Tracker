import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for database tables
export type Profile = {
    id: string;
    email: string;
    first_name: string | null;
    last_name: string | null;
    phone: string | null;
    address: string | null;
    avatar_url: string | null;
    created_at: string;
    updated_at: string;
};

export type Account = {
    id: string;
    user_id: string;
    name: string;
    type: 'cash' | 'bank' | 'credit' | 'wallet';
    balance: number;
    credit_limit: number | null;
    currency: string;
    icon: string;
    is_active: boolean;
    statement_date: string | null;
    payment_due_date: string | null;
    created_at: string;
    updated_at: string;
};

export type Category = {
    id: string;
    user_id: string | null;
    name: string;
    type: 'income' | 'expense';
    icon: string;
    color: string;
    is_system: boolean;
    created_at: string;
};

export type Transaction = {
    id: string;
    user_id: string;
    account_id: string;
    category_id: string;
    type: 'income' | 'expense';
    amount: number;
    description: string | null;
    date: string;
    created_at: string;
    updated_at: string;
};

// Database type with relationships
export type Database = {
    public: {
        Tables: {
            profiles: {
                Row: Profile;
                Insert: Omit<Profile, 'id' | 'created_at' | 'updated_at'>;
                Update: Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>;
            };
            accounts: {
                Row: Account;
                Insert: Omit<Account, 'id' | 'created_at' | 'updated_at'>;
                Update: Partial<Omit<Account, 'id' | 'created_at' | 'updated_at'>>;
            };
            categories: {
                Row: Category;
                Insert: Omit<Category, 'id' | 'created_at'>;
                Update: Partial<Omit<Category, 'id' | 'created_at'>>;
            };
            transactions: {
                Row: Transaction;
                Insert: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>;
                Update: Partial<Omit<Transaction, 'id' | 'created_at' | 'updated_at'>>;
            };
        };
    };
};
