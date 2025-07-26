
import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface StandardProposalTemplateProps {
  proposal: any;
  companyLogo?: string;
  className?: string;
}

const StandardProposalTemplate = ({ proposal, companyLogo, className = '' }: StandardProposalTemplateProps) => {
  console.log('StandardProposalTemplate - Dados da proposta:', proposal);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR });
    } catch {
      return dateString;
    }
  };

  const formatItemType = (type: string) => {
    if (type === 'labor') {
      return 'Serviço';
    }
    if (type === 'material') {
      return 'Material';
    }
    return type;
  };

  const calculateTotal = () => {
    if (proposal?.proposal_budget_items?.length) {
      return proposal.proposal_budget_items.reduce((total: number, item: any) => {
        return total + (item.total_price || (item.quantity * item.unit_price));
      }, 0);
    }
    return proposal?.value || 0;
  };

  // Usar a logo da empresa do usuário se disponível
  const logoUrl = proposal?.user_companies?.logo_url || proposal?.companies?.logo_url || companyLogo;

  return (
    <div className={`bg-white p-8 ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div className="flex-1">
          {logoUrl && (
            <img
              src={logoUrl}
              alt="Logo da empresa"
              className="h-16 w-auto mb-4"
            />
          )}
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">PROPOSTA COMERCIAL</h1>
            {proposal?.proposal_number && (
              <p className="text-lg text-gray-600 font-medium">Nº {proposal.proposal_number}</p>
            )}
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">Data: {formatDate(proposal?.created_at || new Date().toISOString())}</p>
          {proposal?.validity_date && (
            <p className="text-sm text-gray-600">Validade: {formatDate(proposal.validity_date)}</p>
          )}
        </div>
      </div>

      {/* Company Info */}
      {(proposal?.user_companies || proposal?.companies || proposal?.user_profile) && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Dados da Empresa</h2>
          <div className="bg-gray-50 p-4 rounded-lg">
            {(proposal?.user_companies || proposal?.companies) && (
              <div>
                <p className="font-semibold">{(proposal?.user_companies || proposal?.companies)?.name}</p>
                {(proposal?.user_companies || proposal?.companies)?.email && <p>Email: {(proposal?.user_companies || proposal?.companies)?.email}</p>}
                {(proposal?.user_companies || proposal?.companies)?.phone && <p>Telefone: {(proposal?.user_companies || proposal?.companies)?.phone}</p>}
                {(proposal?.user_companies || proposal?.companies)?.address && (
                  <p>Endereço: {(proposal?.user_companies || proposal?.companies)?.address}{(proposal?.user_companies || proposal?.companies)?.city && `, ${(proposal?.user_companies || proposal?.companies)?.city}`}{(proposal?.user_companies || proposal?.companies)?.state && ` - ${(proposal?.user_companies || proposal?.companies)?.state}`}</p>
                )}
                {(proposal?.user_companies || proposal?.companies)?.cnpj && <p>CNPJ: {(proposal?.user_companies || proposal?.companies)?.cnpj}</p>}
              </div>
            )}
            {proposal?.user_profile && !(proposal?.user_companies || proposal?.companies) && (
              <div>
                <p className="font-semibold">{proposal.user_profile.name}</p>
                {proposal.user_profile.phone && <p>Telefone: {proposal.user_profile.phone}</p>}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Client Info */}
      {proposal?.clients && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Cliente</h2>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="font-semibold">{proposal.clients.name}</p>
            {proposal.clients.email && <p>Email: {proposal.clients.email}</p>}
            {proposal.clients.phone && <p>Telefone: {proposal.clients.phone}</p>}
          </div>
        </div>
      )}

      {/* Proposal Title */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">{proposal?.title}</h2>
      </div>

      {/* Service Description */}
      {proposal?.service_description && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Resumo do Serviço</h3>
          <p className="text-gray-700 leading-relaxed">{proposal.service_description}</p>
        </div>
      )}

      {/* Detailed Description */}
      {proposal?.detailed_description && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Descrição Detalhada</h3>
          <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
            {proposal.detailed_description}
          </div>
        </div>
      )}

      {/* Budget Items */}
      {proposal?.proposal_budget_items && proposal.proposal_budget_items.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Itens do Orçamento</h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 p-3 text-left">Tipo</th>
                  <th className="border border-gray-300 p-3 text-left">Descrição</th>
                  <th className="border border-gray-300 p-3 text-center">Qtd</th>
                  <th className="border border-gray-300 p-3 text-right">Valor Unit.</th>
                  <th className="border border-gray-300 p-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {proposal.proposal_budget_items.map((item: any, index: number) => (
                  <tr key={index}>
                    <td className="border border-gray-300 p-3">{formatItemType(item.type)}</td>
                    <td className="border border-gray-300 p-3">{item.description}</td>
                    <td className="border border-gray-300 p-3 text-center">{item.quantity}</td>
                    <td className="border border-gray-300 p-3 text-right">{formatCurrency(item.unit_price)}</td>
                    <td className="border border-gray-300 p-3 text-right">{formatCurrency(item.total_price || (item.quantity * item.unit_price))}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gray-100 font-semibold">
                  <td colSpan={4} className="border border-gray-300 p-3 text-right">Total Geral:</td>
                  <td className="border border-gray-300 p-3 text-right">{formatCurrency(calculateTotal())}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* Value (if no budget items) */}
      {(!proposal?.proposal_budget_items || proposal.proposal_budget_items.length === 0) && proposal?.value && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Valor</h3>
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-2xl font-bold text-blue-900">{formatCurrency(proposal.value)}</p>
          </div>
        </div>
      )}

      {/* Delivery Time */}
      {proposal?.delivery_time && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Prazo de Entrega</h3>
          <p className="text-gray-700">{proposal.delivery_time}</p>
        </div>
      )}

      {/* Delivery Time */}
      {proposal?.payment_terms && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Forma de Pagamento</h3>
          <p className="text-gray-700">{proposal.payment_terms}</p>
        </div>
      )}

      {/* Payment Terms */}
      {proposal?.observations && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Observações</h3>
          <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
            {proposal.observations}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-12 pt-8 border-t border-gray-200">
        <p className="text-center text-gray-600">
          Esta proposta é válida por {proposal?.validity_date ? `até ${formatDate(proposal.validity_date)}` : '30 dias'}.
        </p>
      </div>
    </div>
  );
};

export default StandardProposalTemplate;
