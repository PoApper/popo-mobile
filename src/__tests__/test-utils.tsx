import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {render, RenderOptions} from '@testing-library/react-native';

/**
 * Navigation 등 프로바이더를 자동으로 감싸주는 wrapper.
 * SafeAreaProvider는 setup.js에서 글로벌 mock 처리됨.
 *
 * 사용법: `import { render } from '../__tests__/test-utils'`
 */
function AllProviders({children}: {children: React.ReactNode}) {
  return <NavigationContainer>{children}</NavigationContainer>;
}

function customRender(
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) {
  return render(ui, {wrapper: AllProviders, ...options});
}

// re-export everything from @testing-library/react-native
export * from '@testing-library/react-native';

// override render
export {customRender as render};
