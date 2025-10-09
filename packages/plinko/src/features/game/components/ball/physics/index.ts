/**
 * Ball Physics System
 * Comprehensive, modular physics system for the Plinko ball component,
 * restructured according to the Plinko Physics Factors Relationship Documentation
 */

// Core physics factors and relationships
export * from './factors';

// Ball properties and physics calculations
export * from './ball';

// Collision detection and response
export * from './collisions';

// Environmental factors (gravity, air resistance)
export * from './environment';

// Modular physics engine
export * from './engine';

// Physics scaling system
export * from './scaling';

// Performance monitoring and optimization
export * from './performance';

// Centralized logging system
export { physicsLogger, PhysicsLog } from './performance/physics-logger';
export type { LogLevel, PhysicsLoggerConfig } from './performance/physics-logger';

// Legacy exports (for backward compatibility)
export * from './physics-config';
export * from './body-factory';
export * from './drop-positions';

// Explicit exports for critical functions
export { calculateBallSize, getBallPhysicsTweaks } from './ball';
export { physicsConfig } from './physics-config';
export { getMiddleDropPosition } from './drop-positions';
export { BALL_CONSTANTS } from './constants/ball-constants';
export { initializePhysicsEngine } from './engine/modular-physics-engine';
export type { PhysicsEngineConfig, PhysicsEngineState } from './engine/modular-physics-engine';
