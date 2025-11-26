import { useState, useEffect, useCallback } from 'react';
import { supabase, type Account } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export const useAccounts = () => {
    const { user } = useAuth();
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchAccounts = useCallback(async () => {
        if (!user) {
            setAccounts([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('accounts')
                .select('*')
                .eq('user_id', user.id)
                .eq('is_active', true)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setAccounts(data || []);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchAccounts();

        if (!user) return;

        // Real-time subscription
        const channel = supabase
            .channel('accounts_changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'accounts',
                    filter: `user_id=eq.${user.id}`,
                },
                () => {
                    fetchAccounts();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user, fetchAccounts]);

    return { accounts, loading, error, refetch: fetchAccounts };
};
