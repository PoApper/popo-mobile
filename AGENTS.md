<!-- Generated: 2026-04-12 | Updated: 2026-04-12 -->

# popo-mobile

## Purpose

POPO Mobile은 POSTECH 학생용 캠퍼스 서비스 React Native 앱이다. 장소/장비 예약, 동아리·학생회 정보, 셔틀 시간표, 실시간 채팅 기반 택시 합승(Paxi), 푸시 알림 기능을 제공한다. React Native 0.78, TypeScript, React 19 기반.

## Key Files

| File                    | Description                                                 |
| ----------------------- | ----------------------------------------------------------- |
| `package.json`          | 의존성 및 빌드 스크립트 (dev/prod × Android/iOS)            |
| `tsconfig.json`         | TypeScript 설정, 경로 별칭 (@components, @screens 등)       |
| `babel.config.js`       | Babel 설정 (module-resolver, dotenv, 프로덕션 console 제거) |
| `metro.config.js`       | Metro 번들러 설정 (axios ESM 호환 package exports)          |
| `app.json`              | 앱 이름 메타데이터                                          |
| `jest.config.js`        | Jest 테스트 설정 (경로 별칭, mock, transform 패턴)          |
| `.prettierrc.js`        | Prettier 포맷터 (single quotes, trailing commas)            |
| `.eslintrc.js`          | ESLint (@react-native 확장, hooks exhaustive-deps 경고)     |
| `CLAUDE.md`             | AI 어시스턴트 지침                                          |
| `.env` / `.env.example` | 환경 변수 (API 엔드포인트)                                  |

## Subdirectories

| Directory    | Purpose                          |
| ------------ | -------------------------------- |
| `src/`       | 애플리케이션 소스 코드           |
| `android/`   | Android 네이티브 빌드 설정       |
| `ios/`       | iOS 네이티브 빌드 설정           |
| `docs/`      | 문서 및 스크린샷                 |
| `.github/`   | CI 워크플로우 및 이슈 템플릿     |
| `__tests__/` | 루트 레벨 테스트                 |
| `assets/`    | 앱 로고, 마스코트, 아이콘 이미지 |

## For AI Agents

### Working In This Directory

- 경로 별칭 사용: `@components/*`, `@screens/*`, `@utils/*`, `@navigation/*`, `@interfaces/*`, `@styles/*`, `@assets/*`
- 환경 변수는 `react-native-config`의 `Config`로 접근
- Android는 Gradle product flavor (dev/prod) × build type (Debug/Release) 조합
- 코드 스타일: Prettier + ESLint 설정 준수

### Testing Requirements

- `npm run test` — Jest 단위 테스트
- `npm run pc` — pre-commit 훅 전체 실행 (format + lint + checks)
- PR 생성 시 GitHub Actions가 자동으로 pre-commit 검증
- **PR 전 모바일 회귀 테스트(필수)**: 앱 코드(`src/`, `index.js`, `android/`, `ios/`)를 바꾼 PR은 만들기 전에 `.claude/skills/mobile-regression/SKILL.md` 절차를 따른다. 바뀐 화면과 신규 화면을 iOS·Android × 한국어·영어로 Maestro(`e2e/`)로 돌리고, 캡처를 모두 직접 확인한 뒤 `e2e/publish.sh`로 PR 본문에 첨부한다. 사용자가 따로 요청하지 않아도 수행한다.

### Common Patterns

- 함수형 컴포넌트 + hooks만 사용
- 글로벌 상태 관리 라이브러리 없음 (useState/useRef per screen)
- 영속 데이터는 react-native-encrypted-storage
- 듀얼 API 인스턴스: POPO 백엔드 (`api.ts`) + Paxi 백엔드 (`paxi_api.ts`)

## Dependencies

### External

- React Native 0.78 — 모바일 프레임워크
- React 19 — UI 라이브러리
- TypeScript — 타입 안전성
- Axios — HTTP 클라이언트
- Socket.io — 실시간 채팅
- Firebase/FCM — 푸시 알림
- React Navigation — 네비게이션

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
