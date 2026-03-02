-- ==========================================
-- FASE 6: SUPER ADMIN PRO MAX (SCHEMA V2)
-- Tabelas Principais, Políticas e Storage
-- ==========================================

-- 1. TABELA DE SERVIÇOS
CREATE TABLE IF NOT EXISTS public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT DEFAULT 'Cabelo',
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
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access" 
  ON storage.objects FOR SELECT 
  USING ( bucket_id = 'premium_salon_media' );

DROP POLICY IF EXISTS "Allow Uploads" ON storage.objects;
CREATE POLICY "Allow Uploads" 
  ON storage.objects FOR INSERT 
  WITH CHECK ( bucket_id = 'premium_salon_media' );

DROP POLICY IF EXISTS "Allow Updates" ON storage.objects;
CREATE POLICY "Allow Updates" 
  ON storage.objects FOR UPDATE 
  USING ( bucket_id = 'premium_salon_media' );

DROP POLICY IF EXISTS "Allow Deletes" ON storage.objects;
CREATE POLICY "Allow Deletes" 
  ON storage.objects FOR DELETE 
  USING ( bucket_id = 'premium_salon_media' );

-- ==========================================
-- DADOS DE EXEMPLO (SEED DATA)
-- ==========================================

-- Serviços
INSERT INTO public.services (name, category, duration, price, description) VALUES
  ('Corte Clássico', 'Cabelo', 45, 15.00, 'Corte clássico à tesoura ou máquina com acabamento perfeito.'),
  ('Barba com Toalha Quente', 'Barba', 45, 15.00, 'Barboterapia clássica com toalha quente, massagem e navalha.'),
  ('Corte Fade + Barba', 'Combo', 90, 30.00, 'Combo completo com fade de excelência e barboterapia relaxante.'),
  ('Platinado / Madeixas', 'Química', 120, 45.00, 'Descoloração e matização masculina com produtos premium.')
ON CONFLICT DO NOTHING;

-- Equipa
INSERT INTO public.team (name, role, commission_rate, details, photo_url) VALUES
  ('William', 'Mestre Barbeiro (Fundador)', 100, 'Especialista em cortes clássicos e fades precisos com tesoura.', 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=800&auto=format&fit=crop'),
  ('Rodrigo', 'Barbeiro Sênior', 45, 'Especialista em barboterapia e design de barba com navalha.', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=800&auto=format&fit=crop'),
  ('Francisco', 'Barbeiro', 40, 'Domínio em cortes modernos, platinados e freestyle.', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop')
ON CONFLICT (id) DO NOTHING;

-- Atualizar Produtos com Fotos (Barbearia)
UPDATE public.products SET photo_url = 'https://images.unsplash.com/photo-1599305090598-fe179d501227?q=80&w=600&auto=format&fit=crop' WHERE name ILIKE '%Pomada%';
UPDATE public.products SET photo_url = 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=600&auto=format&fit=crop' WHERE name ILIKE '%Óleo%';
UPDATE public.products SET photo_url = 'https://images.unsplash.com/photo-1621607512214-68297480165e?q=80&w=600&auto=format&fit=crop' WHERE name ILIKE '%Cera%';
UPDATE public.products SET photo_url = 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?q=80&w=600&auto=format&fit=crop' WHERE name ILIKE '%Shampoo%';
UPDATE public.products SET photo_url = 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=600&auto=format&fit=crop' WHERE name ILIKE '%Pente%';
UPDATE public.products SET photo_url = 'https://images.unsplash.com/photo-1636906803792-710e2f5b66d7?q=80&w=600&auto=format&fit=crop' WHERE name ILIKE '%Navalhete%' OR name ILIKE '%Gilete%';
