import {PLACE_NAMES} from '../constants/placeNames';
import {ConcreteTimeSlot} from '../components/TimeSlotPickerModal';

export type TimeSlot = {
  start: number; // 분 단위(0~1439)
  end: number; // 분 단위(0~1439), 24:00은 0으로 표현 + endDayOffset=1
  endDayOffset?: number; // 자정 넘김시 다음날 처리(기본 0)
};

export type TimeSlotPolicy = {
  name: string; // 포함 매칭에 사용할 하드코딩 이름 상수
  notice: string; // 안내 문구
  slots: TimeSlot[];
};

export const RESTRICTED_TIME_SLOT_POLICIES: TimeSlotPolicy[] = [
  {
    name: PLACE_NAMES.CINEMA_ROOM,
    notice:
      'RC 시네마 룸의 예약은\n18:00 ~ 21:00 / 21:00 ~ 24:00 / 00:00 ~ 03:00\n3가지 시간대만 가능 합니다.',
    slots: [
      {start: 0, end: 3 * 60}, // 00:00~03:00
      {start: 18 * 60, end: 21 * 60}, // 18:00~21:00
      {start: 21 * 60, end: 0, endDayOffset: 1}, // 21:00~24:00(다음날 00:00)
    ],
  },
];

export function hasRestrictedTimeSlotPolicy(name: string): boolean {
  return RESTRICTED_TIME_SLOT_POLICIES.some(p => p.name === name);
}

export function getRestrictedTimeSlotPolicy(
  name: string,
): TimeSlotPolicy | undefined {
  if (!hasRestrictedTimeSlotPolicy(name)) {
    return undefined;
  }
  return RESTRICTED_TIME_SLOT_POLICIES.find(
    p => p.name === name,
  ) as TimeSlotPolicy;
}

// 모달 표시용 슬롯 변환 헬퍼
export function toConcreteSlots(
  baseDate: Date,
  policy: TimeSlotPolicy,
): ConcreteTimeSlot[] {
  const toDate = (d: Date, minutes: number, dayOffset = 0) => {
    const res = new Date(d);
    res.setDate(res.getDate() + dayOffset);
    res.setHours(Math.floor(minutes / 60), minutes % 60, 0, 0);
    return res;
  };
  const fmt = (d: Date) =>
    `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(
      2,
      '0',
    )}`;

  const now = new Date();

  return policy.slots.map(s => {
    const start = toDate(baseDate, s.start, 0);
    const end = toDate(baseDate, s.end, s.endDayOffset ?? 0);
    // 종료 시각을 지났다면 선택 불가. 시작 시각을 넘기더라도 예약할 수 있음
    return {
      start,
      end,
      label: `${fmt(start)} ~ ${fmt(end)}`,
      disabled: end <= now,
    };
  });
}

export function getNearestPossibleSlot(
  baseDate: Date,
  policy: TimeSlotPolicy,
): ConcreteTimeSlot | undefined {
  const slots = toConcreteSlots(baseDate, policy);
  const now = new Date();
  return slots.find(s => s.end > now && !s.disabled);
}
