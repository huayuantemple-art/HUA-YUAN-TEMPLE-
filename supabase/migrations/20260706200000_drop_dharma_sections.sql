-- 移除法要管理(dharma-cms 回退):前台 /dharma 路由與後台模組已移除,
-- 法要內容不再需要後台維護,砍除 dharma_sections 表
drop table if exists public.dharma_sections;
