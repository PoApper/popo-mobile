// ──────────────────────────────────────────────
// Silence non-critical warnings in test output
// ──────────────────────────────────────────────
// setupFilesAfterFramework에서 실행되므로 Jest 글로벌(beforeAll 등) 사용 가능
const originalWarn = console.warn;

beforeAll(() => {
  console.warn = (...args) => {
    const message = typeof args[0] === 'string' ? args[0] : '';
    if (
      message.includes('Animated:') ||
      message.includes('componentWillReceiveProps') ||
      message.includes('componentWillMount')
    ) {
      return;
    }
    originalWarn.call(console, ...args);
  };
});

afterAll(() => {
  console.warn = originalWarn;
});
