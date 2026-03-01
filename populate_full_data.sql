-- ========================================
-- POPULAÇAO COMPLETA - EXECUTAR NO SUPABASE SQL EDITOR
-- Recria bookings com client_id, service_id, team_member_id
-- Recria cash_register com dados diários para o gráfico
-- Recria commissions ligadas aos profissionais
-- ========================================

-- 1. Limpar dados existentes de bookings, cash_register, commissions, invoices
TRUNCATE public.bookings CASCADE;
TRUNCATE public.cash_register CASCADE;
TRUNCATE public.commissions CASCADE;
TRUNCATE public.invoices CASCADE;

-- 2. BOOKINGS COM TODAS AS REFERÊNCIAS (FKs)
-- Cada booking tem: client_id, service_id, team_member_id

-- LETÍCIA SILVA (~20 atendimentos concluídos + 3 pendentes)
INSERT INTO public.bookings (client_id, service_id, team_member_id, booking_date, booking_time, status, notes)
SELECT c.id, s.id, t.id, b.d::date, b.h, b.st, b.n FROM
(VALUES
  ('Maria Oliveira','Corte Clássico','2026-02-02','09:00','concluido','Cliente fiel'),
  ('Ana Pereira','Corte Fade + Barba','2026-02-02','10:30','concluido',NULL),
  ('Cláudia Vieira','Platinado / Madeixas','2026-02-03','09:00','concluido',NULL),
  ('Sofia Costa','Corte Degradê / Fade','2026-02-03','11:00','concluido',NULL),
  ('Beatriz Santos','Barba com Toalha Quente','2026-02-04','09:30','concluido',NULL),
  ('Inês Rodrigues','Corte Clássico','2026-02-05','09:00','concluido',NULL),
  ('Marta Ribeiro','Sobrancelha','2026-02-05','10:30','concluido',NULL),
  ('Joana Ferreira','Corte Degradê / Fade','2026-02-06','09:00','concluido',NULL),
  ('Carolina Lopes','Barba Simples','2026-02-06','11:00','concluido',NULL),
  ('Diana Martins','Corte Clássico','2026-02-09','09:00','concluido',NULL),
  ('Maria Oliveira','Corte + Barba','2026-02-09','10:30','concluido',NULL),
  ('Ana Pereira','Corte Criança','2026-02-10','09:00','concluido',NULL),
  ('Filipa Sousa','Corte à Máquina','2026-02-11','09:30','concluido',NULL),
  ('Teresa Almeida','Corte Clássico','2026-02-12','09:00','concluido',NULL),
  ('Beatriz Santos','Corte Fade + Barba','2026-02-13','10:00','concluido',NULL),
  ('Cláudia Vieira','Corte Degradê / Fade','2026-02-16','09:00','concluido',NULL),
  ('Sofia Costa','Barba com Toalha Quente','2026-02-17','09:30','concluido',NULL),
  ('Inês Rodrigues','Corte Clássico','2026-02-18','09:00','concluido',NULL),
  ('Maria Oliveira','Platinado / Madeixas','2026-02-23','09:00','concluido',NULL),
  ('Ana Pereira','Sobrancelha','2026-02-24','09:30','concluido',NULL),
  ('Maria Oliveira','Corte Clássico','2026-02-28','09:00','confirmado',NULL),
  ('Cláudia Vieira','Corte Fade + Barba','2026-02-28','10:30','pendente',NULL),
  ('Beatriz Santos','Platinado / Madeixas','2026-02-28','14:00','confirmado',NULL)
) AS b(cn, sn, d, h, st, n)
JOIN public.clients c ON c.name = b.cn
JOIN public.services s ON s.name = b.sn
JOIN public.team_members t ON t.name = 'William';

-- ANA SANTOS (~20 atendimentos concluídos + 2 pendentes)
INSERT INTO public.bookings (client_id, service_id, team_member_id, booking_date, booking_time, status, notes)
SELECT c.id, s.id, t.id, b.d::date, b.h, b.st, b.n FROM
(VALUES
  ('Marta Ribeiro','Barba com Toalha Quente','2026-02-02','10:00','concluido',NULL),
  ('Joana Ferreira','Corte Clássico','2026-02-02','14:00','concluido',NULL),
  ('Carolina Lopes','Corte Clássico','2026-02-03','10:00','concluido',NULL),
  ('Diana Martins','Corte + Barba','2026-02-03','14:00','concluido',NULL),
  ('Filipa Sousa','Corte Degradê / Fade','2026-02-04','10:00','concluido',NULL),
  ('Teresa Almeida','Lavagem VIP','2026-02-05','10:00','concluido',NULL),
  ('Maria Oliveira','Corte Clássico','2026-02-05','14:00','concluido',NULL),
  ('Ana Pereira','Barba com Toalha Quente','2026-02-06','10:00','concluido',NULL),
  ('Cláudia Vieira','Corte Clássico','2026-02-09','10:00','concluido',NULL),
  ('Sofia Costa','Corte à Máquina','2026-02-09','14:00','concluido',NULL),
  ('Beatriz Santos','Corte Clássico','2026-02-10','10:00','concluido',NULL),
  ('Inês Rodrigues','Corte à Máquina','2026-02-11','10:00','concluido',NULL),
  ('Marta Ribeiro','Corte Degradê / Fade','2026-02-12','10:00','concluido',NULL),
  ('Joana Ferreira','Barba com Toalha Quente','2026-02-13','10:00','concluido',NULL),
  ('Carolina Lopes','Corte Clássico','2026-02-16','10:00','concluido',NULL),
  ('Diana Martins','Lavagem VIP','2026-02-17','10:00','concluido',NULL),
  ('Filipa Sousa','Corte + Barba','2026-02-18','10:00','concluido',NULL),
  ('Teresa Almeida','Corte Clássico','2026-02-19','10:00','concluido',NULL),
  ('Maria Oliveira','Corte à Máquina','2026-02-23','10:00','concluido',NULL),
  ('Ana Pereira','Corte Degradê / Fade','2026-02-24','10:00','concluido',NULL),
  ('Ana Pereira','Barba com Toalha Quente','2026-02-28','09:30','confirmado',NULL),
  ('Sofia Costa','Corte Degradê / Fade','2026-02-28','14:30','pendente',NULL)
) AS b(cn, sn, d, h, st, n)
JOIN public.clients c ON c.name = b.cn
JOIN public.services s ON s.name = b.sn
JOIN public.team_members t ON t.name = 'Rodrigo';

-- CARLA MENDES (~20 atendimentos concluídos + 2 pendentes)
INSERT INTO public.bookings (client_id, service_id, team_member_id, booking_date, booking_time, status, notes)
SELECT c.id, s.id, t.id, b.d::date, b.h, b.st, b.n FROM
(VALUES
  ('Cláudia Vieira','Corte Fade + Barba','2026-02-02','11:00','concluido',NULL),
  ('Sofia Costa','Corte Clássico','2026-02-02','14:30','concluido',NULL),
  ('Beatriz Santos','Corte + Barba','2026-02-03','11:00','concluido',NULL),
  ('Inês Rodrigues','Platinado / Madeixas','2026-02-04','11:00','concluido',NULL),
  ('Marta Ribeiro','Corte Degradê / Fade','2026-02-04','14:00','concluido',NULL),
  ('Joana Ferreira','Corte Clássico','2026-02-05','11:00','concluido',NULL),
  ('Carolina Lopes','Sobrancelha','2026-02-06','11:30','concluido',NULL),
  ('Diana Martins','Corte à Máquina','2026-02-09','11:00','concluido',NULL),
  ('Filipa Sousa','Corte Clássico','2026-02-10','11:00','concluido',NULL),
  ('Teresa Almeida','Barba Simples','2026-02-10','14:00','concluido',NULL),
  ('Maria Oliveira','Corte Degradê / Fade','2026-02-11','11:00','concluido',NULL),
  ('Ana Pereira','Corte Criança','2026-02-12','11:00','concluido',NULL),
  ('Cláudia Vieira','Corte Clássico','2026-02-13','11:00','concluido',NULL),
  ('Sofia Costa','Corte + Barba','2026-02-16','11:00','concluido',NULL),
  ('Beatriz Santos','Corte à Máquina','2026-02-16','14:00','concluido',NULL),
  ('Inês Rodrigues','Corte Fade + Barba','2026-02-17','11:00','concluido',NULL),
  ('Marta Ribeiro','Corte Clássico','2026-02-18','11:00','concluido',NULL),
  ('Joana Ferreira','Corte à Máquina','2026-02-19','11:00','concluido',NULL),
  ('Carolina Lopes','Corte Degradê / Fade','2026-02-23','11:00','concluido',NULL),
  ('Diana Martins','Sobrancelha','2026-02-24','11:00','concluido',NULL),
  ('Inês Rodrigues','Corte Clássico','2026-02-28','14:00','confirmado',NULL),
  ('Marta Ribeiro','Corte Fade + Barba','2026-02-28','15:00','pendente',NULL)
) AS b(cn, sn, d, h, st, n)
JOIN public.clients c ON c.name = b.cn
JOIN public.services s ON s.name = b.sn
JOIN public.team_members t ON t.name = 'Francisco';

-- 3. FATURAS COM REFERÊCIAS REAIS
INSERT INTO public.invoices (client_id, client_name, service_name, total_amount, status, payment_method, date)
SELECT c.id, b.cn, b.sn, b.amt, b.st, b.pm, b.d::date FROM
(VALUES
  -- Semana 1 (Fev 2-6)
  ('Maria Oliveira','Corte Clássico',35.00,'pago','mbway','2026-02-02'),
  ('Ana Pereira','Corte Fade + Barba',55.00,'pago','cartao','2026-02-02'),
  ('Marta Ribeiro','Barba com Toalha Quente',40.00,'pago','dinheiro','2026-02-02'),
  ('Joana Ferreira','Corte Clássico',20.00,'pago','dinheiro','2026-02-02'),
  ('Cláudia Vieira','Corte Fade + Barba',55.00,'pago','cartao','2026-02-02'),
  ('Sofia Costa','Corte Clássico',35.00,'pago','dinheiro','2026-02-02'),
  ('Cláudia Vieira','Platinado / Madeixas',70.00,'pago','cartao','2026-02-03'),
  ('Sofia Costa','Corte Degradê / Fade',45.00,'pago','dinheiro','2026-02-03'),
  ('Carolina Lopes','Corte Clássico',35.00,'pago','mbway','2026-02-03'),
  ('Diana Martins','Corte + Barba',50.00,'pago','cartao','2026-02-03'),
  ('Beatriz Santos','Barba com Toalha Quente',40.00,'pago','mbway','2026-02-04'),
  ('Filipa Sousa','Corte Degradê / Fade',45.00,'pago','cartao','2026-02-04'),
  ('Inês Rodrigues','Platinado / Madeixas',70.00,'pago','cartao','2026-02-04'),
  ('Marta Ribeiro','Corte Degradê / Fade',45.00,'pago','mbway','2026-02-04'),
  ('Inês Rodrigues','Corte Clássico',35.00,'pago','cartao','2026-02-05'),
  ('Marta Ribeiro','Sobrancelha',40.00,'pago','dinheiro','2026-02-05'),
  ('Teresa Almeida','Lavagem VIP',15.00,'pago','dinheiro','2026-02-05'),
  ('Maria Oliveira','Corte Clássico',20.00,'pago','mbway','2026-02-05'),
  ('Joana Ferreira','Corte Clássico',35.00,'pago','dinheiro','2026-02-05'),
  ('Joana Ferreira','Corte Degradê / Fade',45.00,'pago','mbway','2026-02-06'),
  ('Carolina Lopes','Barba Simples',30.00,'pago','cartao','2026-02-06'),
  ('Ana Pereira','Barba com Toalha Quente',40.00,'pago','cartao','2026-02-06'),
  ('Carolina Lopes','Sobrancelha',40.00,'pago','cartao','2026-02-06'),
  -- Semana 2 (Fev 9-13)
  ('Diana Martins','Corte Clássico',35.00,'pago','mbway','2026-02-09'),
  ('Maria Oliveira','Corte + Barba',50.00,'pago','cartao','2026-02-09'),
  ('Cláudia Vieira','Corte Clássico',20.00,'pago','dinheiro','2026-02-09'),
  ('Sofia Costa','Corte à Máquina',30.00,'pago','dinheiro','2026-02-09'),
  ('Diana Martins','Corte à Máquina',30.00,'pago','mbway','2026-02-09'),
  ('Ana Pereira','Corte Criança',65.00,'pago','cartao','2026-02-10'),
  ('Beatriz Santos','Corte Clássico',35.00,'pago','mbway','2026-02-10'),
  ('Filipa Sousa','Corte Clássico',35.00,'pago','cartao','2026-02-10'),
  ('Teresa Almeida','Barba Simples',30.00,'pago','dinheiro','2026-02-10'),
  ('Filipa Sousa','Corte à Máquina',30.00,'pago','dinheiro','2026-02-11'),
  ('Inês Rodrigues','Corte à Máquina',30.00,'pago','cartao','2026-02-11'),
  ('Maria Oliveira','Corte Degradê / Fade',45.00,'pago','mbway','2026-02-11'),
  ('Teresa Almeida','Corte Clássico',35.00,'pago','mbway','2026-02-12'),
  ('Marta Ribeiro','Corte Degradê / Fade',45.00,'pago','dinheiro','2026-02-12'),
  ('Ana Pereira','Corte Criança',65.00,'pago','cartao','2026-02-12'),
  ('Beatriz Santos','Corte Fade + Barba',55.00,'pago','cartao','2026-02-13'),
  ('Joana Ferreira','Barba com Toalha Quente',40.00,'pago','mbway','2026-02-13'),
  ('Cláudia Vieira','Corte Clássico',35.00,'pago','cartao','2026-02-13'),
  -- Semana 3 (Fev 16-20)
  ('Cláudia Vieira','Corte Degradê / Fade',45.00,'pago','dinheiro','2026-02-16'),
  ('Carolina Lopes','Corte Clássico',20.00,'pago','mbway','2026-02-16'),
  ('Sofia Costa','Corte + Barba',50.00,'pago','cartao','2026-02-16'),
  ('Beatriz Santos','Corte à Máquina',30.00,'pago','mbway','2026-02-16'),
  ('Sofia Costa','Barba com Toalha Quente',40.00,'pago','mbway','2026-02-17'),
  ('Diana Martins','Lavagem VIP',15.00,'pago','dinheiro','2026-02-17'),
  ('Inês Rodrigues','Corte Fade + Barba',55.00,'pago','cartao','2026-02-17'),
  ('Inês Rodrigues','Corte Clássico',35.00,'pago','cartao','2026-02-18'),
  ('Filipa Sousa','Corte + Barba',50.00,'pago','cartao','2026-02-18'),
  ('Marta Ribeiro','Corte Clássico',35.00,'pago','dinheiro','2026-02-18'),
  ('Teresa Almeida','Corte Clássico',35.00,'pago','mbway','2026-02-19'),
  ('Joana Ferreira','Corte à Máquina',30.00,'pago','dinheiro','2026-02-19'),
  -- Semana 4 (Fev 23-28)
  ('Maria Oliveira','Platinado / Madeixas',70.00,'pago','mbway','2026-02-23'),
  ('Maria Oliveira','Corte à Máquina',30.00,'pago','mbway','2026-02-23'),
  ('Carolina Lopes','Corte Degradê / Fade',45.00,'pago','cartao','2026-02-23'),
  ('Ana Pereira','Sobrancelha',40.00,'pago','cartao','2026-02-24'),
  ('Ana Pereira','Corte Degradê / Fade',45.00,'pago','cartao','2026-02-24'),
  ('Diana Martins','Sobrancelha',40.00,'pago','mbway','2026-02-24'),
  -- Hoje (pendentes)
  ('Maria Oliveira','Corte Clássico',35.00,'pendente','mbway','2026-02-28'),
  ('Cláudia Vieira','Corte Fade + Barba',55.00,'pendente','cartao','2026-02-28')
) AS b(cn, sn, amt, st, pm, d)
JOIN public.clients c ON c.name = b.cn;

-- 4. CAIXA (CASH REGISTER) - Dados diários para gráfico de fluxo
INSERT INTO public.cash_register (type, amount, description, payment_method, date) VALUES
  -- Semana 1 Fev
  ('entrada', 240.00, 'Serviços dia 02/02', 'misto', '2026-02-02'),
  ('entrada',  85.00, 'Produtos vendidos 02/02', 'misto', '2026-02-02'),
  ('entrada', 200.00, 'Serviços dia 03/02', 'misto', '2026-02-03'),
  ('entrada', 200.00, 'Serviços dia 04/02', 'misto', '2026-02-04'),
  ('entrada',  45.00, 'Produtos vendidos 04/02', 'mbway', '2026-02-04'),
  ('entrada', 145.00, 'Serviços dia 05/02', 'misto', '2026-02-05'),
  ('entrada', 155.00, 'Serviços dia 06/02', 'misto', '2026-02-06'),
  ('entrada',  60.00, 'Produtos vendidos 06/02', 'cartao', '2026-02-06'),
  ('saida',  1500.00, 'Renda do Salão', 'transferencia', '2026-02-01'),
  ('saida',   155.00, 'Seguro do Salão', 'transferencia', '2026-02-01'),
  ('saida',    38.00, 'Internet Fibra', 'transferencia', '2026-02-03'),
  ('saida',   520.00, 'Fornecedor Moyra', 'transferencia', '2026-02-04'),
  ('saida',   243.00, 'Eletricidade + Água', 'transferencia', '2026-02-05'),
  ('saida',   145.00, 'Fornecedor Staleks', 'transferencia', '2026-02-06'),
  -- Semana 2 Fev
  ('entrada', 165.00, 'Serviços dia 09/02', 'misto', '2026-02-09'),
  ('entrada',  70.00, 'Produtos vendidos 09/02', 'dinheiro', '2026-02-09'),
  ('entrada', 165.00, 'Serviços dia 10/02', 'misto', '2026-02-10'),
  ('entrada', 105.00, 'Serviços dia 11/02', 'misto', '2026-02-11'),
  ('entrada', 145.00, 'Serviços dia 12/02', 'misto', '2026-02-12'),
  ('entrada', 130.00, 'Serviços dia 13/02', 'misto', '2026-02-13'),
  ('entrada',  55.00, 'Produtos vendidos 13/02', 'cartao', '2026-02-13'),
  ('saida',   250.00, 'Instagram Ads', 'cartao', '2026-02-07'),
  ('saida',    72.00, 'Produtos Limpeza', 'dinheiro', '2026-02-10'),
  ('saida',   190.00, 'Manutenção AC', 'transferencia', '2026-02-12'),
  -- Semana 3 Fev
  ('entrada', 145.00, 'Serviços dia 16/02', 'misto', '2026-02-16'),
  ('entrada', 110.00, 'Serviços dia 17/02', 'misto', '2026-02-17'),
  ('entrada',  40.00, 'Produtos vendidos 17/02', 'mbway', '2026-02-17'),
  ('entrada', 120.00, 'Serviços dia 18/02', 'misto', '2026-02-18'),
  ('entrada',  65.00, 'Serviços dia 19/02', 'misto', '2026-02-19'),
  ('entrada',  80.00, 'Serviços dia 20/02', 'misto', '2026-02-20'),
  ('entrada',  35.00, 'Produtos vendidos 20/02', 'dinheiro', '2026-02-20'),
  ('saida',   310.00, 'Fornecedor OPI', 'transferencia', '2026-02-14'),
  ('saida',   280.00, 'Fornecedor CND', 'transferencia', '2026-02-17'),
  ('saida',   180.00, 'Google Ads', 'cartao', '2026-02-18'),
  ('saida',    95.00, 'Material descartável', 'dinheiro', '2026-02-20'),
  -- Semana 4 Fev
  ('entrada', 145.00, 'Serviços dia 23/02', 'misto', '2026-02-23'),
  ('entrada',  50.00, 'Produtos vendidos 23/02', 'cartao', '2026-02-23'),
  ('entrada', 125.00, 'Serviços dia 24/02', 'misto', '2026-02-24'),
  ('entrada',  90.00, 'Serviços dia 25/02', 'misto', '2026-02-25'),
  ('entrada',  40.00, 'Produtos vendidos 25/02', 'mbway', '2026-02-25'),
  ('entrada', 110.00, 'Serviços dia 26/02', 'misto', '2026-02-26'),
  ('entrada',  95.00, 'Serviços dia 27/02', 'misto', '2026-02-27'),
  ('entrada', 130.00, 'Serviços dia 28/02 (parcial)', 'misto', '2026-02-28'),
  ('saida',  4350.00, 'Salários Fevereiro', 'transferencia', '2026-02-25'),
  ('saida',   200.00, 'Contabilidade', 'transferencia', '2026-02-28');

-- 5. COMISSÕES COM team_member_id (ligadas ao profissional)
INSERT INTO public.commissions (team_member_id, member_name, amount, rate, date, status)
SELECT t.id, b.mn, b.amt, b.rt, b.d::date, b.st FROM
(VALUES
  -- Semana 1 (2-6 Fev)
  ('William',  112.00, 40, '2026-02-06', 'pago'),
  ('Rodrigo',      73.50, 35, '2026-02-06', 'pago'),
  ('Francisco',    98.00, 40, '2026-02-06', 'pago'),
  -- Semana 2 (9-13 Fev)
  ('William',  104.00, 40, '2026-02-13', 'pago'),
  ('Rodrigo',      66.50, 35, '2026-02-13', 'pago'),
  ('Francisco',    92.00, 40, '2026-02-13', 'pago'),
  -- Semana 3 (16-20 Fev)
  ('William',   88.00, 40, '2026-02-20', 'pago'),
  ('Rodrigo',      59.50, 35, '2026-02-20', 'pago'),
  ('Francisco',    84.00, 40, '2026-02-20', 'pago'),
  -- Semana 4 (23-28 Fev)
  ('William',   72.00, 40, '2026-02-27', 'pendente'),
  ('Rodrigo',      47.25, 35, '2026-02-27', 'pendente'),
  ('Francisco',    62.00, 40, '2026-02-27', 'pendente')
) AS b(mn, amt, rt, d, st)
JOIN public.team_members t ON t.name = b.mn;

-- ✅ CONCLUÍDO!
-- ~66 bookings com client_id + service_id + team_member_id
-- ~60 faturas com client_id
-- ~45 registos de caixa (entradas diárias + saídas)
-- 12 comissões ligadas a team_member_id
