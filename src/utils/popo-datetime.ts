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
