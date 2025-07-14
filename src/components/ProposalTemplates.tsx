
import React from 'react';
import { useCustomTemplates } from '@/hooks/useCustomTemplates';
import { useUserPermissions } from '@/hooks/useUserPermissions';

interface Template {
  id: string;
  name: string;
  description: string;
  preview?: string;
}

interface ProposalTemplatesProps {
  selectedTemplate: string;
  onTemplateSelect: (templateId: string) => void;
}

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
      preview: '🎨'
    },
    {
      id: 'executivo',
      name: 'Executivo',
      description: 'Estilo formal e profissional',
      preview: '💼'
    },
    {
      id: 'criativo',
      name: 'Criativo',
      description: 'Visual diferenciado e inovador',
      preview: '✨'
    }
  ];

  const allTemplates = [
    ...defaultTemplates,
    ...(canAccessPremiumTemplates || isAdmin ? customTemplates.map(template => ({
      id: template.template_id,
      name: template.name,
      description: template.description || 'Template personalizado',
      preview: '🎯'
    })) : [])
  ];

  if (loading) {
    return <div className="text-center py-4">Carregando templates...</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {allTemplates.map((template) => (
        <div
          key={template.id}
          className={`border rounded-lg p-4 cursor-pointer transition-all ${
            selectedTemplate === template.id
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
          onClick={() => onTemplateSelect(template.id)}
        >
          <div className="text-center">
            <div className="text-2xl mb-2">{template.preview}</div>
            <h3 className="font-semibold text-gray-900">{template.name}</h3>
            <p className="text-sm text-gray-600 mt-1">{template.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProposalTemplates;
