-- Migration to add charges table and update profiles
-- Table for tuition charges / fees
CREATE TABLE IF NOT EXISTS public.charges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    description VARCHAR(200) NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'paid'
    due_date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES public.profiles(id)
);

-- Enable RLS for charges
ALTER TABLE public.charges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own charges" ON public.charges
    FOR SELECT TO authenticated USING (auth.uid() = student_id);

CREATE POLICY "Finance staff can manage charges" ON public.charges
    FOR ALL TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'admin_financeiro')
        )
    );

-- Update profiles to include settings fields
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS pin VARCHAR(10);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
