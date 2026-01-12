-- Migration: Add payment_method column to transactions table
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS payment_method TEXT;

-- Update RLS policies to ensure user_id is used everywhere (if not already handled)
-- (The screenshot shows user_id exists, so we are good there)

-- Refresh schema cache reminder: After running this, the error should disappear.
