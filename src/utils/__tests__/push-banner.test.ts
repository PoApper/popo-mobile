import {isViewingRoom} from '../push-banner';

describe('isViewingRoom', () => {
  const chat = {name: 'NewChat', params: {roomUuid: 'room-1'}};

  it('같은 채팅방을 보고 있으면 true', () => {
    expect(isViewingRoom(chat, 'room-1')).toBe(true);
  });

  it('다른 채팅방이면 false', () => {
    expect(isViewingRoom(chat, 'room-2')).toBe(false);
  });

  it('채팅방이 아닌 화면이면 false', () => {
    expect(isViewingRoom({name: 'Home'}, 'room-1')).toBe(false);
  });

  it('푸시에 방이 없으면 false', () => {
    expect(isViewingRoom(chat, undefined)).toBe(false);
  });
});
