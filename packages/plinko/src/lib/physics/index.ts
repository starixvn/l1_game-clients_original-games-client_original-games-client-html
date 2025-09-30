import { logger } from '../../services/logger';

// Physics library exports
logger.info('🔬 [PHYSICS_INDEX] Loading physics library modules');

export * from './physics-config';
logger.debug('🔬 [PHYSICS_INDEX] physics-config module exported');

export * from './ball-calculations';
logger.debug('🔬 [PHYSICS_INDEX] ball-calculations module exported');

export * from './drop-positions';
logger.debug('🔬 [PHYSICS_INDEX] drop-positions module exported');

export * from './collision-handlers';
logger.debug('🔬 [PHYSICS_INDEX] collision-handlers module exported');

export * from './visual-effects';
logger.debug('🔬 [PHYSICS_INDEX] visual-effects module exported');

export * from './physics-engine';
logger.debug('🔬 [PHYSICS_INDEX] physics-engine module exported');

logger.info('✅ [PHYSICS_INDEX] All physics library modules exported successfully');
