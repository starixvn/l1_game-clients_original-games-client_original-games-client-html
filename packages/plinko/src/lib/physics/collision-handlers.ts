import { Body, Engine } from 'matter-js';
import { logger } from '../../services/logger';

/**
 * Collision Handlers Module
 * Handles all collision detection and response logic for the Plinko game
 */

// Extend Body interface to include custom properties
interface ExtendedBody extends Body {
    isRemoved?: boolean;
}

interface BallBodyExtension {
    isServiceGuided?: boolean;
    isRemoved?: boolean; // Flag to prevent re-processing removed balls
    createdAt?: number; // Timestamp when ball was created
}

export interface SlotLayout {
    startX: number;
    slotWidth: number;
    slotHeight: number;
    bottomMargin: number;
    multipliers: number[];
}

export interface AnimationState {
    offsetY: number;
    startTime: number;
    duration: number;
    type: 'slotBounce';
}

export interface CollisionHandlerOptions {
    slotLayout?: SlotLayout;
    canvasHeight?: number;
    onBallHit?: (multiplier: number, betValue: number) => void;
    collisionTime?: number;
    lastLogTimeRef?: { current: number };
    animationState?: Map<string, AnimationState>;
}

/**
 * Apply random deflection to ball after peg collision for unpredictable bounce patterns
 * This ensures 50% chance of left/right deflection while maintaining physics realism
 *
 * @param ballBody - The ball physics body that hit a peg
 * @param deflectionStrength - How strong the random deflection should be (0.1-0.3 recommended)
 */
export function applyRandomPegDeflection(ballBody: Body, deflectionStrength: number = 0.2): void {
    // Add random horizontal velocity component
    const randomDirection = Math.random() < 0.5 ? -1 : 1; // 50% left, 50% right
    const randomForce = randomDirection * deflectionStrength * (Math.random() * 0.5 + 0.75); // 0.75-1.25x strength

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
    const winAmount = ballValue * multiplierValue;
    const slotId = slotBody.label; // Use full label as unique identifier

    logger.debug('💥 [COLLISION_HANDLERS] Collision data extracted', {
        ballId: ballBody.id,
        slotId,
        multiplierValue: multiplierValue.toFixed(1),
        ballValue: ballValue.toFixed(2),
        winAmount: winAmount.toFixed(2),
        calculation: `${ballValue.toFixed(2)} * ${multiplierValue.toFixed(1)} = ${winAmount.toFixed(2)}`
    });

    // Call the callback to notify parent component about the win
    if (options.onBallHit) {
        logger.debug('💥 [COLLISION_HANDLERS] Calling onBallHit callback', {
            ballId: ballBody.id,
            multiplierValue: multiplierValue.toFixed(1),
            ballValue: ballValue.toFixed(2),
            winAmount: winAmount.toFixed(2)
        });
        options.onBallHit(multiplierValue, ballValue);
    } else {
        logger.warn('💥 [COLLISION_HANDLERS] No onBallHit callback provided', {
            ballId: ballBody.id,
            multiplierValue: multiplierValue.toFixed(1),
            ballValue: ballValue.toFixed(2)
        });
    }

    // Log the collision (throttled to prevent spam)
    if (options.collisionTime && options.lastLogTimeRef && options.collisionTime - options.lastLogTimeRef.current > 200) {
        logger.info('💥 [COLLISION_HANDLERS] Ball payout collision (throttled log)', {
            ballId: ballBody.id,
            ballValue: `$${ballValue.toFixed(2)}`,
            multiplierValue: `${multiplierValue.toFixed(1)}x`,
            winAmount: `$${winAmount.toFixed(2)}`,
            collisionTime: options.collisionTime,
            lastLogTime: options.lastLogTimeRef.current
        });
        options.lastLogTimeRef.current = options.collisionTime;
    }

    // === BALL REMOVAL ===
    // Immediately remove ball after hitting payout (no bounce animation)
    logger.info('💥 [COLLISION_HANDLERS] Starting ball removal process', {
        ballId: ballBody.id,
        multiplier: multiplierValue.toFixed(1),
        winAmount: winAmount.toFixed(2),
        slotId,
        worldBodiesBefore: engine.world.bodies.length
    });

    // Mark ball as removed to prevent re-processing
    const ballExtension = ballBody as Body & BallBodyExtension;
    ballExtension.isRemoved = true;

    logger.debug('💥 [COLLISION_HANDLERS] Ball marked as removed', {
        ballId: ballBody.id,
        isRemoved: ballExtension.isRemoved
    });

    // Make ball completely invisible and remove from physics immediately
    ballBody.render.visible = false;
    ballBody.render.opacity = 0;
    ballBody.isSensor = true; // Make it not collide with anything
    ballBody.isStatic = true; // Stop it from moving

    logger.debug('💥 [COLLISION_HANDLERS] Ball made invisible and static', {
        ballId: ballBody.id,
        visible: ballBody.render.visible,
        opacity: ballBody.render.opacity,
        isSensor: ballBody.isSensor,
        isStatic: ballBody.isStatic
    });

    // Note: Ball removal from physics world is handled immediately in collision detection
    // to prevent collision loops. This function only handles visual effects and cleanup.

    // Force Matter.js to update its internal state immediately
    Engine.update(engine, 16.666); // Update for ~60fps

    logger.debug('💥 [COLLISION_HANDLERS] Physics engine updated', {
        ballId: ballBody.id,
        updateTime: '16.666ms'
    });

    // Force clear any cached references to prevent collision loops
    if (ballBody.parts) {
        ballBody.parts.length = 0;
        logger.debug('💥 [COLLISION_HANDLERS] Ball parts cleared', {
            ballId: ballBody.id,
            partsLength: ballBody.parts.length
        });
    }

    logger.info('💥 [COLLISION_HANDLERS] Ball removal completed', {
        ballId: ballBody.id,
        worldBodiesAfter: engine.world.bodies.length,
        ballStillInWorld: engine.world.bodies.some(b => b.id === ballBody.id),
        ballVisible: ballBody.render.visible,
        ballOpacity: ballBody.render.opacity,
        ballRemoved: ballExtension.isRemoved
    });

    // Double-check removal by logging all remaining bodies
    if (engine.world && typeof engine.world.bodies !== 'undefined') {
        const remainingBalls = engine.world.bodies.filter(b => b.label && b.label.includes('ball'));
        logger.debug('💥 [COLLISION_HANDLERS] Remaining balls in world', {
            ballId: ballBody.id,
            remainingBallsCount: remainingBalls.length,
            remainingBalls: remainingBalls.map(b => ({
                id: b.id,
                label: b.label,
                position: { x: Math.round(b.position.x), y: Math.round(b.position.y) },
                isRemoved: (b as ExtendedBody).isRemoved
            }))
        });
    }

    // === SLOT VISUAL BOUNCE ANIMATION ===
    // Animate slot visually without moving physics body (keeps text rendering stable)
    if (options.animationState) {
        const slotBounceDistance = 15 + Math.random() * 10; // 15-25 pixels down
        const slotBounceDuration = 300; // ms

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
