/**
 * Air Resistance System Module
 * Manages air resistance physics calculations and relationships
 */

import { PhysicsFactors } from '../factors/core-factors';
import { calculateAirResistanceForce, calculateTerminalVelocity, calculateControlResponsiveness } from '../factors/factor-relationships';
import { physicsLogger } from '../performance/physics-logger';

/**
 * Air resistance configuration interface
 */
export interface AirResistanceConfig {
    coefficient: number;
    density: number;
    temperature: number;
    humidity: number;
    altitude: number;
}

/**
 * Default air resistance configuration
 */
export const DEFAULT_AIR_RESISTANCE_CONFIG: AirResistanceConfig = {
    coefficient: 0.47, // Sphere drag coefficient
    density: 1.225,    // Air density at sea level (kg/m³)
    temperature: 20,   // Celsius
    humidity: 50,      // Percent
    altitude: 0,       // Meters above sea level
};

/**
 * Calculate air resistance force with environmental factors
 */
export function calculateAdvancedAirResistance(
    velocity: number,
    ballRadius: number,
    config: Partial<AirResistanceConfig> = {}
): number {
    physicsLogger.debug('Calculating advanced air resistance', {
        component: 'AirResistanceSystem',
        function: 'calculateAdvancedAirResistance',
        metadata: { velocity, ballRadius, config }
    });

    const fullConfig = { ...DEFAULT_AIR_RESISTANCE_CONFIG, ...config };

    // Cross-sectional area
    const area = Math.PI * ballRadius * ballRadius;

    // Dynamic pressure
    const dynamicPressure = 0.5 * fullConfig.density * velocity * velocity;

    // Drag force
    const dragForce = fullConfig.coefficient * dynamicPressure * area;

    physicsLogger.debug('Advanced air resistance calculated', {
        component: 'AirResistanceSystem',
        function: 'calculateAdvancedAirResistance',
        metadata: {
            area: area.toFixed(3),
            dynamicPressure: dynamicPressure.toFixed(3),
            coefficient: fullConfig.coefficient,
            dragForce: dragForce.toFixed(3)
        }
    });

    return dragForce;
}

/**
 * Calculate air density based on environmental conditions
 */
export function calculateAirDensity(
    temperature: number,
    humidity: number,
    altitude: number
): number {
    // Base density at sea level (kg/m³)
    const baseDensity = 1.225;

    // Temperature correction (ideal gas law)
    const temperatureK = temperature + 273.15; // Convert to Kelvin
    const standardTempK = 288.15; // 15°C in Kelvin
    const temperatureCorrection = standardTempK / temperatureK;

    // Humidity correction (simplified)
    const humidityCorrection = 1 - (humidity / 100) * 0.1;

    // Altitude correction (barometric formula approximation)
    const altitudeCorrection = Math.exp(-altitude / 8000);

    return baseDensity * temperatureCorrection * humidityCorrection * altitudeCorrection;
}

/**
 * Calculate air resistance damping factor
 */
export function calculateAirResistanceDamping(
    mass: number,
    airResistanceForce: number,
    deltaTime: number
): number {
    const acceleration = airResistanceForce / mass;

    return Math.max(0.8, 1 - acceleration * deltaTime);
}

/**
 * Simulate ball trajectory with air resistance
 */
export function simulateTrajectoryWithAirResistance(
    initialPosition: { x: number; y: number },
    initialVelocity: { x: number; y: number },
    physicsFactors: PhysicsFactors,
    timeSteps = 100,
    deltaTime = 0.016
): Array<{
    time: number;
    position: { x: number; y: number };
    velocity: { x: number; y: number };
    speed: number;
    airResistanceForce: number;
}> {
    const trajectory: Array<{
        time: number;
        position: { x: number; y: number };
        velocity: { x: number; y: number };
        speed: number;
        airResistanceForce: number;
    }> = [];

    const position = { ...initialPosition };
    const velocity = { ...initialVelocity };
    let time = 0;

    for (let i = 0; i < timeSteps; i++) {
        const speed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);

        // Calculate air resistance
        const airResistanceForce = calculateAirResistanceForce(
            physicsFactors.airResistanceCoefficient,
            speed
        );

        // Apply gravity
        velocity.y += physicsFactors.gravity * deltaTime;

        // Apply air resistance damping
        if (speed > 0.01) { // Only apply if moving
            const dampingFactor = calculateAirResistanceDamping(
                physicsFactors.ballMass,
                airResistanceForce,
                deltaTime
            );

            velocity.x *= dampingFactor;
            velocity.y *= dampingFactor;
        }

        // Update position
        position.x += velocity.x * deltaTime;
        position.y += velocity.y * deltaTime;

        // Record trajectory point
        trajectory.push({
            time,
            position: { ...position },
            velocity: { ...velocity },
            speed,
            airResistanceForce,
        });

        time += deltaTime;

        // Stop if ball has fallen too far
        if (position.y > initialPosition.y + 1000) { break; }
    }

    return trajectory;
}

/**
 * Calculate air resistance balance metrics
 */
export function calculateAirResistanceBalanceMetrics(
    airResistanceCoefficient: number,
    physicsFactors: PhysicsFactors
): {
    terminalVelocityRatio: number;
    controlResponsiveness: number;
    energyDissipationRate: number;
    stability: number;
} {
    const terminalVelocity = calculateTerminalVelocity(
        physicsFactors.ballMass,
        physicsFactors.gravity,
        airResistanceCoefficient
    );

    // Terminal velocity ratio (how quickly balls slow down)
    const terminalVelocityRatio = terminalVelocity / physicsFactors.velocityY;

    // Control responsiveness
    const controlResponsiveness = calculateControlResponsiveness(
        airResistanceCoefficient,
        physicsFactors.velocityY
    );

    // Energy dissipation rate (how quickly energy is lost)
    const energyDissipationRate = airResistanceCoefficient * physicsFactors.velocityY / physicsFactors.ballMass;

    // Stability (avoid extreme air resistance values)
    const stability = airResistanceCoefficient >= 0.01 && airResistanceCoefficient <= 0.2 ? 1 : 0.5;

    return {
        terminalVelocityRatio,
        controlResponsiveness,
        energyDissipationRate,
        stability,
    };
}

/**
 * Adaptive air resistance system
 */
export class AdaptiveAirResistanceSystem {
    private currentCoefficient: number;
    private targetCoefficient: number;
    private readonly adaptationRate: number;

    constructor(initialCoefficient: number, adaptationRate = 0.05) {
        this.currentCoefficient = initialCoefficient;
        this.targetCoefficient = initialCoefficient;
        this.adaptationRate = adaptationRate;
    }

    /**
     * Set target air resistance coefficient
     */
    setTargetCoefficient(coefficient: number): void {
        this.targetCoefficient = Math.max(0.001, Math.min(0.5, coefficient));
    }

    /**
     * Update coefficient towards target
     */
    update(): number {
        const difference = this.targetCoefficient - this.currentCoefficient;
        this.currentCoefficient += difference * this.adaptationRate;

        return this.currentCoefficient;
    }

    /**
     * Get current coefficient
     */
    getCurrentCoefficient(): number {
        return this.currentCoefficient;
    }

    /**
     * Adjust for gameplay balance
     */
    adjustForGameplay(
        currentDifficulty: number,
        targetDifficulty: number
    ): void {
        // Increase air resistance to make game easier (more control)
        // Decrease air resistance to make game harder (less control)
        const difficultyDifference = targetDifficulty - currentDifficulty;

        if (Math.abs(difficultyDifference) > 0.1) {
            const adjustment = difficultyDifference * 0.02;
            this.setTargetCoefficient(this.currentCoefficient + adjustment);
        }
    }
}

/**
 * Calculate wind effects on ball trajectory
 */
export function calculateWindEffects(
    windSpeed: number,
    windDirection: number,
    ballVelocity: { x: number; y: number },
    airResistanceCoefficient: number
): { x: number; y: number } {
    // Relative wind velocity
    const relativeWindX = windSpeed * Math.cos(windDirection) - ballVelocity.x;
    const relativeWindY = windSpeed * Math.sin(windDirection) - ballVelocity.y;

    // Wind force (simplified)
    const windForceMagnitude = airResistanceCoefficient * (relativeWindX * relativeWindX + relativeWindY * relativeWindY);
    const windForceX = windForceMagnitude * Math.sign(relativeWindX) * 0.1;
    const windForceY = windForceMagnitude * Math.sign(relativeWindY) * 0.1;

    return { x: windForceX, y: windForceY };
}

/**
 * Analyze air resistance physics stability
 */
export function analyzeAirResistanceStability(
    airResistanceCoefficient: number,
    physicsFactors: PhysicsFactors,
    timeStep = 0.016
): {
    isStable: boolean;
    dampingRatio: number;
    oscillationFrequency: number;
    settlingTime: number;
} {
    // Simulate damped harmonic motion
    let position = 0;
    let velocity = physicsFactors.velocityY;
    let maxDisplacement = 0;
    let oscillationCount = 0;
    let lastZeroCrossing = 0;

    const simulationSteps = 1000;

    for (let i = 0; i < simulationSteps; i++) {
        // Apply air resistance damping
        const speed = Math.abs(velocity);
        if (speed > 0.01) {
            const dampingFactor = Math.max(0.9, 1 - (airResistanceCoefficient * speed / physicsFactors.ballMass) * timeStep);
            velocity *= dampingFactor;
        }

        position += velocity * timeStep;

        // Track oscillations
        if (position * lastZeroCrossing < 0 && Math.abs(position) > 1) {
            oscillationCount++;
            lastZeroCrossing = position > 0 ? 1 : -1;
        }

        maxDisplacement = Math.max(maxDisplacement, Math.abs(position));

        // Stop if motion is essentially stopped
        if (Math.abs(velocity) < 0.01 && Math.abs(position) < 0.1) { break; }
    }

    // Calculate damping ratio (critical damping approximation)
    const dampingRatio = airResistanceCoefficient / (2 * Math.sqrt(physicsFactors.ballMass));

    // Oscillation frequency (simplified)
    const oscillationFrequency = oscillationCount / (simulationSteps * timeStep);

    // Settling time (time to reduce amplitude to 1% of initial)
    const settlingTime = simulationSteps * timeStep;

    const isStable = dampingRatio >= 0.1 && dampingRatio <= 2.0;

    return {
        isStable,
        dampingRatio,
        oscillationFrequency,
        settlingTime,
    };
}

/**
 * Calculate air resistance compensation for temperature
 */
export function calculateTemperatureCompensation(
    baseCoefficient: number,
    temperature: number,
    referenceTemperature = 20
): number {
    // Air viscosity increases with temperature, affecting drag
    const temperatureRatio = (temperature + 273.15) / (referenceTemperature + 273.15);
    const viscosityCorrection = Math.sqrt(temperatureRatio); // Simplified

    return baseCoefficient * viscosityCorrection;
}

/**
 * Generate air resistance profile for different altitudes
 */
export function generateAltitudeResistanceProfile(
    baseCoefficient: number,
    maxAltitude = 5000,
    steps = 10
): Array<{ altitude: number; coefficient: number; density: number }> {
    const profile: Array<{ altitude: number; coefficient: number; density: number }> = [];

    for (let i = 0; i <= steps; i++) {
        const altitude = (maxAltitude * i) / steps;
        const density = calculateAirDensity(20, 50, altitude);
        const coefficient = baseCoefficient * (1.225 / density); // Adjust for density

        profile.push({
            altitude,
            coefficient,
            density,
        });
    }

    return profile;
}
