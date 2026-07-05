#!/usr/bin/env bash
# 任務 6.4:驗證帳號管理 Edge Function 拒絕未授權呼叫。
# 需先部署 supabase/functions/admin-accounts。
# 用法:SUPABASE_URL=... SUPABASE_ANON_KEY=... ./scripts/edge-fn-verify.sh
set -euo pipefail

: "${SUPABASE_URL:?請設定 SUPABASE_URL}"
: "${SUPABASE_ANON_KEY:?請設定 SUPABASE_ANON_KEY}"
FN_URL="${SUPABASE_URL%/}/functions/v1/admin-accounts"

pass=0
fail=0

check() {
  local name="$1" expected="$2" actual="$3"
  if [[ "$actual" == "$expected" ]]; then
    echo "PASS  $name (HTTP $actual)"
    pass=$((pass + 1))
  else
    echo "FAIL  $name (expected $expected, got $actual)"
    fail=$((fail + 1))
  fi
}

# 1. 完全匿名(無任何憑證)→ 拒絕
code=$(curl -s -o /dev/null -w '%{http_code}' -X POST "$FN_URL" \
  -H 'Content-Type: application/json' \
  -d '{"action":"create","email":"x@example.com","password":"password123"}')
check "匿名(無憑證)呼叫被拒" "401" "$code"

# 2. 僅帶 anon/publishable key(非使用者 JWT)→ 拒絕
code=$(curl -s -o /dev/null -w '%{http_code}' -X POST "$FN_URL" \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
  -H 'Content-Type: application/json' \
  -d '{"action":"create","email":"x@example.com","password":"password123"}')
check "anon key 冒充 JWT 呼叫被拒" "401" "$code"

# 3. 一般 admin(非 super_admin)JWT → 403
#    需提供 ADMIN_EMAIL / ADMIN_PASSWORD(非 super_admin 測試帳號)才執行
if [[ -n "${ADMIN_EMAIL:-}" && -n "${ADMIN_PASSWORD:-}" ]]; then
  token=$(curl -s -X POST "${SUPABASE_URL%/}/auth/v1/token?grant_type=password" \
    -H "apikey: $SUPABASE_ANON_KEY" -H 'Content-Type: application/json' \
    -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\"}" |
    python3 -c 'import json,sys; print(json.load(sys.stdin).get("access_token",""))')
  if [[ -n "$token" ]]; then
    code=$(curl -s -o /dev/null -w '%{http_code}' -X POST "$FN_URL" \
      -H "apikey: $SUPABASE_ANON_KEY" \
      -H "Authorization: Bearer $token" \
      -H 'Content-Type: application/json' \
      -d '{"action":"create","email":"x@example.com","password":"password123"}')
    check "非 super_admin JWT 呼叫被拒" "403" "$code"
  else
    echo "SKIP  非 super_admin 測試:登入失敗(檢查 ADMIN_EMAIL/ADMIN_PASSWORD)"
  fi
else
  echo "SKIP  非 super_admin 測試:未提供 ADMIN_EMAIL/ADMIN_PASSWORD"
fi

echo "----"
echo "PASS $pass / FAIL $fail"
[[ $fail -eq 0 ]]
