-- 1. CORREÇÃO DA AGENDA: Adicionar chaves estrangeiras que faltam
-- O painel de Agendamentos falha a ler os nomes da equipa e clientes porque o Supabase não percebia a relação.
ALTER TABLE public.bookings
  ADD CONSTRAINT fk_client FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE SET NULL,
  ADD CONSTRAINT fk_service FOREIGN KEY (service_id) REFERENCES public.services(id) ON DELETE SET NULL,
  ADD CONSTRAINT fk_team FOREIGN KEY (team_member_id) REFERENCES public.team_members(id) ON DELETE SET NULL;

-- Atualizar a cache do PostgREST para o painel assumir as mudanças imediatamente
NOTIFY pgrst, 'reload schema';
