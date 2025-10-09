<!-- @format -->

# **📚 Ball Layout Directory Documentation**

## **📁 Directory Overview**

The `ball-layout/` directory contains components for rendering the Plinko game's ball layout. This directory has evolved from a DOM-based approach to a modern canvas-based physics simulation.

---

## **📂 Directory Structure**

```
ball-layout/
├── 📄 CanvasBallLayout.tsx     (26KB, 620 lines) - Main canvas physics component
├── 📄 index.ts                 (223B, 5 lines)   - Export declarations
├── 📄 Ball.tsx                 (515B, 20 lines)  - Legacy DOM ball component
├── 📄 Ball.module.scss         (25KB, 1,323 lines) - Legacy ball styling
├── 📄 BallRow.tsx              (522B, 22 lines)  - Legacy row component
└── 📄 BallRow.module.scss      (1.7KB, 99 lines) - Legacy row styling
```

---

## **🎯 Component Overview**

### **1. CanvasBallLayout.tsx - Main Physics Component**

#### **Purpose:**

The primary component that renders the Plinko game using HTML5 Canvas and Matter.js physics engine. This is the **currently active component** used in the game.

#### **Key Features:**

-   **Physics Simulation**: Uses Matter.js for realistic ball physics
-   **Dynamic Layout**: Adapts pin and slot positions to fill canvas dimensions
-   **Collision Detection**: Detects when balls hit multiplier slots
-   **Responsive Design**: Scales with container size changes
-   **Performance Optimized**: Efficient rendering and memory management

#### **Props Interface:**

```typescript
interface BallLayoutProps {
    rows: number; // Number of pin rows
    ballsPerRow?: number[]; // Legacy prop (not used)
    multipliers?: number[]; // Payout multipliers for slots
    onBallHit?: (multiplier: number, betValue: number) => void; // Win callback
}
```

#### **Ref Interface:**

```typescript
interface CanvasBallLayoutRef {
    spawnBall: (betValue?: number) => void; // External ball spawning method
}
```

#### **Physics Configuration:**

```typescript
const physicsConfig = {
    pins: { startPins: 3, pinSize: 2, pinGap: 20 },
    ball: { ballSize: 5.7 },
    engine: { engineGravity: 1.8 },
    world: { width: 400, height: 400 },
    colors: {
        background: "#1a1a2e",
        ball: "#ff6b6b",
        pin: "#F5DCFF",
        multiplierHigh: "#ffd700", // Gold for high multipliers
        multiplierMedium: "#ff6b6b", // Red for medium
        multiplierLow: "#4ecdc4", // Teal for low
        multiplierLoss: "#666", // Gray for loss
    },
};
```

#### **Core Methods:**

##### **spawnBall(betValue?: number)**

-   Spawns a physics ball at the top of the canvas
-   Random horizontal position across full canvas width
-   Ball size scales with canvas dimensions
-   Bet value encoded in ball label for payout calculation

##### **Layout Calculation Algorithm:**

1. **Dynamic Pin Spacing**: Calculates optimal gap to fill canvas
2. **Vertical Distribution**: Spaces pin rows evenly across available height
3. **Horizontal Centering**: Centers pin layout within canvas bounds
4. **Slot Positioning**: Places multiplier slots at bottom using full width

##### **Collision Detection:**

```typescript
Events.on(engine, "collisionActive", (event) => {
    for (const pair of event.pairs) {
        const { bodyA, bodyB } = pair;
        if (bodyB.label.includes("ball") && bodyA.label.includes("multiplier")) {
            const multiplier = parseFloat(bodyA.label.split("-")[1]);
            const betValue = parseFloat(bodyB.label.split("-")[1]) || 1;

            // Trigger win callback to parent component
            if (onBallHit) onBallHit(multiplier, betValue);

            // Remove ball from physics world after brief delay
            setTimeout(() => World.remove(engine.world, bodyB), 100);
        }
    }
});
```

#### **Performance Optimizations:**

-   **Memoized Functions**: Drawing functions use `useCallback`
-   **Efficient Re-renders**: Optimized `useEffect` dependencies
-   **Memory Management**: Proper cleanup of Matter.js instances
-   **Debounced Logging**: Prevents console spam during collisions

#### **Responsive Features:**

-   **ResizeObserver**: Detects container dimension changes
-   **Dynamic Scaling**: All physics elements scale with canvas size
-   **Smooth Transitions**: CSS transitions for layout changes
-   **Fallback Rendering**: Manual canvas creation if Matter.js fails

---

### **2. Ball.tsx & Ball.module.scss - Legacy DOM Components**

#### **Status:** ⚠️ **DEPRECATED - Not Currently Used**

#### **Purpose:**

Original DOM-based ball rendering system before canvas implementation.

#### **Structure:**

```typescript
interface BallProps {
    sizeClass: string; // CSS class for ball size
    typeClass: string; // CSS class for ball appearance
    multiplier?: number; // Optional multiplier display
    payoutClass?: string; // Optional payout styling
}

const Ball: React.FC<BallProps> = ({ sizeClass, typeClass, multiplier, payoutClass }) => (
    <div className={`${sizeClass} ${payoutClass || ""}`.trim()}>
        <div className={typeClass} />
        {multiplier && multiplier !== 1 && <div className="ball-multiplier">{multiplier.toFixed(1)}x</div>}
    </div>
);
```

#### **SCSS Complexity:**

-   **1,323 lines** of complex styling
-   Image-based ball sprites from external URLs
-   Multiple size variations (ball-size-13, ball-size-15, etc.)
-   Various ball types and animations
-   Responsive breakpoints

#### **Legacy Issues:**

-   Heavy DOM manipulation for physics simulation
-   Poor performance with many balls
-   Limited visual customization
-   Difficult to maintain and extend

---

### **3. BallRow.tsx & BallRow.module.scss - Legacy Row Components**

#### **Status:** ⚠️ **DEPRECATED - Not Currently Used**

#### **Purpose:**

Component for rendering rows of balls in the original DOM-based layout.

#### **Structure:**

```typescript
interface BallRowProps {
    balls: Array<{
        sizeClass: string;
        typeClass: string;
    }>;
    rowClass: string;
}

const BallRow: React.FC<BallRowProps> = ({ balls, rowClass }) => (
    <div className={rowClass}>
        {balls.map((ball, index) => (
            <Ball key={`ball-${index}`} {...ball} />
        ))}
    </div>
);
```

---

### **4. index.ts - Export Configuration**

#### **Exports:**

```typescript
export { default as Ball } from "./Ball"; // Legacy
export { default as BallRow } from "./BallRow"; // Legacy
export { default as CanvasBallLayout } from "./CanvasBallLayout"; // Active
export type { CanvasBallLayoutRef } from "./CanvasBallLayout"; // Active
```

---

## **🔄 Architecture Evolution**

### **Phase 1: DOM-Based (Legacy)**

-   Used `Ball.tsx` + `BallRow.tsx` components
-   CSS animations and positioning
-   Limited physics simulation
-   Poor performance with many elements

### **Phase 2: Canvas Physics (Current)**

-   Single `CanvasBallLayout.tsx` component
-   Matter.js physics engine
-   Hardware-accelerated rendering
-   Real-time collision detection
-   Dynamic layout adaptation

---

## **🎮 Usage in Main Application**

```typescript
// In pages/index.tsx
<BallLayout
    ref={ballLayoutRef}
    rows={gameState.rows}
    multipliers={payoutMultipliers}
    probabilities={payoutProbabilities}
    betAmount={gameState.betAmount}
    onBallHit={handleBallHit}
/>;

// External ball spawning
ballLayoutRef.current?.spawnBall(gameState.betAmount);
```

---

## **🔧 Key Technical Features**

### **Physics Engine Integration:**

-   **Matter.js**: 2D physics simulation library
-   **Real-time Rendering**: 60 FPS canvas updates
-   **Collision Detection**: Precise ball-slot interactions
-   **Gravity Simulation**: Realistic ball trajectories

### **Dynamic Layout System:**

-   **Responsive Pin Distribution**: Adapts to any canvas size
-   **Optimal Spacing**: Mathematical calculations for best visual balance
-   **Full Canvas Utilization**: Uses 95% of available width and height

### **Performance Characteristics:**

-   **Memory Efficient**: Proper cleanup and resource management
-   **CPU Optimized**: Minimal re-renders and calculations
-   **Scalable**: Handles various game configurations smoothly

### **Error Handling:**

-   **Fallback Rendering**: Manual canvas creation if needed
-   **Graceful Degradation**: Continues working with partial failures
-   **Debug Logging**: Comprehensive console output for development

---

## **🚀 Future Development Notes**

### **CanvasBallLayout Enhancements:**

-   Custom particle effects for wins
-   Sound integration for collisions
-   Advanced visual effects (glows, trails)
-   Performance monitoring and optimization

### **Legacy Component Cleanup:**

-   Remove deprecated `Ball.tsx`, `BallRow.tsx` and associated SCSS
-   Simplify `index.ts` exports
-   Archive legacy code for reference

---

## **📊 Component Metrics**

| Component              | Status    | Lines | Size  | Complexity     |
| ---------------------- | --------- | ----- | ----- | -------------- |
| `CanvasBallLayout.tsx` | ✅ Active | 620   | 26KB  | High (Physics) |
| `Ball.tsx`             | ⚠️ Legacy | 20    | 515B  | Low            |
| `BallRow.tsx`          | ⚠️ Legacy | 22    | 522B  | Low            |
| `index.ts`             | ✅ Active | 5     | 223B  | Low            |
| `Ball.module.scss`     | ⚠️ Legacy | 1,323 | 25KB  | High (Styling) |
| `BallRow.module.scss`  | ⚠️ Legacy | 99    | 1.7KB | Medium         |

---

## **🎯 Complete Ball Workflow: Start Bet to Win Message**

### **📋 Full Ball Journey Overview**

The ball workflow represents the complete user experience from bet initiation to win celebration, involving multiple components and systems working together seamlessly.

---

### **🔄 Step-by-Step Ball Workflow**

#### **1. Bet Initiation - User Action**

```typescript
// User clicks "SPAWN BALL ($10000)" button in pages/index.tsx
<button onClick={() => ballLayoutRef.current?.spawnBall(gameState.betAmount)}>SPAWN BALL (${gameState.betAmount})</button>
```

#### **2. Ball Creation - CanvasBallLayout.spawnBall()**

```typescript
// Method called on CanvasBallLayout ref
const spawnBall = (betValue: number = 1) => {
    // Calculate spawn position (full width coverage)
    const spawnMargin = canvasWidth * 0.05;
    const minBallX = spawnMargin;
    const maxBallX = canvasWidth - spawnMargin;
    const ballX = Math.random() * (maxBallX - minBallX) + minBallX;

    // Create physics ball with encoded bet value
    const ball = Bodies.circle(ballX, 30, ballSize, {
        restitution: 1, // Bouncy physics
        friction: 0.6, // Surface friction
        label: `ball-${betValue}`, // Encoded bet value
        frictionAir: 0.05, // Air resistance
        render: {
            fillStyle: ballColor, // Visual styling
        },
        isStatic: false,
    });

    // Add to physics world
    Composite.add(engineRef.current.world, ball);
};
```

#### **3. Physics Simulation - Matter.js Engine**

```typescript
// Ball enters physics simulation
// Gravity: engine.gravity.y = 1.0 (scaled)
// Ball falls through pin layout with realistic physics
// Collisions with pins cause randomized bouncing
// Air resistance and friction affect trajectory
```

#### **4. Pin Interactions - Dynamic Bouncing**

```typescript
// Ball collides with triangular pin layout
// Each pin collision: randomized bounce direction
// Physics calculations determine new velocity vectors
// Ball path becomes increasingly unpredictable with each row

// Pin layout dynamically calculated for full canvas coverage:
// - Vertical spacing: availableHeight / (rows + 1)
// - Horizontal centering: (canvasWidth - lineWidth) / 2
// - Progressive complexity: More pins per row downward
```

#### **5. Bottom Row Collision - Win Determination**

```typescript
// Ball reaches multiplier slots at bottom
// Slot layout: Full width coverage, centered positioning
// Available slots: Based on multipliers array length

// Example multiplier slots:
// Row 1: [2.1x, 1.8x, 1.4x, 1.1x, 0.8x, 0.5x, 0.2x, 0.1x]
// Row 2: [5.0x, 2.0x, 1.5x, 1.2x, 1.0x, 0.7x, 0.3x, 0.1x]
// Row 3: [10x, 5.0x, 2.0x, 1.5x, 1.2x, 0.8x, 0.3x, 0.1x]
```

#### **6. Collision Detection - Win Trigger**

```typescript
// Real-time collision monitoring
Events.on(engine, "collisionActive", (event) => {
    for (const pair of event.pairs) {
        const { bodyA, bodyB } = pair;

        // Check for ball hitting multiplier slot
        if (bodyB.label.includes("ball") && bodyA.label.includes("multiplier")) {
            // Extract values from physics body labels
            const multiplier = parseFloat(bodyA.label.split("-")[1]); // e.g., "multiplier-2.1" → 2.1
            const betValue = parseFloat(bodyB.label.split("-")[1]) || 1; // e.g., "ball-10000" → 10000

            // Trigger win callback to parent component
            if (onBallHit) {
                onBallHit(multiplier, betValue);
            }

            // Remove ball from physics world after brief delay
            setTimeout(() => World.remove(engine.world, bodyB), 100);
        }
    }
});
```

#### **7. Win Processing - Parent Component**

```typescript
// In pages/index.tsx - handleBallHit callback
const handleBallHit = (multiplier: number, betValue: number) => {
    const payout = betValue * multiplier;
    const message = `🎯 Ball ($${betValue}) hit ${multiplier}x slot! Payout: $${payout.toFixed(2)}`;

    // Update win message state
    setWinMessage({
        isVisible: true,
        multiplier,
        betAmount: betValue,
        message,
    });

    // Update game state with win amount
    setGameState((prev) => ({
        ...prev,
        currentWin: payout,
    }));
};
```

#### **8. Win Message Display - Animated Celebration**

```typescript
// WinMessage component receives win data
<WinMessage
    isVisible={winMessage.isVisible}
    message={winMessage.message}
    multiplier={winMessage.multiplier}
    betAmount={winMessage.betAmount}
    onAnimationEnd={handleWinMessageEnd}
/>

// Animation sequence:
// 1. Enter: 0.5s - Slide up and scale in
// 2. Show: 2.0s - Pulsing scale animation
// 3. Exit: 0.5s - Slide up and fade out
// 4. Hide: Auto-hide after 3 seconds total
```

---

### **🎮 Complete User Experience Flow**

#### **Visual Timeline:**

```
0.0s: User clicks "SPAWN BALL ($10000)"
0.0s: Ball appears at random top position
0.1s: Ball begins falling with physics
0.5s: Ball hits first row of pins, bounces
1.0s: Ball navigates through pin layout, path randomizes
2.0s: Ball reaches bottom row, approaches multiplier slots
2.5s: Ball collides with multiplier slot (e.g., 2.1x slot)
2.5s: Win message appears: "🎯 Ball ($10000) hit 2.1x slot! Payout: $21000.00"
2.5s: Ball disappears from canvas
3.0s: Win message begins exit animation
3.5s: Win message fully disappears
```

#### **Data Flow:**

```
User Click → Button Handler → CanvasBallLayout.spawnBall()
    ↓
Ball Creation → Physics World → Pin Collisions → Path Randomization
    ↓
Bottom Row → Slot Collision → Collision Detection → onBallHit Callback
    ↓
Win Processing → State Updates → WinMessage Display → Animation Sequence
    ↓
Celebration → Auto-hide → Reset for Next Bet
```

---

### **🔧 Technical Implementation Details**

#### **Physics Parameters:**

-   **Gravity**: `1.0` (scaled with canvas size)
-   **Ball Restitution**: `1.0` (perfectly bouncy)
-   **Friction**: `0.6` (surface interaction)
-   **Air Resistance**: `0.05` (trajectory smoothing)

#### **Layout Calculations:**

-   **Canvas Utilization**: 95% width, 92% height
-   **Pin Distribution**: Even spacing across available area
-   **Slot Positioning**: Full width coverage at bottom
-   **Responsive Scaling**: All elements scale with canvas size

#### **Performance Optimizations:**

-   **Debounced Logging**: Prevents console spam
-   **Efficient Cleanup**: Proper physics world management
-   **Memory Management**: Automatic ball removal after wins
-   **Smooth Animations**: Hardware-accelerated CSS transitions

---

### **🎯 Win Probability & Fairness**

#### **Randomization Factors:**

-   **Initial Position**: Random horizontal spawn across full width
-   **Pin Collisions**: Each pin hit introduces randomness
-   **Bounce Physics**: Realistic physics-based trajectory changes
-   **Progressive Complexity**: More pins = more randomization per row

#### **Probability Distribution:**

-   **Slot Probabilities**: Dynamically calculated based on game mode
-   **Fair Randomization**: Physics-based path determination
-   **Unpredictable Outcomes**: Each ball has unique trajectory
-   **Balanced Distribution**: Probabilities favor center slots appropriately

---

### **🚀 Advanced Features**

#### **Multi-Ball Support:**

-   Up to 15 concurrent balls supported
-   Independent physics simulation for each
-   Individual win tracking and messaging
-   Performance optimized for multiple balls

#### **Real-time Updates:**

-   Live collision detection
-   Immediate win notifications
-   Dynamic payout calculations
-   Responsive UI feedback

#### **Error Handling:**

-   Fallback ball creation if physics fails
-   Graceful degradation for edge cases
-   Comprehensive logging for debugging
-   Automatic cleanup on component unmount

---

## **🎯 Current State Summary**

**Active Component:** `CanvasBallLayout.tsx` - Full-featured physics-based Plinko game
**Legacy Components:** `Ball.tsx`, `BallRow.tsx`, `*.module.scss` - DOM-based approach (deprecated)
**Architecture:** Hybrid approach with physics simulation driving canvas rendering
**Performance:** Optimized for smooth 60 FPS gameplay with real-time physics

The ball-layout directory represents the evolution from basic DOM manipulation to advanced canvas-based physics simulation, providing a smooth and engaging Plinko gaming experience. 🎮✨🎯
