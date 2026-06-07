// 웹소켓 연결 시 액세스 토큰이 만료된 경우의 재인증·재연결 오케스트레이션.
// NewChatScreen에서 분리해 단위 테스트가 가능하도록 의존성을 주입받는다.

// 중복 진입/무한 루프를 막기 위한 가변 상태. 컴포넌트에서는 useRef로 보관한다.
export type ReauthGuard = {
  // 갱신·재연결 사이클이 진행 중인지 (이벤트 중복 수신 방어)
  isReauthing: boolean;
  // 정상 연결 없이 반복된 갱신 횟수 (서버 시계 오차 등으로 인한 무한 루프 방어)
  reauthCount: number;
};

export type ReauthDeps = {
  // stale 토큰 소켓 정리
  releaseSocket: () => void;
  // 리프레시 토큰으로 새 access/refresh 토큰 발급 + 저장
  refreshAccessToken: () => Promise<unknown>;
  // 새 토큰으로 소켓 재생성
  recreateSocket: () => Promise<void>;
  // 재연결 진행 동안 연결 상태 표시 갱신 (선택)
  setSocketConnected?: (connected: boolean) => void;
  // 정상 연결 없이 허용할 최대 갱신 횟수 (기본 2)
  maxAttempts?: number;
};

export const createReauthGuard = (): ReauthGuard => ({
  isReauthing: false,
  reauthCount: 0,
});

/**
 * 토큰 만료 이벤트를 받았을 때 갱신 후 소켓을 재생성한다.
 *
 * - 진행 중이면(`isReauthing`) 즉시 반환해 중복 갱신을 막는다.
 * - 정상 연결 없이 `maxAttempts`회 이상 반복되면 재연결을 중단한다.
 * - 갱신 실패 시 소켓만 정리한다. (refreshAccessToken 내부에서 로그아웃 처리)
 *
 * `reauthCount`는 정상 연결 시 호출 측에서 0으로 초기화한다.
 */
export const reconnectWithFreshToken = async (
  guard: ReauthGuard,
  deps: ReauthDeps,
): Promise<void> => {
  const maxAttempts = deps.maxAttempts ?? 2;

  if (guard.isReauthing) {
    return; // 이벤트 중복 수신 시 1회만 갱신
  }
  guard.isReauthing = true;

  try {
    if (guard.reauthCount >= maxAttempts) {
      console.error('토큰 갱신 반복 실패 — 재연결 중단');
      // releaseSocket은 리스너 제거 후 disconnect하므로 disconnect 이벤트가
      // 발생하지 않는다. UI가 연결됨으로 남지 않도록 명시적으로 끊김 처리한다.
      deps.setSocketConnected?.(false);
      deps.releaseSocket();
      return;
    }
    guard.reauthCount += 1;

    try {
      deps.setSocketConnected?.(false);
      deps.releaseSocket(); // stale 토큰 소켓 정리
      await deps.refreshAccessToken(); // 새 access/refresh 토큰 발급 + 저장
      await deps.recreateSocket(); // 새 토큰으로 소켓 재생성
    } catch (err) {
      // refreshAccessToken 내부에서 reset_auth + 로그인 화면 이동까지 처리됨
      console.error('토큰 갱신 실패, 재연결 중단:', err);
      deps.releaseSocket();
    }
  } finally {
    guard.isReauthing = false;
  }
};
