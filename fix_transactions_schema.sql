-- Migration: Add extra columns and allow nulls for entity/reference
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS payment_method TEXT;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS charge_id UUID;
ALTER TABLE public.transactions ALTER COLUMN entity DROP NOT NULL;
ALTER TABLE public.transactions ALTER COLUMN reference DROP NOT NULL;

-- Allow students to update the status of their own charges to 'paid'
DROP POLICY IF EXISTS "Users can update own charges" ON public.charges;
CREATE POLICY "Users can update own charges" ON public.charges
    FOR UPDATE TO authenticated 
    USING (auth.uid() = student_id)
    WITH CHECK (auth.uid() = student_id);
