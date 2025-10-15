"use client";
import PlinkoCanvas from "./canvas";
import { usePlinkoGameStore } from "@plinko/shared/stores/plinko-game-store";
import { PLINKO_CANVAS_SCALE } from "./constant";
import Slots from "./slots";
import { logger } from "@plinko/services/logger";
import { LoggerControls } from "@plinko/features/ui/components";
import React, { useEffect, useRef, useCallback, useMemo, useState } from "react";

const Game = React.forwardRef<{ getScaledHeight: () => number }>((props, ref) => {
    logger.startWorkflow('plinko-canvas-game-init', 'ui', 'Initialize Plinko canvas game component');

    const numberOfRows = usePlinkoGameStore((state) => state.numberOfRows);
    const scaleValue = PLINKO_CANVAS_SCALE[numberOfRows];

    // Store viewport and wrapper dimensions in state, only update on resize to prevent scale changes on clicks
    const [viewportWidth, setViewportWidth] = useState(() => window.innerWidth);
    const [wrapperWidth, setWrapperWidth] = useState(() => window.innerWidth);

    // Refs for detailed dimension logging
    const mainContainerRef = useRef<HTMLDivElement>(null);
    const canvasContainerRef = useRef<HTMLDivElement>(null);
    const slotsContainerRef = useRef<HTMLDivElement>(null);

    // Helper function to get wrapper width
    const getWrapperWidth = useCallback(() => {
        const wrapper = document.getElementById('plinko-game-frame-wrapper');
        return wrapper ? wrapper.getBoundingClientRect().width : window.innerWidth;
    }, []);

    // Helper function to get DOM tree for clipping analysis
    const getDOMTree = (element: Element, maxDepth = 5) => {
        const tree = [];
        let current = element;
        let depth = 0;

        while (current && depth < maxDepth) {
            const rect = current.getBoundingClientRect();
            const computedStyle = window.getComputedStyle(current);

            tree.push({
                tagName: current.tagName,
                id: current.id,
                className: current.className,
                dimensions: {
                    width: rect.width,
                    height: rect.height,
                    top: rect.top,
                    left: rect.left,
                    right: rect.right,
                    bottom: rect.bottom,
                },
                computedStyle: {
                    position: computedStyle.position,
                    overflow: computedStyle.overflow,
                    overflowX: computedStyle.overflowX,
                    overflowY: computedStyle.overflowY,
                    width: computedStyle.width,
                    height: computedStyle.height,
                    margin: computedStyle.margin,
                    padding: computedStyle.padding,
                    transform: computedStyle.transform,
                    display: computedStyle.display,
                },
                isClipping: {
                    left: rect.left < 0,
                    right: rect.right > window.innerWidth,
                    top: rect.top < 0,
                    bottom: rect.bottom > window.innerHeight,
                }
            });

            current = current.parentElement;
            depth++;
        }

        return tree;
    };

    // Log main container dimensions
    const logMainContainer = (mainContainer: HTMLElement, mainRect: DOMRect, mainComputedStyle: CSSStyleDeclaration) => {
        const mainParent = mainContainer.parentElement;
        const mainParentRect = mainParent?.getBoundingClientRect();
        const mainParentComputedStyle = mainParent ? window.getComputedStyle(mainParent) : null;

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
                    overflow: mainComputedStyle.overflow,
                    overflowX: mainComputedStyle.overflowX,
                    overflowY: mainComputedStyle.overflowY,
                    margin: mainComputedStyle.margin,
                    padding: mainComputedStyle.padding,
                    boxSizing: mainComputedStyle.boxSizing,
                },
                attributes: {
                    className: mainContainer.className,
                    style: mainContainer.getAttribute('style'),
                },
                clipping: {
                    isClippedLeft: mainRect.left < 0,
                    isClippedRight: mainRect.right > window.innerWidth,
                    isClippedTop: mainRect.top < 0,
                    isClippedBottom: mainRect.bottom > window.innerHeight,
                    clippedWidth: Math.max(0, -mainRect.left) + Math.max(0, mainRect.right - window.innerWidth),
                    clippedHeight: Math.max(0, -mainRect.top) + Math.max(0, mainRect.bottom - window.innerHeight),
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
                    overflowX: mainParentComputedStyle?.overflowX,
                    overflowY: mainParentComputedStyle?.overflowY,
                    display: mainParentComputedStyle?.display,
                    margin: mainParentComputedStyle?.margin,
                    padding: mainParentComputedStyle?.padding,
                }
            } : null,
            domTree: getDOMTree(mainContainer),
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight,
                devicePixelRatio: window.devicePixelRatio,
                scrollX: window.scrollX,
                scrollY: window.scrollY,
            }
        });
    };

    // Log canvas container dimensions
    const logCanvasContainer = (canvasContainer: HTMLElement, mainRect: DOMRect, canvasScale: number, numberOfRows: number) => {
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
                    top: canvasComputedStyle.top,
                    zIndex: canvasComputedStyle.zIndex,
                    overflow: canvasComputedStyle.overflow,
                    margin: canvasComputedStyle.margin,
                    padding: canvasComputedStyle.padding,
                },
                attributes: {
                    className: canvasContainer.className,
                    style: canvasContainer.getAttribute('style'),
                },
                clipping: {
                    isClippedLeft: canvasRect.left < 0,
                    isClippedRight: canvasRect.right > window.innerWidth,
                    isClippedTop: canvasRect.top < 0,
                    isClippedBottom: canvasRect.bottom > window.innerHeight,
                    clippedWidth: Math.max(0, -canvasRect.left) + Math.max(0, canvasRect.right - window.innerWidth),
                    clippedHeight: Math.max(0, -canvasRect.top) + Math.max(0, canvasRect.bottom - window.innerHeight),
                    visibleWidth: Math.min(canvasRect.width, window.innerWidth - Math.max(0, canvasRect.left)),
                    visibleHeight: Math.min(canvasRect.height, window.innerHeight - Math.max(0, canvasRect.top)),
                }
            },
            relativeToMain: {
                topOffset: canvasRect.top - mainRect.top,
                leftOffset: canvasRect.left - mainRect.left,
                bottomOffset: mainRect.bottom - canvasRect.bottom,
                rightOffset: mainRect.right - canvasRect.right,
                overlapMain: {
                    left: Math.max(0, Math.min(mainRect.right, canvasRect.right) - Math.max(mainRect.left, canvasRect.left)),
                    right: Math.max(0, Math.min(mainRect.right, canvasRect.right) - Math.max(mainRect.left, canvasRect.left)),
                    top: Math.max(0, Math.min(mainRect.bottom, canvasRect.bottom) - Math.max(mainRect.top, canvasRect.top)),
                    bottom: Math.max(0, Math.min(mainRect.bottom, canvasRect.bottom) - Math.max(mainRect.top, canvasRect.top)),
                }
            },
            transform: {
                expected: `translateX(-50%) translateY(${(numberOfRows + numberOfRows / 8) * canvasScale / scaleValue}px) scale(${canvasScale})`,
                applied: canvasComputedStyle.transform,
                parsed: (() => {
                    const transform = canvasComputedStyle.transform;
                    const translateXMatch = /translateX\(([^)]+)\)/.exec(transform);
                    const translateYMatch = /translateY\(([^)]+)\)/.exec(transform);
                    const scaleMatch = /scale\(([^)]+)\)/.exec(transform);
                    return {
                        translateX: translateXMatch ? translateXMatch[1] : null,
                        translateY: translateYMatch ? translateYMatch[1] : null,
                        scale: scaleMatch ? scaleMatch[1] : null,
                    };
                })(),
            },
            scaling: {
                expectedScale: canvasScale,
                actualScale: canvasRect.width / 1050, // Assuming original canvas width is 1050
                scaleRatio: (canvasRect.width / 1050) / canvasScale,
                scaledDimensions: {
                    expectedWidth: 1050 * canvasScale,
                    expectedHeight: 600 * canvasScale,
                    actualWidth: canvasRect.width,
                    actualHeight: canvasRect.height,
                }
            }
        });
    };

    // Log slots container dimensions
    const logSlotsContainer = (slotsContainer: HTMLElement, mainRect: DOMRect) => {
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
                    overflow: slotsComputedStyle.overflow,
                    margin: slotsComputedStyle.margin,
                    padding: slotsComputedStyle.padding,
                    transform: slotsComputedStyle.transform,
                },
                attributes: {
                    className: slotsContainer.className,
                    style: slotsContainer.getAttribute('style'),
                },
                clipping: {
                    isClippedLeft: slotsRect.left < 0,
                    isClippedRight: slotsRect.right > window.innerWidth,
                    isClippedTop: slotsRect.top < 0,
                    isClippedBottom: slotsRect.bottom > window.innerHeight,
                    clippedWidth: Math.max(0, -slotsRect.left) + Math.max(0, slotsRect.right - window.innerWidth),
                    clippedHeight: Math.max(0, -slotsRect.top) + Math.max(0, slotsRect.bottom - window.innerHeight),
                    visibleWidth: Math.min(slotsRect.width, window.innerWidth - Math.max(0, slotsRect.left)),
                    visibleHeight: Math.min(slotsRect.height, window.innerHeight - Math.max(0, slotsRect.top)),
                }
            },
            relativeToMain: {
                topOffset: slotsRect.top - mainRect.top,
                leftOffset: slotsRect.left - mainRect.left,
                bottomOffset: mainRect.bottom - slotsRect.bottom,
                rightOffset: mainRect.right - slotsRect.right,
                overlapMain: {
                    left: Math.max(0, Math.min(mainRect.right, slotsRect.right) - Math.max(mainRect.left, slotsRect.left)),
                    right: Math.max(0, Math.min(mainRect.right, slotsRect.right) - Math.max(mainRect.left, slotsRect.left)),
                    top: Math.max(0, Math.min(mainRect.bottom, slotsRect.bottom) - Math.max(mainRect.top, slotsRect.top)),
                    bottom: Math.max(0, Math.min(mainRect.bottom, slotsRect.bottom) - Math.max(mainRect.top, slotsRect.top)),
                }
            },
            expectedPosition: {
                top: 570,
                positioning: 'absolute',
                origin: 'top',
            },
            positioning: {
                actualTop: parseFloat(slotsComputedStyle.top) || 0,
                expectedTop: 570,
                offsetFromExpected: (slotsRect.top - mainRect.top) - 570,
            }
        });
    };

    // Log relationships between canvas and slots
    const logCanvasSlotsRelationship = (canvasContainer: HTMLElement, slotsContainer: HTMLElement, mainRect: DOMRect, numberOfRows: number, canvasScale?: number) => {
        const canvasRect = canvasContainer.getBoundingClientRect();
        const slotsRect = slotsContainer.getBoundingClientRect();

        logger.logUIEvent('canvas-slots-relationship', {
            canvasToSlots: {
                verticalGap: slotsRect.top - canvasRect.bottom,
                horizontalGap: {
                    left: slotsRect.left - canvasRect.left,
                    right: canvasRect.right - slotsRect.right,
                    center: (slotsRect.left + slotsRect.width / 2) - (canvasRect.left + canvasRect.width / 2),
                },
                horizontalOverlap: Math.max(0, Math.min(canvasRect.right, slotsRect.right) - Math.max(canvasRect.left, slotsRect.left)),
                alignment: {
                    canvasCenterX: canvasRect.left + canvasRect.width / 2,
                    slotsCenterX: slotsRect.left + slotsRect.width / 2,
                    centerOffset: Math.abs((canvasRect.left + canvasRect.width / 2) - (slotsRect.left + slotsRect.width / 2)),
                    isCentered: Math.abs((canvasRect.left + canvasRect.width / 2) - (slotsRect.left + slotsRect.width / 2)) < 5,
                },
                overlap: {
                    left: Math.max(0, Math.min(canvasRect.right, slotsRect.right) - Math.max(canvasRect.left, slotsRect.left)),
                    top: Math.max(0, Math.min(canvasRect.bottom, slotsRect.bottom) - Math.max(canvasRect.top, slotsRect.top)),
                }
            },
            scaling: {
                scaleValue: PLINKO_CANVAS_SCALE[numberOfRows],
                canvasScale: canvasScale || PLINKO_CANVAS_SCALE[numberOfRows],
                numberOfRows,
                canvasExpectedHeight: 600,
                canvasActualHeight: canvasRect.height,
                slotsExpectedTop: 570,
                slotsActualTop: slotsRect.top - mainRect.top,
                scaleRatio: canvasRect.height / 600,
                canvasTranslateYAdjustment: (numberOfRows + numberOfRows / 8) * (canvasScale || PLINKO_CANVAS_SCALE[numberOfRows]) / PLINKO_CANVAS_SCALE[numberOfRows],
            },
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight,
                aspectRatio: window.innerWidth / window.innerHeight,
            },
            responsive: {
                canvasViewportRatio: canvasRect.width / window.innerWidth,
                slotsViewportRatio: slotsRect.width / window.innerWidth,
                canvasOverflows: canvasRect.width > window.innerWidth,
                slotsOverflows: slotsRect.width > window.innerWidth,
                mainOverflows: mainRect.width > window.innerWidth,
            }
        });
    };

    // Log overall layout analysis
    const logLayoutAnalysis = (mainContainer: HTMLElement, canvasContainer: HTMLElement | null, slotsContainer: HTMLElement | null, mainRect: DOMRect, numberOfRows: number) => {
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
                canvasNotScaled: canvasContainer ? Math.abs(canvasContainer.getBoundingClientRect().width - (1050 * PLINKO_CANVAS_SCALE[numberOfRows])) > 10 : false,
                slotsNotPositioned: slotsContainer ? Math.abs((slotsContainer.getBoundingClientRect().top - mainRect.top) - 570) > 10 : false,
                viewportTooSmall: window.innerWidth < 320,
                highPixelRatio: window.devicePixelRatio > 2,
                canvasClipped: canvasContainer ? (canvasContainer.getBoundingClientRect().left < 0 || canvasContainer.getBoundingClientRect().right > window.innerWidth) : false,
                slotsClipped: slotsContainer ? (slotsContainer.getBoundingClientRect().left < 0 || slotsContainer.getBoundingClientRect().right > window.innerWidth) : false,
                mainClipped: mainRect.left < 0 || mainRect.right > window.innerWidth,
            },
            clipping: {
                main: {
                    left: mainRect.left < 0,
                    right: mainRect.right > window.innerWidth,
                    top: mainRect.top < 0,
                    bottom: mainRect.bottom > window.innerHeight,
                },
                canvas: canvasContainer ? {
                    left: canvasContainer.getBoundingClientRect().left < 0,
                    right: canvasContainer.getBoundingClientRect().right > window.innerWidth,
                    top: canvasContainer.getBoundingClientRect().top < 0,
                    bottom: canvasContainer.getBoundingClientRect().bottom > window.innerHeight,
                } : null,
                slots: slotsContainer ? {
                    left: slotsContainer.getBoundingClientRect().left < 0,
                    right: slotsContainer.getBoundingClientRect().right > window.innerWidth,
                    top: slotsContainer.getBoundingClientRect().top < 0,
                    bottom: slotsContainer.getBoundingClientRect().bottom > window.innerHeight,
                } : null,
            },
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight,
                devicePixelRatio: window.devicePixelRatio,
                aspectRatio: window.innerWidth / window.innerHeight,
                scrollX: window.scrollX,
                scrollY: window.scrollY,
            },
            responsive: {
                isMobile: window.innerWidth < 768,
                isTablet: window.innerWidth >= 768 && window.innerWidth < 1024,
                isDesktop: window.innerWidth >= 1024,
                contentWidthRatio: mainRect.width / window.innerWidth,
                contentHeightRatio: mainRect.height / window.innerHeight,
            }
        });
    };

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

        // Calculate final scale: (wrapper width / peg span) to make pegs fit within wrapper
        return wrapperWidth / pegsSpan;
    }, [wrapperWidth, numberOfRows]); // Only recalculate when wrapper width or rows change

    // Calculate adjusted canvas scale to prevent overflow
    const canvasScale = useMemo(() => {
        // Detect mobile devices (iPhone, Android phones, etc.)
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        const isIPhone = /iPhone/.test(navigator.userAgent);

        // For mobile devices, use the old scaling logic (just scaleValue)
        // to prevent over-scaling down on small screens like iPhone 14 Pro Max
        if (isMobile) {
            logger.logUIEvent('mobile-scaling-logic', {
                deviceType: 'mobile',
                isIOS,
                isIPhone,
                scaleValue,
                wrapperWidth,
                expectedCanvasWidth: 1050 * scaleValue,
                willUseOldLogic: true,
                reason: 'Using old commit scaling logic for mobile to prevent excessive downscaling'
            });
            return scaleValue;
        }

        // For desktop, use current logic with overflow prevention
        const expectedCanvasWidth = 1050 * scaleValue;
        if (expectedCanvasWidth > wrapperWidth) {
            logger.logUIEvent('desktop-scaling-logic', {
                deviceType: 'desktop',
                scaleValue,
                finalScale,
                wrapperWidth,
                expectedCanvasWidth,
                willClamp: true,
                reason: 'Applying finalScale clamping to prevent overflow on desktop'
            });
            // Apply finalScale to prevent overflow
            return Math.min(scaleValue, finalScale);
        }

        logger.logUIEvent('desktop-scaling-logic', {
            deviceType: 'desktop',
            scaleValue,
            wrapperWidth,
            expectedCanvasWidth,
            willClamp: false,
            reason: 'No clamping needed, using scaleValue directly'
        });
        return scaleValue;
    }, [scaleValue, finalScale, wrapperWidth]);

    // Calculate the scaled height for parent component
    const scaledHeight = 600 * Math.min(1, finalScale); // 600 is the original height

    // Expose the scaled height for parent component to use
    React.useImperativeHandle(ref, () => ({
        getScaledHeight: () => scaledHeight
    }), [scaledHeight]);

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
            logCanvasContainer(canvasContainer, mainRect, canvasScale, numberOfRows);
        }

        if (slotsContainer) {
            logSlotsContainer(slotsContainer, mainRect);
        }

        if (canvasContainer && slotsContainer) {
            logCanvasSlotsRelationship(canvasContainer, slotsContainer, mainRect, numberOfRows, canvasScale);
        }

        logLayoutAnalysis(mainContainer, canvasContainer, slotsContainer, mainRect, numberOfRows);

    }, [numberOfRows, scaleValue, canvasScale]);

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
                    translateY: `${(numberOfRows + numberOfRows / 8) * canvasScale / scaleValue}px`,
                    scale: canvasScale,
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

        // Monitor for canvas scaling issues with enhanced clipping detection
        const checkCanvasScaling = () => {
            const canvasElement = document.querySelector('canvas');
            if (canvasElement) {
                const rect = canvasElement.getBoundingClientRect();
                const computedStyle = window.getComputedStyle(canvasElement);

                // Get parent container info for better context
                const parentElement = canvasElement.parentElement;
                const parentRect = parentElement?.getBoundingClientRect();
                const parentComputedStyle = parentElement ? window.getComputedStyle(parentElement) : null;

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
                        overflow: computedStyle.overflow,
                        margin: computedStyle.margin,
                        padding: computedStyle.padding,
                        display: computedStyle.display,
                    },
                    parentElement: {
                        tagName: canvasElement.parentElement?.tagName,
                        className: canvasElement.parentElement?.className,
                        dimensions: parentRect ? {
                            width: parentRect.width,
                            height: parentRect.height,
                            top: parentRect.top,
                            left: parentRect.left,
                            right: parentRect.right,
                            bottom: parentRect.bottom,
                        } : null,
                        computedStyle: parentComputedStyle ? {
                            position: parentComputedStyle.position,
                            overflow: parentComputedStyle.overflow,
                            overflowX: parentComputedStyle.overflowX,
                            overflowY: parentComputedStyle.overflowY,
                            transform: parentComputedStyle.transform,
                            width: parentComputedStyle.width,
                            height: parentComputedStyle.height,
                        } : null,
                    },
                    scaling: {
                        expectedScale: scaleValue,
                        actualScale: rect.width / 1050, // Assuming canvas width is 1050
                        scaleRatio: (rect.width / 1050) / scaleValue,
                        expectedDimensions: {
                            width: 1050 * scaleValue,
                            height: 600 * scaleValue,
                        },
                        actualDimensions: {
                            width: rect.width,
                            height: rect.height,
                        }
                    },
                    clipping: {
                        isClippedLeft: rect.left < 0,
                        isClippedRight: rect.right > window.innerWidth,
                        isClippedTop: rect.top < 0,
                        isClippedBottom: rect.bottom > window.innerHeight,
                        clippedWidth: Math.max(0, -rect.left) + Math.max(0, rect.right - window.innerWidth),
                        clippedHeight: Math.max(0, -rect.top) + Math.max(0, rect.bottom - window.innerHeight),
                        visibleWidth: Math.min(rect.width, window.innerWidth - Math.max(0, rect.left)),
                        visibleHeight: Math.min(rect.height, window.innerHeight - Math.max(0, rect.top)),
                        visibilityRatio: {
                            width: Math.min(rect.width, window.innerWidth - Math.max(0, rect.left)) / rect.width,
                            height: Math.min(rect.height, window.innerHeight - Math.max(0, rect.top)) / rect.height,
                        }
                    },
                    viewport: {
                        width: window.innerWidth,
                        height: window.innerHeight,
                        devicePixelRatio: window.devicePixelRatio,
                        scrollX: window.scrollX,
                        scrollY: window.scrollY,
                    },
                    responsive: {
                        canvasViewportRatio: rect.width / window.innerWidth,
                        overflowsViewport: rect.width > window.innerWidth || rect.height > window.innerHeight,
                        positionInViewport: {
                            centerX: rect.left + rect.width / 2,
                            centerY: rect.top + rect.height / 2,
                            viewportCenterX: window.innerWidth / 2,
                            viewportCenterY: window.innerHeight / 2,
                        }
                    }
                });
            } else {
                logger.logUIEvent('canvas-element-check', {
                    found: false,
                    message: 'Canvas element not found in DOM',
                    viewport: {
                        width: window.innerWidth,
                        height: window.innerHeight,
                    }
                });
            }
        };

        // Set initial wrapper width after component mounts
        const initialWrapperWidth = getWrapperWidth();
        setWrapperWidth(initialWrapperWidth);

        // Check immediately and after a delay to catch dynamic rendering
        checkCanvasScaling();
        logContainerRelationships();
        const timeoutId = setTimeout(() => {
            checkCanvasScaling();
            logContainerRelationships();
        }, 1000);

        // Monitor window resize events with comprehensive logging
        const handleResize = () => {
            // Update viewport and wrapper width state to trigger scale recalculation only on resize
            setViewportWidth(window.innerWidth);
            setWrapperWidth(getWrapperWidth());

            // Log resize event with detailed analysis
            const currentWrapperWidth = getWrapperWidth();
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
                wrapper: {
                    width: currentWrapperWidth,
                    expectedCanvasWidth: 1050 * PLINKO_CANVAS_SCALE[numberOfRows],
                    willOverflow: (1050 * PLINKO_CANVAS_SCALE[numberOfRows]) > currentWrapperWidth,
                },
                responsive: {
                    isMobile: window.innerWidth < 768,
                    isTablet: window.innerWidth >= 768 && window.innerWidth < 1024,
                    isDesktop: window.innerWidth >= 1024,
                    aspectRatio: window.innerWidth / window.innerHeight,
                    orientation: window.innerWidth > window.innerHeight ? 'landscape' : 'portrait',
                },
                scaling: {
                    scaleValue: PLINKO_CANVAS_SCALE[numberOfRows],
                    finalScale: currentWrapperWidth / 635.8, // Approximate pegs span
                    canvasScale: Math.min(PLINKO_CANVAS_SCALE[numberOfRows], currentWrapperWidth / 635.8),
                    scaleInRange: PLINKO_CANVAS_SCALE[numberOfRows] >= 0.5 && PLINKO_CANVAS_SCALE[numberOfRows] <= 2.0,
                    expectedCanvasWidth: 1050 * PLINKO_CANVAS_SCALE[numberOfRows],
                    expectedCanvasHeight: 600 * PLINKO_CANVAS_SCALE[numberOfRows],
                },
                potentialIssues: {
                    viewportTooSmall: window.innerWidth < 320,
                    highPixelRatio: window.devicePixelRatio > 2,
                    extremeAspectRatio: window.innerWidth / window.innerHeight > 3 || window.innerHeight / window.innerWidth > 3,
                    canvasOverflow: (1050 * PLINKO_CANVAS_SCALE[numberOfRows]) > currentWrapperWidth,
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
    }, [numberOfRows, viewportWidth, wrapperWidth, logContainerRelationships, getWrapperWidth]);

    return (
        <div
            ref={mainContainerRef}
            className="flex flex-col items-center justify-center relative"
            style={{
                transform: `scale(${Math.min(1, finalScale)})`,
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
                        transform: `translateX(-50%) translateY(${(numberOfRows + numberOfRows / 8) * canvasScale / scaleValue}px) scale(${canvasScale})`,
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