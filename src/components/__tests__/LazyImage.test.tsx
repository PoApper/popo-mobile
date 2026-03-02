import React from 'react';
import {render, fireEvent} from '../../__tests__/test-utils';
import LazyImage from '../LazyImage';

describe('LazyImage', () => {
  it('uri가 있으면 해당 uri로 Image를 렌더링한다', () => {
    const {getByTestId} = render(
      <LazyImage uri="https://example.com/image.png" testID="lazy-image" />,
    );

    const image = getByTestId('lazy-image');
    expect(image.props.source).toEqual({uri: 'https://example.com/image.png'});
  });

  it('uri가 없으면 fallback 이미지를 렌더링한다', () => {
    const {getByTestId} = render(<LazyImage testID="lazy-image" />);

    const image = getByTestId('lazy-image');
    // uri가 없으므로 fallback(숫자 = require 결과)이 사용됨
    expect(image.props.source).not.toEqual(
      expect.objectContaining({uri: expect.any(String)}),
    );
  });

  it('이미지 로드 실패 시 fallback으로 전환한다', () => {
    const onError = jest.fn();
    const {getByTestId} = render(
      <LazyImage
        uri="https://example.com/broken.png"
        testID="lazy-image"
        onError={onError}
      />,
    );

    const image = getByTestId('lazy-image');

    // 에러 발생 시뮬레이션
    fireEvent(image, 'error', {
      nativeEvent: {error: 'Failed to load'},
    });

    // onError 콜백이 호출되었는지 확인
    expect(onError).toHaveBeenCalled();

    // 에러 이후에는 fallback 이미지로 전환되었는지 확인
    const updatedImage = getByTestId('lazy-image');
    expect(updatedImage.props.source).not.toEqual(
      expect.objectContaining({uri: expect.any(String)}),
    );
  });
});
