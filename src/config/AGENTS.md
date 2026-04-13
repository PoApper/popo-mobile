<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-12 | Updated: 2026-04-12 -->

# config

## Purpose

애플리케이션 설정. 현재 장소 예약 시간대 제한 정책을 정의한다.

## Key Files

| File                       | Description                                                                                                                                                                                                           |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `restricted-time-slots.ts` | 시간대 제한 정책 — TimeSlot/TimeSlotPolicy 타입, Cinema Room 예약 시간대 (18-21시, 21-24시, 0-3시), `hasRestrictedTimeSlotPolicy()`, `getRestrictedTimeSlotPolicy()`, `toConcreteSlots()`, `getNearestPossibleSlot()` |

## For AI Agents

### Working In This Directory

- 새 장소의 시간대 제한 추가: `restrictedTimeSlotPolicies` 맵에 항목 추가
- 시간은 분 단위 (start/end in minutes from midnight)

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
