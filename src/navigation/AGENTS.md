<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-12 | Updated: 2026-04-12 -->

# navigation

## Purpose
React Navigation 라우팅 설정. 인증 플로우, 탭 네비게이션, 딥링크 처리를 담당한다.

## Key Files

| File | Description |
|------|-------------|
| `AppNavigator.tsx` | 루트 네비게이터 — 인증 상태에 따라 Auth/Main 스택 분기, 딥링크 설정 (popo://, https://popo.poapper.club) |
| `AuthNavigator.tsx` | 인증 플로우 (Landing → Login → Signup → Leave → UserDetail → DeveloperPage) |
| `MainNavigator.tsx` | 메인 하단 탭 (Home, Paxi, MyReservation, MyInfo) |
| `RootNavigation.ts` | React 트리 외부에서 프로그래매틱 네비게이션을 위한 ref (알림 핸들러 사용) |
| `types.ts` | 모든 라우트 파라미터 타입 정의 (RootStackParamList, AuthStackParamList 등) |

## For AI Agents

### Working In This Directory
- 새 화면 추가 시 반드시 `types.ts`에 라우트 파라미터 타입 추가
- 딥링크 경로 추가 시 `AppNavigator.tsx`의 linking config 업데이트
- `RootNavigation.ts`는 알림 핸들러에서 화면 이동에 사용

### Common Patterns
- 스택별 별도 네비게이터 파일
- 타입 안전한 네비게이션: `NativeStackNavigationProp<ParamList>`

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
