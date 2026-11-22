#!/usr/bin/env bash
# e2e/output/의 스크린샷을 PR별 secret gist에 올리고, PR 본문의 e2e 구역을 덮어쓴다.
#
# usage: e2e/publish.sh [PR번호]   (생략하면 현재 브랜치의 PR)
#   파일 이름은 <platform>-<설명>.png 이어야 한다. 설명이 그대로 캡션이 된다.
#   e2e/output/unverified.md가 있으면 그 내용을 '미확인 항목'으로 함께 싣는다.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/e2e/output"
START='<!-- e2e-screenshots:start -->'
END='<!-- e2e-screenshots:end -->'
MAX_HEIGHT=800
PER_ROW=3

PR="${1:-$(gh pr view --json number -q .number)}"
REPO="$(gh repo view --json nameWithOwner -q .nameWithOwner)"
OWNER="$(gh api user -q .login)"
shopt -s nullglob
PNGS=("$OUT"/*.png)
[ ${#PNGS[@]} -gt 0 ] || { echo "error: e2e/output/에 스크린샷이 없습니다. 먼저 e2e/run.sh를 실행하세요." >&2; exit 1; }

DESC="$REPO PR #$PR e2e screenshots"
GIST_ID="$(gh gist list --limit 100 | awk -F'\t' -v d="$DESC" '$2 == d {print $1; exit}')"
if [ -z "$GIST_ID" ]; then
  tmp="$(mktemp -d)"
  echo "$DESC" >"$tmp/README.md"
  GIST_ID="$(gh gist create "$tmp/README.md" -d "$DESC" | tail -1)"
  GIST_ID="${GIST_ID##*/}"
fi

WORK="$(mktemp -d)"
git clone -q "https://gist.github.com/$GIST_ID.git" "$WORK/gist"
rm -f "$WORK/gist"/*.png
for png in "${PNGS[@]}"; do
  sips -Z $MAX_HEIGHT "$png" --out "$WORK/gist/$(basename "$png")" >/dev/null
done
git -C "$WORK/gist" add -A
git -C "$WORK/gist" -c user.name="$OWNER" -c user.email="$OWNER@users.noreply.github.com" \
  commit -qm "PR #$PR screenshots" || true
git -C "$WORK/gist" push -q origin HEAD
SHA="$(git -C "$WORK/gist" rev-parse HEAD)"
# 커밋 SHA를 박아 넣어야 재실행 후에도 GitHub 이미지 캐시가 옛 사진을 보여주지 않는다.
BASE="https://gist.githubusercontent.com/$OWNER/$GIST_ID/raw/$SHA"

section() { # $1=플랫폼 접두어, $2=제목
  local files=("$OUT/$1"-*.png) i=0
  [ ${#files[@]} -gt 0 ] || return 0
  printf '<details>\n<summary>%s — %d장</summary>\n\n<table>\n' "$2" ${#files[@]}
  for f in "${files[@]}"; do
    local name caption
    name="$(basename "$f")"
    caption="${name#"$1"-}"
    [ $((i % PER_ROW)) -eq 0 ] && printf '<tr>'
    printf '<td align="center"><img src="%s/%s" width="220"><br><sub>%s</sub></td>' "$BASE" "$name" "${caption%.png}"
    i=$((i + 1))
    [ $((i % PER_ROW)) -eq 0 ] && printf '</tr>\n'
  done
  [ $((i % PER_ROW)) -ne 0 ] && printf '</tr>\n'
  printf '</table>\n</details>\n\n'
}

BLOCK="$WORK/block.md"
{
  echo "$START"
  echo "### 📱 e2e 스크린샷"
  echo
  if [ -f "$OUT/summary.txt" ]; then
    echo '```'
    cat "$OUT/summary.txt"
    echo '```'
    echo
  fi
  section ios "iOS"
  section android "Android"
  if [ -f "$OUT/unverified.md" ]; then
    echo "**미확인 항목**"
    echo
    cat "$OUT/unverified.md"
    echo
  fi
  echo "<sub>\`e2e/run.sh\` → \`e2e/publish.sh\`로 생성 · 이미지: $DESC gist</sub>"
  echo "$END"
} >"$BLOCK"

gh pr view "$PR" --json body -q .body >"$WORK/body.md"
python3 - "$WORK/body.md" "$BLOCK" "$START" "$END" <<'PY'
import sys
body_path, block_path, start, end = sys.argv[1:]
body = open(body_path).read().rstrip('\n')
block = open(block_path).read().rstrip('\n')
if start in body and end in body:
    head, rest = body.split(start, 1)
    body = head + block + rest.split(end, 1)[1]
else:
    body = body + '\n\n' + block
open(body_path, 'w').write(body + '\n')
PY
gh pr edit "$PR" --body-file "$WORK/body.md" >/dev/null
echo "PR #$PR 본문에 스크린샷 ${#PNGS[@]}장을 올렸습니다: https://gist.github.com/$OWNER/$GIST_ID"
