<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-12 | Updated: 2026-04-12 -->

# constants

## Purpose

앱 전역 상수 — 외부 URL, 장소 이름, WebSocket 이벤트 이름.

## Key Files

| File               | Description                                                                                    |
| ------------------ | ---------------------------------------------------------------------------------------------- |
| `urls.ts`          | 외부 URL 상수 (기숙사 배달, 기록 아카이브, 에러 리포트 폼, 동연 카카오)                        |
| `placeNames.ts`    | 장소/방 이름 상수 및 타입 (Atlas Hall, Cinema Room, Study Room 등) + `isGroupStudyRoom()` 헬퍼 |
| `socket-events.ts` | Socket.io 이벤트 이름 enum (ChatEvent: NEW_MESSAGE, UPDATED_MESSAGE 등)                        |

## For AI Agents

### Working In This Directory

- 매직 넘버/문자열은 여기 상수로 정의
- 장소 이름 추가 시 `placeNames.ts`의 타입도 업데이트
- WebSocket 이벤트 추가 시 `socket-events.ts`의 ChatEvent enum에 추가

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
