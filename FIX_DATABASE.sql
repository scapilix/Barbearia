-- Copie todo este texto e cole no SQL Editor do Supabase, depois clique em RUN.

ALTER TABLE public.bookings DROP CONSTRAINT IF EXISTS fk_client;
ALTER TABLE public.bookings DROP CONSTRAINT IF EXISTS fk_service;
ALTER TABLE public.bookings DROP CONSTRAINT IF EXISTS fk_team;
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS fk_orders_team;

ALTER TABLE public.bookings
  ADD CONSTRAINT fk_client FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE SET NULL,
  ADD CONSTRAINT fk_service FOREIGN KEY (service_id) REFERENCES public.services(id) ON DELETE SET NULL,
  ADD CONSTRAINT fk_team FOREIGN KEY (team_member_id) REFERENCES public.team_members(id) ON DELETE SET NULL;
  
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS team_member_id UUID;

ALTER TABLE public.orders 
  ADD CONSTRAINT fk_orders_team FOREIGN KEY (team_member_id) REFERENCES public.team_members(id) ON DELETE SET NULL;

NOTIFY pgrst, 'reload schema';
