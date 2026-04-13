<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-12 | Updated: 2026-04-12 -->

# components

## Purpose

재사용 가능한 UI 컴포넌트. 공통 헤더, 예약 목록, 모달, 배너 등 화면 간 공유되는 빌딩 블록.

## Key Files

| File                       | Description                |
| -------------------------- | -------------------------- |
| `CommonHeader.tsx`         | 화면 간 공유 헤더 컴포넌트 |
| `ReservationList.tsx`      | 범용 예약 목록 렌더러      |
| `EquipReservationList.tsx` | 장비 예약 목록 렌더러      |
| `TimeSlotPickerModal.tsx`  | 예약 시간대 선택 모달      |
| `LazyImage.tsx`            | 지연 로딩 이미지 컴포넌트  |
| `DdayInfoBox.tsx`          | D-day 카운트다운 박스      |
| `UpcomingEvents.tsx`       | 다가오는 이벤트 표시       |
| `RecruitingBanner.tsx`     | 모집 배너                  |
| `ReportDataCard.tsx`       | 리포트 데이터 카드         |
| `ReportProgressModal.tsx`  | 리포트 진행 모달           |
| `PrivacyPolicy.tsx`        | 개인정보 처리방침          |
| `PaxiPrivacyPolicy.tsx`    | Paxi 개인정보 처리방침     |

## Subdirectories

| Directory      | Purpose                                                 |
| -------------- | ------------------------------------------------------- |
| `chat/`        | Paxi 채팅방 컴포넌트 (see `chat/AGENTS.md`)             |
| `room/`        | 장소/장비 예약 방 필터링 및 표시 (see `room/AGENTS.md`) |
| `association/` | 학생회 목록 아이템                                      |
| `benefits/`    | 혜택/할인 목록 아이템                                   |
| `__tests__/`   | 컴포넌트 테스트                                         |

## For AI Agents

### Working In This Directory

- 각 컴포넌트는 독립 파일
- 다크 모드 지원: `isDarkMode` prop 또는 `useColorScheme()`
- 스타일은 `@styles/default.ts`의 헬퍼 함수 사용

### Testing Requirements

- 컴포넌트 테스트: `__tests__/` 디렉토리
- React Testing Library 사용

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
