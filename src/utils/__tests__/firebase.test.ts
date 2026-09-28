import paxi_api from '../paxi_api';
import {registerFCMToken} from '../firebase';

jest.mock('../paxi_api', () => ({
  post: jest.fn(),
}));

const mockPost = paxi_api.post as jest.Mock;

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
