import React, { useEffect, useRef, useState } from 'react';
import { Bodies, Body, Composite, Engine, Events, Render, Runner, World } from 'matter-js';
import { BallLayoutProps } from '../../../../shared/types';
import { logger } from '../../../../services';

// Import physics utilities from lib
import {
    physicsConfig,
    calculateBallSize,
    getBallPhysicsTweaks,
    calculateDropPositions,
    getMiddleDropPosition,
    createPhysicsBodies,
    setupCollisionDetection,
    createWinTextParticle,
    playCollisionSound,
    handleBallPayoutCollision,
    applyRandomPegDeflection,
    ballSizingConfig,
    type SlotLayout
} from '../../../../lib/physics';

/**
 * Refactored Canvas Ball Layout Component following SOLID principles
 *
 * This component now uses composition with smaller, focused modules:
 */

interface BallBodyExtension {
    world?: Engine['world'];
    isServiceGuided?: boolean;
    expectedFinalSlot?: number;
    multiplier?: number;
    betValue?: number;
    hasTriggeredWin?: boolean;
    servicePath?: number[];
    currentPathIndex?: number;
    isRemoved?: boolean; // Flag to prevent re-processing removed balls
    createdAt?: number; // Timestamp when ball was created
}

/**
 * - physics-config.ts: Configuration constants
 * - ball-calculations.ts: Ball sizing and physics calculations
 * - drop-positions.ts: Drop position calculations
 * - collision-handlers.ts: Collision handling logic
 * - visual-effects.ts: Particle effects and animations
 * - physics-engine.ts: Physics management and ball spawning
 *
 * Benefits:
 * - Single Responsibility: Each module has one clear purpose
 * - Open/Closed: Easy to extend individual modules without affecting others
 * - Liskov Substitution: Modules can be replaced with compatible implementations
 * - Interface Segregation: Clean, focused interfaces
 * - Dependency Inversion: Depends on abstractions, not concretions
 */

export interface CanvasBallLayoutRef {
    spawnBall: (betValue?: number) => void;
    spawnBallWithPath: (betValue: number, path: number[], finalSlot: number, multiplier: number) => void;
}

const CanvasBallLayout = React.forwardRef<CanvasBallLayoutRef, BallLayoutProps>(
    ({ rows, multipliers = [], probabilities = [], betAmount = 100, onBallHit }, ref) => {
        console.log('🔄 CanvasBallLayout component rendered with props:', {
            rows,
            multipliersLength: multipliers.length,
            multipliers: multipliers
        });

        const canvasRef = useRef<HTMLDivElement>(null);
        const engineRef = useRef<Engine | null>(null);
        const renderRef = useRef<Render | null>(null);
        const runnerRef = useRef<Runner | null>(null);
        const [isInitialized, setIsInitialized] = useState(false);

        const handleStylesLog = (element: HTMLElement | null, componentName: string) => {
            if (element) {
                const styles = window.getComputedStyle(element);
                logger.info(`CanvasBallLayout ${componentName} computed styles`, {
                    width: styles.width,
                    height: styles.height,
                    position: styles.position,
                    display: styles.display,
                    overflow: styles.overflow,
                    background: styles.background,
                    className: element.className
                });
            }
        };

        // Prevent rapid successive ball drops (auto-dropping protection)
        const lastSpawnTimeRef = useRef<number>(0);
        const minSpawnInterval = 500; // Minimum 500ms between ball spawns
        
        // Track removed balls to prevent collision processing
        const removedBallsRef = useRef<Set<number>>(new Set());

        // Hover tooltip state
        const [hoveredMultiplier, setHoveredMultiplier] = useState<{
            multiplier: number;
            winAmount: number;
            probability: number;
            x: number;
            y: number;
        } | null>(null);

        console.log('CanvasBallLayout state:', { isInitialized, hasCanvasRef: !!canvasRef.current });

        // Note: Text rendering moved to separate PayoutsDisplay component below canvas

        // Initialize physics engine with composition pattern
        useEffect(() => {
            console.log('CanvasBallLayout useEffect triggered:', { hasRef: !!canvasRef.current, isInitialized, rows, multipliers: multipliers.length });

            if (!canvasRef.current) {
                console.log('Skipping initialization: no canvas ref');
                return;
            }

            // Cleanup function
            const cleanupPhysics = () => {
                if (runnerRef.current) {
                    Runner.stop(runnerRef.current);
                    runnerRef.current = null;
                }
                if (renderRef.current) {
                    Render.stop(renderRef.current);
                    if (renderRef.current.canvas) {
                        renderRef.current.canvas.remove();
                    }
                    renderRef.current.textures = {};
                    renderRef.current = null;
                }
                if (engineRef.current) {
                    World.clear(engineRef.current.world, true);
                    Engine.clear(engineRef.current);
                    engineRef.current = null;
                }
                // Clear removed balls tracking
                removedBallsRef.current.clear();
            };

            // Clean up existing physics if re-initializing
            if (isInitialized) {
                console.log('Re-initializing due to prop changes...');
                cleanupPhysics();
                setIsInitialized(false);
            }

            // Use ResizeObserver for responsive canvas sizing
            const resizeObserver = new ResizeObserver((entries) => {
                const entry = entries[0];
                if (entry) {
                    const { width, height } = entry.contentRect;
                    console.log('Canvas container resized:', { width, height });
                    if (isInitialized) {
                        setIsInitialized(false);
                    }
                }
            });

            if (canvasRef.current) {
                resizeObserver.observe(canvasRef.current);
            }

            // Variables for hover detection (need to be accessible in cleanup)
            let handleMouseMove: (event: MouseEvent) => void;
            let handleMouseLeave: () => void;
            let canvasElement: HTMLElement | null = null;

            // Initialize physics using modular functions
            const initTimeout = setTimeout(() => {
                if (!canvasRef.current) {
                    console.log('Canvas ref lost during timeout, skipping initialization');
                    return;
                }

                console.log('Starting canvas initialization...');

                const element = canvasRef.current;
                if (!element) {
                    console.error('Canvas ref lost during initialization');
                    return;
                }

                // Get container dimensions
                const containerRect = element.getBoundingClientRect();
                const canvasWidth = containerRect.width;
                const canvasHeight = containerRect.height;

                console.log('Responsive container dimensions:', { width: canvasWidth, height: canvasHeight });
                console.log('Number of multipliers:', multipliers.length);

                if (canvasWidth < 50 || canvasHeight < 50) {
                    console.warn('Container too small, using fallback dimensions');
                }

                // Create physics engine and bodies using modular functions
                const engine = Engine.create();
                const scaleFactor = Math.min(canvasWidth / 400, canvasHeight / 400);
                engine.gravity.y = physicsConfig.engine.engineGravity * scaleFactor;
                engineRef.current = engine;

                // Create physics bodies (pins, multipliers, walls)
                const { pins, multipliersBodies, walls } = createPhysicsBodies(canvasWidth, canvasHeight, rows, multipliers);

                // Create slot layout for collision handling
                const slotLayout: SlotLayout = {
                    startX: (canvasWidth - multipliers.length * Math.max(25, Math.min(60, canvasWidth / multipliers.length * 0.85))) / 2,
                    slotWidth: Math.max(25, Math.min(60, canvasWidth / multipliers.length * 0.85)),
                    slotHeight: Math.max(20, Math.min(40, canvasHeight * 0.08)),
                    bottomMargin: canvasHeight * 0.15,
                    multipliers: [...multipliers]
                };

                // Create Matter.js renderer
                const render = Render.create({
                    element: element,
                    bounds: {
                        max: { y: canvasHeight, x: canvasWidth },
                        min: { y: 0, x: 0 }
                    },
                    options: {
                        background: physicsConfig.colors.background,
                        hasBounds: true,
                        width: canvasWidth,
                        height: canvasHeight,
                        wireframes: false
                    },
                    engine
                });
                renderRef.current = render;

                console.log('Matter.js render created, canvas element:', render.canvas);

                // Ensure canvas is in the DOM and visible
                if (render.canvas && render.canvas.parentNode) {
                    console.log('Canvas successfully added to DOM');
                    // Ensure canvas has proper styles
                    render.canvas.style.width = '100%';
                    render.canvas.style.height = '100%';
                    render.canvas.style.position = 'absolute';
                    render.canvas.style.top = '0';
                    render.canvas.style.left = '0';
                } else {
                    console.error('Canvas was not added to DOM! Creating fallback...');
                    // Fallback: create canvas manually
                    const fallbackCanvas = document.createElement('canvas');
                    fallbackCanvas.width = canvasWidth;
                    fallbackCanvas.height = canvasHeight;
                    fallbackCanvas.style.width = '100%';
                    fallbackCanvas.style.height = '100%';
                    fallbackCanvas.style.position = 'absolute';
                    fallbackCanvas.style.top = '0';
                    fallbackCanvas.style.left = '0';
                    element.appendChild(fallbackCanvas);
                    console.log('Fallback canvas created');
                }

                const runner = Runner.create();
                runnerRef.current = runner;
                Runner.run(runner, engine);
                Render.run(render);

                console.log('Physics simulation started');

                // Add all physics bodies to the world
                Composite.add(engine.world, [...pins, ...multipliersBodies, ...walls]);

                console.log('Physics bodies added:', {
                    pins: pins.length,
                    multipliers: multipliersBodies.length,
                    totalBodies: pins.length + multipliersBodies.length + walls.length
                });

                // Set up collision detection using modular function
                setupCollisionDetection();

                // Set up hover detection
                const setupHoverDetectionFunction = () => {
                    canvasElement = element;

                    handleMouseMove = (event: MouseEvent) => {
                        if (!render.canvas) return;

                        const rect = render.canvas.getBoundingClientRect();
                        const mouseX = event.clientX - rect.left;
                        const mouseY = event.clientY - rect.top;

                        // Check if mouse is over any multiplier body
                        let hoveredBody = null;
                        for (const body of multipliersBodies) {
                            const bounds = body.bounds;
                            if (mouseX >= bounds.min.x && mouseX <= bounds.max.x &&
                                mouseY >= bounds.min.y && mouseY <= bounds.max.y) {
                                hoveredBody = body;
                                break;
                            }
                        }

                        if (hoveredBody) {
                            const index = multipliersBodies.indexOf(hoveredBody);
                            const multiplier = multipliers[index];
                            const probability = probabilities[index] || 0;
                            const winAmount = betAmount * multiplier;

                            setHoveredMultiplier({
                                multiplier,
                                winAmount,
                                probability,
                                x: event.clientX,
                                y: event.clientY
                            });
                        } else {
                            setHoveredMultiplier(null);
                        }
                    };

                    handleMouseLeave = () => {
                        setHoveredMultiplier(null);
                    };

                    // Add mouse event listeners to the canvas container
                    if (canvasElement) {
                        canvasElement.addEventListener('mousemove', handleMouseMove);
                        canvasElement.addEventListener('mouseleave', handleMouseLeave);
                    }
                };

                setupHoverDetectionFunction();

                // Set up custom rendering for detailed payout information on canvas (like PayoutsDisplay)
                Events.on(render, 'afterRender', () => {
                    if (!render.canvas) return;

                    try {
                        const ctx = render.canvas.getContext('2d');
                        if (!ctx) return;

                        ctx.save();

                        // Draw detailed payout information on each slot (similar to PayoutsDisplay)
                        multipliersBodies.forEach((body, index) => {
                            const multiplier = multipliers[index];
                            const probability = probabilities[index] || 0; // eslint-disable-line @typescript-eslint/no-unused-vars

                            if (!multiplier || multiplier <= 0) return;

                            const bounds = body.bounds;
                            const centerX = (bounds.min.x + bounds.max.x) / 2;
                            const slotHeight = bounds.max.y - bounds.min.y;

                            // Check for active visual animation offset
                            const slotId = body.label;
                            const animationOffset = animationState.get(slotId)?.offsetY || 0;

                            // Apply animation offset to vertical positioning (text stays visible and stable)
                            const baseY = bounds.min.y + animationOffset;
                            const centerY = baseY + slotHeight * 0.5; // Middle of slot

                            // Set text properties for better visibility
                            ctx.fillStyle = '#ffffff';
                            ctx.strokeStyle = '#000000';
                            ctx.lineWidth = 1;
                            ctx.textAlign = 'center';
                            ctx.textBaseline = 'middle';

                            // Dynamic font size based on slot size - made larger
                            const slotWidth = bounds.max.x - bounds.min.x;
                            const multiplierFontSize = Math.max(12, Math.min(20, slotWidth / 3)); // Increased from 8-12 to 12-20 range

                            // Add text shadow for better readability
                            ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
                            ctx.shadowBlur = 2;
                            ctx.shadowOffsetX = 1;
                            ctx.shadowOffsetY = 1;

                            // Draw multiplier text (middle) - without 'x' suffix and larger font
                            ctx.font = `bold ${multiplierFontSize}px Arial`;
                            const multiplierText = `${multiplier.toFixed(1)}`;
                            ctx.strokeText(multiplierText, centerX, centerY);
                            ctx.fillText(multiplierText, centerX, centerY);
                        });

                        ctx.restore();
                    } catch (error) {
                        console.warn('Error rendering payout information on canvas:', error);
                    }
                });

                // Set up collision detection with debounced logging and animation state
                const lastLogTimeRef = { current: 0 };
                // Animation state to track visual animations separately from physics bodies
                const animationState = new Map<string, { offsetY: number; startTime: number; duration: number; type: 'slotBounce' }>();
                // Track peg collisions to add randomness
                const pegCollisionTracker = new Set<string>();

                const setupHoverDetection = () => {
                    canvasElement = element;

                    handleMouseMove = (event: MouseEvent) => {
                        if (!render.canvas) return;

                        const rect = render.canvas.getBoundingClientRect();
                        const mouseX = event.clientX - rect.left;
                        const mouseY = event.clientY - rect.top;

                        // Check if mouse is over any multiplier body
                        let hoveredBody = null;
                        for (const body of multipliersBodies) {
                            const bounds = body.bounds;
                            if (mouseX >= bounds.min.x && mouseX <= bounds.max.x &&
                                mouseY >= bounds.min.y && mouseY <= bounds.max.y) {
                                hoveredBody = body;
                                break;
                            }
                        }

                        if (hoveredBody) {
                            const index = multipliersBodies.indexOf(hoveredBody);
                            const multiplier = multipliers[index];
                            const probability = probabilities[index] || 0;
                            const winAmount = betAmount * multiplier;

                            setHoveredMultiplier({
                                multiplier,
                                winAmount,
                                probability,
                                x: event.clientX,
                                y: event.clientY
                            });
                        } else {
                            setHoveredMultiplier(null);
                        }
                    };

                    handleMouseLeave = () => {
                        setHoveredMultiplier(null);
                    };

                    // Add mouse event listeners to the canvas container
                    if (canvasElement) {
                        canvasElement.addEventListener('mousemove', handleMouseMove);
                        canvasElement.addEventListener('mouseleave', handleMouseLeave);
                    }
                };

                // Set up hover detection after canvas is created
                setupHoverDetection();

                // Single, unified collision detection system
                Events.on(engine, 'collisionActive', (event) => {
                    const pairs = event.pairs;

                    for (const pair of pairs) {
                        const { bodyA, bodyB } = pair;

                        // Determine which body is the ball and which is the obstacle
                        const ballBody = bodyB.label?.includes('ball') ? bodyB : bodyA;
                        const obstacleBody = ballBody === bodyA ? bodyB : bodyA;

                        // Only process valid ball collisions
                        if (!ballBody?.label?.includes('ball')) continue;

                        const ballExtension = ballBody as Body & BallBodyExtension;

                        // Skip already processed balls
                        if (ballExtension.isRemoved || removedBallsRef.current.has(ballBody.id)) {
                            continue;
                        }

                        // Handle multiplier (payout) collisions
                        if (obstacleBody.label?.includes('multiplier')) {
                            // Mark ball as processed immediately
                            ballExtension.isRemoved = true;
                            ballBody.isSensor = true;
                            ballBody.isStatic = true;
                            removedBallsRef.current.add(ballBody.id);

                            // Remove from physics world immediately
                            World.remove(engine.world, ballBody);

                            // Process win effects
                            const multiplier = parseFloat(obstacleBody.label.split('-')[1]) || 1;
                            const betValue = ballExtension.betValue || 100;

                            if (!ballExtension.hasTriggeredWin) {
                                ballExtension.hasTriggeredWin = true;

                                if (onBallHit) {
                                    onBallHit(multiplier, betValue);
                                }

                                createWinTextParticle(betValue * multiplier, ballBody.position.x, ballBody.position.y);
                                playCollisionSound(multiplier);

                                handleBallPayoutCollision(ballBody, obstacleBody, engine, {
                                    slotLayout,
                                    canvasHeight,
                                    onBallHit: undefined,
                                    collisionTime: Date.now(),
                                    lastLogTimeRef,
                                    animationState
                                });
                            }
                        }
                        // Handle pin collisions for physics guidance
                        else if (obstacleBody.label?.includes('pin')) {
                            const servicePath = ballExtension.servicePath;
                            const currentPathIndex = ballExtension.currentPathIndex || 0;

                            if (ballExtension.isServiceGuided && servicePath && currentPathIndex < servicePath.length) {
                                // Service-guided ball: follow predetermined path
                                const direction = servicePath[currentPathIndex];
                                const collisionId = `${ballBody.id}-${obstacleBody.label}-${currentPathIndex}`;

                                if (!pegCollisionTracker.has(collisionId)) {
                                    pegCollisionTracker.add(collisionId);

                                    const forceMagnitude = 0.08;
                                    const forceX = direction === 1 ? forceMagnitude : -forceMagnitude;

                                    Body.applyForce(ballBody, ballBody.position, { x: forceX, y: 0 });
                                    ballExtension.currentPathIndex = currentPathIndex + 1;

                                    setTimeout(() => pegCollisionTracker.delete(collisionId), 300);
                                }
                            } else {
                                // Regular ball: random deflection
                                const collisionId = `${ballBody.id}-${obstacleBody.label}`;

                                if (!pegCollisionTracker.has(collisionId)) {
                                    pegCollisionTracker.add(collisionId);

                                    const ballRadius = ballBody.circleRadius || 5;
                                    const deflectionStrength = Math.max(0.1, Math.min(0.3, 0.25 / (ballRadius / 5)));

                                    applyRandomPegDeflection(ballBody, deflectionStrength);

                                    setTimeout(() => pegCollisionTracker.delete(collisionId), 100);
                                }
                            }
                        }
                    }
                });

                // Note: Payout text is now rendered separately below the canvas via PayoutsDisplay component

                setIsInitialized(true);
                console.log('Canvas initialization completed successfully');

            }, 100); // Small delay to ensure DOM is ready

            // Cleanup function
            return () => {
                clearTimeout(initTimeout);
                resizeObserver.disconnect(); // Clean up ResizeObserver
                if (canvasElement && handleMouseMove && handleMouseLeave) {
                    canvasElement.removeEventListener('mousemove', handleMouseMove);
                    canvasElement.removeEventListener('mouseleave', handleMouseLeave);
                }
                if (runnerRef.current) {
                    Runner.stop(runnerRef.current);
                }
                if (renderRef.current) {
                    Render.stop(renderRef.current);
                    if (renderRef.current.canvas) {
                        renderRef.current.canvas.remove();
                    }
                    renderRef.current.textures = {};
                }
                if (engineRef.current) {
                    World.clear(engineRef.current.world, true);
                    Engine.clear(engineRef.current);
                }
            };
        }, [rows, multipliers]); // eslint-disable-line react-hooks/exhaustive-deps

        // Get current canvas dimensions and physics categories
        const getCanvasInfo = () => {
            if (!canvasRef.current) return null;
            const containerRect = canvasRef.current.getBoundingClientRect();

            // Define Matter.js collision categories (powers of 2)
            const ballCategory = 0x0001;      // 1
            const defaultCategory = 0x0002;   // 2
            const multiplierCategory = 0x0004; // 4

            return {
                canvasWidth: containerRect.width || physicsConfig.world.width,
                canvasHeight: containerRect.height || physicsConfig.world.height,
                ballCategory,
                defaultCategory,
                multiplierCategory
            };
        };

        // Method to spawn physics ball (can be called externally)
        const spawnBall = (betValue: number = 1) => {
            const now = Date.now();
            const timeSinceLastSpawn = now - lastSpawnTimeRef.current;

            // Prevent rapid successive ball drops (anti-spam protection)
            if (lastSpawnTimeRef.current > 0 && timeSinceLastSpawn < minSpawnInterval) {
                console.warn('🚫 Ball spawn blocked - too frequent!', {
                    timeSinceLastSpawn: timeSinceLastSpawn + 'ms',
                    minInterval: minSpawnInterval + 'ms',
                    betValue
                });
                return;
            }

            // Debug log to help identify when balls are spawned unexpectedly
            console.log('✅ Ball spawned! betValue:', betValue, 'Time:', new Date(now).toISOString(), 'Time since last spawn:', timeSinceLastSpawn + 'ms');

            // Update last spawn time
            lastSpawnTimeRef.current = now;

            // Clear old removed balls tracking to prevent memory leaks
            removedBallsRef.current.clear();

            if (!engineRef.current || !canvasRef.current) return;

            // Get current canvas dimensions
            const containerRect = canvasRef.current.getBoundingClientRect();
            const canvasWidth = containerRect.width || physicsConfig.world.width;
            const canvasHeight = containerRect.height || physicsConfig.world.height;

            // Calculate responsive scale factor for canvas size
            const canvasScaleFactor = Math.min(canvasWidth / 400, canvasHeight / 400);

            // Calculate dynamic ball size based on rows and canvas scaling
            const ballRadius = calculateBallSize(rows, canvasScaleFactor);

            // Get physics tweaks based on ball size for enhanced gameplay feel
            const physicsTweaks = getBallPhysicsTweaks(ballRadius);

            // Always spawn from the middle drop position (5th of 9 positions) for fair gameplay
            // This ensures consistent starting point while maintaining random bounce outcomes
            const ballX = getMiddleDropPosition(canvasWidth);

            // Add minimal random offset (±2px) to prevent identical paths while keeping it "middle"
            const randomOffset = (Math.random() - 0.5) * 4; // -2px to +2px
            const finalBallX = ballX + randomOffset;

            const ballColor = betValue <= 0 ? physicsConfig.colors.multiplierLoss : physicsConfig.colors.ball;

            console.log('Spawning ball from middle position:', {
                middlePosition: ballX.toFixed(1),
                randomOffset: randomOffset.toFixed(1),
                finalPosition: finalBallX.toFixed(1),
                ballRadius: ballRadius.toFixed(1),
                rows,
                canvasScaleFactor: canvasScaleFactor.toFixed(2),
                physicsTweaks,
                canvasWidth,
                canvasHeight
            });

            const ball = Bodies.circle(finalBallX, 30, ballRadius, {
                restitution: physicsTweaks.restitution, // Dynamic bounce based on size
                friction: 0.6,
                label: `ball-${betValue}`,
                id: new Date().getTime(),
                frictionAir: physicsTweaks.frictionAir, // Dynamic air resistance for fall speed
                density: physicsTweaks.density, // Dynamic mass for realistic physics
                collisionFilter: {
                    group: -1
                },
                render: {
                    fillStyle: ballColor
                },
                isStatic: false
            });

            Composite.add(engineRef.current.world, ball);
        };

        // Method to spawn ball with service-determined path
        const spawnBallWithPath = (betValue: number, path: number[], finalSlot: number, multiplier: number) => {
            console.log('🎯 SPAWNING BALL WITH SERVICE PATH:', {
                betValue,
                path,
                finalSlot,
                multiplier,
                pathLength: path.length,
                expectedRows: rows,
                expectedFinalSlot: path.filter(p => p === 1).length, // Count right turns
                engineExists: !!engineRef.current,
                canvasExists: !!canvasRef.current
            });

            // Validate service data consistency
            const calculatedSlot = path.filter(p => p === 1).length;
            if (calculatedSlot !== finalSlot) {
                console.warn(`⚠️ Slot mismatch! Path suggests slot ${calculatedSlot}, service says ${finalSlot}`);
            }

            // Validate path matches expected rows
            if (path.length !== rows) {
                console.warn(`⚠️ Path length (${path.length}) doesn't match expected rows (${rows})`);
            }

            // Store expected result for verification (removed - ref not declared)

            try {
                // Create ball with service path data
                const ball = createBallWithServicePath(path, betValue, finalSlot, multiplier);
                console.log('✅ Ball created:', { id: ball.id, label: ball.label, position: ball.position });

                // Add ball to physics world - let it fall naturally
                if (engineRef.current?.world) {
                    Composite.add(engineRef.current.world, ball);
                    console.log('✅ Ball added to physics world - now falling!');
                } else {
                    console.error('❌ No physics world available');
                }
            } catch (error) {
                console.error('❌ Error creating/spawning ball:', error);
            }
        };

        // Create a ball with service path data for physics-guided falling
        const createBallWithServicePath = (path: number[], betValue: number, finalSlot: number, multiplier: number) => {
            const canvasInfo = getCanvasInfo();
            if (!canvasInfo) throw new Error('Canvas not ready');

            // Canvas info is available but not needed for this function

            // Get current canvas dimensions
            const containerRect = canvasRef.current!.getBoundingClientRect();
            const canvasWidthActual = containerRect.width || physicsConfig.world.width;

            // Calculate dynamic ball size based on rows and canvas scaling
            const canvasScaleFactor = Math.min(canvasWidthActual / 400, containerRect.height / 400);
            const ballRadius = calculateBallSize(rows, canvasScaleFactor);

            // Get physics tweaks based on ball size
            const physicsTweaks = getBallPhysicsTweaks(ballRadius);

            // Always spawn from the middle drop position (5th of 9 positions)
            const ballX = getMiddleDropPosition(canvasWidthActual);

            const ballColor = betValue <= 0 ? physicsConfig.colors.multiplierLoss : physicsConfig.colors.ball;

            // Create ball body with service path information
            const ball = Bodies.circle(ballX, ballRadius + 10, ballRadius, {
                restitution: physicsTweaks.restitution,
                friction: 0.1,
                frictionAir: physicsTweaks.frictionAir,
                density: physicsTweaks.density,
                render: {
                    fillStyle: ballColor,
                    strokeStyle: '#FFD700',
                    lineWidth: 1
                },
                label: 'service-guided-ball',
                // collisionFilter: {
                //     group: -1  // Same collision group as regular balls
                // },
                isStatic: false
            });

            // Store service path information on the ball
            const ballExtension = ball as Body & BallBodyExtension;
            ballExtension.servicePath = path;
            ballExtension.currentPathIndex = 0;
            ballExtension.expectedFinalSlot = finalSlot;
            ballExtension.multiplier = multiplier;
            ballExtension.betValue = betValue;
            ballExtension.isServiceGuided = true;

            console.log('🎯 Ball created with service path:', {
                path: path.join(''),
                pathArray: path,
                finalSlot,
                multiplier,
                startX: ballX,
                pathLength: path.length,
                expectedCollisions: path.length
            });

            return ball;
        };

        // Expose methods for external use
        React.useImperativeHandle(ref, () => ({
            spawnBall,
            spawnBallWithPath
        }));

        return (
            <div
                ref={(el) => {
                    canvasRef.current = el;
                    handleStylesLog(el, 'main container');
                }}
                className="canvas-ball-layout"
                style={{
                    width: '100%',
                    height: '100%',
                    minHeight: '200px', // Minimum playable height
                    position: 'relative',
                    overflow: 'hidden',
                    backgroundColor: '#1a1a2e',
                    borderRadius: '8px',
                    boxSizing: 'border-box',
                    transition: 'all 0.5s ease' // Smooth transition when rows change
                }}
                aria-label={`Plinko game with ${rows} rows and ${multipliers.length} multiplier slots`}
                role="img"
            >
                {/* Fallback text while canvas loads */}
                {!isInitialized && (
                    <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        color: 'white',
                        fontSize: '14px',
                        textAlign: 'center',
                        zIndex: 10,
                        animation: 'pulse 1.5s ease-in-out infinite'
                    }}>
                        Loading Plinko Physics...
                        <br />
                        <small>Rows: {rows} | Slots: {multipliers.length}</small>
                    </div>
                )}

                {/* Row change indicator */}
                {isInitialized && (
                    <div style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        backgroundColor: 'rgba(255, 107, 107, 0.9)',
                        color: 'white',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        zIndex: 100,
                        animation: 'fadeInScale 0.3s ease-out',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                    }}>
                        {rows} Rows
                    </div>
                )}

                {/* Debug info overlay (only in development) */}
                {process.env.NODE_ENV === 'development' && isInitialized && (
                    <div style={{
                        position: 'absolute',
                        top: '5px',
                        left: '5px',
                        backgroundColor: 'rgba(0,0,0,0.7)',
                        color: 'white',
                        fontSize: '10px',
                        padding: '2px 5px',
                        borderRadius: '3px',
                        zIndex: 100
                    }}>
                        {rows}×{multipliers.length}
                    </div>
                )}

                {/* Hover tooltip for multiplier information */}
                {hoveredMultiplier && (
                    <div style={{
                        position: 'fixed',
                        left: hoveredMultiplier.x + 10,
                        top: hoveredMultiplier.y - 10,
                        backgroundColor: 'rgba(0, 0, 0, 0.9)',
                        color: 'white',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        whiteSpace: 'nowrap',
                        zIndex: 1000,
                        pointerEvents: 'none',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
                        border: '1px solid rgba(255, 255, 255, 0.2)'
                    }}>
                        <div style={{ marginBottom: '4px', color: '#ffd700' }}>
                            Win: ${hoveredMultiplier.winAmount.toFixed(0)}
                        </div>
                        <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.8)' }}>
                            Chance: {(hoveredMultiplier.probability * 100).toFixed(1)}%
                        </div>
                    </div>
                )}
            </div>
        );
    });
CanvasBallLayout.displayName = 'CanvasBallLayout';

// Custom comparison function to prevent unnecessary re-renders
const arePropsEqual = (prevProps: BallLayoutProps, nextProps: BallLayoutProps) => {
    return (
        prevProps.rows === nextProps.rows &&
        prevProps.multipliers?.length === nextProps.multipliers?.length &&
        prevProps.multipliers?.every((val, index) => val === nextProps.multipliers?.[index])
    );
};

const MemoizedCanvasBallLayout = React.memo(CanvasBallLayout, arePropsEqual);
MemoizedCanvasBallLayout.displayName = 'MemoizedCanvasBallLayout';

/**
 * Demo function to test ball sizing calculations across different row configurations
 * Useful for development and tuning the dynamic sizing system
 */
export function demoBallSizing() {
    console.log('🎯 Plinko Ball Sizing Demo');
    console.log('='.repeat(50));

    const testCases = [
        { rows: 1, description: 'Minimum rows (max ball size)' },
        { rows: 5, description: 'Low risk setting' },
        { rows: 8, description: 'Low-medium risk' },
        { rows: 10, description: 'Base reference (normal size)' },
        { rows: 12, description: 'Medium-high risk' },
        { rows: 16, description: 'High risk setting' },
        { rows: 20, description: 'Very high risk (min ball size)' },
        { rows: 25, description: 'Extreme volatility' }
    ];

    testCases.forEach(({ rows, description }) => {
        const radius = calculateBallSize(rows);
        const diameter = radius * 2;
        const physics = getBallPhysicsTweaks(radius);

        console.log(`${description} (${rows} rows):`);
        console.log(`  Diameter: ${diameter.toFixed(1)}px, Radius: ${radius.toFixed(1)}px`);
        console.log(`  Physics: Bounce ${physics.restitution.toFixed(2)}, Air Resistance ${physics.frictionAir.toFixed(3)}, Density ${physics.density.toFixed(5)}`);
        console.log('');
    });

    console.log('Configuration:');
    console.log(`  Base Rows: ${ballSizingConfig.baseRows}, Base Diameter: ${ballSizingConfig.baseDiameter}px`);
    console.log(`  Size Range: ${ballSizingConfig.minDiameter}px - ${ballSizingConfig.maxDiameter}px`);
    console.log(`  Scale Factor: ${ballSizingConfig.sizeScaleFactor}`);
}

/**
 * Demo function to test drop position calculations and middle position selection
 * Useful for verifying the 9-drop-zone layout and middle spawning behavior
 */
export function demoDropPositions() {
    console.log('📍 Plinko Drop Positions Demo');
    console.log('='.repeat(50));

    const testCanvasWidths = [400, 600, 800];
    const mockMultipliers = [100, 15.6, 2, 0.9, 0.5, 0.4, 0.5, 0.9, 2, 15.6, 100]; // eslint-disable-line @typescript-eslint/no-unused-vars

    testCanvasWidths.forEach(canvasWidth => {
        console.log(`Canvas Width: ${canvasWidth}px`);
        const positions = calculateDropPositions(canvasWidth);
        const middlePos = getMiddleDropPosition(canvasWidth);

        console.log('Drop Positions:');
        positions.forEach((pos, index) => {
            const marker = index === 4 ? ' ← MIDDLE' : '';
            console.log(`  ${index + 1}: ${pos.toFixed(1)}px${marker}`);
        });
        console.log(`Middle Position: ${middlePos.toFixed(1)}px`);
        console.log('');
    });
}

// Uncomment to run demos in browser console:
// demoBallSizing();
// demoDropPositions();

/**
 * Debug utility to check ball spawning status
 * Call this in browser console: getBallSpawnStatus()
 */
if (typeof window !== 'undefined') {
    (window as Window & { getBallSpawnStatus?: () => void }).getBallSpawnStatus = () => {
        console.log('Ball spawning is now protected against rapid drops.');
        console.log('Minimum interval between drops: 500ms');
        console.log('If balls are still dropping too fast, check for:');
        console.log('1. Auto-bet functionality being enabled');
        console.log('2. Rapid button clicking');
        console.log('3. Browser extensions automating clicks');
        return 'Check console for spawn logs with ✅ Ball spawned! messages';
    };
}

export default MemoizedCanvasBallLayout;
