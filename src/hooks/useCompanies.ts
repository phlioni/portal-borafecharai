
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface Company {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country_code?: string;
  cnpj?: string;
  website?: string;
  description?: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  logo_url?: string | null;
}

export const useCompanies = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['companies', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching companies:', error);
        throw error;
      }

      return data || [];
    },
    enabled: !!user,
  });
};

export const useCreateCompany = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (companyData: Omit<Company, 'id' | 'created_at' | 'updated_at'>) => {
      if (!user) throw new Error('User not authenticated');

      // Verificar telefone único se fornecido
      if (companyData.phone && companyData.phone.trim()) {
        const { data: isUnique, error: checkError } = await supabase.rpc('check_unique_phone_across_users', {
          p_phone: companyData.phone.trim(),
          p_user_id: user.id
        });

        if (checkError) {
          console.error('Erro ao verificar telefone:', checkError);
          throw new Error('Erro ao verificar telefone único');
        }

        if (!isUnique) {
          throw new Error('Este telefone já está sendo usado por outro usuário');
        }
      }

      const { data, error } = await supabase
        .from('companies')
        .insert([companyData])
        .select()
        .single();

      if (error) {
        console.error('Error creating company:', error);
        if (error.code === '23505') {
          throw new Error('Este telefone já está sendo usado por outro usuário');
        }
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

export const useUpdateCompany = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Company> }) => {
      if (!user) throw new Error('User not authenticated');

      // Verificar telefone único se fornecido
      if (updates.phone && updates.phone.trim()) {
        const { data: isUnique, error: checkError } = await supabase.rpc('check_unique_phone_across_users', {
          p_phone: updates.phone.trim(),
          p_user_id: user.id
        });

        if (checkError) {
          console.error('Erro ao verificar telefone:', checkError);
          throw new Error('Erro ao verificar telefone único');
        }

        if (!isUnique) {
          throw new Error('Este telefone já está sendo usado por outro usuário');
        }
      }

      const { data, error } = await supabase
        .from('companies')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating company:', error);
        if (error.code === '23505') {
          throw new Error('Este telefone já está sendo usado por outro usuário');
        }
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

// Legacy hook for backward compatibility
export const useCompany = () => {
  const { user } = useAuth();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCompanies = async () => {
    if (!user) {
      setCompanies([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching companies:', error);
        return;
      }

      console.log('Fetched companies for user:', user.id, data?.length || 0);
      setCompanies(data || []);
    } catch (error) {
      console.error('Error fetching companies:', error);
    } finally {
      setLoading(false);
    }
  };

  const createCompany = async (companyData: Omit<Company, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
    if (!user) throw new Error('User not authenticated');

    try {
      // Verificar telefone único se fornecido
      if (companyData.phone && companyData.phone.trim()) {
        const { data: isUnique, error: checkError } = await supabase.rpc('check_unique_phone_across_users', {
          p_phone: companyData.phone.trim(),
          p_user_id: user.id
        });

        if (checkError) {
          console.error('Erro ao verificar telefone:', checkError);
          throw new Error('Erro ao verificar telefone único');
        }

        if (!isUnique) {
          throw new Error('Este telefone já está sendo usado por outro usuário');
        }
      }

      const { data, error } = await supabase
        .from('companies')
        .insert([{
          ...companyData,
          user_id: user.id
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating company:', error);
        if (error.code === '23505') {
          throw new Error('Este telefone já está sendo usado por outro usuário');
        }
        throw error;
      }

      await fetchCompanies();
      return data;
    } catch (error) {
      console.error('Error creating company:', error);
      throw error;
    }
  };

  const updateCompany = async (id: string, updates: Partial<Company>) => {
    if (!user) throw new Error('User not authenticated');

    try {
      // Verificar telefone único se fornecido
      if (updates.phone && updates.phone.trim()) {
        const { data: isUnique, error: checkError } = await supabase.rpc('check_unique_phone_across_users', {
          p_phone: updates.phone.trim(),
          p_user_id: user.id
        });

        if (checkError) {
          console.error('Erro ao verificar telefone:', checkError);
          throw new Error('Erro ao verificar telefone único');
        }

        if (!isUnique) {
          throw new Error('Este telefone já está sendo usado por outro usuário');
        }
      }

      const { data, error } = await supabase
        .from('companies')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating company:', error);
        if (error.code === '23505') {
          throw new Error('Este telefone já está sendo usado por outro usuário');
        }
        throw error;
      }

      await fetchCompanies();
      return data;
    } catch (error) {
      console.error('Error updating company:', error);
      throw error;
    }
  };

  const deleteCompany = async (id: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { error } = await supabase
        .from('companies')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting company:', error);
        throw error;
      }

      await fetchCompanies();
    } catch (error) {
      console.error('Error deleting company:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, [user]);

  return {
    companies,
    loading,
    fetchCompanies,
    createCompany,
    updateCompany,
    deleteCompany
  };
};
