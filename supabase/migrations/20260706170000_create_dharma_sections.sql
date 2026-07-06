-- dharma-cms:入佛門法要小節表 + RLS
-- 兩層結構「章節 → 小節」以資料列承載:group_key 為固定章節枚舉(對應前台錨點),
-- 小節內文為純文字(不存 HTML/Markdown,見 dharma-content spec)

create table if not exists public.dharma_sections (
  id bigint generated always as identity primary key,
  group_key text not null check (group_key in ('intro', 'sanjie', 'wujie', 'sanxue')),
  title text,
  content text not null,
  seq integer not null,
  status text not null default '草稿' check (status in ('草稿', '已發布')),
  created_at timestamptz not null default now()
);

create index if not exists dharma_sections_status_group_seq_idx
  on public.dharma_sections (status, group_key, seq);

alter table public.dharma_sections enable row level security;

grant select on public.dharma_sections to anon;
grant select, insert, update, delete on public.dharma_sections to authenticated;
grant select, insert, update, delete on public.dharma_sections to service_role;
grant usage, select on sequence public.dharma_sections_id_seq to authenticated, service_role;

drop policy if exists "public read published dharma sections" on public.dharma_sections;
create policy "public read published dharma sections"
  on public.dharma_sections
  for select
  to anon
  using (status = '已發布');

drop policy if exists "admin full access dharma sections" on public.dharma_sections;
create policy "admin full access dharma sections"
  on public.dharma_sections
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());
