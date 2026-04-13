<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-12 | Updated: 2026-04-12 -->

# src

## Purpose

애플리케이션의 전체 TypeScript/React Native 소스 코드. 컴포넌트, 화면, 네비게이션, 유틸리티, 스타일, 타입 정의를 포함한다.

## Subdirectories

| Directory     | Purpose                                                   |
| ------------- | --------------------------------------------------------- |
| `components/` | 재사용 가능한 UI 컴포넌트 (see `components/AGENTS.md`)    |
| `screens/`    | 전체 화면 뷰 (see `screens/AGENTS.md`)                    |
| `navigation/` | React Navigation 라우팅 설정 (see `navigation/AGENTS.md`) |
| `utils/`      | API 클라이언트, 인증, 알림, 헬퍼 (see `utils/AGENTS.md`)  |
| `styles/`     | 테마 및 공통 스타일 (see `styles/AGENTS.md`)              |
| `interfaces/` | TypeScript 데이터 모델 (see `interfaces/AGENTS.md`)       |
| `constants/`  | 앱 전역 상수 (see `constants/AGENTS.md`)                  |
| `config/`     | 앱 설정 (see `config/AGENTS.md`)                          |
| `__mocks__/`  | Jest 테스트 mock 설정                                     |
| `__tests__/`  | 테스트 유틸리티                                           |

## For AI Agents

### Working In This Directory

- 경로 별칭 사용: `@components/*`, `@screens/*` 등 (tsconfig.json + babel.config.js에 정의)
- 새 화면 추가 시 `navigation/types.ts`의 라우트 파라미터 타입도 업데이트
- 글로벌 상태 라이브러리 없음 — 각 화면에서 useState/useRef로 로컬 관리

### Testing Requirements

- 유틸리티 테스트: `src/utils/__tests__/`
- 컴포넌트 테스트: `src/components/__tests__/`
- mock 설정: `src/__mocks__/`

### Common Patterns

- 함수형 컴포넌트 + hooks
- 다크 모드: `useColorScheme()` 훅으로 감지
- API 호출: `api.ts` 또는 `paxi_api.ts`의 Axios 인스턴스 사용

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
