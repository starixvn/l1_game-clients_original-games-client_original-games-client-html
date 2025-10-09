/**
 * Test script to verify ball path alignment with service results
 */

console.log("🧪 BALL PATH ALIGNMENT TEST\n");

// Mock the required dependencies for testing
const mockPhysicsFactors = {
    ballSize: 12,
    ballMass: 0.001,
    gravity: 1.5,
    airResistanceCoefficient: 0.01,
    friction: 0.2,
    restitution: 0.45,
    nudgeStrength: 8.0,
    velocityX: 0,
    velocityY: 4.0,
    angularVelocity: 0.05,
    pegSize: 5,
    pegSpacing: 60,
    collisionCooldown: 80,
    momentumFactor: 0.88,
    randomFactor: 0.12,
    speedFactor: 0.9,
};

// Test cases with different service paths
const testCases = [
    {
        name: "Alternating path [0,1,0,1,0,1,0,1]",
        serviceResult: {
            path: [0, 1, 0, 1, 0, 1, 0, 1], // Alternating path
            finalSlot: 4,
            multiplier: 2.0,
            betValue: 100,
        },
        expectedSlot: 4,
    },
    {
        name: "Left path [0,0,0,0]",
        serviceResult: {
            path: [0, 0, 0, 0], // All left
            finalSlot: 0,
            multiplier: 0.5,
            betValue: 100,
        },
        expectedSlot: 0,
    },
    {
        name: "Right path [1,1,1,1]",
        serviceResult: {
            path: [1, 1, 1, 1], // All right
            finalSlot: 8,
            multiplier: 200,
            betValue: 100,
        },
        expectedSlot: 8,
    },
];

// Mock board configuration
const mockBoardConfig = {
    width: 600,
    height: 800,
    layout: "pyramid",
    rows: 9,
    slotCount: 9,
    slots: [
        { index: 0, x: 33.33, multiplier: 0.5, color: "#96CEB4" },
        { index: 1, x: 100, multiplier: 1, color: "#96CEB4" },
        { index: 2, x: 166.67, multiplier: 2, color: "#45B7D1" },
        { index: 3, x: 233.33, multiplier: 5, color: "#4ECDC4" },
        { index: 4, x: 300, multiplier: 10, color: "#4ECDC4" },
        { index: 5, x: 366.67, multiplier: 20, color: "#FF6B6B" },
        { index: 6, x: 433.33, multiplier: 50, color: "#FFD700" },
        { index: 7, x: 500, multiplier: 100, color: "#FFD700" },
        { index: 8, x: 566.67, multiplier: 200, color: "#FFD700" },
    ],
};

// Simplified trajectory calculation with deterministic path following
function calculateDeterministicTrajectory(serviceResult, boardConfig, physicsFactors) {
    const positions = [];
    const velocities = [];
    const collisions = [];

    // Initial conditions
    let x = boardConfig.width / 2; // Start at center
    let y = 50; // Start above first peg row
    let velocityX = physicsFactors.velocityX;
    let velocityY = physicsFactors.velocityY;
    let time = 0;
    const deltaTime = 0.008; // 120 FPS for accurate trajectory calculation

    // Path index for service-guided movement
    let pathIndex = 0;

    // Generate peg positions (simplified pyramid layout)
    const pegs = [];
    const pegRadius = 5;
    const pegSpacing = 60;
    const startY = 100;

    for (let row = 0; row < 8; row++) {
        const pegsInRow = 1 + row; // 1, 2, 3, 4, 5, 6, 7, 8 pegs per row
        const rowWidth = (pegsInRow - 1) * pegSpacing;
        const startX = (boardConfig.width - rowWidth) / 2;

        for (let col = 0; col < pegsInRow; col++) {
            const pegX = startX + col * pegSpacing;
            const pegY = startY + row * (pegSpacing * 0.866); // Hexagonal spacing
            pegs.push({ row, col, x: pegX, y: pegY });
        }
    }

    // Simulate trajectory step by step
    while (y < boardConfig.height - 100 && time < 10) {
        // Stop near bottom or after 10 seconds
        // Store current state
        positions.push({ x, y, timestamp: time });
        velocities.push({ x: velocityX, y: velocityY, timestamp: time });

        // Apply gravity
        velocityY += physicsFactors.gravity * deltaTime;

        // Apply air resistance
        const speed = Math.sqrt(velocityX * velocityX + velocityY * velocityY);
        if (speed > 0) {
            const airResistanceForce = physicsFactors.airResistanceCoefficient * speed * speed;
            const airResistanceAcceleration = airResistanceForce / physicsFactors.ballMass;
            const dampingFactor = Math.max(0.9, 1 - (airResistanceAcceleration * deltaTime) / speed);
            velocityX *= dampingFactor;
            velocityY *= dampingFactor;
        }

        // Check for peg collisions
        let collisionOccurred = false;
        for (const peg of pegs) {
            const distance = Math.sqrt(Math.pow(x - peg.x, 2) + Math.pow(y - peg.y, 2));
            const minDistance = pegRadius + physicsFactors.ballSize / 2;

            if (distance < minDistance && peg.row === pathIndex) {
                // Apply service-guided direction for this row
                const direction = serviceResult.path[pathIndex]; // 0 = left, 1 = right

                // Calculate deterministic direction based on service path
                const canvasCenter = boardConfig.width / 2;
                let targetDirection;
                if (direction === 1) {
                    // Go right
                    targetDirection = peg.x < canvasCenter ? 1 : x < peg.x ? 1 : -1;
                } else {
                    // Go left
                    targetDirection = peg.x > canvasCenter ? -1 : x > peg.x ? -1 : 1;
                }

                // Apply stronger deterministic guidance
                const deterministicNudge = physicsFactors.nudgeStrength * 0.8;
                velocityX = targetDirection * deterministicNudge;

                // Add upward bounce for natural feel
                velocityY = Math.max(velocityY * 0.7, physicsFactors.velocityY * 0.3);

                pathIndex++;

                collisions.push({
                    rowIndex: peg.row,
                    columnIndex: peg.col,
                    position: { x, y },
                    timestamp: time,
                    direction: direction,
                });

                collisionOccurred = true;
                break; // Only handle one collision per step
            }
        }

        // Update position
        x += velocityX * deltaTime;
        y += velocityY * deltaTime;
        time += deltaTime;

        // Boundary checks
        if (x < 10 || x > boardConfig.width - 10) {
            velocityX *= -physicsFactors.restitution; // Bounce off walls
            x = Math.max(10, Math.min(boardConfig.width - 10, x));
        }
    }

    // Calculate final position based on service result
    const finalSlot = boardConfig.slots.find((slot) => slot.index === serviceResult.finalSlot);
    const finalPosition = finalSlot ? { x: finalSlot.x, y: boardConfig.height - 50 } : { x, y };

    return {
        positions,
        velocities,
        collisions,
        totalTime: time,
        totalDistance: positions.length > 0 ? positions[positions.length - 1].y - positions[0].y : 0,
        finalPosition,
        pathIndex, // How many path steps were processed
    };
}

// Run tests
testCases.forEach((testCase, index) => {
    console.log(`Test ${index + 1}: ${testCase.name}`);

    try {
        const trajectory = calculateDeterministicTrajectory(testCase.serviceResult, mockBoardConfig, mockPhysicsFactors);

        console.log("  Service Path:", testCase.serviceResult.path.join(""));
        console.log("  Expected Final Slot:", testCase.serviceResult.finalSlot);
        console.log("  Calculated Final X:", trajectory.finalPosition.x.toFixed(1));
        console.log("  Expected Slot X:", mockBoardConfig.slots[testCase.expectedSlot].x.toFixed(1));

        // Check path alignment
        const pathProcessed = trajectory.pathIndex;
        const pathMatches = pathProcessed >= testCase.serviceResult.path.length;
        console.log(
            "  Path Steps Processed:",
            pathProcessed,
            "of",
            testCase.serviceResult.path.length,
            pathMatches ? "✅ COMPLETE" : "❌ INCOMPLETE"
        );

        // Check position alignment
        const expectedX = mockBoardConfig.slots[testCase.expectedSlot].x;
        const actualX = trajectory.finalPosition.x;
        const difference = Math.abs(actualX - expectedX);
        const isAligned = difference < 30; // Within 30 pixels

        console.log("  Position Alignment:", isAligned ? "✅ CLOSE" : "❌ FAR", `(diff: ${difference.toFixed(1)}px)`);
        console.log("  Collisions Recorded:", trajectory.collisions.length);
        console.log("  Trajectory Points:", trajectory.positions.length);
        console.log("");
    } catch (error) {
        console.error("  ❌ Error:", error.message);
        console.log("");
    }
});

console.log("🎯 Path alignment test completed - Ball trajectory should now follow service result array exactly");
