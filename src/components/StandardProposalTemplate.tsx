
import React from 'react';
import { useBudgetItems } from '@/hooks/useBudgetItems';

interface ProposalData {
  id: string;
  title: string;
  companies?: {
    name: string;
    email?: string;
    phone?: string;
    logo_url?: string;
  };
  clients?: {
    name: string;
    email?: string;
    phone?: string;
  };
  user_profile?: {
    name?: string;
    phone?: string;
  };
  value?: number;
  delivery_time?: string;
  service_description?: string;
  detailed_description?: string;
  observations?: string;
  validity_date?: string;
  created_at: string;
  proposal_budget_items?: any[];
  user_id?: string;
}

interface StandardProposalTemplateProps {
  proposal: ProposalData;
  className?: string;
  companyLogo?: string;
}

const StandardProposalTemplate = ({ proposal, className = "", companyLogo }: StandardProposalTemplateProps) => {
  
  // Usar hook apenas se não temos dados diretos da proposta e se temos user_id
  const { data: hookBudgetItems = [] } = useBudgetItems(
    proposal.id && proposal.id !== 'temp-id' && proposal.user_id ? proposal.id : ''
  );

  // Usar dados diretos da proposta ou do hook
  const budgetItems = proposal.proposal_budget_items && proposal.proposal_budget_items.length > 0 
    ? proposal.proposal_budget_items 
    : hookBudgetItems;

  const formatCurrency = (value?: number) => {
    if (!value && value !== 0) return 'R$ 0,00';
    return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  };

  const getCurrentDate = () => {
    return new Date().toLocaleDateString('pt-BR');
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Não informado';
    return new Date(dateString).toLocaleDateString('pt-BR');
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

  // Usar logo passada como prop ou da empresa
  const logoToUse = companyLogo || proposal.companies?.logo_url;

  console.log('Dados da empresa na proposta:', {
    companies: proposal.companies,
    logoToUse,
    companyName: proposal.companies?.name
  });

  return (
    <div className={`bg-white p-8 max-w-4xl mx-auto font-sans text-gray-800 ${className}`}>
      {/* Cabeçalho da Empresa */}
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            {logoToUse && (
              <img 
                src={logoToUse} 
                alt="Logo da Empresa" 
                className="h-16 w-auto object-contain mb-4" 
              />
            )}
            <h1 className="text-xl font-bold text-gray-900 mb-1">
              {proposal.companies?.name || 'Nome da Empresa'}
            </h1>
            <div className="text-sm text-gray-600 space-y-1">
              <p><strong>Responsável:</strong> {proposal.user_profile?.name || 'Responsável'}</p>
              <p><strong>E-mail:</strong> {proposal.companies?.email || 'email@empresa.com'}</p>
              <p><strong>Telefone:</strong> {proposal.companies?.phone || proposal.user_profile?.phone || 'Telefone não informado'}</p>
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
        <h3 className="font-bold mb-2">Cliente: {proposal.clients?.name || 'Nome do Cliente'}</h3>
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

      {/* Informações Adicionais da Proposta */}
      <div className="mb-6 space-y-4">
        {/* Resumo do Serviço */}
        {proposal.service_description && (
          <div>
            <h3 className="font-bold mb-2 bg-gray-100 p-2">Resumo do Serviço</h3>
            <p className="text-sm leading-relaxed">{proposal.service_description}</p>
          </div>
        )}

        {/* Descrição Detalhada */}
        {proposal.detailed_description && (
          <div>
            <h3 className="font-bold mb-2 bg-gray-100 p-2">Descrição Detalhada</h3>
            <div className="text-sm leading-relaxed whitespace-pre-wrap">{proposal.detailed_description}</div>
          </div>
        )}

        {/* Prazo e Validade */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {proposal.delivery_time && (
            <div>
              <h4 className="font-bold mb-1">Prazo de Entrega</h4>
              <p className="text-sm">{proposal.delivery_time}</p>
            </div>
          )}
          
          {proposal.validity_date && (
            <div>
              <h4 className="font-bold mb-1">Validade da Proposta</h4>
              <p className="text-sm">{formatDate(proposal.validity_date)}</p>
            </div>
          )}
        </div>

        {/* Observações */}
        {proposal.observations && (
          <div>
            <h3 className="font-bold mb-2 bg-gray-100 p-2">Observações</h3>
            <div className="text-sm leading-relaxed whitespace-pre-wrap">{proposal.observations}</div>
          </div>
        )}
      </div>

      {/* Pagamento */}
      <div className="mb-6">
        <h3 className="font-bold mb-2 bg-gray-100 p-2">Forma de Pagamento</h3>
        <div className="text-sm">
          <p>Boleto, transferência bancária, dinheiro, cheque, cartão de crédito ou cartão de débito.</p>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center pt-6 mt-8 border-t border-gray-300">
        <div className="mt-8 pt-4 border-t border-gray-200">
          <p className="font-bold">{proposal.companies?.name || 'Nome da Empresa'}</p>
          <p className="text-sm">{proposal.user_profile?.name || 'Responsável'}</p>
        </div>
      </div>
    </div>
  );
};

export default StandardProposalTemplate;
