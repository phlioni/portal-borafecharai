
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
    if (!value && value !== 0) return 'A consultar';
    return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  };

  const calculateBudgetTotal = () => {
    return budgetItems.reduce((total, item) => total + (item.total_price || 0), 0);
  };

  const getCurrentDate = () => {
    return new Date().toLocaleDateString('pt-BR');
  };

  const getOrderNumber = () => {
    return data.proposalId?.slice(-6)?.toUpperCase() || '000001';
  };

  // Separar itens por tipo
  const services = budgetItems.filter(item => item.type === 'labor');
  const materials = budgetItems.filter(item => item.type === 'material');
  
  const servicesTotal = services.reduce((total, item) => total + (item.total_price || 0), 0);
  const materialsTotal = materials.reduce((total, item) => total + (item.total_price || 0), 0);
  const grandTotal = data.value || calculateBudgetTotal();

  const BudgetTable = ({ items, title }: { items: any[], title: string }) => {
    if (items.length === 0) return null;

    return (
      <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-800 mb-3">{title}</h3>
        <table className="w-full border-collapse border border-gray-300 text-sm">
          <thead>
            <tr className="bg-gray-50">
              <th className="border border-gray-300 px-3 py-2 text-left font-semibold">Descrição</th>
              <th className="border border-gray-300 px-3 py-2 text-center font-semibold">Unidade</th>
              <th className="border border-gray-300 px-3 py-2 text-center font-semibold">Preço unitário</th>
              <th className="border border-gray-300 px-3 py-2 text-center font-semibold">Qtd.</th>
              <th className="border border-gray-300 px-3 py-2 text-right font-semibold">Preço</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={index}>
                <td className="border border-gray-300 px-3 py-2">{item.description}</td>
                <td className="border border-gray-300 px-3 py-2 text-center">unidade</td>
                <td className="border border-gray-300 px-3 py-2 text-center">{formatCurrency(item.unit_price)}</td>
                <td className="border border-gray-300 px-3 py-2 text-center">{item.quantity}</td>
                <td className="border border-gray-300 px-3 py-2 text-right">{formatCurrency(item.total_price)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const ModernTemplate = () => (
    <div className={`bg-white p-8 max-w-4xl mx-auto font-sans text-gray-800 ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          {data.companyLogo && (
            <img src={data.companyLogo} alt="Logo" className="h-16 w-auto object-contain mb-4" />
          )}
          <h1 className="text-2xl font-bold text-gray-900">{data.title}</h1>
        </div>
        <div className="text-right text-sm">
          <p className="font-semibold">📞 (xx) xxxx-xxxx</p>
          <p>✉️ contato@empresa.com</p>
          <p>📅 {getCurrentDate()}</p>
        </div>
      </div>

      {/* Order Info */}
      <div className="mb-6">
        <h2 className="text-lg font-bold mb-2">Orçamento {getOrderNumber()}</h2>
        <p className="text-sm"><strong>Data:</strong> {getCurrentDate()}</p>
      </div>

      {/* Client Info */}
      <div className="mb-6">
        <h2 className="text-lg font-bold mb-2">Cliente</h2>
        <p><strong>Nome:</strong> {data.client}</p>
        <p><strong>Responsável:</strong> {data.client}</p>
        <p><strong>Contato:</strong> contato@cliente.com</p>
      </div>

      {/* Services */}
      <BudgetTable items={services} title="Serviços" />

      {/* Materials */}
      <BudgetTable items={materials} title="Materiais" />

      {/* Financial Summary */}
      {budgetItems.length > 0 && (
        <div className="mb-6">
          <table className="w-full text-sm border-collapse">
            <tbody>
              <tr>
                <td className="text-right py-1 pr-4 font-semibold">Serviços:</td>
                <td className="text-right py-1 font-semibold">{formatCurrency(servicesTotal)}</td>
              </tr>
              <tr>
                <td className="text-right py-1 pr-4 font-semibold">Materiais:</td>
                <td className="text-right py-1 font-semibold">{formatCurrency(materialsTotal)}</td>
              </tr>
              <tr className="border-t border-gray-300">
                <td className="text-right py-2 pr-4 text-lg font-bold">Total:</td>
                <td className="text-right py-2 text-lg font-bold">{formatCurrency(grandTotal)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Project Description */}
      {data.description && (
        <div className="mb-6">
          <h3 className="text-lg font-bold mb-2">Descrição do Projeto</h3>
          <p className="text-gray-700 leading-relaxed">{data.description}</p>
        </div>
      )}

      {/* Detailed Description */}
      {data.detailedDescription && (
        <div className="mb-6">
          <h3 className="text-lg font-bold mb-2">Detalhamento</h3>
          <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">{data.detailedDescription}</div>
        </div>
      )}

      {/* Payment Info */}
      <div className="mb-6">
        <h3 className="text-lg font-bold mb-2">Pagamento</h3>
        <p><strong>Forma de pagamento:</strong> Boleto, transferência bancária, dinheiro, cheque, cartão de crédito ou cartão de débito.</p>
        {data.deliveryTime && <p><strong>Prazo de entrega:</strong> {data.deliveryTime}</p>}
        <p><strong>Validade:</strong> 30 dias</p>
      </div>

      {/* Observations */}
      {data.observations && (
        <div className="mb-8">
          <h3 className="text-lg font-bold mb-2">Observações</h3>
          <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">{data.observations}</div>
        </div>
      )}

      {/* Footer */}
      <div className="text-center pt-6 mt-8 border-t border-gray-300">
        <p className="text-sm font-semibold">Cidade, {getCurrentDate()}</p>
        <div className="mt-8 pt-4 border-t border-gray-200">
          <p className="font-bold">EMPRESA</p>
          <p className="text-sm">Responsável</p>
        </div>
        <p className="text-xs mt-4">Página 1/1</p>
      </div>
    </div>
  );

  const ExecutiveTemplate = () => (
    <div className={`bg-white p-8 max-w-4xl mx-auto font-sans text-gray-800 ${className}`}>
      {/* Header Executivo */}
      <div className="border-b-4 border-gray-800 pb-6 mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">ORÇAMENTO EXECUTIVO</h1>
            <p className="text-lg text-gray-600">Nº {getOrderNumber()}</p>
          </div>
          {data.companyLogo && (
            <img src={data.companyLogo} alt="Logo" className="h-16 w-auto object-contain" />
          )}
        </div>
        <div className="text-right text-sm mt-4">
          <p>📅 {getCurrentDate()}</p>
        </div>
      </div>

      {/* Client Info Executivo */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-3 border-b border-gray-300 pb-1">CLIENTE</h2>
        <div className="bg-gray-50 p-4 rounded">
          <p className="text-lg font-medium">{data.client}</p>
        </div>
      </div>

      {/* Services Executivo */}
      <BudgetTable items={services} title="SERVIÇOS EXECUTIVOS" />

      {/* Materials Executivo */}
      <BudgetTable items={materials} title="MATERIAIS PREMIUM" />

      {/* Investment Executivo */}
      <div className="mb-8">
        <h3 className="text-xl font-bold text-gray-800 mb-3 border-b border-gray-300 pb-1">INVESTIMENTO</h3>
        <div className="bg-gray-50 p-6 rounded-lg">
          <div className="text-right">
            {budgetItems.length > 0 && (
              <>
                <p className="text-lg"><strong>Serviços:</strong> {formatCurrency(servicesTotal)}</p>
                <p className="text-lg"><strong>Materiais:</strong> {formatCurrency(materialsTotal)}</p>
                <hr className="my-2" />
              </>
            )}
            <p className="text-3xl font-bold text-gray-800">{formatCurrency(grandTotal)}</p>
            {data.deliveryTime && (
              <p className="text-gray-600 mt-2"><strong>Prazo:</strong> {data.deliveryTime}</p>
            )}
          </div>
        </div>
      </div>

      {/* Description Executivo */}
      {data.description && (
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-3 border-b border-gray-300 pb-1">RESUMO EXECUTIVO</h3>
          <p className="text-gray-700 leading-relaxed">{data.description}</p>
        </div>
      )}

      {/* Footer Executivo */}
      <div className="border-t-2 border-gray-800 pt-6 mt-12 text-center">
        <p className="text-gray-600">Proposta válida por 30 dias • Excelência em cada detalhe</p>
      </div>
    </div>
  );

  const CreativeTemplate = () => (
    <div className={`bg-gradient-to-br from-purple-50 to-blue-50 p-8 max-w-4xl mx-auto font-sans ${className}`}>
      {/* Header Criativo */}
      <div className="text-center mb-8">
        {data.companyLogo && (
          <img src={data.companyLogo} alt="Logo" className="h-16 w-auto object-contain mx-auto mb-4" />
        )}
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
          ORÇAMENTO {getOrderNumber()}
        </h1>
        <div className="w-24 h-1 bg-gradient-to-r from-purple-600 to-blue-600 mx-auto rounded-full mb-2"></div>
        <p className="text-gray-600">📅 {getCurrentDate()}</p>
      </div>

      {/* Client Info Criativo */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-3 flex items-center">
          <span className="w-3 h-3 bg-purple-600 rounded-full mr-2"></span>
          Cliente
        </h2>
        <p className="text-lg text-gray-700">{data.client}</p>
      </div>

      {/* Services Criativo */}
      {services.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <span className="w-3 h-3 bg-blue-600 rounded-full mr-2"></span>
            Serviços Criativos
          </h3>
          <BudgetTable items={services} title="" />
        </div>
      )}

      {/* Materials Criativo */}
      {materials.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <span className="w-3 h-3 bg-green-600 rounded-full mr-2"></span>
            Materiais Inovadores
          </h3>
          <BudgetTable items={materials} title="" />
        </div>
      )}

      {/* Investment Criativo */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg shadow-lg p-6 mb-6 text-white">
        <h3 className="text-xl font-bold mb-4">💎 Investimento Total</h3>
        <div className="text-center">
          {budgetItems.length > 0 && (
            <div className="mb-4 text-purple-100">
              <p><strong>Serviços:</strong> {formatCurrency(servicesTotal)}</p>
              <p><strong>Materiais:</strong> {formatCurrency(materialsTotal)}</p>
            </div>
          )}
          <p className="text-4xl font-bold mb-2">{formatCurrency(grandTotal)}</p>
          {data.deliveryTime && (
            <p className="text-purple-100"><strong>Prazo:</strong> {data.deliveryTime}</p>
          )}
        </div>
      </div>

      {/* Description Criativo */}
      {data.description && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <span className="w-3 h-3 bg-orange-600 rounded-full mr-2"></span>
            Visão Criativa
          </h3>
          <p className="text-gray-700 leading-relaxed">{data.description}</p>
        </div>
      )}

      {/* Footer Criativo */}
      <div className="text-center text-gray-600 mt-8">
        <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent mb-4"></div>
        <p>✨ Criatividade • Inovação • Resultados ✨</p>
      </div>
    </div>
  );

  // Renderizar template baseado na escolha
  if (data.template === 'executivo') {
    return <ExecutiveTemplate />;
  }

  if (data.template === 'criativo') {
    return <CreativeTemplate />;
  }

  // Default: Moderno
  return <ModernTemplate />;
};

export default ProposalTemplatePreview;
