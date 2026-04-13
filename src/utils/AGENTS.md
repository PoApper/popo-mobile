<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-12 | Updated: 2026-04-12 -->

# utils

## Purpose

API 클라이언트, 인증/토큰 관리, 푸시 알림, WebSocket 팩토리, 날짜/에러 헬퍼 등 핵심 유틸리티.

## Key Files

| File                     | Description                                                           |
| ------------------------ | --------------------------------------------------------------------- |
| `api.ts`                 | POPO 백엔드 Axios 인스턴스 — 쿠키/토큰 인터셉터, 401 시 자동 리프레시 |
| `paxi_api.ts`            | Paxi 서비스 Axios 인스턴스 — api.ts와 유사 구조                       |
| `refresh.utils.ts`       | 토큰 리프레시 로직 — 동시 리프레시 방지, 실패 요청 큐잉               |
| `auth-tokens.ts`         | 토큰 조회 헬퍼 (쿠키 → EncryptedStorage → FCM 순서)                   |
| `cookie.ts`              | Set-Cookie 헤더에서 Authentication/Refresh 토큰 파싱                  |
| `storage-keys.ts`        | EncryptedStorage 키 상수 (AUTH_TOKEN, REFRESH_TOKEN 등)               |
| `socket-factory.ts`      | Socket.io 연결 팩토리 — 인증, 자동 재연결, 토큰 만료 처리             |
| `firebase.ts`            | FCM 토큰 등록, 플랫폼별 알림 권한 요청                                |
| `notifee.ts`             | Notifee 로컬 알림 표시 및 권한 요청                                   |
| `axios-error.ts`         | Axios 응답 에러 처리 유틸리티                                         |
| `popo-datetime.ts`       | 날짜/시간 포맷팅 헬퍼                                                 |
| `calendar-locales.ts`    | 캘린더 로컬라이제이션 설정                                            |
| `linking.ts`             | 딥링크 유틸리티 (`openURLWithFallback()`)                             |
| `locations.tsx`          | 위치 데이터/컴포넌트                                                  |
| `userchat-background.ts` | 채팅 배경 스타일/테마                                                 |
| `mute.ts`                | 음소거 상태 관리                                                      |
| `reset.ts`               | 인증 초기화/로그아웃 유틸리티                                         |
| `socket.ts`              | 빈 파일 (플레이스홀더)                                                |

## Subdirectories

| Directory    | Purpose                                                         |
| ------------ | --------------------------------------------------------------- |
| `__tests__/` | 유틸리티 단위 테스트 (axios-error, cookie, popo-datetime, mute) |

## For AI Agents

### Working In This Directory

- 인증 흐름: 쿠키 우선 → EncryptedStorage 폴백 → FCM 토큰
- `api.ts`와 `paxi_api.ts`는 동일한 인터셉터 패턴 사용
- `refresh.utils.ts`는 데드락 방지를 위해 plain axios 사용 (인터셉터 없는 별도 인스턴스)
- 토큰 리프레시 중 실패한 요청은 큐에 쌓였다가 리프레시 완료 후 재시도

### Testing Requirements

- `src/utils/__tests__/`에서 단위 테스트
- 인증 관련 변경 시 쿠키 + EncryptedStorage 양쪽 경로 테스트

### Common Patterns

- Axios 인터셉터로 요청/응답 가로채기
- `isRefreshing` 플래그 + `failedQueue`로 동시 리프레시 제어

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
