
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
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
            business_segment: null,
            business_type_detail: null,
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
  const { toast: shadcnToast } = useToast();

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

      console.log('Updating company:', id, updates);
      
      // Verificar se o telefone já existe para outro usuário (se telefone foi fornecido)
      if (updates.phone && updates.phone.trim() !== '') {
        const { data: existingCompanies, error: checkError } = await supabase
          .from('companies')
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
        .from('companies')
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
        .from('companies')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', user.id) // Dupla verificação de segurança
        .select()
        .single();

      if (error) {
        console.error('Error updating company:', error);
        if (error.message.includes('unique_phone_per_user')) {
          throw new Error('Este telefone já está cadastrado');
        }
        throw error;
      }

      console.log('Company updated successfully:', data);
      return data;
    },
    onSuccess: () => {
      shadcnToast({
        title: "Sucesso!",
        description: "Informações da empresa atualizadas com sucesso!",
      });
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      
      // Verificar bônus após atualização da empresa
      checkAndTriggerBonus();
    },
    onError: (error: any) => {
      console.error('Error updating company:', error);
      shadcnToast({
        title: "Erro",
        description: error.message || 'Erro ao atualizar informações da empresa',
        variant: "destructive",
      });
    },
  });
};

export const useCreateCompany = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (companyData: any) => {
      if (!user) throw new Error('User not authenticated');

      console.log('Creating company for user:', user.id, companyData);
      
      // Verificar se o telefone já existe (se fornecido)
      if (companyData.phone && companyData.phone.trim() !== '') {
        const { data: existingCompanies, error: checkError } = await supabase
          .from('companies')
          .select('id')
          .eq('phone', companyData.phone);

        if (checkError) {
          console.error('Error checking phone uniqueness:', checkError);
          throw new Error('Erro ao verificar telefone');
        }

        if (existingCompanies && existingCompanies.length > 0) {
          throw new Error('Este telefone já está cadastrado');
        }
      }

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
        if (error.message.includes('unique_phone_per_user')) {
          throw new Error('Este telefone já está cadastrado');
        }
        throw error;
      }

      console.log('Company created successfully:', data);
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Sucesso!",
        description: "Empresa criada com sucesso!",
      });
      queryClient.invalidateQueries({ queryKey: ['companies'] });
    },
    onError: (error: any) => {
      console.error('Error creating company:', error);
      toast({
        title: "Erro",
        description: error.message || 'Erro ao criar empresa',
        variant: "destructive",
      });
    },
  });
};
