import { logger } from '../../../../../services/logger';

// Layer components for the layered CanvasBallLayout architecture
logger.info('📦 [LAYERS_INDEX] Loading layer components for layered CanvasBallLayout architecture');

export { default as BackgroundLayer } from './BackgroundLayer';
logger.debug('📦 [LAYERS_INDEX] BackgroundLayer exported');

export { default as BoardLayer } from './BoardLayer';
logger.debug('📦 [LAYERS_INDEX] BoardLayer exported');

export { default as PhysicsLayer } from './PhysicsLayer';
logger.debug('📦 [LAYERS_INDEX] PhysicsLayer exported');

// Export types
export type { PhysicsLayerRef } from './PhysicsLayer';
logger.debug('📦 [LAYERS_INDEX] PhysicsLayerRef type exported');

export type { BackgroundLayerProps } from './BackgroundLayer';
logger.debug('📦 [LAYERS_INDEX] BackgroundLayerProps type exported');

export type { BoardLayerProps } from './BoardLayer';
logger.debug('📦 [LAYERS_INDEX] BoardLayerProps type exported');

logger.info('✅ [LAYERS_INDEX] All layer components and types exported successfully');
