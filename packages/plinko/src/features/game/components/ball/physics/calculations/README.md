# Ball Game Calculation System

This system provides comprehensive pre-calculation of all physics, trajectory, and outcome data for Plinko ball games before the ball starts falling. It ensures everything is calculated upfront for deterministic gameplay.

## Overview

The `BallGameCalculation` system calculates:
- Complete ball trajectory with position/velocity over time
- All peg collision events with physics responses
- Final slot landing prediction
- Physics stability metrics
- Alternative path possibilities
- Performance and memory usage tracking

## Quick Start

```typescript
import {
    createCalculationFromServiceResponse,
    createCalculationFromLogData,
    validateCalculation,
    exportCalculationData
} from './service-integration';

// From service response
const serviceResponse = {
    path: [0, 1, 0, 1, 0, 1, 0, 1],
    finalSlot: 4,
    multiplier: 2.0,
    betValue: 100,
    serverSeed: 'server_seed_123',
    clientSeed: 'client_seed_456',
    roundId: 'round_12345',
    gameMode: 1,
    numberOfRows: 8
};

const calculation = createCalculationFromServiceResponse(serviceResponse);

// Validate the calculation
const validation = validateCalculation(calculation);
if (!validation.isValid) {
    console.error('Calculation errors:', validation.errors);
}

// Use the calculation data
console.log('Predicted landing slot:', calculation.expectedFinalSlot);
console.log('Win amount:', calculation.winAmount);
console.log('Path confidence:', calculation.predictionConfidence);
console.log('Total collisions:', calculation.collisionStats.totalCollisions);

// Export for debugging
console.log(exportCalculationData(calculation));
```

## Key Components

### BallGameCalculation Interface

Contains all pre-calculated data:

```typescript
interface BallGameCalculation {
    // Identifiers
    id: string;
    roundId: string;
    createdAt: number;

    // Service data
    serviceResult: ServiceResult;

    // Physics configuration
    physicsFactors: PhysicsFactors;
    environmentalFactors: EnvironmentalFactors;
    ballProperties: BallProperties;

    // Board setup
    pegConfiguration: PegConfiguration;
    boardConfiguration: BoardConfiguration;

    // Pre-calculated trajectory
    trajectory: BallTrajectory;

    // Collision analysis
    collisions: CollisionEvent[];
    collisionStats: CollisionStats;

    // Path analysis
    pathDecisions: number[];
    pathConfidence: number[];
    alternativePaths: AlternativePath[];

    // Outcome prediction
    expectedFinalSlot: number;
    predictedLandingPosition: Position;
    predictionConfidence: number;
    winAmount: number;

    // Physics validation
    stabilityMetrics: StabilityMetrics;

    // Performance tracking
    performance: PerformanceMetrics;
}
```

### Service Integration

The system integrates with backend services through:

- **parseServiceResponse()**: Parse raw service data into structured format
- **createCalculationFromServiceResponse()**: Create full calculation from service response
- **createCalculationFromLogData()**: Create calculation from log files (for debugging)

### Physics Factors

All physics are configurable and validated:

```typescript
interface PhysicsFactors {
    ballSize: number;           // Ball radius (pixels)
    ballMass: number;           // Ball mass (kg)
    gravity: number;            // Gravity acceleration (m/s²)
    airResistanceCoefficient: number;  // Air resistance (kg/m)
    friction: number;           // Surface friction
    restitution: number;        // Bounce energy retention
    nudgeStrength: number;      // Collision nudge force (N)
    velocityX: number;          // Initial horizontal velocity (m/s)
    velocityY: number;          // Initial vertical velocity (m/s)
    angularVelocity: number;    // Ball rotation (rad/s)
    // ... secondary factors
}
```

## Usage Examples

### Basic Calculation

```typescript
import { calculateBallGame, createDefaultBoardConfig } from './ball-game-calculation';

const serviceResult = {
    path: [1, 0, 1, 0, 1, 0, 1, 0], // Right-heavy path
    finalSlot: 6,
    multiplier: 15.0,
    betValue: 50,
    serverSeed: 'seed123',
    clientSeed: 'client456',
    roundId: 'round789'
};

const boardConfig = createDefaultBoardConfig(9); // 9 slots
const calculation = calculateBallGame(serviceResult, boardConfig);

// Access trajectory data
const trajectory = calculation.trajectory;
console.log(`Ball will travel ${trajectory.totalDistance.toFixed(1)} pixels`);
console.log(`Journey takes ${trajectory.totalTime.toFixed(2)} seconds`);

// Check collision analysis
console.log(`${calculation.collisions.length} collisions predicted`);
console.log(`Energy loss: ${(calculation.collisionStats.energyLoss * 100).toFixed(1)}%`);
```

### Advanced Physics Configuration

```typescript
import { DEFAULT_CALCULATION_FACTORS } from './ball-game-calculation';

const customPhysics = {
    ...DEFAULT_CALCULATION_FACTORS,
    gravity: 1.5,                    // Higher gravity
    airResistanceCoefficient: 0.1,   // More air resistance
    ballMass: 0.002,                 // Heavier ball
    randomFactor: 0.05               // More predictable
};

const calculation = calculateBallGame(serviceResult, boardConfig, customPhysics);

// Check stability metrics
const stability = calculation.stabilityMetrics;
console.log(`Terminal velocity ratio: ${stability.terminalVelocityRatio.toFixed(3)}`);
console.log(`Bounce stability: ${stability.bounceStability.toFixed(3)}`);
```

### Log File Analysis

```typescript
// From your log file
const logData = `path: [0,1,0,1,0,1,0,1], finalSlot: 4, multiplier: 2.0`;

const calculation = createCalculationFromLogData(logData);

if (calculation) {
    console.log('Successfully parsed log data');
    console.log('Predicted outcome:', exportCalculationData(calculation));
} else {
    console.log('Failed to parse log data');
}
```

### Validation and Error Handling

```typescript
const calculation = calculateBallGame(serviceResult, boardConfig);
const validation = validateCalculation(calculation);

if (!validation.isValid) {
    console.error('Calculation has errors:', validation.errors);
}

if (validation.warnings.length > 0) {
    console.warn('Calculation warnings:', validation.warnings);
}

// Check performance
if (calculation.performance.calculationTime > 50) {
    console.warn('Calculation took longer than expected');
}
```

## Benefits

1. **Pre-calculated Everything**: No physics calculations during gameplay
2. **Deterministic Outcomes**: Results are predictable and provably fair
3. **Performance Optimized**: Heavy calculations done upfront
4. **Comprehensive Analysis**: Full trajectory and collision data available
5. **Debugging Support**: Detailed logging and export capabilities
6. **Validation**: Built-in consistency checks and error detection

## Integration with Existing Code

The system integrates seamlessly with your existing ball spawner:

```typescript
// In your ball spawner hook
import { createCalculationFromServiceResponse } from '../physics/calculations/service-integration';

const spawnBallWithPath = (betValue: number, path: number[], finalSlot: number, multiplier: number) => {
    // Create comprehensive calculation
    const serviceData = { path, finalSlot, multiplier, betValue, /* ... */ };
    const calculation = createCalculationFromServiceResponse(serviceData);

    // Use calculation data for ball properties
    const ball = createBall(betValue, undefined, calculation.ballProperties);

    // Ball extension now includes calculation reference
    ballExtension.calculation = calculation;
    ballExtension.servicePath = path;
    // ... rest of spawning logic
};
```

## Testing

Run the comprehensive test suite:

```bash
npm test -- ball-game-calculation.test.ts
```

Tests cover:
- Basic calculation functionality
- Physics factor integration
- Service response parsing
- Collision prediction accuracy
- Performance benchmarks
- Edge case handling

## Performance Characteristics

- **Calculation Time**: < 50ms for typical games
- **Memory Usage**: < 100KB per calculation
- **Trajectory Points**: 100-500 points depending on complexity
- **Collision Events**: 0-20 events per game
- **Path Alternatives**: 3-5 alternative paths analyzed

## Error Handling

The system includes comprehensive error handling:
- Invalid service data detection
- Physics factor validation
- Trajectory calculation bounds checking
- Memory usage monitoring
- Performance timing validation

All errors are logged with detailed context for debugging.

## 🎯 Enhanced Realistic Physics

The system now provides **ultra-realistic Plinko ball physics** by using pre-calculated factors:

### Pre-Calculated Ball Properties
- **Mass & Density**: Exact physical properties based on row count and game mode
- **Friction & Restitution**: Bounce and surface interaction coefficients
- **Air Resistance**: Drag forces calculated for realistic deceleration
- **Initial Velocity**: Precise starting motion vectors

### Trajectory-Guided Movement
- **Position Correction**: Ball follows pre-calculated trajectory path
- **Velocity Matching**: Velocity adjustments to match predicted motion
- **Path Guidance**: Deterministic nudges based on service path
- **Stability Control**: Physics stability factors prevent erratic behavior

### Enhanced Collision System
- **Pre-Calculated Nudge Strength**: Uses actual physics factors instead of generic scaling
- **Trajectory-Based Corrections**: Position and velocity corrections from trajectory data
- **Natural Physics Blending**: 70% natural physics + 30% deterministic guidance
- **Terminal Velocity Control**: Prevents unrealistic speeds

### Real Plinko Experience
```typescript
// Ball created with PRE-CALCULATED physics properties
const ball = Bodies.circle(x, y, radius, {
    restitution: calculation.physicsFactors.restitution,    // Pre-calculated bounce
    friction: calculation.physicsFactors.friction,          // Pre-calculated surface grip
    frictionAir: calculation.physicsFactors.airResistance,  // Pre-calculated drag
    density: calculation.ballProperties.mass / area         // Pre-calculated mass
});

// Initial velocity from pre-calculated factors
Body.setVelocity(ball, {
    x: calculation.physicsFactors.velocityX,  // Precise horizontal start
    y: calculation.physicsFactors.velocityY   // Controlled vertical drop
});

// Ball extension includes full calculation data
ballExtension.calculationData = {
    trajectory: calculation.trajectory,        // 500+ position points
    collisions: calculation.collisions,        // All predicted impacts
    physicsFactors: calculation.physicsFactors, // Exact physics values
    stabilityMetrics: calculation.stabilityMetrics // Control parameters
};
```
