/**
 * Physics Engine Constants
 * Defines all physics-related hardcoded values for Matter.js engine
 */

export const PHYSICS_CONSTANTS = {
    // Engine Configuration
    ENGINE: {
        GRAVITY: 1.8,
        FPS_UPDATE_RATE: 16.666, // ~60fps
    },

    // Collision Categories (powers of 2 for Matter.js)
    COLLISION_CATEGORIES: {
        BALL: 0x0001,      // 1
        DEFAULT: 0x0002,   // 2
        MULTIPLIER: 0x0004 // 4
    },

    // Ball Physics Properties
    BALL: {
        FRICTION: 0.6,
        FRICTION_SERVICE: 0.1,
        FRICTION_AIR_MIN: 0.02,
        FRICTION_AIR_MAX: 0.05,
        FRICTION_AIR_RATIO_MULTIPLIER: 0.03,
        RESTITUTION_MIN: 0.8,
        RESTITUTION_MAX: 1.0,
        RESTITUTION_RATIO_MULTIPLIER: 0.2,
        DENSITY_BASE: 0.001,
        DENSITY_RATIO_MULTIPLIER: 2,
        COLLISION_FILTER_GROUP: -1
    },

    // Wall Properties
    WALLS: {
        THICKNESS: 20,
        TRIANGULAR_WALL_LEVELS: 6,
        TRIANGULAR_WALL_THICKNESS: 10
    }
} as const;
