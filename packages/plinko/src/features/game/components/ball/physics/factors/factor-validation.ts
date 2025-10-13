/**
 * Factor Validation Module
 * Validates physics factors against defined ranges and constraints
 * Ensures physics stability and prevents invalid configurations
 */

import { PhysicsFactors, PHYSICS_FACTOR_RANGES } from './core-factors';

/**
 * Validation result interface
 */
export interface ValidationResult {
    isValid: boolean;
    errors: string[];
    warnings: string[];
}

/**
 * Validate a single physics factor
 */
export function validatePhysicsFactor(
    factorName: keyof PhysicsFactors,
    value: number
): { isValid: boolean; error?: string } {
    const range = PHYSICS_FACTOR_RANGES[factorName];

    if (range.min !== undefined && value < range.min) {
        return {
            isValid: false,
            error: `${factorName} must be >= ${range.min}, got ${value}`
        };
    }

    if (range.max !== undefined && value > range.max) {
        return {
            isValid: false,
            error: `${factorName} must be <= ${range.max}, got ${value}`
        };
    }

    return { isValid: true };
}

/**
 * Validate all physics factors
 */
export function validatePhysicsFactors(factors: Partial<PhysicsFactors>): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate individual factors
    validateIndividualFactors(factors, errors);

    // Perform cross-factor validations
    performCrossFactorValidations(factors, warnings);

    return {
        isValid: errors.length === 0,
        errors,
        warnings
    };
}

/**
 * Validate individual physics factors
 */
function validateIndividualFactors(factors: Partial<PhysicsFactors>, errors: string[]): void {
    Object.entries(factors).forEach(([key, value]) => {
        const factorName = key as keyof PhysicsFactors;
        const validation = validatePhysicsFactor(factorName, value);

        if (!validation.isValid && validation.error) {
            errors.push(validation.error);
        }
    });
}

/**
 * Perform cross-factor validations
 */
function performCrossFactorValidations(factors: Partial<PhysicsFactors>, warnings: string[]): void {
    validateCollisionProbability(factors, warnings);
    validateGravityAirResistanceBalance(factors, warnings);
    validateBallMassSizeConsistency(factors, warnings);
    validateFrictionRestitutionCompatibility(factors, warnings);
    validateCollisionCooldown(factors, warnings);
}

/**
 * Validate collision probability
 */
function validateCollisionProbability(factors: Partial<PhysicsFactors>, warnings: string[]): void {
    if (factors.ballSize === undefined || factors.pegSpacing === undefined) {
        return;
    }

    const collisionProbability = (factors.ballSize + (factors.pegSize || 5)) / factors.pegSpacing;

    if (collisionProbability > 1.5) {
        warnings.push('High collision probability may cause physics instability');
    } else if (collisionProbability < 0.1) {
        warnings.push('Low collision probability may result in balls slipping through pegs');
    }
}

/**
 * Validate gravity and air resistance balance
 */
function validateGravityAirResistanceBalance(factors: Partial<PhysicsFactors>, warnings: string[]): void {
    if (factors.gravity === undefined || factors.airResistanceCoefficient === undefined) {
        return;
    }

    const ratio = factors.airResistanceCoefficient / factors.gravity;

    if (ratio > 0.1) {
        warnings.push('High air resistance relative to gravity may slow gameplay significantly');
    } else if (ratio < 0.005) {
        warnings.push('Low air resistance relative to gravity may cause unrealistic ball trajectories');
    }
}

/**
 * Validate ball mass and size consistency
 */
function validateBallMassSizeConsistency(factors: Partial<PhysicsFactors>, warnings: string[]): void {
    if (factors.ballMass === undefined || factors.ballSize === undefined) {
        return;
    }

    const expectedMass = 1000 * (4 / 3) * Math.PI * Math.pow(factors.ballSize / 100, 3);
    const massRatio = factors.ballMass / expectedMass;

    if (massRatio > 2 || massRatio < 0.5) {
        warnings.push('Ball mass may not be consistent with ball size for realistic physics');
    }
}

/**
 * Validate friction and restitution compatibility
 */
function validateFrictionRestitutionCompatibility(factors: Partial<PhysicsFactors>, warnings: string[]): void {
    if (factors.friction === undefined || factors.restitution === undefined) {
        return;
    }

    if (factors.friction > 0.7 && factors.restitution > 0.8) {
        warnings.push('High friction with high restitution may cause unstable bouncing behavior');
    }
}

/**
 * Validate collision cooldown
 */
function validateCollisionCooldown(factors: Partial<PhysicsFactors>, warnings: string[]): void {
    if (factors.collisionCooldown === undefined || factors.velocityY === undefined) {
        return;
    }

    const timeBetweenPegs = 60 / factors.velocityY;

    if (factors.collisionCooldown > timeBetweenPegs * 2) {
        warnings.push('Collision cooldown may be too long for current falling speed');
    }
}

/**
 * Clamp a physics factor to its valid range
 */
export function clampPhysicsFactor(factorName: keyof PhysicsFactors, value: number): number {
    const range = PHYSICS_FACTOR_RANGES[factorName];
    return Math.max(range.min, Math.min(range.max, value));
}

/**
 * Sanitize physics factors by clamping all values to valid ranges
 */
export function sanitizePhysicsFactors(factors: PhysicsFactors): PhysicsFactors {
    const sanitized: PhysicsFactors = { ...factors };

    Object.keys(factors).forEach(key => {
        const factorName = key as keyof PhysicsFactors;
        sanitized[factorName] = clampPhysicsFactor(factorName, factors[factorName]);
    });

    return sanitized;
}

/**
 * Check if physics factors are stable for gameplay
 */
export function checkPhysicsStability(factors: PhysicsFactors): {
    isStable: boolean;
    stabilityScore: number;
    issues: string[];
} {
    const issues: string[] = [];
    let stabilityScore = 100;

    // Collision stability
    const collisionProbability = (factors.ballSize + factors.pegSize) / factors.pegSpacing;
    if (collisionProbability > 1.2) {
        issues.push('High collision probability may cause peg sticking');
        stabilityScore -= 20;
    }

    // Terminal velocity check
    const terminalVelocity = Math.sqrt((factors.ballMass * factors.gravity) / factors.airResistanceCoefficient);
    if (terminalVelocity > factors.velocityY * 2) {
        issues.push('Terminal velocity too high relative to base velocity');
        stabilityScore -= 15;
    }

    // Bounce behavior
    const bounceHeight = (Math.pow(factors.velocityY, 2) * Math.pow(factors.restitution, 2)) / (2 * factors.gravity);
    if (bounceHeight > factors.pegSpacing) {
        issues.push('High bounce height may cause unrealistic ball paths');
        stabilityScore -= 10;
    }

    // Momentum preservation
    if (factors.momentumFactor < 0.85) {
        issues.push('Low momentum preservation may cause erratic ball movement');
        stabilityScore -= 15;
    }

    // Randomness level
    if (factors.randomFactor > 0.15) {
        issues.push('High randomness may reduce path predictability');
        stabilityScore -= 10;
    }

    // Friction balance
    if (factors.friction > 0.6 && factors.airResistanceCoefficient < 0.03) {
        issues.push('High friction with low air resistance may cause sticking');
        stabilityScore -= 15;
    }

    return {
        isStable: stabilityScore >= 70,
        stabilityScore: Math.max(0, stabilityScore),
        issues
    };
}
