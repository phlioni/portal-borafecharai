import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCustomTemplates } from '@/hooks/useCustomTemplates';
import { useUserPermissions } from '@/hooks/useUserPermissions';

interface Template {
  id: string;
  name: string;
  description: string;
  preview?: string;
  isPremium?: boolean;
}

interface ProposalTemplatesProps {
  selectedTemplate: string;
  onTemplateSelect: (templateId: string) => void;
}

// Função para formatar valor corretamente
const formatCurrency = (value: number | string) => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(numValue)) return 'R$ 0,00';
  
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(numValue);
};

// Template components for rendering proposals
export const ModernoTemplate: React.FC<{ proposal: any; companyLogo: string }> = ({ proposal, companyLogo }) => {
  const renderContent = () => {
    // Se tem detailed_description com HTML do modelo oficial, renderizar diretamente
    if (proposal.detailed_description && proposal.detailed_description.includes('<h1>Proposta Comercial para')) {
      return (
        <div 
          className="prose max-w-none prose-headings:text-blue-800 prose-h1:text-2xl sm:prose-h1:text-3xl prose-h1:font-bold prose-h1:mb-6 prose-h1:pb-4 prose-h1:border-b-2 prose-h1:border-blue-200 prose-h2:text-lg sm:prose-h2:text-xl prose-h2:font-semibold prose-h2:text-blue-700 prose-h2:mt-6 prose-h2:mb-4 prose-h2:flex prose-h2:items-center prose-h2:gap-2 prose-h2:before:content-['●'] prose-h2:before:text-blue-500 prose-p:text-gray-700 prose-p:leading-relaxed prose-strong:text-blue-800 prose-ul:space-y-2 prose-li:text-gray-700"
          dangerouslySetInnerHTML={{ __html: proposal.detailed_description }} 
        />
      );
    }

    // Fallback para estrutura antiga
    return (
      <div className="space-y-6 sm:space-y-8">
        {proposal.service_description && (
          <section className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 sm:p-6 border border-blue-100">
            <div className="flex items-start gap-3">
              <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full flex-shrink-0 mt-1"></div>
              <div className="flex-1">
                <h2 className="text-lg sm:text-xl font-bold text-blue-900 mb-3">Serviços Propostos</h2>
                <p className="text-gray-700 leading-relaxed text-sm sm:text-base">{proposal.service_description}</p>
              </div>
            </div>
          </section>
        )}
        
        {proposal.detailed_description && (
          <section className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="w-2 h-8 bg-gradient-to-b from-gray-400 to-gray-500 rounded-full flex-shrink-0 mt-1"></div>
              <div className="flex-1">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">Especificações Técnicas</h2>
                <div className="text-gray-700 whitespace-pre-wrap leading-relaxed text-sm sm:text-base">{proposal.detailed_description}</div>
              </div>
            </div>
          </section>
        )}
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {proposal.value && (
            <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-xl p-4 sm:p-6 shadow-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 bg-white/30 rounded-full"></div>
                <h3 className="font-semibold text-sm sm:text-base opacity-90">Investimento Total</h3>
              </div>
              <p className="text-2xl sm:text-3xl font-bold">
                {formatCurrency(proposal.value)}
              </p>
              <p className="text-emerald-100 text-xs sm:text-sm mt-1">Proposta válida por 30 dias</p>
            </div>
          )}
          
          {proposal.delivery_time && (
            <div className="bg-gradient-to-br from-violet-500 to-purple-600 text-white rounded-xl p-4 sm:p-6 shadow-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 bg-white/30 rounded-full"></div>
                <h3 className="font-semibold text-sm sm:text-base opacity-90">Prazo de Entrega</h3>
              </div>
              <p className="text-xl sm:text-2xl font-bold">{proposal.delivery_time}</p>
              <p className="text-violet-100 text-xs sm:text-sm mt-1">A partir da aprovação</p>
            </div>
          )}
        </div>
        
        {proposal.observations && (
          <section className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 sm:p-6 border border-amber-200">
            <div className="flex items-start gap-3">
              <div className="w-2 h-8 bg-gradient-to-b from-amber-400 to-orange-500 rounded-full flex-shrink-0 mt-1"></div>
              <div className="flex-1">
                <h2 className="text-lg sm:text-xl font-bold text-amber-900 mb-3">Termos e Condições</h2>
                <div className="text-gray-700 whitespace-pre-wrap leading-relaxed text-sm sm:text-base">{proposal.observations}</div>
              </div>
            </div>
          </section>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header Moderno */}
        <header className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6 sm:mb-8 border border-gray-100">
          <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              {companyLogo && (
                <div className="bg-white/95 backdrop-blur-sm rounded-xl p-3 sm:p-4 shadow-lg">
                  <img src={companyLogo} alt="Logo da Empresa" className="h-10 sm:h-12 max-w-[200px] object-contain" />
                </div>
              )}
              <div className="text-left sm:text-right flex-1">
                <h1 className="text-2xl sm:text-4xl font-bold mb-2 sm:mb-3 leading-tight">{proposal.title}</h1>
                <div className="flex flex-col sm:items-end gap-2">
                  <p className="text-blue-100 text-sm sm:text-lg font-medium">Proposta Comercial</p>
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1">
                    <p className="text-white text-sm font-medium">Para: {proposal.companies?.name}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-4 sm:p-6 bg-gradient-to-r from-gray-50 to-blue-50">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="text-xs sm:text-sm text-gray-600">
                <span className="font-medium">Data:</span> {new Date().toLocaleDateString('pt-BR')}
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-xs sm:text-sm text-gray-600 font-medium">Proposta Ativa</span>
              </div>
            </div>
          </div>
        </header>

        {/* Conteúdo Principal */}
        <main className="space-y-6 sm:space-y-8">
          {renderContent()}
        </main>

        {/* Footer Moderno */}
        <footer className="mt-8 sm:mt-12 bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-gray-200 text-center">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 text-xs sm:text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Proposta gerada em {new Date().toLocaleDateString('pt-BR')}</span>
            </div>
            <div className="hidden sm:block w-1 h-1 bg-gray-300 rounded-full"></div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Válida por 30 dias</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export const ExecutivoTemplate: React.FC<{ proposal: any; companyLogo: string }> = ({ proposal, companyLogo }) => {
  const renderContent = () => {
    if (proposal.detailed_description && proposal.detailed_description.includes('<h1>Proposta Comercial para')) {
      return (
        <div 
          className="prose max-w-none prose-headings:text-gray-900 prose-h1:text-2xl sm:prose-h1:text-3xl prose-h1:font-bold prose-h1:mb-6 prose-h1:pb-4 prose-h1:border-b prose-h1:border-gray-300 prose-h2:text-lg sm:prose-h2:text-xl prose-h2:font-bold prose-h2:text-gray-800 prose-h2:mt-6 prose-h2:mb-4 prose-h2:uppercase prose-h2:tracking-wide prose-h2:text-sm prose-p:text-gray-700 prose-p:leading-relaxed prose-strong:text-gray-900 prose-ul:space-y-2 prose-li:text-gray-700"
          dangerouslySetInnerHTML={{ __html: proposal.detailed_description }} 
        />
      );
    }

    return (
      <div className="space-y-8 sm:space-y-12">
        {proposal.service_description && (
          <section>
            <div className="border-b-2 border-gray-900 pb-3 mb-6">
              <h2 className="text-sm sm:text-base font-black text-gray-900 uppercase tracking-widest">Escopo dos Serviços</h2>
            </div>
            <div className="bg-gray-50 border-l-4 border-gray-900 p-4 sm:p-6">
              <p className="text-gray-800 leading-relaxed text-sm sm:text-base font-medium">{proposal.service_description}</p>
            </div>
          </section>
        )}
        
        {proposal.detailed_description && (
          <section>
            <div className="border-b-2 border-gray-900 pb-3 mb-6">
              <h2 className="text-sm sm:text-base font-black text-gray-900 uppercase tracking-widest">Especificações Detalhadas</h2>
            </div>
            <div className="bg-gray-50 border-l-4 border-gray-900 p-4 sm:p-6">
              <div className="text-gray-800 whitespace-pre-wrap leading-relaxed text-sm sm:text-base">{proposal.detailed_description}</div>
            </div>
          </section>
        )}
        
        {/* Seção de Investimento - Destaque Principal */}
        <section className="bg-gray-900 text-white p-6 sm:p-10 -mx-4 sm:-mx-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-sm font-black uppercase tracking-widest text-gray-300 mb-4">Condições Comerciais</h2>
              <div className="w-20 h-0.5 bg-white mx-auto"></div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              {proposal.value && (
                <div className="text-center lg:text-left">
                  <p className="text-gray-300 text-sm font-semibold uppercase tracking-wide mb-3">Investimento Total</p>
                  <p className="text-3xl sm:text-5xl font-black mb-2">
                    {formatCurrency(proposal.value)}
                  </p>
                  <p className="text-gray-400 text-xs sm:text-sm">Valor total do projeto</p>
                </div>
              )}
              
              {proposal.delivery_time && (
                <div className="text-center lg:text-right">
                  <p className="text-gray-300 text-sm font-semibold uppercase tracking-wide mb-3">Prazo de Execução</p>
                  <p className="text-2xl sm:text-3xl font-bold text-white">{proposal.delivery_time}</p>
                  <p className="text-gray-400 text-xs sm:text-sm">A partir da aprovação</p>
                </div>
              )}
            </div>
          </div>
        </section>
        
        {proposal.observations && (
          <section>
            <div className="border-b-2 border-gray-900 pb-3 mb-6">
              <h2 className="text-sm sm:text-base font-black text-gray-900 uppercase tracking-widest">Termos e Condições</h2>
            </div>
            <div className="bg-gray-50 border-l-4 border-gray-900 p-4 sm:p-6">
              <div className="text-gray-800 whitespace-pre-wrap leading-relaxed text-sm sm:text-base">{proposal.observations}</div>
            </div>
          </section>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto p-4 sm:p-8">
        {/* Header Executivo */}
        <header className="border-b-4 border-gray-900 pb-8 mb-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            {companyLogo && (
              <div className="bg-white border-2 border-gray-900 p-4 order-2 sm:order-1">
                <img src={companyLogo} alt="Logo da Empresa" className="h-10 sm:h-16 max-w-[250px] object-contain" />
              </div>
            )}
            <div className="text-left sm:text-right flex-1 order-1 sm:order-2">
              <h1 className="text-2xl sm:text-4xl font-black text-gray-900 mb-3 uppercase tracking-tight leading-tight">
                {proposal.title}
              </h1>
              <p className="text-gray-600 text-sm sm:text-base font-bold uppercase tracking-widest">Proposta Comercial</p>
              <div className="mt-4 pt-4 border-t border-gray-300">
                <p className="text-gray-700 text-sm sm:text-base"><span className="font-black">Cliente:</span> {proposal.companies?.name}</p>
                <p className="text-gray-600 text-xs sm:text-sm mt-1">{new Date().toLocaleDateString('pt-BR', { 
                  day: '2-digit', 
                  month: 'long', 
                  year: 'numeric' 
                })}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Conteúdo Principal */}
        <main>
          {renderContent()}
        </main>

        {/* Footer Executivo */}
        <footer className="mt-12 pt-8 border-t border-gray-300 text-center">
          <div className="space-y-4">
            <div className="w-32 h-0.5 bg-gray-400 mx-auto"></div>
            <p className="text-gray-600 text-xs sm:text-sm font-bold uppercase tracking-widest">
              Proposta válida por 30 dias
            </p>
            <p className="text-gray-500 text-xs">
              {new Date().toLocaleDateString('pt-BR')} • Documento confidencial
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export const CriativoTemplate: React.FC<{ proposal: any; companyLogo: string }> = ({ proposal, companyLogo }) => {
  const renderContent = () => {
    if (proposal.detailed_description && proposal.detailed_description.includes('<h1>Proposta Comercial para')) {
      return (
        <div 
          className="prose max-w-none prose-headings:bg-gradient-to-r prose-headings:from-purple-600 prose-headings:to-pink-600 prose-headings:bg-clip-text prose-headings:text-transparent prose-h1:text-2xl sm:prose-h1:text-4xl prose-h1:font-bold prose-h1:mb-6 prose-h1:text-center prose-h2:text-lg sm:prose-h2:text-2xl prose-h2:font-bold prose-h2:mt-6 prose-h2:mb-4 prose-h2:flex prose-h2:items-center prose-h2:gap-3 prose-h2:before:content-[''] prose-h2:before:w-1 prose-h2:before:h-8 prose-h2:before:bg-gradient-to-b prose-h2:before:from-purple-500 prose-h2:before:to-pink-500 prose-h2:before:rounded prose-p:text-gray-700 prose-p:leading-relaxed prose-strong:bg-gradient-to-r prose-strong:from-purple-600 prose-strong:to-pink-600 prose-strong:bg-clip-text prose-strong:text-transparent prose-ul:space-y-3 prose-li:text-gray-700 prose-li:relative prose-li:pl-6 prose-li:before:content-['✦'] prose-li:before:absolute prose-li:before:left-0 prose-li:before:text-purple-500"
          dangerouslySetInnerHTML={{ __html: proposal.detailed_description }} 
        />
      );
    }

    return (
      <div className="space-y-6 sm:space-y-8">
        {proposal.service_description && (
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 opacity-10 rounded-3xl blur-xl"></div>
            <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl p-6 sm:p-8 shadow-xl border border-purple-100/50">
              <div className="flex items-start gap-4">
                <div className="w-1 h-16 bg-gradient-to-b from-purple-500 via-pink-500 to-purple-600 rounded-full flex-shrink-0"></div>
                <div className="flex-1">
                  <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
                    ✨ O que vamos criar juntos
                  </h2>
                  <p className="text-gray-700 text-sm sm:text-lg leading-relaxed">{proposal.service_description}</p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {proposal.detailed_description && (
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 opacity-10 rounded-3xl blur-xl"></div>
            <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl p-6 sm:p-8 shadow-xl border border-blue-100/50">
              <div className="flex items-start gap-4">
                <div className="w-1 h-16 bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500 rounded-full flex-shrink-0"></div>
                <div className="flex-1">
                  <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
                    🎯 Detalhes do Projeto
                  </h2>
                  <div className="text-gray-700 text-sm sm:text-base whitespace-pre-wrap leading-relaxed">{proposal.detailed_description}</div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {proposal.value && (
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-green-500 opacity-20 rounded-2xl blur-lg"></div>
              <div className="relative bg-gradient-to-br from-emerald-500 via-green-500 to-teal-600 rounded-2xl p-6 sm:p-8 text-white shadow-2xl transform hover:scale-105 transition-transform duration-300">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-3 h-3 bg-white/40 rounded-full animate-pulse"></div>
                  <h3 className="font-bold text-sm sm:text-lg text-white/90">💰 Investimento</h3>
                </div>
                <p className="text-3xl sm:text-4xl font-black mb-2">
                  {formatCurrency(proposal.value)}
                </p>
                <p className="text-green-100 text-xs sm:text-sm">Valor total do projeto</p>
                <div className="absolute top-4 right-4 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-lg">💎</span>
                </div>
              </div>
            </div>
          )}
          
          {proposal.delivery_time && (
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-violet-400 to-purple-500 opacity-20 rounded-2xl blur-lg"></div>
              <div className="relative bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-600 rounded-2xl p-6 sm:p-8 text-white shadow-2xl transform hover:scale-105 transition-transform duration-300">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-3 h-3 bg-white/40 rounded-full animate-pulse"></div>
                  <h3 className="font-bold text-sm sm:text-lg text-white/90">⏰ Prazo</h3>
                </div>
                <p className="text-2xl sm:text-3xl font-black mb-2">{proposal.delivery_time}</p>
                <p className="text-violet-100 text-xs sm:text-sm">A partir da aprovação</p>
                <div className="absolute top-4 right-4 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-lg">⚡</span>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {proposal.observations && (
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-400 opacity-10 rounded-3xl blur-xl"></div>
            <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl p-6 sm:p-8 shadow-xl border border-amber-100/50">
              <div className="flex items-start gap-4">
                <div className="w-1 h-16 bg-gradient-to-b from-amber-400 via-orange-500 to-red-500 rounded-full flex-shrink-0"></div>
                <div className="flex-1">
                  <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mb-4">
                    📋 Informações Importantes
                  </h2>
                  <div className="text-gray-700 text-sm sm:text-base whitespace-pre-wrap leading-relaxed">{proposal.observations}</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      {/* Background decorativo */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-300 to-pink-300 opacity-20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-300 to-indigo-300 opacity-20 rounded-full blur-3xl"></div>
      </div>
      
      <div className="relative max-w-5xl mx-auto p-4 sm:p-8">
        {/* Header Criativo */}
        <header className="text-center mb-8 sm:mb-12 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 opacity-10 rounded-full blur-3xl"></div>
          <div className="relative bg-white/95 backdrop-blur-xl rounded-3xl p-6 sm:p-10 shadow-2xl border border-purple-100/50">
            {companyLogo && (
              <div className="mb-6 sm:mb-8">
                <div className="inline-block p-4 bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl">
                  <img src={companyLogo} alt="Logo da Empresa" className="h-12 sm:h-20 max-w-[300px] object-contain" />
                </div>
              </div>
            )}
            <h1 className="text-3xl sm:text-6xl font-black bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent mb-4 sm:mb-6 leading-tight">
              {proposal.title}
            </h1>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse"></div>
                <p className="text-gray-600 text-sm sm:text-xl font-semibold">Uma proposta especial para</p>
              </div>
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 sm:px-6 py-2 rounded-full">
                <p className="font-bold text-sm sm:text-lg">{proposal.companies?.name}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Conteúdo Principal */}
        <main>
          {renderContent()}
        </main>

        {/* Footer Criativo */}
        <footer className="mt-8 sm:mt-12 text-center relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 opacity-10 rounded-2xl blur-xl"></div>
          <div className="relative bg-white/95 backdrop-blur-xl rounded-2xl p-4 sm:p-6 shadow-xl border border-purple-100/50">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6">
              <div className="flex items-center gap-2">
                <span className="text-lg sm:text-xl">🎯</span>
                <p className="text-purple-600 font-bold text-sm sm:text-base">Pronto para começarmos essa jornada?</p>
              </div>
              <div className="flex items-center gap-2 text-gray-600 text-xs sm:text-sm">
                <span>✨</span>
                <span>Proposta válida por 30 dias</span>
                <span>•</span>
                <span>{new Date().toLocaleDateString('pt-BR')}</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

const ProposalTemplates: React.FC<ProposalTemplatesProps> = ({
  selectedTemplate,
  onTemplateSelect
}) => {
  const { templates: customTemplates, loading } = useCustomTemplates();
  const { canAccessPremiumTemplates, isAdmin } = useUserPermissions();

  const defaultTemplates: Template[] = [
    {
      id: 'moderno',
      name: 'Moderno',
      description: 'Design limpo e contemporâneo',
      preview: '🎨',
      isPremium: false
    },
    {
      id: 'executivo',
      name: 'Executivo',
      description: 'Estilo formal e profissional',
      preview: '💼',
      isPremium: false
    },
    {
      id: 'criativo',
      name: 'Criativo',
      description: 'Visual diferenciado e inovador',
      preview: '✨',
      isPremium: false
    }
  ];

  // Incluir templates personalizados apenas se o usuário tem acesso
  const customTemplatesList = (canAccessPremiumTemplates || isAdmin) 
    ? customTemplates.map(template => ({
        id: template.template_id,
        name: template.name,
        description: template.description || 'Template personalizado',
        preview: '🎯',
        isPremium: true
      }))
    : [];

  const allTemplates = [
    ...defaultTemplates,
    ...customTemplatesList
  ];

  if (loading) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando templates...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Templates Disponíveis</h3>
          <p className="text-sm text-gray-600">Escolha o template para sua proposta</p>
        </div>
        {!canAccessPremiumTemplates && !isAdmin && customTemplates.length > 0 && (
          <Badge variant="outline" className="border-purple-200 text-purple-700">
            Upgrade para acessar templates personalizados
          </Badge>
        )}
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {allTemplates.map((template) => {
          const isSelected = selectedTemplate === template.id;
          const canSelect = !template.isPremium || canAccessPremiumTemplates || isAdmin;
          
          return (
            <Card
              key={template.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                isSelected
                  ? 'ring-2 ring-primary border-primary shadow-lg'
                  : canSelect
                  ? 'border-gray-200 hover:border-gray-300'
                  : 'border-gray-100 opacity-60 cursor-not-allowed'
              }`}
              onClick={() => canSelect && onTemplateSelect(template.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="text-3xl">{template.preview}</div>
                  {template.isPremium && (
                    <Badge variant="secondary" className="bg-purple-100 text-purple-700 text-xs">
                      Premium
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-lg">{template.name}</CardTitle>
                <CardDescription className="text-sm">
                  {template.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between">
                  {isSelected && (
                    <Badge variant="default" className="text-xs">
                      Selecionado
                    </Badge>
                  )}
                  {!canSelect && (
                    <Badge variant="outline" className="text-xs border-purple-200 text-purple-600">
                      Requer Upgrade
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Empty State */}
      {allTemplates.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <div className="text-gray-400 text-4xl mb-4">📄</div>
            <p className="text-gray-600">Nenhum template disponível</p>
          </CardContent>
        </Card>
      )}

      {/* Custom Templates Info */}
      {(canAccessPremiumTemplates || isAdmin) && customTemplatesList.length === 0 && (
        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="text-center py-6">
            <div className="text-purple-600 text-3xl mb-2">🎨</div>
            <p className="text-purple-800 font-medium">Crie seus próprios templates!</p>
            <p className="text-purple-600 text-sm mt-1">
              Acesse a área de Templates Personalizados para criar designs únicos
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProposalTemplates;
