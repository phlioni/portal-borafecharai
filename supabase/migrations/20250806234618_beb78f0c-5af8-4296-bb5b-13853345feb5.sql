-- Criar edge function para envio de email quando status de ordem de serviço mudar
CREATE OR REPLACE FUNCTION send_order_status_email()
RETURNS TRIGGER AS $$
DECLARE
  client_email TEXT;
  proposal_data RECORD;
  company_data RECORD;
BEGIN
  -- Buscar dados do cliente, proposta e empresa
  SELECT 
    c.email as client_email,
    p.title as proposal_title,
    co.name as company_name,
    co.email as company_email
  INTO client_email, proposal_data, company_data
  FROM service_orders so
  JOIN proposals p ON p.id = so.proposal_id
  LEFT JOIN clients c ON c.id = so.client_id
  LEFT JOIN companies co ON co.user_id = so.user_id
  WHERE so.id = NEW.id;
  
  -- Enviar email apenas se houver mudança de status e email do cliente
  IF OLD.status != NEW.status AND client_email IS NOT NULL THEN
    -- Chamar edge function para envio de email
    PERFORM
      net.http_post(
        url := 'https://pakrraqbjbkkbdnwkkbt.supabase.co/functions/v1/send-order-confirmation',
        headers := '{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('app.jwt_secret', true) || '"}'::jsonb,
        body := json_build_object(
          'orderId', NEW.id,
          'clientEmail', client_email,
          'providerName', COALESCE(company_data.company_name, 'Prestador de Serviços'),
          'scheduledDate', NEW.scheduled_date,
          'scheduledTime', NEW.scheduled_time,
          'status', NEW.status,
          'proposalTitle', proposal_data.proposal_title
        )::text
      );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;