-- 佛法文檔分類:區分顯示於「法寶略節」或「法師說法」頁
-- 既有文檔一律預設為「法寶略節」(不改變現行行為)。
-- 前台依此欄位分頁顯示;後台上傳時選擇分類。線上閱讀(sutras)仍經 document_id 連動,
-- 各頁以「所連文檔的分類」過濾,毋須改動 sutras 結構。

alter table public.documents
  add column if not exists category text not null default '法寶略節';

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'documents_category_chk'
  ) then
    alter table public.documents
      add constraint documents_category_chk
      check (category in ('法寶略節', '法師說法'));
  end if;
end $$;
