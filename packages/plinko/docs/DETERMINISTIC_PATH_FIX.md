# Deterministic Path Following Fix

## Problem Analysis

Based on the logs, the main issues were:

1. **Multiple collisions on same peg**: Ball was colliding with `pin-1-1` multiple times, causing incorrect path index increments
2. **Physics interference**: Air resistance, friction, and other physics factors were interfering with deterministic path following
3. **Path index management**: The logic didn't properly prevent multiple collisions on the same row
4. **Wrong slot landing**: Balls were landing on wrong slots despite correct service path

## Solution Implementation

### 1. Simplified Physics for Service-Guided Balls

**Files Modified:**

-   `use-ball-spawner.ts`
-   `physics-engine.ts`

**Changes:**

-   Removed air resistance (`frictionAir: 0`)
-   Removed friction (`friction: 0`)
-   Removed bounce (`restitution: 0`)
-   Set minimal density (`density: 0.001`)

This ensures service-guided balls fall predictably without physics interference.

### 2. Enhanced Collision Logic

**File Modified:** `collision-handler.ts`

**Key Improvements:**

-   **Collision Cooldown**: Added 100ms cooldown to prevent multiple collisions on same peg
-   **Stronger Nudges**: Increased nudge strength from 1.5 to 3.0 for more deterministic behavior
-   **Better Path Tracking**: Enhanced logging and validation for path following
-   **Y Velocity Preservation**: Ensures ball keeps falling while applying X nudges

### 3. Path Index Management

**File Modified:** `collision-handler.ts`

**Features:**

-   **Step Tracking**: Each path step can only be applied once per row
-   **Row Validation**: Only applies guidance when ball hits the expected row for current path step
-   **Cooldown System**: Prevents rapid successive collisions on same peg
-   **Comprehensive Logging**: Detailed path execution tracking

### 4. Type System Updates

**File Modified:** `types/physics.ts`

**Added:**

-   `collisionCooldown?: Map<string, number>` to track collision timing

## Key Functions

### `handleServiceGuidedPinCollision()`

The main collision handler that:

1. Validates the peg row matches expected path step
2. Checks collision cooldown to prevent multiple hits
3. Applies deterministic velocity nudges based on service path
4. Tracks applied guidance steps
5. Increments path index for next step

### Collision Flow

```
Ball hits peg → Check row match → Check cooldown → Check if step applied → Apply nudge → Update tracking → Increment index
```

## Expected Behavior

With these changes, service-guided balls should:

1. **Fall deterministically** with no physics interference
2. **Collide exactly once per row** according to service path
3. **Apply correct direction nudges** (0 = LEFT, 1 = RIGHT)
4. **Land on the correct slot** matching the service result array
5. **Provide detailed logging** for debugging and validation

## Testing

Created comprehensive test suite in `deterministic-path-test.ts` that verifies:

-   Correct nudge application for each direction
-   Collision cooldown functionality
-   Path step tracking
-   Complete path simulation
-   Edge case handling

## Service Path Mapping

The service path array `[0,1,0,1,0,1,1,0]` should result in:

-   Step 0 (Row 1): LEFT nudge
-   Step 1 (Row 2): RIGHT nudge
-   Step 2 (Row 3): LEFT nudge
-   Step 3 (Row 4): RIGHT nudge
-   Step 4 (Row 5): LEFT nudge
-   Step 5 (Row 6): RIGHT nudge
-   Step 6 (Row 7): RIGHT nudge
-   Step 7 (Row 8): LEFT nudge

**Final slot**: 4 (count of 1s in path)

## Validation

The system now provides comprehensive logging showing:

-   Path execution progress
-   Applied guidance steps
-   Collision cooldown status
-   Final slot validation
-   Service path breakdown with step-by-step tracking

This ensures the ball always follows the exact path specified by the service result array and lands on the correct payout slot.
