import React, { useRef, useState, useEffect, useCallback, forwardRef, useImperativeHandle, useLayoutEffect } from 'react';
import { BallLayoutProps } from '../../../shared/types';

// Import layer components
import BackgroundLayer from './layers/BackgroundLayer';
import BoardLayer from './layers/BoardLayer';
import PhysicsLayer, { PhysicsLayerRef, BallPathLayer } from './layers/PhysicsLayer';

export interface LayeredCanvasBallLayoutRef {
    spawnBall: (betValue?: number) => void;
    spawnBallWithPath: (betValue: number, path: number[], finalSlot: number, multiplier: number) => void;
}

/**
 * Layered Canvas Ball Layout Component
 *
 * This component implements the layered architecture we defined:
 * - Layer 1: Full Canvas Background (gradient, light effects, decorative elements, payout slots)
 * - Layer 2: Triangular Board Area (board background, borders, pin visualization)
 * - Layer 3: Physics Simulation (clipped to triangular board area)
 * - Layer 4: UI Overlays (loading indicators, debug info, hover tooltips)
 */
const LayeredCanvasBallLayout = forwardRef<LayeredCanvasBallLayoutRef, BallLayoutProps>(
    ({ rows, multipliers = [], probabilities = [], betAmount = 100, onBallHit }, ref) => {
        console.log('🔄 LayeredCanvasBallLayout component STARTED with props:', {
            rows,
            multipliersLength: multipliers.length,
            multipliers: multipliers.slice(0, 5), // Log first 5 multipliers
            probabilitiesLength: probabilities.length,
            betAmount,
            hasOnBallHit: !!onBallHit,
            hasRef: !!ref,
            timestamp: new Date().toISOString()
        });

        const containerRef = useRef<HTMLDivElement>(null);
        const physicsLayerRef = useRef<PhysicsLayerRef>(null);
        const [containerSize, setContainerSize] = useState({ width: 400, height: 400 }); // Start with defaults
        const [isInitialized] = useState(true); // Start as initialized
        const [boardDimensions, setBoardDimensions] = useState<{
            topMargin: number;
            bottomMargin: number;
            leftMargin: number;
            rightMargin: number;
            boardWidth: number;
            boardHeight: number;
            boardX: number;
        } | null>(null);

        const [ballPaths, setBallPaths] = useState<Map<number, Array<{ x: number, y: number, timestamp: number }>>>(new Map());

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
        }) => {
            setBoardDimensions(dimensions);
        }, []);

        // Try to get container size as early as possible
        useLayoutEffect(() => {
            console.log('🎯 useLayoutEffect: Attempting early container size detection');
            const updateSizeEarly = () => {
                if (containerRef.current) {
                    const rect = containerRef.current.getBoundingClientRect();
                    console.log('🎯 useLayoutEffect: Container rect:', {
                        width: rect.width,
                        height: rect.height,
                        top: rect.top,
                        left: rect.left
                    });
                    if (rect.width > 0 && rect.height > 0) {
                        console.log('✅ useLayoutEffect: Setting container size:', { width: rect.width, height: rect.height });
                        setContainerSize({ width: rect.width, height: rect.height });
                    } else {
                        console.log('❌ useLayoutEffect: Invalid container dimensions, using fallback');
                        setContainerSize({ width: 400, height: 400 });
                    }
                } else {
                    console.log('❌ useLayoutEffect: No container ref available');
                }
            };
            updateSizeEarly();
        }, []);

        // Handle container resize
        useEffect(() => {
            console.log('🎯 Container resize useEffect triggered');
            const updateSize = () => {
                if (containerRef.current) {
                    const rect = containerRef.current.getBoundingClientRect();
                    const computedStyle = window.getComputedStyle(containerRef.current);
                    const width = rect.width || parseInt(computedStyle.width) || 400;
                    const height = rect.height || parseInt(computedStyle.height) || 400;

                    console.log('🎯 Container size:', { width, height });

                    setContainerSize({ width, height });
                } else {
                    console.log('🎯 Container ref is null, setting defaults');
                    setContainerSize({ width: 400, height: 400 });
                }
            };

            // Update size but don't change isInitialized since it starts as true
            console.log('🎯 Updating container size');
            updateSize();
            console.log('🎯 updateSize completed');

            // Set up ResizeObserver for responsive sizing
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
                console.log('🎯 LayeredCanvasBallLayout.spawnBall called:', {
                    betValue,
                    isInitialized,
                    hasPhysicsRef: !!physicsLayerRef.current,
                    timestamp: new Date().toISOString()
                });

                if (physicsLayerRef.current && isInitialized) {
                    console.log('✅ Calling physicsLayerRef.current.spawnBall');
                    physicsLayerRef.current.spawnBall(betValue);
                } else {
                    console.error('❌ Cannot spawn ball - physics layer not ready:', {
                        hasPhysicsRef: !!physicsLayerRef.current,
                        isInitialized,
                        containerSize
                    });
                }
            },
            spawnBallWithPath: (betValue: number, path: number[], finalSlot: number, multiplier: number) => {
                console.log('🎯 LayeredCanvasBallLayout.spawnBallWithPath called:', {
                    betValue,
                    path,
                    finalSlot,
                    multiplier,
                    isInitialized,
                    hasPhysicsRef: !!physicsLayerRef.current,
                    containerSize,
                    timestamp: new Date().toISOString()
                });

                if (physicsLayerRef.current && physicsLayerRef.current.isReady()) {
                    console.log('✅ Calling physicsLayerRef.current.spawnBallWithPath with params:', {
                        betValue,
                        path,
                        pathLength: path.length,
                        finalSlot,
                        multiplier
                    });
                    physicsLayerRef.current.spawnBallWithPath(betValue, path, finalSlot, multiplier);
                    console.log('✅ spawnBallWithPath call completed');
                } else {
                    console.error('❌ Cannot spawn ball with path - physics layer not ready:', {
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

        // Debug: Log when isInitialized changes
        useEffect(() => {
            console.log('🎯 isInitialized changed to:', isInitialized);
        }, [isInitialized]);

        // Force initialization on mount
        useEffect(() => {
            console.log('🎯 Force initialization useEffect triggered');
            console.log('🎯 Current state:', { isInitialized, containerSize });
        }, []);

        console.log('🎯 LayeredCanvasBallLayout render conditions:', {
            isInitialized,
            containerSize,
            boardDimensions: boardDimensions ? 'set' : 'null',
            multipliersLength: multipliers.length,
            timestamp: new Date().toISOString()
        });

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
                {(() => {
                    const shouldRender = isInitialized && containerSize.width > 0 && containerSize.height > 0;
                    console.log('🎯 BackgroundLayer render condition:', shouldRender, { containerSize, isInitialized });
                    if (shouldRender) {
                        console.log('✅ Rendering BackgroundLayer');
                        return (
                            <BackgroundLayer
                                width={containerSize.width}
                                height={containerSize.height}
                                className="background-layer"
                            />
                        );
                    }
                    console.log('❌ Skipping BackgroundLayer render');
                    return null;
                })()}

                {/* Layer 2: Triangular Board Area */}
                {(() => {
                    const shouldRender = isInitialized && containerSize.width > 0 && containerSize.height > 0;
                    console.log('🎯 BoardLayer render condition:', shouldRender, { containerSize, isInitialized });
                    if (shouldRender) {
                        console.log('✅ Rendering BoardLayer');
                        return (
                            <BoardLayer
                                width={containerSize.width}
                                height={containerSize.height}
                                rows={rows}
                                multipliers={multipliers}
                                className="board-layer"
                                onBoardDimensionsCalculated={handleBoardDimensionsCalculated}
                            />
                        );
                    }
                    console.log('❌ Skipping BoardLayer render');
                    return null;
                })()}

                {/* Layer 3: Physics Simulation (Clipped to Board) */}
                {(() => {
                    const shouldRender = isInitialized;
                    console.log('🎯 PhysicsLayer render condition:', shouldRender, {
                        hasBoardDimensions: !!boardDimensions,
                        boardDimensions
                    });
                    if (shouldRender) {
                        console.log('✅ Rendering PhysicsLayer');
                        return (
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
                            />
                        );
                    }
                    console.log('❌ Skipping PhysicsLayer render');
                    return null;
                })()}

                {/* Layer 4: Ball Path Trails (Above Physics) */}
                {(() => {
                    const shouldRender = isInitialized && containerSize.width > 0 && containerSize.height > 0;
                    console.log('🎯 BallPathLayer render condition:', shouldRender, {
                        ballPathsCount: ballPaths.size,
                        hasBoardDimensions: !!boardDimensions
                    });
                    if (shouldRender) {
                        console.log('✅ Rendering BallPathLayer');
                        return (
                            <BallPathLayer
                                ballPaths={ballPaths}
                                width={containerSize.width}
                                height={containerSize.height}
                                boardDimensions={boardDimensions}
                                className="ball-path-layer"
                            />
                        );
                    }
                    console.log('❌ Skipping BallPathLayer render');
                    return null;
                })()}

                {/* Layer 5: UI Overlays */}

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
