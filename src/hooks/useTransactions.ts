import { useState, useEffect, useRef } from 'react';
import { supabase, type Transaction } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export const useTransactions = () => {
    const { user } = useAuth();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const channelRef = useRef<any>(null);

    const fetchTransactions = async () => {
        if (!user) {
            setTransactions([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('transactions')
                .select('*')
                .eq('user_id', user.id)
                .order('date', { ascending: false })
                .order('created_at', { ascending: false });

            if (error) throw error;
            setTransactions(data || []);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions();

        if (!user) return;

        // Remove existing channel if any
        if (channelRef.current) {
            supabase.removeChannel(channelRef.current);
        }

        // Create a unique channel name to avoid conflicts
        const channelName = `transactions_changes_${user.id}_${Date.now()}`;
        const channel = supabase
            .channel(channelName)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'transactions',
                    filter: `user_id=eq.${user.id}`,
                },
                (payload) => {
                    console.log('Transaction change detected:', payload.eventType);
                    fetchTransactions();
                }
            )
            .subscribe((status) => {
                if (status === 'SUBSCRIBED') {
                    console.log('Subscribed to transaction changes');
                } else if (status === 'CHANNEL_ERROR') {
                    console.error('Channel subscription error');
                }
            });

        channelRef.current = channel;

        return () => {
            if (channelRef.current) {
                supabase.removeChannel(channelRef.current);
                channelRef.current = null;
            }
        };
    }, [user?.id]); // Only depend on user.id to avoid unnecessary recreations

    return { transactions, loading, error, refetch: fetchTransactions };
};
