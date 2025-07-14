
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
  return (
    <div className="p-8 bg-white">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          {companyLogo && <img src={companyLogo} alt="Logo" className="h-16 mx-auto mb-4" />}
          <h1 className="text-3xl font-bold text-gray-900">{proposal.title}</h1>
          <p className="text-gray-600 mt-2">Proposta para: {proposal.companies?.name}</p>
        </div>
        
        <div className="space-y-6">
          {proposal.service_description && (
            <div>
              <h2 className="text-xl font-semibold mb-2">Serviço</h2>
              <p className="text-gray-700">{proposal.service_description}</p>
            </div>
          )}
          
          {proposal.detailed_description && (
            <div>
              <h2 className="text-xl font-semibold mb-2">Descrição Detalhada</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{proposal.detailed_description}</p>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {proposal.value && (
              <div>
                <h3 className="font-semibold mb-1">Valor Total</h3>
                <p className="text-2xl font-bold text-blue-600">
                  R$ {proposal.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            )}
            
            {proposal.delivery_time && (
              <div>
                <h3 className="font-semibold mb-1">Prazo de Entrega</h3>
                <p className="text-gray-700">{proposal.delivery_time}</p>
              </div>
            )}
          </div>
          
          {proposal.observations && (
            <div>
              <h2 className="text-xl font-semibold mb-2">Observações</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{proposal.observations}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const ExecutivoTemplate: React.FC<{ proposal: any; companyLogo: string }> = ({ proposal, companyLogo }) => {
  return (
    <div className="p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto bg-white shadow-lg">
        <div className="bg-gray-800 text-white p-6">
          <div className="flex items-center justify-between">
            {companyLogo && <img src={companyLogo} alt="Logo" className="h-12" />}
            <div className="text-right">
              <h1 className="text-2xl font-bold">{proposal.title}</h1>
              <p className="opacity-90">Proposta Comercial</p>
            </div>
          </div>
        </div>
        
        <div className="p-8 space-y-8">
          <div className="border-l-4 border-gray-800 pl-4">
            <h2 className="text-lg font-semibold text-gray-800">Cliente</h2>
            <p className="text-gray-600">{proposal.companies?.name}</p>
          </div>
          
          {proposal.service_description && (
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-3">Serviço Proposto</h2>
              <p className="text-gray-700">{proposal.service_description}</p>
            </div>
          )}
          
          {proposal.detailed_description && (
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-3">Especificações</h2>
              <div className="bg-gray-50 p-4 rounded">
                <p className="text-gray-700 whitespace-pre-wrap">{proposal.detailed_description}</p>
              </div>
            </div>
          )}
          
          <div className="bg-gray-800 text-white p-6 rounded">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {proposal.value && (
                <div>
                  <h3 className="font-semibold mb-2">Investimento</h3>
                  <p className="text-3xl font-bold">
                    R$ {proposal.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              )}
              
              {proposal.delivery_time && (
                <div>
                  <h3 className="font-semibold mb-2">Prazo</h3>
                  <p className="text-xl">{proposal.delivery_time}</p>
                </div>
              )}
            </div>
          </div>
          
          {proposal.observations && (
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-3">Termos e Condições</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{proposal.observations}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const CriativoTemplate: React.FC<{ proposal: any; companyLogo: string }> = ({ proposal, companyLogo }) => {
  return (
    <div className="p-8 bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-blue-400 opacity-10 rounded-full blur-3xl"></div>
          <div className="relative">
            {companyLogo && <img src={companyLogo} alt="Logo" className="h-20 mx-auto mb-4" />}
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              {proposal.title}
            </h1>
            <p className="text-gray-600 mt-2 text-lg">para {proposal.companies?.name}</p>
          </div>
        </div>
        
        <div className="space-y-8">
          {proposal.service_description && (
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                <span className="w-2 h-8 bg-gradient-to-b from-purple-500 to-blue-500 rounded mr-3"></span>
                O que vamos criar
              </h2>
              <p className="text-gray-700 text-lg">{proposal.service_description}</p>
            </div>
          )}
          
          {proposal.detailed_description && (
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                <span className="w-2 h-8 bg-gradient-to-b from-purple-500 to-blue-500 rounded mr-3"></span>
                Detalhes do Projeto
              </h2>
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{proposal.detailed_description}</p>
            </div>
          )}
          
          <div className="bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl p-6 text-white">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {proposal.value && (
                <div>
                  <h3 className="font-semibold mb-2 opacity-90">Investimento Total</h3>
                  <p className="text-4xl font-bold">
                    R$ {proposal.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              )}
              
              {proposal.delivery_time && (
                <div>
                  <h3 className="font-semibold mb-2 opacity-90">Tempo de Entrega</h3>
                  <p className="text-2xl font-semibold">{proposal.delivery_time}</p>
                </div>
              )}
            </div>
          </div>
          
          {proposal.observations && (
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                <span className="w-2 h-8 bg-gradient-to-b from-purple-500 to-blue-500 rounded mr-3"></span>
                Informações Importantes
              </h2>
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{proposal.observations}</p>
            </div>
          )}
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
