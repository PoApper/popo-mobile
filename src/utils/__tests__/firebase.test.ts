import paxi_api from '../paxi_api';
import {registerFCMToken, unregisterFCMToken} from '../firebase';

jest.mock('../paxi_api', () => ({
  post: jest.fn(),
  delete: jest.fn(),
}));

const mockPost = paxi_api.post as jest.Mock;
const mockDelete = paxi_api.delete as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
});

describe('registerFCMToken', () => {
  it('토큰 없이 호출하면 FCM 토큰을 발급받아 서버에 등록한다', async () => {
    mockPost.mockResolvedValue({});

    await registerFCMToken();

    expect(mockPost).toHaveBeenCalledWith('/push/key/', {
      key: 'mock-fcm-token',
    });
  });

  it('전달받은 토큰을 그대로 서버에 등록한다', async () => {
    mockPost.mockResolvedValue({});

    await registerFCMToken('refreshed-token');

    expect(mockPost).toHaveBeenCalledWith('/push/key/', {
      key: 'refreshed-token',
    });
  });

  it('서버 등록 실패 시 에러를 throw한다', async () => {
    mockPost.mockRejectedValue(new Error('network error'));

    await expect(registerFCMToken('token')).rejects.toThrow('network error');
  });
});

describe('unregisterFCMToken', () => {
  it('이 기기의 FCM 토큰을 서버에서 삭제한다', async () => {
    mockDelete.mockResolvedValue({});

    await unregisterFCMToken();

    expect(mockDelete).toHaveBeenCalledWith('/push/key', {
      params: {key: 'mock-fcm-token'},
    });
  });

  it('서버 삭제가 실패해도 에러를 throw하지 않는다', async () => {
    mockDelete.mockRejectedValue(new Error('network error'));

    await expect(unregisterFCMToken()).resolves.toBeUndefined();
  });
});
