// 새 웹소켓을 생성하고 화면에 채택(adopt)하는 오케스트레이션.
// NewChatScreen에서 분리해 단위 테스트가 가능하도록 의존성을 주입받는다.
// initSocket이 await(socketFactory) 사이에 언포커스되면 생성된 소켓이
// socketRef에 담기지 못한 채 reconnectionAttempts:Infinity로 영원히
// 재연결하는 릭이 발생한다. 이 함수가 그 사각지대를 막는다.

import {Socket} from 'socket.io-client';

export type AdoptDeps = {
  // socketFactory 호출 + 이벤트 핸들러 등록까지 끝낸 새 소켓 생성
  create: () => Promise<Socket>;
  // 화면 포커스 여부 (await 사이 언포커스 감지)
  isFocused: () => boolean;
  // 기존/경쟁 소켓 정리 (socketRef.current 대상)
  releaseCurrent: () => void;
  // 생성된 소켓을 socketRef.current로 채택
  adopt: (socket: Socket) => void;
  // 채택하지 않고 버릴 소켓 정리
  dispose: (socket: Socket) => void;
};

/**
 * 소켓을 생성한 뒤 채택 여부를 결정한다.
 *
 * - `create` await 사이 언포커스됐으면(cleanup이 이미 돎) 새 소켓을 버린다.
 * - 아니면 남아있는 이전/경쟁 소켓을 정리하고 이 소켓을 채택한다.
 *   (재포커스와 reauth 재생성이 겹쳐도 마지막 호출이 이기고 나머지는 정리된다)
 */
export const adoptFreshSocket = async (deps: AdoptDeps): Promise<void> => {
  const socket = await deps.create();

  if (!deps.isFocused()) {
    deps.dispose(socket);
    return;
  }

  deps.releaseCurrent();
  deps.adopt(socket);
};
