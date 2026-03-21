import EncryptedStorage from 'react-native-encrypted-storage';
import paxi_api from '../paxi_api';
import {updateMuteStatus, isRoomMuted} from '../mute';

jest.mock('react-native-encrypted-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

jest.mock('../paxi_api', () => ({
  patch: jest.fn(),
}));

const mockGetItem = EncryptedStorage.getItem as jest.Mock;
const mockSetItem = EncryptedStorage.setItem as jest.Mock;
const mockRemoveItem = EncryptedStorage.removeItem as jest.Mock;
const mockPatch = paxi_api.patch as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  mockSetItem.mockResolvedValue(undefined);
  mockRemoveItem.mockResolvedValue(undefined);
});

describe('updateMuteStatus', () => {
  it('서버에 mute 상태를 PATCH한다', async () => {
    mockPatch.mockResolvedValue({});
    mockGetItem.mockResolvedValue(null);

    await updateMuteStatus('room-1', true);

    expect(mockPatch).toHaveBeenCalledWith('/room/room-1/mute', {
      isMuted: true,
    });
  });

  it('서버 PATCH 실패 시 에러를 throw한다', async () => {
    mockPatch.mockRejectedValue(new Error('network error'));

    await expect(updateMuteStatus('room-1', true)).rejects.toThrow(
      'network error',
    );
  });

  it('로컬 캐시 업데이트 실패해도 서버 PATCH는 성공으로 처리된다', async () => {
    mockPatch.mockResolvedValue({});
    mockGetItem.mockResolvedValue(null);
    mockSetItem.mockRejectedValue(new Error('storage error'));
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    await updateMuteStatus('room-1', true);

    expect(mockPatch).toHaveBeenCalled();
    // 로컬 캐시 에러는 비동기로 처리되므로 flush
    await new Promise(resolve => setTimeout(resolve, 0));
    expect(consoleSpy).toHaveBeenCalledWith(
      'Failed to update local mute cache:',
      expect.any(Error),
    );
    consoleSpy.mockRestore();
  });

  it('mute 시 로컬 캐시에 roomUuid를 추가한다', async () => {
    mockPatch.mockResolvedValue({});
    mockGetItem.mockResolvedValue(JSON.stringify(['room-0']));

    await updateMuteStatus('room-1', true);

    await new Promise(resolve => setTimeout(resolve, 0));
    expect(mockSetItem).toHaveBeenCalledWith(
      'muted_rooms',
      expect.stringContaining('room-1'),
    );
  });

  it('unmute 시 로컬 캐시에서 roomUuid를 제거한다', async () => {
    mockPatch.mockResolvedValue({});
    mockGetItem.mockResolvedValue(JSON.stringify(['room-1', 'room-2']));

    await updateMuteStatus('room-1', false);

    await new Promise(resolve => setTimeout(resolve, 0));
    const savedValue = JSON.parse(mockSetItem.mock.calls[0][1]);
    expect(savedValue).toEqual(['room-2']);
  });
});

describe('isRoomMuted', () => {
  it('muted 목록에 있으면 true를 반환한다', async () => {
    mockGetItem.mockResolvedValue(JSON.stringify(['room-1', 'room-2']));

    expect(await isRoomMuted('room-1')).toBe(true);
  });

  it('muted 목록에 없으면 false를 반환한다', async () => {
    mockGetItem.mockResolvedValue(JSON.stringify(['room-2']));

    expect(await isRoomMuted('room-1')).toBe(false);
  });

  it('저장된 데이터가 없으면 false를 반환한다', async () => {
    mockGetItem.mockResolvedValue(null);

    expect(await isRoomMuted('room-1')).toBe(false);
  });

  it('손상된 JSON이 저장되어 있으면 false를 반환하고 키를 삭제한다', async () => {
    mockGetItem.mockResolvedValue('invalid-json{{{');

    expect(await isRoomMuted('room-1')).toBe(false);
    expect(mockRemoveItem).toHaveBeenCalledWith('muted_rooms');
  });
});
