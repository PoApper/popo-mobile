<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-12 | Updated: 2026-04-12 -->

# chat

## Purpose

Paxi 택시 합승 채팅방 UI 컴포넌트. 메시지 표시, 정산, 신고, 차단, 사이드바, 방장 위임 등 채팅 관련 모든 UI를 담당한다.

## Key Files

| File                                 | Description                                                              |
| ------------------------------------ | ------------------------------------------------------------------------ |
| `ChatMessage.tsx`                    | 메시지 분기 래퍼 — MyMessage, SystemMessage, ParticipantMessage로 라우팅 |
| `MyMessage.tsx`                      | 본인 메시지 (우측 정렬)                                                  |
| `ParticipantMessage.tsx`             | 다른 참가자 메시지 (좌측 정렬, 클릭 가능)                                |
| `SystemMessage.tsx`                  | 시스템 메시지 (입장, 퇴장, 차단 등)                                      |
| `MsgModifyModal.tsx`                 | 메시지 수정 모달                                                         |
| `ReportModal.tsx`                    | 메시지/유저 신고 모달                                                    |
| `BanModal.tsx`                       | 유저 차단 모달                                                           |
| `BanReasonModal.tsx`                 | 차단 사유 설명 모달                                                      |
| `UserInfoModal.tsx`                  | 유저 프로필 정보 모달                                                    |
| `RoomInfoBox.tsx`                    | 채팅방 정보 표시                                                         |
| `SettlementInfoBox.tsx`              | 정산/결제 정보 표시                                                      |
| `SettlementCompleteConfirmModal.tsx` | 정산 완료 확인 모달                                                      |
| `OwnerTransferModal.tsx`             | 방장 위임 확인 모달                                                      |
| `ParticipantsItem.tsx`               | 참가자 목록 아이템                                                       |
| `SidebarModal.tsx`                   | 사이드 드로어 메뉴 모달                                                  |
| `TaxiChatList.tsx`                   | 택시/합승 방 목록                                                        |

## For AI Agents

### Working In This Directory

- 채팅 메시지 타입: `@interfaces/paxi.ts`의 MessageData 사용
- Socket.io 이벤트: `@constants/socket-events.ts`의 ChatEvent enum
- 모달 컴포넌트는 부모 화면에서 visible 상태로 제어

### Common Patterns

- 메시지 종류별 분리된 컴포넌트 (ChatMessage가 라우팅)
- 모달은 `visible` prop + `onClose` 콜백 패턴

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
