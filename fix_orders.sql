-- 2. INTEGRAÇÃO: Ligar as Comandas aos Profissionais
-- Este script adiciona a coluna team_member_id à tabela orders (Comandas) e estabelece a relação,
-- o que permite que o site feche uma comanda e deposite automaticamente a comissão do barbeiro.

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS team_member_id UUID;

ALTER TABLE public.orders
  ADD CONSTRAINT fk_orders_team FOREIGN KEY (team_member_id) REFERENCES public.team_members(id) ON DELETE SET NULL;

-- Atualizar cache do postgREST novamente
NOTIFY pgrst, 'reload schema';
