import React, { useRef, useState, useEffect, useCallback, forwardRef, useImperativeHandle, useLayoutEffect, useMemo } from "react";
import { Bodies, Body, Composite, Engine, Events, Runner, World } from "matter-js";
import { BallLayoutProps } from "../../../../shared/types";
import usePlinkoBetStore from "@/shared/stores/plinko-bet-store";
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
        const { rows, betAmount } = usePlinkoBetStore(
            useShallow((state) => ({
                rows: state.numberOfRows,
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

        // Handle container resize
        useEffect(() => {
            const updateSize = () => {
                if (containerRef.current) {
                    const rect = containerRef.current.getBoundingClientRect();
                    setContainerSize({ width: rect.width, height: rect.height });
                }
            };

            updateSize();
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
            rows: number,
            multipliers: number[]
        ) => {
            const pins: Body[] = [];
            const multipliersBodies: Body[] = [];

            const topMargin = canvasHeight * 0.08;
            const bottomMargin = canvasHeight * 0.15;
            const availableHeight = canvasHeight - topMargin - bottomMargin;
            const verticalSpacing = availableHeight / (rows + 1);

            // Create pins in triangular layout
            for (let l = 0; l < rows; l++) {
                const linePins = l + 2;
                const maxPinsInBottomRow = rows + 1;
                const maxLineWidth = canvasWidth * 0.85;
                const pinSpacing = maxLineWidth / (maxPinsInBottomRow - 1);
                const lineWidth = (linePins - 1) * pinSpacing;
                const rowStartX = (canvasWidth - lineWidth) / 2;

                for (let i = 0; i < linePins; i++) {
                    const pinX = rowStartX + i * pinSpacing;
                    const pinY = topMargin + (l + 1) * verticalSpacing;

                    const pin = Bodies.circle(pinX, pinY, 2, {
                        label: `pin-${l}-${i}`,
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

            // Create multiplier slots
            const slotWidth = Math.max(25, Math.min(60, canvasWidth / multipliers.length * 0.85));
            const slotHeight = Math.max(20, Math.min(40, canvasHeight * 0.08));
            const totalSlotWidth = slotWidth * multipliers.length;
            const triangleBoardWidth = canvasWidth * 0.85;
            const triangleBoardX = (canvasWidth - triangleBoardWidth) / 2;
            const startX = triangleBoardX + (triangleBoardWidth - totalSlotWidth) / 2;

            multipliers.forEach((multiplier, index) => {
                const slotX = startX + index * slotWidth + slotWidth / 2;
                const slotY = topMargin + (canvasHeight - topMargin - bottomMargin) + slotHeight / 2;

                const multiplierBody = Bodies.rectangle(slotX, slotY, slotWidth, slotHeight, {
                    label: `multiplier-${multiplier}-${index}`,
                    isStatic: true,
                    render: {
                        fillStyle: getMultiplierColor(multiplier)
                    }
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
            rows: number
        ) => {
            const render = () => {
                if (!ctx || !engine) return;

                // Clear canvas
                ctx.clearRect(0, 0, containerSize.width, containerSize.height);

                // Draw background
                const gradient = ctx.createLinearGradient(0, 0, 0, containerSize.height);
                gradient.addColorStop(0, '#0f1419');
                gradient.addColorStop(0.3, '#1a2332');
                gradient.addColorStop(1, '#0f1419');
                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, containerSize.width, containerSize.height);

                // Draw light rays
                ctx.save();
                ctx.globalAlpha = 0.4;
                const lightGradient = ctx.createRadialGradient(
                    containerSize.width / 2, 0, 0,
                    containerSize.width / 2, 0, containerSize.height * 0.6
                );
                lightGradient.addColorStop(0, '#4a90e2');
                lightGradient.addColorStop(0.5, '#2c5aa0');
                lightGradient.addColorStop(1, 'transparent');
                ctx.fillStyle = lightGradient;
                ctx.fillRect(0, 0, containerSize.width, containerSize.height * 0.7);
                ctx.restore();

                // Draw triangular board background
                const triangleTopMargin = containerSize.height * 0.08;
                const triangleBottomMargin = containerSize.height * 0.15;
                const triangleBoardHeight = containerSize.height - triangleTopMargin - triangleBottomMargin;
                const triangleBoardWidth = containerSize.width * 0.85;
                const triangleBoardX = (containerSize.width - triangleBoardWidth) / 2;

                ctx.save();
                ctx.globalAlpha = 0.1;
                ctx.fillStyle = '#4a90e2';
                ctx.beginPath();
                ctx.moveTo(containerSize.width / 2, triangleTopMargin);
                ctx.lineTo(triangleBoardX, triangleTopMargin + triangleBoardHeight);
                ctx.lineTo(triangleBoardX + triangleBoardWidth, triangleTopMargin + triangleBoardHeight);
                ctx.closePath();
                ctx.fill();
                ctx.restore();

                // Draw multiplier slots
                const slotWidth = Math.max(25, Math.min(60, containerSize.width / effectiveMultipliers.length * 0.85));
                const slotHeight = Math.max(20, Math.min(40, containerSize.height * 0.08));
                const totalSlotWidth = slotWidth * effectiveMultipliers.length;
                const startX = triangleBoardX + (triangleBoardWidth - totalSlotWidth) / 2;
                const slotY = triangleTopMargin + triangleBoardHeight + slotHeight / 2;

                effectiveMultipliers.forEach((multiplier, index) => {
                    const slotX = startX + index * slotWidth;
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
                    ctx.font = `bold ${Math.max(10, Math.min(16, slotWidth / 4))}px Arial`;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(multiplier.toFixed(1), slotX + slotWidth / 2, slotY);
                });

                // Draw pins
                pins.forEach((pin) => {
                    const bounds = pin.bounds;
                    const centerX = (bounds.min.x + bounds.max.x) / 2;
                    const centerY = (bounds.min.y + bounds.max.y) / 2;
                    const pinRadius = Math.max(2, Math.min(8, 48 / rows));

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
            if (!canvasRef.current || !containerSize.width || !containerSize.height) {
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

                // Set canvas size
                canvas.width = containerSize.width;
                canvas.height = containerSize.height;

                // Create physics engine
                const engine = Engine.create();
                const scaleFactor = Math.min(containerSize.width / 400, containerSize.height / 400);
                engine.gravity.y = physicsConfig.engine.engineGravity * scaleFactor;
                engineRef.current = engine;

                // Create physics bodies
                const effectiveMultipliers = multipliers.length > 0 ? multipliers : [0.5, 1, 1.2, 1.5, 2, 3, 5, 10, 20];
                const { pins, multipliersBodies, walls } = createPhysicsBodies(
                    containerSize.width,
                    containerSize.height,
                    rows,
                    effectiveMultipliers
                );

                const runner = Runner.create();
                runnerRef.current = runner;
                Runner.run(runner, engine);

                // Add all physics bodies to the world
                Composite.add(engine.world, [...pins, ...multipliersBodies, ...walls]);

                // Set up collision detection
                setupCollisionDetection(engine);

                // Start render loop
                startRenderLoop(ctx, engine, containerSize, effectiveMultipliers, pins, rows);
                setIsInitialized(true);
            }, 100);

            return () => {
                clearTimeout(initTimeout);
                cleanupPhysics();
            };
        }, [containerSize.width, containerSize.height, rows, multipliers]); // Only depend on essential values

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

            const triangleTopMargin = containerSize.height * 0.08;
            const triangleBottomMargin = containerSize.height * 0.15;
            const triangleBoardHeight = containerSize.height - triangleTopMargin - triangleBottomMargin;
            const slotHeight = Math.max(20, Math.min(40, containerSize.height * 0.08));
            const slotAreaTop = triangleTopMargin + triangleBoardHeight - slotHeight;

            const canvasWidth = containerSize.width;
            const triangleBoardWidth = canvasWidth * 0.8;
            const triangleBoardX = (canvasWidth - triangleBoardWidth) / 2;
            const slotWidth = Math.max(25, Math.min(60, (canvasWidth / multipliers.length) * 0.85));
            const totalSlotWidth = slotWidth * multipliers.length;
            const startX = triangleBoardX + (triangleBoardWidth - totalSlotWidth) / 2;

            return {
                slotAreaTop,
                startX,
                totalSlotWidth,
                slotWidth,
                multipliers,
                probabilities,
                betAmount
            };
        }, [containerSize, multipliers, probabilities, betAmount]);

        // Handle mouse events for hover tooltips - throttled to prevent excessive re-renders
        useEffect(() => {
            if (!slotCalculationData) return;

            const { slotAreaTop, startX, totalSlotWidth, slotWidth, multipliers, probabilities, betAmount } = slotCalculationData;

            const handleMouseMove = (event: MouseEvent) => {
                if (!containerRef.current) return;

                const now = Date.now();
                // Throttle to 30fps (33ms) to reduce re-render frequency
                if (now - mouseThrottleRef.current.lastUpdate < 33) return;

                const rect = containerRef.current.getBoundingClientRect();
                const mouseX = event.clientX - rect.left;
                const mouseY = event.clientY - rect.top;

                // Check if mouse is over payout slot area
                if (mouseY > slotAreaTop) {
                    const relativeMouseX = mouseX - startX;
                    const slotIndex = Math.floor(relativeMouseX / slotWidth);
                    const isWithinSlotArea = mouseX >= startX && mouseX < startX + totalSlotWidth;

                    if (slotIndex >= 0 && slotIndex < multipliers.length && isWithinSlotArea) {
                        // Only update if the hovered slot actually changed
                        if (mouseThrottleRef.current.lastHoveredIndex !== slotIndex) {
                            mouseThrottleRef.current.lastHoveredIndex = slotIndex;
                            mouseThrottleRef.current.lastUpdate = now;

                            const multiplier = multipliers[slotIndex];
                            const probability = probabilities[slotIndex] || 0;
                            const winAmount = betAmount * multiplier;

                            setHoveredMultiplier({
                                multiplier,
                                winAmount,
                                probability,
                                x: event.clientX,
                                y: event.clientY,
                            });
                        }
                    } else if (mouseThrottleRef.current.lastHoveredIndex !== -1) {
                        // Clear hover state only if we were previously hovering
                        mouseThrottleRef.current.lastHoveredIndex = -1;
                        mouseThrottleRef.current.lastUpdate = now;
                        setHoveredMultiplier(null);
                    }
                } else if (mouseThrottleRef.current.lastHoveredIndex !== -1) {
                    // Clear hover state when leaving slot area
                    mouseThrottleRef.current.lastHoveredIndex = -1;
                    mouseThrottleRef.current.lastUpdate = now;
                    setHoveredMultiplier(null);
                }
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

            const canvasScaleFactor = Math.min(containerSize.width / 400, containerSize.height / 400);
            const ballRadius = calculateBallSize(rows, canvasScaleFactor);
            const physicsTweaks = getBallPhysicsTweaks(ballRadius);

            const ballX = getMiddleDropPosition(containerSize.width);
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
        }, [containerSize, rows]);

        // Spawn ball with path method
        const spawnBallWithPath = useCallback((betValue: number, path: number[], finalSlot: number, multiplier: number) => {
            if (!engineRef.current || !canvasRef.current) return;

            const canvasScaleFactor = Math.min(containerSize.width / 400, containerSize.height / 400);
            const ballRadius = calculateBallSize(rows, canvasScaleFactor);
            const physicsTweaks = getBallPhysicsTweaks(ballRadius);

            const ballX = getMiddleDropPosition(containerSize.width);
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
        }, [containerSize, rows]);

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
                    minHeight: "400px",
                    position: "relative",
                    overflow: "hidden",
                    backgroundColor: "#0f0f23",
                    borderRadius: "8px",
                    boxSizing: "border-box",
                    transition: "all 0.5s ease",
                }}
                aria-label={`Simplified Plinko game with ${rows} rows and ${multipliers.length} multiplier slots`}
            >
                <canvas
                    ref={canvasRef}
                    style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
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
                            Rows: {rows} | Slots: {multipliers.length}
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
                        {rows} Rows
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
                        Simplified: {rows}×{multipliers.length}
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
