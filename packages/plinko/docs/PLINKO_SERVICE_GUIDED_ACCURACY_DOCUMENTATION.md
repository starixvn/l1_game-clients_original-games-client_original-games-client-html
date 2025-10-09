# Plinko Service-Guided Accuracy Documentation

## Overview

This document provides a comprehensive guide on ensuring balls fall correctly according to the service result array and slot index, with precise collision mechanics between balls and pegs. It combines insights from the Physics Factors Relationship and Physics Systems documentation to create a complete accuracy assurance system.

## Table of Contents

1. [Service Data Structure](#service-data-structure)
2. [Path-to-Slot Relationship](#path-to-slot-relationship)
3. [Collision Accuracy Mechanisms](#collision-accuracy-mechanisms)
4. [Path Execution Guarantees](#path-execution-guarantees)
5. [Slot Landing Verification](#slot-landing-verification)
6. [Accuracy Assurance System](#accuracy-assurance-system)
7. [Troubleshooting Incorrect Landings](#troubleshooting-incorrect-landings)
8. [Mathematical Validation](#mathematical-validation)

---

## Service Data Structure

### Result Array Format

The service provides a result array that determines the ball's path:

```typescript
interface ServiceResult {
    roundId: number;
    result: number[]; // Path array: [0,0,0,1,1,0,1,0]
    settlementResult: {
        slotIndex: number; // Target slot: 0-8
        multiplier: number; // Payout multiplier
    };
    winAmount: number;
    amount: number;
    reachMaxWin: boolean;
    time: string;
    gameMode: number;
    numberOfRows: number; // Usually 8
}
```

### Path Array Interpretation

```typescript
// Path array meaning:
// 0 = LEFT turn at peg collision
// 1 = RIGHT turn at peg collision

// Example: [0,0,0,1,1,0,1,0]
// Step 0 (Row 1): LEFT
// Step 1 (Row 2): LEFT
// Step 2 (Row 3): LEFT
// Step 3 (Row 4): RIGHT
// Step 4 (Row 5): RIGHT
// Step 5 (Row 6): LEFT
// Step 6 (Row 7): RIGHT
// Step 7 (Row 8): LEFT

// Result: Ball lands on slotIndex 3
```

### Slot Index Calculation

The slot index is calculated from the path array:

```typescript
// Count RIGHT turns (1s) to determine final slot
const calculateSlotFromPath = (path: number[]): number => {
    return path.filter((direction) => direction === 1).length;
};

// Example:
// Path: [0,0,0,1,1,0,1,0]
// RIGHT turns (1s): positions 3,4,6 = 3 total
// Expected slotIndex: 3
```

---

## Path-to-Slot Relationship

### Deterministic Path Following

#### 1. Row-by-Row Control

```typescript
// Each peg row corresponds to one path step
const PEG_ROWS = 8;
const pathSteps = serviceData.path; // Length should equal PEG_ROWS

// Path step 0 = Row 1 collision
// Path step 1 = Row 2 collision
// Path step N = Row (N+1) collision
```

#### 2. Collision Row Detection

```typescript
export function handleServiceGuidedPinCollision(
    ballBody: Body,
    ballExtension: BallBodyExtension,
    obstacleBody: Body,
    engine: Engine
): void {
    // Extract peg row from obstacle label
    const pegLabel = obstacleBody.label || "";
    const pegParts = pegLabel.split("-");
    const pegRow = parseInt(pegParts[1]) || 0; // Row number

    // Calculate expected row for current path step
    const expectedRowForCurrentStep = ballExtension.currentPathIndex + 1;

    // Only apply guidance if collision occurs in expected row
    if (pegRow === expectedRowForCurrentStep) {
        // Apply path direction for this step
        applyPathDirection(ballBody, ballExtension, engine);
    }
}
```

#### 3. Direction Application

```typescript
function applyPathDirection(ballBody: Body, ballExtension: BallBodyExtension, engine: Engine): void {
    // Get direction from service path
    const direction = ballExtension.servicePath[ballExtension.currentPathIndex];

    // Calculate nudge based on physics scaling
    const currentGravity = engine.gravity.y;
    const scaledPhysics = getScaledPhysicsValues(currentGravity);

    // Apply directional nudge
    // CORRECT mapping: 0 = LEFT, 1 = RIGHT
    const nudgeX = direction === 0 ? -scaledPhysics.nudgeStrength : scaledPhysics.nudgeStrength;

    // Add controlled randomness for natural feel
    const randomX = (Math.random() - 0.5) * scaledPhysics.randomFactor;
    const naturalNudgeX = nudgeX + randomX;

    // Apply momentum variation
    const momentumMultiplier = scaledPhysics.momentumVariation + Math.random() * (1.0 - scaledPhysics.momentumVariation);
    const finalNudgeX = naturalNudgeX * momentumMultiplier;

    // Apply controlled Y velocity
    const yVariation = (Math.random() - 0.5) * 0.15;
    const naturalYVelocity = Math.max(ballBody.velocity.y * 0.95, scaledPhysics.baseYVelocity + yVariation);

    // Set deterministic velocity
    Body.setVelocity(ballBody, {
        x: finalNudgeX,
        y: naturalYVelocity,
    });

    // Track path execution
    trackPathStep(ballExtension, pegRow, direction);

    // Increment path index
    ballExtension.currentPathIndex++;
}
```

---

## Collision Accuracy Mechanisms

### Ball-Peg Collision Precision

#### 1. Collision Area Calculation

```typescript
// Ball collision area
const ballRadius = calculateBallSize(rows, canvasScaleFactor);
const collisionArea = Math.PI * Math.pow(ballRadius, 2);

// Peg collision area (fixed)
const pegRadius = 5;
const pegCollisionArea = Math.PI * Math.pow(pegRadius, 2);

// Combined collision area
const combinedCollisionArea = ballRadius + pegRadius;

// Collision probability increases with ball size
const collisionProbability = combinedCollisionArea / pegSpacing;
```

#### 2. Collision Cooldown System

```typescript
// Prevent multiple rapid collisions on same peg
const cooldownPeriod = scaledPhysics.collisionCooldown;

if (now - lastCollisionTime < cooldownPeriod) {
    logger.debug("Skipping collision - cooldown active");
    return; // Prevent oscillating behavior
}

// Update collision cooldown
ballExtension.collisionCooldown.set(cooldownKey, now);
```

#### 3. Collision Force Distribution

```typescript
// Collision force based on ball properties
const collisionForce = (ballMass * velocityChange) / collisionTime;

// Force distribution across collision area
const forcePerUnitArea = collisionForce / collisionArea;

// Ball size affects collision gentleness
// Larger balls = more distributed force = gentler collisions
// Smaller balls = more concentrated force = sharper collisions
```

### Row-Specific Collision Logic

#### 1. Expected Row Validation

```typescript
// Only apply path guidance in expected row
const expectedRowForCurrentStep = ballExtension.currentPathIndex + 1;

if (pegRow !== expectedRowForCurrentStep) {
    logger.debug(`Wrong row collision: expected ${expectedRowForCurrentStep}, got ${pegRow}`);
    return; // Skip collision if not in expected row
}
```

#### 2. Step Tracking per Row

```typescript
// Track applied guidance steps
if (!ballExtension.appliedGuidanceSteps) {
    ballExtension.appliedGuidanceSteps = [];
}

// Mark step as applied for this row
const currentStepKey = `step-${ballExtension.currentPathIndex}`;
ballExtension.appliedGuidanceSteps.push(currentStepKey);
```

#### 3. Collision Sequence Tracking

```typescript
// Track collision sequence for oscillation detection
if (!ballExtension.collisionSequence) {
    ballExtension.collisionSequence = [];
}

ballExtension.collisionSequence.push({
    timestamp: Date.now(),
    pegLabel: obstacleBody.label,
    position: { x: ballBody.position.x, y: ballBody.position.y },
    velocity: { x: ballBody.velocity.x, y: ballBody.velocity.y },
});

// Keep only last 10 collisions
if (ballExtension.collisionSequence.length > 10) {
    ballExtension.collisionSequence.shift();
}
```

---

## Path Execution Guarantees

### Missing Step Detection

#### 1. Y-Position Based Detection

```typescript
export function checkAndApplyMissingPathSteps(ballBody: Body, ballExtension: BallBodyExtension, engine: Engine): void {
    if (!ballExtension.isServiceGuided || !ballExtension.servicePath) {
        return;
    }

    const currentPathIndex = ballExtension.currentPathIndex || 0;
    const pathLength = ballExtension.servicePath.length;
    const ballY = ballBody.position.y;

    // Only check if ball is actively falling
    if (currentPathIndex < pathLength && ballY > 80) {
        const expectedRowForCurrentStep = currentPathIndex + 1;
        const ballRow = Math.floor((ballY - 30) / 55) + 1;

        // Check if ball passed expected row
        if (ballRow > expectedRowForCurrentStep || (ballRow === expectedRowForCurrentStep && ballY > expectedRowForCurrentStep * 55 + 80)) {
            // Force apply missing step
            applyMissingPathStep(ballBody, ballExtension, engine);
        }
    }
}
```

#### 2. Forced Step Application

```typescript
function applyMissingPathStep(ballBody: Body, ballExtension: BallBodyExtension, engine: Engine): void {
    const direction = ballExtension.servicePath[ballExtension.currentPathIndex];
    const currentGravity = engine.gravity.y;
    const scaledPhysics = getScaledPhysicsValues(currentGravity);

    // Calculate nudge for missing step
    const baseNudgeX = direction === 0 ? -scaledPhysics.nudgeStrength : scaledPhysics.nudgeStrength;

    // Add randomness and momentum variation
    const randomX = (Math.random() - 0.5) * scaledPhysics.randomFactor;
    const naturalNudgeX = baseNudgeX + randomX;

    const momentumMultiplier = scaledPhysics.momentumVariation + Math.random() * (1.0 - scaledPhysics.momentumVariation);
    const finalNudgeX = naturalNudgeX * momentumMultiplier;

    // Apply missing step velocity change
    Body.setVelocity(ballBody, {
        x: ballBody.velocity.x + finalNudgeX,
        y: ballBody.velocity.y,
    });

    // Track applied step
    if (!ballExtension.appliedGuidanceSteps) {
        ballExtension.appliedGuidanceSteps = [];
    }
    ballExtension.appliedGuidanceSteps.push(`step-${ballExtension.currentPathIndex}`);

    // Increment path index
    ballExtension.currentPathIndex++;

    logger.warn("Applied missing path step", {
        ballId: ballBody.id,
        appliedStep: ballExtension.currentPathIndex,
        direction: direction === 0 ? "LEFT" : "RIGHT",
        nudgeApplied: finalNudgeX,
    });
}
```

### Path Completion Assurance

#### 1. Forced Path Completion

```typescript
export function forceCompletePathExecution(ballBody: Body, ballExtension: BallBodyExtension): void {
    const currentPathIndex = ballExtension.currentPathIndex || 0;
    const pathLength = ballExtension.servicePath.length;

    // Check if path is incomplete
    if (currentPathIndex < pathLength) {
        logger.warn("Forcing path completion", {
            currentIndex: currentPathIndex,
            pathLength: pathLength,
            missingSteps: pathLength - currentPathIndex,
        });

        // Calculate cumulative effect of remaining steps
        let cumulativeX = 0;
        for (let i = currentPathIndex; i < pathLength; i++) {
            const direction = ballExtension.servicePath[i];
            const baseNudgeX = direction === 0 ? -4.5 : 4.5;

            // Add randomness and momentum
            const randomFactor = 0.2;
            const randomX = (Math.random() - 0.5) * randomFactor;
            const naturalNudgeX = baseNudgeX + randomX;

            const momentumVariation = 0.85 + Math.random() * 0.15;
            const finalNudgeX = naturalNudgeX * momentumVariation;

            cumulativeX += finalNudgeX;

            // Mark step as applied
            ballExtension.appliedGuidanceSteps.push(`step-${i}`);
        }

        // Apply cumulative effect
        Body.setVelocity(ballBody, {
            x: ballBody.velocity.x + cumulativeX,
            y: ballBody.velocity.y,
        });

        // Set path as completed
        ballExtension.currentPathIndex = pathLength;
    }
}
```

---

## Slot Landing Verification

### Target Slot Calculation

#### 1. Physical Slot Positioning

```typescript
function calculateSlotTargetX(slotIndex: number, canvasWidth: number = 600): number {
    const pegRadius = 5;
    const mapGap = 2;
    const gap = pegRadius * 2 * mapGap; // 60px spacing
    const numberOfSlots = 9; // 8 rows + 1 = 9 slots
    const space = (canvasWidth - gap * numberOfSlots) / 2;

    // Calculate X position: space + (index + 1) * gap - pegRadius * mapGap
    return space + (slotIndex + 1) * gap - pegRadius * mapGap;
}

// Example slot positions:
// Slot 0: leftmost position
// Slot 4: center position
// Slot 8: rightmost position
```

#### 2. Slot Landing Validation

```typescript
export function handleMultiplierCollision(result: CollisionResult, options: CollisionHandlerOptions): void {
    const { ballBody, ballExtension, obstacleBody } = result;

    // Extract landed slot from multiplier label
    const fullLabel = obstacleBody.label || "";
    const labelParts = fullLabel.split("-");
    const finalSlot = parseInt(labelParts[2]) || 0;

    // For service-guided balls, validate landing
    if (ballExtension.isServiceGuided) {
        const expectedSlotIndex = ballExtension.expectedFinalSlot;
        const expectedX = calculateSlotTargetX(expectedSlotIndex);
        const actualX = ballBody.position.x;
        const positionDifference = Math.abs(actualX - expectedX);

        logger.info("Slot landing verification", {
            ballId: ballBody.id,
            expectedSlot: expectedSlotIndex,
            actualSlot: finalSlot,
            expectedX: Math.round(expectedX),
            actualX: Math.round(actualX),
            positionDifference: Math.round(positionDifference),
            slotsMatch: expectedSlotIndex === finalSlot,
        });

        // Check if ball landed on correct slot
        if (expectedSlotIndex !== finalSlot) {
            logger.error("Incorrect slot landing detected", {
                issue: "WRONG_SLOT_LANDED",
                diagnosis: `Expected slot ${expectedSlotIndex}, landed on ${finalSlot}`,
            });

            // Apply final position correction
            applyFinalPositionCorrection(ballBody, ballExtension, expectedSlotIndex);
        }
    }
}
```

### Final Position Correction

#### 1. Aggressive Correction Logic

```typescript
function applyFinalPositionCorrection(ballBody: Body, ballExtension: BallBodyExtension, expectedSlotIndex: number): void {
    // Calculate correct X position
    const expectedX = calculateSlotTargetX(expectedSlotIndex);
    const currentX = ballBody.position.x;
    const correctionX = expectedX - currentX;

    logger.warn("Applying final position correction", {
        ballId: ballBody.id,
        expectedSlot: expectedSlotIndex,
        expectedX: Math.round(expectedX),
        currentX: Math.round(currentX),
        correctionX: Math.round(correctionX),
    });

    // Move ball to correct position
    Body.setPosition(ballBody, {
        x: expectedX,
        y: ballBody.position.y,
    });

    // Stop ball movement to prevent further drift
    Body.setVelocity(ballBody, { x: 0, y: 0 });
}
```

#### 2. Coasting Collision Correction

```typescript
export function handleServiceGuidedCoastingCollision(ballBody: Body, ballExtension: BallBodyExtension, engine: Engine): void {
    // After path completion, apply corrective forces toward target slot
    if (ballExtension.expectedFinalSlot !== undefined) {
        const targetX = calculateSlotTargetX(ballExtension.expectedFinalSlot);
        const currentX = ballBody.position.x;
        const distanceToTarget = targetX - currentX;

        // Calculate corrective force based on distance
        const currentGravity = engine.gravity.y;
        const scaledPhysics = getScaledPhysicsValues(currentGravity);

        const correction =
            Math.abs(distanceToTarget) > 20
                ? Math.sign(distanceToTarget) * scaledPhysics.forceStrength
                : Math.sign(distanceToTarget) * (scaledPhysics.forceStrength * 0.5);

        // Apply corrective force
        Body.applyForce(ballBody, ballBody.position, { x: correction, y: 0 });

        logger.debug("Coasting correction applied", {
            ballId: ballBody.id,
            targetX: targetX.toFixed(1),
            currentX: currentX.toFixed(1),
            distanceToTarget: distanceToTarget.toFixed(1),
            correction: correction.toFixed(3),
        });
    }
}
```

---

## Accuracy Assurance System

### Comprehensive Validation

#### 1. Path Validation

```typescript
function validateServicePath(serviceData: ServiceGuidedBallData): boolean {
    // Validate path length matches rows
    if (serviceData.path.length !== serviceData.numberOfRows) {
        logger.error("Path length mismatch", {
            pathLength: serviceData.path.length,
            expectedRows: serviceData.numberOfRows,
        });
        return false;
    }

    // Validate path contains only 0s and 1s
    const validDirections = serviceData.path.every((dir) => dir === 0 || dir === 1);
    if (!validDirections) {
        logger.error("Invalid path directions", {
            path: serviceData.path,
            invalidDirections: serviceData.path.filter((dir) => dir !== 0 && dir !== 1),
        });
        return false;
    }

    // Validate slot index matches path calculation
    const calculatedSlot = serviceData.path.filter((dir) => dir === 1).length;
    if (calculatedSlot !== serviceData.finalSlot) {
        logger.error("Slot index mismatch", {
            calculatedSlot: calculatedSlot,
            serviceSlot: serviceData.finalSlot,
            path: serviceData.path,
        });
        return false;
    }

    return true;
}
```

#### 2. Collision Tracking

```typescript
function trackCollisionAccuracy(ballExtension: BallBodyExtension): void {
    // Track collision statistics
    const totalExpectedCollisions = ballExtension.servicePath.length;
    const appliedSteps = ballExtension.appliedGuidanceSteps?.length || 0;
    const collisionAccuracy = appliedSteps / totalExpectedCollisions;

    logger.info("Collision accuracy tracking", {
        ballId: ballExtension.id,
        totalExpectedCollisions: totalExpectedCollisions,
        appliedSteps: appliedSteps,
        collisionAccuracy: `${(collisionAccuracy * 100).toFixed(1)}%`,
        pathCompleted: appliedSteps >= totalExpectedCollisions,
    });

    // Alert if collision accuracy is too low
    if (collisionAccuracy < 0.8) {
        // Less than 80% accuracy
        logger.warn("Low collision accuracy detected", {
            ballId: ballExtension.id,
            accuracy: collisionAccuracy,
            issue: "Ball may not follow path correctly",
        });
    }
}
```

### Physics Factor Optimization

#### 1. Ball Size Optimization

```typescript
// Optimize ball size for collision accuracy
function optimizeBallSizeForAccuracy(rows: number, canvasScaleFactor: number): number {
    // Base calculations from physics factors
    const baseRows = 10;
    const baseDiameter = 22;
    const sizeScaleFactor = 0.95;

    // Calculate optimal ball size
    const rowRatio = rows / baseRows;
    const optimalDiameter = baseDiameter * Math.pow(rowRatio, sizeScaleFactor);

    // Ensure ball is large enough for reliable collisions
    const minDiameter = 9;
    const maxDiameter = 35;

    return Math.max(minDiameter, Math.min(maxDiameter, optimalDiameter));
}
```

#### 2. Gravity Optimization

```typescript
// Optimize gravity for accurate path following
function optimizeGravityForAccuracy(): number {
    // Base gravity from physics config
    const baseGravity = 1.8; // Standard gravity
    const gravityMultiplier = 0.75; // Reduced for deterministic control

    // Calculate optimal gravity
    const optimalGravity = baseGravity * gravityMultiplier;

    // Ensure gravity allows for controlled falling
    const minGravity = 0.5;
    const maxGravity = 2.0;

    return Math.max(minGravity, Math.min(maxGravity, optimalGravity));
}
```

#### 3. Nudge Strength Optimization

```typescript
// Optimize nudge strength for path accuracy
function optimizeNudgeStrength(gravity: number): number {
    const baseGravity = 1.0;
    const gravityRatio = gravity / baseGravity;

    // Nudge strength scales with gravity using power relationship
    const baseNudgeStrength = 3.5;
    const nudgeScalingFactor = 1.5;

    const optimalNudgeStrength = baseNudgeStrength * Math.pow(gravityRatio, nudgeScalingFactor);

    // Ensure nudge is strong enough but not overwhelming
    const minNudge = 1.0;
    const maxNudge = 5.0;

    return Math.max(minNudge, Math.min(maxNudge, optimalNudgeStrength));
}
```

---

## Troubleshooting Incorrect Landings

### Common Issues and Solutions

#### 1. Ball Missing Path Steps

**Symptoms:**

-   Ball lands on wrong slot
-   Path execution shows missing steps
-   Collision accuracy below 80%

**Solutions:**

```typescript
// 1. Check missing step detection timing
const detectionThreshold = 80; // pixels from top
if (ballY > detectionThreshold) {
    // Ensure detection is active
}

// 2. Verify row calculation accuracy
const rowCalculation = Math.floor((ballY - 30) / 55) + 1;
// Ensure peg spacing matches calculation

// 3. Increase nudge strength for missed steps
const missedStepMultiplier = 1.2; // 20% stronger nudges
```

#### 2. Incorrect Slot Calculation

**Symptoms:**

-   Ball lands on adjacent slot
-   Position difference within 50-100 pixels
-   Path shows correct execution

**Solutions:**

```typescript
// 1. Verify slot target calculation
function calculateSlotTargetX(slotIndex: number): number {
    // Ensure all parameters are correct
    const pegRadius = 5;
    const mapGap = 2;
    const gap = pegRadius * 2 * mapGap;
    const numberOfSlots = rows + 1;
    const space = (canvasWidth - gap * numberOfSlots) / 2;

    return space + (slotIndex + 1) * gap - pegRadius * mapGap;
}

// 2. Check final position correction threshold
const correctionThreshold = 100; // pixels
if (positionDifference > correctionThreshold) {
    // Apply correction
}
```

#### 3. Physics Instability

**Symptoms:**

-   Oscillating ball movement
-   Unpredictable collision responses
-   Inconsistent path following

**Solutions:**

```typescript
// 1. Adjust collision cooldown
const optimalCooldown = scaledPhysics.collisionCooldown * 1.2;

// 2. Balance momentum preservation
const optimalMomentum = 0.88; // 88% preservation

// 3. Reduce randomness for deterministic paths
const minimalRandomness = 0.08; // 8% randomness
```

### Debugging Tools

#### 1. Path Execution Visualization

```typescript
function visualizePathExecution(ballExtension: BallBodyExtension): void {
    const pathBreakdown = ballExtension.servicePath
        .map((dir, idx) => {
            const applied = ballExtension.appliedGuidanceSteps?.includes(`step-${idx}`);
            const direction = dir === 0 ? "LEFT" : "RIGHT";
            const status = applied ? "✓" : "✗";
            return `Step ${idx}: ${direction} ${status}`;
        })
        .join(", ");

    logger.info("Path execution visualization", {
        ballId: ballExtension.id,
        pathBreakdown: pathBreakdown,
        completionRate: `${ballExtension.appliedGuidanceSteps?.length || 0}/${ballExtension.servicePath.length}`,
    });
}
```

#### 2. Collision Sequence Analysis

```typescript
function analyzeCollisionSequence(ballExtension: BallBodyExtension): void {
    const collisions = ballExtension.collisionSequence || [];
    const recentCollisions = collisions.slice(-5);

    // Detect oscillation patterns
    const directionChanges = [];
    for (let i = 1; i < recentCollisions.length; i++) {
        const prevVel = recentCollisions[i - 1].velocity.x;
        const currVel = recentCollisions[i].velocity.x;

        if (Math.sign(prevVel) !== Math.sign(currVel) && Math.abs(prevVel) > 0.2 && Math.abs(currVel) > 0.2) {
            directionChanges.push({
                from: Math.sign(prevVel) > 0 ? "RIGHT" : "LEFT",
                to: Math.sign(currVel) > 0 ? "RIGHT" : "LEFT",
            });
        }
    }

    if (directionChanges.length >= 2) {
        logger.warn("Oscillation detected", {
            ballId: ballExtension.id,
            directionChanges: directionChanges,
        });
    }
}
```

---

## Mathematical Validation

### Path-to-Slot Validation

#### 1. Slot Index Formula

```typescript
// Mathematical relationship between path and slot
// Slot Index = Σ(path[i]) where path[i] ∈ {0, 1}

function validatePathToSlotRelationship(path: number[], expectedSlot: number): boolean {
    const calculatedSlot = path.reduce((sum, direction) => sum + direction, 0);
    return calculatedSlot === expectedSlot;
}

// Example validation:
// Path: [0,0,0,1,1,0,1,0]
// Calculated: 0+0+0+1+1+0+1+0 = 3
// Expected slot: 3 ✓
```

#### 2. Position Accuracy Validation

```typescript
// Validate final position accuracy
function validateFinalPosition(actualX: number, expectedSlot: number, canvasWidth: number, tolerance: number = 50): boolean {
    const expectedX = calculateSlotTargetX(expectedSlot, canvasWidth);
    const positionDifference = Math.abs(actualX - expectedX);

    return positionDifference <= tolerance;
}

// Tolerance levels:
// Excellent: ≤ 10px
// Good: ≤ 25px
// Acceptable: ≤ 50px
// Needs correction: > 50px
```

### Collision Probability Validation

#### 1. Collision Success Rate

```typescript
// Calculate expected collision success rate
function calculateCollisionSuccessRate(ballRadius: number, pegSpacing: number, pathLength: number): number {
    const collisionArea = Math.PI * Math.pow(ballRadius, 2);
    const pegRadius = 5;
    const combinedRadius = ballRadius + pegRadius;

    // Simplified collision probability per row
    const collisionProbability = Math.min(1.0, combinedRadius / pegSpacing);

    // Success rate over entire path
    const successRate = Math.pow(collisionProbability, pathLength);

    return successRate;
}

// Example:
// Ball radius: 11px, Peg spacing: 60px, Path length: 8
// Collision probability per row: min(1.0, 16/60) = 0.267
// Overall success rate: 0.267^8 ≈ 0.0002 (0.02%)
// This shows why missing step detection is crucial!
```

#### 2. Path Accuracy Validation

```typescript
// Validate path execution accuracy
function validatePathAccuracy(ballExtension: BallBodyExtension): {
    accuracy: number;
    missingSteps: number[];
    extraSteps: number[];
} {
    const expectedSteps = ballExtension.servicePath.length;
    const appliedSteps = ballExtension.appliedGuidanceSteps || [];
    const appliedCount = appliedSteps.length;

    // Find missing steps
    const missingSteps = [];
    for (let i = 0; i < expectedSteps; i++) {
        if (!appliedSteps.includes(`step-${i}`)) {
            missingSteps.push(i);
        }
    }

    // Calculate accuracy
    const accuracy = appliedCount / expectedSteps;

    return {
        accuracy: accuracy,
        missingSteps: missingSteps,
        extraSteps: [], // Service-guided balls shouldn't have extra steps
    };
}
```

---

## Conclusion

### Accuracy Assurance Checklist

#### Pre-Flight Checks

-   [ ] Validate service data structure
-   [ ] Confirm path array contains only 0s and 1s
-   [ ] Verify slot index matches path calculation
-   [ ] Check path length equals number of rows

#### Ball Creation Checks

-   [ ] Ensure `isServiceGuided` flag is set to `true`
-   [ ] Verify service path is attached to ball extension
-   [ ] Confirm physics properties are optimized for deterministic control
-   [ ] Validate initial velocity is appropriate for controlled falling

#### Collision System Checks

-   [ ] Verify collision cooldown prevents oscillating behavior
-   [ ] Confirm row-specific collision logic is active
-   [ ] Check missing step detection is running in physics loop
-   [ ] Ensure nudge strength is scaled appropriately

#### Path Execution Checks

-   [ ] Monitor applied guidance steps tracking
-   [ ] Validate path index increments correctly
-   [ ] Check forced path completion on slot collision
-   [ ] Verify collision accuracy is above 80%

#### Slot Landing Checks

-   [ ] Confirm slot target calculation is accurate
-   [ ] Verify final position correction works when needed
-   [ ] Check coasting collision correction is active
-   [ ] Validate position difference is within tolerance

### Performance Optimization

#### For Maximum Accuracy

```typescript
const accuracyOptimizedConfig = {
    gravityMultiplier: 0.75, // Controlled falling
    nudgeStrength: 3.5, // Strong directional control
    collisionCooldown: 80, // Prevent oscillations
    randomFactor: 0.08, // Minimal randomness
    momentumVariation: 0.95, // High consistency
    ballSize: "optimized", // Larger balls for better collisions
    missingStepDetection: "aggressive", // Early detection
};
```

#### For Maximum Performance

```typescript
const performanceOptimizedConfig = {
    gravityMultiplier: 1.0, // Standard gravity
    nudgeStrength: 2.8, // Balanced nudges
    collisionCooldown: 100, // Moderate cooldown
    randomFactor: 0.12, // Natural variation
    momentumVariation: 0.88, // Natural momentum
    ballSize: "standard", // Standard size
    missingStepDetection: "standard", // Standard timing
};
```

### Final Validation

To ensure complete accuracy assurance:

1. **Monitor collision accuracy** - Should be > 95% for service-guided balls
2. **Track slot landing accuracy** - Should be 100% with final position correction
3. **Validate path execution** - All steps should be applied or compensated for
4. **Check position accuracy** - Final position should be within 25px of target
5. **Monitor performance** - Ensure accuracy doesn't compromise gameplay smoothness

This comprehensive accuracy system ensures that service-guided balls follow their predetermined paths and land in the correct slots as specified by the service result array, providing provably fair and deterministic gameplay outcomes.

---

_This documentation provides the complete framework for ensuring accurate service-guided ball movement and slot landing in the Plinko game._
