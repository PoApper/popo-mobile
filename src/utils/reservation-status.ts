/** 서버가 내려주는 한글 예약 상태를 번역 키 조각으로 바꾼다. */
export type ReservationStatusKey = 'pending' | 'passed' | 'rejected';

const STATUS_KEYS: Record<string, ReservationStatusKey> = {
  심사중: 'pending',
  통과: 'passed',
  거절: 'rejected',
};

export const reservationStatusKey = (
  status: string,
): ReservationStatusKey | undefined => STATUS_KEYS[status];
