-- 1. Desabilitar RLS temporariamente para limpeza profunda
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions DISABLE ROW LEVEL SECURITY;

-- 2. Remover todas as políticas antigas (para evitar conflitos)
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_owner" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_admin" ON public.profiles;

DROP POLICY IF EXISTS "Users can view own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can insert own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Admins can view all transactions" ON public.transactions;
DROP POLICY IF EXISTS "transactions_select_owner" ON public.transactions;
DROP POLICY IF EXISTS "transactions_select_admin" ON public.transactions;

-- 3. Criar a FUNÇÃO DE SEGURANÇA que evita a recursão
-- O segredo está no 'SECURITY DEFINER' e no 'SET search_path = public'
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$;

-- 4. Reabilitar RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- 5. NOVAS POLÍTICAS PARA PROFILES (Sem recursão)
-- Regra 1: Usuário vê o próprio perfil (Lógica simples, não recursiva)
CREATE POLICY "profiles_select_owner" ON public.profiles
FOR SELECT TO authenticated USING (auth.uid() = id);

-- Regra 2: Admin vê todos (Usa a função de segurança para quebrar o loop)
CREATE POLICY "profiles_select_admin" ON public.profiles
FOR SELECT TO authenticated USING (public.is_admin());

CREATE POLICY "profiles_update_owner" ON public.profiles
FOR UPDATE TO authenticated USING (auth.uid() = id);

-- 6. NOVAS POLÍTICAS PARA TRANSACTIONS
-- Regra 1: Usuário vê suas próprias transações
CREATE POLICY "transactions_select_owner" ON public.transactions
FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Regra 2: Admin vê todas
CREATE POLICY "transactions_select_admin" ON public.transactions
FOR SELECT TO authenticated USING (public.is_admin());

-- Regra 3: Inserção de transações
CREATE POLICY "transactions_insert_owner" ON public.transactions
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);