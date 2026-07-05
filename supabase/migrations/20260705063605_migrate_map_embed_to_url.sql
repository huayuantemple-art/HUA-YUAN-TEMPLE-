-- 1.8 將既有 contact.map_embed 由 iframe HTML 轉為純網址
-- 之後 map_embed 只儲存 Google Maps 嵌入網址,由前端以白名單安全組成 iframe
update public.contact
set map_embed = coalesce(substring(map_embed from 'src="([^"]+)"'), '')
where map_embed like '%<iframe%';
