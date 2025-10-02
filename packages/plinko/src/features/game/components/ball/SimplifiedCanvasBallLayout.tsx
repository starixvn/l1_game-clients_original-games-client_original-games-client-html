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
        const CANVAS_HEIGHT = 550;

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

            // Scale physics elements based on number of rows
            const scaleFactor = Math.max(0.4, Math.min(1.2, 10 / numberOfRows));
            const pegRadius = Math.max(3, Math.min(12, 8 * scaleFactor));
            const pegGap = Math.max(30, Math.min(55, 45 * scaleFactor));
            const boardTopMargin = Math.max(40, Math.min(80, 60 * scaleFactor));

            // Create pins in triangular layout
            for (let row = 1; row <= numberOfRows; row++) {
                const columnsInRow = 3 + (row - 1); // Start with 3 columns, increase by 1 each row
                const rowWidth = (columnsInRow - 1) * pegGap;
                const startX = (canvasWidth - rowWidth) / 2;
                const y = boardTopMargin + (row - 1) * pegGap;

                for (let col = 0; col < columnsInRow; col++) {
                    const x = startX + col * pegGap;
                    pins.push(Bodies.circle(x, y, pegRadius, {
                        label: `pin-${row}-${col}`,
                        render: { fillStyle: physicsConfig.colors.pin },
                        isStatic: true
                    }));
                }
            }

            // Create walls
            const walls = [
                Bodies.rectangle(-10, canvasHeight / 2, 20, canvasHeight * 2, { render: { visible: false }, isStatic: true }),
                Bodies.rectangle(canvasWidth + 10, canvasHeight / 2, 20, canvasHeight * 2, { render: { visible: false }, isStatic: true }),
                Bodies.rectangle(canvasWidth / 2, canvasHeight + 10, canvasWidth * 2, 20, { render: { visible: false }, isStatic: true })
            ];

            // Create multiplier slots positioned at the same level as the last row, centered between pegs
            const lastRowColumns = numberOfRows; // Last row has numberOfRows pegs
            const lastRowWidth = (lastRowColumns - 1) * pegGap;
            const lastRowStartX = (canvasWidth - lastRowWidth) / 2;
            const lastRowY = boardTopMargin + (numberOfRows - 1) * pegGap; // Y position of last row pegs

            // Create slots including edges: left of first peg, between pegs, and right of last peg
            const numberOfSlots = numberOfRows + 1; // Traditional Plinko: N pegs = N+1 slots
            const slotsToCreate = Math.min(multipliers.length, numberOfSlots);

            for (let i = 0; i < slotsToCreate; i++) {
                const multiplier = multipliers[i];
                // Position slots between pegs: left of first, between all pairs, right of last
                const slotX = lastRowStartX + (i - 0.5) * pegGap; // Center between peg positions
                // FIX: Position slots BELOW the physics board, not at the same level
                const slotY = lastRowY + pegGap * 0.8; // Position below last row by 80% of peg gap
                const slotWidth = Math.max(8, Math.min(50, pegGap - 8 * scaleFactor));

                multipliersBodies.push(Bodies.rectangle(slotX, slotY, slotWidth, 5, {
                    label: `multiplier-${multiplier}-${i}`,
                    isStatic: true,
                    isSensor: true,
                    render: { fillStyle: getMultiplierColor(multiplier) }
                }));
            }

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

        // Handle multiplier collision
        const handleMultiplierCollision = useCallback((
            ballBody: Body,
            ballExtension: BallBodyExtension,
            obstacleBody: Body,
            engine: Engine
        ) => {
            // Extract multiplier data from label
            const labelParts = obstacleBody.label.split("-");
            const multiplier = parseFloat(labelParts[1]) || 1;
            const finalSlot = parseInt(labelParts[2]) || 0;
            const betValue = ballExtension.betValue || 100;

            // Mark ball as removed
            ballExtension.isRemoved = true;
            ballBody.isSensor = true;
            ballBody.isStatic = true;
            removedBallsRef.current.add(ballBody.id);

            // Handle win logic
            World.remove(engine.world, ballBody);
            if (!ballExtension.hasTriggeredWin) {
                ballExtension.hasTriggeredWin = true;

                if (ballExtension.isServiceGuided && ballExtension.expectedFinalSlot !== undefined) {
                    // Service-guided ball logic
                    if (finalSlot === ballExtension.expectedFinalSlot) {
                        onBallHit?.(multiplier, betValue);
                    } else {
                        ballExtension.wrongSlotHits = (ballExtension.wrongSlotHits || 0) + 1;
                        if (ballExtension.wrongSlotHits >= 3) {
                            onBallHit?.(ballExtension.multiplier || multiplier, betValue);
                        }
                    }
                } else {
                    // Regular ball
                    onBallHit?.(multiplier, betValue);
                }
            }
        }, [onBallHit]);

        // Handle pin collision
        const handlePinCollision = useCallback((ballBody: Body, ballExtension: BallBodyExtension) => {
            if (ballExtension.isServiceGuided && ballExtension.servicePath && ballExtension.currentPathIndex < ballExtension.servicePath.length) {
                // Service-guided ball following path
                const direction = ballExtension.servicePath[ballExtension.currentPathIndex];
                const forceX = direction === 1 ? 0.15 : -0.15;
                Body.setVelocity(ballBody, { x: forceX * 2, y: ballBody.velocity.y });
                Body.applyForce(ballBody, ballBody.position, { x: forceX, y: 0 });
                ballExtension.currentPathIndex++;
            } else {
                // Random deflection for regular balls
                const ballRadius = ballBody.circleRadius || 5;
                const deflectionStrength = Math.max(0.1, Math.min(0.3, 0.25 / (ballRadius / 5)));
                const randomForce = (Math.random() < 0.5 ? -1 : 1) * deflectionStrength * (Math.random() * 0.5 + 0.75);
                Body.applyForce(ballBody, ballBody.position, { x: randomForce, y: 0 });
            }
        }, []);

        // Memoize expensive layout calculations to avoid recalculating every frame
        const layoutData = useMemo(() => {
            const scaleFactor = Math.max(0.4, Math.min(1.2, 10 / numberOfRows));
            const pegRadius = Math.max(3, Math.min(12, 8 * scaleFactor));
            const pegGap = Math.max(30, Math.min(55, 45 * scaleFactor));
            const boardTopMargin = Math.max(40, Math.min(80, 60 * scaleFactor));

            const lastRowY = boardTopMargin + (numberOfRows - 1) * pegGap;
            const lastRowColumns = numberOfRows;
            const lastRowWidth = (lastRowColumns - 1) * pegGap;
            const lastRowStartX = (CANVAS_WIDTH - lastRowWidth) / 2;
            const visualSlotHeight = Math.max(15, Math.min(40, (pegGap - 8 * scaleFactor) * 1.5));
            const slotWidth = Math.max(8, Math.min(50, pegGap - 8 * scaleFactor));
            const numberOfSlots = numberOfRows + 1;

            return {
                scaleFactor,
                pegRadius,
                pegGap,
                boardTopMargin,
                lastRowY,
                lastRowStartX,
                visualSlotHeight,
                slotWidth,
                numberOfSlots
            };
        }, [numberOfRows]);

        // Memoize slot rendering data
        const slotRenderData = useMemo(() => {
            const effectiveMultipliers = multipliers.length > 0 ? multipliers : [0.5, 1, 1.2, 1.5, 2, 3, 5, 10, 20];
            const slotsToDraw = Math.min(effectiveMultipliers.length, layoutData.numberOfSlots);

            return effectiveMultipliers.map((multiplier, i) => {
                if (i >= slotsToDraw) return null;

                const slotX = layoutData.lastRowStartX + (i - 0.5) * layoutData.pegGap - layoutData.slotWidth / 2;
                // FIX: Position visual slots BELOW the physics board to match physics positioning
                const slotY = layoutData.lastRowY + layoutData.pegGap * 0.8;

                return {
                    multiplier,
                    slotX,
                    slotY,
                    slotWidth: layoutData.slotWidth,
                    slotHeight: layoutData.visualSlotHeight,
                    color: getSlotColor(multiplier)
                };
            }).filter(Boolean);
        }, [multipliers, layoutData]);

        // Start render loop
        const startRenderLoop = useCallback((
            ctx: CanvasRenderingContext2D,
            engine: Engine,
            containerSize: { width: number; height: number },
            multipliers: number[],
            pins: Body[],
            numberOfRows: number
        ) => {
            const render = () => {
                if (!ctx || !engine) return;

                ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

                // Draw multiplier slots using pre-calculated data
                slotRenderData.forEach((slot, index) => {
                    if (!slot) return;

                    const { multiplier, slotX, slotY, slotWidth, slotHeight, color } = slot;

                    // Draw slot background
                    const slotGradient = ctx.createLinearGradient(slotX, slotY - slotHeight / 2, slotX, slotY + slotHeight / 2);
                    slotGradient.addColorStop(0, color);
                    slotGradient.addColorStop(1, '#1a252f');
                    ctx.fillStyle = slotGradient;
                    ctx.fillRect(slotX, slotY - slotHeight / 2, slotWidth, slotHeight);

                    // Draw slot border
                    ctx.strokeStyle = '#34495e';
                    ctx.lineWidth = 1;
                    ctx.strokeRect(slotX, slotY - slotHeight / 2, slotWidth, slotHeight);

                    // Draw multiplier text
                    ctx.fillStyle = '#ffffff';
                    ctx.font = `bold ${Math.max(12, Math.min(16, slotWidth / 3))}px Arial`;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(multiplier.toFixed(1), slotX + slotWidth / 2, slotY);
                });

                // Draw pins
                pins.forEach((pin, index) => {
                    const bounds = pin.bounds;
                    const centerX = (bounds.min.x + bounds.max.x) / 2;
                    const centerY = (bounds.min.y + bounds.max.y) / 2;

                    ctx.fillStyle = '#F5DCFF';
                    ctx.strokeStyle = '#E0E0E0';
                    ctx.lineWidth = Math.max(0.3, Math.min(1, 0.5 * layoutData.scaleFactor));
                    ctx.beginPath();
                    ctx.arc(centerX, centerY, layoutData.pegRadius, 0, Math.PI * 2);
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
        }, [slotRenderData, layoutData]);

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
                startRenderLoop(ctx, engine, { width: CANVAS_WIDTH, height: CANVAS_HEIGHT }, multipliers, pins, numberOfRows);
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


        // Optimized mouse event handling with better throttling
        const mouseThrottleRef = useRef({
            lastUpdate: 0,
            lastHoveredIndex: -1,
            lastPosition: { x: 0, y: 0 },
            rafId: null as number | null
        });

        // Memoized slot calculation data using layoutData for consistency
        const slotCalculationData = useMemo(() => {
            if (multipliers.length === 0) return null;

            const slotHeight = Math.max(15, Math.min(40, (layoutData.pegGap - 8 * layoutData.scaleFactor) * 1.5));
            // FIX: Use the same Y position as visual slots for hover detection
            const slotY = layoutData.lastRowY + layoutData.pegGap * 0.8;
            const slotAreaTop = slotY - slotHeight / 2;
            const slotAreaBottom = slotY + slotHeight / 2;

            return {
                slotAreaTop,
                slotAreaBottom,
                lastRowStartX: layoutData.lastRowStartX,
                pegGap: layoutData.pegGap,
                slotWidth: layoutData.slotWidth,
                slotHeight,
                multipliers,
                probabilities,
                betAmount,
                numberOfSlots: layoutData.numberOfSlots
            };
        }, [layoutData, multipliers, probabilities, betAmount]);

        // Memoized helper functions to prevent recreation on every render
        const findSlotIndex = useCallback((mouseX: number, lastRowStartX: number, pegGap: number, slotWidth: number, numberOfSlots: number) => {
            // Use same positioning logic as visual slots (between pegs)
            for (let i = 0; i < numberOfSlots; i++) {
                const slotCenterX = lastRowStartX + (i - 0.5) * pegGap; // Center between peg positions
                const slotX = slotCenterX - slotWidth / 2; // Visual slot left edge
                if (mouseX >= slotX && mouseX < slotX + slotWidth) {
                    return i;
                }
            }
            return -1;
        }, []);


        // Optimized hover state update with RAF throttling
        const updateHoverState = useCallback((slotIndex: number, event: MouseEvent) => {
            if (mouseThrottleRef.current.lastHoveredIndex === slotIndex) return;

            // Cancel previous RAF if exists
            if (mouseThrottleRef.current.rafId) {
                cancelAnimationFrame(mouseThrottleRef.current.rafId);
            }

            mouseThrottleRef.current.rafId = requestAnimationFrame(() => {
                mouseThrottleRef.current.lastHoveredIndex = slotIndex;
                mouseThrottleRef.current.rafId = null;

                if (slotIndex >= 0 && slotCalculationData) {
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
            });
        }, [slotCalculationData]);

        // Optimized mouse event handling with passive listeners and RAF throttling
        useEffect(() => {
            if (!slotCalculationData) return;

            const { slotAreaTop, slotAreaBottom, lastRowStartX, pegGap, slotWidth, numberOfSlots } = slotCalculationData;

            const handleMouseMove = (event: MouseEvent) => {
                if (!containerRef.current) return;

                const rect = containerRef.current.getBoundingClientRect();
                const mouseX = event.clientX - rect.left;
                const mouseY = event.clientY - rect.top;

                // Check if mouse is over payout slot area
                const isOverSlotArea = mouseY >= slotAreaTop && mouseY <= slotAreaBottom;
                const slotIndex = isOverSlotArea ? findSlotIndex(mouseX, lastRowStartX, pegGap, slotWidth, numberOfSlots) : -1;

                updateHoverState(slotIndex, event);
            };

            const handleMouseLeave = () => {
                if (mouseThrottleRef.current.rafId) {
                    cancelAnimationFrame(mouseThrottleRef.current.rafId);
                    mouseThrottleRef.current.rafId = null;
                }
                mouseThrottleRef.current.lastHoveredIndex = -1;
                setHoveredMultiplier(null);
            };

            if (containerRef.current) {
                // Use passive listeners for better performance
                containerRef.current.addEventListener("mousemove", handleMouseMove, { passive: true });
                containerRef.current.addEventListener("mouseleave", handleMouseLeave, { passive: true });
            }

            return () => {
                if (mouseThrottleRef.current.rafId) {
                    cancelAnimationFrame(mouseThrottleRef.current.rafId);
                    mouseThrottleRef.current.rafId = null;
                }
                if (containerRef.current) {
                    containerRef.current.removeEventListener("mousemove", handleMouseMove);
                    containerRef.current.removeEventListener("mouseleave", handleMouseLeave);
                }
            };
        }, [slotCalculationData, updateHoverState]);

        // Memoized ball creation parameters
        const ballCreationParams = useMemo(() => {
            const canvasScaleFactor = 1;
            const ballRadius = calculateBallSize(numberOfRows, canvasScaleFactor);
            const physicsTweaks = getBallPhysicsTweaks(ballRadius);
            const ballX = getMiddleDropPosition(CANVAS_WIDTH);

            return {
                ballRadius,
                physicsTweaks,
                ballX
            };
        }, [numberOfRows]);

        // Helper to create ball with physics properties
        const createBall = useCallback((betValue: number, isServiceGuided = false, startY = 30) => {
            const { ballRadius, physicsTweaks, ballX } = ballCreationParams;
            const ballColor = betValue <= 0 ? physicsConfig.colors.multiplierLoss : physicsConfig.colors.ball;

            const ball = Bodies.circle(ballX, startY, ballRadius, {
                restitution: physicsTweaks.restitution,
                friction: isServiceGuided ? 0.1 : 0.6,
                frictionAir: physicsTweaks.frictionAir,
                density: physicsTweaks.density,
                collisionFilter: { group: -1 },
                render: isServiceGuided ? {
                    fillStyle: ballColor,
                    strokeStyle: "#FFD700",
                    lineWidth: 1,
                } : { fillStyle: ballColor },
                label: isServiceGuided ? "service-guided-ball" : `ball-${betValue}`,
                isStatic: false,
            });

            const ballExtension = ball as unknown as BallBodyExtension;
            ballExtension.createdAt = Date.now();
            ballExtension.world = engineRef.current.world;
            ballExtension.betValue = betValue;
            ballExtension.isServiceGuided = isServiceGuided;

            return { ball };
        }, [ballCreationParams]);

        // Memoized spawn methods to prevent unnecessary re-renders
        const spawnBall = useCallback((betValue: number = 1) => {
            const now = Date.now();
            if (now - lastSpawnTimeRef.current < minSpawnInterval) return;

            lastSpawnTimeRef.current = now;
            removedBallsRef.current.clear();

            if (!engineRef.current) return;

            const { ball } = createBall(betValue);
            ball.position.x += (Math.random() - 0.5) * 4; // Add random offset

            Composite.add(engineRef.current.world, ball);
        }, [createBall]);

        const spawnBallWithPath = useCallback((betValue: number, path: number[], finalSlot: number, multiplier: number) => {
            if (!engineRef.current) return;

            const { ball } = createBall(betValue, true, 40); // Start slightly lower for service balls
            const ballExtension = ball as unknown as BallBodyExtension;
            ballExtension.servicePath = path;
            ballExtension.currentPathIndex = 0;
            ballExtension.expectedFinalSlot = finalSlot;
            ballExtension.multiplier = multiplier;
            ballExtension.wrongSlotHits = 0;
            ballExtension.pinCollisions = [];

            Composite.add(engineRef.current.world, ball);
        }, [createBall]);

        // Memoized imperative handle to prevent unnecessary re-renders
        const imperativeHandle = useMemo(() => ({
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
        }), [isInitialized, spawnBall, spawnBallWithPath]);

        useImperativeHandle(ref, () => imperativeHandle, [imperativeHandle]);

        return (
            <div
                ref={containerRef}
                className="simplified-canvas-ball-layout"
                style={{
                    width: "100%",
                    height: "100%",
                    minHeight: "550px",
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
