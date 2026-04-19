<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-12 | Updated: 2026-04-12 -->

# paxi

## Purpose

Paxi 택시 합승 기능 화면. 방 목록, 생성, 채팅, 정산, 계좌 정보, 신고, 딥링크 핸들링을 담당한다.

## Key Files

| File                        | Description                       |
| --------------------------- | --------------------------------- |
| `PaxiIntro.tsx`             | Paxi 소개/온보딩                  |
| `PaxiStart.tsx`             | Paxi 시작 화면                    |
| `PaxiRoomListScreen.tsx`    | 전체 방 목록                      |
| `CreatePaxiRoomScreen.tsx`  | 새 합승 방 생성                   |
| `NewChatScreen.tsx`         | 채팅 화면 — Socket.io 실시간 통신 |
| `ModifyPaxiRoomScreen.tsx`  | 방 정보 수정                      |
| `SettlementScreen.tsx`      | 정산/결제 화면                    |
| `UserAccountInfoScreen.tsx` | 계좌/은행 정보 설정               |
| `PaxiReportListScreen.tsx`  | 신고 목록 조회                    |
| `DeepLinkRoomHandler.tsx`   | 딥링크로 특정 방 접근 처리        |

## For AI Agents

### Working In This Directory

- API: `@utils/paxi_api.ts` (별도 Paxi 백엔드)
- 실시간 채팅: `@utils/socket-factory.ts`로 Socket.io 연결
- 타입: `@interfaces/paxi.ts`
- 소켓 이벤트: `@constants/socket-events.ts`
- 소켓은 useRef로 관리, unmount 시 정리 필수

### Common Patterns

- 채팅 화면은 소켓 연결/해제 라이프사이클 관리
- 정산은 별도 데이터 모델 (SettlementData)

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
