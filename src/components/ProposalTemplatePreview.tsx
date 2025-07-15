
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building, DollarSign, Calendar, FileText, CheckCircle, Clock, User, Mail, Phone, CreditCard } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ProposalData {
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
}

interface ProposalTemplatePreviewProps {
  data: ProposalData;
  className?: string;
}

const ProposalTemplatePreview: React.FC<ProposalTemplatePreviewProps> = ({ data, className = "" }) => {
  const getTemplateStyle = (template: string) => {
    const styles = {
      'moderno': 'bg-gradient-to-br from-blue-50 via-white to-indigo-50 border-blue-200 shadow-xl',
      'executivo': 'bg-gradient-to-br from-gray-50 via-white to-gray-100 border-gray-300 shadow-xl',
      'criativo': 'bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 border-purple-200 shadow-xl'
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

  const getGradientColors = (template: string) => {
    const gradients = {
      'moderno': 'from-blue-500 to-blue-600',
      'executivo': 'from-gray-700 to-gray-800',
      'criativo': 'from-purple-500 to-blue-500'
    };
    
    return gradients[template as keyof typeof gradients] || gradients.moderno;
  };

  const getIconColor = (template: string) => {
    const colors = {
      'moderno': 'text-blue-500',
      'executivo': 'text-gray-600',
      'criativo': 'text-purple-500'
    };
    
    return colors[template as keyof typeof colors] || colors.moderno;
  };

  return (
    <Card className={`${getTemplateStyle(data.template)} border-2 overflow-hidden ${className}`}>
      <CardHeader className="text-center pb-6 bg-white/60 backdrop-blur-sm">
        <div className="flex justify-between items-start mb-6">
          <Badge variant="outline" className="bg-white/80 shadow-sm backdrop-blur-sm border-2">
            <span className="font-semibold">
              {data.template.charAt(0).toUpperCase() + data.template.slice(1)}
            </span>
          </Badge>
          <div className="bg-white/80 backdrop-blur-sm rounded-lg px-3 py-2 shadow-sm">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="h-4 w-4" />
              <span>{format(new Date(), 'dd/MM/yyyy', { locale: ptBR })}</span>
            </div>
          </div>
        </div>
        
        <CardTitle className={`text-3xl font-bold mb-4 ${getAccentColor(data.template)}`}>
          {data.title || 'Título da Proposta'}
        </CardTitle>
        
        <div className="flex items-center justify-center gap-2 mb-4">
          <User className={`h-5 w-5 ${getIconColor(data.template)}`} />
          <span className="text-lg text-gray-700 font-medium">
            {data.client || 'Nome do Cliente'}
          </span>
        </div>

        {/* Informações de contato se disponíveis */}
        {(data.responsible || data.email || data.phone) && (
          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-sm mb-4">
            <h3 className={`font-semibold mb-2 ${getAccentColor(data.template)}`}>Informações de Contato</h3>
            <div className="space-y-1 text-sm text-gray-600">
              {data.responsible && (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>Responsável: {data.responsible}</span>
                </div>
              )}
              {data.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span>Email: {data.email}</span>
                </div>
              )}
              {data.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span>Telefone: {data.phone}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {data.description && (
          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-sm">
            <p className="text-gray-700 leading-relaxed">
              {data.description}
            </p>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-6 p-6">
        {/* Financial and Timeline Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.value && (
            <div className={`bg-gradient-to-r ${getGradientColors(data.template)} rounded-xl p-6 text-white shadow-lg transform hover:scale-105 transition-transform duration-200`}>
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-white/20 rounded-full p-2">
                  <DollarSign className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-lg">Investimento</h3>
              </div>
              <p className="text-3xl font-bold">
                R$ {data.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          )}
          
          {data.deliveryTime && (
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-200 transform hover:scale-105 transition-transform duration-200">
              <div className="flex items-center gap-3 mb-3">
                <div className={`${getIconColor(data.template)} bg-current/10 rounded-full p-2`}>
                  <Clock className="h-5 w-5" />
                </div>
                <h3 className={`font-semibold text-lg ${getAccentColor(data.template)}`}>Prazo</h3>
              </div>
              <p className="text-xl font-semibold text-gray-700">{data.deliveryTime}</p>
            </div>
          )}
        </div>

        {/* Forma de pagamento se disponível */}
        {data.paymentMethod && (
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-200">
            <div className="flex items-center gap-3 mb-3">
              <div className={`${getIconColor(data.template)} bg-current/10 rounded-full p-2`}>
                <CreditCard className="h-5 w-5" />
              </div>
              <h3 className={`font-semibold text-lg ${getAccentColor(data.template)}`}>Forma de Pagamento</h3>
            </div>
            <p className="text-gray-700">{data.paymentMethod}</p>
          </div>
        )}

        {/* Service Highlights */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className={`${getIconColor(data.template)} bg-current/10 rounded-full p-2`}>
              <CheckCircle className="h-5 w-5" />
            </div>
            <h3 className={`font-semibold text-lg ${getAccentColor(data.template)}`}>O que está incluído</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              'Análise inicial completa',
              'Planejamento detalhado',
              'Implementação profissional',
              'Suporte pós-entrega'
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${getIconColor(data.template).replace('text-', 'bg-')}`}></div>
                <span className="text-gray-700 text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className={`bg-gradient-to-r ${getGradientColors(data.template)} rounded-xl p-6 text-white text-center shadow-lg`}>
          <h3 className="font-bold text-lg mb-2">Pronto para começar?</h3>
          <p className="opacity-90 mb-4">Entre em contato conosco para dar início ao seu projeto</p>
          <div className="bg-white/20 rounded-lg px-4 py-2 inline-block">
            <span className="font-semibold">📧 Responda este e-mail ou ligue agora!</span>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center pt-4 border-t border-gray-200/50">
          <p className="text-xs text-gray-500 flex items-center justify-center gap-2">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            Proposta válida por 30 dias • Template: {data.template.charAt(0).toUpperCase() + data.template.slice(1)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProposalTemplatePreview;
