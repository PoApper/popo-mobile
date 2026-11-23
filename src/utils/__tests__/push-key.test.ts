import paxi_api from '../paxi_api';
import {registerPushKey, unregisterPushKey} from '../push-key';

jest.mock('../paxi_api', () => ({
  post: jest.fn(),
  delete: jest.fn(),
}));
jest.mock('../i18n', () => ({
  getCurrentLocale: () => 'en',
}));

const mockPost = paxi_api.post as jest.Mock;
const mockDelete = paxi_api.delete as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
});

describe('registerPushKey', () => {
  it('토큰 없이 호출하면 FCM 토큰을 발급받아 현재 언어와 함께 등록한다', async () => {
    mockPost.mockResolvedValue({});

    await registerPushKey();

    expect(mockPost).toHaveBeenCalledWith('/push/key/', {
      key: 'mock-fcm-token',
      locale: 'en',
    });
  });

  it('전달받은 토큰을 그대로 등록한다', async () => {
    mockPost.mockResolvedValue({});

    await registerPushKey('refreshed-token');

    expect(mockPost).toHaveBeenCalledWith('/push/key/', {
      key: 'refreshed-token',
      locale: 'en',
    });
  });

  it('서버 등록 실패 시 에러를 throw한다', async () => {
    mockPost.mockRejectedValue(new Error('network error'));

    await expect(registerPushKey('token')).rejects.toThrow('network error');
  });
});

describe('unregisterPushKey', () => {
  it('이 기기의 FCM 토큰을 서버에서 삭제한다', async () => {
    mockDelete.mockResolvedValue({});

    await unregisterPushKey();

    expect(mockDelete).toHaveBeenCalledWith('/push/key', {
      params: {key: 'mock-fcm-token'},
    });
  });

  it('서버 삭제가 실패해도 에러를 throw하지 않는다', async () => {
    mockDelete.mockRejectedValue(new Error('network error'));

    await expect(unregisterPushKey()).resolves.toBeUndefined();
  });
});
