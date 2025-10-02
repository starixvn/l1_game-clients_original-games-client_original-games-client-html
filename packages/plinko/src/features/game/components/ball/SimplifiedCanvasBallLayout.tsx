import React, { useRef, useState, useEffect, useCallback, forwardRef, useImperativeHandle, useLayoutEffect, useMemo } from "react";
import { Bodies, Body, Composite, Engine, Events, Runner, World } from "matter-js";
import { BallLayoutProps } from "../../../../shared/types";
import usePlinkoGameStore from "@/shared/stores/plinko-game-store";
import { useShallow } from "zustand/shallow";
import { physicsConfig, calculateBallSize, getBallPhysicsTweaks, getMiddleDropPosition } from "../../../../lib/physics";

export interface SimplifiedCanvasBallLayoutRef {
    spawnBall: (betValue?: number) => void;
    spawnBallWithPath: (betValue: number, path: number[], finalSlot: number, multiplier: number) => void;
    isReady: () => boolean;
}

interface BallBodyExtension {
    world?: Engine['world'];
    isServiceGuided?: boolean;
    expectedFinalSlot?: number;
    multiplier?: number;
    betValue?: number;
    hasTriggeredWin?: boolean;
    servicePath?: number[];
    currentPathIndex?: number;
    isRemoved?: boolean;
    createdAt?: number;
    wrongSlotHits?: number;
    pinCollisions?: string[];
}

/**
 * Helper function to get slot color based on multiplier
 */
function getSlotColor(multiplier: number): string {
    if (multiplier >= 100) return '#8e44ad';
    if (multiplier >= 15) return '#9b59b6';
    if (multiplier >= 2) return '#3498db';
    if (multiplier >= 0.9) return '#2980b9';
    if (multiplier >= 0.5) return '#1f4e79';
    return '#2c3e50';
}

/**
 * Helper function to get multiplier color for physics bodies
 */
function getMultiplierColor(multiplier: number): string {
    if (multiplier >= 10) return physicsConfig.colors.multiplierHigh;
    if (multiplier >= 5) return physicsConfig.colors.multiplierMedium;
    if (multiplier >= 2) return physicsConfig.colors.multiplierLow;
    if (multiplier >= 1) return physicsConfig.colors.multiplierLoss;
    return '#333';
}

/**
 * Simplified Canvas Ball Layout Component
 * 
 * This replaces the complex 6-layer system with a single optimized canvas that:
 * - Renders everything in one place to eliminate layer synchronization issues
 * - Uses efficient rendering with minimal re-renders
 * - Maintains all functionality while reducing complexity
 * - Improves performance by eliminating multiple canvas elements
 */
const SimplifiedCanvasBallLayout = forwardRef<SimplifiedCanvasBallLayoutRef, BallLayoutProps>(
    ({ multipliers = [], probabilities = [], onBallHit }, ref) => {
        const { numberOfRows, betAmount } = usePlinkoGameStore(
            useShallow((state) => ({
                numberOfRows: state.numberOfRows,
                betAmount: state.betAmount,
            }))
        );

        const containerRef = useRef<HTMLDivElement>(null);
        const canvasRef = useRef<HTMLCanvasElement>(null);
        const engineRef = useRef<Engine | null>(null);
        const runnerRef = useRef<Runner | null>(null);
        const animationFrameRef = useRef<number | null>(null);

        const [isInitialized, setIsInitialized] = useState(false);
        const [containerSize, setContainerSize] = useState({ width: 400, height: 400 });

        // Prevent rapid successive ball drops
        const lastSpawnTimeRef = useRef<number>(0);
        const minSpawnInterval = 500;
        const removedBallsRef = useRef<Set<number>>(new Set());

        // Hover tooltip state
        const [hoveredMultiplier, setHoveredMultiplier] = useState<{
            multiplier: number;
            winAmount: number;
            probability: number;
            x: number;
            y: number;
        } | null>(null);

        // Get container size early
        useLayoutEffect(() => {
            const updateSize = () => {
                if (containerRef.current) {
                    const rect = containerRef.current.getBoundingClientRect();
                    if (rect.width > 0 && rect.height > 0) {
                        setContainerSize({ width: rect.width, height: rect.height });
                    }
                }
            };
            updateSize();
        }, []);

        // Fixed canvas dimensions - canvas stays at original size regardless of container resize
        const CANVAS_WIDTH = 600;
        const CANVAS_HEIGHT = 480;

        // Handle container resize without changing canvas size
        useEffect(() => {
            const handleResize = () => {
                if (containerRef.current) {
                    const rect = containerRef.current.getBoundingClientRect();
                    const width = rect.width;
                    const height = rect.height;

                    if (width > 0 && height > 0) {
                        // Only update container size, canvas stays fixed
                        setContainerSize({ width, height });
                    }
                }
            };

            // Initial setup
            handleResize();

            // Set up ResizeObserver for container sizing
            const resizeObserver = new ResizeObserver((entries) => {
                const entry = entries[0];
                if (entry) {
                    const { width, height } = entry.contentRect;
                    if (width > 0 && height > 0) {
                        setContainerSize({ width, height });
                    }
                }
            });

            if (containerRef.current) {
                resizeObserver.observe(containerRef.current);
            }

            return () => {
                resizeObserver.disconnect();
            };
        }, []);

        // Create physics bodies for the Plinko board
        const createPhysicsBodies = useCallback((
            canvasWidth: number,
            canvasHeight: number,
            numberOfRows: number,
            multipliers: number[]
        ) => {
            const pins: Body[] = [];
            const multipliersBodies: Body[] = [];

            // Simplified board layout for 600x600 canvas
            const pegRadius = 8; // Smaller pegs for better fit
            const mapGap = 3; // Same as visual rendering
            const pegGap = 45; // Gap between peg centers
            const initialColumns = 3;
            const boardTopMargin = 60; // Space from top for ball drop

            // Create pins in triangular layout
            for (let row = 1; row <= numberOfRows; row++) {
                const columnsInRow = initialColumns + (row - 1);
                const rowWidth = (columnsInRow - 1) * pegGap;
                const startX = (canvasWidth - rowWidth) / 2;
                const y = boardTopMargin + (row - 1) * pegGap;

                for (let col = 0; col < columnsInRow; col++) {
                    const x = startX + col * pegGap;

                    const pin = Bodies.circle(x, y, pegRadius, {
                        label: `pin-${row}-${col}`,
                        render: { fillStyle: physicsConfig.colors.pin },
                        isStatic: true
                    });
                    pins.push(pin);
                }
            }

            // Create invisible walls
            const wallThickness = 20;
            const walls = [
                Bodies.rectangle(-wallThickness / 2, canvasHeight / 2, wallThickness, canvasHeight * 2, {
                    render: { visible: false },
                    isStatic: true
                }),
                Bodies.rectangle(canvasWidth + wallThickness / 2, canvasHeight / 2, wallThickness, canvasHeight * 2, {
                    render: { visible: false },
                    isStatic: true
                }),
                Bodies.rectangle(canvasWidth / 2, canvasHeight + wallThickness / 2, canvasWidth * 2, wallThickness, {
                    render: { visible: false },
                    isStatic: true
                })
            ];

            // Create multiplier slots aligned with physics board slots
            const numberOfSlots = numberOfRows + 1;
            const gap = pegRadius * 2 * mapGap; // Same gap as pegs: 48
            const space = (canvasWidth - gap * numberOfSlots) / 2;
            const boardHeight = boardTopMargin + (numberOfRows - 1) * pegGap; // Bottom of the peg board
            const slotWidth = gap - 8; // Slightly wider for better proportions: 48 - 8 = 40
            const slotHeight = 5; // Thin physics bodies
            const slotY = boardHeight + 25; // Position slots 25px below the last peg row

            multipliers.forEach((multiplier, index) => {
                const col = index + 1; // Slots are 1-indexed
                const x = space + col * gap - pegRadius * mapGap;

                const multiplierBody = Bodies.rectangle(x, slotY, slotWidth, slotHeight, {
                    label: `multiplier-${multiplier}-${index}`,
                    isStatic: true,
                    isSensor: true,
                    render: { fillStyle: getMultiplierColor(multiplier) }
                });
                multipliersBodies.push(multiplierBody);
            });

            return { pins, multipliersBodies, walls };
        }, []);

        // Cleanup physics function
        const cleanupPhysics = useCallback(() => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
                animationFrameRef.current = null;
            }
            if (runnerRef.current) {
                Runner.stop(runnerRef.current);
                runnerRef.current = null;
            }
            if (engineRef.current) {
                World.clear(engineRef.current.world, true);
                Engine.clear(engineRef.current);
                engineRef.current = null;
            }
            removedBallsRef.current.clear();
        }, []);

        // Setup collision detection
        const setupCollisionDetection = useCallback((engine: Engine) => {
            Events.on(engine, "collisionActive", (event) => {
                const pairs = event.pairs;

                for (const pair of pairs) {
                    const { bodyA, bodyB } = pair;
                    const ballBody = bodyB.label?.includes("ball") ? bodyB : bodyA;
                    const obstacleBody = ballBody === bodyA ? bodyB : bodyA;

                    if (!ballBody?.label?.includes("ball")) continue;

                    const ballExtension = ballBody as Body & BallBodyExtension;

                    if (ballExtension.isRemoved || removedBallsRef.current.has(ballBody.id)) {
                        continue;
                    }

                    // Handle multiplier collisions
                    if (obstacleBody.label?.includes("multiplier")) {
                        handleMultiplierCollision(ballBody, ballExtension, obstacleBody, engine);
                    }
                    // Handle pin collisions
                    else if (obstacleBody.label?.includes("pin")) {
                        handlePinCollision(ballBody, ballExtension);
                    }
                }
            });
        }, [onBallHit]);

        // Helper function to extract multiplier data
        const extractMultiplierData = useCallback((obstacleBody: Body) => {
            const labelParts = obstacleBody.label.split("-");
            return {
                multiplier: parseFloat(labelParts[1]) || 1,
                finalSlot: parseInt(labelParts[2]) || 0
            };
        }, []);

        // Helper function to mark ball as removed
        const markBallAsRemoved = useCallback((ballBody: Body) => {
            ballBody.isSensor = true;
            ballBody.isStatic = true;
            removedBallsRef.current.add(ballBody.id);
        }, []);

        // Helper to trigger win callback
        const triggerWinCallback = useCallback((winMultiplier: number, winBetValue: number) => {
            if (onBallHit) {
                onBallHit(winMultiplier, winBetValue);
            }
        }, [onBallHit]);

        // Helper to remove ball and trigger win
        const removeBallAndTriggerWin = useCallback((
            ballBody: Body,
            ballExtension: BallBodyExtension,
            winMultiplier: number,
            betValue: number,
            engine: Engine
        ) => {
            World.remove(engine.world, ballBody);
            if (!ballExtension.hasTriggeredWin) {
                ballExtension.hasTriggeredWin = true;
                triggerWinCallback(winMultiplier, betValue);
            }
        }, [triggerWinCallback]);

        // Handle correct slot hit for service-guided balls
        const handleCorrectSlotHit = useCallback((
            ballBody: Body,
            ballExtension: BallBodyExtension,
            multiplier: number,
            betValue: number,
            engine: Engine
        ) => {
            removeBallAndTriggerWin(ballBody, ballExtension, multiplier, betValue, engine);
        }, [removeBallAndTriggerWin]);

        // Handle wrong slot hit for service-guided balls
        const handleWrongSlotHit = useCallback((
            ballBody: Body,
            ballExtension: BallBodyExtension,
            multiplier: number,
            betValue: number,
            engine: Engine
        ) => {
            ballExtension.wrongSlotHits = (ballExtension.wrongSlotHits || 0) + 1;
            // For service-guided balls, remove immediately on any multiplier hit
            // The win is only triggered if wrongSlotHits >= 3
            World.remove(engine.world, ballBody);
            if (ballExtension.wrongSlotHits >= 3) {
                if (!ballExtension.hasTriggeredWin) {
                    ballExtension.hasTriggeredWin = true;
                    triggerWinCallback(ballExtension.multiplier || multiplier, betValue);
                }
            }
        }, [triggerWinCallback]);

        // Handle service-guided ball collision
        const handleServiceGuidedCollision = useCallback((
            ballBody: Body,
            ballExtension: BallBodyExtension,
            finalSlot: number,
            multiplier: number,
            betValue: number,
            engine: Engine
        ) => {
            if (finalSlot === ballExtension.expectedFinalSlot) {
                handleCorrectSlotHit(ballBody, ballExtension, multiplier, betValue, engine);
            } else {
                handleWrongSlotHit(ballBody, ballExtension, multiplier, betValue, engine);
            }
        }, [handleCorrectSlotHit, handleWrongSlotHit]);

        // Handle regular ball collision
        const handleRegularBallCollision = useCallback((
            ballBody: Body,
            ballExtension: BallBodyExtension,
            multiplier: number,
            betValue: number,
            engine: Engine
        ) => {
            World.remove(engine.world, ballBody);
            if (!ballExtension.hasTriggeredWin) {
                ballExtension.hasTriggeredWin = true;
                if (onBallHit) {
                    onBallHit(multiplier, betValue);
                }
            }
        }, [onBallHit]);

        // Handle multiplier collision - simplified
        const handleMultiplierCollision = useCallback((
            ballBody: Body,
            ballExtension: BallBodyExtension,
            obstacleBody: Body,
            engine: Engine
        ) => {
            const { multiplier, finalSlot } = extractMultiplierData(obstacleBody);
            const betValue = ballExtension.betValue || 100;

            // Mark ball as removed
            ballExtension.isRemoved = true;
            markBallAsRemoved(ballBody);

            if (ballExtension.isServiceGuided && ballExtension.expectedFinalSlot !== undefined) {
                handleServiceGuidedCollision(ballBody, ballExtension, finalSlot, multiplier, betValue, engine);
            } else {
                handleRegularBallCollision(ballBody, ballExtension, multiplier, betValue, engine);
            }
        }, [extractMultiplierData, markBallAsRemoved, handleServiceGuidedCollision, handleRegularBallCollision]);

        // Handle pin collision
        const handlePinCollision = useCallback((ballBody: Body, ballExtension: BallBodyExtension) => {
            const servicePath = ballExtension.servicePath;
            const currentPathIndex = ballExtension.currentPathIndex || 0;

            if (ballExtension.isServiceGuided && servicePath && currentPathIndex < servicePath.length) {
                // Service-guided ball following path
                const direction = servicePath[currentPathIndex];
                const forceMagnitude = 0.15;
                const forceX = direction === 1 ? forceMagnitude : -forceMagnitude;

                Body.setVelocity(ballBody, { x: forceX * 2, y: ballBody.velocity.y });
                Body.applyForce(ballBody, ballBody.position, { x: forceX, y: 0 });
                ballExtension.currentPathIndex = currentPathIndex + 1;
            } else {
                // Random deflection for regular balls
                const ballRadius = ballBody.circleRadius || 5;
                const deflectionStrength = Math.max(0.1, Math.min(0.3, 0.25 / (ballRadius / 5)));
                const randomDirection = Math.random() < 0.5 ? -1 : 1;
                const randomForce = randomDirection * deflectionStrength * (Math.random() * 0.5 + 0.75);
                Body.applyForce(ballBody, ballBody.position, { x: randomForce, y: 0 });
            }
        }, []);

        // Start render loop
        const startRenderLoop = useCallback((
            ctx: CanvasRenderingContext2D,
            engine: Engine,
            containerSize: { width: number; height: number },
            effectiveMultipliers: number[],
            pins: Body[],
            numberOfRows: number
        ) => {
            const render = () => {
                if (!ctx || !engine) return;

                // Clear canvas (only the fixed canvas area)
                ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

                // Triangular board background is now handled by container CSS

                // Draw multiplier slots aligned with physics board slots
                const boardHeight = 60 + (numberOfRows - 1) * 45; // Same calculation as physics: boardTopMargin + (rows - 1) * pegGap
                const numberOfSlots = numberOfRows + 1;
                const gap = 8 * 2 * 3; // Same as physics: pegRadius * 2 * mapGap = 48
                const space = (CANVAS_WIDTH - gap * numberOfSlots) / 2;
                const slotWidth = gap - 8; // Same as physics: gap - 8 = 40
                const slotHeight = gap - 8; // Make slots square: same as width = 40
                const slotY = boardHeight + 25 + slotHeight / 2; // Position 25px below board, centered on slot height

                effectiveMultipliers.forEach((multiplier, index) => {
                    const col = index + 1; // Slots are 1-indexed
                    const physicsCenterX = space + col * gap - 8 * 3; // Physics slot center
                    const slotX = physicsCenterX - slotWidth / 2; // Center visual slot on physics center
                    const slotColor = getSlotColor(multiplier);

                    const slotGradient = ctx.createLinearGradient(slotX, slotY - slotHeight / 2, slotX, slotY + slotHeight / 2);
                    slotGradient.addColorStop(0, slotColor);
                    slotGradient.addColorStop(1, '#1a252f');
                    ctx.fillStyle = slotGradient;
                    ctx.fillRect(slotX, slotY - slotHeight / 2, slotWidth, slotHeight);

                    ctx.strokeStyle = '#34495e';
                    ctx.lineWidth = 1;
                    ctx.strokeRect(slotX, slotY - slotHeight / 2, slotWidth, slotHeight);

                    ctx.fillStyle = '#ffffff';
                    ctx.font = `bold ${Math.max(12, Math.min(16, slotWidth / 3))}px Arial`;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(multiplier.toFixed(1), slotX + slotWidth / 2, slotY);
                });

                // Draw pins
                pins.forEach((pin) => {
                    const bounds = pin.bounds;
                    const centerX = (bounds.min.x + bounds.max.x) / 2;
                    const centerY = (bounds.min.y + bounds.max.y) / 2;
                    const pinRadius = 8; // Match physics pegRadius

                    ctx.fillStyle = '#F5DCFF';
                    ctx.strokeStyle = '#E0E0E0';
                    ctx.lineWidth = 0.5;
                    ctx.beginPath();
                    ctx.arc(centerX, centerY, pinRadius, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.stroke();
                });

                // Draw balls
                const allBodies = Composite.allBodies(engine.world);
                const balls = allBodies.filter((body) => {
                    if (!body.label?.includes("ball")) return false;
                    const ballExtension = body as unknown as BallBodyExtension;
                    return !ballExtension.isRemoved && !removedBallsRef.current.has(body.id);
                });

                balls.forEach((ball) => {
                    const ballExtension = ball as unknown as BallBodyExtension;
                    const ballColor = ballExtension.betValue && ballExtension.betValue <= 0 ?
                        physicsConfig.colors.multiplierLoss : physicsConfig.colors.ball;

                    ctx.fillStyle = ballColor;
                    ctx.strokeStyle = "#FFD700";
                    ctx.lineWidth = Math.max(1, (ball.circleRadius || 5) * 0.1);

                    ctx.beginPath();
                    ctx.arc(ball.position.x, ball.position.y, ball.circleRadius || 5, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.stroke();

                    // Add inner highlight
                    ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
                    ctx.beginPath();
                    ctx.arc(
                        ball.position.x - (ball.circleRadius || 5) * 0.3,
                        ball.position.y - (ball.circleRadius || 5) * 0.3,
                        (ball.circleRadius || 5) * 0.4,
                        0,
                        Math.PI * 2
                    );
                    ctx.fill();
                });

                animationFrameRef.current = requestAnimationFrame(render);
            };

            render();
        }, []);

        // Initialize physics engine
        useEffect(() => {
            if (!canvasRef.current) {
                return;
            }

            if (isInitialized) {
                cleanupPhysics();
                setIsInitialized(false);
            }

            const initTimeout = setTimeout(() => {
                if (!canvasRef.current) return;

                const canvas = canvasRef.current;
                const ctx = canvas.getContext('2d');
                if (!ctx) return;

                // Set canvas to fixed original dimensions
                canvas.width = CANVAS_WIDTH;
                canvas.height = CANVAS_HEIGHT;

                // Create physics engine
                const engine = Engine.create();
                const scaleFactor = Math.min(containerSize.width / CANVAS_WIDTH, containerSize.height / CANVAS_HEIGHT);
                engine.gravity.y = physicsConfig.engine.engineGravity * scaleFactor;
                engineRef.current = engine;

                // Create physics bodies using fixed canvas dimensions
                const effectiveMultipliers = multipliers.length > 0 ? multipliers : [0.5, 1, 1.2, 1.5, 2, 3, 5, 10, 20];
                const { pins, multipliersBodies, walls } = createPhysicsBodies(
                    CANVAS_WIDTH,
                    CANVAS_HEIGHT,
                    numberOfRows,
                    effectiveMultipliers
                );

                const runner = Runner.create();
                runnerRef.current = runner;
                Runner.run(runner, engine);

                // Add all physics bodies to the world
                Composite.add(engine.world, [...pins, ...multipliersBodies, ...walls]);

                // Set up collision detection
                setupCollisionDetection(engine);

                // Start render loop with fixed canvas dimensions
                startRenderLoop(ctx, engine, { width: CANVAS_WIDTH, height: CANVAS_HEIGHT }, effectiveMultipliers, pins, numberOfRows);
                setIsInitialized(true);
            }, 100);

            return () => {
                clearTimeout(initTimeout);
                cleanupPhysics();
            };
        }, [numberOfRows, multipliers]); // Physics now uses fixed canvas dimensions

        // Update collision detection when onBallHit callback changes
        useEffect(() => {
            if (engineRef.current && isInitialized) {
                // Remove existing collision listeners
                Events.off(engineRef.current, "collisionActive", undefined as any);
                // Re-setup collision detection with new callback
                setupCollisionDetection(engineRef.current);
            }
        }, [onBallHit, isInitialized, setupCollisionDetection]);

        // Throttled mouse event handling to prevent excessive re-renders
        const mouseThrottleRef = useRef({
            lastUpdate: 0,
            lastHoveredIndex: -1,
            lastPosition: { x: 0, y: 0 }
        });

        // Memoized slot calculation data to avoid recalculating on every mouse move
        const slotCalculationData = useMemo(() => {
            if (multipliers.length === 0) return null;

            // Calculate slot positions to match physics/visual alignment
            const canvasWidth = containerSize.width;
            const numberOfSlots = numberOfRows + 1;
            const gap = 8 * 2 * 3; // Same as physics: pegRadius * 2 * mapGap = 48

            const boardHeight = 60 + (numberOfRows - 1) * 45; // Same as visual calculation
            const slotHeight = gap - 8; // Same as visual slotHeight (square)
            const slotAreaTop = boardHeight + 25; // 25px below board, same as visual calculation
            const slotAreaBottom = slotAreaTop + slotHeight;
            const space = (canvasWidth - gap * numberOfSlots) / 2;
            const slotWidth = gap - 8; // Same as physics: gap - 8 = 40

            return {
                slotAreaTop,
                slotAreaBottom,
                space,
                gap,
                slotWidth,
                slotHeight,
                multipliers,
                probabilities,
                betAmount
            };
        }, [containerSize, multipliers, probabilities, betAmount, numberOfRows]);

        // Helper function to find slot index from mouse position (aligned with physics slots)
        const findSlotIndex = (mouseX: number, space: number, gap: number, slotWidth: number, multipliersLength: number) => {
            // Use same positioning logic as visual slots (centered on physics centers)
            for (let i = 0; i < multipliersLength; i++) {
                const col = i + 1; // Slots are 1-indexed
                const physicsCenterX = space + col * gap - 8 * 3; // Physics slot center
                const slotX = physicsCenterX - slotWidth / 2; // Visual slot left edge
                if (mouseX >= slotX && mouseX < slotX + slotWidth) {
                    return i;
                }
            }
            return -1;
        };

        // Helper function to update hover state
        const updateHoverState = (slotIndex: number, now: number, event: MouseEvent) => {
            if (mouseThrottleRef.current.lastHoveredIndex !== slotIndex) {
                mouseThrottleRef.current.lastHoveredIndex = slotIndex;
                mouseThrottleRef.current.lastUpdate = now;

                if (slotIndex >= 0) {
                    const multiplier = slotCalculationData.multipliers[slotIndex];
                    const probability = slotCalculationData.probabilities[slotIndex] || 0;
                    const winAmount = slotCalculationData.betAmount * multiplier;

                    setHoveredMultiplier({
                        multiplier,
                        winAmount,
                        probability,
                        x: event.clientX,
                        y: event.clientY,
                    });
                } else {
                    setHoveredMultiplier(null);
                }
            }
        };

        // Handle mouse events for hover tooltips - throttled to prevent excessive re-renders
        useEffect(() => {
            if (!slotCalculationData) return;

            const { slotAreaTop, slotAreaBottom, space, gap, slotWidth, multipliers } = slotCalculationData;

            const handleMouseMove = (event: MouseEvent) => {
                if (!containerRef.current) return;

                const now = Date.now();
                // Throttle to 30fps (33ms) to reduce re-render frequency
                if (now - mouseThrottleRef.current.lastUpdate < 33) return;

                const rect = containerRef.current.getBoundingClientRect();
                const mouseX = event.clientX - rect.left;
                const mouseY = event.clientY - rect.top;

                // Check if mouse is over payout slot area
                const isOverSlotArea = mouseY >= slotAreaTop && mouseY <= slotAreaBottom;
                const slotIndex = isOverSlotArea ? findSlotIndex(mouseX, space, gap, slotWidth, multipliers.length) : -1;

                updateHoverState(slotIndex, now, event);
            };

            const handleMouseLeave = () => {
                if (mouseThrottleRef.current.lastHoveredIndex !== -1) {
                    mouseThrottleRef.current.lastHoveredIndex = -1;
                    setHoveredMultiplier(null);
                }
            };

            if (containerRef.current) {
                containerRef.current.addEventListener("mousemove", handleMouseMove);
                containerRef.current.addEventListener("mouseleave", handleMouseLeave);
            }

            return () => {
                if (containerRef.current) {
                    containerRef.current.removeEventListener("mousemove", handleMouseMove);
                    containerRef.current.removeEventListener("mouseleave", handleMouseLeave);
                }
            };
        }, [slotCalculationData]); // Only depend on memoized calculation data

        // Spawn ball method
        const spawnBall = useCallback((betValue: number = 1) => {
            const now = Date.now();
            const timeSinceLastSpawn = now - lastSpawnTimeRef.current;

            if (lastSpawnTimeRef.current > 0 && timeSinceLastSpawn < minSpawnInterval) {
                return;
            }

            lastSpawnTimeRef.current = now;
            removedBallsRef.current.clear();

            if (!engineRef.current || !canvasRef.current) return;

            const canvasScaleFactor = 1; // Canvas is now fixed at 600x480
            const ballRadius = calculateBallSize(numberOfRows, canvasScaleFactor);
            const physicsTweaks = getBallPhysicsTweaks(ballRadius);

            const ballX = getMiddleDropPosition(CANVAS_WIDTH);
            const randomOffset = (Math.random() - 0.5) * 4;
            const finalBallX = ballX + randomOffset;

            const ballColor = betValue <= 0 ? physicsConfig.colors.multiplierLoss : physicsConfig.colors.ball;

            const ball = Bodies.circle(finalBallX, 30, ballRadius, {
                restitution: physicsTweaks.restitution,
                friction: 0.6,
                label: `ball-${betValue}`,
                id: new Date().getTime(),
                frictionAir: physicsTweaks.frictionAir,
                density: physicsTweaks.density,
                collisionFilter: { group: -1 },
                render: { fillStyle: ballColor },
                isStatic: false,
            });

            const ballExtension = ball as unknown as BallBodyExtension;
            ballExtension.createdAt = Date.now();
            ballExtension.world = engineRef.current.world;
            ballExtension.betValue = betValue;

            Composite.add(engineRef.current.world, ball);
        }, [numberOfRows]);

        // Spawn ball with path method
        const spawnBallWithPath = useCallback((betValue: number, path: number[], finalSlot: number, multiplier: number) => {
            if (!engineRef.current || !canvasRef.current) return;

            const canvasScaleFactor = 1; // Canvas is now fixed at 600x480
            const ballRadius = calculateBallSize(numberOfRows, canvasScaleFactor);
            const physicsTweaks = getBallPhysicsTweaks(ballRadius);

            const ballX = getMiddleDropPosition(CANVAS_WIDTH);
            const ballColor = betValue <= 0 ? physicsConfig.colors.multiplierLoss : physicsConfig.colors.ball;

            const ball = Bodies.circle(ballX, ballRadius + 10, ballRadius, {
                restitution: physicsTweaks.restitution,
                friction: 0.1,
                frictionAir: physicsTweaks.frictionAir,
                density: physicsTweaks.density,
                render: {
                    fillStyle: ballColor,
                    strokeStyle: "#FFD700",
                    lineWidth: 1,
                },
                label: "service-guided-ball",
                isStatic: false,
            });

            const ballExtension = ball as unknown as BallBodyExtension;
            ballExtension.servicePath = path;
            ballExtension.currentPathIndex = 0;
            ballExtension.expectedFinalSlot = finalSlot;
            ballExtension.multiplier = multiplier;
            ballExtension.betValue = betValue;
            ballExtension.isServiceGuided = true;
            ballExtension.wrongSlotHits = 0;
            ballExtension.pinCollisions = [];

            Composite.add(engineRef.current.world, ball);
        }, [numberOfRows]);

        // Expose methods for external use
        useImperativeHandle(
            ref,
            () => ({
                spawnBall: (betValue?: number) => {
                    if (isInitialized && engineRef.current) {
                        spawnBall(betValue || 1);
                    } else {
                        console.warn('Cannot spawn ball: engine not ready', { isInitialized, hasEngine: !!engineRef.current });
                    }
                },
                spawnBallWithPath: (betValue: number, path: number[], finalSlot: number, multiplier: number) => {
                    if (isInitialized && engineRef.current) {
                        spawnBallWithPath(betValue, path, finalSlot, multiplier);
                    } else {
                        console.warn('Cannot spawn guided ball: engine not ready', { isInitialized, hasEngine: !!engineRef.current });
                    }
                },
                isReady: () => isInitialized && !!engineRef.current,
            }),
            [isInitialized, spawnBall, spawnBallWithPath]
        );

        return (
            <div
                ref={containerRef}
                className="simplified-canvas-ball-layout"
                style={{
                    width: "100%",
                    height: "100%",
                    minHeight: "480px",
                    position: "relative",
                    overflow: "hidden",
                    background: "linear-gradient(to bottom, #0f1419 0%, #1a2332 30%, #0f1419 100%)",
                    borderRadius: "8px",
                    boxSizing: "border-box",
                    transition: "all 0.5s ease",
                }}
                aria-label={`Simplified Plinko game with ${numberOfRows} rows and ${multipliers.length} multiplier slots`}
            >
                <canvas
                    ref={canvasRef}
                    style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        width: `${CANVAS_WIDTH}px`,
                        height: `${CANVAS_HEIGHT}px`,
                        zIndex: 1,
                    }}
                />

                {/* Loading Indicator */}
                {!isInitialized && (
                    <div
                        style={{
                            position: "absolute",
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                            color: "white",
                            fontSize: "14px",
                            textAlign: "center",
                            zIndex: 10,
                            animation: "pulse 1.5s ease-in-out infinite",
                        }}
                    >
                        Loading Simplified Plinko Physics...
                        <br />
                        <small>
                            Rows: {numberOfRows} | Slots: {multipliers.length}
                        </small>
                    </div>
                )}

                {/* Row Count Badge */}
                {isInitialized && (
                    <div
                        style={{
                            position: "absolute",
                            top: "10px",
                            right: "10px",
                            backgroundColor: "rgba(255, 107, 107, 0.9)",
                            color: "white",
                            fontSize: "12px",
                            fontWeight: "bold",
                            padding: "4px 8px",
                            borderRadius: "4px",
                            zIndex: 100,
                            animation: "fadeInScale 0.3s ease-out",
                            boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                        }}
                    >
                        {numberOfRows} Rows
                    </div>
                )}

                {/* Debug Info Overlay (Development Mode) */}
                {process.env.NODE_ENV === "development" && isInitialized && (
                    <div
                        style={{
                            position: "absolute",
                            top: "5px",
                            left: "5px",
                            backgroundColor: "rgba(0,0,0,0.7)",
                            color: "white",
                            fontSize: "10px",
                            padding: "2px 5px",
                            borderRadius: "3px",
                            zIndex: 100,
                        }}
                    >
                        Simplified: {numberOfRows}×{multipliers.length}
                    </div>
                )}

                {/* Hover Tooltip */}
                {hoveredMultiplier && (
                    <div
                        style={{
                            position: "fixed",
                            left: hoveredMultiplier.x + 10,
                            top: hoveredMultiplier.y - 10,
                            backgroundColor: "rgba(0, 0, 0, 0.9)",
                            color: "white",
                            padding: "8px 12px",
                            borderRadius: "6px",
                            fontSize: "12px",
                            fontWeight: "bold",
                            whiteSpace: "nowrap",
                            zIndex: 1000,
                            pointerEvents: "none",
                            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.3)",
                            border: "1px solid rgba(255, 255, 255, 0.2)",
                        }}
                    >
                        <div style={{ marginBottom: "4px", color: "#ffd700" }}>
                            Win: ${hoveredMultiplier.winAmount.toFixed(0)}
                        </div>
                        <div style={{ fontSize: "11px", color: "rgba(255, 255, 255, 0.8)" }}>
                            Chance: {(hoveredMultiplier.probability * 100).toFixed(1)}%
                        </div>
                    </div>
                )}
            </div>
        );
    }
);

SimplifiedCanvasBallLayout.displayName = "SimplifiedCanvasBallLayout";

export default SimplifiedCanvasBallLayout;
