
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCustomTemplates } from '@/hooks/useCustomTemplates';

interface ProposalTemplatesProps {
  selectedTemplate: string;
  onTemplateSelect: (templateId: string) => void;
}

const ProposalTemplates: React.FC<ProposalTemplatesProps> = ({
  selectedTemplate,
  onTemplateSelect
}) => {
  const { getAllAvailableTemplates, loading } = useCustomTemplates();
  
  const templates = getAllAvailableTemplates();

  if (loading) {
    return <div>Carregando templates...</div>;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Selecionar Template</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => (
          <Card
            key={template.id}
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedTemplate === template.id
                ? 'ring-2 ring-blue-500 border-blue-500'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => onTemplateSelect(template.id)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{template.name}</CardTitle>
                {(template as any).isCustom && (
                  <Badge variant="secondary">Personalizado</Badge>
                )}
              </div>
              <CardDescription className="text-sm">
                {template.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-24 bg-gray-50 rounded border-2 border-dashed border-gray-200 flex items-center justify-center">
                <span className="text-xs text-gray-500">Preview do template</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ProposalTemplates;
