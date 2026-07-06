-- admin-content-coverage:contact/about 欄位補齊與站台圖片 bucket

alter table public.contact
  add column if not exists icon_url text,
  add column if not exists icon_url2 text,
  drop column if exists email,
  drop column if exists hours;

comment on column public.contact.icon_url is '第一組道場 icon 公開網址';
comment on column public.contact.icon_url2 is '第二組道場 icon 公開網址';

alter table public.about
  add column if not exists image_url text,
  add column if not exists value1_desc text,
  add column if not exists value2_desc text,
  add column if not exists value3_desc text;

comment on column public.about.image_url is '關於頁道場意境照片公開網址';
comment on column public.about.value1_desc is '核心理念一內文';
comment on column public.about.value2_desc is '核心理念二內文';
comment on column public.about.value3_desc is '核心理念三內文';

insert into storage.buckets (id, name, public)
values ('images', 'images', true)
on conflict (id) do nothing;

create policy "images_admin_read" on storage.objects
  for select to authenticated
  using (bucket_id = 'images' and public.is_admin());

create policy "images_admin_insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'images' and public.is_admin());

create policy "images_admin_update" on storage.objects
  for update to authenticated
  using (bucket_id = 'images' and public.is_admin())
  with check (bucket_id = 'images' and public.is_admin());

create policy "images_admin_delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'images' and public.is_admin());

notify pgrst, 'reload schema';
