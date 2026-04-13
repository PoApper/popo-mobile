<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-12 | Updated: 2026-04-12 -->

# screens

## Purpose

전체 화면 뷰. 기능별 하위 디렉토리로 구성되며, 루트 레벨에 홈/예약/혜택/셔틀 등 공통 화면이 위치한다.

## Key Files

| File                    | Description                                          |
| ----------------------- | ---------------------------------------------------- |
| `HomeScreen.tsx`        | 메인 홈 화면 — 서비스 항목, D-Day, 모집 배너, 이벤트 |
| `ReservationScreen.tsx` | 통합 예약 뷰                                         |
| `BenefitsScreen.tsx`    | 혜택/할인/제휴 화면                                  |
| `CampusShuttle.tsx`     | 캠퍼스 셔틀 시간표                                   |
| `WhitebookScreen.tsx`   | 화이트북 화면                                        |
| `AboutScreen.tsx`       | 앱 소개                                              |
| `RecruitingScreen.tsx`  | 모집/온보딩 화면                                     |
| `LandingScreen.tsx`     | 로그인 전 랜딩 페이지                                |

## Subdirectories

| Directory                | Purpose                                                |
| ------------------------ | ------------------------------------------------------ |
| `auth/`                  | 인증 플로우 화면 (see `auth/AGENTS.md`)                |
| `paxi/`                  | Paxi 택시 합승 화면 (see `paxi/AGENTS.md`)             |
| `place-reservation/`     | 장소 예약 화면 (see `place-reservation/AGENTS.md`)     |
| `equipment-reservation/` | 장비 예약 화면 (see `equipment-reservation/AGENTS.md`) |
| `club/`                  | 동아리 화면 (see `club/AGENTS.md`)                     |
| `association/`           | 학생회 화면 (see `association/AGENTS.md`)              |

## For AI Agents

### Working In This Directory

- 새 화면 추가 시 `navigation/types.ts`에 라우트 타입 추가 필수
- 각 화면은 자체 useState/useRef로 상태 관리 (글로벌 스토어 없음)
- API 호출은 `@utils/api` 또는 `@utils/paxi_api` 사용
- 다크 모드: `useColorScheme()` 훅

### Common Patterns

- 함수형 컴포넌트 + hooks
- 화면 진입 시 데이터 fetch (useEffect 또는 useFocusEffect)
- 에러 처리: try/catch + 사용자 친화적 메시지

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
