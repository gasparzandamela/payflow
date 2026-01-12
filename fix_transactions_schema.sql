-- Migration: Add payment_method column and allow nulls for entity/reference
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS payment_method TEXT;
ALTER TABLE public.transactions ALTER COLUMN entity DROP NOT NULL;
ALTER TABLE public.transactions ALTER COLUMN reference DROP NOT NULL;

-- Update RLS policies to ensure user_id is used everywhere (if not already handled)
-- (The screenshot shows user_id exists, so we are good there)

-- Refresh schema cache reminder: After running this, the error should disappear.
