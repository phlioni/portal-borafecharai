
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const useUserCompany = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['user-company', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');

      console.log('Fetching user company for user:', user.id);
      
      const { data: companies, error } = await supabase
        .from('user_companies')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching user company:', error);
        throw error;
      }

      console.log('User companies found:', companies);

      // Se não há empresa, criar uma automaticamente
      if (!companies || companies.length === 0) {
        console.log('No user company found, creating default company');
        
        const { data: newCompany, error: createError } = await supabase
          .from('user_companies')
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
          console.error('Error creating user company:', createError);
          throw createError;
        }

        console.log('Default user company created:', newCompany);
        return newCompany;
      }

      return companies[0]; // Retorna a primeira (e única) empresa do usuário
    },
    enabled: !!user,
  });
};

export const useUpdateUserCompany = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();

  const checkAndTriggerBonus = async () => {
    if (!user?.id) return;

    try {
      console.log('Verificando se deve acionar bônus após atualização da empresa');
      
      // Aguardar um pouco para garantir que os dados foram salvos
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['profile-completion'] });
      }, 1000);
    } catch (error) {
      console.error('Erro ao verificar bônus:', error);
    }
  };

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      console.log('Updating user company:', id, updates);
      
      // Verificar se o telefone já existe para outro usuário (se telefone foi fornecido)
      if (updates.phone && updates.phone.trim() !== '') {
        const { data: existingCompanies, error: checkError } = await supabase
          .from('user_companies')
          .select('id, user_id')
          .eq('phone', updates.phone)
          .neq('id', id);

        if (checkError) {
          console.error('Error checking phone uniqueness:', checkError);
          throw new Error('Erro ao verificar telefone');
        }

        // Verificar se existe alguma empresa com este telefone que não seja do usuário atual
        const conflictingCompany = existingCompanies?.find(company => company.user_id !== user.id);
        if (conflictingCompany) {
          throw new Error('Este telefone já está cadastrado por outro usuário');
        }
      }

      // Verificar se a empresa pertence ao usuário atual
      const { data: companyOwner, error: ownerError } = await supabase
        .from('user_companies')
        .select('user_id')
        .eq('id', id)
        .maybeSingle();

      if (ownerError) {
        console.error('Error checking company owner:', ownerError);
        throw new Error('Empresa não encontrada');
      }

      if (!companyOwner || companyOwner.user_id !== user.id) {
        throw new Error('Você não tem permissão para modificar esta empresa');
      }

      // Realizar a atualização apenas para a empresa do usuário atual
      const { data, error } = await supabase
        .from('user_companies')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', user.id) // Dupla verificação de segurança
        .select()
        .single();

      if (error) {
        console.error('Error updating user company:', error);
        throw error;
      }

      console.log('User company updated successfully:', data);
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Sucesso!",
        description: "Informações da empresa atualizadas com sucesso!",
      });
      queryClient.invalidateQueries({ queryKey: ['user-company'] });
      
      // Verificar bônus após atualização da empresa
      checkAndTriggerBonus();
    },
    onError: (error: any) => {
      console.error('Error updating user company:', error);
      toast({
        title: "Erro",
        description: error.message || 'Erro ao atualizar informações da empresa',
        variant: "destructive",
      });
    },
  });
};

export const useCreateUserCompany = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (companyData: any) => {
      if (!user) throw new Error('User not authenticated');

      console.log('Creating user company for user:', user.id, companyData);
      
      const { data, error } = await supabase
        .from('user_companies')
        .insert([{
          ...companyData,
          user_id: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating user company:', error);
        throw error;
      }

      console.log('User company created successfully:', data);
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Sucesso!",
        description: "Empresa criada com sucesso!",
      });
      queryClient.invalidateQueries({ queryKey: ['user-company'] });
    },
    onError: (error: any) => {
      console.error('Error creating user company:', error);
      toast({
        title: "Erro",
        description: error.message || 'Erro ao criar empresa',
        variant: "destructive",
      });
    },
  });
};
