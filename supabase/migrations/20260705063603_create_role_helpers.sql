-- 1.3 角色判斷 helper,供 RLS policy 使用
-- security definer:繞過 profiles 自身的 RLS 以避免遞迴;search_path 固定為空以防挾持
-- 1.7 防呆:登入但無 profiles 紀錄 → 回傳 null/false,視為無權限

create or replace function public.current_app_role()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select p.role::text
  from public.profiles p
  where p.id = auth.uid()
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    (select p.role in ('super_admin', 'admin')
     from public.profiles p
     where p.id = auth.uid()),
    false
  )
$$;

create or replace function public.is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    (select p.role = 'super_admin'
     from public.profiles p
     where p.id = auth.uid()),
    false
  )
$$;

grant execute on function public.current_app_role() to anon, authenticated;
grant execute on function public.is_admin() to anon, authenticated;
grant execute on function public.is_super_admin() to anon, authenticated;

-- profiles 自身的 RLS:本人可讀自己的 profile;super_admin 可管理全部
create policy "authenticated read own profile"
  on public.profiles
  for select
  to authenticated
  using (id = auth.uid());

create policy "super_admin manages profiles"
  on public.profiles
  for all
  to authenticated
  using (public.is_super_admin())
  with check (public.is_super_admin());
