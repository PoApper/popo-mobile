import {getAxiosErrorInfo} from '../axios-error';
import axios, {AxiosError} from 'axios';

describe('getAxiosErrorInfo', () => {
  it('AxiosError에서 status와 detail을 추출한다', () => {
    const error = new AxiosError(
      'Request failed',
      '400',
      undefined,
      undefined,
      {
        status: 400,
        data: {detail: '잘못된 요청입니다'},
        statusText: 'Bad Request',
        headers: {},
        config: {} as any,
      },
    );
    const info = getAxiosErrorInfo(error);

    expect(info.isAxios).toBe(true);
    expect(info.status).toBe(400);
    expect(info.detail).toBe('잘못된 요청입니다');
  });

  it('문자열 data를 detail로 사용한다', () => {
    const error = new AxiosError(
      'Request failed',
      '500',
      undefined,
      undefined,
      {
        status: 500,
        data: 'Internal Server Error',
        statusText: 'Internal Server Error',
        headers: {},
        config: {} as any,
      },
    );
    const info = getAxiosErrorInfo(error);

    expect(info.isAxios).toBe(true);
    expect(info.detail).toBe('Internal Server Error');
  });

  it('일반 Error를 처리한다', () => {
    const error = new Error('네트워크 오류');
    const info = getAxiosErrorInfo(error);

    expect(info.isAxios).toBe(false);
    expect(info.detail).toBe('네트워크 오류');
  });

  it('문자열 에러를 처리한다', () => {
    const info = getAxiosErrorInfo('unexpected error');

    expect(info.isAxios).toBe(false);
    expect(info.detail).toBe('unexpected error');
  });
});
