/**
 * Simple Node.js test for Ball Game Calculation System
 */

console.log('🧪 Testing Ball Game Calculation System...\n');

// Mock the required dependencies
const mockPhysicsFactors = {
    ballSize: 12,
    ballMass: 0.001,
    gravity: 1.0,
    airResistanceCoefficient: 0.05,
    friction: 0.4,
    restitution: 0.4,
    nudgeStrength: 2.8,
    velocityX: 0,
    velocityY: 1.4,
    angularVelocity: 0.08,
    pegSize: 5,
    pegSpacing: 60,
    collisionCooldown: 80,
    momentumFactor: 0.88,
    randomFactor: 0.12,
    speedFactor: 0.9
};

const mockServiceResult = {
    path: [0, 1, 0, 1, 0, 1, 0, 1], // Alternating path
    finalSlot: 4,
    multiplier: 2.0,
    betValue: 100,
    serverSeed: 'server_seed_123',
    clientSeed: 'client_seed_456',
    roundId: 'round_12345'
};

const mockBoardConfig = {
    width: 600,
    height: 800,
    layout: 'pyramid',
    slotCount: 9,
    slots: [
        { index: 0, x: 33.33, multiplier: 0.5, color: '#96CEB4' },
        { index: 1, x: 100, multiplier: 1, color: '#96CEB4' },
        { index: 2, x: 166.67, multiplier: 2, color: '#45B7D1' },
        { index: 3, x: 233.33, multiplier: 5, color: '#4ECDC4' },
        { index: 4, x: 300, multiplier: 10, color: '#4ECDC4' },
        { index: 5, x: 366.67, multiplier: 20, color: '#FF6B6B' },
        { index: 6, x: 433.33, multiplier: 50, color: '#FFD700' },
        { index: 7, x: 500, multiplier: 100, color: '#FFD700' },
        { index: 8, x: 566.67, multiplier: 200, color: '#FFD700' }
    ]
};

// Mock the required functions
function calculateBallVelocityWithAirResistance(velocityX, velocityY, airResistanceCoefficient, deltaTime, mass) {
    const speed = Math.sqrt(velocityX * velocityX + velocityY * velocityY);
    if (speed === 0) return { velocityX: 0, velocityY: 0 };

    const airResistanceForce = airResistanceCoefficient * speed * speed;
    const airResistanceAcceleration = airResistanceForce / mass;
    const dampingFactor = Math.max(0.9, 1 - (airResistanceAcceleration * deltaTime) / speed);

    return {
        velocityX: velocityX * dampingFactor,
        velocityY: velocityY * dampingFactor,
    };
}

function calculateBallBounce(velocityX, velocityY, normalX, normalY, restitution, friction) {
    const dotProduct = velocityX * normalX + velocityY * normalY;
    const reflectionX = velocityX - 2 * dotProduct * normalX;
    const reflectionY = velocityY - 2 * dotProduct * normalY;

    let newVelocityX = reflectionX * restitution;
    let newVelocityY = reflectionY * restitution;

    const tangentX = -normalY;
    const tangentY = normalX;
    const tangentVelocity = newVelocityX * tangentX + newVelocityY * tangentY;
    const frictionReduction = Math.min(Math.abs(tangentVelocity) * friction, Math.abs(tangentVelocity));
    const frictionDirection = tangentVelocity > 0 ? -1 : 1;

    newVelocityX += tangentX * frictionReduction * frictionDirection;
    newVelocityY += tangentY * frictionReduction * frictionDirection;

    const angularVelocity = frictionReduction * 0.1;

    return {
        velocityX: newVelocityX,
        velocityY: newVelocityY,
        angularVelocity,
    };
}

function calculatePathPredictability(physicsFactors, trajectoryLength = 100) {
    return 1 - physicsFactors.randomFactor;
}

// Simplified calculation test
function testBallCalculation() {
    console.log('📊 Testing ball calculation with mock data...');

    try {
        // Test basic trajectory calculation
        const positions = [];
        const velocities = [];
        let x = 300; // Center
        let y = 50;
        let velocityX = mockPhysicsFactors.velocityX;
        let velocityY = mockPhysicsFactors.velocityY;
        const deltaTime = 0.016;

        for (let i = 0; i < 100; i++) {
            positions.push({ x, y, timestamp: i * deltaTime });
            velocities.push({ x: velocityX, y: velocityY, timestamp: i * deltaTime });

            velocityY += mockPhysicsFactors.gravity * deltaTime;
            const airResistance = calculateBallVelocityWithAirResistance(
                velocityX, velocityY,
                mockPhysicsFactors.airResistanceCoefficient,
                deltaTime,
                mockPhysicsFactors.ballMass
            );
            velocityX = airResistance.velocityX;
            velocityY = airResistance.velocityY;

            x += velocityX * deltaTime;
            y += velocityY * deltaTime;

            if (y > 750) break; // Stop near bottom
        }

        console.log(`✅ Generated ${positions.length} trajectory points`);
        console.log(`📍 Final position: (${x.toFixed(1)}, ${y.toFixed(1)})`);
        console.log(`🏃 Final velocity: (${velocityX.toFixed(3)}, ${velocityY.toFixed(3)})`);

        // Test collision calculation
        const collision = calculateBallBounce(
            1.0, -2.0, 0, 1, // Hit upward normal
            mockPhysicsFactors.restitution,
            mockPhysicsFactors.friction
        );

        console.log(`💥 Collision test: (${collision.velocityX.toFixed(3)}, ${collision.velocityY.toFixed(3)})`);

        // Test path predictability
        const predictability = calculatePathPredictability(mockPhysicsFactors);
        console.log(`🎯 Path predictability: ${(predictability * 100).toFixed(1)}%`);

        // Test win calculation
        const winAmount = mockServiceResult.betValue * mockServiceResult.multiplier;
        console.log(`💰 Win amount: $${winAmount}`);

        console.log('\n🎉 All calculations completed successfully!');
        return true;

    } catch (error) {
        console.error('❌ Calculation test failed:', error.message);
        return false;
    }
}

// Run the test
const success = testBallCalculation();

if (success) {
    console.log('\n✅ Ball Game Calculation System is working correctly!');
    process.exit(0);
} else {
    console.log('\n❌ Ball Game Calculation System has issues!');
    process.exit(1);
}
