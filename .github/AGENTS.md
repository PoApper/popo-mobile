<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-12 | Updated: 2026-04-12 -->

# .github

## Purpose

GitHub CI/CD 워크플로우와 이슈/PR 템플릿.

## Key Files

| File                           | Description                                                     |
| ------------------------------ | --------------------------------------------------------------- |
| `workflows/github-action.yaml` | PR CI — Python 3.11 + pre-commit, npm ci, format/lint/검증 실행 |
| `PULL_REQUEST_TEMPLATE.md`     | PR 설명 템플릿                                                  |

## Subdirectories

| Directory         | Purpose                                        |
| ----------------- | ---------------------------------------------- |
| `ISSUE_TEMPLATE/` | 이슈 템플릿 (기능 제안, 버그 리포트, 자유양식) |
| `workflows/`      | GitHub Actions 워크플로우                      |

## For AI Agents

### Working In This Directory

- CI는 `main` 브랜치 PR에서 `pre-commit run --all-files` 실행
- 이슈 템플릿은 한국어로 작성

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
