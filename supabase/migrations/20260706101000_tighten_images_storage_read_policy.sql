-- Supabase advisor:public bucket broad SELECT 會允許列目錄。
-- images bucket 的公開物件 URL 由 bucket public=true 提供;RLS SELECT 僅保留給 admin upsert 使用。
drop policy if exists "images_public_read" on storage.objects;
drop policy if exists "images_admin_read" on storage.objects;

create policy "images_admin_read" on storage.objects
  for select to authenticated
  using (bucket_id = 'images' and public.is_admin());
