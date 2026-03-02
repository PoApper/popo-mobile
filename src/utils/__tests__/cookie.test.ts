import {extractTokenFromCookie} from '../cookie';

describe('extractTokenFromCookie', () => {
  it('배열에서 Access 토큰을 추출한다', () => {
    const cookies = [
      'Authentication=abc123; Path=/; HttpOnly',
      'Refresh=xyz789; Path=/; HttpOnly',
    ];
    expect(extractTokenFromCookie(cookies, true)).toBe('abc123');
  });

  it('배열에서 Refresh 토큰을 추출한다', () => {
    const cookies = [
      'Authentication=abc123; Path=/; HttpOnly',
      'Refresh=xyz789; Path=/; HttpOnly',
    ];
    expect(extractTokenFromCookie(cookies, false)).toBe('xyz789');
  });

  it('단일 문자열에서 토큰을 추출한다', () => {
    const cookie = 'Authentication=token123; Path=/; HttpOnly';
    expect(extractTokenFromCookie(cookie, true)).toBe('token123');
  });

  it('해당 키가 없으면 null을 반환한다', () => {
    const cookies = ['SomeOther=value; Path=/'];
    expect(extractTokenFromCookie(cookies, true)).toBeNull();
  });

  it('undefined 입력에 null을 반환한다', () => {
    expect(extractTokenFromCookie(undefined, true)).toBeNull();
  });

  it('쿠키 값이 비어 있으면 null을 반환한다', () => {
    const cookies = ['Authentication=; Path=/; HttpOnly'];
    expect(extractTokenFromCookie(cookies, true)).toBeNull();
  });
});
