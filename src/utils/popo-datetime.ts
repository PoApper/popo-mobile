export const formatReservationTime = (time: string) => {
  return time.slice(0, 2) + ':' + time.slice(2, 4);
};

const TEN_MINUTES_IN_MS = 1000 * 60 * 10;

/** 주어진 시각을 다음 10분 경계로 올림한다 (이미 경계면 그대로). */
export function roundUpToNearest10Minutes(date: Date): Date {
  return new Date(
    Math.ceil(date.getTime() / TEN_MINUTES_IN_MS) * TEN_MINUTES_IN_MS,
  );
}

const THIRTY_MINUTES_IN_MS = 1000 * 60 * 30;

/** 시설/장비 예약의 최소 이용 시간. 0분 예약을 막는 기준이기도 하다. */
export const MIN_RESERVATION_DURATION_MS = THIRTY_MINUTES_IN_MS;

/** 주어진 시각을 다음 30분 경계로 올림한다 (이미 경계면 그대로). */
export function roundUpToNearest30Minutes(date: Date): Date {
  return new Date(
    Math.ceil(date.getTime() / THIRTY_MINUTES_IN_MS) * THIRTY_MINUTES_IN_MS,
  );
}
