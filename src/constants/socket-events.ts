// paxi-popo-nest-api 참고
// https://github.com/PoApper/paxi-popo-nest-api/blob/main/websocket-api.md
// https://github.com/PoApper/paxi-popo-nest-api/blob/main/src/chat/chat.events.ts

export const enum ChatEvent {
  // 메시지 관련 이벤트
  NEW_MESSAGE = 'newMessage',
  UPDATED_MESSAGE = 'updatedMessage',
  DELETED_MESSAGE = 'deletedMessage',

  // 정산 관련 이벤트
  NEW_SETTLEMENT = 'newSettlement',
  UPDATED_SETTLEMENT = 'updatedSettlement',
  DELETED_SETTLEMENT = 'deletedSettlement',

  // 방 관련 이벤트
  UPDATED_ROOM = 'updatedRoom',
  UPDATED_IS_PAID = 'updatedIsPaid',

  // 유저 강퇴 관련 이벤트
  USER_KICKED = 'userKicked',

  // 연결 관련 이벤트
  // 서버 handleConnection이 토큰 검증에 성공하면 보낸다. 전송 계층 connect가
  // 아니라 이 이벤트를 실제 사용 가능(인증 확정)으로 취급한다.
  CONNECTED = 'connected',

  // 에러 이벤트
  ERROR = 'error',
  // 웹소켓 연결 시 액세스 토큰이 만료된 경우 서버가 내려보낸다.
  // NewChatScreen.onAccessTokenExpired에서 리프레시 토큰으로 갱신 후 소켓을 재생성한다.
  ACCESS_TOKEN_EXPIRED = 'accessTokenExpired',
}
