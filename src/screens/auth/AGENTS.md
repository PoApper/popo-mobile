<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-12 | Updated: 2026-04-12 -->

# auth

## Purpose
인증 플로우 화면. 로그인, 회원가입, 사용자 정보, 탈퇴, 개발자 페이지를 포함한다.

## Key Files

| File | Description |
|------|-------------|
| `LoginScreen.tsx` | 로그인 폼 |
| `SignupScreen.tsx` | 회원가입 폼 |
| `UserDetailScreen.tsx` | 가입 후 프로필 설정 |
| `LeaveScreen.tsx` | 계정 탈퇴 화면 |
| `DeveloperPage.tsx` | 개발자/디버그 페이지 |

## For AI Agents

### Working In This Directory
- 인증 상태는 EncryptedStorage에 저장
- 토큰 관리: `@utils/auth-tokens.ts`, `@utils/cookie.ts`
- 네비게이션: `AuthNavigator.tsx`에서 스택 플로우 정의

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
