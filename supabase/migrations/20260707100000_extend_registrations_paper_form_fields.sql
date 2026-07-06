-- 線上報名欄位比照紙本「佛法入門班報名表」(align-signup-with-paper-form)
-- 皆為選填 text;複選題以「、」串接存單一欄位。RLS 為列層級,不需調整。
alter table public.registrations
  add column if not exists age text,
  add column if not exists gender text,
  add column if not exists venue text,
  add column if not exists dharma_background text,
  add column if not exists referral_source text,
  add column if not exists expectation text;

comment on column public.registrations.age is '年齡(必填,前端驗證 1~3 位數字)';
comment on column public.registrations.gender is '性別:男/女';
comment on column public.registrations.venue is '上課地點:華圓新莊講堂/華圓台東講堂';
comment on column public.registrations.dharma_background is '修學背景(單選):初次接觸佛法/曾自行閱讀相關書籍/曾於道場或寺院修學';
comment on column public.registrations.referral_source is '如何得知本課程(複選,「、」串接)';
comment on column public.registrations.expectation is '希望從課程中獲得什麼(複選,「、」串接)';
