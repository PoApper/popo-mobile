<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-12 | Updated: 2026-04-12 -->

# styles

## Purpose

테마 정의 및 공통 스타일 유틸리티. 라이트/다크 모드 색상 팔레트와 레이아웃 패턴을 제공한다.

## Key Files

| File         | Description                                                                                                        |
| ------------ | ------------------------------------------------------------------------------------------------------------------ |
| `theme.ts`   | 테마 정의 — 라이트/다크 색상 팔레트                                                                                |
| `default.ts` | 공통 StyleSheet — `backgroundColor()`, `textColor()`, `borderColor()` 헬퍼 (deprecated) + `common` 레이아웃 스타일 |

## For AI Agents

### Working In This Directory

- `colors.dark` / `colors.light` 객체로 테마 색상 접근
- `backgroundColor(isDarkMode)`, `textColor(isDarkMode)` 등 헬퍼 함수 사용
- `common` StyleSheet: safeArea, container, header 공통 패턴

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
