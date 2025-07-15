import React from 'react';
import { useBudgetItems } from '@/hooks/useBudgetItems';

interface ProposalData {
  title: string;
  client: string;
  value?: number;
  deliveryTime?: string;
  description?: string;
  detailedDescription?: string;
  observations?: string;
  template: string;
  companyLogo?: string;
  proposalId?: string;
}

interface ProposalTemplatePreviewProps {
  data: ProposalData;
  className?: string;
}

const ProposalTemplatePreview = ({ data, className = "" }: ProposalTemplatePreviewProps) => {
  const { data: budgetItems = [] } = useBudgetItems(data.proposalId || '');

  const formatCurrency = (value?: number) => {
    if (!value) return 'A consultar';
    return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  };

  const calculateBudgetTotal = () => {
    return budgetItems.reduce((total, item) => total + (item.total_price || 0), 0);
  };

  const BudgetSection = () => {
    if (budgetItems.length === 0) return null;

    return (
      <div className="mb-8">
        <h3 className="text-xl font-bold text-gray-800 mb-4 border-b-2 border-blue-600 pb-2">
          Orçamento Detalhado
        </h3>
        
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300 mb-4">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold">Tipo</th>
                <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold">Descrição</th>
                <th className="border border-gray-300 px-4 py-2 text-center text-sm font-semibold">Qtd</th>
                <th className="border border-gray-300 px-4 py-2 text-right text-sm font-semibold">Valor Unit.</th>
                <th className="border border-gray-300 px-4 py-2 text-right text-sm font-semibold">Total</th>
              </tr>
            </thead>
            <tbody>
              {budgetItems.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2 text-sm">
                    {item.type === 'material' ? 'Material' : 'Mão de Obra'}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-sm">{item.description}</td>
                  <td className="border border-gray-300 px-4 py-2 text-center text-sm">{item.quantity}</td>
                  <td className="border border-gray-300 px-4 py-2 text-right text-sm">
                    {formatCurrency(item.unit_price)}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-right text-sm font-semibold">
                    {formatCurrency(item.total_price)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-blue-50">
                <td colSpan={4} className="border border-gray-300 px-4 py-2 text-right text-sm font-bold">
                  Total Geral:
                </td>
                <td className="border border-gray-300 px-4 py-2 text-right text-lg font-bold text-blue-600">
                  {formatCurrency(calculateBudgetTotal())}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    );
  };

  if (data.template === 'executivo') {
    return (
      <div className={`bg-white p-8 max-w-4xl mx-auto font-sans text-gray-800 ${className}`}>
        {/* Header */}
        <div className="border-b-4 border-gray-800 pb-6 mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">PROPOSTA COMERCIAL</h1>
              <p className="text-lg text-gray-600">Proposta Executiva</p>
            </div>
            {data.companyLogo && (
              <img src={data.companyLogo} alt="Logo" className="h-16 w-auto object-contain" />
            )}
          </div>
        </div>

        {/* Client Info */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-3 border-b border-gray-300 pb-1">
            CLIENTE
          </h2>
          <p className="text-lg font-medium">{data.client}</p>
        </div>

        {/* Proposal Title */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-3 border-b border-gray-300 pb-1">
            PROJETO
          </h2>
          <h3 className="text-2xl font-semibold text-gray-800">{data.title}</h3>
        </div>

        {/* Service Description */}
        {data.description && (
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-800 mb-3 border-b border-gray-300 pb-1">
              RESUMO EXECUTIVO
            </h3>
            <p className="text-gray-700 leading-relaxed">{data.description}</p>
          </div>
        )}

        {/* Detailed Description */}
        {data.detailedDescription && (
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-800 mb-3 border-b border-gray-300 pb-1">
              ESCOPO DETALHADO
            </h3>
            <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">{data.detailedDescription}</div>
          </div>
        )}

        {/* Budget Section */}
        <BudgetSection />

        {/* Investment */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-3 border-b border-gray-300 pb-1">
            INVESTIMENTO
          </h3>
          <div className="bg-gray-50 p-6 rounded-lg">
            <p className="text-3xl font-bold text-gray-800">{formatCurrency(data.value)}</p>
            {data.deliveryTime && (
              <p className="text-gray-600 mt-2">
                <strong>Prazo de Entrega:</strong> {data.deliveryTime}
              </p>
            )}
          </div>
        </div>

        {/* Observations */}
        {data.observations && (
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-800 mb-3 border-b border-gray-300 pb-1">
              OBSERVAÇÕES
            </h3>
            <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">{data.observations}</div>
          </div>
        )}

        {/* Footer */}
        <div className="border-t-2 border-gray-800 pt-6 mt-12">
          <p className="text-center text-gray-600">
            Esta proposta é válida por 30 dias a partir da data de emissão.
          </p>
        </div>
      </div>
    );
  }

  if (data.template === 'criativo') {
    return (
      <div className={`bg-gradient-to-br from-purple-50 to-blue-50 p-8 max-w-4xl mx-auto font-sans ${className}`}>
        {/* Header */}
        <div className="text-center mb-8">
          {data.companyLogo && (
            <img src={data.companyLogo} alt="Logo" className="h-16 w-auto object-contain mx-auto mb-4" />
          )}
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
            {data.title}
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-purple-600 to-blue-600 mx-auto rounded-full"></div>
        </div>

        {/* Client Info */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-3 flex items-center">
            <span className="w-3 h-3 bg-purple-600 rounded-full mr-2"></span>
            Cliente
          </h2>
          <p className="text-lg text-gray-700">{data.client}</p>
        </div>

        {/* Service Description */}
        {data.description && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <span className="w-3 h-3 bg-blue-600 rounded-full mr-2"></span>
              Visão Geral
            </h3>
            <p className="text-gray-700 leading-relaxed">{data.description}</p>
          </div>
        )}

        {/* Detailed Description */}
        {data.detailedDescription && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <span className="w-3 h-3 bg-green-600 rounded-full mr-2"></span>
              Detalhamento do Projeto
            </h3>
            <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">{data.detailedDescription}</div>
          </div>
        )}

        {/* Budget Section */}
        {budgetItems.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <span className="w-3 h-3 bg-orange-600 rounded-full mr-2"></span>
              Orçamento Detalhado
            </h3>
            <BudgetSection />
          </div>
        )}

        {/* Investment */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg shadow-lg p-6 mb-6 text-white">
          <h3 className="text-xl font-bold mb-4">Investimento</h3>
          <div className="text-center">
            <p className="text-4xl font-bold mb-2">{formatCurrency(data.value)}</p>
            {data.deliveryTime && (
              <p className="text-purple-100">
                <strong>Prazo:</strong> {data.deliveryTime}
              </p>
            )}
          </div>
        </div>

        {/* Observations */}
        {data.observations && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <span className="w-3 h-3 bg-red-600 rounded-full mr-2"></span>
              Observações Importantes
            </h3>
            <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">{data.observations}</div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-gray-600 mt-8">
          <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent mb-4"></div>
          <p>Proposta válida por 30 dias • Desenvolvido com excelência</p>
        </div>
      </div>
    );
  }

  // Default: Moderno template
  return (
    <div className={`bg-white p-8 max-w-4xl mx-auto font-sans ${className}`}>
      {/* Header */}
      <div className="border-l-4 border-blue-600 pl-6 mb-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{data.title}</h1>
            <p className="text-lg text-gray-600">Proposta Comercial</p>
          </div>
          {data.companyLogo && (
            <img src={data.companyLogo} alt="Logo" className="h-16 w-auto object-contain" />
          )}
        </div>
      </div>

      {/* Client */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-3 border-b-2 border-blue-600 pb-2">
          Cliente
        </h2>
        <p className="text-lg text-gray-700">{data.client}</p>
      </div>

      {/* Service Description */}
      {data.description && (
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4 border-b-2 border-blue-600 pb-2">
            Descrição do Serviço
          </h3>
          <p className="text-gray-700 leading-relaxed">{data.description}</p>
        </div>
      )}

      {/* Detailed Description */}
      {data.detailedDescription && (
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4 border-b-2 border-blue-600 pb-2">
            Detalhamento
          </h3>
          <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">{data.detailedDescription}</div>
        </div>
      )}

      {/* Budget Section */}
      <BudgetSection />

      {/* Value and Delivery */}
      <div className="bg-blue-50 rounded-lg p-6 mb-8">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Valores e Prazos</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600 mb-1">Valor Total</p>
            <p className="text-2xl font-bold text-blue-600">{formatCurrency(data.value)}</p>
          </div>
          {data.deliveryTime && (
            <div>
              <p className="text-sm text-gray-600 mb-1">Prazo de Entrega</p>
              <p className="text-lg font-semibold text-gray-800">{data.deliveryTime}</p>
            </div>
          )}
        </div>
      </div>

      {/* Observations */}
      {data.observations && (
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4 border-b-2 border-blue-600 pb-2">
            Observações
          </h3>
          <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">{data.observations}</div>
        </div>
      )}

      {/* Footer */}
      <div className="border-t border-gray-200 pt-6 mt-8">
        <p className="text-center text-gray-500 text-sm">
          Proposta válida por 30 dias a partir da data de emissão
        </p>
      </div>
    </div>
  );
};

export default ProposalTemplatePreview;
