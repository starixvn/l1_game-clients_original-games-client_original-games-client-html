import { Engine, Body } from 'matter-js';
import { BallGameCalculation } from '../features/game/components/ball/physics/calculations/ball-game-calculation';

/**
 * Shared physics-related types
 * Eliminates duplication across multiple files
 */

/**
 * Extended Body interface with custom properties for ball behavior
 */
export interface BallBodyExtension {
    world?: Engine['world'];
    isServiceGuided?: boolean;
    expectedFinalSlot?: number;
    multiplier?: number;
    betValue?: number;
    hasTriggeredWin?: boolean;
    servicePath?: number[];
    currentPathIndex?: number;
    isRemoved?: boolean;
    createdAt?: number;
    roundId?: number;
    wrongSlotHits?: number;
    pinCollisions?: string[];
    appliedGuidanceSteps?: string[];
    collisionCooldown?: Map<string, number>;
    collisionSequence?: Array<{ timestamp: number; pegLabel: string; position: { x: number; y: number }; velocity: { x: number; y: number } }>;
    pathPositions?: Array<{ x: number; y: number; type?: string; pegRow?: number; pegCol?: number; pathIndex?: number; direction?: number }>;
    numberOfRows?: number;
    onFinalTrajectory?: boolean;

    // Delayed guidance system
    pendingGuidance?: {
        direction: number;
        naturalNudgeStrength: number;
        rowRatio: number;
        rowCount: number;
        pinRow: number;
        appliedAtFrame: number;
    };

    // Bounce delay system
    justBounced?: boolean;
    bounceTimestamp?: number;

    // Pre-calculated physics data for enhanced realism
    calculationData?: {
        id: string;
        trajectory: BallGameCalculation['trajectory'];
        collisions: BallGameCalculation['collisions'];
        physicsFactors: BallGameCalculation['physicsFactors'];
        stabilityMetrics: BallGameCalculation['stabilityMetrics'];
        predictionConfidence: number;
        pathConfidence: number[];
        alternativePaths: BallGameCalculation['alternativePaths'];
        environmentalFactors: BallGameCalculation['environmentalFactors'];
        ballProperties: BallGameCalculation['ballProperties'];
        pegConfiguration: BallGameCalculation['pegConfiguration'];
        boardConfiguration: BallGameCalculation['boardConfiguration'];
    };
}

/**
 * Extended Body type that includes custom ball properties
 */
export type ExtendedBody = Body & BallBodyExtension;

/**
 * Slot layout configuration for collision detection
 */
export interface SlotLayout {
    startX: number;
    slotWidth: number;
    slotHeight: number;
    bottomMargin: number;
    multipliers: number[];
}

/**
 * Animation state for visual effects
 */
export interface AnimationState {
    offsetY: number;
    startTime: number;
    duration: number;
    type: 'slotBounce';
}

/**
 * Options for collision handlers
 */
export interface CollisionHandlerOptions {
    slotLayout?: SlotLayout;
    canvasHeight?: number;
    onBallHit?: (multiplier: number, betValue: number) => void;
    collisionTime?: number;
    lastLogTimeRef?: { current: number };
    animationState?: Map<string, AnimationState>;
}
