-- 線上閱讀與佛法文檔連動(auto-sync-reading-from-documents):
-- sutras.document_id 為對應真相來源;前台線上閱讀僅列 document_id 非空之已發布經文。
-- on delete set null 僅為直接動 DB 時的保險;後台刪文檔會顯式一併刪經文。
alter table public.sutras
  add column if not exists document_id bigint references public.documents(id) on delete set null;

create index if not exists sutras_document_id_idx on public.sutras (document_id);

comment on column public.sutras.document_id is '對應之佛法文檔(documents.id);null=無對應(如心經,不列入線上閱讀清單)';

-- 回填既有對應:標題已與文檔名稱逐字一致(2026-07-07 對齊),以精確比對建立關聯
update public.sutras s
set document_id = d.id
from public.documents d
where s.document_id is null
  and s.title = d.name;

notify pgrst, 'reload schema';
