-- ==========================================
-- FASE 6: SUPER ADMIN PRO MAX (SCHEMA V2)
-- Tabelas Principais, Políticas e Storage
-- ==========================================

-- 1. TABELA DE SERVIÇOS
CREATE TABLE IF NOT EXISTS public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT DEFAULT 'Nails',
  duration INTEGER NOT NULL DEFAULT 60, -- duração em minutos
  price NUMERIC NOT NULL DEFAULT 0,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. TABELA DA EQUIPA
CREATE TABLE IF NOT EXISTS public.team (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  photo_url TEXT,
  email TEXT,
  phone TEXT,
  commission_rate NUMERIC DEFAULT 0, -- percentagem de comissão (ex: 30 = 30%)
  details TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. TABELA DE AGENDAMENTOS
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  service_id UUID REFERENCES public.services(id) ON DELETE CASCADE,
  team_member_id UUID REFERENCES public.team(id) ON DELETE SET NULL,
  booking_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT DEFAULT 'pendente', -- pendente, em_andamento, concluido, cancelado
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. ATUALIZAR TABELAS EXISTENTES (Photos e Recibos)
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS photo_url TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS receipt_url TEXT;
ALTER TABLE public.expenses ADD COLUMN IF NOT EXISTS receipt_url TEXT;

-- ==========================================
-- STORAGE BUCKETS (Fotos e Comprovativos)
-- ==========================================

-- Inserir um Bucket Público (Se falhar porque já existe, ignora)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('premium_salon_media', 'premium_salon_media', true)
ON CONFLICT (id) DO NOTHING;

-- Configurar Políticas de Storage para o Bucket (Permitir tudo para IPs anon/authenticated - simplificado)
CREATE POLICY "Public Access" 
  ON storage.objects FOR SELECT 
  USING ( bucket_id = 'premium_salon_media' );

CREATE POLICY "Allow Uploads" 
  ON storage.objects FOR INSERT 
  WITH CHECK ( bucket_id = 'premium_salon_media' );

CREATE POLICY "Allow Updates" 
  ON storage.objects FOR UPDATE 
  USING ( bucket_id = 'premium_salon_media' );

CREATE POLICY "Allow Deletes" 
  ON storage.objects FOR DELETE 
  USING ( bucket_id = 'premium_salon_media' );

-- ==========================================
-- DADOS DE EXEMPLO (SEED DATA)
-- ==========================================

-- Serviços
INSERT INTO public.services (name, category, duration, price, description) VALUES
  ('Manicure Russa + Gel', 'Nails', 90, 45.00, 'Técnica impecável de cuticulagem profunda e alinhamento de gel.'),
  ('Pedicure SPA', 'Feet', 60, 35.00, 'Banho de imersão, esfoliação e hidratação profunda.'),
  ('Manutenção Acrílico', 'Nails', 120, 40.00, 'Refill de acrílico com tratamento e cor/nail art básica.'),
  ('Verniz Gel', 'Nails', 45, 20.00, 'Estética perfeita com durabilidade até 3 semanas.')
ON CONFLICT DO NOTHING;

-- Equipa
INSERT INTO public.team (name, role, commission_rate, details) VALUES
  ('Diana', 'Nail Artist (Fundadora)', 100, 'Especialista em Nail Art Avançada e formatos extremos.'),
  ('Leticia Silva', 'Gestora & Manicure', 40, 'Especialista em tratamentos SPA e verniz gel clássico.'),
  ('Rita Costa', 'Técnica de Acrílico', 50, 'Dominio exímio em alongamentos e unhas roídas.')
ON CONFLICT DO NOTHING;
