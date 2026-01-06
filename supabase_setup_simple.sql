-- ============================================================================
-- PAYFLOW - SCRIPT DE CONFIGURAÇÃO SIMPLIFICADO
-- ============================================================================
-- Execute este script no Supabase SQL Editor
-- Configura apenas as tabelas necessárias: profiles e transactions
-- ============================================================================

-- ============================================================================
-- PARTE 1: GARANTIR ESTRUTURA DAS TABELAS
-- ============================================================================

-- Tabela de perfis
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(200),
    email VARCHAR(200),
    role VARCHAR(50) DEFAULT 'student',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Garantir que as colunas existem (caso a tabela já existisse com estrutura diferente)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS name VARCHAR(200);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email VARCHAR(200);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'student';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Corrigir restrições herdadas que podem bloquear novos papéis
DO $$ 
BEGIN 
    ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
END $$;

-- Tabela de transacções
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    description VARCHAR(200),
    amount DECIMAL(12,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'Pendente',
    payment_method VARCHAR(50),
    reference VARCHAR(50),
    entity VARCHAR(10),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- PARTE 2: REMOVER TABELAS DESNECESSÁRIAS (se existirem)
-- ============================================================================

DROP TABLE IF EXISTS public.role_permissions CASCADE;
DROP TABLE IF EXISTS public.user_roles CASCADE;
DROP TABLE IF EXISTS public.permissions CASCADE;
DROP TABLE IF EXISTS public.operational_limits CASCADE;
DROP TABLE IF EXISTS public.audit_log CASCADE;
DROP TABLE IF EXISTS public.roles CASCADE;
DROP TABLE IF EXISTS public.tuition_plans CASCADE;
DROP TABLE IF EXISTS public.class_tuition_values CASCADE;
DROP TABLE IF EXISTS public.penalty_config CASCADE;
DROP TABLE IF EXISTS public.penalty_tiers CASCADE;
DROP TABLE IF EXISTS public.interest_config CASCADE;
DROP TABLE IF EXISTS public.discount_policies CASCADE;
DROP TABLE IF EXISTS public.scholarships CASCADE;
DROP TABLE IF EXISTS public.charges CASCADE;
DROP TABLE IF EXISTS public.payments CASCADE;
DROP TABLE IF EXISTS public.refunds CASCADE;
DROP TABLE IF EXISTS public.financial_documents CASCADE;
DROP TABLE IF EXISTS public.role_incompatibilities CASCADE;

-- ============================================================================
-- PARTE 3: FUNÇÃO PARA VERIFICAR ADMIN
-- ============================================================================

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'admin_financeiro', 'direccao')
  );
END;
$$;

-- ============================================================================
-- PARTE 4: CONFIGURAR RLS EM PROFILES
-- ============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_owner" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_admin" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_owner" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;

CREATE POLICY "profiles_select_owner" ON public.profiles
FOR SELECT TO authenticated USING (auth.uid() = id);

CREATE POLICY "profiles_select_admin" ON public.profiles
FOR SELECT TO authenticated USING (public.is_admin());

CREATE POLICY "profiles_update_owner" ON public.profiles
FOR UPDATE TO authenticated USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own" ON public.profiles
FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- ============================================================================
-- PARTE 5: CONFIGURAR RLS EM TRANSACTIONS
-- ============================================================================

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "transactions_select_owner" ON public.transactions;
DROP POLICY IF EXISTS "transactions_select_admin" ON public.transactions;
DROP POLICY IF EXISTS "transactions_insert_owner" ON public.transactions;
DROP POLICY IF EXISTS "transactions_update_admin" ON public.transactions;

CREATE POLICY "transactions_select_owner" ON public.transactions
FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "transactions_select_admin" ON public.transactions
FOR SELECT TO authenticated USING (public.is_admin());

CREATE POLICY "transactions_insert_owner" ON public.transactions
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "transactions_update_admin" ON public.transactions
FOR UPDATE TO authenticated USING (public.is_admin());

-- ============================================================================
-- PARTE 7: TRIGGER PARA CRIAR PERFIL AUTOMATICAMENTE NO SIGNUP
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)), 
    new.email, 
    'student'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Remover trigger se já existir
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Criar trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- PARTE 8: ÍNDICES PARA PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_transactions_user ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON public.transactions(status);

-- ============================================================================
-- PARTE 7: VERIFICAÇÃO
-- ============================================================================

SELECT 
    tablename,
    CASE WHEN rowsecurity THEN '✅ PROTECTED' ELSE '❌ UNRESTRICTED' END as status
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;
