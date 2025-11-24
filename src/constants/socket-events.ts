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

  // 에러 이벤트
  ERROR = 'error',
  // TODO: 정말 확률이 적긴 한데, 일반적 상황이 아니라 웹소켓 연결 시 토큰 만료되었을 때 리프레시 토큰 이용해 갱신 후 웹소켓 재연결 필요
  ACCESS_TOKEN_EXPIRED = 'accessTokenExpired',
}
