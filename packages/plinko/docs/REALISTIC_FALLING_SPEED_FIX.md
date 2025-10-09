# Realistic Falling Speed Fix for Service-Guided Balls

## Problem Analysis

From the logs, the ball was falling way too fast:

-   Ball went from Y position 30 to 470+ in just a few milliseconds
-   This made it impossible to hit pegs properly and follow the service path
-   The ball was not mimicking a real Plinko game experience

## Root Causes

1. **High Gravity**: Engine gravity was set to `1.8` which is too strong
2. **Fast Y Velocity**: Ball Y velocity was set to `Math.max(currentVelocity.y, 1.5)` which is too fast
3. **Low Air Resistance**: Air resistance was only `0.01` which didn't slow down the ball enough
4. **No Initial Velocity Control**: Ball started with default physics velocity

## Solution: Multi-Layer Speed Reduction

### 1. **Reduced Engine Gravity** (70% reduction)

**File**: `physics-engine-manager.ts`

```typescript
// Before: engine.gravity.y = physicsConfig.engine.engineGravity * scaleFactor;
// After:
engine.gravity.y = physicsConfig.engine.engineGravity * scaleFactor * 0.3; // 30% of normal gravity
```

### 2. **Slowed Down Y Velocity** (80% reduction)

**File**: `collision-handler.ts`

```typescript
// Before: y: Math.max(currentVelocity.y, 1.5)
// After:
y: Math.max(currentVelocity.y, 0.3); // Much slower falling to mimic real Plinko game
```

### 3. **Increased Air Resistance** (5x increase)

**Files**: `use-ball-spawner.ts` and `physics-engine.ts`

```typescript
// Before: frictionAir: 0.01
// After: frictionAir: 0.05 // Increased air resistance for realistic falling
```

### 4. **Added Initial Slow Velocity**

**Files**: `use-ball-spawner.ts` and `physics-engine.ts`

```typescript
// Added initial slow velocity for service-guided balls
if (isServiceGuided) {
    Body.setVelocity(ball, { x: 0, y: 0.2 });
}
```

## Expected Results

With these changes, the ball should now:

1. ✅ **Fall at realistic speed** - Similar to real Plinko game
2. ✅ **Hit all peg rows properly** - Slow enough to interact with each peg
3. ✅ **Follow service path accurately** - Time to apply nudges at each row
4. ✅ **Provide better visual experience** - More engaging and realistic gameplay
5. ✅ **Maintain deterministic behavior** - Still follows service path correctly

## Technical Details

### Speed Reduction Summary:

-   **Gravity**: 1.8 → 0.54 (70% reduction)
-   **Y Velocity**: 1.5 → 0.3 (80% reduction)
-   **Air Resistance**: 0.01 → 0.05 (5x increase)
-   **Initial Velocity**: 0 → 0.2 (controlled start)

### Physics Properties for Service-Guided Balls:

-   **Restitution**: 0.1 (minimal bounce)
-   **Friction**: 0.1 (minimal friction)
-   **Air Resistance**: 0.05 (realistic air drag)
-   **Density**: 0.01 (controlled mass)
-   **Initial Y Velocity**: 0.2 (slow start)

## Files Modified

1. **`physics-engine-manager.ts`**: Reduced engine gravity by 70%
2. **`collision-handler.ts`**: Reduced Y velocity from 1.5 to 0.3
3. **`use-ball-spawner.ts`**: Increased air resistance and added initial velocity
4. **`physics-engine.ts`**: Increased air resistance and added initial velocity

## Result

The ball should now fall at a much more realistic speed that mimics a real Plinko game, allowing it to:

-   Interact properly with each peg row
-   Follow the service path more accurately
-   Provide a better visual experience
-   Still maintain deterministic behavior for correct slot landing

This creates the perfect balance between realistic physics and deterministic path following.
