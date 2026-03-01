-- =============================================
-- ATUALIZAÇÃO DA BASE DE DADOS: LOGIN & CORES DA AGENDA
-- Execute este script no SQL Editor do Supabase
-- =============================================

-- 1. Adicionar colunas à tabela team_members
ALTER TABLE public.team_members ADD COLUMN IF NOT EXISTS access_level TEXT DEFAULT 'employee';
ALTER TABLE public.team_members ADD COLUMN IF NOT EXISTS pin_code TEXT;
ALTER TABLE public.team_members ADD COLUMN IF NOT EXISTS color TEXT DEFAULT '#3B82F6';

-- 2. Configurar a Leticia como Admin por defeito e dar cores e pins aos outros
UPDATE public.team_members SET access_level = 'admin', pin_code = '1234', color = '#7C3AED' WHERE name ILIKE '%Leticia%';
UPDATE public.team_members SET access_level = 'employee', pin_code = '0000', color = '#10B981' WHERE name ILIKE '%Ana%';
UPDATE public.team_members SET access_level = 'employee', pin_code = '1111', color = '#F59E0B' WHERE name ILIKE '%Carla%';

-- Caso a Leticia não exista, garantir que há pelo menos um admin
INSERT INTO public.team_members (name, role, access_level, pin_code, color)
SELECT 'Administrador', 'Gerência', 'admin', '1234', '#7C3AED'
WHERE NOT EXISTS (SELECT 1 FROM public.team_members WHERE access_level = 'admin');
