/**
 * Factor Relationships Module
 * Implements mathematical relationships between physics factors
 * as described in the Plinko Physics Factors Relationship Documentation
 */

/**
 * Collision Force Calculation
 * Formula: F = (mass × velocityChange) / time
 */
export function calculateCollisionForce(mass: number, velocityChange: number, collisionTime: number): number {
    return (mass * velocityChange) / collisionTime;
}

/**
 * Air Resistance Force
 * Formula: F_air = coefficient × velocity²
 */
export function calculateAirResistanceForce(coefficient: number, velocity: number): number {
    return coefficient * Math.pow(velocity, 2);
}

/**
 * Terminal Velocity Calculation
 * Formula: v_terminal = √((mass × gravity) / airResistanceCoefficient)
 */
export function calculateTerminalVelocity(mass: number, gravity: number, airResistanceCoefficient: number): number {
    return Math.sqrt((mass * gravity) / airResistanceCoefficient);
}

/**
 * Bounce Height Calculation
 * Formula: h = (velocity² × restitution²) / (2 × gravity)
 */
export function calculateBounceHeight(velocity: number, restitution: number, gravity: number): number {
    return (Math.pow(velocity, 2) * Math.pow(restitution, 2)) / (2 * gravity);
}

/**
 * Collision Area Calculation
 * Formula: A = π × radius²
 */
export function calculateCollisionArea(radius: number): number {
    return Math.PI * Math.pow(radius, 2);
}

/**
 * Collision Probability
 * Formula: P = (ballRadius + pegRadius) / pegSpacing
 */
export function calculateCollisionProbability(ballRadius: number, pegRadius: number, pegSpacing: number): number {
    return (ballRadius + pegRadius) / pegSpacing;
}

/**
 * Momentum Calculation
 * Formula: p = mass × velocity
 */
export function calculateMomentum(mass: number, velocity: number): number {
    return mass * velocity;
}

/**
 * Energy Loss Calculation
 * Formula: ΔE = 0.5 × mass × (initialVelocity² - finalVelocity²)
 */
export function calculateEnergyLoss(mass: number, initialVelocity: number, finalVelocity: number): number {
    return 0.5 * mass * (Math.pow(initialVelocity, 2) - Math.pow(finalVelocity, 2));
}

/**
 * Total Velocity Magnitude
 * Formula: v_total = √(v_x² + v_y²)
 */
export function calculateTotalVelocity(velocityX: number, velocityY: number): number {
    return Math.sqrt(Math.pow(velocityX, 2) + Math.pow(velocityY, 2));
}

/**
 * Collision Energy
 * Formula: E = 0.5 × mass × velocity² + mass × gravity × height
 */
export function calculateCollisionEnergy(mass: number, velocity: number, gravity: number, height: number): number {
    return 0.5 * mass * Math.pow(velocity, 2) + mass * gravity * height;
}

/**
 * Control Responsiveness
 * Formula: R = 1 / (1 + airResistanceCoefficient × velocity)
 */
export function calculateControlResponsiveness(airResistanceCoefficient: number, velocity: number): number {
    return 1 / (1 + airResistanceCoefficient * velocity);
}

/**
 * Effective Nudge Strength
 * Formula: F_effective = nudgeStrength × controlResponsiveness
 */
export function calculateEffectiveNudge(nudgeStrength: number, controlResponsiveness: number): number {
    return nudgeStrength * controlResponsiveness;
}

/**
 * Path Control Effectiveness
 * Formula: E = ballDiameter / pegSpacing
 */
export function calculatePathControlEffectiveness(ballDiameter: number, pegSpacing: number): number {
    return ballDiameter / pegSpacing;
}

/**
 * Time Between Pegs
 * Formula: t = pegSpacing / velocityY
 */
export function calculateTimeBetweenPegs(pegSpacing: number, velocityY: number): number {
    return pegSpacing / velocityY;
}

/**
 * Path Control Window
 * Formula: W = timeBetweenPegs × nudgeEffectiveness
 */
export function calculatePathControlWindow(timeBetweenPegs: number, nudgeEffectiveness: number): number {
    return timeBetweenPegs * nudgeEffectiveness;
}

/**
 * Path Stability
 * Formula: S = 1 / (1 + bounceBehavior)
 */
export function calculatePathStability(bounceBehavior: number): number {
    return 1 / (1 + bounceBehavior);
}

/**
 * Falling Speed
 * Formula: v = √(2 × gravity × height)
 */
export function calculateFallingSpeed(gravity: number, height: number): number {
    return Math.sqrt(2 * gravity * height);
}

/**
 * Net Acceleration
 * Formula: a = gravity - (airResistanceForce / mass)
 */
export function calculateNetAcceleration(gravity: number, airResistanceForce: number, mass: number): number {
    return gravity - (airResistanceForce / mass);
}

/**
 * Direction Change (Angular)
 * Formula: Δθ = atan2(finalVy, finalVx) - atan2(initialVy, initialVx)
 */
export function calculateDirectionChange(
    initialVelocityX: number,
    initialVelocityY: number,
    finalVelocityX: number,
    finalVelocityY: number
): number {
    const initialAngle = Math.atan2(initialVelocityY, initialVelocityX);
    const finalAngle = Math.atan2(finalVelocityY, finalVelocityX);
    return finalAngle - initialAngle;
}

/**
 * Acceleration from Nudge
 * Formula: a = force / mass
 */
export function calculateAccelerationFromNudge(force: number, mass: number): number {
    return force / mass;
}

/**
 * Velocity Change from Force
 * Formula: Δv = (force × deltaTime) / mass
 */
export function calculateVelocityChangeFromForce(force: number, deltaTime: number, mass: number): number {
    return (force * deltaTime) / mass;
}

/**
 * Path Unpredictability
 * Formula: U = bounceHeight / pegSpacing
 */
export function calculatePathUnpredictability(bounceHeight: number, pegSpacing: number): number {
    return bounceHeight / pegSpacing;
}

/**
 * Force Per Unit Area
 * Formula: P = collisionForce / collisionArea
 */
export function calculateForcePerUnitArea(collisionForce: number, collisionArea: number): number {
    return collisionForce / collisionArea;
}

/**
 * Effective Cooldown
 * Formula: t_effective = cooldownPeriod / ballSpeed
 */
export function calculateEffectiveCooldown(cooldownPeriod: number, ballSpeed: number): number {
    return cooldownPeriod / ballSpeed;
}

/**
 * Sliding Resistance
 * Formula: R = frictionForce × velocity
 */
export function calculateSlidingResistance(frictionForce: number, velocity: number): number {
    return frictionForce * velocity;
}

/**
 * Friction Force
 * Formula: F = friction × normalForce
 */
export function calculateFrictionForce(friction: number, normalForce: number): number {
    return friction * normalForce;
}

/**
 * Energy Retained
 * Formula: E_retained = restitution² × initialEnergy
 */
export function calculateEnergyRetained(restitution: number, initialEnergy: number): number {
    return Math.pow(restitution, 2) * initialEnergy;
}

/**
 * Path Control Accuracy
 * Formula: A = |velocityX| / maxVelocityX
 */
export function calculatePathControlAccuracy(velocityX: number, maxVelocityX: number): number {
    return Math.abs(velocityX) / maxVelocityX;
}
