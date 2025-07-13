
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building, DollarSign, Calendar, FileText, Phone, Mail, Download } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ProposalData {
  id: string;
  title: string;
  service_description?: string;
  detailed_description?: string;
  value?: number;
  delivery_time?: string;
  validity_date?: string;
  observations?: string;
  status?: string;
  companies?: {
    name: string;
    email?: string;
    phone?: string;
  };
  created_at: string;
  template_id?: string;
}

interface ProposalTemplateProps {
  proposal: ProposalData;
  isPublicView?: boolean;
  companyLogo?: string;
}

const ModernoTemplate = ({ proposal, isPublicView, companyLogo }: ProposalTemplateProps) => (
  <div className="bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
    <div className="max-w-4xl mx-auto p-8">
      <Card className="border-2 border-blue-200 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
          <div className="flex justify-between items-start">
            {companyLogo && (
              <img src={companyLogo} alt="Logo" className="h-16 w-auto bg-white p-2 rounded" />
            )}
            <div className="text-right">
              <Badge variant="outline" className="bg-white text-blue-600 border-white">
                {proposal.status === 'rascunho' ? 'Rascunho' : 'Proposta Comercial'}
              </Badge>
              <p className="text-blue-100 text-sm mt-1">
                {format(new Date(proposal.created_at), 'dd/MM/yyyy', { locale: ptBR })}
              </p>
            </div>
          </div>
          <CardTitle className="text-3xl font-bold mt-4">
            {proposal.title}
          </CardTitle>
          {proposal.service_description && (
            <p className="text-blue-100 text-lg mt-2">
              {proposal.service_description}
            </p>
          )}
        </CardHeader>

        <CardContent className="p-8 space-y-8">
          {/* Client Info */}
          {proposal.companies && (
            <div className="bg-white rounded-lg p-6 border-l-4 border-blue-500">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Building className="h-5 w-5 text-blue-600" />
                Cliente
              </h3>
              <div className="space-y-2">
                <p className="font-medium text-gray-900">{proposal.companies.name}</p>
                {proposal.companies.email && (
                  <p className="flex items-center gap-2 text-gray-600">
                    <Mail className="h-4 w-4" />
                    {proposal.companies.email}
                  </p>
                )}
                {proposal.companies.phone && (
                  <p className="flex items-center gap-2 text-gray-600">
                    <Phone className="h-4 w-4" />
                    {proposal.companies.phone}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Service Description */}
          {proposal.detailed_description && (
            <div className="bg-white rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                Descrição do Serviço
              </h3>
              <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                {proposal.detailed_description}
              </p>
            </div>
          )}

          {/* Financial Info */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-blue-600" />
              Informações Financeiras
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {proposal.value && (
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">Valor Total</p>
                  <p className="text-4xl font-bold text-blue-600">
                    R$ {proposal.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              )}
              {proposal.delivery_time && (
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">Prazo de Entrega</p>
                  <p className="text-xl font-semibold text-gray-900 flex items-center justify-center gap-2">
                    <Calendar className="h-5 w-5" />
                    {proposal.delivery_time}
                  </p>
                </div>
              )}
            </div>
            {proposal.validity_date && (
              <div className="text-center mt-4 pt-4 border-t border-blue-200">
                <p className="text-sm text-gray-600">
                  Proposta válida até: <span className="font-medium">
                    {format(new Date(proposal.validity_date), 'dd/MM/yyyy', { locale: ptBR })}
                  </span>
                </p>
              </div>
            )}
          </div>

          {/* Observations */}
          {proposal.observations && (
            <div className="bg-white rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Observações Adicionais
              </h3>
              <p className="text-gray-700 whitespace-pre-line">
                {proposal.observations}
              </p>
            </div>
          )}

          {/* Public View Actions */}
          {isPublicView && (
            <div className="text-center pt-6 border-t border-gray-200">
              <button
                onClick={() => window.print()}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 mx-auto"
              >
                <Download className="h-5 w-5" />
                Baixar PDF
              </button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  </div>
);

const ExecutivoTemplate = ({ proposal, isPublicView, companyLogo }: ProposalTemplateProps) => (
  <div className="bg-gray-50 min-h-screen">
    <div className="max-w-4xl mx-auto p-8">
      <Card className="border border-gray-300 shadow-lg">
        <CardHeader className="bg-gray-800 text-white">
          <div className="flex justify-between items-start">
            {companyLogo && (
              <img src={companyLogo} alt="Logo" className="h-16 w-auto bg-white p-2 rounded" />
            )}
            <div className="text-right">
              <Badge variant="outline" className="bg-white text-gray-800 border-white">
                PROPOSTA COMERCIAL
              </Badge>
              <p className="text-gray-300 text-sm mt-1">
                {format(new Date(proposal.created_at), 'dd/MM/yyyy', { locale: ptBR })}
              </p>
            </div>
          </div>
          <CardTitle className="text-2xl font-bold mt-4 uppercase tracking-wide">
            {proposal.title}
          </CardTitle>
        </CardHeader>

        <CardContent className="p-8 space-y-6">
          {/* Executive Summary */}
          <div className="border-l-4 border-gray-600 pl-6">
            <h3 className="text-lg font-bold text-gray-800 uppercase mb-2">Resumo Executivo</h3>
            <p className="text-gray-700">
              {proposal.service_description || 'Proposta comercial detalhada para análise e aprovação.'}
            </p>
          </div>

          {/* Client Information */}
          {proposal.companies && (
            <div className="bg-gray-100 p-6 rounded">
              <h3 className="text-lg font-bold text-gray-800 uppercase mb-4">Informações do Cliente</h3>
              <table className="w-full">
                <tbody>
                  <tr>
                    <td className="font-medium text-gray-700 py-1">Empresa:</td>
                    <td className="text-gray-900 py-1">{proposal.companies.name}</td>
                  </tr>
                  {proposal.companies.email && (
                    <tr>
                      <td className="font-medium text-gray-700 py-1">Email:</td>
                      <td className="text-gray-900 py-1">{proposal.companies.email}</td>
                    </tr>
                  )}
                  {proposal.companies.phone && (
                    <tr>
                      <td className="font-medium text-gray-700 py-1">Telefone:</td>
                      <td className="text-gray-900 py-1">{proposal.companies.phone}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Scope of Work */}
          {proposal.detailed_description && (
            <div>
              <h3 className="text-lg font-bold text-gray-800 uppercase mb-4 border-b border-gray-300 pb-2">
                Escopo do Trabalho
              </h3>
              <div className="text-gray-700 whitespace-pre-line leading-relaxed">
                {proposal.detailed_description}
              </div>
            </div>
          )}

          {/* Investment */}
          <div className="bg-gray-800 text-white p-6 rounded">
            <h3 className="text-lg font-bold uppercase mb-4">Investimento</h3>
            <div className="flex justify-between items-center">
              {proposal.value && (
                <div>
                  <p className="text-gray-300 text-sm">Valor Total</p>
                  <p className="text-3xl font-bold">
                    R$ {proposal.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              )}
              {proposal.delivery_time && (
                <div className="text-right">
                  <p className="text-gray-300 text-sm">Prazo</p>
                  <p className="text-xl font-semibold">{proposal.delivery_time}</p>
                </div>
              )}
            </div>
          </div>

          {/* Terms */}
          {proposal.observations && (
            <div>
              <h3 className="text-lg font-bold text-gray-800 uppercase mb-4 border-b border-gray-300 pb-2">
                Termos e Condições
              </h3>
              <p className="text-gray-700 whitespace-pre-line">
                {proposal.observations}
              </p>
            </div>
          )}

          {/* Validity */}
          {proposal.validity_date && (
            <div className="text-center bg-yellow-50 p-4 rounded border border-yellow-200">
              <p className="text-sm text-gray-700">
                <strong>Esta proposta é válida até:</strong>{' '}
                {format(new Date(proposal.validity_date), 'dd/MM/yyyy', { locale: ptBR })}
              </p>
            </div>
          )}

          {/* Public View Actions */}
          {isPublicView && (
            <div className="text-center pt-6 border-t border-gray-200">
              <button
                onClick={() => window.print()}
                className="bg-gray-800 hover:bg-gray-900 text-white px-6 py-3 rounded flex items-center gap-2 mx-auto"
              >
                <Download className="h-5 w-5" />
                Baixar PDF
              </button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  </div>
);

const CriativoTemplate = ({ proposal, isPublicView, companyLogo }: ProposalTemplateProps) => (
  <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-purple-100 min-h-screen">
    <div className="max-w-4xl mx-auto p-8">
      <Card className="border-2 border-purple-200 shadow-2xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-700 text-white relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full transform translate-x-16 -translate-y-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full transform -translate-x-12 translate-y-12"></div>
          
          <div className="relative z-10">
            <div className="flex justify-between items-start">
              {companyLogo && (
                <img src={companyLogo} alt="Logo" className="h-16 w-auto bg-white p-2 rounded-lg shadow" />
              )}
              <div className="text-right">
                <Badge variant="outline" className="bg-white text-purple-600 border-white">
                  ✨ Proposta Criativa
                </Badge>
                <p className="text-purple-100 text-sm mt-1">
                  {format(new Date(proposal.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                </p>
              </div>
            </div>
            <CardTitle className="text-3xl font-bold mt-4 mb-2">
              {proposal.title}
            </CardTitle>
            {proposal.service_description && (
              <p className="text-purple-100 text-lg">
                {proposal.service_description}
              </p>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-8 space-y-8">
          {/* Client Spotlight */}
          {proposal.companies && (
            <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl p-6 border border-purple-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
                Nosso Cliente
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-sm text-purple-600 font-medium">EMPRESA</p>
                  <p className="font-bold text-gray-900">{proposal.companies.name}</p>
                </div>
                {proposal.companies.email && (
                  <div className="text-center">
                    <p className="text-sm text-purple-600 font-medium">EMAIL</p>
                    <p className="font-medium text-gray-700">{proposal.companies.email}</p>
                  </div>
                )}
                {proposal.companies.phone && (
                  <div className="text-center">
                    <p className="text-sm text-purple-600 font-medium">TELEFONE</p>
                    <p className="font-medium text-gray-700">{proposal.companies.phone}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Creative Description */}
          {proposal.detailed_description && (
            <div className="relative">
              <div className="absolute -left-4 -top-4 w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-50"></div>
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-purple-100">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-purple-600" />
                  Nossa Proposta Criativa
                </h3>
                <div className="prose max-w-none">
                  <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                    {proposal.detailed_description}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Investment Card */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white opacity-10 rounded-full transform translate-x-20 -translate-y-20"></div>
            <div className="relative z-10">
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <DollarSign className="h-6 w-6" />
                Investimento
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {proposal.value && (
                  <div className="text-center">
                    <p className="text-purple-200 mb-2">Valor Total</p>
                    <p className="text-5xl font-bold">
                      R$ {proposal.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                )}
                {proposal.delivery_time && (
                  <div className="text-center">
                    <p className="text-purple-200 mb-2">Prazo</p>
                    <p className="text-2xl font-bold flex items-center justify-center gap-2">
                      <Calendar className="h-6 w-6" />
                      {proposal.delivery_time}
                    </p>
                  </div>
                )}
              </div>
              {proposal.validity_date && (
                <div className="text-center mt-6 pt-6 border-t border-purple-300">
                  <p className="text-purple-100">
                    Válida até {format(new Date(proposal.validity_date), 'dd/MM/yyyy', { locale: ptBR })}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          {proposal.observations && (
            <div className="bg-pink-50 rounded-2xl p-6 border border-pink-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                💡 Observações Importantes
              </h3>
              <p className="text-gray-700 whitespace-pre-line">
                {proposal.observations}
              </p>
            </div>
          )}

          {/* Public View Actions */}
          {isPublicView && (
            <div className="text-center pt-6">
              <button
                onClick={() => window.print()}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 rounded-full flex items-center gap-2 mx-auto font-bold text-lg shadow-lg transform hover:scale-105 transition-all"
              >
                <Download className="h-6 w-6" />
                Baixar PDF
              </button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  </div>
);

export { ModernoTemplate, ExecutivoTemplate, CriativoTemplate };
