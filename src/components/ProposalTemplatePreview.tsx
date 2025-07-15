
import React from 'react';

interface ProposalData {
  title?: string;
  client?: string;
  value?: number;
  deliveryTime?: string;
  description?: string;
  template?: string;
}

interface ProposalTemplatePreviewProps {
  data: ProposalData;
}

const ProposalTemplatePreview: React.FC<ProposalTemplatePreviewProps> = ({ data }) => {
  const formatCurrency = (value?: number) => {
    if (!value) return 'A combinar';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const renderDescription = (description?: string) => {
    if (!description) return <p>Descrição do serviço</p>;
    
    // Se contém tags HTML, renderizar como HTML
    if (description.includes('<') && description.includes('>')) {
      return (
        <div 
          dangerouslySetInnerHTML={{ __html: description }}
          className="prose prose-sm max-w-none"
        />
      );
    }
    
    // Se não contém HTML, renderizar como texto simples com quebras de linha
    return (
      <div className="whitespace-pre-wrap">
        {description}
      </div>
    );
  };

  const getTemplateStyles = () => {
    switch (data.template) {
      case 'executivo':
        return {
          container: 'bg-gray-50 border-gray-300',
          header: 'bg-gray-800 text-white',
          accent: 'text-gray-800',
          section: 'bg-white border-gray-200'
        };
      case 'criativo':
        return {
          container: 'bg-purple-50 border-purple-300',
          header: 'bg-purple-600 text-white',
          accent: 'text-purple-600',
          section: 'bg-white border-purple-200'
        };
      default: // moderno
        return {
          container: 'bg-blue-50 border-blue-300',
          header: 'bg-blue-600 text-white',
          accent: 'text-blue-600',
          section: 'bg-white border-blue-200'
        };
    }
  };

  const styles = getTemplateStyles();

  return (
    <div className={`max-w-4xl mx-auto border-2 rounded-lg overflow-hidden ${styles.container}`}>
      {/* Header */}
      <div className={`p-6 ${styles.header}`}>
        <h1 className="text-2xl font-bold mb-2">
          {data.title || 'Proposta Comercial'}
        </h1>
        <p className="opacity-90">
          Cliente: {data.client || 'Nome do Cliente'}
        </p>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Descrição do Serviço */}
        <div className={`p-4 rounded-lg border ${styles.section}`}>
          <h2 className={`text-lg font-semibold mb-3 ${styles.accent}`}>
            Descrição do Serviço
          </h2>
          {renderDescription(data.description)}
        </div>

        {/* Informações Comerciais */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className={`p-4 rounded-lg border ${styles.section}`}>
            <h3 className={`font-semibold mb-2 ${styles.accent}`}>
              Valor do Investimento
            </h3>
            <p className="text-2xl font-bold">
              {formatCurrency(data.value)}
            </p>
          </div>

          <div className={`p-4 rounded-lg border ${styles.section}`}>
            <h3 className={`font-semibold mb-2 ${styles.accent}`}>
              Prazo de Entrega
            </h3>
            <p className="text-lg">
              {data.deliveryTime || 'A definir'}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className={`text-center p-4 rounded-lg border ${styles.section}`}>
          <p className="text-sm text-gray-600">
            Proposta gerada automaticamente • {new Date().toLocaleDateString('pt-BR')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProposalTemplatePreview;
