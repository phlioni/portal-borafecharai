
import React from 'react';
import { useBudgetItems } from '@/hooks/useBudgetItems';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface ProposalData {
  id: string;
  title: string;
  companies?: {
    name: string;
    email?: string;
    phone?: string;
  };
  value?: number;
  delivery_time?: string;
  service_description?: string;
  detailed_description?: string;
  observations?: string;
  created_at: string;
}

interface StandardProposalTemplateProps {
  proposal: ProposalData;
  className?: string;
}

const StandardProposalTemplate = ({ proposal, className = "" }: StandardProposalTemplateProps) => {
  const { user } = useAuth();
  const { data: budgetItems = [] } = useBudgetItems(proposal.id);

  // Buscar dados da empresa do usuário
  const { data: userCompany } = useQuery({
    queryKey: ['user-company', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) return null;
      return data;
    },
    enabled: !!user,
  });

  // Buscar dados do perfil do usuário
  const { data: userProfile } = useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) return null;
      return data;
    },
    enabled: !!user,
  });

  const formatCurrency = (value?: number) => {
    if (!value && value !== 0) return 'R$ 0,00';
    return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  };

  const getCurrentDate = () => {
    return new Date().toLocaleDateString('pt-BR');
  };

  const getProposalNumber = () => {
    const shortId = proposal.id.slice(-6).toUpperCase();
    return `016-${shortId}`;
  };

  // Separar itens por tipo
  const services = budgetItems.filter(item => item.type === 'labor');
  const materials = budgetItems.filter(item => item.type === 'material');
  
  const servicesTotal = services.reduce((total, item) => total + (item.total_price || 0), 0);
  const materialsTotal = materials.reduce((total, item) => total + (item.total_price || 0), 0);
  const grandTotal = servicesTotal + materialsTotal;

  return (
    <div className={`bg-white p-8 max-w-4xl mx-auto font-sans text-gray-800 ${className}`}>
      {/* Cabeçalho da Empresa */}
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            {userCompany?.logo_url && (
              <img 
                src={userCompany.logo_url} 
                alt="Logo da Empresa" 
                className="h-16 w-auto object-contain mb-4" 
              />
            )}
            <h1 className="text-xl font-bold text-gray-900 mb-1">
              {userCompany?.name || 'NOME DA EMPRESA'}
            </h1>
            <div className="text-sm text-gray-600 space-y-1">
              <p><strong>Responsável:</strong> {userProfile?.name || user?.email || 'Responsável'}</p>
              <p><strong>E-mail:</strong> {user?.email || 'email@empresa.com'}</p>
              <p><strong>Telefone:</strong> {userProfile?.phone || userCompany?.phone || 'Telefone não informado'}</p>
            </div>
          </div>
          <div className="text-right text-sm">
            <p>📅 {getCurrentDate()}</p>
          </div>
        </div>
      </div>

      {/* Número do Orçamento */}
      <div className="mb-6 bg-gray-100 p-4">
        <h2 className="text-lg font-bold">Orçamento {getProposalNumber()}</h2>
      </div>

      {/* Cliente */}
      <div className="mb-6">
        <h3 className="font-bold mb-2">Cliente: {proposal.companies?.name || 'Nome do Cliente'}</h3>
      </div>

      {/* Serviços */}
      {services.length > 0 && (
        <div className="mb-6">
          <h3 className="font-bold mb-3 bg-gray-100 p-2">Serviços</h3>
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Descrição</th>
                <th className="text-center py-2">Unidade</th>
                <th className="text-center py-2">Preço unitário</th>
                <th className="text-center py-2">Qtd.</th>
                <th className="text-right py-2">Preço</th>
              </tr>
            </thead>
            <tbody>
              {services.map((item, index) => (
                <tr key={index} className="border-b">
                  <td className="py-2">{item.description}</td>
                  <td className="text-center py-2">unidade</td>
                  <td className="text-center py-2">{formatCurrency(item.unit_price)}</td>
                  <td className="text-center py-2">{item.quantity}</td>
                  <td className="text-right py-2">{formatCurrency(item.total_price)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Materiais */}
      {materials.length > 0 && (
        <div className="mb-6">
          <h3 className="font-bold mb-3 bg-gray-100 p-2">Materiais</h3>
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Descrição</th>
                <th className="text-center py-2">Unidade</th>
                <th className="text-center py-2">Preço unitário</th>
                <th className="text-center py-2">Qtd.</th>
                <th className="text-right py-2">Preço</th>
              </tr>
            </thead>
            <tbody>
              {materials.map((item, index) => (
                <tr key={index} className="border-b">
                  <td className="py-2">{item.description}</td>
                  <td className="text-center py-2">unidade</td>
                  <td className="text-center py-2">{formatCurrency(item.unit_price)}</td>
                  <td className="text-center py-2">{item.quantity}</td>
                  <td className="text-right py-2">{formatCurrency(item.total_price)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Totais */}
      {budgetItems.length > 0 && (
        <div className="mb-6 text-right">
          <div className="space-y-1">
            <p>Serviços: {formatCurrency(servicesTotal)}</p>
            <p>Materiais: {formatCurrency(materialsTotal)}</p>
            <p className="font-bold text-lg">Total: {formatCurrency(grandTotal)}</p>
          </div>
        </div>
      )}

      {/* Pagamento */}
      <div className="mb-6">
        <h3 className="font-bold mb-2">Pagamento</h3>
        <div className="text-sm">
          <p><strong>Meios de pagamento</strong></p>
          <p>Boleto, transferência bancária, dinheiro, cheque, cartão de crédito ou cartão de débito.</p>
          {proposal.delivery_time && (
            <p className="mt-2">
              <strong>Prazo:</strong> {proposal.delivery_time}
            </p>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="text-center pt-6 mt-8 border-t border-gray-300">
        <div className="mt-8 pt-4 border-t border-gray-200">
          <p className="font-bold">{userCompany?.name || 'NOME DA EMPRESA'}</p>
          <p className="text-sm">{userProfile?.name || user?.email || 'Responsável'}</p>
        </div>
      </div>
    </div>
  );
};

export default StandardProposalTemplate;
