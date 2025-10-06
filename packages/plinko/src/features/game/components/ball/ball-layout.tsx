// BallLayout now uses the simplified single-canvas implementation
// This provides better performance and eliminates re-rendering issues

// Export the main component
export { default } from './simplified-canvas-ball-layout';
export type { SimplifiedCanvasBallLayoutRef } from './simplified-canvas-ball-layout';

// Export test utilities for testing ball spawning
export * from './ball-test-utils';
