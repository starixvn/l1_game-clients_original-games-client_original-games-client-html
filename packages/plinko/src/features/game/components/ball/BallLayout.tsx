import { logger } from '../../../../services/logger';

// BallLayout is now a direct alias for LayeredCanvasBallLayout
// This provides backward compatibility while simplifying the architecture
logger.info('📦 [BALL_LAYOUT] BallLayout module loaded - Direct alias for LayeredCanvasBallLayout');
logger.debug('📦 [BALL_LAYOUT] Exporting LayeredCanvasBallLayout as default export');

export { default } from './LayeredCanvasBallLayout';
export type { LayeredCanvasBallLayoutRef } from './LayeredCanvasBallLayout';

logger.info('✅ [BALL_LAYOUT] BallLayout module exports completed');


