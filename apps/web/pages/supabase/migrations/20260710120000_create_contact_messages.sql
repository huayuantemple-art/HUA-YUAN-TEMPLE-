-- 學員提問(聯絡頁表單):匿名可新增,管理者可讀取與標記回覆狀態
-- RLS 對齊 registrations:anon 僅 INSERT(無 SELECT policy 即拒絕匿名讀取)

create table if not exists public.contact_messages (
  id bigint generated always as identity primary key,
  name text not null,
  contact text,
  message text not null,
  status text not null default '未回覆',
  created_at timestamptz not null default now()
);

alter table public.contact_messages enable row level security;

grant insert on public.contact_messages to anon;
grant select, insert, update, delete on public.contact_messages to authenticated;
grant select, insert, update, delete on public.contact_messages to service_role;

drop policy if exists "public insert contact messages" on public.contact_messages;
create policy "public insert contact messages"
  on public.contact_messages
  for insert
  to anon
  with check (true);

drop policy if exists "admin read contact messages" on public.contact_messages;
create policy "admin read contact messages"
  on public.contact_messages
  for select
  to authenticated
  using (public.is_admin());

drop policy if exists "admin update contact messages" on public.contact_messages;
create policy "admin update contact messages"
  on public.contact_messages
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());
