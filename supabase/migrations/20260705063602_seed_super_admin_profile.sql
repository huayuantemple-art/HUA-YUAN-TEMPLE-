-- 1.2 為既有最高權限帳號建立 profiles 紀錄並設為 super_admin
-- 專案目前僅有一個 auth.users 帳號(既有後台管理者)
insert into public.profiles (id, email, role)
select u.id, u.email, 'super_admin'::public.admin_role
from auth.users u
where not exists (
  select 1 from public.profiles p where p.id = u.id
);
