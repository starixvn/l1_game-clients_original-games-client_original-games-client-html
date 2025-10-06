import { Body, Engine } from 'matter-js';
import { BallBodyExtension, CollisionHandlerOptions } from '../../types/physics';
import { COLLISION_CONSTANTS } from './constants/collision-constants';
import { ANIMATION_CONSTANTS } from './constants/animation-constants';


/**
 * Collision Handlers Module
 * Handles all collision detection and response logic for the Plinko game
 */

/**
 * Apply random deflection to ball after peg collision for unpredictable bounce patterns
 * This ensures 50% chance of left/right deflection while maintaining physics realism
 *
 * @param ballBody - The ball physics body that hit a peg
 * @param deflectionStrength - How strong the random deflection should be (0.1-0.3 recommended)
 */
export function applyRandomPegDeflection(ballBody: Body, deflectionStrength: number = COLLISION_CONSTANTS.DEFLECTION.DEFAULT_STRENGTH): void {
    // Add random horizontal velocity component
    const randomDirection = Math.random() < COLLISION_CONSTANTS.PROBABILITIES.DEFLECTION_DIRECTION ? -1 : 1; // 50% left, 50% right
    const randomForce = randomDirection * deflectionStrength * (Math.random() * COLLISION_CONSTANTS.DEFLECTION.RANDOM_FORCE_RANGE + COLLISION_CONSTANTS.DEFLECTION.RANDOM_FORCE_MIN); // 0.75-1.25x strength

    // Apply the random force perpendicular to gravity (horizontal)
    Body.applyForce(ballBody, ballBody.position, {
        x: randomForce,
        y: 0 // No vertical force, let gravity handle falling
    });
}

/**
 * Handle ball collision with payout slot - provides bounce animations and win feedback
 * @param ballBody - The ball physics body that hit the slot
 * @param slotBody - The payout slot physics body that was hit
 * @param engine - Matter.js engine for physics manipulation
 * @param options - Additional options for collision handling
 */
export function handleBallPayoutCollision(
    ballBody: Body,
    slotBody: Body,
    engine: Engine,
    options: CollisionHandlerOptions = {}
): void {
    // Extract collision data from physics body labels
    const multiplierValue = parseFloat(slotBody.label.split('-')[1]);
    const ballValue = parseFloat(ballBody.label.split('-')[1]) || 1;
    const slotId = slotBody.label; // Use full label as unique identifier

    // Call the callback to notify parent component about the win
    if (options.onBallHit) {
        options.onBallHit(multiplierValue, ballValue);
    }

    // Log the collision (throttled to prevent spam)
    if (options.collisionTime && options.lastLogTimeRef && options.collisionTime - options.lastLogTimeRef.current > COLLISION_CONSTANTS.TIMING.LOG_THROTTLE_MS) {
        options.lastLogTimeRef.current = options.collisionTime;
    }

    // === BALL REMOVAL ===
    // Immediately remove ball after hitting payout (no bounce animation)

    // Mark ball as removed to prevent re-processing
    const ballExtension = ballBody as Body & BallBodyExtension;
    ballExtension.isRemoved = true;

    // Make ball completely invisible and remove from physics immediately
    ballBody.render.visible = false;
    ballBody.render.opacity = 0;
    ballBody.isSensor = true; // Make it not collide with anything
    ballBody.isStatic = true; // Stop it from moving

    // Note: Ball removal from physics world is handled immediately in collision detection
    // to prevent collision loops. This function only handles visual effects and cleanup.

    // Force Matter.js to update its internal state immediately
    Engine.update(engine, 16.666); // Update for ~60fps

    // Force clear any cached references to prevent collision loops
    if (ballBody.parts) {
        ballBody.parts.length = 0;
    }

    // Double-check removal by logging all remaining bodies
    if (engine.world?.bodies) {
        engine.world.bodies.filter(b => b.label?.includes('ball'));
    }

    // === SLOT VISUAL BOUNCE ANIMATION ===
    // Animate slot visually without moving physics body (keeps text rendering stable)
    if (options.animationState) {
        const slotBounceDistance = ANIMATION_CONSTANTS.SLOT_BOUNCE.MIN_DISTANCE + Math.random() * ANIMATION_CONSTANTS.SLOT_BOUNCE.DISTANCE_RANDOM_RANGE; // 15-25 pixels down
        const slotBounceDuration = ANIMATION_CONSTANTS.SLOT_BOUNCE.DURATION_MS; // ms

        // Start visual bounce animation
        options.animationState.set(slotId, {
            offsetY: 0, // Start at 0 offset
            startTime: Date.now(),
            duration: slotBounceDuration,
            type: 'slotBounce'
        });

        // Animate slot visual bounce (separated function to avoid nesting)
        const startBounceAnimation = () => {
            const animateSlotVisualBounce = () => {
                const animData = options.animationState?.get(slotId);
                if (!animData || animData.type !== 'slotBounce') return;

                const elapsed = Date.now() - animData.startTime;
                const progress = Math.min(elapsed / animData.duration, 1);

                if (progress < 1) {
                    // Spring-like easing (easeInOutElastic approximation)
                    const springFactor = Math.sin(progress * Math.PI * 2) * Math.pow(1 - progress, 3);
                    const springOffset = springFactor * slotBounceDistance;

                    // Update visual offset (used in rendering)
                    animData.offsetY = springOffset;

                    requestAnimationFrame(animateSlotVisualBounce);
                } else {
                    // Animation complete - remove from animation state
                    options.animationState?.delete(slotId);
                }
            };

            // Start visual slot bounce animation
            animateSlotVisualBounce();
        };

        startBounceAnimation();
    }
}
