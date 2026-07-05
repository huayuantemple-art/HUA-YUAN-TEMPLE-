-- 1.1 後台管理者角色表:每筆對應一個 auth.users 帳號
create type public.admin_role as enum ('super_admin', 'admin');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  role public.admin_role not null default 'admin',
  created_at timestamptz not null default now()
);

comment on table public.profiles is '後台管理者角色(super_admin / admin),對應 auth.users;RLS 授權依角色判斷';

alter table public.profiles enable row level security;
