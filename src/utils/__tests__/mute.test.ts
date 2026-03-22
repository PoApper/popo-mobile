import paxi_api from '../paxi_api';
import {updateMuteStatus} from '../mute';

jest.mock('../paxi_api', () => ({
  patch: jest.fn(),
}));

const mockPatch = paxi_api.patch as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
});

describe('updateMuteStatus', () => {
  it('서버에 mute 상태를 PATCH한다', async () => {
    mockPatch.mockResolvedValue({});

    await updateMuteStatus('room-1', true);

    expect(mockPatch).toHaveBeenCalledWith('/room/room-1/mute', {
      isMuted: true,
    });
  });

  it('unmute 시 isMuted: false로 PATCH한다', async () => {
    mockPatch.mockResolvedValue({});

    await updateMuteStatus('room-1', false);

    expect(mockPatch).toHaveBeenCalledWith('/room/room-1/mute', {
      isMuted: false,
    });
  });

  it('서버 PATCH 실패 시 에러를 throw한다', async () => {
    mockPatch.mockRejectedValue(new Error('network error'));

    await expect(updateMuteStatus('room-1', true)).rejects.toThrow(
      'network error',
    );
  });
});
