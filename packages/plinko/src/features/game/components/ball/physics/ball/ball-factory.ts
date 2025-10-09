import { Bodies, Body, Composite, Engine } from 'matter-js';
import { physicsLogger } from '../../physics';
import { logger } from '../../../../../../services/logger';
import { BallBodyExtension } from '../../../../../../types/physics';
import { BallGameCalculation } from '../calculations/ball-game-calculation';
import { physicsConfig, getMiddleDropPosition } from '../../physics';

export interface BallCreationOptions {
    calculation: BallGameCalculation;
    numberOfRows: number;
    canvasWidth: number;
    engine: Engine;
    roundId?: number;
}

/**
 * Factory class for creating balls with pre-calculated physics properties
 */
export class BallFactory {
    /**
     * Create a ball with pre-calculated physics properties
     */
    static createBallWithCalculation(options: BallCreationOptions): void {
        const { calculation, numberOfRows, canvasWidth, engine } = options;

        physicsLogger?.info('🏀 BALL CREATION: Starting enhanced ball creation', {
            component: 'BallFactory',
            function: 'createBallWithCalculation',
            metadata: {
                calculationId: calculation.id,
                betValue: calculation.serviceResult.betValue,
                pathLength: calculation.serviceResult.path.length,
                finalSlot: calculation.expectedFinalSlot,
                winAmount: calculation.winAmount
            }
        });

        // Use pre-calculated ball properties
        const ballRadius = calculation.ballProperties.radius;
        const ballX = getMiddleDropPosition(canvasWidth);
        const ballColor = calculation.serviceResult.betValue <= 0 ? physicsConfig.colors.multiplierLoss : physicsConfig.colors.ball;

        // Create ball with pre-calculated physics properties
        const ball = Bodies.circle(ballX, 30, ballRadius, {
            restitution: Math.max(0.1, Math.min(0.9, calculation.physicsFactors.restitution)),
            friction: Math.max(0.1, Math.min(0.8, calculation.physicsFactors.friction)),
            frictionAir: Math.max(0.01, Math.min(0.2, calculation.physicsFactors.airResistanceCoefficient)),
            density: Math.max(0.001, Math.min(0.05, calculation.ballProperties.mass / (Math.PI * ballRadius * ballRadius))),
            render: {
                fillStyle: ballColor,
                strokeStyle: "#FFD700",
                lineWidth: 1,
            },
            label: "pre-calculated-ball",
            isStatic: false,
        });

        // Extend ball with calculation data
        const ballExtension = ball as unknown as BallBodyExtension;
        ballExtension.createdAt = Date.now();
        ballExtension.world = engine.world;
        ballExtension.betValue = calculation.serviceResult.betValue;
        ballExtension.isServiceGuided = true;
        ballExtension.currentPathIndex = 0;
        ballExtension.appliedGuidanceSteps = [];
        ballExtension.servicePath = calculation.serviceResult.path;
        ballExtension.expectedFinalSlot = calculation.expectedFinalSlot;
        ballExtension.multiplier = calculation.serviceResult.multiplier;
        ballExtension.numberOfRows = calculation.serviceResult.numberOfRows || numberOfRows;
        ballExtension.roundId = options.roundId;

        // Attach full pre-calculated data
        ballExtension.calculationData = {
            id: calculation.id,
            trajectory: calculation.trajectory,
            collisions: calculation.collisions,
            physicsFactors: calculation.physicsFactors,
            stabilityMetrics: calculation.stabilityMetrics,
            predictionConfidence: calculation.predictionConfidence,
            pathConfidence: calculation.pathConfidence,
            alternativePaths: calculation.alternativePaths,
            environmentalFactors: calculation.environmentalFactors,
            ballProperties: calculation.ballProperties,
            pegConfiguration: calculation.pegConfiguration,
            boardConfiguration: calculation.boardConfiguration
        };

        ballExtension.wrongSlotHits = 0;
        ballExtension.pinCollisions = [];

        // Set initial velocity with variations
        const initialXVariation = (Math.random() - 0.5) * 0.15;
        const initialYVariation = (Math.random() - 0.5) * 0.1;

        const fastFallVelocityY = Math.max(calculation.physicsFactors.velocityY + initialYVariation, 2.0);
        const controlledVelocityX = calculation.physicsFactors.velocityX + initialXVariation;

        Body.setVelocity(ball, {
            x: controlledVelocityX,
            y: fastFallVelocityY
        });

        Body.setAngularVelocity(ball, (Math.random() - 0.5) * 0.15);

        // Add ball to physics world
        Composite.add(engine.world, ball);

        physicsLogger?.info('✅ BALL CREATION: Ball successfully added to physics world', {
            component: 'BallFactory',
            function: 'createBallWithCalculation',
            metadata: {
                ballId: ball.id,
                position: { x: ball.position.x, y: ball.position.y },
                velocity: { x: ball.velocity.x.toFixed(3), y: ball.velocity.y.toFixed(3) },
                physicsProperties: {
                    restitution: ball.restitution.toFixed(3),
                    friction: ball.friction.toFixed(3),
                    frictionAir: ball.frictionAir.toFixed(3)
                }
            }
        });
    }

    /**
     * Remove all active balls from the physics world
     */
    static clearActiveBalls(engine: Engine): void {
        const activeBalls = Composite
            .allBodies(engine.world)
            .filter(body => body.label?.includes('ball') && !body.isStatic);

        activeBalls.forEach(ball => Composite.remove(engine.world, ball));

        if (activeBalls.length > 0) {
            logger.debug('🧹 [BALL FACTORY] Cleared active balls', {
                count: activeBalls.length
            });
        }
    }
}
