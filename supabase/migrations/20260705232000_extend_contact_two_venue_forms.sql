alter table public.contact
  add column if not exists venue_name text,
  add column if not exists phone2 text,
  add column if not exists transport2 text,
  add column if not exists map_embed2 text,
  add column if not exists venue_name2 text;

comment on column public.contact.venue_name is '第一組道場名稱';
comment on column public.contact.phone2 is '第二組聯絡電話';
comment on column public.contact.transport2 is '第二組交通方式';
comment on column public.contact.map_embed2 is '第二組 Google Maps 嵌入網址';
comment on column public.contact.venue_name2 is '第二組道場名稱';

notify pgrst, 'reload schema';
