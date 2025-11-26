import { useState, useEffect } from 'react';
import { supabase, type Category } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export const useCategories = (type?: 'income' | 'expense') => {
    const { user } = useAuth();
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                let query = supabase
                    .from('categories')
                    .select('*')
                    .or(`is_system.eq.true${user ? `,user_id.eq.${user.id}` : ''}`)
                    .order('name');

                if (type) {
                    query = query.eq('type', type);
                }

                const { data, error } = await query;

                if (error) throw error;
                setCategories(data || []);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();

        // Real-time subscription
        const channel = supabase
            .channel('categories_changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'categories',
                },
                () => {
                    fetchCategories();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user, type]);

    return { categories, loading, error };
};
