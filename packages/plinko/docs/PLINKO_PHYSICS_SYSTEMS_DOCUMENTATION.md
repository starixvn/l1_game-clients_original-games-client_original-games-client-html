# Plinko Physics Systems Documentation

## Overview

This document provides a comprehensive comparison between the **Random System** and **Deterministic System** implemented in the Plinko game. Both systems use the Matter.js physics engine but differ fundamentally in their approach to ball movement and collision handling.

## Table of Contents

1. [System Architecture](#system-architecture)
2. [Random System](#random-system)
3. [Deterministic System](#deterministic-system)
4. [Detailed Comparison](#detailed-comparison)
5. [Physics Configuration](#physics-configuration)
6. [Implementation Details](#implementation-details)
7. [Performance Considerations](#performance-considerations)
8. [Business Logic Impact](#business-logic-impact)

---

## System Architecture

### Core Components

Both systems share the same foundational architecture:

-   **Physics Engine**: Matter.js with custom configuration
-   **Collision Detection**: Event-driven collision handling
-   **Ball Creation**: Dynamic ball spawning with physics properties
-   **Path Tracking**: Ball movement and position logging
-   **Slot Detection**: Multiplier slot collision processing

### Key Differences

| Aspect                 | Random System                  | Deterministic System          |
| ---------------------- | ------------------------------ | ----------------------------- |
| **Ball Control**       | Physics-driven random movement | Service-guided path following |
| **Collision Response** | Natural physics deflections    | Controlled directional nudges |
| **Path Prediction**    | Unpredictable                  | Predefined by service         |
| **Slot Accuracy**      | Random landing                 | Guaranteed correct slot       |
| **Business Logic**     | Fair random outcomes           | Provably fair results         |

---

## Random System

### Philosophy

The Random System prioritizes **natural physics behavior** and **authentic Plinko gameplay**. Balls fall and bounce naturally, creating unpredictable but fair outcomes.

### Key Features

#### 1. Natural Physics Properties

```typescript
// Ball creation with natural physics
const ball = Bodies.circle(ballX, ballRadius, ballRadius, {
    restitution: 0.4 + Math.random() * 0.1, // Natural bounce (0.4-0.5)
    friction: 0.4 + Math.random() * 0.1, // Moderate friction (0.4-0.5)
    frictionAir: 0.05 + Math.random() * 0.01, // Controlled air resistance
    density: 0.015 + Math.random() * 0.002, // Slightly higher density
    label: `random-ball-${betValue}`, // Random ball identifier
    isServiceGuided: false, // No path control
});
```

#### 2. Adaptive Collision Physics

```typescript
export function handleRandomPinCollision(ballBody: Body, engine: Engine): void {
    // Speed-based collision response
    const speed = Math.sqrt(currentVelocity.x² + currentVelocity.y²);
    const speedFactor = Math.max(0.3, Math.min(1.0, speed / 3.0));

    // Adaptive strength: slower balls get stronger deflections
    const baseStrength = Math.min(scaledPhysics.forceStrength * 0.5 * (2.0 - speedFactor), 1.5);

    // Direction continuity bias to prevent oscillating
    const directionBias = Math.abs(currentVelocity.x) > 0.5 ? Math.sign(currentVelocity.x) : 0;
    const randomDirection = directionBias !== 0 ?
        (Math.random() < 0.7 ? directionBias : -directionBias) : // 70% continuity
        (Math.random() < 0.5 ? -1 : 1); // 50% random if no bias
}
```

#### 3. Collision Cooldown System

```typescript
// Prevents rapid oscillating collisions
const cooldownPeriod = scaledPhysics.collisionCooldown * 0.8; // Shorter for random
if (now - lastCollisionTime < cooldownPeriod) {
    return; // Skip collision if too recent
}
```

#### 4. Natural Movement Characteristics

-   **Unpredictable Paths**: Each ball follows a unique trajectory
-   **Realistic Bouncing**: Natural restitution and friction
-   **Speed-Adaptive**: Collision strength varies with ball speed
-   **Direction Continuity**: Prevents unnatural oscillating behavior
-   **Momentum Preservation**: Maintains natural physics momentum

### Advantages

✅ **Authentic Gameplay**: Feels like real Plinko  
✅ **Natural Physics**: Realistic ball movement and bouncing  
✅ **Fair Randomness**: Truly random outcomes  
✅ **Visual Appeal**: Engaging and unpredictable  
✅ **Simple Implementation**: Less complex collision logic

### Disadvantages

❌ **Unpredictable Outcomes**: Cannot guarantee specific results  
❌ **No Path Control**: Balls may not hit intended slots  
❌ **Business Logic Risk**: May not align with service requirements  
❌ **Debugging Difficulty**: Harder to trace ball behavior

---

## Deterministic System

### Philosophy

The Deterministic System prioritizes **precise path control** and **guaranteed outcomes**. Balls follow predefined service paths to ensure accurate slot landings.

### Key Features

#### 1. Service-Guided Path Following

```typescript
// Ball creation with deterministic control
const ball = Bodies.circle(ballX, ballRadius, ballRadius, {
    restitution: 0.4 + Math.random() * 0.1, // Controlled bounce
    friction: 0.4 + Math.random() * 0.1, // Moderate friction
    frictionAir: 0.05 + Math.random() * 0.01, // Controlled air resistance
    density: 0.015 + Math.random() * 0.002, // Slightly higher density
    label: "service-guided-ball", // Service-guided identifier
    isServiceGuided: true, // Path control enabled
});

// Service path data
ballExtension.servicePath = serviceData.path; // [0,0,0,1,1,0,1,0]
ballExtension.currentPathIndex = 0; // Current step
ballExtension.expectedFinalSlot = serviceData.finalSlot; // Target slot
```

#### 2. Deterministic Collision Handling

```typescript
export function handleServiceGuidedPinCollision(
    ballBody: Body,
    ballExtension: BallBodyExtension,
    obstacleBody: Body,
    engine: Engine
): void {
    // Extract path direction for current step
    const direction = ballExtension.servicePath[ballExtension.currentPathIndex];

    // Apply deterministic nudge based on path direction
    const nudgeX = direction === 0 ? -nudgeStrength : nudgeStrength;

    // Apply controlled velocity change
    Body.setVelocity(ballBody, {
        x: finalNudgeX, // Deterministic X movement
        y: naturalYVelocity, // Controlled Y falling
    });

    // Increment path index for next step
    ballExtension.currentPathIndex++;
}
```

#### 3. Missing Step Detection

```typescript
export function checkAndApplyMissingPathSteps(ballBody: Body, ballExtension: BallBodyExtension, engine: Engine): void {
    // Detect if ball bypassed expected peg row
    if (currentPathIndex < pathLength && ballY > 80) {
        const expectedRowForCurrentStep = currentPathIndex + 1;
        const ballRow = Math.floor((ballY - 30) / 55) + 1;

        // Force apply missing step if ball passed expected row
        if (ballRow > expectedRowForCurrentStep) {
            const direction = ballExtension.servicePath[currentPathIndex];
            const baseNudgeX = direction === 0 ? -scaledPhysics.nudgeStrength : scaledPhysics.nudgeStrength;

            Body.setVelocity(ballBody, {
                x: ballBody.velocity.x + finalNudgeX,
                y: ballBody.velocity.y,
            });
        }
    }
}
```

#### 4. Final Position Correction

```typescript
// Ensure ball lands on correct slot
if (ballExtension.expectedFinalSlot !== finalSlot) {
    const expectedX = calculateSlotTargetX(ballExtension.expectedFinalSlot);

    // Apply aggressive final position correction
    Body.setPosition(ballBody, { x: expectedX, y: ballBody.position.y });
    Body.setVelocity(ballBody, { x: 0, y: 0 });
}
```

#### 5. Path Execution Guarantees

-   **Step-by-Step Control**: Each peg collision applies specific directional nudge
-   **Missing Step Recovery**: Automatically detects and applies missed path steps
-   **Final Position Correction**: Ensures accurate slot landing
-   **Path Validation**: Comprehensive logging and verification
-   **Collision Cooldown**: Prevents multiple rapid collisions

### Advantages

✅ **Guaranteed Accuracy**: Balls land on correct slots  
✅ **Service Integration**: Perfect alignment with backend results  
✅ **Provably Fair**: Deterministic outcomes for game integrity  
✅ **Business Logic Compliance**: Meets regulatory requirements  
✅ **Debugging Support**: Comprehensive path tracking and logging

### Disadvantages

❌ **Less Natural**: May feel artificial or forced  
❌ **Complex Implementation**: More sophisticated collision logic  
❌ **Performance Overhead**: Additional path tracking and validation  
❌ **Maintenance Complexity**: More code to maintain and debug

---

## Detailed Comparison

### Physics Behavior

| Aspect                  | Random System          | Deterministic System        |
| ----------------------- | ---------------------- | --------------------------- |
| **Ball Movement**       | Natural physics-driven | Service-guided with physics |
| **Collision Response**  | Adaptive speed-based   | Directional nudge-based     |
| **Path Predictability** | Completely random      | Predefined by service       |
| **Bounce Behavior**     | Natural restitution    | Controlled bounce           |
| **Momentum**            | Preserved naturally    | Controlled with nudges      |

### Collision Handling

| Feature                    | Random System        | Deterministic System        |
| -------------------------- | -------------------- | --------------------------- |
| **Collision Detection**    | Standard physics     | Enhanced with path tracking |
| **Response Strength**      | Speed-adaptive       | Fixed nudge strength        |
| **Direction Control**      | Random with bias     | Service-determined          |
| **Cooldown Period**        | Shorter (0.8x)       | Standard length             |
| **Oscillation Prevention** | Direction continuity | Path step validation        |

### Path Management

| Component                  | Random System  | Deterministic System       |
| -------------------------- | -------------- | -------------------------- |
| **Path Data**              | None           | Service-provided array     |
| **Step Tracking**          | Not applicable | Current path index         |
| **Missing Step Detection** | Not needed     | Y-position based detection |
| **Path Completion**        | Not applicable | Forced completion logic    |
| **Validation**             | Random outcome | Slot accuracy verification |

### Performance Metrics

| Metric                   | Random System | Deterministic System     |
| ------------------------ | ------------- | ------------------------ |
| **CPU Usage**            | Lower         | Higher (path tracking)   |
| **Memory Usage**         | Lower         | Higher (path data)       |
| **Collision Processing** | Faster        | Slower (validation)      |
| **Update Frequency**     | Standard      | Enhanced (missing steps) |
| **Logging Overhead**     | Minimal       | Extensive                |

---

## Physics Configuration

### Shared Configuration

Both systems use the same base physics configuration:

```typescript
export const physicsScalingConfig = {
    baseGravity: 1.0,
    baseNudgeStrength: 3.5, // Strong nudges for deterministic control
    baseYVelocity: 1.6, // Faster falling for deterministic control
    baseForceStrength: 2.5, // Stronger forces for deterministic control
    baseCollisionCooldown: 80, // Shorter cooldown for precise path following
    baseRandomFactor: 0.08, // Minimal randomness for deterministic paths
    baseMomentumVariation: 0.95, // High momentum preservation for path stability
    baseAngularVelocity: 0.03, // Minimal spinning for focused path following
};
```

### System-Specific Adjustments

#### Random System Adjustments

```typescript
// In handleRandomPinCollision
const cooldownPeriod = scaledPhysics.collisionCooldown * 0.8; // Shorter cooldown
const baseStrength = Math.min(scaledPhysics.forceStrength * 0.5 * (2.0 - speedFactor), 1.5); // Adaptive strength
const angularVelocity = (Math.random() - 0.5) * scaledPhysics.angularVelocity * 0.3; // Reduced spin
```

#### Deterministic System Adjustments

```typescript
// In handleServiceGuidedPinCollision
const nudgeX = direction === 0 ? -scaledPhysics.nudgeStrength : scaledPhysics.nudgeStrength;
const finalNudgeX = naturalNudgeX * momentumMultiplier;
const angularVelocity = (Math.random() - 0.5) * scaledPhysics.angularVelocity * 1.5; // Increased spin
```

---

## Implementation Details

### Ball Creation

#### Random Ball Creation

```typescript
// use-ball-spawner.ts
const ball = Bodies.circle(ballX, startY, ballRadius, {
    restitution: physicsTweaks.restitution,
    friction: 0.6,
    frictionAir: physicsTweaks.frictionAir,
    density: physicsTweaks.density,
    label: `ball-${betValue}`,
    isServiceGuided: false,
});
```

#### Service-Guided Ball Creation

```typescript
// physics-engine.ts
const ball = Bodies.circle(ballX, ballRadius, ballRadius, {
    restitution: 0.4 + Math.random() * 0.1,
    friction: 0.4 + Math.random() * 0.1,
    frictionAir: 0.05 + Math.random() * 0.01,
    density: 0.015 + Math.random() * 0.002,
    label: "service-guided-ball",
    isServiceGuided: true,
});

// Add service path data
ballExtension.servicePath = serviceData.path;
ballExtension.currentPathIndex = 0;
ballExtension.expectedFinalSlot = serviceData.finalSlot;
```

### Collision Processing

#### Random Collision Flow

```typescript
export function processCollision(
    ballBody: Body,
    obstacleBody: Body,
    engine: Engine,
    removedBallsRef: React.MutableRefObject<Set<number>>,
    options: CollisionHandlerOptions
): void {
    if (obstacleBody.label?.includes("pin")) {
        if (!ballExtension.isServiceGuided) {
            handleRandomPinCollision(ballBody, engine); // Natural physics
        }
    }
}
```

#### Deterministic Collision Flow

```typescript
export function processCollision(
    ballBody: Body,
    obstacleBody: Body,
    engine: Engine,
    removedBallsRef: React.MutableRefObject<Set<number>>,
    options: CollisionHandlerOptions
): void {
    if (obstacleBody.label?.includes("pin")) {
        if (
            ballExtension.isServiceGuided &&
            ballExtension.servicePath &&
            ballExtension.currentPathIndex < ballExtension.servicePath.length
        ) {
            handleServiceGuidedPinCollision(ballBody, ballExtension, obstacleBody, engine); // Path following
        } else if (
            ballExtension.isServiceGuided &&
            ballExtension.servicePath &&
            ballExtension.currentPathIndex >= ballExtension.servicePath.length
        ) {
            handleServiceGuidedCoastingCollision(ballBody, ballExtension, engine); // Final guidance
        }
    }
}
```

### Path Tracking

#### Random System

-   No path tracking required
-   Simple collision logging
-   Natural outcome recording

#### Deterministic System

```typescript
// Path position tracking
ballExtension.pathPositions.push({
    x: ballBody.position.x,
    y: ballBody.position.y,
    type: "collision",
    pegRow,
    pegCol,
    pathIndex: ballExtension.currentPathIndex,
    direction,
});

// Applied guidance steps tracking
ballExtension.appliedGuidanceSteps.push(`step-${ballExtension.currentPathIndex}`);
```

---

## Performance Considerations

### CPU Usage

| Operation                     | Random System | Deterministic System       |
| ----------------------------- | ------------- | -------------------------- |
| **Collision Processing**      | O(1)          | O(1) + path validation     |
| **Path Tracking**             | None          | O(n) where n = path length |
| **Missing Step Detection**    | None          | O(1) per physics update    |
| **Final Position Correction** | None          | O(1) on slot collision     |

### Memory Usage

| Data Structure        | Random System | Deterministic System   |
| --------------------- | ------------- | ---------------------- |
| **Ball Properties**   | ~200 bytes    | ~500 bytes             |
| **Path Data**         | None          | ~100 bytes per path    |
| **Collision History** | Minimal       | Extensive logging      |
| **Position Tracking** | None          | ~50 bytes per position |

### Optimization Strategies

#### Random System

-   Minimal collision logging
-   Simple physics properties
-   No path validation overhead
-   Standard Matter.js performance

#### Deterministic System

-   Efficient path step tracking
-   Optimized missing step detection
-   Cached physics calculations
-   Selective logging based on environment

---

## Business Logic Impact

### Random System

#### Use Cases

-   **Demo/Testing**: Showcasing natural Plinko gameplay
-   **Fair Gaming**: Truly random outcomes
-   **User Experience**: Engaging and unpredictable
-   **Development**: Testing physics behavior

#### Business Considerations

-   **Regulatory Compliance**: May not meet provably fair requirements
-   **Service Integration**: Outcomes don't match backend results
-   **Player Trust**: Natural randomness builds confidence
-   **Game Balance**: True statistical distribution

### Deterministic System

#### Use Cases

-   **Production Gaming**: Guaranteed accurate outcomes
-   **Service Integration**: Perfect backend alignment
-   **Provably Fair**: Deterministic and verifiable
-   **Regulatory Compliance**: Meets gaming standards

#### Business Considerations

-   **Accuracy**: 100% slot landing accuracy
-   **Service Sync**: Perfect alignment with backend
-   **Player Trust**: Provably fair results
-   **Regulatory**: Meets gaming compliance requirements

---

## Conclusion

### When to Use Random System

✅ **Development and Testing**: Natural physics validation  
✅ **Demo Purposes**: Showcasing authentic Plinko gameplay  
✅ **Fair Gaming**: When true randomness is required  
✅ **User Experience**: Engaging unpredictable gameplay

### When to Use Deterministic System

✅ **Production Gaming**: Guaranteed accurate outcomes  
✅ **Service Integration**: Backend result alignment  
✅ **Provably Fair**: Regulatory compliance requirements  
✅ **Business Logic**: Precise control over game outcomes

### Hybrid Approach

Consider implementing both systems with runtime switching:

```typescript
// Runtime system selection
const useDeterministicSystem = process.env.NODE_ENV === "production" && serviceData.isServiceGuided;

if (useDeterministicSystem) {
    handleServiceGuidedPinCollision(ballBody, ballExtension, obstacleBody, engine);
} else {
    handleRandomPinCollision(ballBody, engine);
}
```

This allows for:

-   **Development**: Natural physics testing
-   **Production**: Guaranteed accuracy
-   **Flexibility**: Easy system switching
-   **Maintenance**: Single codebase for both approaches

---

## Technical Specifications

### System Requirements

| Requirement              | Random System | Deterministic System                |
| ------------------------ | ------------- | ----------------------------------- |
| **Matter.js Version**    | 0.18.0+       | 0.18.0+                             |
| **Physics Iterations**   | Standard      | Enhanced (8 position, 6 constraint) |
| **Collision Categories** | Standard      | Enhanced with path tracking         |
| **Memory Overhead**      | Minimal       | Moderate                            |
| **CPU Overhead**         | Low           | Medium                              |

### Configuration Files

-   **`physics-config.ts`**: Shared physics constants
-   **`collision-handler.ts`**: System-specific collision logic
-   **`physics-engine-manager.ts`**: Engine lifecycle management
-   **`use-ball-spawner.ts`**: Ball creation and spawning
-   **`physics-engine.ts`**: Core physics operations

### Testing Considerations

#### Random System Testing

-   Statistical distribution validation
-   Physics behavior verification
-   Performance benchmarking
-   Natural movement confirmation

#### Deterministic System Testing

-   Path execution accuracy
-   Slot landing verification
-   Missing step detection
-   Final position correction
-   Service data integration

---

_This documentation provides a comprehensive overview of both physics systems. For implementation details, refer to the source code in the respective files._
