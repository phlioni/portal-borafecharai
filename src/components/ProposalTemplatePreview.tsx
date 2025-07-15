
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calendar, DollarSign, Clock, User, Phone, Mail } from 'lucide-react';

interface ProposalData {
  title: string;
  client: string;
  value?: number;
  deliveryTime?: string;
  description?: string;
  template?: string;
  responsible?: string;
  email?: string;
  phone?: string;
  paymentMethod?: string;
}

interface ProposalTemplatePreviewProps {
  data: ProposalData;
  className?: string;
}

const ProposalTemplatePreview = ({ data, className = '' }: ProposalTemplatePreviewProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDescription = (description: string) => {
    // Remove tags HTML e renderiza texto limpo
    const cleanText = description.replace(/<[^>]*>/g, '');
    
    // Quebra em parágrafos por quebras de linha duplas
    const paragraphs = cleanText.split(/\n\n+/).filter(p => p.trim());
    
    return paragraphs.map((paragraph, index) => (
      <p key={index} className="mb-3 text-gray-700 leading-relaxed">
        {paragraph.trim()}
      </p>
    ));
  };

  return (
    <Card className={`max-w-4xl mx-auto shadow-lg ${className}`}>
      <CardContent className="p-8">
        {/* Header da proposta */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {data.title}
          </h1>
          <Badge variant="outline" className="text-sm">
            Proposta Comercial
          </Badge>
        </div>

        <Separator className="mb-6" />

        {/* Informações do cliente */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" />
              Informações do Cliente
            </h2>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-700">Cliente:</span>
                <span className="text-gray-600">{data.client}</span>
              </div>
              
              {data.responsible && (
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-700">Responsável:</span>
                  <span className="text-gray-600">{data.responsible}</span>
                </div>
              )}
              
              {data.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-600">{data.email}</span>
                </div>
              )}
              
              {data.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-600">{data.phone}</span>
                </div>
              )}
            </div>
          </div>

          {/* Resumo comercial */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              Resumo Comercial
            </h2>
            
            <div className="space-y-3">
              {data.value && (
                <div className="bg-green-50 p-3 rounded-lg">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-gray-700">Valor Total:</span>
                  </div>
                  <p className="text-2xl font-bold text-green-600 mt-1">
                    {formatCurrency(data.value)}
                  </p>
                </div>
              )}
              
              {data.deliveryTime && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-gray-700">Prazo:</span>
                  <span className="text-gray-600">{data.deliveryTime}</span>
                </div>
              )}

              {data.paymentMethod && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-purple-600" />
                  <span className="font-medium text-gray-700">Pagamento:</span>
                  <span className="text-gray-600">{data.paymentMethod}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <Separator className="mb-6" />

        {/* Descrição do projeto */}
        {data.description && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Detalhes do Projeto
            </h2>
            
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="prose prose-gray max-w-none">
                {formatDescription(data.description)}
              </div>
            </div>
          </div>
        )}

        {/* Footer da proposta */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-2">
              Esta proposta tem validade de 30 dias a partir da data de emissão.
            </p>
            <p className="text-xs text-gray-400">
              Gerado pelo sistema BoraFecharAI
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProposalTemplatePreview;
