// 자동완성은 아이디·비밀번호를 한 번에 통째로 채우므로, 두 칸이 이 간격 안에 통째로 채워지면 자동완성으로 본다
const AUTOFILL_WINDOW_MS = 500;

/** 한 번의 변경으로 두 글자 이상 늘면 타이핑이 아닌 통째 입력(자동완성·붙여넣기)이다. */
export const isBulkInput = (prev: string, next: string): boolean =>
  next.length - prev.length > 1;

/** 두 칸이 모두 통째로 입력됐고 그 시각이 거의 같으면 자동완성으로 채워진 것이다. */
export const isFilledTogether = (aAt: number, bAt: number): boolean =>
  aAt > 0 && bAt > 0 && Math.abs(aAt - bAt) <= AUTOFILL_WINDOW_MS;
