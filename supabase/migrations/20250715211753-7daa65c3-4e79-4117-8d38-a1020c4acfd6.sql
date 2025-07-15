
-- Criar tabela para itens do orçamento
CREATE TABLE public.proposal_budget_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  proposal_id UUID NOT NULL REFERENCES public.proposals(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('material', 'labor')), -- material ou mão de obra
  description TEXT NOT NULL,
  quantity DECIMAL(10,2) NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  total_price DECIMAL(10,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Adicionar RLS
ALTER TABLE public.proposal_budget_items ENABLE ROW LEVEL SECURITY;

-- Política para permitir que usuários vejam itens de suas próprias propostas
CREATE POLICY "Users can view budget items of their own proposals" 
  ON public.proposal_budget_items 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.proposals 
      WHERE proposals.id = proposal_budget_items.proposal_id 
      AND proposals.user_id = auth.uid()
    )
  );

-- Política para permitir que usuários criem itens em suas próprias propostas
CREATE POLICY "Users can create budget items for their own proposals" 
  ON public.proposal_budget_items 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.proposals 
      WHERE proposals.id = proposal_budget_items.proposal_id 
      AND proposals.user_id = auth.uid()
    )
  );

-- Política para permitir que usuários atualizem itens de suas próprias propostas
CREATE POLICY "Users can update budget items of their own proposals" 
  ON public.proposal_budget_items 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.proposals 
      WHERE proposals.id = proposal_budget_items.proposal_id 
      AND proposals.user_id = auth.uid()
    )
  );

-- Política para permitir que usuários deletem itens de suas próprias propostas
CREATE POLICY "Users can delete budget items of their own proposals" 
  ON public.proposal_budget_items 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.proposals 
      WHERE proposals.id = proposal_budget_items.proposal_id 
      AND proposals.user_id = auth.uid()
    )
  );

-- Política para acesso público via public_hash
CREATE POLICY "Public access to budget items via proposal public_hash" 
  ON public.proposal_budget_items 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.proposals 
      WHERE proposals.id = proposal_budget_items.proposal_id 
      AND proposals.public_hash IS NOT NULL
    )
  );

-- Trigger para atualizar updated_at
CREATE TRIGGER update_proposal_budget_items_updated_at
  BEFORE UPDATE ON public.proposal_budget_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
