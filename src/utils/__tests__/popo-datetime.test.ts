import {formatReservationTime} from '../popo-datetime';

describe('formatReservationTime', () => {
  it('HHMM 형식 문자열을 HH:MM으로 변환한다', () => {
    expect(formatReservationTime('0900')).toBe('09:00');
    expect(formatReservationTime('1430')).toBe('14:30');
    expect(formatReservationTime('0000')).toBe('00:00');
    expect(formatReservationTime('2359')).toBe('23:59');
  });

  it('4자리가 아닌 입력이나 숫자가 아닌 입력에 대한 현재 동작을 명시한다', () => {
    // 길이가 4 미만인 경우
    expect(formatReservationTime('090')).toBe('09:0');
    expect(formatReservationTime('09')).toBe('09:');
    expect(formatReservationTime('0')).toBe('0:');
    expect(formatReservationTime('')).toBe(':');

    // 길이가 4를 초과하는 경우
    expect(formatReservationTime('09000')).toBe('09:00');

    // 숫자가 아닌 문자열인 경우
    expect(formatReservationTime('abcd')).toBe('ab:cd');
  });
});
