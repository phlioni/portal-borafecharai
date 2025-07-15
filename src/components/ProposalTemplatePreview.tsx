
import React from 'react';

interface ProposalTemplatePreviewProps {
  data: {
    title: string;
    client: string;
    value?: number;
    deliveryTime?: string;
    description?: string;
    template: string;
    responsible?: string;
    email?: string;
    phone?: string;
    paymentMethod?: string;
  };
  className?: string;
}

const ProposalTemplatePreview = ({ data, className = "" }: ProposalTemplatePreviewProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Função para renderizar conteúdo HTML de forma segura
  const renderHTMLContent = (htmlContent: string) => {
    // Se o conteúdo já é HTML (contém tags), renderize como HTML
    if (htmlContent && htmlContent.includes('<')) {
      return <div dangerouslySetInnerHTML={{ __html: htmlContent }} />;
    }
    // Caso contrário, renderize como texto simples com quebras de linha
    return (
      <div className="whitespace-pre-wrap">
        {htmlContent}
      </div>
    );
  };

  // Template Moderno
  if (data.template === 'moderno') {
    return (
      <div className={`bg-white p-8 ${className}`} style={{ fontFamily: 'Inter, sans-serif' }}>
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="border-b-2 border-blue-600 pb-6 mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {data.title}
            </h1>
            <p className="text-blue-600 font-medium">Proposta Comercial</p>
          </div>

          {/* Cliente Info */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Destinatário</h2>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p><span className="font-medium">Cliente:</span> {data.client}</p>
              {data.responsible && (
                <p><span className="font-medium">Responsável:</span> {data.responsible}</p>
              )}
              {(data.email || data.phone) && (
                <p><span className="font-medium">Contato:</span> {data.email} {data.phone && `/ ${data.phone}`}</p>
              )}
            </div>
          </div>

          {/* Descrição */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Proposta</h2>
            {renderHTMLContent(data.description || 'Descrição do serviço')}
          </div>

          {/* Valores e Condições */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {data.value && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">Investimento</h3>
                <p className="text-2xl font-bold text-blue-600">{formatCurrency(data.value)}</p>
                {data.paymentMethod && (
                  <p className="text-sm text-blue-700 mt-1">{data.paymentMethod}</p>
                )}
              </div>
            )}
            
            {data.deliveryTime && (
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-green-900 mb-2">Prazo de Entrega</h3>
                <p className="text-lg font-medium text-green-600">{data.deliveryTime}</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t pt-6 text-center text-gray-600">
            <p>Proposta válida por 30 dias</p>
          </div>
        </div>
      </div>
    );
  }

  // Template Executivo
  if (data.template === 'executivo') {
    return (
      <div className={`bg-white p-8 ${className}`} style={{ fontFamily: 'serif' }}>
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8 pb-6 border-b border-gray-300">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              PROPOSTA COMERCIAL
            </h1>
            <h2 className="text-xl text-gray-700">{data.title}</h2>
          </div>

          {/* Cliente */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 uppercase tracking-wide">
              Destinatário
            </h3>
            <div className="border-l-4 border-gray-800 pl-4">
              <p className="font-medium">{data.client}</p>
              {data.responsible && <p>Att: {data.responsible}</p>}
              {(data.email || data.phone) && (
                <p className="text-gray-600">{data.email} {data.phone && `| ${data.phone}`}</p>
              )}
            </div>
          </div>

          {/* Conteúdo */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 uppercase tracking-wide">
              Escopo dos Serviços
            </h3>
            <div className="text-justify leading-relaxed">
              {renderHTMLContent(data.description || 'Descrição detalhada do serviço')}
            </div>
          </div>

          {/* Condições */}
          <div className="bg-gray-50 p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 uppercase tracking-wide">
              Condições Comerciais
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              {data.value && (
                <div>
                  <p className="font-medium text-gray-700">Valor Total:</p>
                  <p className="text-xl font-bold text-gray-900">{formatCurrency(data.value)}</p>
                  {data.paymentMethod && (
                    <p className="text-sm text-gray-600">{data.paymentMethod}</p>
                  )}
                </div>
              )}
              {data.deliveryTime && (
                <div>
                  <p className="font-medium text-gray-700">Prazo de Execução:</p>
                  <p className="text-lg text-gray-900">{data.deliveryTime}</p>
                </div>
              )}
            </div>
          </div>

          {/* Assinatura */}
          <div className="text-center pt-8 border-t border-gray-300">
            <p className="text-gray-600">Atenciosamente,</p>
            <div className="mt-8 border-b border-gray-400 w-48 mx-auto"></div>
            <p className="mt-2 text-gray-700">Equipe Comercial</p>
          </div>
        </div>
      </div>
    );
  }

  // Template Criativo
  if (data.template === 'criativo') {
    return (
      <div className={`bg-gradient-to-br from-purple-50 to-pink-50 p-8 ${className}`}>
        <div className="max-w-4xl mx-auto">
          {/* Header Criativo */}
          <div className="text-center mb-8">
            <div className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-full mb-4">
              <h1 className="text-2xl font-bold">{data.title}</h1>
            </div>
            <p className="text-purple-600 font-medium">Uma proposta especial para você!</p>
          </div>

          {/* Card do Cliente */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border-l-4 border-purple-500">
            <h2 className="text-lg font-bold text-purple-700 mb-3">👋 Olá, {data.client}!</h2>
            {data.responsible && (
              <p className="text-gray-700">Responsável: {data.responsible}</p>
            )}
            {(data.email || data.phone) && (
              <p className="text-gray-600">{data.email} {data.phone && `• ${data.phone}`}</p>
            )}
          </div>

          {/* Conteúdo Principal */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-xl font-bold text-purple-700 mb-4 flex items-center">
              ✨ Nossa Proposta
            </h2>
            <div className="text-gray-700 leading-relaxed">
              {renderHTMLContent(data.description || 'Descrição criativa do serviço')}
            </div>
          </div>

          {/* Cards de Valor e Prazo */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {data.value && (
              <div className="bg-gradient-to-r from-green-400 to-green-600 rounded-xl p-6 text-white">
                <h3 className="text-lg font-bold mb-2">💰 Investimento</h3>
                <p className="text-3xl font-bold">{formatCurrency(data.value)}</p>
                {data.paymentMethod && (
                  <p className="text-green-100 text-sm mt-2">{data.paymentMethod}</p>
                )}
              </div>
            )}
            
            {data.deliveryTime && (
              <div className="bg-gradient-to-r from-blue-400 to-blue-600 rounded-xl p-6 text-white">
                <h3 className="text-lg font-bold mb-2">⏰ Prazo</h3>
                <p className="text-2xl font-bold">{data.deliveryTime}</p>
              </div>
            )}
          </div>

          {/* Footer Criativo */}
          <div className="text-center bg-white rounded-xl shadow-lg p-6">
            <p className="text-purple-600 font-medium">🎯 Pronto para começarmos essa jornada juntos?</p>
            <p className="text-gray-600 text-sm mt-2">Esta proposta é válida por 30 dias</p>
          </div>
        </div>
      </div>
    );
  }

  // Fallback para template padrão
  return (
    <div className={`bg-white p-8 ${className}`}>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">{data.title}</h1>
        <p className="mb-4"><strong>Cliente:</strong> {data.client}</p>
        {data.value && <p className="mb-4"><strong>Valor:</strong> {formatCurrency(data.value)}</p>}
        {data.deliveryTime && <p className="mb-4"><strong>Prazo:</strong> {data.deliveryTime}</p>}
        <div className="mt-6">
          {renderHTMLContent(data.description || 'Descrição do serviço')}
        </div>
      </div>
    </div>
  );
};

export default ProposalTemplatePreview;
