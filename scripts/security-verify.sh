#!/usr/bin/env bash
# 1.11 安全驗證:以 anon key 對每張表嘗試寫入與讀取 registrations,確認 RLS 全數擋下。
# 用法: ./scripts/security-verify.sh [ANON_KEY]
set -uo pipefail

SUPABASE_URL="https://cnsgjxqdyuondthmoqwf.supabase.co"
ANON_KEY="${1:-sb_publishable_MIlOAMxDIBzqRvDAxeOMCA_-YU-xQtW}"

PASS=0
FAIL=0

req() { # method path body [prefer] → 印出 "HTTP_CODE|BODY"
  local method="$1" path="$2" body="${3:-}" prefer="${4:-return=representation}"
  local args=(-sS -X "$method" "${SUPABASE_URL}/rest/v1/${path}"
    -H "apikey: ${ANON_KEY}" -H "Authorization: Bearer ${ANON_KEY}"
    -H "Content-Type: application/json" -H "Prefer: ${prefer}"
    -w $'\n%{http_code}')
  [[ -n "$body" ]] && args+=(-d "$body")
  local out; out="$(curl "${args[@]}")"
  local code="${out##*$'\n'}"
  local resp="${out%$'\n'*}"
  echo "${code}|${resp}"
}

check() { # 描述 實際 期望模式(regex against "CODE|BODY")
  local desc="$1" actual="$2" pattern="$3"
  if [[ "$actual" =~ $pattern ]]; then
    echo "  PASS  ${desc}"
    PASS=$((PASS+1))
  else
    echo "  FAIL  ${desc}"
    echo "        got: ${actual:0:200}"
    FAIL=$((FAIL+1))
  fi
}

insert_payload() {
  case "$1" in
    announcements) echo '{"title":"pwn"}' ;;
    courses)       echo '{"name":"pwn"}' ;;
    videos)        echo '{"title":"pwn"}' ;;
    documents)     echo '{"name":"pwn","filename":"pwn.pdf"}' ;;
  esac
}

echo "== 匿名寫入必須全部被拒 =="
for t in announcements courses videos documents; do
  check "INSERT ${t} 被拒(401/403)"        "$(req POST  "$t" "$(insert_payload "$t")")" '^40[13]'
  check "UPDATE ${t} 無任何列被改(空集合)" "$(req PATCH "$t?id=gt.0" '{"status":"pwned"}')" '^(2..\|\[\]|4)'
  check "DELETE ${t} 無任何列被刪(空集合)" "$(req DELETE "$t?id=gt.0")" '^(2..\|\[\]|4)'
done
for t in about contact; do
  check "UPDATE ${t} 無任何列被改(空集合)" "$(req PATCH "$t?id=eq.1" '{"headline":"pwn","address":"pwn"}' )" '^(2..\|\[\]|4)'
  check "DELETE ${t} 無任何列被刪(空集合)" "$(req DELETE "$t?id=eq.1")" '^(2..\|\[\]|4)'
done
check "INSERT site_content 被拒(401/403)"        "$(req POST  "site_content" '{"key":"pwn","value":"pwn"}')" '^40[13]'
check "UPDATE site_content 無任何列被改(空集合)" "$(req PATCH "site_content?key=neq." '{"value":"pwned"}')" '^(2..\|\[\]|4)'
check "DELETE site_content 無任何列被刪(空集合)" "$(req DELETE "site_content?key=neq.")" '^(2..\|\[\]|4)'
check "UPDATE registrations 無任何列被改" "$(req PATCH "registrations?id=gt.0" '{"name":"pwn"}')" '^(2..\|\[\]|4)'
check "DELETE registrations 無任何列被刪" "$(req DELETE "registrations?id=gt.0")" '^(2..\|\[\]|4)'

echo "== 匿名不得讀取 registrations(個資) =="
check "SELECT registrations 回空集合" "$(req GET "registrations?select=*")" '^200\|\[\]$'

echo "== 匿名讀取公開內容仍正常 =="
check "SELECT announcements(僅已發布)" "$(req GET "announcements?select=id&limit=1")" '^200\|'
check "SELECT courses(僅公開狀態)"     "$(req GET "courses?select=id&limit=1")" '^200\|'
check "SELECT about"                     "$(req GET "about?select=id")" '^200\|'
check "SELECT contact"                   "$(req GET "contact?select=id")" '^200\|'
check "SELECT site_content(文案公開可讀)" "$(req GET "site_content?select=key&limit=1")" '^200\|'

echo "== 匿名報名(INSERT registrations)仍正常 =="
check "INSERT registrations 成功(201,return=minimal 同 signup-form 行為)" "$(req POST "registrations" '{"name":"__RLS_TEST__","phone":"000"}' 'return=minimal')" '^201'

echo "== Storage 匿名權限 =="
storage_req() { # method bucket path body
  local method="$1" bucket="$2" path="$3" body="${4:-}"
  local args=(-sS -X "$method" "${SUPABASE_URL}/storage/v1/object/${bucket}/${path}" \
    -H "apikey: ${ANON_KEY}" -H "Authorization: Bearer ${ANON_KEY}" \
    -H "Content-Type: image/webp" -w $'\n%{http_code}')
  [[ -n "$body" ]] && args+=(-d "$body")
  local out
  out="$(curl "${args[@]}")"
  echo "${out##*$'\n'}|${out%$'\n'*}"
}
storage_public_req() { # bucket path
  local bucket="$1" path="$2" out
  out="$(curl -sS "${SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}" \
    -H "apikey: ${ANON_KEY}" -H "Authorization: Bearer ${ANON_KEY}" -w $'\n%{http_code}')"
  echo "${out##*$'\n'}|${out%$'\n'*}"
}
check "匿名 INSERT pdfs 被拒" "$(storage_req POST pdfs rls-test.pdf x)" '^40[013]'
check "匿名 INSERT images 被拒" "$(storage_req POST images rls-test.webp x)" '^40[013]'
check "匿名可走 images public 讀取端點(不存在可 Object not found,但不可權限拒絕)" "$(storage_public_req images rls-test.webp)" '^(2..\||400\|.*Object not found)'

echo
echo "PASS=${PASS} FAIL=${FAIL}"
[[ $FAIL -eq 0 ]] || exit 1
