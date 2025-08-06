-- Adicionar coluna para número de clientes por dia na tabela service_availability
ALTER TABLE public.service_availability 
ADD COLUMN clients_per_day INTEGER DEFAULT 1 NOT NULL;

-- Comentário sobre a coluna
COMMENT ON COLUMN public.service_availability.clients_per_day IS 'Número máximo de clientes que podem ser atendidos por dia neste horário';

-- Adicionar índice para melhor performance
CREATE INDEX idx_service_availability_user_day ON public.service_availability(user_id, day_of_week);