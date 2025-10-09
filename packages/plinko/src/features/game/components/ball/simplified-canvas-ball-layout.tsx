import React, { useRef, forwardRef, useImperativeHandle, useMemo } from "react";
import { BallLayoutProps } from "../../../../shared/types";
import { usePlinkoGameStore } from "../../../../shared/stores/plinko-game-store";
import { useShallow } from "zustand/shallow";
import { usePhysicsEngine, useBallSpawner, useCanvas, useBallRenderer } from "./hooks";
import { logger } from "../../../../services/logger";
import { HoverManager, EventHandler, CanvasContainer, LoadingIndicator, GameOverlay } from "./components";
import { calculateSlotCalculationData } from "./rendering";

import { BallGameCalculation } from "./physics/calculations/ball-game-calculation";

export interface SimplifiedCanvasBallLayoutRef {
    spawnBallWithPath: (
        betValue: number,
        path: number[],
        finalSlot: number,
        multiplier: number,
        serverRows?: number,
        roundId?: number
    ) => void;
    spawnBallWithCalculation: (calculation: BallGameCalculation, roundId?: number) => void;
    forceReinitializePhysics: (newRows: number) => void;
    isReady: () => boolean;
}

// Fixed canvas dimensions - canvas stays at original size regardless of container resize
import { CANVAS_CONSTANTS } from "./physics/constants/canvas-constants";

const CANVAS_WIDTH = CANVAS_CONSTANTS.DIMENSIONS.DEFAULT_WIDTH;
const CANVAS_HEIGHT = CANVAS_CONSTANTS.DIMENSIONS.DEFAULT_HEIGHT;

/**
 * Refactored Simplified Canvas Ball Layout Component
 *
 * This version follows SOLID principles with separated concerns:
 * - BallLayoutCoordinator: Main orchestration component
 * - HoverManager: Handles hover state and tooltips
 * - EventHandler: Manages mouse events
 * - CanvasContainer: Handles canvas setup and rendering
 * - LoadingIndicator: Shows loading state
 * - GameOverlay: Displays badges and overlays
 *
 * Each component has a single responsibility and can be tested independently.
 */
const SimplifiedCanvasBallLayout = forwardRef<SimplifiedCanvasBallLayoutRef, BallLayoutProps>(
    ({ multipliers = [], probabilities = [], onBallHit, onBallLanded }, ref) => {
        const { numberOfRows, betAmount, gameMode } = usePlinkoGameStore(
            useShallow((state) => ({
                numberOfRows: state.numberOfRows,
                betAmount: state.betAmount,
                gameMode: state.gameMode,
            }))
        );

        // Use canvas hook for container and canvas management
        const { containerSize, canvasScale } = useCanvas({
            canvasWidth: CANVAS_WIDTH,
            canvasHeight: CANVAS_HEIGHT,
        });

        // Use physics engine hook
        const { engine, isInitialized, pins, forceReinitialize } = usePhysicsEngine({
            numberOfRows,
            multipliers,
            gameMode,
            onBallHit,
            onBallLanded,
            canvasWidth: CANVAS_WIDTH,
            canvasHeight: CANVAS_HEIGHT,
            containerSize,
            baseRows: 8, // Use 8 rows as the baseline for scaling calculations
        });

        // Use ball spawner hook
        const { spawnBallWithPath, spawnBallWithCalculation } = useBallSpawner({
            numberOfRows,
            canvasWidth: CANVAS_WIDTH,
            engine,
        });

        // Use ball renderer hook
        const { startRenderLoop, layoutData } = useBallRenderer({
            numberOfRows,
            multipliers,
            gameMode,
            canvasWidth: CANVAS_WIDTH,
            canvasHeight: CANVAS_HEIGHT,
            removedBallsRef: useRef(new Set<number>()), // This will be properly managed in the physics hook
        });

        // Memoized slot calculation data using layoutData for consistency
        const slotCalculationData = useMemo(
            () => (layoutData ? calculateSlotCalculationData(layoutData, multipliers, probabilities, betAmount) : null),
            [layoutData, multipliers, probabilities, betAmount]
        );

        // Memoized imperative handle to prevent unnecessary re-renders
        const imperativeHandle = useMemo(
            () => ({
                spawnBallWithPath: (betValue: number, path: number[], finalSlot: number, multiplier: number, serverRows?: number) => {
                    // Only log in development mode to reduce noise
                    if (process.env.NODE_ENV === "development") {
                        logger.debug("🎯 [COMPONENT] spawnBallWithPath called", { betValue, finalSlot, multiplier, serverRows });
                    }
                    if (isInitialized && engine.current) {
                        spawnBallWithPath(betValue, path, finalSlot, multiplier, serverRows);
                    } else if (process.env.NODE_ENV === "development") {
                        logger.warn("Cannot spawn guided ball: engine not ready");
                    }
                },
                forceReinitializePhysics: (newRows: number) => {
                    if (forceReinitialize) {
                        forceReinitialize(newRows);
                    } else if (process.env.NODE_ENV === "development") {
                        logger.warn("Cannot force reinitialize physics: forceReinitialize not available");
                    }
                },
                isReady: () => isInitialized && !!engine.current,
                spawnBallWithCalculation: (calculation: BallGameCalculation) => {
                    if (!isInitialized || !engine) {
                        logger.warn("⚠️ [COMPONENT] spawnBallWithCalculation called but not initialized", {
                            isInitialized,
                            hasEngine: !!engine,
                        });
                        return;
                    }

                    logger.info("🎯 [PRE-CALC] Spawning ball with pre-calculated data", {
                        calculationId: calculation.id,
                        betValue: calculation.serviceResult.betValue,
                        pathLength: calculation.serviceResult.path.length,
                        finalSlot: calculation.expectedFinalSlot,
                        winAmount: calculation.winAmount,
                    });

                    try {
                        // Use the ball spawner with the pre-calculated data
                        // The calculation contains all the physics data needed
                        spawnBallWithCalculation(calculation);

                        logger.debug("✅ [PRE-CALC] Ball spawn initiated with calculation data", {
                            calculationId: calculation.id,
                            trajectoryPoints: calculation.trajectory.positions.length,
                            collisionEvents: calculation.collisions.length,
                            predictionConfidence: calculation.predictionConfidence.toFixed(3),
                        });
                    } catch (error) {
                        logger.error("❌ [PRE-CALC] Error spawning ball with calculation", {
                            error,
                            calculationId: calculation.id,
                        });
                        throw error;
                    }
                },
            }),
            [isInitialized, engine, spawnBallWithPath, spawnBallWithCalculation, forceReinitialize]
        );

        useImperativeHandle(ref, () => imperativeHandle, [imperativeHandle]);

        return (
            <HoverManager slotCalculationData={slotCalculationData} betAmount={betAmount}>
                {(hoveredData, updateHover) => (
                    <EventHandler slotCalculationData={slotCalculationData} onHoverUpdate={updateHover}>
                        {(containerRef) => (
                            <div
                                ref={containerRef}
                                className="simplified-canvas-ball-layout"
                                style={{
                                    width: CANVAS_CONSTANTS.CSS.FULL_SIZE,
                                    height: CANVAS_CONSTANTS.CSS.FULL_SIZE,
                                    minHeight: "550px",
                                    position: "relative",
                                    overflow: "hidden",
                                    borderRadius: "8px",
                                    boxSizing: "border-box",
                                    transition: "all 0.5s ease",
                                }}
                                aria-label={`Simplified Plinko game with ${numberOfRows} rows and ${multipliers.length} multiplier slots`}
                            >
                                <CanvasContainer
                                    canvasWidth={CANVAS_WIDTH}
                                    canvasHeight={CANVAS_HEIGHT}
                                    canvasScale={canvasScale}
                                    isInitialized={isInitialized}
                                    multipliers={multipliers}
                                    pins={pins}
                                    numberOfRows={numberOfRows}
                                    startRenderLoop={startRenderLoop}
                                    engine={engine}
                                />

                                <LoadingIndicator isInitialized={isInitialized} numberOfRows={numberOfRows} multipliers={multipliers} />

                                <GameOverlay isInitialized={isInitialized} numberOfRows={numberOfRows} multipliers={multipliers} />
                            </div>
                        )}
                    </EventHandler>
                )}
            </HoverManager>
        );
    }
);

SimplifiedCanvasBallLayout.displayName = "SimplifiedCanvasBallLayout";

export default SimplifiedCanvasBallLayout;
