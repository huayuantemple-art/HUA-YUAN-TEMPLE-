-- 佛法文檔 PDF bucket(tasks 7.1):公開讀取,admin/super_admin 可上傳/更新/刪除
insert into storage.buckets (id, name, public)
values ('pdfs', 'pdfs', true)
on conflict (id) do nothing;

create policy "pdfs_public_read" on storage.objects
  for select using (bucket_id = 'pdfs');

create policy "pdfs_admin_insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'pdfs' and public.is_admin());

create policy "pdfs_admin_update" on storage.objects
  for update to authenticated
  using (bucket_id = 'pdfs' and public.is_admin())
  with check (bucket_id = 'pdfs' and public.is_admin());

create policy "pdfs_admin_delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'pdfs' and public.is_admin());
