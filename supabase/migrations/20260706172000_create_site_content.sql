-- site-copy-cms:網站文案 key-value 表 + RLS
-- key 清單與預設值定義於 packages/shared(SITE_COPY);空表也能上線 — 前台一律 fallback 至預設值,
-- 故不做 seed(見 site-copy-cms design 決策 2)

create table if not exists public.site_content (
  key text primary key,
  value text,
  updated_at timestamptz not null default now()
);

alter table public.site_content enable row level security;

grant select on public.site_content to anon;
grant select, insert, update, delete on public.site_content to authenticated;
grant select, insert, update, delete on public.site_content to service_role;

drop policy if exists "public read site content" on public.site_content;
create policy "public read site content"
  on public.site_content
  for select
  to anon
  using (true);

drop policy if exists "admin full access site content" on public.site_content;
create policy "admin full access site content"
  on public.site_content
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());
