
-- Atualizar dados existentes das empresas para usar os novos segmentos
UPDATE public.companies 
SET business_segment = CASE business_segment
  WHEN 'Reformas e Construção' THEN 'Engenharia e Construção'
  WHEN 'Serviços Elétricos' THEN 'Engenharia e Construção'
  WHEN 'Serviços Hidráulicos' THEN 'Engenharia e Construção'
  WHEN 'Refrigeração e Climatização' THEN 'Engenharia e Construção'
  WHEN 'Eventos' THEN 'Serviços Profissionais'
  WHEN 'Marketing e Design' THEN 'Marketing Digital'
  WHEN 'Limpeza' THEN 'Serviços Profissionais'
  WHEN 'Transporte' THEN 'Serviços Profissionais'
  WHEN 'Consultoria' THEN 'Consultoria Empresarial'
  WHEN 'Saúde e Bem-estar' THEN 'Saúde e Bem-estar'
  WHEN 'Tecnologia' THEN 'Tecnologia da Informação'
  ELSE business_segment
END
WHERE business_segment IS NOT NULL;

-- Adicionar nova coluna para business_type_detail se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'companies' 
                   AND column_name = 'business_type_detail' 
                   AND table_schema = 'public') THEN
        ALTER TABLE public.companies ADD COLUMN business_type_detail TEXT;
    END IF;
END $$;

-- Atualizar business_type_detail baseado no business_type antigo
UPDATE public.companies 
SET business_type_detail = CASE business_type
  WHEN 'Reforma Residencial' THEN 'Projetos'
  WHEN 'Reforma Comercial' THEN 'Projetos'
  WHEN 'Construção Civil' THEN 'Projetos'
  WHEN 'Pintura' THEN 'Projetos'
  WHEN 'Marcenaria / Móveis Sob Medida' THEN 'Projetos'
  WHEN 'Instalação Elétrica' THEN 'Projetos'
  WHEN 'Manutenção Elétrica' THEN 'Projetos'
  WHEN 'Instalação de Iluminação' THEN 'Projetos'
  WHEN 'Quadros e Disjuntores' THEN 'Projetos'
  WHEN 'Automação Residencial' THEN 'Projetos'
  WHEN 'Encanamento' THEN 'Projetos'
  WHEN 'Desentupimento' THEN 'Projetos'
  WHEN 'Manutenção Hidráulica' THEN 'Projetos'
  WHEN 'Instalação de Aquecedores' THEN 'Projetos'
  WHEN 'Bombas e Caixas d\'Água' THEN 'Projetos'
  WHEN 'Instalação de Ar-condicionado' THEN 'Projetos'
  WHEN 'Manutenção de Ar-condicionado' THEN 'Projetos'
  WHEN 'Higienização de Ar-condicionado' THEN 'Projetos'
  WHEN 'Instalação de Climatizadores' THEN 'Projetos'
  WHEN 'Refrigeração Comercial' THEN 'Projetos'
  WHEN 'Buffet' THEN 'Jurídico'
  WHEN 'Decoração' THEN 'Jurídico'
  WHEN 'Locação de Estruturas' THEN 'Jurídico'
  WHEN 'Fotografia e Filmagem' THEN 'Jurídico'
  WHEN 'Som e Iluminação' THEN 'Jurídico'
  WHEN 'Identidade Visual' THEN 'SEO/SEM'
  WHEN 'Redes Sociais' THEN 'Redes Sociais'
  WHEN 'Sites / Landing Pages' THEN 'SEO/SEM'
  WHEN 'Anúncios Online' THEN 'Gestão de Tráfego'
  WHEN 'Edição de Vídeo' THEN 'SEO/SEM'
  WHEN 'Limpeza Residencial' THEN 'Jurídico'
  WHEN 'Limpeza Comercial' THEN 'Jurídico'
  WHEN 'Limpeza Pós-Obra' THEN 'Jurídico'
  WHEN 'Vidros e Fachadas' THEN 'Jurídico'
  WHEN 'Jardinagem' THEN 'Jurídico'
  WHEN 'Mudanças' THEN 'Jurídico'
  WHEN 'Cargas Leves' THEN 'Jurídico'
  WHEN 'Entregas Rápidas' THEN 'Jurídico'
  WHEN 'Transporte Comercial' THEN 'Jurídico'
  WHEN 'Transporte Interestadual' THEN 'Jurídico'
  WHEN 'Empresarial' THEN 'Estratégia'
  WHEN 'Financeira' THEN 'Estratégia'
  WHEN 'Marketing e Vendas' THEN 'Vendas'
  WHEN 'Estratégica' THEN 'Estratégia'
  WHEN 'Treinamentos' THEN 'Estratégia'
  WHEN 'Personal Trainer' THEN 'Personal Training'
  WHEN 'Fisioterapia' THEN 'Terapias'
  WHEN 'Estética' THEN 'Terapias'
  WHEN 'Massoterapia' THEN 'Terapias'
  WHEN 'Nutrição' THEN 'Consultoria Nutricional'
  WHEN 'Suporte Técnico' THEN 'Suporte Técnico'
  WHEN 'Redes e Wi-Fi' THEN 'Suporte Técnico'
  WHEN 'Desenvolvimento Web' THEN 'Desenvolvimento Web'
  WHEN 'Segurança Digital' THEN 'Software Personalizado'
  WHEN 'Instalação de Servidores' THEN 'Suporte Técnico'
  ELSE 'Desenvolvimento Web'
END
WHERE business_type IS NOT NULL;
