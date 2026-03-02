-- =============================================
-- TO BEAUTY ERP - CONFIGURAÇÃO COMPLETA DA BASE DE DADOS
-- Execute este script COMPLETO no SQL Editor do Supabase
-- FEVEREIRO 2026 - Mês de trabalho simulado
-- =============================================

-- ==================
-- 1. CRIAR TABELAS
-- ==================

CREATE TABLE IF NOT EXISTS public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL, email TEXT, phone TEXT, birthday DATE,
  address TEXT, referral_source TEXT, notes TEXT,
  total_spent NUMERIC DEFAULT 0, visit_count INTEGER DEFAULT 0,
  last_visit TIMESTAMPTZ, created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL, category TEXT, duration INTEGER DEFAULT 30,
  price NUMERIC DEFAULT 0, description TEXT, created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL, role TEXT, phone TEXT, email TEXT,
  commission_rate NUMERIC DEFAULT 0, created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL, category TEXT, brand TEXT,
  stock_quantity INTEGER DEFAULT 0, min_stock INTEGER DEFAULT 5,
  price NUMERIC DEFAULT 0, cost_price NUMERIC DEFAULT 0,
  total_sold INTEGER DEFAULT 0, created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID, service_id UUID, team_member_id UUID,
  booking_date DATE NOT NULL, booking_time TEXT NOT NULL,
  status TEXT DEFAULT 'pendente', notes TEXT, created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID, client_name TEXT, service_name TEXT,
  total_amount NUMERIC DEFAULT 0, status TEXT DEFAULT 'pendente',
  payment_method TEXT DEFAULT 'dinheiro', date DATE,
  issue_date TIMESTAMPTZ DEFAULT now(), created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  description TEXT NOT NULL, category TEXT, amount NUMERIC DEFAULT 0,
  date DATE DEFAULT CURRENT_DATE, notes TEXT,
  paid_to TEXT, attachment_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL, description TEXT, price NUMERIC DEFAULT 0,
  sessions INTEGER DEFAULT 1, validity_days INTEGER DEFAULT 30,
  services_included TEXT, created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name TEXT, total_amount NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'aberta', payment_method TEXT,
  notes TEXT, created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_member_id UUID, member_name TEXT,
  amount NUMERIC DEFAULT 0, rate NUMERIC DEFAULT 0,
  date DATE DEFAULT CURRENT_DATE, status TEXT DEFAULT 'pendente',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.cash_register (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL, amount NUMERIC NOT NULL,
  description TEXT, payment_method TEXT,
  date DATE DEFAULT CURRENT_DATE, created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL, target_value NUMERIC DEFAULT 0,
  current_value NUMERIC DEFAULT 0, period TEXT DEFAULT 'mensal',
  start_date DATE, end_date DATE, status TEXT DEFAULT 'ativa',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.anamnesis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID, client_name TEXT,
  allergies TEXT, medications TEXT, health_conditions TEXT,
  skin_type TEXT, scalp_conditions TEXT, preferences TEXT,
  notes TEXT, created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.site_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_key TEXT UNIQUE NOT NULL, image_url TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  salon_name TEXT DEFAULT 'TO Barber',
  phone TEXT, email TEXT, address TEXT,
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

-- ==================
-- 2. COLUNAS EM FALTA (seguro para executar várias vezes)
-- ==================
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS birthday DATE;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS referral_source TEXT;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS visit_count INTEGER DEFAULT 0;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS brand TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS cost_price NUMERIC DEFAULT 0;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS min_stock INTEGER DEFAULT 5;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS client_name TEXT;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS service_name TEXT;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS date DATE;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'dinheiro';
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pendente';
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS total_amount NUMERIC DEFAULT 0;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS issue_date TIMESTAMPTZ DEFAULT now();
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE public.expenses ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE public.expenses ADD COLUMN IF NOT EXISTS paid_to TEXT;
ALTER TABLE public.expenses ADD COLUMN IF NOT EXISTS attachment_url TEXT;

-- ==================
-- 3. POLÍTICAS RLS (permitir tudo para desenvolvimento)
-- ==================
DO $$
DECLARE t TEXT;
BEGIN
  FOR t IN SELECT unnest(ARRAY[
    'clients','services','team_members','products','bookings',
    'invoices','expenses','plans','orders','commissions',
    'cash_register','goals','anamnesis','site_images','settings'
  ])
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('DROP POLICY IF EXISTS "Allow all" ON public.%I', t);
    EXECUTE format('CREATE POLICY "Allow all" ON public.%I FOR ALL USING (true) WITH CHECK (true)', t);
  END LOOP;
END $$;

-- ==================
-- 4. DADOS DE FEVEREIRO 2026
-- ==================

-- Limpar dados antigos para evitar duplicados
TRUNCATE public.bookings, public.invoices, public.expenses, public.orders,
         public.commissions, public.cash_register, public.goals, public.anamnesis CASCADE;
DELETE FROM public.clients;
DELETE FROM public.services;
DELETE FROM public.team_members;
DELETE FROM public.products;
DELETE FROM public.plans;
DELETE FROM public.settings;

-- === 12 CLIENTES ===
INSERT INTO public.clients (name, email, phone, birthday, address, referral_source, total_spent, visit_count, last_visit) VALUES
  ('Maria Oliveira',    'maria.oliveira@email.com',  '912345678', '1990-05-15', 'Rua da Liberdade 45, Lisboa',    'Instagram',   680.00, 18, '2026-02-27'),
  ('Ana Pereira',       'ana.pereira@email.com',     '915555555', '1988-08-22', 'Av. da República 120, Lisboa',   'Indicação',   520.00, 14, '2026-02-26'),
  ('Cláudia Vieira',    'claudia.vieira@email.com',  '913333333', '1995-03-10', 'Rua Augusta 78, Lisboa',         'Google',      380.00, 10, '2026-02-25'),
  ('Sofia Costa',       'sofia.costa@email.com',     '916666666', '1992-11-28', 'Praça do Comércio 30, Lisboa',   'Facebook',    290.00,  8, '2026-02-24'),
  ('Beatriz Santos',    'beatriz.s@email.com',       '917777777', '1998-01-05', 'Rua de Santa Catarina 200, Porto','Amiga',      350.00, 10, '2026-02-27'),
  ('Inês Rodrigues',    'ines.r@email.com',          '918888888', '1993-07-19', 'Av. dos Aliados 50, Porto',      'Website',     440.00, 12, '2026-02-26'),
  ('Marta Ribeiro',     'marta.rib@email.com',       '919999999', '1985-12-03', 'Rua do Almada 15, Porto',        'Instagram',   260.00,  7, '2026-02-25'),
  ('Joana Ferreira',    'joana.f@email.com',         '911111111', '1997-04-25', 'Rua da Boavista 88, Porto',      'Indicação',   190.00,  5, '2026-02-21'),
  ('Carolina Lopes',    'carolina.l@email.com',      '912222222', '1991-09-14', 'Rua Garrett 32, Lisboa',         'Google',      310.00,  9, '2026-02-23'),
  ('Diana Martins',     'diana.m@email.com',         '913444444', '1994-06-08', 'Av. da Liberdade 200, Lisboa',   'Instagram',   420.00, 11, '2026-02-27'),
  ('Filipa Sousa',      'filipa.s@email.com',        '914555555', '1989-02-20', 'Rua do Carmo 66, Lisboa',        'Facebook',    175.00,  5, '2026-02-20'),
  ('Teresa Almeida',    'teresa.a@email.com',        '915666666', '1996-10-31', 'Rua de Cedofeita 44, Porto',     'Amiga',       230.00,  6, '2026-02-22');

-- === 12 SERVIÇOS ===
INSERT INTO public.services (name, category, duration, price, description) VALUES
  ('Corte Clássico',       'Cabelo',     45,  15.00, 'Corte clássico à tesoura ou máquina'),
  ('Corte Degradê / Fade', 'Cabelo',     45,  18.00, 'Corte moderno com fade na navalha'),
  ('Barba Simples',        'Barba',      30,  10.00, 'Aparo e alinhamento de barba'),
  ('Barba com Toalha Quente','Barba',    45,  15.00, 'Barboterapia clássica com toalha quente e massagem'),
  ('Corte + Barba',        'Combo',      75,  25.00, 'Combo clássico de corte e barba simples'),
  ('Corte Fade + Barba',   'Combo',      90,  30.00, 'Combo completo com fade e barboterapia'),
  ('Corte Criança',        'Cabelo',     30,  12.00, 'Corte para crianças até 12 anos'),
  ('Corte à Máquina',      'Cabelo',     20,  10.00, 'Corte de cabelo todo à máquina (pente único)'),
  ('Sobrancelha',          'Estética',   15,   5.00, 'Aparo e alinhamento de sobrancelha na navalha'),
  ('Pigmentação Barba',    'Química',    30,  15.00, 'Coloração para cobrir falhas ou fios brancos'),
  ('Platinado / Madeixas', 'Química',   120,  45.00, 'Descoloração e matização masculina'),
  ('Lavagem VIP',          'Estética',   15,   5.00, 'Lavagem com massagem capilar e shampoo premium');

-- === 3 PROFISSIONAIS ===
INSERT INTO public.team_members (name, role, phone, email, commission_rate) VALUES
  ('William',   'Mestre Barbeiro', '+351 912 345 678', 'william@tobarber.pt', 50),
  ('Rodrigo',   'Barbeiro Sênior', '+351 923 456 789', 'rodrigo@tobarber.pt', 45),
  ('Francisco', 'Barbeiro',        '+351 934 567 890', 'francisco@tobarber.pt', 40);

-- === DEFINIÇÕES DO SALÃO ===
INSERT INTO public.settings (id, salon_name, phone, email, address, primary_color, currency, timezone) VALUES
  (1, 'TO Barber', '+351 912 345 678', 'info@tobarber.pt', 'Rua do Corte 123, Lisboa', '#B48228', 'EUR', 'Europe/Lisbon');

-- === 12 PRODUTOS ===
INSERT INTO public.products (name, category, brand, stock_quantity, min_stock, price, cost_price, total_sold) VALUES
  ('Pomada Efeito Matte',      'Styling',   'Reuzel',       15,  5, 22.00, 10.00,  42),
  ('Cera Modeladora Brilho',   'Styling',   'Suavecito',     8,  3, 18.50,  8.00,  87),
  ('Óleo Hidratante Barba',    'Cuidado',   'Proraso',      30, 10, 15.00,  6.50, 120),
  ('Bálsamo para Barba',       'Cuidado',   'King C. G.',   50, 10,  9.50,  4.00, 200),
  ('Shampoo Refrescante',      'Cuidado',   'American Crew',12,  5, 16.00,  7.00,  65),
  ('Loção Pós-Barba',          'Cuidado',   'Proraso',      20,  5, 14.00,  6.50,  55),
  ('Pente de Madeira',         'Acessório', 'Lames & T.',  100, 20,   5.50,  1.80, 350),
  ('Escova Cerdas Naturais',   'Acessório', 'OAK',          25, 10,  18.00,  8.50,  90),
  ('Navalhete Clássico',       'Ferramenta','Parker',        5,  2,  35.00, 15.00,  15),
  ('Giletes Extra Sharp',      'Consumível','Astra',         3,  5,   6.50,  3.00,  92),
  ('Gel de Barbear Transp.',   'Consumível','Elegance',     10,  5,   8.00,  3.50,  40),
  ('Pó Volumizador Textura',   'Styling',   'Slick Gorilla',18,  5,  21.00, 10.00,  30);

-- === ~80 AGENDAMENTOS (20 por profissional em Fev 2026, Seg-Sáb) ===
-- William (~20 marcações)
INSERT INTO public.bookings (booking_date, booking_time, status, notes) VALUES
  ('2026-02-02','09:00','concluido','Corte clássico - Maria O.'),
  ('2026-02-02','10:30','concluido','Corte Fade + Barba - Ana P.'),
  ('2026-02-03','09:00','concluido','Platinado - Cláudia V.'),
  ('2026-02-03','11:00','concluido','Fade - Sofia C.'),
  ('2026-02-04','09:30','concluido','Barba toalha quente - Beatriz S.'),
  ('2026-02-05','09:00','concluido','Corte clássico - Inês R.'),
  ('2026-02-05','10:30','concluido','Sobrancelha - Marta R.'),
  ('2026-02-06','09:00','concluido','Fade - Joana F.'),
  ('2026-02-06','11:00','concluido','Barba simples - Carolina L.'),
  ('2026-02-09','09:00','concluido','Corte clássico - Diana M.'),
  ('2026-02-09','10:30','concluido','Corte e barba - Maria O.'),
  ('2026-02-10','09:00','concluido','Corte Criança - Ana P.'),
  ('2026-02-11','09:30','concluido','Máquina - Filipa S.'),
  ('2026-02-12','09:00','concluido','Corte clássico - Teresa A.'),
  ('2026-02-13','10:00','concluido','Corte Fade + Barba - Beatriz S.'),
  ('2026-02-16','09:00','concluido','Fade - Cláudia V.'),
  ('2026-02-17','09:30','concluido','Barba toalha quente - Sofia C.'),
  ('2026-02-18','09:00','concluido','Corte clássico - Inês R.'),
  ('2026-02-23','09:00','concluido','Platinado - Maria O.'),
  ('2026-02-24','09:30','concluido','Sobrancelha - Ana P.'),
-- Rodrigo (~20 marcações)
  ('2026-02-02','10:00','concluido','Barba toalha quente - Marta R.'),
  ('2026-02-02','14:00','concluido','Corte clássico - Joana F.'),
  ('2026-02-03','10:00','concluido','Corte clássico - Carolina L.'),
  ('2026-02-03','14:00','concluido','Corte e barba - Diana M.'),
  ('2026-02-04','10:00','concluido','Fade - Filipa S.'),
  ('2026-02-05','10:00','concluido','Lavagem VIP - Teresa A.'),
  ('2026-02-05','14:00','concluido','Corte clássico - Maria O.'),
  ('2026-02-06','10:00','concluido','Barba toalha quente - Ana P.'),
  ('2026-02-09','10:00','concluido','Corte clássico - Cláudia V.'),
  ('2026-02-09','14:00','concluido','Barba simples - Sofia C.'),
  ('2026-02-10','10:00','concluido','Corte clássico - Beatriz S.'),
  ('2026-02-11','10:00','concluido','Máquina - Inês R.'),
  ('2026-02-12','10:00','concluido','Fade - Marta R.'),
  ('2026-02-13','10:00','concluido','Barba toalha quente - Joana F.'),
  ('2026-02-16','10:00','concluido','Corte clássico - Carolina L.'),
  ('2026-02-17','10:00','concluido','Lavagem VIP - Diana M.'),
  ('2026-02-18','10:00','concluido','Corte e barba - Filipa S.'),
  ('2026-02-19','10:00','concluido','Corte clássico - Teresa A.'),
  ('2026-02-23','10:00','concluido','Barba simples - Maria O.'),
  ('2026-02-24','10:00','concluido','Fade - Ana P.'),
-- Francisco (~20 marcações)
  ('2026-02-02','11:00','concluido','Corte Fade + Barba - Cláudia V.'),
  ('2026-02-02','14:30','concluido','Corte clássico - Sofia C.'),
  ('2026-02-03','11:00','concluido','Corte e barba - Beatriz S.'),
  ('2026-02-04','11:00','concluido','Platinado - Inês R.'),
  ('2026-02-04','14:00','concluido','Fade - Marta R.'),
  ('2026-02-05','11:00','concluido','Corte clássico - Joana F.'),
  ('2026-02-06','11:30','concluido','Sobrancelha - Carolina L.'),
  ('2026-02-09','11:00','concluido','Barba toalha quente - Diana M.'),
  ('2026-02-10','11:00','concluido','Corte clássico - Filipa S.'),
  ('2026-02-10','14:00','concluido','Barba simples - Teresa A.'),
  ('2026-02-11','11:00','concluido','Fade - Maria O.'),
  ('2026-02-12','11:00','concluido','Corte Criança - Ana P.'),
  ('2026-02-13','11:00','concluido','Corte clássico - Cláudia V.'),
  ('2026-02-16','11:00','concluido','Corte e barba - Sofia C.'),
  ('2026-02-16','14:00','concluido','Máquina - Beatriz S.'),
  ('2026-02-17','11:00','concluido','Corte Fade + Barba - Inês R.'),
  ('2026-02-18','11:00','concluido','Corte clássico - Marta R.'),
  ('2026-02-19','11:00','concluido','Barba toalha quente - Joana F.'),
  ('2026-02-23','11:00','concluido','Fade - Carolina L.'),
  ('2026-02-24','11:00','concluido','Sobrancelha - Diana M.'),
-- Francisco (~20 marcações)
  ('2026-02-02','14:00','concluido','Corte clássico - Filipa S.'),
  ('2026-02-03','14:00','concluido','Lavagem VIP - Teresa A.'),
  ('2026-02-04','14:00','concluido','Corte clássico - Maria O.'),
  ('2026-02-05','14:00','concluido','Máquina - Ana P.'),
  ('2026-02-06','14:00','concluido','Corte clássico - Cláudia V.'),
  ('2026-02-09','14:00','concluido','Lavagem VIP - Sofia C.'),
  ('2026-02-10','14:30','concluido','Corte clássico - Beatriz S.'),
  ('2026-02-11','14:00','concluido','Máquina - Inês R.'),
  ('2026-02-12','14:00','concluido','Corte clássico - Marta R.'),
  ('2026-02-13','14:00','concluido','Lavagem VIP - Joana F.'),
  ('2026-02-16','14:00','concluido','Corte clássico - Carolina L.'),
  ('2026-02-17','14:00','concluido','Máquina - Diana M.'),
  ('2026-02-18','14:00','concluido','Corte clássico - Filipa S.'),
  ('2026-02-19','14:00','concluido','Lavagem VIP - Teresa A.'),
  ('2026-02-20','09:00','concluido','Corte clássico - Maria O.'),
  ('2026-02-20','10:30','concluido','Máquina - Ana P.'),
  ('2026-02-23','14:00','concluido','Corte clássico - Cláudia V.'),
  ('2026-02-24','14:00','concluido','Lavagem VIP - Sofia C.'),
  ('2026-02-25','09:00','concluido','Corte clássico - Beatriz S.'),
  ('2026-02-25','10:30','concluido','Máquina - Inês R.'),
-- Agendamentos de HOJE (28 Fev) e próximos
  ('2026-02-28','09:00','confirmado','Corte clássico - Maria O.'),
  ('2026-02-28','09:30','confirmado','Barba toalha quente - Ana P.'),
  ('2026-02-28','10:00','pendente','Corte Fade + Barba - Cláudia V.'),
  ('2026-02-28','10:30','confirmado','Fade - Sofia C.'),
  ('2026-02-28','11:00','pendente','Platinado - Beatriz S.'),
  ('2026-02-28','14:00','confirmado','Corte clássico - Inês R.'),
  ('2026-02-28','14:30','pendente','Corte e barba - Marta R.'),
  ('2026-02-28','15:00','confirmado','Sobrancelha - Carolina L.');

-- === 40+ TRANSAÇÕES/FATURAS (Fev 2026) ===
INSERT INTO public.invoices (client_name, service_name, total_amount, status, payment_method, date) VALUES
  ('Maria Oliveira',  'Corte Clássico',         35.00,'pago','mbway','2026-02-02'),
  ('Ana Pereira',     'Corte Fade + Barba',      55.00,'pago','cartao','2026-02-02'),
  ('Cláudia Vieira',  'Platinado / Madeixas',       70.00,'pago','cartao','2026-02-03'),
  ('Sofia Costa',     'Corte Degradê / Fade',        45.00,'pago','dinheiro','2026-02-03'),
  ('Beatriz Santos',  'Barba com Toalha Quente',          40.00,'pago','mbway','2026-02-04'),
  ('Inês Rodrigues',  'Corte Clássico',          35.00,'pago','cartao','2026-02-05'),
  ('Marta Ribeiro',   'Sobrancelha',    40.00,'pago','dinheiro','2026-02-05'),
  ('Joana Ferreira',  'Corte Degradê / Fade',        45.00,'pago','mbway','2026-02-06'),
  ('Carolina Lopes',  'Barba Simples',      30.00,'pago','cartao','2026-02-06'),
  ('Diana Martins',   'Corte Clássico',          35.00,'pago','mbway','2026-02-09'),
  ('Maria Oliveira',  'Corte + Barba',          50.00,'pago','cartao','2026-02-09'),
  ('Ana Pereira',     'Corte Criança',  65.00,'pago','cartao','2026-02-10'),
  ('Filipa Sousa',    'Corte à Máquina',        30.00,'pago','dinheiro','2026-02-11'),
  ('Teresa Almeida',  'Corte Clássico',          35.00,'pago','mbway','2026-02-12'),
  ('Beatriz Santos',  'Corte Fade + Barba',      55.00,'pago','cartao','2026-02-13'),
  ('Cláudia Vieira',  'Corte Degradê / Fade',        45.00,'pago','dinheiro','2026-02-16'),
  ('Sofia Costa',     'Barba com Toalha Quente',          40.00,'pago','mbway','2026-02-17'),
  ('Inês Rodrigues',  'Corte Clássico',          35.00,'pago','cartao','2026-02-18'),
  ('Maria Oliveira',  'Platinado / Madeixas',       70.00,'pago','mbway','2026-02-23'),
  ('Ana Pereira',     'Sobrancelha',    40.00,'pago','cartao','2026-02-24'),
  ('Marta Ribeiro',   'Barba com Toalha Quente',          40.00,'pago','dinheiro','2026-02-02'),
  ('Joana Ferreira',  'Corte Clássico',     20.00,'pago','dinheiro','2026-02-02'),
  ('Carolina Lopes',  'Corte Clássico',          35.00,'pago','mbway','2026-02-03'),
  ('Diana Martins',   'Corte + Barba',          50.00,'pago','cartao','2026-02-03'),
  ('Filipa Sousa',    'Corte Degradê / Fade',        45.00,'pago','cartao','2026-02-04'),
  ('Teresa Almeida',  'Lavagem VIP',        15.00,'pago','dinheiro','2026-02-05'),
  ('Maria Oliveira',  'Corte Clássico',          35.00,'pago','mbway','2026-02-05'),
  ('Ana Pereira',     'Barba com Toalha Quente',          40.00,'pago','cartao','2026-02-06'),
  ('Cláudia Vieira',  'Corte Fade + Barba',      55.00,'pago','cartao','2026-02-02'),
  ('Sofia Costa',     'Corte Clássico',          35.00,'pago','dinheiro','2026-02-02'),
  ('Beatriz Santos',  'Corte + Barba',          50.00,'pago','mbway','2026-02-03'),
  ('Inês Rodrigues',  'Platinado / Madeixas',       70.00,'pago','cartao','2026-02-04'),
  ('Marta Ribeiro',   'Corte Degradê / Fade',        45.00,'pago','mbway','2026-02-04'),
  ('Joana Ferreira',  'Corte Clássico',          35.00,'pago','dinheiro','2026-02-05'),
  ('Carolina Lopes',  'Sobrancelha',    40.00,'pago','cartao','2026-02-06'),
  ('Diana Martins',   'Barba com Toalha Quente',          40.00,'pago','mbway','2026-02-09'),
  ('Filipa Sousa',    'Corte Clássico',          35.00,'pago','cartao','2026-02-10'),
  ('Teresa Almeida',  'Barba Simples',      30.00,'pago','dinheiro','2026-02-10'),
  ('Filipa Sousa',    'Corte Clássico',     20.00,'pago','dinheiro','2026-02-02'),
  ('Teresa Almeida',  'Lavagem VIP',        15.00,'pago','dinheiro','2026-02-03'),
  ('Maria Oliveira',  'Corte Clássico',     20.00,'pago','mbway','2026-02-04'),
  ('Sofia Costa',     'Lavagem VIP',        15.00,'pago','dinheiro','2026-02-09'),
  ('Beatriz Santos',  'Corte Clássico',     20.00,'pago','mbway','2026-02-10'),
  ('Inês Rodrigues',  'Corte à Máquina',        30.00,'pago','cartao','2026-02-11'),
  ('Maria Oliveira',  'Corte Clássico',          35.00,'pendente','mbway','2026-02-28'),
  ('Cláudia Vieira',  'Corte Fade + Barba',      55.00,'pendente','cartao','2026-02-28');

-- === DESPESAS Fev 2026 (com campo paid_to) ===
INSERT INTO public.expenses (description, category, amount, date, paid_to, notes) VALUES
  ('Renda do Salão - Fevereiro',       'renda',     1500.00, '2026-02-01', 'Imobiliária Lisboa Premium', 'Pagamento mensal via transferência'),
  ('Eletricidade - Fevereiro',         'utility',    195.00, '2026-02-05', 'EDP Comercial',       'Fatura nº 2026-0205'),
  ('Água - Fevereiro',                 'utility',     48.00, '2026-02-05', 'EPAL',                NULL),
  ('Internet Fibra - Fevereiro',       'utility',     38.00, '2026-02-03', 'NOS',                 'Contrato empresarial'),
  ('Fornecedor - Pomadas e Ceras',  'fornecedor', 520.00, '2026-02-04', 'Reuzel Portugal Lda.', 'Encomenda trimestral - Pomadas e Ceras'),
  ('Fornecedor - Lâminas e Tesouras','fornecedor', 145.00, '2026-02-06', 'Lames & Tradition',     '200 lâminas + 5 tesouras'),
  ('Instagram Ads - Campanha Fev',     'marketing',  250.00, '2026-02-07', 'Meta Platforms',      'Campanha "Promoção Fevereiro"'),
  ('Seguro do Salão - Fevereiro',      'outros',     155.00, '2026-02-01', 'Fidelidade Seguros',  'Seguro multirriscos anual'),
  ('Produtos de Limpeza',              'fornecedor',  72.00, '2026-02-10', 'Makro Portugal',      'Desinfetantes + toalhas'),
  ('Manutenção Ar Condicionado',       'outros',     190.00, '2026-02-12', 'ClimaFrio Lda.',      'Revisão semestral'),
  ('Fornecedor - Óleos para Barba', 'fornecedor', 310.00, '2026-02-14', 'Proraso Portugal',        '50 frascos óleo + 30 bálsamos'),
  ('Fornecedor - Shampoos e Géis',    'fornecedor', 280.00, '2026-02-17', 'American Crew PT',      'Shampoos premium e géis de barbear'),
  ('Google Ads - Campanha Fev',        'marketing',  180.00, '2026-02-18', 'Google Ireland Ltd.',  'Campanha pesquisa local'),
  ('Salário William',            'salario',   1200.00, '2026-02-25', 'William',       'Salário base Fevereiro'),
  ('Salário Rodrigo',               'salario',   1100.00, '2026-02-25', 'Rodrigo',          'Salário base Fevereiro'),
  ('Salário Francisco',             'salario',   1150.00, '2026-02-25', 'Francisco',        'Salário base Fevereiro'),
  ('Salário Francisco',             'salario',    900.00, '2026-02-25', 'Francisco',        'Salário base Fevereiro'),
  ('Contabilidade - Fevereiro',        'outros',     200.00, '2026-02-28', 'Contabilista Dr. Marques', 'Serviço mensal de contabilidade'),
  ('Material descartável',             'fornecedor', 95.00,  '2026-02-20', 'Makro Portugal',      'Luvas, máscaras, toalhitas');

-- === COMANDAS (Fev 2026) ===
INSERT INTO public.orders (client_name, total_amount, status, payment_method, notes, created_at) VALUES
  ('Maria Oliveira',  35.00,  'fechada','mbway','Corte clássico','2026-02-02 09:00:00+00'),
  ('Ana Pereira',     95.00,  'fechada','cartao','Corte Fade + Barba Completa','2026-02-02 10:30:00+00'),
  ('Cláudia Vieira',  70.00,  'fechada','cartao','Platinado','2026-02-03 09:00:00+00'),
  ('Sofia Costa',     80.00,  'fechada','dinheiro','Fade + produtos','2026-02-03 11:00:00+00'),
  ('Beatriz Santos',  40.00,  'fechada','mbway','Barba toalha quente','2026-02-04 09:30:00+00'),
  ('Inês Rodrigues',  35.00,  'fechada','cartao','Corte clássico','2026-02-05 09:00:00+00'),
  ('Marta Ribeiro',   58.00,  'fechada','dinheiro','Platinado + óleo','2026-02-05 10:30:00+00'),
  ('Joana Ferreira',  45.00,  'fechada','mbway','Fade','2026-02-06 09:00:00+00'),
  ('Carolina Lopes',  30.00,  'fechada','cartao','Barba simples','2026-02-06 11:00:00+00'),
  ('Diana Martins',   85.00,  'fechada','mbway','Corte clássico + design de barba','2026-02-09 09:00:00+00'),
  ('Maria Oliveira',  50.00,  'fechada','cartao','Corte e barba','2026-02-09 10:30:00+00'),
  ('Ana Pereira',     65.00,  'fechada','cartao','Corte Criança','2026-02-10 09:00:00+00'),
  ('Maria Oliveira',  35.00,  'aberta', NULL,'Corte clássico - em serviço','2026-02-28 09:00:00+00'),
  ('Ana Pereira',     40.00,  'aberta', NULL,'Barba toalha quente','2026-02-28 09:30:00+00'),
  ('Cláudia Vieira',  55.00,  'aberta', NULL,'Corte Fade + Barba','2026-02-28 10:00:00+00');

-- === COMISSÕES (Fev 2026 - 4 semanas × 4 profissionais) ===
INSERT INTO public.commissions (member_name, amount, rate, date, status) VALUES
  -- Semana 1 (2-6 Fev)
  ('William',  56.00, 40, '2026-02-06', 'pago'),
  ('Rodrigo',     42.00, 35, '2026-02-06', 'pago'),
  ('Francisco',   54.00, 40, '2026-02-06', 'pago'),
  ('Francisco',   15.00, 30, '2026-02-06', 'pago'),
  -- Semana 2 (9-13 Fev)
  ('William',  62.00, 40, '2026-02-13', 'pago'),
  ('Rodrigo',     38.50, 35, '2026-02-13', 'pago'),
  ('Francisco',   48.00, 40, '2026-02-13', 'pago'),
  ('Francisco',   18.00, 30, '2026-02-13', 'pago'),
  -- Semana 3 (16-20 Fev)
  ('William',  52.00, 40, '2026-02-20', 'pago'),
  ('Rodrigo',     36.75, 35, '2026-02-20', 'pago'),
  ('Francisco',   50.00, 40, '2026-02-20', 'pago'),
  ('Francisco',   16.50, 30, '2026-02-20', 'pago'),
  -- Semana 4 (23-28 Fev)
  ('William',  44.00, 40, '2026-02-27', 'pendente'),
  ('Rodrigo',     31.50, 35, '2026-02-27', 'pendente'),
  ('Francisco',   42.00, 40, '2026-02-27', 'pendente'),
  ('Francisco',   13.50, 30, '2026-02-27', 'pendente');

-- === CAIXA - Fluxo completo Fev 2026 ===
INSERT INTO public.cash_register (type, amount, description, payment_method, date) VALUES
  -- Semana 1
  ('entrada', 275.00, 'Serviços dia 02/02', 'misto', '2026-02-02'),
  ('entrada', 160.00, 'Serviços dia 03/02', 'misto', '2026-02-03'),
  ('entrada', 155.00, 'Serviços dia 04/02', 'misto', '2026-02-04'),
  ('entrada', 175.00, 'Serviços dia 05/02', 'misto', '2026-02-05'),
  ('entrada', 160.00, 'Serviços dia 06/02', 'misto', '2026-02-06'),
  ('saida',  1500.00, 'Renda do Salão',      'transferencia', '2026-02-01'),
  ('saida',   155.00, 'Seguro do Salão',     'transferencia', '2026-02-01'),
  ('saida',    38.00, 'Internet Fibra',      'transferencia', '2026-02-03'),
  ('saida',   520.00, 'Fornecedor Moyra',    'transferencia', '2026-02-04'),
  ('saida',   243.00, 'Eletricidade + Água', 'transferencia', '2026-02-05'),
  ('saida',   145.00, 'Fornecedor Staleks',  'transferencia', '2026-02-06'),
  -- Semana 2
  ('entrada', 220.00, 'Serviços dia 09/02', 'misto', '2026-02-09'),
  ('entrada', 200.00, 'Serviços dia 10/02', 'misto', '2026-02-10'),
  ('entrada', 130.00, 'Serviços dia 11/02', 'misto', '2026-02-11'),
  ('entrada', 125.00, 'Serviços dia 12/02', 'misto', '2026-02-12'),
  ('entrada', 150.00, 'Serviços dia 13/02', 'misto', '2026-02-13'),
  ('saida',   250.00, 'Instagram Ads',      'cartao', '2026-02-07'),
  ('saida',    72.00, 'Produtos Limpeza',   'dinheiro', '2026-02-10'),
  ('saida',   190.00, 'Manutenção AC',      'transferencia', '2026-02-12'),
  -- Semana 3
  ('entrada', 165.00, 'Serviços dia 16/02', 'misto', '2026-02-16'),
  ('entrada', 145.00, 'Serviços dia 17/02', 'misto', '2026-02-17'),
  ('entrada', 140.00, 'Serviços dia 18/02', 'misto', '2026-02-18'),
  ('entrada', 115.00, 'Serviços dia 19/02', 'misto', '2026-02-19'),
  ('entrada', 100.00, 'Serviços dia 20/02', 'misto', '2026-02-20'),
  ('saida',   310.00, 'Fornecedor OPI',     'transferencia', '2026-02-14'),
  ('saida',   280.00, 'Fornecedor CND',     'transferencia', '2026-02-17'),
  ('saida',   180.00, 'Google Ads',         'cartao', '2026-02-18'),
  -- Semana 4
  ('entrada', 175.00, 'Serviços dia 23/02', 'misto', '2026-02-23'),
  ('entrada', 160.00, 'Serviços dia 24/02', 'misto', '2026-02-24'),
  ('entrada', 110.00, 'Serviços dia 25/02', 'misto', '2026-02-25'),
  ('saida',  4350.00, 'Salários Fevereiro', 'transferencia', '2026-02-25'),
  ('saida',    95.00, 'Material descartável','dinheiro', '2026-02-20'),
  ('saida',   200.00, 'Contabilidade',      'transferencia', '2026-02-28'),
  ('entrada', 130.00, 'Serviços dia 28/02 (parcial)', 'misto', '2026-02-28');

-- === METAS Fev 2026 ===
INSERT INTO public.goals (title, target_value, current_value, period, start_date, end_date, status) VALUES
  ('Faturação Mensal Fev',     5000.00, 4280.00, 'mensal',     '2026-02-01', '2026-02-28', 'ativa'),
  ('Novos Clientes Fev',         15.00,   12.00, 'mensal',     '2026-02-01', '2026-02-28', 'ativa'),
  ('Vendas Produtos Revenda',  1000.00,  720.00, 'mensal',     '2026-02-01', '2026-02-28', 'ativa'),
  ('Satisfação 5★ Google',       50.00,   42.00, 'trimestral', '2026-01-01', '2026-03-31', 'ativa'),
  ('Meta Anual Faturação',    60000.00, 9500.00, 'anual',      '2026-01-01', '2026-12-31', 'ativa');

-- === PACOTES ===
INSERT INTO public.plans (name, description, price, sessions, validity_days, services_included) VALUES
  ('Pacote Noivo',       'Preparação completa para o grande dia',      250.00, 5,  60, 'Corte Clássico, Barba com Toalha Quente, Corte Fade + Barba, Tratamento Capilar VIP'),
  ('Beauty Pass Mensal', 'Manutenção mensal com desconto',              90.00, 3,  30, 'Corte Clássico, Corte à Máquina'),
  ('Pacote Amiga VIP',   'Para 2 pessoas - ideal para amigas',        130.00, 4,  45, 'Corte Clássico x2, Barba com Toalha Quente x2'),
  ('Fidelidade Premium', 'Programa anual com benefícios exclusivos',   800.00, 24, 365, 'Todos os serviços com 20% desconto');

-- === ANAMNESES ===
INSERT INTO public.anamnesis (client_name, allergies, medications, health_conditions, skin_type, nail_conditions, preferences, notes) VALUES
  ('Maria Oliveira',  'Nenhuma',  'Nenhum',           'Saudável', 'Normal',   'Queda de cabelo',  'Estilo clássico', 'Usar shampoo antiqueda'),
  ('Ana Pereira',     'Nenhuma conhecida',   'Anti-histamínico', 'Rinite',   'Sensível', 'Caspa',       'Gosta de fades modernos',     NULL),
  ('Cláudia Vieira',  'Nenhuma',             'Nenhum',           'Saudável', 'Mista',    'Oleoso',    'Estilo prático',   'Usar shampoo para oleosidade'),
  ('Sofia Costa',     'Sensível a lâmina',  'Nenhum',           'Diabetes', 'Seca',     'Seco',       'Visual limpo',       'Usar espuma pele sensível'),
  ('Beatriz Santos',  'Nenhuma',             'Nenhum',           'Saudável', 'Normal',   'Normal',       'Estilo minimalista',    NULL),
  ('Inês Rodrigues',  'Nenhuma',             'Nenhum',           'Saudável', 'Normal',   'Fios quebradiços', 'Corte clássico', 'Aplicar hidratante capilar'),
  ('Diana Martins',   'Alergia a latéx',     'Nenhum',           'Saudável', 'Sensível', 'Normal',       'Desenho freestyle',    'Usar luvas de nitrilo');

-- ✅ CONCLUÍDO! Fevereiro 2026 totalmente populado.
-- Total: 12 clientes, 12 serviços, 4 profissionais, 12 produtos
-- ~88 agendamentos, ~46 faturas, 19 despesas, 15 comandas
-- 16 comissões, 34 registos de caixa, 5 metas, 4 pacotes, 7 anamneses 
-- ==================  
-- 4. TABELA DE FATURAS (COMPRA/VENDA)  
-- ==================  
CREATE TABLE IF NOT EXISTS public.faturas (  
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),  
  type TEXT NOT NULL DEFAULT 'venda', -- 'compra' ou 'venda'  
  description TEXT NOT NULL,  
  entity_name TEXT,  
  nif TEXT,  
  amount NUMERIC DEFAULT 0,  
  date DATE DEFAULT CURRENT_DATE,  
  status TEXT DEFAULT 'pago',  
  payment_method TEXT DEFAULT 'dinheiro',  
  attachment_url TEXT,  
  notes TEXT,  
  created_at TIMESTAMPTZ DEFAULT now()  
); 
