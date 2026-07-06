-- 法寶略節 DOCX 下載文檔 metadata。
-- 注意:這只建立 public.documents 的下載列表資料;
-- 檔案本體需上傳到 Storage bucket "pdfs",key 對應 1.docx ... 17.docx。

with source(seq, name, description, filename, status) as (
  values
    (1, '大般若波羅蜜多經卷第五百七十四', '大般若波羅蜜多經卷第五百七十四', '1.docx', '已發布'),
    (2, '大般若波羅蜜多經卷第五百七十五', '大般若波羅蜜多經卷第五百七十五', '2.docx', '已發布'),
    (3, '大般若波羅蜜多經卷第五百七十八', '大般若波羅蜜多經卷第五百七十八', '3.docx', '已發布'),
    (4, '妙法蓮華經', '妙法蓮華經', '4.docx', '已發布'),
    (5, '四決定說', '四決定說', '5.docx', '已發布'),
    (6, '般泥洹經', '般泥洹經', '6.docx', '已發布'),
    (7, '佛說菩薩投身飴餓虎起塔因緣經', '佛說菩薩投身飴餓虎起塔因緣經', '7.docx', '已發布'),
    (8, '佛說長阿含經', '佛說長阿含經', '8.docx', '已發布'),
    (9, '持人菩薩經卷第四', '持人菩薩經卷第四', '9.docx', '已發布'),
    (10, '陰持入經', '陰持入經', '10.docx', '已發布'),
    (11, '稱讚淨土佛攝受經', '稱讚淨土佛攝受經', '11.docx', '已發布'),
    (12, '佛說阿彌陀經', '佛說阿彌陀經', '12.docx', '已發布'),
    (13, '佛說無量壽經(卷上)', '佛說無量壽經(卷上)', '13.docx', '已發布'),
    (14, '佛說無量壽經(卷下)', '佛說無量壽經(卷下)', '14.docx', '已發布'),
    (15, '佛說觀無量壽佛經', '佛說觀無量壽佛經', '15.docx', '已發布'),
    (16, '華嚴經普賢行願品', '華嚴經普賢行願品', '16.docx', '已發布'),
    (17, '佛說三歸五戒慈心厭離功德經', '佛說三歸五戒慈心厭離功德經', '17.docx', '已發布')
),
updated as (
  update public.documents d
  set
    name = s.name,
    description = s.description,
    status = s.status,
    created_at = '2026-07-06 07:30:00+00'::timestamptz + make_interval(secs => s.seq)
  from source s
  where d.filename = s.filename
  returning d.filename
)
insert into public.documents (name, description, filename, status, created_at)
select
  s.name,
  s.description,
  s.filename,
  s.status,
  '2026-07-06 07:30:00+00'::timestamptz + make_interval(secs => s.seq)
from source s
where not exists (
  select 1
  from updated u
  where u.filename = s.filename
);

notify pgrst, 'reload schema';
