import { Engine, Body } from 'matter-js';

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
    wrongSlotHits?: number;
    pinCollisions?: string[];
    appliedGuidanceSteps?: string[];
    pathPositions?: Array<{ x: number; y: number; type?: string; pegRow?: number; pegCol?: number; pathIndex?: number; direction?: number }>;
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
