-- ============================================================================
-- GESTÃO DE PAPÉIS (ROLES) - PAYFLOW
-- ============================================================================

-- OPÇÃO 0: CORRIGIR ESTRUTURA DA TABELA PROFILES (Execute isto para resolver erros de 'column does not exist' ou 'constraint')
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS name VARCHAR(200);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email VARCHAR(200);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'student';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- OPÇÃO 1: TORNAR UM UTILIZADOR EXISTENTE EM "ADMIN FINANCEIRO"
-- Substitua 'email@exemplo.com' pelo email do utilizador real.
UPDATE public.profiles
SET role = 'admin_financeiro'
WHERE email = 'email@exemplo.com';


-- OPÇÃO 2: VERIFICAR TODOS OS UTILIZADORES E SEUS PAPÉIS
SELECT id, email, name, role, created_at
FROM public.profiles
ORDER BY role DESC;


-- OPÇÃO 3: REVERTER UM UTILIZADOR PARA "STUDENT"
-- Substitua 'email@exemplo.com' pelo email do utilizador real.
UPDATE public.profiles
SET role = 'student'
WHERE email = 'email@exemplo.com';


-- NOTA: Para criar um NOVO utilizador:
-- 1. Use o menu "Authentication" no dashboard do Supabase.
-- 2. Crie o utilizador com o email desejado.
-- 3. Execute este script (OPÇÃO 1) com o email do novo utilizador.
