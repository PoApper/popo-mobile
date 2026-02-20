import {formatReservationTime} from '../popo-datetime';

describe('formatReservationTime', () => {
  it('HHMM 형식 문자열을 HH:MM으로 변환한다', () => {
    expect(formatReservationTime('0900')).toBe('09:00');
    expect(formatReservationTime('1430')).toBe('14:30');
    expect(formatReservationTime('0000')).toBe('00:00');
    expect(formatReservationTime('2359')).toBe('23:59');
  });
});
