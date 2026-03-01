-- ========================================
-- EXECUTAR NO SUPABASE SQL EDITOR
-- Cria as tabelas em falta + insere dados
-- ========================================

-- 1. TABELA TEAM_MEMBERS (profissionais)
CREATE TABLE IF NOT EXISTS public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT,
  phone TEXT,
  email TEXT,
  commission_rate NUMERIC DEFAULT 0,
  photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. TABELA SETTINGS (configurações do salão)
CREATE TABLE IF NOT EXISTS public.settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  salon_name TEXT DEFAULT 'TO Barber',
  phone TEXT,
  email TEXT,
  address TEXT,
  opening_hours TEXT DEFAULT '09:00 - 20:00',
  days_open TEXT DEFAULT 'Segunda a Sábado',
  slot_duration INTEGER DEFAULT 15,
  allow_online_booking BOOLEAN DEFAULT true,
  auto_confirm_booking BOOLEAN DEFAULT false,
  send_sms_reminder BOOLEAN DEFAULT true,
  reminder_hours_before INTEGER DEFAULT 24,
  max_advance_days INTEGER DEFAULT 30,
  primary_color TEXT DEFAULT '#B48228',
  currency TEXT DEFAULT 'EUR',
  timezone TEXT DEFAULT 'Europe/Lisbon',
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. RLS - permitir acesso
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all" ON public.team_members;
CREATE POLICY "Allow all" ON public.team_members FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all" ON public.settings;
CREATE POLICY "Allow all" ON public.settings FOR ALL USING (true) WITH CHECK (true);

-- 4. LIMPAR E INSERIR 3 PROFISSIONAIS
DELETE FROM public.team_members;

INSERT INTO public.team_members (name, role, phone, email, commission_rate, photo_url) VALUES
(
  'William',
  'Mestre Barbeiro',
  '+351 912 345 678',
  'william@tobarber.pt',
  50,
  'https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=400&auto=format&fit=crop'
),
(
  'Rodrigo',
  'Barbeiro Sênior',
  '+351 923 456 789',
  'rodrigo@tobarber.pt',
  45,
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=400&auto=format&fit=crop'
),
(
  'Francisco',
  'Barbeiro',
  '+351 934 567 890',
  'francisco@tobarber.pt',
  40,
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop'
);

-- 5. INSERIR DEFINIÇÕES DO SALÃO
INSERT INTO public.settings (id, salon_name, phone, email, address, primary_color)
VALUES (1, 'TO Barber', '+351 912 345 678', 'info@tobarber.pt', 'Rua do Corte 123, Lisboa', '#B48228')
ON CONFLICT (id) DO NOTHING;
