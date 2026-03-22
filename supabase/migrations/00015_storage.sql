-- Migration 00015: Supabase Storage bucket for college images
-- Public read. Admin write. Max 5MB. JPEG/PNG/WebP only.
-- NOTE: This is documented for reference. The bucket is typically
-- created via the Supabase Dashboard or Supabase CLI.

-- Create the storage bucket (run via Supabase dashboard if SQL doesn't work):
-- INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
-- VALUES (
--   'college-images',
--   'college-images',
--   true,
--   5242880,  -- 5MB
--   ARRAY['image/jpeg', 'image/png', 'image/webp']
-- );

-- Storage policies (run via Supabase dashboard):
-- Allow public read:
-- CREATE POLICY "Public read" ON storage.objects
--   FOR SELECT USING (bucket_id = 'college-images');

-- Allow admin upload:
-- CREATE POLICY "Admin upload" ON storage.objects
--   FOR INSERT WITH CHECK (
--     bucket_id = 'college-images'
--     AND EXISTS (SELECT 1 FROM public.users WHERE auth_id = auth.uid() AND role = 'admin')
--   );

-- Allow admin delete:
-- CREATE POLICY "Admin delete" ON storage.objects
--   FOR DELETE USING (
--     bucket_id = 'college-images'
--     AND EXISTS (SELECT 1 FROM public.users WHERE auth_id = auth.uid() AND role = 'admin')
--   );
