"use client";
import PlinkoCanvas from "./canvas";
import { usePlinkoGameStore } from "@plinko/shared/stores/plinko-game-store";
import { PLINKO_CANVAS_SCALE } from "./constant";
import Slots from "./slots";
import { logger } from "@plinko/services/logger";
import { LoggerControls } from "@plinko/features/ui/components";
import { useEffect, useRef, useCallback } from "react";

const Game = () => {
    logger.startWorkflow('plinko-canvas-game-init', 'ui', 'Initialize Plinko canvas game component');

    const numberOfRows = usePlinkoGameStore((state) => state.numberOfRows);

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
        const mainParent = mainContainer.parentElement;
        const mainParentRect = mainParent?.getBoundingClientRect();
        const mainParentComputedStyle = mainParent ? window.getComputedStyle(mainParent) : null;

        // Log main container
        logger.logUIEvent('game-main-container-dimensions', {
            mainContainer: {
                dimensions: {
                    width: mainRect.width,
                    height: mainRect.height,
                    top: mainRect.top,
                    left: mainRect.left,
                    right: mainRect.right,
                    bottom: mainRect.bottom,
                },
                computedStyle: {
                    width: mainComputedStyle.width,
                    height: mainComputedStyle.height,
                    position: mainComputedStyle.position,
                    display: mainComputedStyle.display,
                    flexDirection: mainComputedStyle.flexDirection,
                    alignItems: mainComputedStyle.alignItems,
                    justifyContent: mainComputedStyle.justifyContent,
                },
                attributes: {
                    className: mainContainer.className,
                }
            },
            parent: mainParent ? {
                tagName: mainParent.tagName,
                dimensions: {
                    width: mainParentRect?.width,
                    height: mainParentRect?.height,
                    top: mainParentRect?.top,
                    left: mainParentRect?.left,
                    right: mainParentRect?.right,
                    bottom: mainParentRect?.bottom,
                },
                computedStyle: {
                    width: mainParentComputedStyle?.width,
                    height: mainParentComputedStyle?.height,
                    position: mainParentComputedStyle?.position,
                    overflow: mainParentComputedStyle?.overflow,
                }
            } : null,
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight,
                devicePixelRatio: window.devicePixelRatio,
            }
        });

        // Log canvas container if available
        if (canvasContainer) {
            const canvasRect = canvasContainer.getBoundingClientRect();
            const canvasComputedStyle = window.getComputedStyle(canvasContainer);

            logger.logUIEvent('game-canvas-container-dimensions', {
                canvasContainer: {
                    dimensions: {
                        width: canvasRect.width,
                        height: canvasRect.height,
                        top: canvasRect.top,
                        left: canvasRect.left,
                        right: canvasRect.right,
                        bottom: canvasRect.bottom,
                    },
                    computedStyle: {
                        width: canvasComputedStyle.width,
                        height: canvasComputedStyle.height,
                        position: canvasComputedStyle.position,
                        transform: canvasComputedStyle.transform,
                        left: canvasComputedStyle.left,
                        zIndex: canvasComputedStyle.zIndex,
                    },
                    attributes: {
                        className: canvasContainer.className,
                        style: canvasContainer.getAttribute('style'),
                    }
                },
                relativeToMain: {
                    topOffset: canvasRect.top - mainRect.top,
                    leftOffset: canvasRect.left - mainRect.left,
                    bottomOffset: mainRect.bottom - canvasRect.bottom,
                    rightOffset: mainRect.right - canvasRect.right,
                },
                transform: {
                    expected: `translateX(-50%) translateY(${numberOfRows + numberOfRows / 8}px) scale(${scaleValue})`,
                    applied: canvasComputedStyle.transform,
                }
            });
        }

        // Log slots container if available
        if (slotsContainer) {
            const slotsRect = slotsContainer.getBoundingClientRect();
            const slotsComputedStyle = window.getComputedStyle(slotsContainer);

            logger.logUIEvent('game-slots-container-dimensions', {
                slotsContainer: {
                    dimensions: {
                        width: slotsRect.width,
                        height: slotsRect.height,
                        top: slotsRect.top,
                        left: slotsRect.left,
                        right: slotsRect.right,
                        bottom: slotsRect.bottom,
                    },
                    computedStyle: {
                        width: slotsComputedStyle.width,
                        height: slotsComputedStyle.height,
                        position: slotsComputedStyle.position,
                        top: slotsComputedStyle.top,
                        left: slotsComputedStyle.left,
                        zIndex: slotsComputedStyle.zIndex,
                    },
                    attributes: {
                        className: slotsContainer.className,
                        style: slotsContainer.getAttribute('style'),
                    }
                },
                relativeToMain: {
                    topOffset: slotsRect.top - mainRect.top,
                    leftOffset: slotsRect.left - mainRect.left,
                    bottomOffset: mainRect.bottom - slotsRect.bottom,
                    rightOffset: mainRect.right - slotsRect.right,
                },
                expectedPosition: {
                    top: 570,
                    positioning: 'absolute',
                    origin: 'top',
                }
            });
        }

        // Log relationships between canvas and slots
        if (canvasContainer && slotsContainer) {
            const canvasRect = canvasContainer.getBoundingClientRect();
            const slotsRect = slotsContainer.getBoundingClientRect();

            logger.logUIEvent('canvas-slots-relationship', {
                canvasToSlots: {
                    verticalGap: slotsRect.top - canvasRect.bottom,
                    horizontalOverlap: Math.max(0, Math.min(canvasRect.right, slotsRect.right) - Math.max(canvasRect.left, slotsRect.left)),
                    alignment: {
                        canvasCenterX: canvasRect.left + canvasRect.width / 2,
                        slotsCenterX: slotsRect.left + slotsRect.width / 2,
                        centerOffset: Math.abs((canvasRect.left + canvasRect.width / 2) - (slotsRect.left + slotsRect.width / 2)),
                    }
                },
                scaling: {
                    scaleValue: PLINKO_CANVAS_SCALE[numberOfRows],
                    numberOfRows,
                    canvasExpectedHeight: 600,
                    canvasActualHeight: canvasRect.height,
                    slotsExpectedTop: 570,
                    slotsActualTop: slotsRect.top - mainRect.top,
                },
                viewport: {
                    width: window.innerWidth,
                    height: window.innerHeight,
                }
            });
        }

        // Log overall layout analysis
        logger.logUIEvent('game-layout-analysis', {
            containers: {
                mainFound: !!mainContainer,
                canvasFound: !!canvasContainer,
                slotsFound: !!slotsContainer,
            },
            scaling: {
                scaleValue: PLINKO_CANVAS_SCALE[numberOfRows],
                numberOfRows,
                scaleInRange: PLINKO_CANVAS_SCALE[numberOfRows] >= 0.5 && PLINKO_CANVAS_SCALE[numberOfRows] <= 2.0,
            },
            potentialIssues: {
                mainContainerOverflow: mainRect.width > window.innerWidth || mainRect.height > window.innerHeight,
                canvasNotScaled: canvasContainer ? canvasContainer.getBoundingClientRect().width !== 1050 * PLINKO_CANVAS_SCALE[numberOfRows] : false,
                slotsNotPositioned: slotsContainer ? Math.abs((slotsContainer.getBoundingClientRect().top - mainRect.top) - 570) > 10 : false,
                viewportTooSmall: window.innerWidth < 320,
                highPixelRatio: window.devicePixelRatio > 2,
            },
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight,
                devicePixelRatio: window.devicePixelRatio,
                aspectRatio: window.innerWidth / window.innerHeight,
            }
        });

    }, [numberOfRows]);

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
        logContainerRelationships();
        const timeoutId = setTimeout(() => {
            checkCanvasScaling();
            logContainerRelationships();
        }, 1000);

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
            logContainerRelationships();
        };

        window.addEventListener('resize', handleResize);

        return () => {
            clearTimeout(timeoutId);
            window.removeEventListener('resize', handleResize);
            logger.endWorkflow('plinko-canvas-game-init');
        };
    }, [numberOfRows, logContainerRelationships]);

    const scaleValue = PLINKO_CANVAS_SCALE[numberOfRows];

    return (
        <div ref={mainContainerRef} className="flex flex-col items-center justify-center relative">
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
};
export default Game;
