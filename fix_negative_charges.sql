-- Migration: Saneamento e Prevenção de Cobranças Negativas
BEGIN;

  -- 1. Desativar momentaneamente a constraint para permitir a modificação de linhas corrompidas
  ALTER TABLE public.charges
  DROP CONSTRAINT IF EXISTS chk_charges_amount_positive;

  -- 2. Auditar e cancelar os registos corrompidos pendentes
  UPDATE public.charges
  SET status = 'canceled', description = description || ' [CANCELADA: Valor Original ' || amount || ']'
  WHERE amount <= 0 AND status = 'pending';

  -- 3. Opcionalmente, atualizar todas as cobranças negativas pagas apenas na descrição (se houverem)
  -- NOTA: Opcional, dependendo da conformidade contabilística desejada.

  -- 4. Reaplicar a restrição a nível de base de dados para NOVOS registos apenas
  -- O modificador 'NOT VALID' ignora as linhas antigas inalteradas.
  ALTER TABLE public.charges
  ADD CONSTRAINT chk_charges_amount_positive CHECK (amount > 0) NOT VALID;

COMMIT;
