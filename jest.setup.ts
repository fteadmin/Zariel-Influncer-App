import '@testing-library/jest-dom';

// Polyfill ResizeObserver — used by Radix UI components (RadioGroup, etc.)
// jsdom does not implement it natively.
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};
