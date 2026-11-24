export interface PushBannerMessage {
  id: string;
  title: string;
  body?: string;
  roomUuid?: string;
}

/** 그 채팅방을 이미 보고 있으면 메시지가 화면에 바로 보이므로 배너가 필요 없다. */
export const isViewingRoom = (
  route: {name: string; params?: object} | undefined,
  roomUuid?: string,
) =>
  !!roomUuid &&
  route?.name === 'NewChat' &&
  (route.params as {roomUuid?: string} | undefined)?.roomUuid === roomUuid;
