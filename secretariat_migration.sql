-- Migration for Secretariat Dashboard Features

-- 1. Add status to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active';

-- 2. Create Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES public.profiles(id)
);

-- 3. Create Service Logs Table (Atendimentos)
CREATE TABLE IF NOT EXISTS public.service_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    staff_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    service_type VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create Policies for Notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications" ON public.notifications
    FOR SELECT TO authenticated USING (auth.uid() = recipient_id);

CREATE POLICY "Staff can view created notifications" ON public.notifications
    FOR SELECT TO authenticated USING (auth.uid() = created_by OR public.is_admin());

CREATE POLICY "Staff can insert notifications" ON public.notifications
    FOR INSERT TO authenticated WITH CHECK (public.is_admin()); -- Using is_admin() which checks for 'admin', 'admin_financeiro', 'direcao'. Ideally we update is_admin to include 'secretaria'.

-- 5. Create Policies for Service Logs
ALTER TABLE public.service_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view all service logs" ON public.service_logs
    FOR SELECT TO authenticated USING (public.is_admin());

CREATE POLICY "Staff can insert service logs" ON public.service_logs
    FOR INSERT TO authenticated WITH CHECK (public.is_admin());

-- 6. Update is_admin function to include 'secretaria'
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'admin_financeiro', 'direcao', 'secretaria')
  );
END;
$$;
