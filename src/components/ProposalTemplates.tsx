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

// Template components for rendering proposals
export const ModernoTemplate: React.FC<{ proposal: any; companyLogo: string }> = ({ proposal, companyLogo }) => {
  const renderContent = () => {
    // Se tem detailed_description com HTML do modelo oficial, renderizar diretamente
    if (proposal.detailed_description && proposal.detailed_description.includes('<h1>Proposta Comercial para')) {
      return (
        <div 
          className="prose max-w-none prose-headings:text-blue-800 prose-h1:text-3xl prose-h1:font-bold prose-h1:mb-8 prose-h1:pb-4 prose-h1:border-b-2 prose-h1:border-blue-200 prose-h2:text-xl prose-h2:font-semibold prose-h2:text-blue-700 prose-h2:mt-8 prose-h2:mb-4 prose-h2:flex prose-h2:items-center prose-h2:gap-2 prose-h2:before:content-['●'] prose-h2:before:text-blue-500 prose-p:text-gray-700 prose-p:leading-relaxed prose-strong:text-blue-800 prose-ul:space-y-2 prose-li:text-gray-700"
          dangerouslySetInnerHTML={{ __html: proposal.detailed_description }} 
        />
      );
    }

    // Fallback para estrutura antiga
    return (
      <div className="space-y-8">
        {proposal.service_description && (
          <div className="bg-blue-50 rounded-xl p-6 border-l-4 border-blue-500">
            <h2 className="text-xl font-semibold mb-3 text-blue-800 flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              Serviço
            </h2>
            <p className="text-gray-700 leading-relaxed">{proposal.service_description}</p>
          </div>
        )}
        
        {proposal.detailed_description && (
          <div className="bg-gray-50 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-3 text-gray-800 flex items-center gap-2">
              <span className="w-2 h-2 bg-gray-500 rounded-full"></span>
              Descrição Detalhada
            </h2>
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{proposal.detailed_description}</p>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {proposal.value && (
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-6 shadow-lg">
              <h3 className="font-semibold mb-2 opacity-90">Valor Total</h3>
              <p className="text-3xl font-bold">
                R$ {proposal.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          )}
          
          {proposal.delivery_time && (
            <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl p-6 shadow-lg">
              <h3 className="font-semibold mb-2 opacity-90">Prazo de Entrega</h3>
              <p className="text-xl font-semibold">{proposal.delivery_time}</p>
            </div>
          )}
        </div>
        
        {proposal.observations && (
          <div className="bg-amber-50 rounded-xl p-6 border-l-4 border-amber-400">
            <h2 className="text-xl font-semibold mb-3 text-amber-800 flex items-center gap-2">
              <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
              Observações
            </h2>
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{proposal.observations}</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-8 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-8">
          <div className="flex items-center justify-between">
            {companyLogo && (
              <div className="bg-white rounded-lg p-3">
                <img src={companyLogo} alt="Logo" className="h-12 max-w-[200px] object-contain" />
              </div>
            )}
            <div className="text-right">
              <h1 className="text-3xl font-bold mb-2">{proposal.title}</h1>
              <p className="opacity-90 text-lg">Proposta para: {proposal.companies?.name}</p>
            </div>
          </div>
        </div>
        
        <div className="p-8">
          {renderContent()}
        </div>
        
        <div className="bg-gray-50 p-6 text-center border-t">
          <p className="text-sm text-gray-600">
            Proposta gerada em {new Date().toLocaleDateString('pt-BR')} • Válida por 30 dias
          </p>
        </div>
      </div>
    </div>
  );
};

export const ExecutivoTemplate: React.FC<{ proposal: any; companyLogo: string }> = ({ proposal, companyLogo }) => {
  const renderContent = () => {
    // Se tem detailed_description com HTML do modelo oficial, renderizar diretamente
    if (proposal.detailed_description && proposal.detailed_description.includes('<h1>Proposta Comercial para')) {
      return (
        <div 
          className="prose max-w-none prose-headings:text-gray-900 prose-h1:text-3xl prose-h1:font-bold prose-h1:mb-8 prose-h1:pb-4 prose-h1:border-b prose-h1:border-gray-300 prose-h2:text-xl prose-h2:font-bold prose-h2:text-gray-800 prose-h2:mt-8 prose-h2:mb-4 prose-h2:uppercase prose-h2:tracking-wide prose-h2:text-sm prose-p:text-gray-700 prose-p:leading-relaxed prose-strong:text-gray-900 prose-ul:space-y-2 prose-li:text-gray-700"
          dangerouslySetInnerHTML={{ __html: proposal.detailed_description }} 
        />
      );
    }

    // Fallback para estrutura antiga
    return (
      <div className="space-y-10">
        {proposal.service_description && (
          <div>
            <h2 className="text-sm font-bold text-gray-800 mb-4 uppercase tracking-wide border-b border-gray-300 pb-2">Serviço Proposto</h2>
            <div className="bg-gray-50 p-6 rounded border-l-4 border-gray-800">
              <p className="text-gray-700 leading-relaxed">{proposal.service_description}</p>
            </div>
          </div>
        )}
        
        {proposal.detailed_description && (
          <div>
            <h2 className="text-sm font-bold text-gray-800 mb-4 uppercase tracking-wide border-b border-gray-300 pb-2">Especificações</h2>
            <div className="bg-gray-50 p-6 rounded border-l-4 border-gray-800">
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{proposal.detailed_description}</p>
            </div>
          </div>
        )}
        
        <div className="bg-gray-900 text-white p-8 rounded">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {proposal.value && (
              <div className="text-center md:text-left">
                <h3 className="font-bold mb-3 text-gray-300 uppercase tracking-wide text-sm">Investimento</h3>
                <p className="text-4xl font-bold">
                  R$ {proposal.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            )}
            
            {proposal.delivery_time && (
              <div className="text-center md:text-right">
                <h3 className="font-bold mb-3 text-gray-300 uppercase tracking-wide text-sm">Prazo</h3>
                <p className="text-2xl font-semibold">{proposal.delivery_time}</p>
              </div>
            )}
          </div>
        </div>
        
        {proposal.observations && (
          <div>
            <h2 className="text-sm font-bold text-gray-800 mb-4 uppercase tracking-wide border-b border-gray-300 pb-2">Termos e Condições</h2>
            <div className="bg-gray-50 p-6 rounded border-l-4 border-gray-800">
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{proposal.observations}</p>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <div className="max-w-4xl mx-auto bg-white shadow-2xl">
        <div className="bg-gray-900 text-white p-8">
          <div className="flex items-center justify-between">
            {companyLogo && (
              <div className="bg-white rounded p-3">
                <img src={companyLogo} alt="Logo" className="h-12 max-w-[200px] object-contain" />
              </div>
            )}
            <div className="text-right">
              <h1 className="text-3xl font-bold mb-1">{proposal.title}</h1>
              <p className="opacity-90 uppercase tracking-wide text-sm">Proposta Comercial</p>
            </div>
          </div>
        </div>
        
        <div className="p-8">
          <div className="border-l-4 border-gray-900 pl-6 mb-10">
            <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide">Cliente</h2>
            <p className="text-xl text-gray-700 mt-1">{proposal.companies?.name}</p>
          </div>
          
          {renderContent()}
        </div>
        
        <div className="bg-gray-100 p-6 text-center border-t">
          <p className="text-sm text-gray-600 uppercase tracking-wide">
            Proposta gerada em {new Date().toLocaleDateString('pt-BR')} • Válida por 30 dias
          </p>
        </div>
      </div>
    </div>
  );
};

export const CriativoTemplate: React.FC<{ proposal: any; companyLogo: string }> = ({ proposal, companyLogo }) => {
  const renderContent = () => {
    // Se tem detailed_description com HTML do modelo oficial, renderizar diretamente
    if (proposal.detailed_description && proposal.detailed_description.includes('<h1>Proposta Comercial para')) {
      return (
        <div 
          className="prose max-w-none prose-headings:bg-gradient-to-r prose-headings:from-purple-600 prose-headings:to-blue-600 prose-headings:bg-clip-text prose-headings:text-transparent prose-h1:text-4xl prose-h1:font-bold prose-h1:mb-8 prose-h1:text-center prose-h2:text-2xl prose-h2:font-bold prose-h2:mt-8 prose-h2:mb-6 prose-h2:flex prose-h2:items-center prose-h2:gap-3 prose-h2:before:content-[''] prose-h2:before:w-1 prose-h2:before:h-8 prose-h2:before:bg-gradient-to-b prose-h2:before:from-purple-500 prose-h2:before:to-blue-500 prose-h2:before:rounded prose-p:text-gray-700 prose-p:leading-relaxed prose-strong:bg-gradient-to-r prose-strong:from-purple-600 prose-strong:to-blue-600 prose-strong:bg-clip-text prose-strong:text-transparent prose-ul:space-y-3 prose-li:text-gray-700 prose-li:relative prose-li:pl-6 prose-li:before:content-['✦'] prose-li:before:absolute prose-li:before:left-0 prose-li:before:text-purple-500"
          dangerouslySetInnerHTML={{ __html: proposal.detailed_description }} 
        />
      );
    }

    // Fallback para estrutura antiga
    return (
      <div className="space-y-8">
        {proposal.service_description && (
          <div className="bg-white rounded-2xl p-8 shadow-xl border border-purple-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-3">
              <span className="w-1 h-8 bg-gradient-to-b from-purple-500 to-blue-500 rounded"></span>
              O que vamos criar
            </h2>
            <p className="text-gray-700 text-lg leading-relaxed">{proposal.service_description}</p>
          </div>
        )}
        
        {proposal.detailed_description && (
          <div className="bg-white rounded-2xl p-8 shadow-xl border border-purple-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-3">
              <span className="w-1 h-8 bg-gradient-to-b from-purple-500 to-blue-500 rounded"></span>
              Detalhes do Projeto
            </h2>
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{proposal.detailed_description}</p>
          </div>
        )}
        
        <div className="bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl p-8 text-white shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {proposal.value && (
              <div className="text-center md:text-left">
                <h3 className="font-semibold mb-3 opacity-90 text-lg">Investimento Total</h3>
                <p className="text-5xl font-bold">
                  R$ {proposal.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            )}
            
            {proposal.delivery_time && (
              <div className="text-center md:text-right">
                <h3 className="font-semibold mb-3 opacity-90 text-lg">Tempo de Entrega</h3>
                <p className="text-3xl font-semibold">{proposal.delivery_time}</p>
              </div>
            )}
          </div>
        </div>
        
        {proposal.observations && (
          <div className="bg-white rounded-2xl p-8 shadow-xl border border-purple-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-3">
              <span className="w-1 h-8 bg-gradient-to-b from-purple-500 to-blue-500 rounded"></span>
              Informações Importantes
            </h2>
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{proposal.observations}</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-8 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-blue-400 opacity-10 rounded-full blur-3xl"></div>
          <div className="relative bg-white rounded-3xl p-8 shadow-2xl border border-purple-100">
            {companyLogo && (
              <div className="mb-6">
                <img src={companyLogo} alt="Logo" className="h-20 mx-auto max-w-[250px] object-contain" />
              </div>
            )}
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
              {proposal.title}
            </h1>
            <p className="text-gray-600 text-xl">para {proposal.companies?.name}</p>
          </div>
        </div>
        
        {renderContent()}
        
        <div className="text-center mt-12 bg-white rounded-2xl p-6 shadow-lg border border-purple-100">
          <p className="text-sm text-gray-600">
            ✨ Proposta gerada em {new Date().toLocaleDateString('pt-BR')} • Válida por 30 dias ✨
          </p>
        </div>
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
