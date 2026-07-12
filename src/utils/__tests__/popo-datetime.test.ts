import {
  formatReservationTime,
  roundUpToNearest10Minutes,
} from '../popo-datetime';

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

describe('roundUpToNearest10Minutes', () => {
  it('10분 단위가 아닌 시각을 다음 10분 경계로 올림한다', () => {
    expect(roundUpToNearest10Minutes(new Date('2026-06-07T10:03:00'))).toEqual(
      new Date('2026-06-07T10:10:00'),
    );
    expect(roundUpToNearest10Minutes(new Date('2026-06-07T10:09:59'))).toEqual(
      new Date('2026-06-07T10:10:00'),
    );
  });

  it('이미 10분 경계에 있으면 그대로 유지한다', () => {
    expect(roundUpToNearest10Minutes(new Date('2026-06-07T10:10:00'))).toEqual(
      new Date('2026-06-07T10:10:00'),
    );
  });

  it('시(hour) 경계를 넘겨 올림한다', () => {
    expect(roundUpToNearest10Minutes(new Date('2026-06-07T10:55:30'))).toEqual(
      new Date('2026-06-07T11:00:00'),
    );
  });
});
