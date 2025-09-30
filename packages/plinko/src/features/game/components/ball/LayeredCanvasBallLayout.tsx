import React, { useRef, useState, useEffect, useCallback, forwardRef, useImperativeHandle, useLayoutEffect } from 'react';
import { BallLayoutProps } from '../../../../shared/types';
import { logger } from '../../../../services/logger';

// Import layer components
import BackgroundLayer from './layers/BackgroundLayer';
import BoardLayer from './layers/BoardLayer';
import PhysicsLayer, { PhysicsLayerRef, BallPathLayer, BallLayer } from './layers/PhysicsLayer';

export interface LayeredCanvasBallLayoutRef {
    spawnBall: (betValue?: number) => void;
    spawnBallWithPath: (betValue: number, path: number[], finalSlot: number, multiplier: number) => void;
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
    ({ rows, multipliers = [], probabilities = [], betAmount = 100, onBallHit }, ref) => {
        logger.info('🎬 [LAYERED_CANVAS] LayeredCanvasBallLayout component initializing', {
            rows,
            multipliersCount: multipliers.length,
            probabilitiesCount: probabilities.length,
            betAmount,
            hasOnBallHit: !!onBallHit,
            timestamp: new Date().toISOString()
        });

        const containerRef = useRef<HTMLDivElement>(null);
        const physicsLayerRef = useRef<PhysicsLayerRef>(null);
        const [containerSize, setContainerSize] = useState({ width: 400, height: 400 }); // Start with defaults
        const [isInitialized] = useState(true); // Start as initialized

        logger.debug('🎬 [LAYERED_CANVAS] Component state initialized', {
            initialContainerSize: { width: 400, height: 400 },
            isInitialized: true,
            hasContainerRef: !!containerRef.current,
            hasPhysicsRef: !!physicsLayerRef.current
        });
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

        const [ballPaths, setBallPaths] = useState<Map<number, Array<{ x: number, y: number, timestamp: number, radius?: number }>>>(new Map());
        const [ballPositions, setBallPositions] = useState<Map<number, { x: number, y: number, radius: number, betValue: number }>>(new Map());

        // Callback for ball position updates from physics layer
        const handleBallPositionsUpdate = useCallback((positions: Map<number, { x: number, y: number, radius: number, betValue: number }>) => {
            logger.debug('🎯 [LAYERED_CANVAS] Ball positions updated from physics layer', {
                ballCount: positions.size,
                ballIds: Array.from(positions.keys()),
                timestamp: new Date().toISOString()
            });
            setBallPositions(positions);
        }, []);

        // Hover tooltip state
        const [hoveredMultiplier, setHoveredMultiplier] = useState<{
            multiplier: number;
            winAmount: number;
            probability: number;
            x: number;
            y: number;
        } | null>(null);

        // Memoized callback for board dimensions
        const handleBoardDimensionsCalculated = useCallback((dimensions: {
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
            logger.info('📐 [LAYERED_CANVAS] Board dimensions calculated from BoardLayer', {
                boardDimensions: {
                    topMargin: dimensions.topMargin.toFixed(1),
                    bottomMargin: dimensions.bottomMargin.toFixed(1),
                    leftMargin: dimensions.leftMargin.toFixed(1),
                    rightMargin: dimensions.rightMargin.toFixed(1),
                    boardWidth: dimensions.boardWidth.toFixed(1),
                    boardHeight: dimensions.boardHeight.toFixed(1),
                    boardX: dimensions.boardX.toFixed(1)
                },
                triangleCoordinates: {
                    topX: dimensions.triangleTopX.toFixed(1),
                    topY: dimensions.triangleTopY.toFixed(1),
                    bottomLeftX: dimensions.triangleBottomLeftX.toFixed(1),
                    bottomLeftY: dimensions.triangleBottomLeftY.toFixed(1),
                    bottomRightX: dimensions.triangleBottomRightX.toFixed(1),
                    bottomRightY: dimensions.triangleBottomRightY.toFixed(1)
                },
                timestamp: new Date().toISOString()
            });

            // Only update if dimensions actually changed
            setBoardDimensions(prev => {
                if (!prev ||
                    prev.topMargin !== dimensions.topMargin ||
                    prev.bottomMargin !== dimensions.bottomMargin ||
                    prev.leftMargin !== dimensions.leftMargin ||
                    prev.rightMargin !== dimensions.rightMargin ||
                    prev.boardWidth !== dimensions.boardWidth ||
                    prev.boardHeight !== dimensions.boardHeight ||
                    prev.boardX !== dimensions.boardX ||
                    prev.triangleTopX !== dimensions.triangleTopX ||
                    prev.triangleTopY !== dimensions.triangleTopY ||
                    prev.triangleBottomLeftX !== dimensions.triangleBottomLeftX ||
                    prev.triangleBottomLeftY !== dimensions.triangleBottomLeftY ||
                    prev.triangleBottomRightX !== dimensions.triangleBottomRightX ||
                    prev.triangleBottomRightY !== dimensions.triangleBottomRightY) {

                    logger.debug('📐 [LAYERED_CANVAS] Board dimensions updated (changed from previous)', {
                        hasPreviousDimensions: !!prev,
                        dimensionsChanged: true
                    });
                    return dimensions;
                }

                logger.debug('📐 [LAYERED_CANVAS] Board dimensions unchanged (same as previous)', {
                    hasPreviousDimensions: !!prev,
                    dimensionsChanged: false
                });
                return prev;
            });
        }, []);

        // Try to get container size as early as possible
        useLayoutEffect(() => {
            const updateSizeEarly = () => {
                if (containerRef.current) {
                    const rect = containerRef.current.getBoundingClientRect();
                    if (rect.width > 0 && rect.height > 0) {
                        logger.debug('📏 [LAYERED_CANVAS] Early container size detected', {
                            width: rect.width.toFixed(1),
                            height: rect.height.toFixed(1),
                            source: 'getBoundingClientRect'
                        });
                        setContainerSize({ width: rect.width, height: rect.height });
                    } else {
                        logger.debug('📏 [LAYERED_CANVAS] Using default container size (early)', {
                            width: 400,
                            height: 400,
                            reason: 'getBoundingClientRect returned zero dimensions'
                        });
                        setContainerSize({ width: 400, height: 400 });
                    }
                } else {
                    logger.debug('📏 [LAYERED_CANVAS] Container ref not available (early)', {
                        width: 400,
                        height: 400,
                        reason: 'containerRef.current is null'
                    });
                    setContainerSize({ width: 400, height: 400 });
                }
            };
            updateSizeEarly();
        }, []);

        // Handle container resize
        useEffect(() => {
            const updateSize = () => {
                if (containerRef.current) {
                    const rect = containerRef.current.getBoundingClientRect();
                    const computedStyle = window.getComputedStyle(containerRef.current);
                    const width = rect.width || parseInt(computedStyle.width) || 400;
                    const height = rect.height || parseInt(computedStyle.height) || 400;

                    logger.debug('📏 [LAYERED_CANVAS] Container size updated', {
                        width: width.toFixed(1),
                        height: height.toFixed(1),
                        rectWidth: rect.width.toFixed(1),
                        rectHeight: rect.height.toFixed(1),
                        computedWidth: computedStyle.width,
                        computedHeight: computedStyle.height,
                        source: 'updateSize'
                    });

                    setContainerSize({ width, height });
                } else {
                    logger.debug('📏 [LAYERED_CANVAS] Using default container size (resize)', {
                        width: 400,
                        height: 400,
                        reason: 'containerRef.current is null'
                    });
                    setContainerSize({ width: 400, height: 400 });
                }
            };

            updateSize();

            // Set up ResizeObserver for responsive sizing
            const resizeObserver = new ResizeObserver((entries) => {
                const entry = entries[0];
                if (entry) {
                    const { width, height } = entry.contentRect;
                    if (width > 0 && height > 0) {
                        logger.debug('📏 [LAYERED_CANVAS] Container resized via ResizeObserver', {
                            width: width.toFixed(1),
                            height: height.toFixed(1),
                            source: 'ResizeObserver'
                        });
                        setContainerSize({ width, height });
                    }
                }
            });

            if (containerRef.current) {
                resizeObserver.observe(containerRef.current);
                logger.debug('📏 [LAYERED_CANVAS] ResizeObserver attached to container');
            }

            return () => {
                logger.debug('📏 [LAYERED_CANVAS] ResizeObserver disconnected');
                resizeObserver.disconnect();
            };
        }, []);

        // Handle mouse events for hover tooltips
        useEffect(() => {
            const handleMouseMove = (event: MouseEvent) => {
                if (!containerRef.current) return;

                const rect = containerRef.current.getBoundingClientRect();
                const mouseX = event.clientX - rect.left;
                const mouseY = event.clientY - rect.top;

                // Check if mouse is over payout slot area
                const slotAreaTop = containerSize.height * 0.85; // Bottom 15% of container
                if (mouseY > slotAreaTop && multipliers.length > 0) {
                    const slotWidth = Math.max(25, Math.min(60, containerSize.width / multipliers.length * 0.85));
                    const slotIndex = Math.floor(mouseX / slotWidth);

                    if (slotIndex >= 0 && slotIndex < multipliers.length) {
                        const multiplier = multipliers[slotIndex];
                        const probability = probabilities[slotIndex] || 0;
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
                } else {
                    setHoveredMultiplier(null);
                }
            };

            const handleMouseLeave = () => {
                setHoveredMultiplier(null);
            };

            if (containerRef.current) {
                containerRef.current.addEventListener('mousemove', handleMouseMove);
                containerRef.current.addEventListener('mouseleave', handleMouseLeave);
            }

            return () => {
                if (containerRef.current) {
                    containerRef.current.removeEventListener('mousemove', handleMouseMove);
                    containerRef.current.removeEventListener('mouseleave', handleMouseLeave);
                }
            };
        }, [containerSize, multipliers, probabilities, betAmount]);

        // Expose methods for external use
        useImperativeHandle(ref, () => ({
            spawnBall: (betValue?: number) => {
                logger.info('🎯 [LAYERED_CANVAS] spawnBall method called', {
                    betValue,
                    isInitialized,
                    hasPhysicsRef: !!physicsLayerRef.current,
                    containerSize,
                    timestamp: new Date().toISOString()
                });

                if (physicsLayerRef.current && isInitialized) {
                    logger.info('✅ [LAYERED_CANVAS] Calling physicsLayerRef.current.spawnBall', {
                        betValue,
                        physicsLayerReady: true
                    });
                    physicsLayerRef.current.spawnBall(betValue);
                } else {
                    logger.error('❌ [LAYERED_CANVAS] Cannot spawn ball - physics layer not ready', {
                        hasPhysicsRef: !!physicsLayerRef.current,
                        isInitialized,
                        containerSize,
                        physicsLayerReady: physicsLayerRef.current?.isReady?.() ?? false
                    });
                }
            },
            spawnBallWithPath: (betValue: number, path: number[], finalSlot: number, multiplier: number) => {
                logger.info('🎯 [LAYERED_CANVAS] spawnBallWithPath method called', {
                    betValue,
                    path,
                    pathLength: path.length,
                    finalSlot,
                    multiplier,
                    isInitialized,
                    hasPhysicsRef: !!physicsLayerRef.current,
                    containerSize,
                    timestamp: new Date().toISOString()
                });

                if (physicsLayerRef.current && physicsLayerRef.current.isReady()) {
                    logger.info('✅ [LAYERED_CANVAS] Calling physicsLayerRef.current.spawnBallWithPath', {
                        betValue,
                        path,
                        pathLength: path.length,
                        finalSlot,
                        multiplier,
                        physicsLayerReady: true
                    });
                    physicsLayerRef.current.spawnBallWithPath(betValue, path, finalSlot, multiplier);
                    logger.info('✅ [LAYERED_CANVAS] spawnBallWithPath call completed');
                } else {
                    logger.error('❌ [LAYERED_CANVAS] Cannot spawn ball with path - physics layer not ready', {
                        hasPhysicsRef: !!physicsLayerRef.current,
                        isPhysicsReady: physicsLayerRef.current?.isReady?.() ?? false,
                        isInitialized,
                        containerSize,
                        pathLength: path.length,
                        expectedRows: rows
                    });
                }
            }
        }), [isInitialized]);


        // Force initialization on mount
        useEffect(() => {
            logger.info('🎬 [LAYERED_CANVAS] Component mounted and initialized', {
                rows,
                multipliersCount: multipliers.length,
                containerSize,
                hasBoardDimensions: !!boardDimensions,
                timestamp: new Date().toISOString()
            });
        }, []);

        return (
            <div
                ref={containerRef}
                className="layered-canvas-ball-layout"
                style={{
                    width: '100%',
                    height: '100%',
                    minHeight: '400px',
                    position: 'relative',
                    overflow: 'hidden',
                    backgroundColor: '#0f0f23',
                    borderRadius: '8px',
                    boxSizing: 'border-box',
                    transition: 'all 0.5s ease'
                }}
                aria-label={`Layered Plinko game with ${rows} rows and ${multipliers.length} multiplier slots`}
            >
                {/* Layer 1: Full Canvas Background */}
                {isInitialized && containerSize.width > 0 && containerSize.height > 0 && (
                    <BackgroundLayer
                        width={containerSize.width}
                        height={containerSize.height}
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
                {isInitialized && (
                    <PhysicsLayer
                        ref={physicsLayerRef}
                        rows={rows}
                        multipliers={multipliers}
                        probabilities={probabilities}
                        betAmount={betAmount}
                        onBallHit={onBallHit}
                        boardDimensions={boardDimensions}
                        ballPaths={ballPaths}
                        setBallPaths={setBallPaths}
                        onBallPositionsUpdate={handleBallPositionsUpdate}
                    />
                )}

                {/* Layer 4: Ball Rendering (Above Physics) */}
                {isInitialized && containerSize.width > 0 && containerSize.height > 0 && (
                    <BallLayer
                        ballPositions={ballPositions}
                        width={containerSize.width}
                        height={containerSize.height}
                        boardDimensions={boardDimensions}
                        className="ball-layer"
                    />
                )}

                {/* Layer 5: Ball Path Trails (Above Balls) */}
                {isInitialized && containerSize.width > 0 && containerSize.height > 0 && (
                    <BallPathLayer
                        ballPaths={ballPaths}
                        width={containerSize.width}
                        height={containerSize.height}
                        boardDimensions={boardDimensions}
                        className="ball-path-layer"
                    />
                )}

                {/* Layer 6: UI Overlays */}

                {/* Loading Indicator */}
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
                        Loading Layered Plinko Physics...
                        <br />
                        <small>Rows: {rows} | Slots: {multipliers.length}</small>
                    </div>
                )}

                {/* Row Count Badge */}
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

                {/* Debug Info Overlay (Development Mode) */}
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
                        Layered: {rows}×{multipliers.length}
                    </div>
                )}

                {/* Hover Tooltip */}
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
    }
);

LayeredCanvasBallLayout.displayName = 'LayeredCanvasBallLayout';

export default LayeredCanvasBallLayout;
