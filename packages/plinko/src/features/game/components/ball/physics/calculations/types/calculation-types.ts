import { PhysicsFactors } from '../../factors/core-factors';

// Re-export PhysicsFactors for external use
export type { PhysicsFactors };

/**
 * Represents a single collision event with detailed physics data
 */
export interface CollisionEvent {
    /** Row index where collision occurred (0-based) */
    rowIndex: number;
    /** Column index where collision occurred (0-based) */
    columnIndex: number;
    /** Exact position of collision */
    position: { x: number; y: number };
    /** Ball velocity before collision */
    velocityBefore: { x: number; y: number };
    /** Ball velocity after collision */
    velocityAfter: { x: number; y: number };
    /** Collision normal vector */
    normalVector: { x: number; y: number };
    /** Energy transferred during collision */
    energyTransfer: number;
    /** Time when collision occurred (relative to drop) */
    timestamp: number;
    /** Collision type (peg, wall, etc.) */
    collisionType: 'peg' | 'wall' | 'boundary';
}

/**
 * Represents the complete ball trajectory path
 */
export interface BallTrajectory {
    /** Array of position points along the trajectory */
    positions: Array<{ x: number; y: number; timestamp: number }>;
    /** Array of velocity vectors along the trajectory */
    velocities: Array<{ x: number; y: number; timestamp: number }>;
    /** Array of collision events */
    collisions: CollisionEvent[];
    /** Total time for ball to reach bottom */
    totalTime: number;
    /** Total distance traveled */
    totalDistance: number;
    /** Final landing position */
    finalPosition: { x: number; y: number };
}

/**
 * Environmental conditions affecting the ball
 */
export interface EnvironmentalFactors {
    /** Gravity strength (m/s²) */
    gravity: number;
    /** Air density affecting resistance */
    airDensity: number;
    /** Temperature affecting air viscosity */
    temperature: number;
    /** Humidity affecting air resistance */
    humidity: number;
    /** Wind speed and direction */
    wind: { speed: number; direction: number };
}

/**
 * Ball physical properties
 */
export interface BallProperties {
    /** Ball mass (kg) */
    mass: number;
    /** Ball radius (pixels) */
    radius: number;
    /** Ball material density */
    density: number;
    /** Surface roughness coefficient */
    surfaceRoughness: number;
    /** Color for visual rendering */
    color: string;
}

/**
 * Peg configuration and properties
 */
export interface PegConfiguration {
    /** Peg radius (pixels) */
    radius: number;
    /** Peg spacing (pixels) */
    spacing: number;
    /** Number of peg rows */
    rowCount: number;
    /** Pegs per row (array for irregular layouts) */
    pegsPerRow: number[];
    /** Peg positions in world coordinates */
    positions: Array<{ row: number; col: number; x: number; y: number }>;
}

/**
 * Game board configuration
 */
export interface BoardConfiguration {
    /** Canvas width (pixels) */
    width: number;
    /** Canvas height (pixels) */
    height: number;
    /** Board layout type */
    layout: 'standard' | 'pyramid' | 'diamond' | 'custom';
    /** Number of rows of pegs */
    rows: number;
    /** Slot count at bottom */
    slotCount: number;
    /** Slot positions and multipliers */
    slots: Array<{ index: number; x: number; multiplier: number; color: string }>;
}

/**
 * Service result data from backend
 */
export interface ServiceResult {
    /** Predetermined path (0=left, 1=right) */
    path: number[];
    /** Final slot index where ball should land */
    finalSlot: number;
    /** Win multiplier for this outcome */
    multiplier: number;
    /** Bet amount */
    betValue: number;
    /** Server seed for provably fair */
    serverSeed: string;
    /** Client seed for provably fair */
    clientSeed: string;
    /** Round ID */
    roundId: string;
    /** Number of rows in the game */
    numberOfRows?: number;
}

/**
 * Complete ball game calculation object
 * Contains all physics, trajectory, and outcome data calculated before ball starts falling
 */
export interface BallGameCalculation {
    // Core identifiers
    /** Unique calculation ID */
    id: string;
    /** Round ID from service */
    roundId: string;
    /** Timestamp when calculation was created */
    createdAt: number;

    // Service data
    /** Original service result */
    serviceResult: ServiceResult;

    // Physics configuration
    /** All physics factors used for this calculation */
    physicsFactors: PhysicsFactors;
    /** Environmental conditions */
    environmentalFactors: EnvironmentalFactors;
    /** Ball physical properties */
    ballProperties: BallProperties;

    // Board configuration
    /** Peg layout and positions */
    pegConfiguration: PegConfiguration;
    /** Game board setup */
    boardConfiguration: BoardConfiguration;

    // Pre-calculated trajectory
    /** Complete ball trajectory */
    trajectory: BallTrajectory;

    // Collision analysis
    /** All predicted collisions */
    collisions: CollisionEvent[];
    /** Collision summary statistics */
    collisionStats: {
        totalCollisions: number;
        pegCollisions: number;
        wallCollisions: number;
        averageCollisionForce: number;
        energyLoss: number;
    };

    // Path analysis
    /** Path decisions (0=left, 1=right) */
    pathDecisions: number[];
    /** Path confidence scores */
    pathConfidence: number[];
    /** Alternative possible paths */
    alternativePaths: Array<{ path: number[]; probability: number; finalSlot: number }>;

    // Outcome validation
    /** Expected final slot */
    expectedFinalSlot: number;
    /** Predicted landing position */
    predictedLandingPosition: { x: number; y: number };
    /** Confidence in prediction (0-1) */
    predictionConfidence: number;
    /** Win amount calculation */
    winAmount: number;

    // Physics validation
    /** Physics stability metrics */
    stabilityMetrics: {
        terminalVelocityRatio: number;
        bounceStability: number;
        controlResponsiveness: number;
        collisionSafety: number;
    };

    // Performance metrics
    /** Calculation performance */
    performance: {
        calculationTime: number;
        memoryUsage: number;
        predictionAccuracy: number;
    };
}
