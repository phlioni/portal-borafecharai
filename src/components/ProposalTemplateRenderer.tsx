
import React from 'react';
import { useCustomTemplates } from '@/hooks/useCustomTemplates';

interface ProposalTemplateRendererProps {
  templateId: string;
  proposal: any;
  company: any;
}

const ProposalTemplateRenderer: React.FC<ProposalTemplateRendererProps> = ({
  templateId,
  proposal,
  company
}) => {
  const { getTemplateById } = useCustomTemplates();
  
  // Verificar se é um template personalizado
  const customTemplate = getTemplateById(templateId);
  
  if (customTemplate) {
    // Renderizar template personalizado
    const renderCustomTemplate = () => {
      let html = customTemplate.html_content;
      
      // Substituir variáveis básicas
      const variables = {
        'title': proposal.title || '',
        'service_description': proposal.service_description || '',
        'detailed_description': proposal.detailed_description || '',
        'value': proposal.value || '',
        'delivery_time': proposal.delivery_time || '',
        'validity_date': proposal.validity_date || '',
        'observations': proposal.observations || '',
        'company.name': company?.name || '',
        'company.email': company?.email || '',
        'company.phone': company?.phone || '',
        'company.logo_url': company?.logo_url || '',
        'company.address': company?.address || '',
        'company.city': company?.city || '',
        'company.state': company?.state || '',
        'company.zip_code': company?.zip_code || '',
        'company.website': company?.website || '',
        'company.description': company?.description || ''
      };

      // Substituir variáveis simples
      Object.entries(variables).forEach(([key, value]) => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        html = html.replace(regex, value);
      });

      // Substituir condicionais simples
      html = html.replace(/{{#if\s+([^}]+)}}(.*?){{\/if}}/gs, (match, condition, content) => {
        const value = variables[condition as keyof typeof variables];
        return value ? content : '';
      });

      return html;
    };

    return (
      <div
        className="proposal-template-custom"
        dangerouslySetInnerHTML={{ __html: renderCustomTemplate() }}
      />
    );
  }

  // Renderizar templates padrão
  const renderDefaultTemplate = () => {
    const baseStyles: React.CSSProperties = {
      fontFamily: "'Arial', sans-serif",
      lineHeight: '1.6',
      color: '#333',
      maxWidth: '800px',
      margin: '0 auto',
      padding: '20px'
    };
    
    switch (templateId) {
      case 'moderno':
        return (
          <div style={baseStyles}>
            <div style={{ textAlign: 'center', marginBottom: '40px', borderBottom: '2px solid #3b82f6', paddingBottom: '20px' }}>
              {company?.logo_url && (
                <img 
                  src={company.logo_url} 
                  alt={company.name} 
                  style={{ maxWidth: '200px', marginBottom: '20px' }}
                />
              )}
              <h1 style={{ color: '#3b82f6', marginBottom: '10px' }}>Proposta Comercial</h1>
              <h2 style={{ color: '#64748b' }}>{proposal.title}</h2>
            </div>
            
            <div style={{ marginBottom: '30px' }}>
              <h3 style={{ color: '#3b82f6', borderBottom: '1px solid #e2e8f0', paddingBottom: '5px' }}>
                Descrição do Serviço
              </h3>
              <p>{proposal.service_description}</p>
            </div>
            
            <div style={{ marginBottom: '30px' }}>
              <h3 style={{ color: '#3b82f6', borderBottom: '1px solid #e2e8f0', paddingBottom: '5px' }}>
                Detalhes
              </h3>
              <p>{proposal.detailed_description}</p>
            </div>
            
            <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '8px', marginBottom: '30px' }}>
              <h3 style={{ color: '#3b82f6', marginBottom: '15px' }}>Informações Comerciais</h3>
              <p><strong>Valor:</strong> {proposal.value ? `R$ ${proposal.value}` : 'A definir'}</p>
              <p><strong>Prazo de Entrega:</strong> {proposal.delivery_time}</p>
              <p><strong>Validade:</strong> {proposal.validity_date}</p>
            </div>
            
            {proposal.observations && (
              <div style={{ marginBottom: '30px' }}>
                <h3 style={{ color: '#3b82f6', borderBottom: '1px solid #e2e8f0', paddingBottom: '5px' }}>
                  Observações
                </h3>
                <p>{proposal.observations}</p>
              </div>
            )}
            
            <div style={{ textAlign: 'center', marginTop: '40px', padding: '20px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
              <h4 style={{ color: '#3b82f6', marginBottom: '10px' }}>{company?.name}</h4>
              <p style={{ margin: '5px 0' }}>{company?.email} | {company?.phone}</p>
              {company?.website && <p style={{ margin: '5px 0' }}>{company.website}</p>}
            </div>
          </div>
        );
      
      case 'classico':
        return (
          <div style={baseStyles}>
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
              {company?.logo_url && (
                <img 
                  src={company.logo_url} 
                  alt={company.name} 
                  style={{ maxWidth: '200px', marginBottom: '20px' }}
                />
              )}
              <h1 style={{ color: '#1f2937', marginBottom: '10px' }}>PROPOSTA COMERCIAL</h1>
              <h2 style={{ color: '#4b5563', borderBottom: '2px solid #1f2937', paddingBottom: '10px' }}>
                {proposal.title}
              </h2>
            </div>
            
            <div style={{ marginBottom: '30px' }}>
              <h3 style={{ color: '#1f2937', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Descrição do Serviço
              </h3>
              <p>{proposal.service_description}</p>
            </div>
            
            <div style={{ marginBottom: '30px' }}>
              <h3 style={{ color: '#1f2937', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Detalhes
              </h3>
              <p>{proposal.detailed_description}</p>
            </div>
            
            <div style={{ border: '2px solid #1f2937', padding: '20px', marginBottom: '30px' }}>
              <h3 style={{ color: '#1f2937', marginBottom: '15px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Informações Comerciais
              </h3>
              <p><strong>Valor:</strong> {proposal.value ? `R$ ${proposal.value}` : 'A definir'}</p>
              <p><strong>Prazo de Entrega:</strong> {proposal.delivery_time}</p>
              <p><strong>Validade:</strong> {proposal.validity_date}</p>
            </div>
            
            {proposal.observations && (
              <div style={{ marginBottom: '30px' }}>
                <h3 style={{ color: '#1f2937', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  Observações
                </h3>
                <p>{proposal.observations}</p>
              </div>
            )}
            
            <div style={{ textAlign: 'center', marginTop: '40px', border: '1px solid #1f2937', padding: '20px' }}>
              <h4 style={{ color: '#1f2937', marginBottom: '10px' }}>{company?.name}</h4>
              <p style={{ margin: '5px 0' }}>{company?.email} | {company?.phone}</p>
              {company?.website && <p style={{ margin: '5px 0' }}>{company.website}</p>}
            </div>
          </div>
        );
      
      case 'minimalista':
        return (
          <div style={{ ...baseStyles, maxWidth: '600px', padding: '10px' }}>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              {company?.logo_url && (
                <img
                  src={company.logo_url}
                  alt={company.name}
                  style={{ maxWidth: '150px', marginBottom: '10px' }}
                />
              )}
              <h1 style={{ color: '#4a5568', marginBottom: '5px', fontSize: '1.5em' }}>{proposal.title}</h1>
            </div>
        
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ color: '#718096', fontSize: '1.1em', marginBottom: '5px' }}>Descrição</h3>
              <p style={{ color: '#4a5568', fontSize: '0.9em' }}>{proposal.service_description}</p>
            </div>
        
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ color: '#718096', fontSize: '1.1em', marginBottom: '5px' }}>Detalhes</h3>
              <p style={{ color: '#4a5568', fontSize: '0.9em' }}>{proposal.detailed_description}</p>
            </div>
        
            <div style={{ marginBottom: '20px', borderTop: '1px solid #e2e8f0', paddingTop: '10px' }}>
              <p style={{ color: '#718096', fontSize: '0.8em' }}>
                Valor: <span style={{ color: '#4a5568' }}>{proposal.value ? `R$ ${proposal.value}` : 'A definir'}</span>
              </p>
              <p style={{ color: '#718096', fontSize: '0.8em' }}>
                Prazo: <span style={{ color: '#4a5568' }}>{proposal.delivery_time}</span>
              </p>
              <p style={{ color: '#718096', fontSize: '0.8em' }}>
                Validade: <span style={{ color: '#4a5568' }}>{proposal.validity_date}</span>
              </p>
            </div>
        
            {proposal.observations && (
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ color: '#718096', fontSize: '1.1em', marginBottom: '5px' }}>Observações</h3>
                <p style={{ color: '#4a5568', fontSize: '0.9em' }}>{proposal.observations}</p>
              </div>
            )}
        
            <div style={{ textAlign: 'center', marginTop: '20px', borderTop: '1px solid #e2e8f0', paddingTop: '10px' }}>
              <p style={{ color: '#4a5568', fontSize: '0.8em' }}>{company?.name}</p>
              <p style={{ color: '#4a5568', fontSize: '0.8em' }}>{company?.email} | {company?.phone}</p>
            </div>
          </div>
        );
      
      case 'corporativo':
        return (
          <div style={{ ...baseStyles, maxWidth: '700px', border: '1px solid #cbd5e0', padding: '30px' }}>
            <div style={{ textAlign: 'left', marginBottom: '30px' }}>
              {company?.logo_url && (
                <img
                  src={company.logo_url}
                  alt={company.name}
                  style={{ maxWidth: '180px', marginBottom: '15px' }}
                />
              )}
              <h1 style={{ color: '#2d3748', marginBottom: '8px', fontSize: '1.8em' }}>Proposta de Serviços</h1>
              <h2 style={{ color: '#4a5568', fontSize: '1.3em' }}>{proposal.title}</h2>
            </div>
        
            <div style={{ marginBottom: '25px' }}>
              <h3 style={{ color: '#4a5568', fontSize: '1.2em', borderBottom: '2px solid #e2e8f0', paddingBottom: '5px' }}>
                Apresentação
              </h3>
              <p style={{ color: '#4a5568' }}>{proposal.service_description}</p>
            </div>
        
            <div style={{ marginBottom: '25px' }}>
              <h3 style={{ color: '#4a5568', fontSize: '1.2em', borderBottom: '2px solid #e2e8f0', paddingBottom: '5px' }}>
                Especificações
              </h3>
              <p style={{ color: '#4a5568' }}>{proposal.detailed_description}</p>
            </div>
        
            <div style={{ borderTop: '2px solid #e2e8f0', paddingTop: '20px', marginBottom: '25px' }}>
              <p style={{ color: '#718096', fontSize: '1em' }}>
                Investimento: <span style={{ color: '#4a5568' }}>{proposal.value ? `R$ ${proposal.value}` : 'A combinar'}</span>
              </p>
              <p style={{ color: '#718096', fontSize: '1em' }}>
                Entrega: <span style={{ color: '#4a5568' }}>{proposal.delivery_time}</span>
              </p>
              <p style={{ color: '#718096', fontSize: '1em' }}>
                Validade: <span style={{ color: '#4a5568' }}>{proposal.validity_date}</span>
              </p>
            </div>
        
            {proposal.observations && (
              <div style={{ marginBottom: '25px' }}>
                <h3 style={{ color: '#4a5568', fontSize: '1.2em', borderBottom: '2px solid #e2e8f0', paddingBottom: '5px' }}>
                  Notas
                </h3>
                <p style={{ color: '#4a5568' }}>{proposal.observations}</p>
              </div>
            )}
        
            <div style={{ textAlign: 'center', marginTop: '30px', borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
              <p style={{ color: '#4a5568', fontSize: '1em' }}>{company?.name}</p>
              <p style={{ color: '#4a5568', fontSize: '1em' }}>{company?.email} | {company?.phone}</p>
              {company?.website && <p style={{ color: '#4a5568', fontSize: '1em' }}>{company.website}</p>}
            </div>
          </div>
        );
      
      default:
        return renderDefaultTemplate();
    }
  };

  return (
    <div className="proposal-template">
      {renderDefaultTemplate()}
    </div>
  );
};

export default ProposalTemplateRenderer;
