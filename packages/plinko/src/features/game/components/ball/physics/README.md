# Plinko Physics System

A comprehensive, modular physics system for the Plinko game, restructured according to the **Plinko Physics Factors Relationship Documentation**.

## Architecture Overview

The physics system is organized into modular components that reflect the physics factor relationships documented in the specification:

```
physics/
├── factors/          # Core physics factors and relationships
├── ball/            # Ball properties and physics calculations
├── collisions/      # Collision detection and response
├── environment/     # Gravity and air resistance systems
├── scaling/         # Physics scaling and adaptation
├── performance/     # Performance monitoring and optimization
└── [legacy files]   # Backward compatibility
```

## Core Concepts

### Physics Factors

All physics behavior is governed by **interconnected factors** that work together:

-   **Primary Factors**: Ball size, mass, gravity, air resistance, friction, restitution, nudge strength, velocities, angular velocity
-   **Secondary Factors**: Peg size, spacing, collision cooldown, momentum factor, randomness, speed factor

### Factor Interdependencies

The system recognizes that changing one factor affects others:

-   **Ball Size** → Mass → Momentum → Collision Response
-   **Speed** → Air Resistance → Terminal Velocity → Bounce Height
-   **Gravity** → Falling Speed → Collision Timing → Path Control

## Module Structure

### 🔧 Factors Module (`factors/`)

Core physics factor definitions and mathematical relationships.

```typescript
import { PhysicsFactors, calculateCollisionForce, validatePhysicsFactors } from "./factors";

// Define physics configuration
const physicsConfig: PhysicsFactors = {
    ballSize: 12,
    gravity: 1.0,
    airResistanceCoefficient: 0.05,
    // ... other factors
};

// Calculate relationships
const collisionForce = calculateCollisionForce(mass, velocityChange, time);
```

### ⚽ Ball Module (`ball/`)

Ball-specific properties, physics calculations, and scaling.

```typescript
import { calculateBallProperties, calculateDynamicBallSize } from "./ball";

// Get ball physics for current game state
const ballRadius = calculateDynamicBallSize(rows, canvasScaleFactor);
const ballPhysics = calculateBallProperties(ballRadius);
```

### 💥 Collisions Module (`collisions/`)

Collision detection, response, and cooldown management.

```typescript
import { detectCirclePegCollision, calculateCollisionResponse } from "./collisions";

// Handle collisions
const collision = detectCirclePegCollision(ballPos, ballRadius, pegPos, pegRadius);
if (collision.hasCollision) {
    const response = calculateCollisionResponse(ballVelocity, ballMass, collision.normal);
}
```

### 🌍 Environment Module (`environment/`)

Gravity and air resistance systems with balancing.

```typescript
import { calculateOptimalGravity, AdaptiveGravitySystem } from "./environment";

// Adaptive gravity based on gameplay
const gravitySystem = new AdaptiveGravitySystem(baseGravity);
gravitySystem.adapt(metrics);
const currentGravity = gravitySystem.getCurrentGravity();
```

### 📏 Scaling Module (`scaling/`)

Coordinated physics scaling for different conditions.

```typescript
import { PhysicsScaler, GAME_MODE_SCALING_PRESETS } from "./scaling";

// Apply game mode scaling
const scaler = new PhysicsScaler(baseGravity);
scaler.setGravity(currentGravity);
const scaledFactors = scaler.getScaledFactors();
```

### 📊 Performance Module (`performance/`)

Performance monitoring, profiling, and optimization.

```typescript
import { PerformanceMonitor, OptimizationManager } from "./performance";

// Monitor and optimize performance
const monitor = new PerformanceMonitor();
const optimizer = new OptimizationManager();

monitor.startPhysicsMeasurement();
// ... physics calculations ...
monitor.endPhysicsMeasurement(collisionCount, activeBodies);

const result = optimizer.optimize(monitor, currentFactors);
if (result.optimized) {
    // Apply optimized factors
    currentFactors = result.newFactors;
}
```

## Usage Examples

### Basic Physics Setup

```typescript
import { PhysicsFactors, PhysicsScaler, calculateBallProperties } from "./physics";

// Configure physics for game mode
const baseFactors: PhysicsFactors = {
    ballSize: 12,
    gravity: 1.0,
    airResistanceCoefficient: 0.05,
    friction: 0.4,
    restitution: 0.4,
    nudgeStrength: 2.8,
    // ... other factors
};

// Apply scaling
const scaler = new PhysicsScaler(1.0);
scaler.setGravity(1.8); // Higher gravity for faster gameplay
const scaledFactors = scaler.getScaledFactors();

// Calculate ball properties
const ballRadius = calculateDynamicBallSize(rows, canvasScaleFactor);
const ballPhysics = calculateBallProperties(ballRadius);
```

### Performance Monitoring

```typescript
import { PerformanceMonitor, createPerformanceProfiler } from "./physics";

const monitor = new PerformanceMonitor();
const { profiler, analyzer } = createPerformanceProfiler();

// Start profiling session
const sessionId = profiler.startSession(scaledFactors, { gameMode: "classic" });

// Monitor performance
monitor.startPhysicsMeasurement();
// ... run physics ...
monitor.endPhysicsMeasurement(collisionCount, activeBodies);

// Analyze results
const analysis = profiler.analyzeSession(sessionId);
console.log("Performance Score:", analysis.metrics.fps.average);
```

### Adaptive Scaling

```typescript
import { AdaptiveScalingSystem } from "./scaling";

const adaptiveSystem = new AdaptiveScalingSystem(baseGravity);

// Monitor player performance and adapt
const adaptationResult = adaptiveSystem.adapt({
    averageAccuracy: 0.75,
    averageReactionTime: 0.8,
    collisionFrequency: 25,
    pathPredictability: 0.8,
    playerFrustration: 0.2,
    sessionDuration: 300, // 5 minutes
});

if (adaptationResult.adapted) {
    console.log("Applied adaptation:", adaptationResult.strategyApplied);
    const adaptedFactors = adaptiveSystem.getScaledFactors();
    // Apply adapted physics
}
```

## Physics Factor Relationships

### Primary Relationships Matrix

| Factor             | Ball Size | Gravity | Air Resistance | Friction | Restitution | Nudge Strength |
| ------------------ | --------- | ------- | -------------- | -------- | ----------- | -------------- |
| **Ball Size**      | 1.0       | 0.0     | 0.3            | 0.2      | 0.1         | 0.4            |
| **Gravity**        | 0.0       | 1.0     | -0.5           | 0.0      | 0.0         | 0.6            |
| **Air Resistance** | 0.3       | -0.5    | 1.0            | 0.1      | 0.0         | -0.3           |
| **Friction**       | 0.2       | 0.0     | 0.1            | 1.0      | -0.2        | 0.1            |
| **Restitution**    | 0.1       | 0.0     | 0.0            | -0.2     | 1.0         | 0.0            |
| **Nudge Strength** | 0.4       | 0.6     | -0.3           | 0.1      | 0.0         | 1.0            |

_Values represent correlation strength (-1.0 to 1.0)_

### Key Insights

1. **Ball size is the most influential factor** - affects collision probability, mass, momentum, and path control
2. **Gravity and air resistance are inversely related** - higher gravity requires lower air resistance for optimal control
3. **Nudge strength must be balanced with ball mass** - larger balls need stronger nudges for the same effect
4. **Collision cooldown prevents physics instability** - crucial for preventing oscillating behavior
5. **All factors are interconnected** - changing one factor affects multiple others through complex relationships

## Best Practices

### Development

-   **Start with ball size** - determine optimal ball size first, then balance other factors around it
-   **Use the scaling system** - apply coordinated scaling rather than changing individual factors
-   **Monitor performance** - use the performance monitoring tools to identify bottlenecks
-   **Test thoroughly** - verify physics behavior across different device capabilities

### Performance

-   **Enable adaptive scaling** for dynamic performance adjustment
-   **Use performance presets** for different device capabilities
-   **Monitor collision frequency** and adjust cooldown accordingly
-   **Profile regularly** to identify optimization opportunities

### Physics Tuning

-   **Balance gravity and air resistance** together, not independently
-   **Consider environmental factors** like temperature and altitude for realistic physics
-   **Use validation functions** to ensure factor combinations are stable
-   **Test edge cases** like extreme factor values

## Migration Guide

### From Legacy Code

The new modular structure maintains backward compatibility. Legacy imports continue to work:

```typescript
// Legacy (still works)
import { physicsConfig } from "./physics";

// New modular approach
import { PhysicsFactors, DEFAULT_PHYSICS_FACTORS } from "./factors";
import { PhysicsScaler } from "./scaling";
```

### Gradual Migration

1. Start using new modules for new features
2. Gradually migrate existing code to use modular imports
3. Use performance monitoring to ensure no regressions
4. Remove legacy code once fully migrated

## Contributing

When adding new physics features:

1. **Identify factor relationships** - how does the new feature interact with existing factors?
2. **Add to appropriate module** - place code in the most relevant module
3. **Include validation** - ensure factor combinations remain stable
4. **Add performance monitoring** - track impact on performance metrics
5. **Update documentation** - reflect changes in the physics relationships

## References

-   [Plinko Physics Factors Relationship Documentation](../plinko-physics-factors-relationship-documentation.md)
-   [Physics Scaling System](./scaling/README.md)
-   [Performance Optimization Guide](./performance/README.md)
