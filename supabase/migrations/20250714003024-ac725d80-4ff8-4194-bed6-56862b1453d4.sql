-- Configurar autenticação para permitir criação de usuários sem confirmação em desenvolvimento
-- Observação: Esta é uma configuração temporária para contornar o rate limit de emails

-- Esta migração não altera a estrutura do banco, apenas documenta a necessidade
-- de configurar a autenticação no painel do Supabase para desabilitar temporariamente
-- a confirmação de email durante o desenvolvimento

SELECT 'Migration complete - Configure auth settings in Supabase dashboard' as message;