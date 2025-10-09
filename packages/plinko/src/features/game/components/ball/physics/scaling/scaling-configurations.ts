/**
 * Scaling Configurations Module
 * Predefined scaling configurations for different game modes and scenarios
 */

import { ScalingConfiguration, ScalingType } from './physics-scaler';

/**
 * Game mode scaling presets
 */
export const GAME_MODE_SCALING_PRESETS = {
    classic: {
        name: 'Classic',
        description: 'Traditional Plinko gameplay with balanced physics',
        configurations: [
            {
                factor: 'nudgeStrength',
                scalingType: ScalingType.POWER,
                baseValue: 2.8,
                scalingFactor: 1.4,
                exponent: 1.4,
                minValue: 1.0,
                maxValue: 8.0,
            },
            {
                factor: 'velocityY',
                scalingType: ScalingType.POWER,
                baseValue: 1.4,
                scalingFactor: 1.1,
                exponent: 1.1,
                minValue: 0.5,
                maxValue: 6.0,
            },
            {
                factor: 'collisionCooldown',
                scalingType: ScalingType.INVERSE,
                baseValue: 80,
                scalingFactor: 1.0,
                minValue: 50,
                maxValue: 150,
            },
        ],
    },

    fast: {
        name: 'Fast',
        description: 'High-speed gameplay with quick ball movement',
        configurations: [
            {
                factor: 'nudgeStrength',
                scalingType: ScalingType.POWER,
                baseValue: 3.5,
                scalingFactor: 1.6,
                exponent: 1.6,
                minValue: 1.5,
                maxValue: 12.0,
            },
            {
                factor: 'velocityY',
                scalingType: ScalingType.POWER,
                baseValue: 2.0,
                scalingFactor: 1.3,
                exponent: 1.3,
                minValue: 0.8,
                maxValue: 10.0,
            },
            {
                factor: 'collisionCooldown',
                scalingType: ScalingType.INVERSE,
                baseValue: 60,
                scalingFactor: 1.2,
                minValue: 30,
                maxValue: 120,
            },
            {
                factor: 'airResistanceCoefficient',
                scalingType: ScalingType.INVERSE,
                baseValue: 0.03,
                scalingFactor: 0.7,
                minValue: 0.005,
                maxValue: 0.1,
            },
        ],
    },

    precise: {
        name: 'Precise',
        description: 'Slow, controlled gameplay requiring precision',
        configurations: [
            {
                factor: 'nudgeStrength',
                scalingType: ScalingType.POWER,
                baseValue: 2.0,
                scalingFactor: 1.2,
                exponent: 1.2,
                minValue: 0.8,
                maxValue: 6.0,
            },
            {
                factor: 'velocityY',
                scalingType: ScalingType.POWER,
                baseValue: 1.0,
                scalingFactor: 0.9,
                exponent: 0.9,
                minValue: 0.3,
                maxValue: 4.0,
            },
            {
                factor: 'collisionCooldown',
                scalingType: ScalingType.INVERSE,
                baseValue: 120,
                scalingFactor: 0.8,
                minValue: 80,
                maxValue: 200,
            },
            {
                factor: 'airResistanceCoefficient',
                scalingType: ScalingType.INVERSE,
                baseValue: 0.08,
                scalingFactor: 1.0,
                minValue: 0.02,
                maxValue: 0.15,
            },
        ],
    },

    chaotic: {
        name: 'Chaotic',
        description: 'Unpredictable gameplay with high randomness',
        configurations: [
            {
                factor: 'nudgeStrength',
                scalingType: ScalingType.POWER,
                baseValue: 4.0,
                scalingFactor: 1.8,
                exponent: 1.8,
                minValue: 2.0,
                maxValue: 15.0,
            },
            {
                factor: 'velocityY',
                scalingType: ScalingType.POWER,
                baseValue: 1.8,
                scalingFactor: 1.4,
                exponent: 1.4,
                minValue: 0.6,
                maxValue: 8.0,
            },
            {
                factor: 'collisionCooldown',
                scalingType: ScalingType.INVERSE,
                baseValue: 50,
                scalingFactor: 1.5,
                minValue: 25,
                maxValue: 100,
            },
            {
                factor: 'randomFactor',
                scalingType: ScalingType.POWER,
                baseValue: 0.15,
                scalingFactor: 1.2,
                exponent: 1.2,
                minValue: 0.05,
                maxValue: 0.3,
            },
        ],
    },
};

/**
 * Device-specific scaling configurations
 */
export const DEVICE_SCALING_PRESETS = {
    mobile: {
        name: 'Mobile',
        description: 'Optimized for touch interfaces and smaller screens',
        configurations: [
            {
                factor: 'nudgeStrength',
                scalingType: ScalingType.POWER,
                baseValue: 3.0,
                scalingFactor: 1.3,
                exponent: 1.3,
                minValue: 1.2,
                maxValue: 9.0,
            },
            {
                factor: 'ballSize',
                scalingType: ScalingType.PROPORTIONAL,
                baseValue: 14,
                scalingFactor: 1.1,
                minValue: 12,
                maxValue: 20,
            },
            {
                factor: 'collisionCooldown',
                scalingType: ScalingType.INVERSE,
                baseValue: 90,
                scalingFactor: 1.1,
                minValue: 60,
                maxValue: 160,
            },
        ],
    },

    desktop: {
        name: 'Desktop',
        description: 'Optimized for mouse control and larger screens',
        configurations: [
            {
                factor: 'nudgeStrength',
                scalingType: ScalingType.POWER,
                baseValue: 2.5,
                scalingFactor: 1.2,
                exponent: 1.2,
                minValue: 1.0,
                maxValue: 7.0,
            },
            {
                factor: 'ballSize',
                scalingType: ScalingType.PROPORTIONAL,
                baseValue: 12,
                scalingFactor: 1.0,
                minValue: 9,
                maxValue: 16,
            },
            {
                factor: 'collisionCooldown',
                scalingType: ScalingType.INVERSE,
                baseValue: 75,
                scalingFactor: 1.0,
                minValue: 50,
                maxValue: 140,
            },
        ],
    },

    tablet: {
        name: 'Tablet',
        description: 'Balanced configuration for tablet devices',
        configurations: [
            {
                factor: 'nudgeStrength',
                scalingType: ScalingType.POWER,
                baseValue: 2.8,
                scalingFactor: 1.25,
                exponent: 1.25,
                minValue: 1.1,
                maxValue: 8.0,
            },
            {
                factor: 'ballSize',
                scalingType: ScalingType.PROPORTIONAL,
                baseValue: 13,
                scalingFactor: 1.05,
                minValue: 11,
                maxValue: 18,
            },
            {
                factor: 'collisionCooldown',
                scalingType: ScalingType.INVERSE,
                baseValue: 85,
                scalingFactor: 1.05,
                minValue: 55,
                maxValue: 150,
            },
        ],
    },
};

/**
 * Difficulty-based scaling configurations
 */
export const DIFFICULTY_SCALING_PRESETS = {
    easy: {
        name: 'Easy',
        description: 'Relaxed gameplay with forgiving physics',
        difficultyMultiplier: 0.7,
        configurations: [
            {
                factor: 'nudgeStrength',
                scalingType: ScalingType.POWER,
                baseValue: 3.2,
                scalingFactor: 1.3,
                exponent: 1.3,
                minValue: 1.5,
                maxValue: 10.0,
            },
            {
                factor: 'airResistanceCoefficient',
                scalingType: ScalingType.INVERSE,
                baseValue: 0.09,
                scalingFactor: 1.2,
                minValue: 0.03,
                maxValue: 0.18,
            },
            {
                factor: 'randomFactor',
                scalingType: ScalingType.PROPORTIONAL,
                baseValue: 0.08,
                scalingFactor: 0.8,
                minValue: 0.03,
                maxValue: 0.15,
            },
        ],
    },

    normal: {
        name: 'Normal',
        description: 'Standard difficulty with balanced physics',
        difficultyMultiplier: 1.0,
        configurations: [
            {
                factor: 'nudgeStrength',
                scalingType: ScalingType.POWER,
                baseValue: 2.8,
                scalingFactor: 1.4,
                exponent: 1.4,
                minValue: 1.0,
                maxValue: 8.0,
            },
            {
                factor: 'airResistanceCoefficient',
                scalingType: ScalingType.INVERSE,
                baseValue: 0.05,
                scalingFactor: 1.0,
                minValue: 0.01,
                maxValue: 0.12,
            },
            {
                factor: 'randomFactor',
                scalingType: ScalingType.PROPORTIONAL,
                baseValue: 0.12,
                scalingFactor: 1.0,
                minValue: 0.05,
                maxValue: 0.2,
            },
        ],
    },

    hard: {
        name: 'Hard',
        description: 'Challenging gameplay requiring skill',
        difficultyMultiplier: 1.4,
        configurations: [
            {
                factor: 'nudgeStrength',
                scalingType: ScalingType.POWER,
                baseValue: 2.2,
                scalingFactor: 1.5,
                exponent: 1.5,
                minValue: 0.8,
                maxValue: 6.0,
            },
            {
                factor: 'airResistanceCoefficient',
                scalingType: ScalingType.INVERSE,
                baseValue: 0.035,
                scalingFactor: 0.8,
                minValue: 0.005,
                maxValue: 0.08,
            },
            {
                factor: 'randomFactor',
                scalingType: ScalingType.PROPORTIONAL,
                baseValue: 0.18,
                scalingFactor: 1.3,
                minValue: 0.08,
                maxValue: 0.3,
            },
        ],
    },

    expert: {
        name: 'Expert',
        description: 'Very challenging with minimal assistance',
        difficultyMultiplier: 1.8,
        configurations: [
            {
                factor: 'nudgeStrength',
                scalingType: ScalingType.POWER,
                baseValue: 1.8,
                scalingFactor: 1.6,
                exponent: 1.6,
                minValue: 0.6,
                maxValue: 5.0,
            },
            {
                factor: 'airResistanceCoefficient',
                scalingType: ScalingType.INVERSE,
                baseValue: 0.025,
                scalingFactor: 0.6,
                minValue: 0.003,
                maxValue: 0.06,
            },
            {
                factor: 'randomFactor',
                scalingType: ScalingType.PROPORTIONAL,
                baseValue: 0.25,
                scalingFactor: 1.5,
                minValue: 0.1,
                maxValue: 0.4,
            },
        ],
    },
};

/**
 * Performance-based scaling configurations
 */
export const PERFORMANCE_SCALING_PRESETS = {
    highPerformance: {
        name: 'High Performance',
        description: 'Optimized for high-end devices with minimal performance constraints',
        targetFPS: 60,
        configurations: [
            {
                factor: 'collisionCooldown',
                scalingType: ScalingType.INVERSE,
                baseValue: 70,
                scalingFactor: 0.9,
                minValue: 40,
                maxValue: 130,
            },
            {
                factor: 'randomFactor',
                scalingType: ScalingType.PROPORTIONAL,
                baseValue: 0.15,
                scalingFactor: 1.1,
                minValue: 0.05,
                maxValue: 0.25,
            },
        ],
    },

    mediumPerformance: {
        name: 'Medium Performance',
        description: 'Balanced performance for mid-range devices',
        targetFPS: 45,
        configurations: [
            {
                factor: 'collisionCooldown',
                scalingType: ScalingType.INVERSE,
                baseValue: 85,
                scalingFactor: 1.0,
                minValue: 50,
                maxValue: 150,
            },
            {
                factor: 'randomFactor',
                scalingType: ScalingType.PROPORTIONAL,
                baseValue: 0.12,
                scalingFactor: 1.0,
                minValue: 0.05,
                maxValue: 0.2,
            },
        ],
    },

    lowPerformance: {
        name: 'Low Performance',
        description: 'Optimized for low-end devices with performance constraints',
        targetFPS: 30,
        configurations: [
            {
                factor: 'collisionCooldown',
                scalingType: ScalingType.INVERSE,
                baseValue: 100,
                scalingFactor: 1.1,
                minValue: 60,
                maxValue: 180,
            },
            {
                factor: 'randomFactor',
                scalingType: ScalingType.PROPORTIONAL,
                baseValue: 0.08,
                scalingFactor: 0.9,
                minValue: 0.03,
                maxValue: 0.15,
            },
        ],
    },
};

/**
 * Get scaling preset by category and name
 */
export function getScalingPreset(
    category: 'gameMode' | 'device' | 'difficulty' | 'performance',
    name: string
): { name: string; description: string; configurations: ScalingConfiguration[] } | null {
    let presets: any;

    switch (category) {
        case 'gameMode':
            presets = GAME_MODE_SCALING_PRESETS;
            break;
        case 'device':
            presets = DEVICE_SCALING_PRESETS;
            break;
        case 'difficulty':
            presets = DIFFICULTY_SCALING_PRESETS;
            break;
        case 'performance':
            presets = PERFORMANCE_SCALING_PRESETS;
            break;
        default:
            return null;
    }

    return presets[name] || null;
}

/**
 * List all available scaling presets
 */
export function listScalingPresets(): {
    gameMode: string[];
    device: string[];
    difficulty: string[];
    performance: string[];
} {
    return {
        gameMode: Object.keys(GAME_MODE_SCALING_PRESETS),
        device: Object.keys(DEVICE_SCALING_PRESETS),
        difficulty: Object.keys(DIFFICULTY_SCALING_PRESETS),
        performance: Object.keys(PERFORMANCE_SCALING_PRESETS),
    };
}
