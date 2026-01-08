-- Enhancing Profiles Table for Detailed Student Data

-- 1. Add new columns for personal information
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS first_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS middle_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS last_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS birth_date DATE,
ADD COLUMN IF NOT EXISTS gender VARCHAR(20),
ADD COLUMN IF NOT EXISTS nationality VARCHAR(100),
ADD COLUMN IF NOT EXISTS address TEXT;

-- 2. Add columns for Identification
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS document_type VARCHAR(50), -- 'BI', 'PASSPORT', 'DIRE', etc.
ADD COLUMN IF NOT EXISTS document_number VARCHAR(50);

-- 3. Add columns for Contact and Parents
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS phone_number VARCHAR(20),
ADD COLUMN IF NOT EXISTS father_name VARCHAR(200),
ADD COLUMN IF NOT EXISTS mother_name VARCHAR(200);

-- 4. Create index for faster search by name or document
CREATE INDEX IF NOT EXISTS idx_profiles_document ON public.profiles(document_number);
CREATE INDEX IF NOT EXISTS idx_profiles_names ON public.profiles(first_name, last_name);
