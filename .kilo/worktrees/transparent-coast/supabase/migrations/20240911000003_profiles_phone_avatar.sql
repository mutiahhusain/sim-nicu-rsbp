-- Migration: 20240911000003_profiles_phone_avatar
-- Tambah kolom phone ke profiles + dokumentasi bucket avatars.

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone text;

COMMENT ON COLUMN public.profiles.phone IS 'Nomor HP pengguna';

-- Dokumentasi: bucket 'avatars' untuk foto profil.
-- Buat bucket 'avatars' di Supabase Storage (Settings → Storage → New bucket, Public).
-- Policy anon contoh (jalankan di SQL Editor):
--   create policy "Avatar upload anon" on storage.objects
--     for insert to anon with check (bucket_id = 'avatars' and auth.uid() = split_part(name, '.', 1)::uuid);
--   create policy "Avatar read anon" on storage.objects
--     for select to anon using (bucket_id = 'avatars');
--   create policy "Avatar delete anon" on storage.objects
--     for delete to anon using (bucket_id = 'avatars' and auth.uid() = split_part(name, '.', 1)::uuid);
