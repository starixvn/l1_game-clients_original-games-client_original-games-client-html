import React, { useRef, useState, useEffect, useCallback, forwardRef, useImperativeHandle, useLayoutEffect, useMemo } from "react";
import { BallLayoutProps } from "../../../../shared/types";

// Import layer components
import BackgroundLayer from "./layers/BackgroundLayer";
import BoardLayer from "./layers/BoardLayer";
import PhysicsLayer, { PhysicsLayerRef, BallPathLayer, BallLayer } from "./layers/PhysicsLayer";
import usePlinkoBetStore from "@/shared/stores/plinko-bet-store";
import { useShallow } from "zustand/shallow";

export interface LayeredCanvasBallLayoutRef {
    spawnBall: (betValue?: number) => void;
    spawnBallWithPath: (betValue: number, path: number[], finalSlot: number, multiplier: number) => void;
    isReady: () => boolean;
}

/**
 * Layered Canvas Ball Layout Component
 *
 * This component implements the layered architecture we defined:
 * - Layer 1: Full Canvas Background (gradient, light effects, decorative elements, payout slots)
 * - Layer 2: Pin Visualization (pins within the triangular area)
 * - Layer 3: Physics Simulation (headless physics engine)
 * - Layer 4: Ball Rendering (balls using physics position data, clipped to triangular area)
 * - Layer 5: Ball Path Trails (trail effects above balls)
 * - Layer 6: UI Overlays (loading indicators, debug info, hover tooltips)
 */
const LayeredCanvasBallLayout = forwardRef<LayeredCanvasBallLayoutRef, BallLayoutProps>(
    ({ multipliers = [], probabilities = [], onBallHit }, ref) => {
        const { rows, betAmount } = usePlinkoBetStore(
            useShallow((state) => ({
                rows: state.numberOfRows,
                betAmount: state.betAmount,
            }))
        );
        const containerRef = useRef<HTMLDivElement>(null);
        const physicsLayerRef = useRef<PhysicsLayerRef>(null);
        const [containerSize, setContainerSize] = useState({ width: 400, height: 400 }); // Start with defaults
        const [isInitialized, setIsInitialized] = useState(false); // Wait for physics layer to be ready
        const [boardDimensions, setBoardDimensions] = useState<{
            topMargin: number;
            bottomMargin: number;
            leftMargin: number;
            rightMargin: number;
            boardWidth: number;
            boardHeight: number;
            boardX: number;
            triangleTopX: number;
            triangleTopY: number;
            triangleBottomLeftX: number;
            triangleBottomLeftY: number;
            triangleBottomRightX: number;
            triangleBottomRightY: number;
        } | null>(null);

        // Use refs for frequently changing physics data to prevent re-renders
        const ballPathsRef = useRef<Map<number, Array<{ x: number; y: number; timestamp: number; radius?: number }>>>(
            new Map()
        );
        const ballPositionsRef = useRef<Map<number, { x: number; y: number; radius: number; betValue: number }>>(
            new Map()
        );

        // State for triggering re-renders only when needed
        const [physicsUpdateTrigger, setPhysicsUpdateTrigger] = useState(0);

        // Callback for ball position updates from physics layer - throttled to prevent excessive re-renders
        const handleBallPositionsUpdate = useCallback(
            (positions: Map<number, { x: number; y: number; radius: number; betValue: number }>) => {
                ballPositionsRef.current = positions;
                // Only trigger re-render every few frames to reduce frequency
                if (physicsUpdateTrigger % 3 === 0) {
                    setPhysicsUpdateTrigger(prev => prev + 1);
                }
            },
            [physicsUpdateTrigger]
        );

        // Hover tooltip state
        const [hoveredMultiplier, setHoveredMultiplier] = useState<{
            multiplier: number;
            winAmount: number;
            probability: number;
            x: number;
            y: number;
        } | null>(null);

        // Memoized callback for board dimensions - optimized to prevent unnecessary re-renders
        const handleBoardDimensionsCalculated = useCallback(
            (dimensions: {
                topMargin: number;
                bottomMargin: number;
                leftMargin: number;
                rightMargin: number;
                boardWidth: number;
                boardHeight: number;
                boardX: number;
                triangleTopX: number;
                triangleTopY: number;
                triangleBottomLeftX: number;
                triangleBottomLeftY: number;
                triangleBottomRightX: number;
                triangleBottomRightY: number;
            }) => {
                // Use a simple reference comparison to avoid deep equality checks
                setBoardDimensions((prev) => {
                    if (!prev) return dimensions;

                    // Create a signature string for quick comparison
                    const prevSig = `${prev.topMargin},${prev.bottomMargin},${prev.boardWidth},${prev.boardHeight}`;
                    const newSig = `${dimensions.topMargin},${dimensions.bottomMargin},${dimensions.boardWidth},${dimensions.boardHeight}`;

                    return prevSig === newSig ? prev : dimensions;
                });
            },
            []
        );

        // Try to get container size as early as possible
        useLayoutEffect(() => {
            const updateSizeEarly = () => {
                if (containerRef.current) {
                    const rect = containerRef.current.getBoundingClientRect();
                    if (rect.width > 0 && rect.height > 0) {
                        setContainerSize({ width: rect.width, height: rect.height });
                    } else {
                        setContainerSize({ width: 400, height: 400 });
                    }
                } else {
                    setContainerSize({ width: 400, height: 400 });
                }
            };
            updateSizeEarly();
        }, []);

        // Debounced container resize handling to prevent excessive re-renders
        const resizeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

        // Handle container resize - debounced to prevent excessive re-renders
        useEffect(() => {
            const updateSize = (width: number, height: number) => {
                // Debounce updates to prevent excessive re-renders during resize
                if (resizeTimeoutRef.current) {
                    clearTimeout(resizeTimeoutRef.current);
                }

                resizeTimeoutRef.current = setTimeout(() => {
                    setContainerSize({ width, height });
                }, 100); // 100ms debounce
            };

            const handleResize = () => {
                if (containerRef.current) {
                    const rect = containerRef.current.getBoundingClientRect();
                    const computedStyle = window.getComputedStyle(containerRef.current);
                    const width = rect.width || parseInt(computedStyle.width) || 400;
                    const height = rect.height || parseInt(computedStyle.height) || 400;

                    if (width !== containerSize.width || height !== containerSize.height) {
                        updateSize(width, height);
                    }
                }
            };

            handleResize();

            // Set up ResizeObserver for responsive sizing
            const resizeObserver = new ResizeObserver((entries) => {
                const entry = entries[0];
                if (entry) {
                    const { width, height } = entry.contentRect;
                    if (width > 0 && height > 0 && (width !== containerSize.width || height !== containerSize.height)) {
                        updateSize(width, height);
                    }
                }
            });

            if (containerRef.current) {
                resizeObserver.observe(containerRef.current);
            }

            return () => {
                resizeObserver.disconnect();
                if (resizeTimeoutRef.current) {
                    clearTimeout(resizeTimeoutRef.current);
                }
            };
        }, [containerSize.width, containerSize.height]);

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
        }, [slotCalculationData]);

        // Expose methods for external use
        useImperativeHandle(
            ref,
            () => ({
                spawnBall: (betValue?: number) => {
                    if (physicsLayerRef.current && isInitialized) {
                        physicsLayerRef.current.spawnBall(betValue);
                    }
                },
                spawnBallWithPath: (betValue: number, path: number[], finalSlot: number, multiplier: number) => {
                    if (physicsLayerRef.current?.isReady()) {
                        physicsLayerRef.current.spawnBallWithPath(betValue, path, finalSlot, multiplier);
                    }
                },
                isReady: () => isInitialized && physicsLayerRef.current?.isReady(),
            }),
            [isInitialized]
        );

        // Check physics layer readiness
        useEffect(() => {
            let checkCount = 0;
            const maxChecks = 50; // Max 5 seconds of checking

            const checkPhysicsReady = () => {
                checkCount++;
                const isReady = physicsLayerRef.current?.isReady();

                if (isReady) {
                    setIsInitialized(true);
                } else if (checkCount >= maxChecks) {
                    setIsInitialized(true); // Force initialization to prevent infinite loading
                } else {
                    // Check again in 100ms
                    setTimeout(checkPhysicsReady, 100);
                }
            };

            // Start checking after a short delay to allow physics layer to mount
            setTimeout(checkPhysicsReady, 50);
        }, []);

        return (
            <div
                ref={containerRef}
                className="layered-canvas-ball-layout"
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
                aria-label={`Layered Plinko game with ${rows} rows and ${multipliers.length} multiplier slots`}
            >
                {/* Layer 1: Full Canvas Background */}
                {isInitialized && containerSize.width > 0 && containerSize.height > 0 && (
                    <BackgroundLayer
                        width={containerSize.width}
                        height={containerSize.height}
                        rows={rows}
                        multipliers={multipliers}
                        className="background-layer"
                    />
                )}

                {/* Layer 2: Pin Visualization */}
                {isInitialized && containerSize.width > 0 && containerSize.height > 0 && (
                    <BoardLayer
                        width={containerSize.width}
                        height={containerSize.height}
                        rows={rows}
                        multipliers={multipliers}
                        className="board-layer"
                        onBoardDimensionsCalculated={handleBoardDimensionsCalculated}
                    />
                )}

                {/* Layer 3: Physics Simulation (Clipped to Board) */}
                <PhysicsLayer
                    ref={physicsLayerRef}
                    rows={rows}
                    multipliers={multipliers}
                    probabilities={probabilities}
                    betAmount={betAmount}
                    onBallHit={onBallHit}
                    boardDimensions={boardDimensions}
                    ballPaths={ballPathsRef.current}
                    setBallPaths={(paths) => {
                        if (typeof paths === 'function') {
                            ballPathsRef.current = paths(ballPathsRef.current);
                        } else {
                            ballPathsRef.current = paths;
                        }
                        // Throttle re-renders for ball paths
                        setPhysicsUpdateTrigger(prev => prev + 1);
                    }}
                    onBallPositionsUpdate={handleBallPositionsUpdate}
                />

                {/* Layer 4: Ball Rendering (Above Physics) */}
                {isInitialized && containerSize.width > 0 && containerSize.height > 0 && (
                    <BallLayer
                        ballPositions={ballPositionsRef.current}
                        width={containerSize.width}
                        height={containerSize.height}
                        boardDimensions={boardDimensions}
                        className="ball-layer"
                    />
                )}

                {/* Layer 5: Ball Path Trails (Above Balls) */}
                {isInitialized && containerSize.width > 0 && containerSize.height > 0 && (
                    <BallPathLayer
                        ballPaths={ballPathsRef.current}
                        width={containerSize.width}
                        height={containerSize.height}
                        boardDimensions={boardDimensions}
                        className="ball-path-layer"
                    />
                )}

                {/* Layer 6: UI Overlays */}

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
                        Loading Layered Plinko Physics...
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
                        Layered: {rows}×{multipliers.length}
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
                        <div style={{ marginBottom: "4px", color: "#ffd700" }}>Win: ${hoveredMultiplier.winAmount.toFixed(0)}</div>
                        <div style={{ fontSize: "11px", color: "rgba(255, 255, 255, 0.8)" }}>
                            Chance: {(hoveredMultiplier.probability * 100).toFixed(1)}%
                        </div>
                    </div>
                )}
            </div>
        );
    }
);

LayeredCanvasBallLayout.displayName = "LayeredCanvasBallLayout";

export default LayeredCanvasBallLayout;
