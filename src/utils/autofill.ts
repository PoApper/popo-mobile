// 자동완성은 아이디·비밀번호를 한 번에 통째로 채우므로, 두 칸이 이 간격 안에 통째로 채워지면 자동완성으로 본다
const AUTOFILL_WINDOW_MS = 500;

/**
 * 한 번의 변경으로 두 글자 이상이 새로 들어오면 타이핑이 아닌 통째 입력(자동완성·붙여넣기)이다.
 * 길이 차이가 아니라 앞뒤 공통부분을 뺀 삽입 길이를 봐야 기존 값을 같거나 짧은 값으로 덮어쓴 경우도 잡힌다.
 */
export const isBulkInput = (prev: string, next: string): boolean => {
  let start = 0;
  while (
    start < prev.length &&
    start < next.length &&
    prev[start] === next[start]
  ) {
    start++;
  }
  let end = 0;
  while (
    end < prev.length - start &&
    end < next.length - start &&
    prev[prev.length - 1 - end] === next[next.length - 1 - end]
  ) {
    end++;
  }
  return next.length - start - end > 1;
};

/**
 * 두 칸이 모두 통째로 입력됐고 그 시각이 거의 같으며 방금 일어난 일이면 자동완성으로 채워진 것이다.
 * 방금인지도 봐야 오래전 기록이 남아 있다가 나중의 한 글자 수정에 로그인이 걸리지 않는다.
 */
export const isFilledTogether = (
  aAt: number,
  bAt: number,
  now: number,
): boolean =>
  aAt > 0 &&
  bAt > 0 &&
  Math.abs(aAt - bAt) <= AUTOFILL_WINDOW_MS &&
  now - Math.max(aAt, bAt) <= AUTOFILL_WINDOW_MS;
