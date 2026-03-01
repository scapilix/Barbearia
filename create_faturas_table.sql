-- =============================================
-- TO BEAUTY ERP - TABELA DE FATURAS (COMPRA/VENDA COM ANEXOS)
-- Execute este script no SQL Editor do Supabase
-- =============================================

CREATE TABLE IF NOT EXISTS public.faturas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL DEFAULT 'venda', -- 'compra' ou 'venda'
  description TEXT NOT NULL,
  entity_name TEXT, -- Nome do Cliente (se venda) ou Fornecedor (se compra)
  nif TEXT,
  amount NUMERIC DEFAULT 0,
  date DATE DEFAULT CURRENT_DATE,
  status TEXT DEFAULT 'pago',
  payment_method TEXT DEFAULT 'dinheiro',
  attachment_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Ativar RLS
ALTER TABLE public.faturas ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança
CREATE POLICY "Enable read access for all users" ON public.faturas FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON public.faturas FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON public.faturas FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON public.faturas FOR DELETE USING (true);
