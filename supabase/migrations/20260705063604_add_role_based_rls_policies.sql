-- 1.4 內容表:匿名僅 SELECT 公開狀態(既有 policy 已涵蓋);admin/super_admin 全 CRUD
-- 既有 policy(保留不動):
--   announcements/videos/documents: public read where status = '已發布'
--   courses: public read where status in ('招生中','額滿')

create policy "admin full access announcements"
  on public.announcements
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "admin full access courses"
  on public.courses
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "admin full access videos"
  on public.videos
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "admin full access documents"
  on public.documents
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- 1.5 about / contact:匿名 SELECT(既有 policy 已涵蓋);admin/super_admin UPDATE
create policy "admin update about"
  on public.about
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "admin update contact"
  on public.contact
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- 1.6 registrations:匿名僅 INSERT(既有 policy 已涵蓋);禁止匿名 SELECT(無 SELECT policy 即拒絕);
--     admin/super_admin 可 SELECT(供管理與 CSV 匯出)
create policy "admin read registrations"
  on public.registrations
  for select
  to authenticated
  using (public.is_admin());
