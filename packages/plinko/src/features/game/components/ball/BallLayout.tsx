import { logger } from '../../../../services/logger';

// BallLayout is now a direct alias for LayeredCanvasBallLayout
// This provides backward compatibility while simplifying the architecture
logger.info('📦 [BALL_LAYOUT] BallLayout module loaded - Direct alias for LayeredCanvasBallLayout');
logger.debug('📦 [BALL_LAYOUT] Exporting LayeredCanvasBallLayout as default export');

// Export the main component
export { default } from './LayeredCanvasBallLayout';
export type { LayeredCanvasBallLayoutRef } from './LayeredCanvasBallLayout';

// Export test utilities for testing ball spawning
export * from './ball-test-utils';

logger.info('✅ [BALL_LAYOUT] BallLayout module exports completed');


