#!/usr/bin/env bash
# iOS 시뮬레이터·Android 에뮬레이터에서 Maestro 흐름을 언어별로 실행하고 스크린샷을 e2e/output/에 모은다.
#
# usage: e2e/run.sh [--build] [--keep] [--platforms "ios android"] [--languages "ko en"] [flow.yaml ...]
#   flow를 생략하면 e2e/flows/smoke.yaml만 실행한다. 플랫폼끼리는 동시에 돈다.
#   --build: 실행 전에 dev 앱을 다시 빌드·설치한다(네이티브 코드나 매니페스트를 바꿨을 때).
#   --keep: e2e/output/을 비우지 않고 이번에 돈 조합의 결과만 덮어쓴다(실패한 흐름만 다시 돌릴 때).
set -uo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
E2E="$ROOT/e2e"
OUT="$E2E/output"
IOS_APP_ID=org.reactjs.native.example.popoMobile
ANDROID_APP_ID=com.popomobile
IOS_SIM_NAME="${IOS_SIM_NAME:-iPhone 17}"
METRO_PORT=8081

BUILD=0
KEEP=0
PLATFORMS="ios android"
LANGUAGES="ko en"
FLOWS=()
while [ $# -gt 0 ]; do
  case "$1" in
    --build) BUILD=1 ;;
    --keep) KEEP=1 ;;
    --platforms) PLATFORMS="$2"; shift ;;
    --languages) LANGUAGES="$2"; shift ;;
    *) FLOWS+=("$1") ;;
  esac
  shift
done
[ ${#FLOWS[@]} -eq 0 ] && FLOWS=("$E2E/flows/smoke.yaml")

export MAESTRO_CLI_NO_ANALYTICS=1 MAESTRO_CLI_ANALYSIS_NOTIFICATION_DISABLED=true

die() { echo "error: $*" >&2; exit 1; }

command -v maestro >/dev/null || die "maestro가 없습니다: brew install mobile-dev-inc/tap/maestro"
[ -f "$E2E/.env.local" ] || die "e2e/.env.local이 없습니다. e2e/.env.example을 복사해 dev 테스트 계정을 넣으세요."
# shellcheck disable=SC1091
set -a; . "$E2E/.env.local"; set +a
[ -n "${POPO_E2E_EMAIL:-}" ] && [ -n "${POPO_E2E_PASSWORD:-}" ] || die "e2e/.env.local에 POPO_E2E_EMAIL, POPO_E2E_PASSWORD가 필요합니다."
curl -s "localhost:$METRO_PORT/status" | grep -q running || die "Metro가 꺼져 있습니다: npm run start"

ios_device() {
  local udid
  udid=$(xcrun simctl list devices booted | grep -E "iPhone" | grep -oE '[0-9A-F-]{36}' | head -1)
  if [ -z "$udid" ]; then
    udid=$(xcrun simctl list devices available | grep -F "$IOS_SIM_NAME (" | grep -oE '[0-9A-F-]{36}' | head -1)
    [ -n "$udid" ] || die "iOS 시뮬레이터 '$IOS_SIM_NAME'을 찾지 못했습니다(IOS_SIM_NAME으로 지정)."
    xcrun simctl boot "$udid" >/dev/null 2>&1
    xcrun simctl bootstatus "$udid" >/dev/null 2>&1
  fi
  if [ $BUILD -eq 1 ] || ! xcrun simctl get_app_container "$udid" "$IOS_APP_ID" >/dev/null 2>&1; then
    (cd "$ROOT" && npm run ios -- --udid "$udid" --no-packager) >&2 || die "iOS 빌드 실패"
  fi
  echo "$udid"
}

android_device() {
  local serial
  serial=$(adb devices | awk '/^emulator-.*device$/ {print $1; exit}')
  if [ -z "$serial" ]; then
    local avd
    avd=$(emulator -list-avds 2>/dev/null | head -1)
    [ -n "$avd" ] || die "Android AVD가 없습니다."
    nohup emulator -avd "$avd" -no-boot-anim >/dev/null 2>&1 &
    adb wait-for-device
    until [ "$(adb shell getprop sys.boot_completed 2>/dev/null | tr -d '\r')" = "1" ]; do sleep 3; done
    serial=$(adb devices | awk '/^emulator-.*device$/ {print $1; exit}')
  fi
  adb -s "$serial" reverse tcp:$METRO_PORT tcp:$METRO_PORT >/dev/null
  if [ $BUILD -eq 1 ] || ! adb -s "$serial" shell pm path "$ANDROID_APP_ID" >/dev/null 2>&1; then
    (cd "$ROOT" && npm run android -- --no-packager) >&2 || die "Android 빌드 실패"
  fi
  echo "$serial"
}

export PATH="$PATH:$HOME/Library/Android/sdk/emulator:$HOME/Library/Android/sdk/platform-tools"
[ $KEEP -eq 1 ] || rm -rf "$OUT"
mkdir -p "$OUT/.raw"
SUMMARY="$OUT/summary.txt"

run_platform() { # $1=platform
  local platform=$1 device app_id failed=0
  case "$platform" in
    ios) device=$(ios_device) || return 1; app_id=$IOS_APP_ID ;;
    android) device=$(android_device) || return 1; app_id=$ANDROID_APP_ID ;;
    *) die "알 수 없는 플랫폼: $platform" ;;
  esac
  for lang in $LANGUAGES; do
    for flow in "${FLOWS[@]}"; do
      name="$(basename "$flow" .yaml)"
      raw="$OUT/.raw/$platform-$lang-$name"
      rm -rf "$raw"
      echo "▶ $platform / $lang / $name"
      # 결과는 조합마다 따로 적고 마지막에 모은다(플랫폼이 동시에 돌고, --keep이면 이전 결과를 덮어써야 한다).
      if maestro --device "$device" test --no-ansi --test-output-dir="$raw" \
        -e APP_ID="$app_id" -e LANGUAGE="$lang" \
        -e POPO_E2E_EMAIL="$POPO_E2E_EMAIL" -e POPO_E2E_PASSWORD="$POPO_E2E_PASSWORD" \
        "$flow" >"$raw.log" 2>&1; then
        echo "PASS $platform $lang $name" >"$raw.status"
      else
        failed=1
        echo "FAIL $platform $lang $name (log: ${raw#$ROOT/}.log)" >"$raw.status"
        echo "  실패: ${raw#$ROOT/}.log" >&2
      fi
      # 실패한 흐름도 실패 직전까지의 캡처는 남긴다.
      find "$raw" -path '*/takeScreenshot/*.png' 2>/dev/null | while read -r png; do
        cp "$png" "$OUT/$platform-$(basename "$png")"
      done
    done
  done
  return $failed
}

PIDS=()
for platform in $PLATFORMS; do
  run_platform "$platform" &
  PIDS+=($!)
done
FAILED=0
for pid in "${PIDS[@]}"; do
  wait "$pid" || FAILED=1
done

cat "$OUT"/.raw/*.status >"$SUMMARY" 2>/dev/null
echo
cat "$SUMMARY"
echo "스크린샷: ${OUT#$ROOT/}/ ($(find "$OUT" -maxdepth 1 -name '*.png' | wc -l | tr -d ' ')장)"
exit $FAILED
