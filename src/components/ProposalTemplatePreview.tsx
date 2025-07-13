
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building, DollarSign, Calendar, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ProposalData {
  title: string;
  client: string;
  value?: number;
  deliveryTime?: string;
  description?: string;
  template: string;
}

interface ProposalTemplatePreviewProps {
  data: ProposalData;
  className?: string;
}

const ProposalTemplatePreview: React.FC<ProposalTemplatePreviewProps> = ({ data, className = "" }) => {
  const getTemplateStyle = (template: string) => {
    const styles = {
      'moderno': 'bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200',
      'executivo': 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-300',
      'criativo': 'bg-gradient-to-br from-purple-50 to-pink-100 border-purple-200'
    };
    
    return styles[template as keyof typeof styles] || styles.moderno;
  };

  const getAccentColor = (template: string) => {
    const colors = {
      'moderno': 'text-blue-600',
      'executivo': 'text-gray-800',
      'criativo': 'text-purple-600'
    };
    
    return colors[template as keyof typeof colors] || colors.moderno;
  };

  return (
    <Card className={`${getTemplateStyle(data.template)} border-2 ${className}`}>
      <CardHeader className="text-center pb-6">
        <div className="flex justify-between items-start mb-4">
          <Badge variant="outline" className="bg-white/50">
            {data.template.charAt(0).toUpperCase() + data.template.slice(1)}
          </Badge>
          <div className="text-right text-sm text-gray-600">
            <p>{format(new Date(), 'dd/MM/yyyy', { locale: ptBR })}</p>
          </div>
        </div>
        
        <CardTitle className={`text-2xl font-bold mb-2 ${getAccentColor(data.template)}`}>
          {data.title || 'Título da Proposta'}
        </CardTitle>
        
        {data.description && (
          <p className="text-gray-700 mb-4">
            {data.description}
          </p>
        )}
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Client Information */}
        <div className="bg-white/50 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <Building className="h-4 w-4" />
            Cliente
          </h3>
          <p className="text-gray-700">{data.client || 'Nome do Cliente'}</p>
        </div>

        {/* Financial and Timeline Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.value && (
            <div className="bg-white/50 rounded-lg p-4 text-center">
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center justify-center gap-2">
                <DollarSign className="h-4 w-4" />
                Valor
              </h3>
              <p className={`text-xl font-bold ${getAccentColor(data.template)}`}>
                R$ {data.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          )}
          
          {data.deliveryTime && (
            <div className="bg-white/50 rounded-lg p-4 text-center">
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center justify-center gap-2">
                <Calendar className="h-4 w-4" />
                Prazo
              </h3>
              <p className="text-gray-700">{data.deliveryTime}</p>
            </div>
          )}
        </div>

        {/* Service Description */}
        {data.description && (
          <div className="bg-white/50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Descrição do Serviço
            </h3>
            <p className="text-gray-700 text-sm">
              {data.description}
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="text-center pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Template: {data.template.charAt(0).toUpperCase() + data.template.slice(1)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProposalTemplatePreview;
