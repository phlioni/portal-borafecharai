
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const useCompanies = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['companies', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');

      console.log('Fetching companies for user:', user.id);
      
      const { data: companies, error } = await supabase
        .from('companies')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching companies:', error);
        throw error;
      }

      console.log('Companies found:', companies);

      // Se não há empresas, criar uma automaticamente
      if (!companies || companies.length === 0) {
        console.log('No companies found, creating default company');
        
        const { data: newCompany, error: createError } = await supabase
          .from('companies')
          .insert([{
            user_id: user.id,
            name: 'Minha Empresa',
            email: user.email || '',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }])
          .select()
          .single();

        if (createError) {
          console.error('Error creating company:', createError);
          throw createError;
        }

        console.log('Default company created:', newCompany);
        return [newCompany];
      }

      return companies;
    },
    enabled: !!user,
  });
};

export const useUpdateCompany = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      console.log('Updating company:', id, updates);
      
      const { data, error } = await supabase
        .from('companies')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', user?.id) // Garantir que só atualiza empresa do usuário
        .select()
        .single();

      if (error) {
        console.error('Error updating company:', error);
        throw error;
      }

      console.log('Company updated successfully:', data);
      return data;
    },
    onSuccess: () => {
      toast.success('Informações da empresa atualizadas com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['companies'] });
    },
    onError: (error: any) => {
      console.error('Error updating company:', error);
      toast.error('Erro ao atualizar informações da empresa');
    },
  });
};

export const useCreateCompany = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (companyData: any) => {
      if (!user) throw new Error('User not authenticated');

      console.log('Creating company for user:', user.id, companyData);
      
      const { data, error } = await supabase
        .from('companies')
        .insert([{
          ...companyData,
          user_id: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating company:', error);
        throw error;
      }

      console.log('Company created successfully:', data);
      return data;
    },
    onSuccess: () => {
      toast.success('Empresa criada com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['companies'] });
    },
    onError: (error: any) => {
      console.error('Error creating company:', error);
      toast.error('Erro ao criar empresa');
    },
  });
};
