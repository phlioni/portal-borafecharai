
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
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
  cnpj?: string;
  website?: string;
  description?: string;
  logo_url?: string;
  country_code?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
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
        console.error('Erro ao buscar empresas:', error);
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
    mutationFn: async (companyData: Omit<Company, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
      if (!user) throw new Error('Usuário não autenticado');

      // Validar formato do telefone se fornecido
      if (companyData.phone) {
        const phoneRegex = /^55\d{2}\d{8,9}$/;
        if (!phoneRegex.test(companyData.phone)) {
          throw new Error('Telefone deve estar no formato 55+DDD+Número (ex: 5511999999999)');
        }

        // Verificar se já existe uma empresa com este telefone para outro usuário
        const { data: existingCompany } = await supabase
          .from('companies')
          .select('id, user_id')
          .eq('phone', companyData.phone)
          .neq('user_id', user.id)
          .maybeSingle();

        if (existingCompany) {
          throw new Error('Este telefone já está cadastrado para outro usuário. Por favor, utilize um telefone diferente.');
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
        console.error('Erro ao criar empresa:', error);
        throw new Error('Erro ao criar empresa: ' + error.message);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      toast.success('Empresa criada com sucesso!');
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
      if (!user) throw new Error('Usuário não autenticado');

      // Validar formato do telefone se fornecido
      if (updates.phone) {
        const phoneRegex = /^55\d{2}\d{8,9}$/;
        if (!phoneRegex.test(updates.phone)) {
          throw new Error('Telefone deve estar no formato 55+DDD+Número (ex: 5511999999999)');
        }

        // Verificar se já existe uma empresa com este telefone para outro usuário
        const { data: existingCompany } = await supabase
          .from('companies')
          .select('id, user_id')
          .eq('phone', updates.phone)
          .neq('user_id', user.id)
          .neq('id', id)
          .maybeSingle();

        if (existingCompany) {
          throw new Error('Este telefone já está cadastrado para outro usuário. Por favor, utilize um telefone diferente.');
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
        console.error('Erro ao atualizar empresa:', error);
        throw new Error('Erro ao atualizar empresa: ' + error.message);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      toast.success('Empresa atualizada com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

export const useDeleteCompany = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error('Usuário não autenticado');

      const { error } = await supabase
        .from('companies')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Erro ao excluir empresa:', error);
        throw new Error('Erro ao excluir empresa: ' + error.message);
      }

      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      toast.success('Empresa excluída com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};
