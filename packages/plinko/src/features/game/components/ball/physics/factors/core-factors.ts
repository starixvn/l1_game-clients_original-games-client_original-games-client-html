/**
 * Core Physics Factors
 * Primary and secondary factors as defined in the Plinko Physics Factors Relationship Documentation
 */

// Primary Factors
export interface PrimaryPhysicsFactors {
    /** Ball radius affecting collision area (pixels) */
    ballSize: number;
    /** Ball mass affecting momentum (kg) */
    ballMass: number;
    /** Downward acceleration force (m/s²) */
    gravity: number;
    /** Drag coefficient for air resistance (kg/m) */
    airResistanceCoefficient: number;
    /** Surface friction coefficient (-) */
    friction: number;
    /** Bounce energy retention (-) */
    restitution: number;
    /** Applied directional force (N) */
    nudgeStrength: number;
    /** Horizontal movement speed (m/s) */
    velocityX: number;
    /** Vertical falling speed (m/s) */
    velocityY: number;
    /** Ball rotation speed (rad/s) */
    angularVelocity: number;
}

// Secondary Factors
export interface SecondaryPhysicsFactors {
    /** Fixed peg radius (pixels) */
    pegSize: number;
    /** Distance between pegs (pixels) */
    pegSpacing: number;
    /** Time between collisions (ms) */
    collisionCooldown: number;
    /** Momentum preservation (-) */
    momentumFactor: number;
    /** Randomness in movement (-) */
    randomFactor: number;
    /** Speed-based adjustments (-) */
    speedFactor: number;
}

// Combined Physics Factors
export interface PhysicsFactors extends PrimaryPhysicsFactors, SecondaryPhysicsFactors { }

// Default Values (based on documentation ranges)
export const DEFAULT_PHYSICS_FACTORS: PhysicsFactors = {
    // Primary Factors
    ballSize: 12,              // pixels (9-35px range)
    ballMass: 0.001,           // kg (0.001-0.05 range)
    gravity: 1.0,              // m/s² (0.5-2.0 range)
    airResistanceCoefficient: 0.05, // kg/m (0.01-0.1 range)
    friction: 0.4,             // - (0.1-0.8 range)
    restitution: 0.4,          // - (0.1-0.9 range)
    nudgeStrength: 2.8,        // N (1.0-5.0 range)
    velocityX: 0,              // m/s (-10 to +10 range)
    velocityY: 1.4,            // m/s (0.5-5.0 range)
    angularVelocity: 0.08,     // rad/s (-0.5 to +0.5 range)

    // Secondary Factors
    pegSize: 5,                // pixels (fixed)
    pegSpacing: 60,            // pixels (fixed)
    collisionCooldown: 80,     // ms (50-200 range)
    momentumFactor: 0.88,      // - (0.8-1.0 range)
    randomFactor: 0.12,        // - (0.05-0.2 range)
    speedFactor: 0.9,          // - (0.3-1.0 range)
};

// Factor Ranges (for validation)
export const PHYSICS_FACTOR_RANGES = {
    // Primary Factors
    ballSize: { min: 9, max: 35 },
    ballMass: { min: 0.001, max: 0.05 },
    gravity: { min: 0.5, max: 2.0 },
    airResistanceCoefficient: { min: 0.01, max: 0.1 },
    friction: { min: 0.1, max: 0.8 },
    restitution: { min: 0.1, max: 0.9 },
    nudgeStrength: { min: 1.0, max: 5.0 },
    velocityX: { min: -10, max: 10 },
    velocityY: { min: 0.5, max: 5.0 },
    angularVelocity: { min: -0.5, max: 0.5 },

    // Secondary Factors
    pegSize: { min: 5, max: 5 }, // Fixed
    pegSpacing: { min: 60, max: 60 }, // Fixed
    collisionCooldown: { min: 50, max: 200 },
    momentumFactor: { min: 0.8, max: 1.0 },
    randomFactor: { min: 0.05, max: 0.2 },
    speedFactor: { min: 0.3, max: 1.0 },
};

// Factor Units (for documentation)
export const PHYSICS_FACTOR_UNITS = {
    ballSize: 'pixels',
    ballMass: 'kg',
    gravity: 'm/s²',
    airResistanceCoefficient: 'kg/m',
    friction: '-',
    restitution: '-',
    nudgeStrength: 'N',
    velocityX: 'm/s',
    velocityY: 'm/s',
    angularVelocity: 'rad/s',
    pegSize: 'pixels',
    pegSpacing: 'pixels',
    collisionCooldown: 'ms',
    momentumFactor: '-',
    randomFactor: '-',
    speedFactor: '-',
};

// Factor Descriptions (from documentation)
export const PHYSICS_FACTOR_DESCRIPTIONS = {
    ballSize: 'Ball radius affecting collision area',
    ballMass: 'Ball mass affecting momentum',
    gravity: 'Downward acceleration force',
    airResistanceCoefficient: 'Drag coefficient for air resistance',
    friction: 'Surface friction coefficient',
    restitution: 'Bounce energy retention',
    nudgeStrength: 'Applied directional force',
    velocityX: 'Horizontal movement speed',
    velocityY: 'Vertical falling speed',
    angularVelocity: 'Ball rotation speed',
    pegSize: 'Fixed peg radius',
    pegSpacing: 'Distance between pegs',
    collisionCooldown: 'Time between collisions',
    momentumFactor: 'Momentum preservation',
    randomFactor: 'Randomness in movement',
    speedFactor: 'Speed-based adjustments',
};
