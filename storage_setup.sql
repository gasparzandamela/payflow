-- Create the 'avatars' bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Policy to allow public read access to avatars
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'avatars' );

-- Policy to allow authenticated users to upload avatars to their own folder
DROP POLICY IF EXISTS "Authenticated users can upload avatars" ON storage.objects;
CREATE POLICY "Authenticated users can upload avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( 
  bucket_id = 'avatars' AND 
  name LIKE (auth.uid()::text || '/%')
);
 
-- Policy to allow users to manage their own avatars (UPDATE, DELETE)
DROP POLICY IF EXISTS "Users can manage their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatars" ON storage.objects;
CREATE POLICY "Users can manage their own avatars"
ON storage.objects FOR ALL
TO authenticated
USING ( 
  bucket_id = 'avatars' AND 
  name LIKE (auth.uid()::text || '/%')
)
WITH CHECK (
  bucket_id = 'avatars' AND 
  name LIKE (auth.uid()::text || '/%')
);
