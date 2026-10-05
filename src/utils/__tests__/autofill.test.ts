import {isBulkInput, isFilledTogether} from '../autofill';

describe('isBulkInput', () => {
  it('한 글자씩 타이핑하면 통째 입력이 아니다', () => {
    expect(isBulkInput('', 'a')).toBe(false);
    expect(isBulkInput('kh', 'khk')).toBe(false);
  });

  it('여러 글자가 한 번에 들어오면 통째 입력이다', () => {
    expect(isBulkInput('', 'secret')).toBe(true);
    expect(isBulkInput('kh', 'khkim6040')).toBe(true);
  });

  it('같은 값으로 다시 채워지면 통째 입력이 아니다', () => {
    expect(isBulkInput('khkim6040', 'khkim6040')).toBe(false);
  });
});

describe('isFilledTogether', () => {
  it('두 칸이 거의 동시에 채워지면 자동완성이다', () => {
    expect(isFilledTogether(1000, 1030)).toBe(true);
  });

  it('한 칸만 통째로 채워졌으면 자동완성이 아니다', () => {
    expect(isFilledTogether(0, 1000)).toBe(false);
  });

  it('두 칸이 따로 채워졌으면 자동완성이 아니다', () => {
    expect(isFilledTogether(1000, 5000)).toBe(false);
  });
});
