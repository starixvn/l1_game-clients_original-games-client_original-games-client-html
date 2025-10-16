"use client";
import PlinkoCanvas from "./canvas";
import { usePlinkoGameStore } from "@plinko/shared/stores/plinko-game-store";
import { PLINKO_CANVAS_SCALE } from "./constant";
import Slots from "./slots";
import { logger } from "@plinko/services/logger";
import { LoggerControls } from "@plinko/features/ui/components";
import React, { useEffect, useRef, useCallback, useMemo, useState } from "react";
import { isMobile, isTablet, isDesktop } from "react-device-detect";
import {
    logMainContainer,
    logCanvasContainer,
    logSlotsContainer,
    logCanvasSlotsRelationship,
    logLayoutAnalysis,
    checkCanvasScaling
} from "./logging-utils";

interface GameProps {
    gameFrameWrapperWithoutBackgroundRef?: React.RefObject<HTMLDivElement>;
}

const Game = React.forwardRef<{ getScaledHeight: () => number; getWrapperScale: () => number }, GameProps>((props, ref) => {
    const { gameFrameWrapperWithoutBackgroundRef } = props;
    logger.startWorkflow('plinko-canvas-game-init', 'ui', 'Initialize Plinko canvas game component');

    const numberOfRows = usePlinkoGameStore((state) => state.numberOfRows);
    const scaleValue = PLINKO_CANVAS_SCALE[numberOfRows];

    // Mobile detection - only apply scaling on mobile devices

    // Store viewport width in state, only update on resize to prevent scale changes on clicks
    const [viewportWidth, setViewportWidth] = useState(() => window.innerWidth);

    // Refs for detailed dimension logging
    const mainContainerRef = useRef<HTMLDivElement>(null);
    const canvasContainerRef = useRef<HTMLDivElement>(null);
    const slotsContainerRef = useRef<HTMLDivElement>(null);







    // Comprehensive logging function for all container relationships
    const logContainerRelationships = useCallback(() => {
        const mainContainer = mainContainerRef.current;
        const canvasContainer = canvasContainerRef.current;
        const slotsContainer = slotsContainerRef.current;

        if (!mainContainer) {
            logger.logUIEvent('game-containers-check', {
                found: false,
                message: 'Main game container not found in DOM'
            });
            return;
        }

        const mainRect = mainContainer.getBoundingClientRect();
        const mainComputedStyle = window.getComputedStyle(mainContainer);

        // Log each container separately
        logMainContainer(mainContainer, mainRect, mainComputedStyle);

        if (canvasContainer) {
            logCanvasContainer(canvasContainer, mainRect, scaleValue, numberOfRows);
        }

        if (slotsContainer) {
            logSlotsContainer(slotsContainer, mainRect);
        }

        if (canvasContainer && slotsContainer) {
            logCanvasSlotsRelationship(canvasContainer, slotsContainer, mainRect, numberOfRows);
        }

        logLayoutAnalysis(mainContainer, canvasContainer, slotsContainer, mainRect, numberOfRows);

    }, [numberOfRows, scaleValue]);

    // Log canvas scaling information for debugging mobile issues
    useEffect(() => {
        logger.logGameEvent('plinko-canvas-component-created', {
            component: 'PlinkoCanvasGame',
            numberOfRows
        }, {
            category: 'game-init',
            workflow: 'plinko-canvas-game-init'
        });

        const scaleValue = PLINKO_CANVAS_SCALE[numberOfRows];

        logger.logUIEvent('canvas-scaling-calculation', {
            numberOfRows,
            scaleValue,
            scaleAvailable: !!PLINKO_CANVAS_SCALE[numberOfRows],
            deviceInfo: {
                isMobile,
                isTablet,
                isDesktop,
                userAgent: navigator.userAgent,
            },
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight,
                devicePixelRatio: window.devicePixelRatio,
                screenWidth: window.screen.width,
                screenHeight: window.screen.height,
            },
            canvas: {
                containerHeight: 600,
                transform: {
                    translateX: '-50%',
                    translateY: `${numberOfRows + numberOfRows / 8}px`,
                    scale: scaleValue,
                },
                positioning: {
                    origin: 'top',
                    left: '50%',
                    zIndex: -1,
                }
            },
            slots: {
                top: 570,
                positioning: 'absolute',
                origin: 'top',
            },
            potentialIssues: {
                scaleTooSmall: scaleValue < 0.5,
                scaleTooLarge: scaleValue > 2.0,
                viewportTooSmall: window.innerWidth < 320,
                highPixelRatio: window.devicePixelRatio > 2,
                isMobileDevice: isMobile,
            }
        });

        // Monitor for canvas scaling issues with enhanced clipping detection

        // Check immediately and after a delay to catch dynamic rendering
        checkCanvasScaling();
        logContainerRelationships();
        const timeoutId = setTimeout(() => {
            checkCanvasScaling();
            logContainerRelationships();
        }, 1000);

        // Monitor window resize events with comprehensive logging
        const handleResize = () => {
            // Update viewport width state to trigger scale recalculation only on resize
            setViewportWidth(window.innerWidth);

            // Log resize event with detailed analysis
            logger.logUIEvent('canvas-resize-event', {
                numberOfRows,
                newScale: PLINKO_CANVAS_SCALE[numberOfRows],
                viewport: {
                    width: window.innerWidth,
                    height: window.innerHeight,
                    devicePixelRatio: window.devicePixelRatio,
                    scrollX: window.scrollX,
                    scrollY: window.scrollY,
                },
                responsive: {
                    isMobile,
                    isTablet,
                    isDesktop,
                    aspectRatio: window.innerWidth / window.innerHeight,
                    orientation: window.innerWidth > window.innerHeight ? 'landscape' : 'portrait',
                },
                scaling: {
                    scaleValue: PLINKO_CANVAS_SCALE[numberOfRows],
                    scaleInRange: PLINKO_CANVAS_SCALE[numberOfRows] >= 0.5 && PLINKO_CANVAS_SCALE[numberOfRows] <= 2.0,
                    expectedCanvasWidth: 1050 * PLINKO_CANVAS_SCALE[numberOfRows],
                    expectedCanvasHeight: 600 * PLINKO_CANVAS_SCALE[numberOfRows],
                },
                potentialIssues: {
                    viewportTooSmall: window.innerWidth < 320,
                    highPixelRatio: window.devicePixelRatio > 2,
                    extremeAspectRatio: window.innerWidth / window.innerHeight > 3 || window.innerHeight / window.innerWidth > 3,
                }
            });

            // Trigger detailed checks after resize
            checkCanvasScaling();
            logContainerRelationships();
        };

        window.addEventListener('resize', handleResize);

        // Add manual logging trigger for debugging (available in development)
        if (process.env.NODE_ENV === 'development') {
            (window as any).logPlinkoGameState = () => {
                console.log('🔍 Manually triggering Plinko game state logging...');
                logger.logUIEvent('manual-game-state-log', {
                    timestamp: new Date().toISOString(),
                    numberOfRows,
                    scaleValue: PLINKO_CANVAS_SCALE[numberOfRows],
                    viewport: {
                        width: window.innerWidth,
                        height: window.innerHeight,
                        devicePixelRatio: window.devicePixelRatio,
                    }
                });
                checkCanvasScaling();
                logContainerRelationships();
            };
            console.log('🔧 Plinko Debug: Call window.logPlinkoGameState() to manually log current game state');
        }

        return () => {
            clearTimeout(timeoutId);
            window.removeEventListener('resize', handleResize);
            if (process.env.NODE_ENV === 'development') {
                delete (window as any).logPlinkoGameState;
            }
            logger.endWorkflow('plinko-canvas-game-init');
        };
    }, [numberOfRows, viewportWidth, logContainerRelationships]);

    // Memoize the scale calculation to prevent recalculation on every render/click
    const finalScale = useMemo(() => {
        // Calculate the exact scale needed to make pegs align with screen edges
        const pegRadius = 8.5;
        const mapGap = 3.4;
        const gap = pegRadius * 2 * mapGap; // 57.8
        const initialColumns = 3;
        const columnsInRow = initialColumns + (numberOfRows - 1); // 12 for 10 rows
        const space = (1050 - gap * columnsInRow) / 2; // 178.2
        const leftmostPegX = space + 1 * gap - pegRadius * mapGap; // 207.1
        const rightmostPegX = space + columnsInRow * gap - pegRadius * mapGap; // 842.9
        const pegsSpan = rightmostPegX - leftmostPegX; // 635.8px (distance between extreme pegs)

        // Check if we should use peg-based scaling on desktop when main container would exceed frame
        if (!isMobile) {
            const frameWrapperWithoutBackgroundElement = gameFrameWrapperWithoutBackgroundRef?.current;
            if (frameWrapperWithoutBackgroundElement) {
                const frameRect = frameWrapperWithoutBackgroundElement.getBoundingClientRect();
                // Calculate what the main container width would be with scaleValue (canvas scaling)
                const expectedMainWidth = 1050 * scaleValue; // 1050 is the original canvas width

                // Use peg-based scaling if expected main container width exceeds frame width
                if (expectedMainWidth > frameRect.width) {
                    return frameRect.width / pegsSpan;
                }
            }
            return 1.0;
        }

        // Calculate final scale: (viewport width / peg span) to make pegs fill screen
        // Account for canvas scaling to ensure proper fit when number of rows changes
        const effectivePegsSpan = pegsSpan * scaleValue;
        return viewportWidth / effectivePegsSpan;
    }, [viewportWidth, numberOfRows, isMobile, scaleValue, gameFrameWrapperWithoutBackgroundRef]); // Only recalculate when viewport or rows change

    // Calculate the scaled height for parent component - keep height consistent regardless of rows
    const scaledHeight = 600; // Keep consistent height regardless of scaling

    // Calculate wrapper scale for desktop when main container exceeds frame dimensions
    const wrapperScale = useMemo(() => {
        if (isMobile) {
            return 1.0; // No wrapper scaling on mobile
        }

        // Get the frame wrapper without background element dimensions (this contains our game)
        const frameWrapperWithoutBackgroundElement = gameFrameWrapperWithoutBackgroundRef?.current;
        if (!frameWrapperWithoutBackgroundElement || !mainContainerRef.current) {
            return 1.0;
        }

        const frameRect = frameWrapperWithoutBackgroundElement.getBoundingClientRect();
        const mainRect = mainContainerRef.current.getBoundingClientRect();

        // Calculate scale factors needed to fit main container within frame
        const scaleX = frameRect.width / mainRect.width;
        const scaleY = frameRect.height / mainRect.height;
        const minScale = Math.min(scaleX, scaleY);

        // Only scale down if main container is larger than frame
        return mainRect.width > frameRect.width || mainRect.height > frameRect.height
            ? Math.min(1, minScale)
            : 1.0;
    }, [isMobile, viewportWidth, finalScale]); // Recalculate when viewport changes or mobile status changes

    // Expose the scaled height and wrapper scale for parent component to use
    React.useImperativeHandle(ref, () => ({
        getScaledHeight: () => scaledHeight,
        getWrapperScale: () => wrapperScale
    }), [scaledHeight, wrapperScale]);

    return (
        <div
            ref={mainContainerRef}
            className="flex flex-col items-center justify-center relative"
            style={{
                transform: `scaleX(${Math.min(1, finalScale)}) scaleY(1)`,
                transformOrigin: 'top center'
            }}
        >
            {/* Logger Controls - positioned above canvas for debugging */}
            {process.env.NODE_ENV === 'development' && (
                <div
                    style={{
                        position: "absolute",
                        top: "10px",
                        left: "10px",
                        right: "10px",
                        zIndex: 10000,
                    }}
                >
                    <LoggerControls className="w-full" />
                </div>
            )}

            <div className="rounded-lg mx-auto w-full h-[600px] overflow-x-hidden pt-5">
                <div
                    ref={canvasContainerRef}
                    className="absolute origin-top left-1/2 z-[-1]"
                    style={{
                        transform: `translateX(-50%) translateY(${numberOfRows + numberOfRows / 8}px) scale(${scaleValue})`,
                    }}
                >
                    <PlinkoCanvas />
                </div>
                <div ref={slotsContainerRef} className="absolute top-[570px] left-0 w-full flex items-center justify-center origin-top">
                    <Slots />
                </div>
            </div>
        </div>
    );
});
Game.displayName = 'PlinkoGame';
export default Game;
