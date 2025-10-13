/**
 * Ball Properties Module
 * Defines ball-specific physics properties and their relationships
 */

import { BALL_CONSTANTS } from '../constants/ball-constants';
import { physicsLogger } from '../performance/physics-logger';

/**
 * Ball physics properties interface
 */
export interface BallPhysicsProperties {
    /** Ball radius in pixels */
    radius: number;
    /** Ball mass in kg */
    mass: number;
    /** Ball density in kg/m³ */
    density: number;
    /** Coefficient of restitution (bounciness) */
    restitution: number;
    /** Air resistance coefficient */
    frictionAir: number;
    /** Surface friction coefficient */
    friction: number;
    /** Static friction coefficient */
    frictionStatic: number;
    /** Collision filter group */
    collisionFilter?: {
        group: number;
        category: number;
        mask: number;
    };
}

/**
 * Ball physics tweaks for dynamic adjustment
 */
export interface BallPhysicsTweaks {
    restitution: number;
    frictionAir: number;
    density: number;
    friction: number;
    frictionStatic: number;
}

/**
 * Default ball physics properties
 */
export const DEFAULT_BALL_PROPERTIES: BallPhysicsProperties = {
    radius: 12,
    mass: 0.001,
    density: 1000,
    restitution: 0.4,
    frictionAir: 0.05,
    friction: 0.4,
    frictionStatic: 0.6,
};

/**
 * Ball size constraints
 */
export const BALL_SIZE_CONSTRAINTS = {
    MIN_RADIUS: BALL_CONSTANTS.SIZE_CONSTRAINTS.MIN_RADIUS,
    MAX_RADIUS: 17.5,   // 35px diameter - max diameter/2
    MIN_ROWS: BALL_CONSTANTS.SIZE_CONSTRAINTS.MIN_ROWS,
    MAX_ROWS: BALL_CONSTANTS.SIZE_CONSTRAINTS.MAX_ROWS,
};

/**
 * Ball physics scaling factors
 */
export const BALL_PHYSICS_SCALING = {
    /** How much restitution scales with ball size */
    restitutionScalingFactor: 0.1,
    /** How much friction scales with ball size */
    frictionScalingFactor: 0.05,
    /** How much air resistance scales with ball size */
    airResistanceScalingFactor: 0.3,
    /** How much density scales with ball size */
    densityScalingFactor: 0.0, // Density typically remains constant
};

/**
 * Calculate ball physics properties based on size
 */
export function calculateBallProperties(radius: number, baseProperties: Partial<BallPhysicsProperties> = {}): BallPhysicsProperties {
    const startTime = performance.now();
    const sizeRatio = radius / DEFAULT_BALL_PROPERTIES.radius;

    physicsLogger.debug('Calculating ball properties', {
        component: 'BallProperties',
        function: 'calculateBallProperties',
        metadata: { radius, sizeRatio, baseProperties }
    });

    const result = {
        radius,
        mass: baseProperties.mass || calculateBallMass(radius),
        density: baseProperties.density || DEFAULT_BALL_PROPERTIES.density,
        restitution: baseProperties.restitution ||
            Math.max(0.1, Math.min(0.9,
                DEFAULT_BALL_PROPERTIES.restitution +
                (sizeRatio - 1) * BALL_PHYSICS_SCALING.restitutionScalingFactor
            )),
        frictionAir: baseProperties.frictionAir ||
            Math.max(0.01, Math.min(0.1,
                DEFAULT_BALL_PROPERTIES.frictionAir *
                Math.pow(sizeRatio, BALL_PHYSICS_SCALING.airResistanceScalingFactor)
            )),
        friction: baseProperties.friction ||
            Math.max(0.1, Math.min(0.8,
                DEFAULT_BALL_PROPERTIES.friction +
                (sizeRatio - 1) * BALL_PHYSICS_SCALING.frictionScalingFactor
            )),
        frictionStatic: baseProperties.frictionStatic ||
            Math.max(0.1, Math.min(1.0,
                DEFAULT_BALL_PROPERTIES.frictionStatic +
                (sizeRatio - 1) * BALL_PHYSICS_SCALING.frictionScalingFactor
            )),
    };

    const endTime = performance.now();
    const duration = endTime - startTime;

    physicsLogger.debug('Ball properties calculated successfully', {
        component: 'BallProperties',
        function: 'calculateBallProperties',
        metadata: {
            radius,
            calculatedMass: result.mass,
            restitution: result.restitution,
            frictionAir: result.frictionAir,
            friction: result.friction,
            frictionStatic: result.frictionStatic,
            duration: `${duration.toFixed(2)}ms`
        }
    });

    return result;
}

/**
 * Calculate ball mass based on radius and density
 * Formula: mass = density × (4/3) × π × radius³
 */
export function calculateBallMass(radius: number, density = 1000): number {
    // Convert radius from pixels to meters (assuming 100 pixels = 1 meter for physics)
    const radiusMeters = radius / 100;
    return density * (4 / 3) * Math.PI * Math.pow(radiusMeters, 3);
}

/**
 * Get physics tweaks for different ball sizes
 * Used for dynamic ball sizing based on rows
 */
export function getBallPhysicsTweaks(radius: number): BallPhysicsTweaks {
    physicsLogger.debug('Getting ball physics tweaks', {
        component: 'BallProperties',
        function: 'getBallPhysicsTweaks',
        metadata: { radius }
    });

    const properties = calculateBallProperties(radius);

    const tweaks = {
        restitution: properties.restitution,
        frictionAir: properties.frictionAir,
        density: properties.density,
        friction: properties.friction,
        frictionStatic: properties.frictionStatic,
    };

    physicsLogger.debug('Ball physics tweaks calculated', {
        component: 'BallProperties',
        function: 'getBallPhysicsTweaks',
        metadata: { radius, tweaks }
    });

    return tweaks;
}

/**
 * Calculate dynamic ball size based on number of rows
 * Formula: radius = baseRadius / (rows / baseRows) with clamping
 */
export function calculateDynamicBallSize(
    rows: number,
    baseRows = 10,
    baseRadius = 12,
    canvasScaleFactor = 1
): number {
    physicsLogger.debug('Calculating dynamic ball size', {
        component: 'BallProperties',
        function: 'calculateDynamicBallSize',
        metadata: { rows, baseRows, baseRadius, canvasScaleFactor }
    });

    // Validate input
    const validRows = Math.max(BALL_SIZE_CONSTRAINTS.MIN_ROWS,
        Math.min(BALL_SIZE_CONSTRAINTS.MAX_ROWS, rows));

    // Core size calculation: inversely proportional to rows
    const rawRadius = baseRadius / (validRows / baseRows);

    // Apply canvas responsive scaling
    const scaledRadius = rawRadius * canvasScaleFactor;

    // Clamp between min and max radii
    const finalRadius = Math.max(BALL_SIZE_CONSTRAINTS.MIN_RADIUS,
        Math.min(BALL_SIZE_CONSTRAINTS.MAX_RADIUS, scaledRadius));

    physicsLogger.debug('Dynamic ball size calculated', {
        component: 'BallProperties',
        function: 'calculateDynamicBallSize',
        metadata: {
            inputRows: rows,
            validRows,
            rawRadius: rawRadius.toFixed(2),
            scaledRadius: scaledRadius.toFixed(2),
            finalRadius: finalRadius.toFixed(2)
        }
    });

    return finalRadius;
}

/**
 * Calculate collision area for ball
 * Formula: area = π × radius²
 */
export function calculateBallCollisionArea(radius: number): number {
    return Math.PI * Math.pow(radius, 2);
}

/**
 * Calculate ball moment of inertia
 * Formula: I = (2/5) × mass × radius² (for solid sphere)
 */
export function calculateBallMomentOfInertia(mass: number, radius: number): number {
    return (2 / 5) * mass * Math.pow(radius, 2);
}

/**
 * Get ball physics configuration for Matter.js
 */
export function getBallPhysicsConfig(properties: BallPhysicsProperties) {
    return {
        restitution: properties.restitution,
        friction: properties.friction,
        frictionAir: properties.frictionAir,
        frictionStatic: properties.frictionStatic,
        density: properties.density,
        collisionFilter: properties.collisionFilter || {
            group: 0,
            category: 0x0001,
            mask: 0xFFFFFFFF
        }
    };
}
