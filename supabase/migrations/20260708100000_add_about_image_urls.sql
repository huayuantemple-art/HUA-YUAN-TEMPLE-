-- 關於頁照片輪播(about-photo-carousel):image_urls 為照片網址陣列(順序=輪播順序),
-- image_url 保留為舊欄位後備(image_urls 空時前台退回單張)。
alter table public.about
  add column if not exists image_urls jsonb;

comment on column public.about.image_urls is '關於頁輪播照片網址陣列(JSON array of string,順序即輪播順序);null/空陣列時前台退回 image_url';

-- 回填:既有意境照片 + 大殿三寶佛(原為前台寫死的靜態檔)
update public.about
set image_urls = to_jsonb(
  array_remove(array[image_url, 'https://huayuan-web.vercel.app/images/about-altar.jpg'], null)
)
where id = 1 and image_urls is null;

notify pgrst, 'reload schema';
