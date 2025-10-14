"use client";
import PlinkoCanvas from "./canvas";
import { usePlinkoGameStore } from "@plinko/shared/stores/plinko-game-store";
import { PLINKO_CANVAS_SCALE } from "./constant";
import Slots from "./slots";
import { logger } from "@plinko/services/logger";
import { LoggerControls } from "@plinko/features/ui/components";
import { useEffect } from "react";

const Game = () => {
    const numberOfRows = usePlinkoGameStore((state) => state.numberOfRows);

    // Log canvas scaling information for debugging mobile issues
    useEffect(() => {
        logger.startWorkflow('plinko-canvas-game-init', 'ui', 'Initialize Plinko canvas game component');

        const scaleValue = PLINKO_CANVAS_SCALE[numberOfRows];
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        const isIPhone = /iPhone/.test(navigator.userAgent);

        logger.logUIEvent('canvas-scaling-calculation', {
            numberOfRows,
            scaleValue,
            scaleAvailable: !!PLINKO_CANVAS_SCALE[numberOfRows],
            deviceInfo: {
                isMobile,
                isIOS,
                isIPhone,
                userAgent: navigator.userAgent,
                platform: navigator.platform,
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
                iPhoneSpecific: isIPhone,
            }
        });

        // Monitor for canvas scaling issues
        const checkCanvasScaling = () => {
            const canvasElement = document.querySelector('canvas');
            if (canvasElement) {
                const rect = canvasElement.getBoundingClientRect();
                const computedStyle = window.getComputedStyle(canvasElement);

                logger.logUIEvent('canvas-element-check', {
                    found: true,
                    dimensions: {
                        width: rect.width,
                        height: rect.height,
                        top: rect.top,
                        left: rect.left,
                        right: rect.right,
                        bottom: rect.bottom,
                    },
                    computedStyle: {
                        width: computedStyle.width,
                        height: computedStyle.height,
                        transform: computedStyle.transform,
                        position: computedStyle.position,
                    },
                    parentElement: canvasElement.parentElement?.tagName,
                    scaling: {
                        expectedScale: scaleValue,
                        actualScale: rect.width / 1050, // Assuming canvas width is 1050
                    },
                    viewport: {
                        width: window.innerWidth,
                        height: window.innerHeight,
                    }
                });
            } else {
                logger.logUIEvent('canvas-element-check', {
                    found: false,
                    message: 'Canvas element not found in DOM'
                });
            }
        };

        // Check immediately and after a delay to catch dynamic rendering
        checkCanvasScaling();
        const timeoutId = setTimeout(checkCanvasScaling, 1000);

        // Monitor window resize events
        const handleResize = () => {
            logger.logUIEvent('canvas-resize-event', {
                numberOfRows,
                newScale: PLINKO_CANVAS_SCALE[numberOfRows],
                viewport: {
                    width: window.innerWidth,
                    height: window.innerHeight,
                    devicePixelRatio: window.devicePixelRatio,
                }
            });
            checkCanvasScaling();
        };

        window.addEventListener('resize', handleResize);

        return () => {
            clearTimeout(timeoutId);
            window.removeEventListener('resize', handleResize);
            logger.endWorkflow('plinko-canvas-game-init');
        };
    }, [numberOfRows]);

    const scaleValue = PLINKO_CANVAS_SCALE[numberOfRows];

    return (
        <div className="flex flex-col items-center justify-center relative">
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
                    className="absolute origin-top left-1/2 z-[-1]"
                    style={{
                        transform: `translateX(-50%) translateY(${numberOfRows + numberOfRows / 8}px) scale(${scaleValue})`,
                    }}
                >
                    <PlinkoCanvas />
                </div>
                <div className="absolute top-[570px] left-0 w-full flex items-center justify-center origin-top">
                    <Slots />
                </div>
            </div>
        </div>
    );
};
export default Game;
