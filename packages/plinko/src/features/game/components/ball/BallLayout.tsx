// BallLayout is now a direct alias for LayeredCanvasBallLayout
// This provides backward compatibility while simplifying the architecture

// Export the main component
export { default } from './LayeredCanvasBallLayout';
export type { LayeredCanvasBallLayoutRef } from './LayeredCanvasBallLayout';

// Export test utilities for testing ball spawning
export * from './ball-test-utils';


