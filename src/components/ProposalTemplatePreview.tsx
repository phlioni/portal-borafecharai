
import React from 'react';

interface ProposalTemplatePreviewProps {
  data: {
    title: string;
    client: string;
    value?: number;
    deliveryTime?: string;
    description?: string;
    detailedDescription?: string;
    observations?: string;
    template: string;
    companyLogo?: string;
  };
  className?: string;
}

const ProposalTemplatePreview = ({ data, className = "" }: ProposalTemplatePreviewProps) => {
  const formatCurrency = (value: number | string | undefined) => {
    if (!value) return 'R$ 0,00';
    
    // Converter para número se for string
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    
    // Verificar se é um número válido
    if (isNaN(numValue)) return 'R$ 0,00';
    
    console.log('Formatando valor:', { original: value, converted: numValue });
    
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(numValue);
  };

  // Função para renderizar conteúdo HTML de forma segura
  const renderHTMLContent = (htmlContent: string) => {
    if (htmlContent && htmlContent.includes('<')) {
      return <div dangerouslySetInnerHTML={{ __html: htmlContent }} />;
    }
    return (
      <div className="whitespace-pre-wrap">
        {htmlContent}
      </div>
    );
  };

  // Template Moderno
  if (data.template === 'moderno') {
    return (
      <div className={`bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 sm:p-8 ${className}`} style={{ fontFamily: 'Inter, sans-serif' }}>
        <div className="max-w-4xl mx-auto">
          {/* Header Moderno */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6 border border-gray-100">
            <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="text-left sm:text-right flex-1">
                  <h1 className="text-xl sm:text-3xl font-bold mb-2 leading-tight">{data.title}</h1>
                  <div className="flex flex-col sm:items-end gap-2">
                    <p className="text-blue-100 text-sm font-medium">Proposta Comercial</p>
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1">
                      <p className="text-white text-sm font-medium">Para: {data.client}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-3 sm:p-4 bg-gradient-to-r from-gray-50 to-blue-50">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div className="text-xs text-gray-600">
                  <span className="font-medium">Data:</span> {new Date().toLocaleDateString('pt-BR')}
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-xs text-gray-600 font-medium">Proposta Ativa</span>
                </div>
              </div>
            </div>
          </div>

          {/* Conteúdo */}
          <div className="space-y-4 sm:space-y-6">
            {/* Descrição */}
            {data.description && (
              <section className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full flex-shrink-0 mt-1"></div>
                  <div className="flex-1">
                    <h2 className="text-lg font-bold text-blue-900 mb-3">✨ O que vamos criar juntos</h2>
                    <div className="text-gray-700 leading-relaxed">
                      {renderHTMLContent(data.description)}
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Valores */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {data.value && (
                <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-xl p-4 shadow-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 bg-white/30 rounded-full"></div>
                    <h3 className="font-semibold text-sm opacity-90">💰 Investimento</h3>
                  </div>
                  <p className="text-2xl font-bold">
                    {formatCurrency(data.value)}
                  </p>
                  <p className="text-emerald-100 text-xs mt-1">Proposta válida por 30 dias</p>
                </div>
              )}
              
              {data.deliveryTime && (
                <div className="bg-gradient-to-br from-violet-500 to-purple-600 text-white rounded-xl p-4 shadow-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 bg-white/30 rounded-full"></div>
                    <h3 className="font-semibold text-sm opacity-90">⏰ Prazo</h3>
                  </div>
                  <p className="text-xl font-bold">{data.deliveryTime}</p>
                  <p className="text-violet-100 text-xs mt-1">A partir da aprovação</p>
                </div>
              )}
            </div>

            {/* Descrição Detalhada */}
            {data.detailedDescription && (
              <section className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-8 bg-gradient-to-b from-gray-400 to-gray-500 rounded-full flex-shrink-0 mt-1"></div>
                  <div className="flex-1">
                    <h2 className="text-lg font-bold text-gray-900 mb-3">📋 Escopo dos Serviços</h2>
                    <div className="text-gray-700 leading-relaxed">
                      {renderHTMLContent(data.detailedDescription)}
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Observações */}
            {data.observations && (
              <section className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-200">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-8 bg-gradient-to-b from-amber-400 to-orange-500 rounded-full flex-shrink-0 mt-1"></div>
                  <div className="flex-1">
                    <h2 className="text-lg font-bold text-amber-900 mb-3">📝 Informações Importantes</h2>
                    <div className="text-gray-700 leading-relaxed">
                      {renderHTMLContent(data.observations)}
                    </div>
                  </div>
                </div>
              </section>
            )}
          </div>

          {/* Footer */}
          <div className="mt-6 text-center relative">
            <div className="relative bg-white/95 backdrop-blur-xl rounded-2xl p-4 shadow-xl border border-purple-100/50">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🎯</span>
                  <p className="text-purple-600 font-bold text-sm">Pronto para começarmos essa jornada?</p>
                </div>
                <div className="flex items-center gap-2 text-gray-600 text-xs">
                  <span>✨</span>
                  <span>Proposta válida por 30 dias</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Template Executivo
  if (data.template === 'executivo') {
    return (
      <div className={`bg-white p-4 sm:p-8 ${className}`} style={{ fontFamily: 'serif' }}>
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="border-b-4 border-gray-900 pb-6 mb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="text-left sm:text-right flex-1">
                <h1 className="text-2xl sm:text-3xl font-black text-gray-900 mb-2 uppercase tracking-tight">
                  {data.title}
                </h1>
                <p className="text-gray-600 text-sm font-bold uppercase tracking-widest">Proposta Comercial</p>
                <div className="mt-4 pt-4 border-t border-gray-300">
                  <p className="text-gray-700 text-sm"><span className="font-black">Cliente:</span> {data.client}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Conteúdo */}
          <div className="space-y-8">
            {data.description && (
              <section>
                <div className="border-b-2 border-gray-900 pb-3 mb-6">
                  <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest">Escopo dos Serviços</h2>
                </div>
                <div className="bg-gray-50 border-l-4 border-gray-900 p-4">
                  {renderHTMLContent(data.description)}
                </div>
              </section>
            )}

            {/* Condições */}
            <section className="bg-gray-900 text-white p-6 -mx-4 sm:-mx-8">
              <div className="max-w-4xl mx-auto">
                <div className="text-center mb-6">
                  <h2 className="text-sm font-black uppercase tracking-widest text-gray-300 mb-4">Condições Comerciais</h2>
                  <div className="w-20 h-0.5 bg-white mx-auto"></div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
                  {data.value && (
                    <div className="text-center lg:text-left">
                      <p className="text-gray-300 text-sm font-semibold uppercase tracking-wide mb-3">Investimento Total</p>
                      <p className="text-3xl font-black mb-2">
                        {formatCurrency(data.value)}
                      </p>
                    </div>
                  )}
                  
                  {data.deliveryTime && (
                    <div className="text-center lg:text-right">
                      <p className="text-gray-300 text-sm font-semibold uppercase tracking-wide mb-3">Prazo de Execução</p>
                      <p className="text-2xl font-bold text-white">{data.deliveryTime}</p>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {data.detailedDescription && (
              <section>
                <div className="border-b-2 border-gray-900 pb-3 mb-6">
                  <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest">Especificações Detalhadas</h2>
                </div>
                <div className="bg-gray-50 border-l-4 border-gray-900 p-4">
                  {renderHTMLContent(data.detailedDescription)}
                </div>
              </section>
            )}

            {data.observations && (
              <section>
                <div className="border-b-2 border-gray-900 pb-3 mb-6">
                  <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest">Termos e Condições</h2>
                </div>
                <div className="bg-gray-50 border-l-4 border-gray-900 p-4">
                  {renderHTMLContent(data.observations)}
                </div>
              </section>
            )}
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-300 text-center">
            <p className="text-gray-600 text-xs font-bold uppercase tracking-widest">
              Proposta válida por 30 dias
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Template Criativo
  if (data.template === 'criativo') {
    return (
      <div className={`bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-4 sm:p-8 relative overflow-hidden ${className}`}>
        {/* Background decorativo */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-purple-300 to-pink-300 opacity-20 rounded-full blur-2xl"></div>
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-gradient-to-br from-blue-300 to-indigo-300 opacity-20 rounded-full blur-2xl"></div>
        </div>
        
        <div className="relative max-w-4xl mx-auto">
          {/* Header Criativo */}
          <div className="text-center mb-8 relative">
            <div className="relative bg-white/95 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-purple-100/50">
              <h1 className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent mb-4 leading-tight">
                {data.title}
              </h1>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse"></div>
                  <p className="text-gray-600 text-sm font-semibold">Uma proposta especial para</p>
                </div>
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full">
                  <p className="font-bold text-sm">{data.client}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Conteúdo */}
          <div className="space-y-6">
            {data.description && (
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 opacity-10 rounded-3xl blur-xl"></div>
                <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-purple-100/50">
                  <div className="flex items-start gap-4">
                    <div className="w-1 h-16 bg-gradient-to-b from-purple-500 via-pink-500 to-purple-600 rounded-full flex-shrink-0"></div>
                    <div className="flex-1">
                      <h2 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
                        ✨ O que vamos criar juntos
                      </h2>
                      <div className="text-gray-700 leading-relaxed">
                        {renderHTMLContent(data.description)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {data.value && (
                <div className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-green-500 opacity-20 rounded-2xl blur-lg"></div>
                  <div className="relative bg-gradient-to-br from-emerald-500 via-green-500 to-teal-600 rounded-2xl p-6 text-white shadow-2xl">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-3 h-3 bg-white/40 rounded-full animate-pulse"></div>
                      <h3 className="font-bold text-lg text-white/90">💰 Investimento</h3>
                    </div>
                    <p className="text-3xl font-black mb-2">
                      {formatCurrency(data.value)}
                    </p>
                    <div className="absolute top-4 right-4 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                      <span className="text-lg">💎</span>
                    </div>
                  </div>
                </div>
              )}
              
              {data.deliveryTime && (
                <div className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-violet-400 to-purple-500 opacity-20 rounded-2xl blur-lg"></div>
                  <div className="relative bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-600 rounded-2xl p-6 text-white shadow-2xl">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-3 h-3 bg-white/40 rounded-full animate-pulse"></div>
                      <h3 className="font-bold text-lg text-white/90">⏰ Prazo</h3>
                    </div>
                    <p className="text-2xl font-black mb-2">{data.deliveryTime}</p>
                    <div className="absolute top-4 right-4 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                      <span className="text-lg">⚡</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {data.detailedDescription && (
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 opacity-10 rounded-3xl blur-xl"></div>
                <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-blue-100/50">
                  <div className="flex items-start gap-4">
                    <div className="w-1 h-16 bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500 rounded-full flex-shrink-0"></div>
                    <div className="flex-1">
                      <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
                        🎯 Detalhes do Projeto
                      </h2>
                      <div className="text-gray-700 leading-relaxed">
                        {renderHTMLContent(data.detailedDescription)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {data.observations && (
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-400 opacity-10 rounded-3xl blur-xl"></div>
                <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-amber-100/50">
                  <div className="flex items-start gap-4">
                    <div className="w-1 h-16 bg-gradient-to-b from-amber-400 via-orange-500 to-red-500 rounded-full flex-shrink-0"></div>
                    <div className="flex-1">
                      <h2 className="text-xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mb-4">
                        📋 Informações Importantes
                      </h2>
                      <div className="text-gray-700 leading-relaxed">
                        {renderHTMLContent(data.observations)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-8 text-center relative">
            <div className="relative bg-white/95 backdrop-blur-xl rounded-2xl p-4 shadow-xl border border-purple-100/50">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🎯</span>
                  <p className="text-purple-600 font-bold text-sm">Pronto para começarmos essa jornada?</p>
                </div>
                <div className="flex items-center gap-2 text-gray-600 text-xs">
                  <span>✨</span>
                  <span>Proposta válida por 30 dias</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Fallback para template padrão
  return (
    <div className={`bg-white p-4 sm:p-8 ${className}`}>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">{data.title}</h1>
        <p className="mb-4"><strong>Cliente:</strong> {data.client}</p>
        {data.value && <p className="mb-4"><strong>Valor:</strong> {formatCurrency(data.value)}</p>}
        {data.deliveryTime && <p className="mb-4"><strong>Prazo:</strong> {data.deliveryTime}</p>}
        <div className="mt-6">
          {data.description && renderHTMLContent(data.description)}
          {data.detailedDescription && renderHTMLContent(data.detailedDescription)}
          {data.observations && renderHTMLContent(data.observations)}
        </div>
      </div>
    </div>
  );
};

export default ProposalTemplatePreview;
