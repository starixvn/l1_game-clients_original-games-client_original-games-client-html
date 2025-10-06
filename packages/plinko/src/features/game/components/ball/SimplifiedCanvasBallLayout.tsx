import React, { useRef, useState, useEffect, useCallback, forwardRef, useImperativeHandle, useMemo } from "react";
import { BallLayoutProps } from "../../../../shared/types";
import usePlinkoGameStore from "@/shared/stores/plinko-game-store";
import { useShallow } from "zustand/shallow";
import { usePhysicsEngine, useBallSpawner, useCanvas, useBallRenderer } from "./hooks";
import { logger } from "../../../../services/logger";
import { enableLogging } from "../../../../utils/enableLogging";
import { diagnosticTool } from "../../../../utils/diagnosticTool";

export interface SimplifiedCanvasBallLayoutRef {
    spawnBall: (betValue?: number) => void;
    spawnBallWithPath: (betValue: number, path: number[], finalSlot: number, multiplier: number) => void;
    isReady: () => boolean;
}

// Fixed canvas dimensions - canvas stays at original size regardless of container resize
const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 550;

/**
 * Refactored Simplified Canvas Ball Layout Component
 * 
 * This version uses custom hooks to separate concerns:
 * - usePhysicsEngine: Manages Matter.js physics engine
 * - useBallSpawner: Handles ball creation and spawning
 * - useCanvas: Manages canvas and container sizing
 * - useBallRenderer: Handles canvas rendering and animation
 * 
 * This makes the component much cleaner and more maintainable.
 */
const SimplifiedCanvasBallLayout = forwardRef<SimplifiedCanvasBallLayoutRef, BallLayoutProps>(
    ({ multipliers = [], probabilities = [], onBallHit }, ref) => {
        const { numberOfRows, betAmount } = usePlinkoGameStore(
            useShallow((state) => ({
                numberOfRows: state.numberOfRows,
                betAmount: state.betAmount,
            }))
        );

        // Enable logging for debugging
        useEffect(() => {
            enableLogging();
        }, []);

        // Run diagnostic when component is ready (moved after variable declarations)

        // Use canvas hook for container and canvas management
        const { containerRef, canvasRef, containerSize, canvasScale } = useCanvas({
            canvasWidth: CANVAS_WIDTH,
            canvasHeight: CANVAS_HEIGHT
        });

        // Use physics engine hook
        const {
            engine,
            runner,
            isInitialized,
            pins,
            multipliersBodies,
            walls,
            cleanupPhysics
        } = usePhysicsEngine({
            numberOfRows,
            multipliers,
            onBallHit,
            canvasWidth: CANVAS_WIDTH,
            canvasHeight: CANVAS_HEIGHT,
            containerSize
        });

        // Use ball spawner hook
        const { spawnBall, spawnBallWithPath } = useBallSpawner({
            numberOfRows,
            canvasWidth: CANVAS_WIDTH,
            engine
        });

        // Use ball renderer hook
        const { startRenderLoop, layoutData, slotRenderData } = useBallRenderer({
            numberOfRows,
            multipliers,
            canvasWidth: CANVAS_WIDTH,
            canvasHeight: CANVAS_HEIGHT,
            engine,
            pins,
            removedBallsRef: useRef(new Set<number>()) // This will be properly managed in the physics hook
        });

        // Hover tooltip state
        const [hoveredMultiplier, setHoveredMultiplier] = useState<{
            multiplier: number;
            winAmount: number;
            probability: number;
            x: number;
            y: number;
        } | null>(null);

        // Initialize canvas and start render loop when physics is ready
        useEffect(() => {
            if (!canvasRef.current || !isInitialized || !engine.current) {
                return;
            }

            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            // Set canvas to fixed original dimensions
            canvas.width = CANVAS_WIDTH;
            canvas.height = CANVAS_HEIGHT;

            // Start render loop with fixed canvas dimensions
            startRenderLoop(ctx, engine.current, { width: CANVAS_WIDTH, height: CANVAS_HEIGHT }, multipliers, pins, numberOfRows);
        }, [isInitialized, engine, startRenderLoop, multipliers, pins, numberOfRows]);

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
                const rect = containerRef.current?.getBoundingClientRect();
                if (!rect) return;

                const mouseX = event.clientX - rect.left;
                const mouseY = event.clientY - rect.top;

                // Check if mouse is in slot area
                if (mouseY >= slotAreaTop && mouseY <= slotAreaBottom) {
                    const slotIndex = findSlotIndex(mouseX, lastRowStartX, pegGap, slotWidth, numberOfSlots);
                    updateHoverState(slotIndex, event);
                } else {
                    updateHoverState(-1, event);
                }
            };

            const handleMouseLeave = () => {
                updateHoverState(-1, new MouseEvent('mouseleave'));
            };

            const container = containerRef.current;
            if (container) {
                container.addEventListener('mousemove', handleMouseMove, { passive: true });
                container.addEventListener('mouseleave', handleMouseLeave, { passive: true });
            }

            return () => {
                if (container) {
                    container.removeEventListener('mousemove', handleMouseMove);
                    container.removeEventListener('mouseleave', handleMouseLeave);
                }
            };
        }, [slotCalculationData, findSlotIndex, updateHoverState]);

        // Memoized imperative handle to prevent unnecessary re-renders
        const imperativeHandle = useMemo(() => ({
            spawnBall: (betValue?: number) => {
                logger.info('🎯 [COMPONENT] spawnBall called:', { betValue, isInitialized, hasEngine: !!engine.current });
                if (isInitialized && engine.current) {
                    spawnBall(betValue || 1);
                } else {
                    logger.warn('Cannot spawn ball: engine not ready', { isInitialized, hasEngine: !!engine.current });
                }
            },
            spawnBallWithPath: (betValue: number, path: number[], finalSlot: number, multiplier: number) => {
                logger.info('🎯 [COMPONENT] spawnBallWithPath called:', {
                    betValue,
                    path,
                    finalSlot,
                    multiplier,
                    isInitialized,
                    hasEngine: !!engine.current
                });
                if (isInitialized && engine.current) {
                    spawnBallWithPath(betValue, path, finalSlot, multiplier);
                } else {
                    logger.warn('Cannot spawn guided ball: engine not ready', { isInitialized, hasEngine: !!engine.current });
                }
            },
            isReady: () => isInitialized && !!engine.current,
        }), [isInitialized, engine, spawnBall, spawnBallWithPath]);

        useImperativeHandle(ref, () => imperativeHandle, [imperativeHandle]);

        // Make diagnostic tool available globally for manual debugging
        useEffect(() => {
            if (isInitialized) {
                // Make the component ref available globally for debugging
                (window as any).plinkoComponentRef = { current: imperativeHandle };
                (window as any).plinkoDiagnostic = diagnosticTool;
            }
        }, [isInitialized, imperativeHandle]);

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
                        transform: `translate(-50%, -50%) scale(${canvasScale})`,
                        width: `${CANVAS_WIDTH}px`,
                        height: `${CANVAS_HEIGHT}px`,
                        zIndex: 1,
                        transformOrigin: "center center",
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