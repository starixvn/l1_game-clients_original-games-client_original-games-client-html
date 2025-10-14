"use client";
import PlinkoCanvas from "./canvas";
import { usePlinkoGameStore } from "@plinko/shared/stores/plinko-game-store";
import { PLINKO_CANVAS_SCALE } from "./constant";
import Slots from "./slots";
import { logger } from "@plinko/services/logger";
import { LoggerControls } from "@plinko/features/ui/components";
import { useEffect, useRef, useCallback, useState } from "react";

const Game = () => {
    logger.startWorkflow('plinko-canvas-game-init', 'ui', 'Initialize Plinko canvas game component');

    const numberOfRows = usePlinkoGameStore((state) => state.numberOfRows);

    // Calculate container scaling for entire game component
    const calculateContainerScale = useCallback(() => {
        if (typeof window === 'undefined') return 1;

        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        // Assume base game dimensions (these should match the design)
        const baseGameWidth = 1050; // canvas width
        const baseGameHeight = 600; // canvas height plus some padding

        // Calculate scale to fit viewport while maintaining aspect ratio
        const scaleX = viewportWidth / baseGameWidth;
        const scaleY = viewportHeight / baseGameHeight;

        // Use the smaller scale to ensure the game fits completely
        const containerScale = Math.min(scaleX, scaleY);

        // Apply bounds to prevent extreme scaling
        const minScale = 0.3;
        const maxScale = 1.0;

        return Math.max(minScale, Math.min(maxScale, containerScale));
    }, []);

    const [containerScale, setContainerScale] = useState(1);

    // Refs for detailed dimension logging
    const mainContainerRef = useRef<HTMLDivElement>(null);
    const canvasContainerRef = useRef<HTMLDivElement>(null);
    const slotsContainerRef = useRef<HTMLDivElement>(null);

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
    const logCanvasContainer = (canvasContainer: HTMLElement, mainRect: DOMRect, scaleValue: number, numberOfRows: number) => {
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
                expected: `translateX(-50%) translateY(${numberOfRows + numberOfRows / 8}px) scale(${scaleValue})`,
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
                expectedScale: scaleValue,
                actualScale: canvasRect.width / 1050, // Assuming original canvas width is 1050
                scaleRatio: (canvasRect.width / 1050) / scaleValue,
                scaledDimensions: {
                    expectedWidth: 1050 * scaleValue,
                    expectedHeight: 600 * scaleValue,
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
    const logCanvasSlotsRelationship = (canvasContainer: HTMLElement, slotsContainer: HTMLElement, mainRect: DOMRect, numberOfRows: number) => {
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
                numberOfRows,
                canvasExpectedHeight: 600,
                canvasActualHeight: canvasRect.height,
                slotsExpectedTop: 570,
                slotsActualTop: slotsRect.top - mainRect.top,
                scaleRatio: canvasRect.height / 600,
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

    // Log background and parent container analysis
    const logBackgroundAndParentAnalysis = (mainContainer: HTMLElement, mainRect: DOMRect) => {
        // Find parent containers that might contain background
        const findParentContainers = (element: Element, maxLevels = 5) => {
            const containers = [];
            let current = element.parentElement;
            let level = 0;

            while (current && level < maxLevels) {
                const rect = current.getBoundingClientRect();
                const computedStyle = window.getComputedStyle(current);

                // Check if this element has background-related properties
                const hasBackground = computedStyle.backgroundImage !== 'none' ||
                    computedStyle.backgroundColor !== 'rgba(0, 0, 0, 0)' &&
                    computedStyle.backgroundColor !== 'transparent';

                containers.push({
                    level,
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
                        width: computedStyle.width,
                        height: computedStyle.height,
                        overflow: computedStyle.overflow,
                        overflowX: computedStyle.overflowX,
                        overflowY: computedStyle.overflowY,
                        backgroundImage: computedStyle.backgroundImage,
                        backgroundSize: computedStyle.backgroundSize,
                        backgroundPosition: computedStyle.backgroundPosition,
                        backgroundRepeat: computedStyle.backgroundRepeat,
                        transform: computedStyle.transform,
                        display: computedStyle.display,
                        margin: computedStyle.margin,
                        padding: computedStyle.padding,
                    },
                    hasBackground,
                    isClipping: {
                        left: rect.left < 0,
                        right: rect.right > window.innerWidth,
                        top: rect.top < 0,
                        bottom: rect.bottom > window.innerHeight,
                    },
                    relationshipToGame: {
                        containsGame: current.contains(mainContainer),
                        offsetLeft: rect.left - mainRect.left,
                        offsetTop: rect.top - mainRect.top,
                        overlapWidth: Math.max(0, Math.min(rect.right, mainRect.right) - Math.max(rect.left, mainRect.left)),
                        overlapHeight: Math.max(0, Math.min(rect.bottom, mainRect.bottom) - Math.max(rect.top, mainRect.top)),
                    }
                });

                current = current.parentElement;
                level++;
            }

            return containers;
        };

        // Find background images specifically
        const findBackgroundImages = () => {
            const images = document.querySelectorAll('img[alt*="Background"], [style*="background-image"]');
            return Array.from(images).map(img => {
                const rect = img.getBoundingClientRect();
                const computedStyle = window.getComputedStyle(img);
                return {
                    tagName: img.tagName,
                    alt: img.getAttribute('alt'),
                    src: img.getAttribute('src'),
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
                        width: computedStyle.width,
                        height: computedStyle.height,
                        objectFit: computedStyle.objectFit,
                        objectPosition: computedStyle.objectPosition,
                        transform: computedStyle.transform,
                        zIndex: computedStyle.zIndex,
                    },
                    relationshipToGame: {
                        containsGame: img.contains(mainContainer),
                        offsetLeft: rect.left - mainRect.left,
                        offsetTop: rect.top - mainRect.top,
                        overlapWidth: Math.max(0, Math.min(rect.right, mainRect.right) - Math.max(rect.left, mainRect.left)),
                        overlapHeight: Math.max(0, Math.min(rect.bottom, mainRect.bottom) - Math.max(rect.top, mainRect.top)),
                    },
                    isClipping: {
                        left: rect.left < 0,
                        right: rect.right > window.innerWidth,
                        top: rect.top < 0,
                        bottom: rect.bottom > window.innerHeight,
                    }
                };
            });
        };

        const parentContainers = findParentContainers(mainContainer);
        const backgroundImages = findBackgroundImages();

        logger.logUIEvent('background-parent-analysis', {
            gameContainer: {
                dimensions: {
                    width: mainRect.width,
                    height: mainRect.height,
                    top: mainRect.top,
                    left: mainRect.left,
                    right: mainRect.right,
                    bottom: mainRect.bottom,
                },
                centerX: mainRect.left + mainRect.width / 2,
                centerY: mainRect.top + mainRect.height / 2,
            },
            parentContainers,
            backgroundImages,
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight,
                centerX: window.innerWidth / 2,
                centerY: window.innerHeight / 2,
                aspectRatio: window.innerWidth / window.innerHeight,
            },
            scalingAnalysis: {
                gameToViewportWidthRatio: mainRect.width / window.innerWidth,
                gameToViewportHeightRatio: mainRect.height / window.innerHeight,
                gameCenterOffsetX: (mainRect.left + mainRect.width / 2) - (window.innerWidth / 2),
                gameCenterOffsetY: (mainRect.top + mainRect.height / 2) - (window.innerHeight / 2),
                backgroundImageCount: backgroundImages.length,
                containersWithBackground: parentContainers.filter(c => c.hasBackground).length,
            },
            clippingAnalysis: {
                gameContainerClipped: mainRect.left < 0 || mainRect.right > window.innerWidth || mainRect.top < 0 || mainRect.bottom > window.innerHeight,
                backgroundImagesClipped: backgroundImages.filter(img => img.isClipping.left || img.isClipping.right || img.isClipping.top || img.isClipping.bottom),
                parentContainersClipped: parentContainers.filter(c => c.isClipping.left || c.isClipping.right || c.isClipping.top || c.isClipping.bottom),
            }
        });
    };

    // Log overall layout analysis with enhanced scaling approach consideration
    const logLayoutAnalysis = (mainContainer: HTMLElement, canvasContainer: HTMLElement | null, slotsContainer: HTMLElement | null, mainRect: DOMRect, numberOfRows: number) => {
        // Calculate optimal container scaling approach
        const calculateContainerScaling = () => {
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;
            const gameWidth = mainRect.width;
            const gameHeight = mainRect.height;

            // Current canvas scaling
            const currentCanvasScale = PLINKO_CANVAS_SCALE[numberOfRows];
            const canvasExpectedWidth = 1050 * currentCanvasScale;
            const canvasExpectedHeight = 600 * currentCanvasScale;

            // Container scaling alternatives
            const scaleByWidth = viewportWidth / gameWidth;
            const scaleByHeight = viewportHeight / gameHeight;
            const scaleByMinDimension = Math.min(scaleByWidth, scaleByHeight);
            const scaleByMaxDimension = Math.max(scaleByWidth, scaleByHeight);

            // Background consideration - assume background is designed for certain aspect ratio
            const assumedGameAspectRatio = 1050 / 600; // canvas aspect ratio
            const viewportAspectRatio = viewportWidth / viewportHeight;

            return {
                currentApproach: {
                    canvasScale: currentCanvasScale,
                    canvasExpectedDimensions: {
                        width: canvasExpectedWidth,
                        height: canvasExpectedHeight,
                    },
                    canvasActualDimensions: canvasContainer ? canvasContainer.getBoundingClientRect() : null,
                },
                containerScalingAlternatives: {
                    scaleByWidth: {
                        scale: scaleByWidth,
                        scaledGameWidth: gameWidth * scaleByWidth,
                        scaledGameHeight: gameHeight * scaleByWidth,
                        keepsAspectRatio: true,
                        fitsWidth: true,
                        fitsHeight: gameHeight * scaleByWidth <= viewportHeight,
                    },
                    scaleByHeight: {
                        scale: scaleByHeight,
                        scaledGameWidth: gameWidth * scaleByHeight,
                        scaledGameHeight: gameHeight * scaleByHeight,
                        keepsAspectRatio: true,
                        fitsWidth: gameWidth * scaleByHeight <= viewportWidth,
                        fitsHeight: true,
                    },
                    scaleByMinDimension: {
                        scale: scaleByMinDimension,
                        scaledGameWidth: gameWidth * scaleByMinDimension,
                        scaledGameHeight: gameHeight * scaleByMinDimension,
                        keepsAspectRatio: true,
                        fitsWidth: gameWidth * scaleByMinDimension <= viewportWidth,
                        fitsHeight: gameHeight * scaleByMinDimension <= viewportHeight,
                    },
                    scaleByMaxDimension: {
                        scale: scaleByMaxDimension,
                        scaledGameWidth: gameWidth * scaleByMaxDimension,
                        scaledGameHeight: gameHeight * scaleByMaxDimension,
                        keepsAspectRatio: true,
                        fitsWidth: gameWidth * scaleByMaxDimension <= viewportWidth,
                        fitsHeight: gameHeight * scaleByMaxDimension <= viewportHeight,
                    },
                    fitToViewport: {
                        scale: Math.min(viewportWidth / gameWidth, viewportHeight / gameHeight),
                        scaledGameWidth: gameWidth * Math.min(viewportWidth / gameWidth, viewportHeight / gameHeight),
                        scaledGameHeight: gameHeight * Math.min(viewportWidth / gameWidth, viewportHeight / gameHeight),
                        keepsAspectRatio: true,
                        fitsViewport: true,
                    },
                },
                aspectRatioAnalysis: {
                    assumedGameAspectRatio,
                    viewportAspectRatio,
                    aspectRatioDifference: Math.abs(assumedGameAspectRatio - viewportAspectRatio),
                    viewportWiderThanGame: viewportAspectRatio > assumedGameAspectRatio,
                },
                recommendedApproach: {
                    containerScale: Math.min(viewportWidth / gameWidth, viewportHeight / gameHeight),
                    reason: 'Scale entire container to fit viewport while maintaining aspect ratio',
                    preservesBackground: true,
                    preventsClipping: true,
                }
            };
        };

        const scalingAnalysis = calculateContainerScaling();

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
            scalingAnalysis,
            potentialIssues: {
                mainContainerOverflow: mainRect.width > window.innerWidth || mainRect.height > window.innerHeight,
                canvasNotScaled: canvasContainer ? Math.abs(canvasContainer.getBoundingClientRect().width - (1050 * PLINKO_CANVAS_SCALE[numberOfRows])) > 10 : false,
                slotsNotPositioned: slotsContainer ? Math.abs((slotsContainer.getBoundingClientRect().top - mainRect.top) - 570) > 10 : false,
                viewportTooSmall: window.innerWidth < 320,
                highPixelRatio: window.devicePixelRatio > 2,
                canvasClipped: canvasContainer ? (canvasContainer.getBoundingClientRect().left < 0 || canvasContainer.getBoundingClientRect().right > window.innerWidth) : false,
                slotsClipped: slotsContainer ? (slotsContainer.getBoundingClientRect().left < 0 || slotsContainer.getBoundingClientRect().right > window.innerWidth) : false,
                mainClipped: mainRect.left < 0 || mainRect.right > window.innerWidth,
                backgroundScalingMismatch: 'Background images may not scale with canvas-only approach',
            },
            clipping: {
                main: {
                    left: mainRect.left < 0,
                    right: mainRect.right > window.innerWidth,
                    top: mainRect.top < 0,
                    bottom: mainRect.bottom > window.innerHeight,
                    totalClippedWidth: Math.max(0, -mainRect.left) + Math.max(0, mainRect.right - window.innerWidth),
                    totalClippedHeight: Math.max(0, -mainRect.top) + Math.max(0, mainRect.bottom - window.innerHeight),
                },
                canvas: canvasContainer ? {
                    left: canvasContainer.getBoundingClientRect().left < 0,
                    right: canvasContainer.getBoundingClientRect().right > window.innerWidth,
                    top: canvasContainer.getBoundingClientRect().top < 0,
                    bottom: canvasContainer.getBoundingClientRect().bottom > window.innerHeight,
                    totalClippedWidth: Math.max(0, -canvasContainer.getBoundingClientRect().left) + Math.max(0, canvasContainer.getBoundingClientRect().right - window.innerWidth),
                    totalClippedHeight: Math.max(0, -canvasContainer.getBoundingClientRect().top) + Math.max(0, canvasContainer.getBoundingClientRect().bottom - window.innerHeight),
                } : null,
                slots: slotsContainer ? {
                    left: slotsContainer.getBoundingClientRect().left < 0,
                    right: slotsContainer.getBoundingClientRect().right > window.innerWidth,
                    top: slotsContainer.getBoundingClientRect().top < 0,
                    bottom: slotsContainer.getBoundingClientRect().bottom > window.innerHeight,
                    totalClippedWidth: Math.max(0, -slotsContainer.getBoundingClientRect().left) + Math.max(0, slotsContainer.getBoundingClientRect().right - window.innerWidth),
                    totalClippedHeight: Math.max(0, -slotsContainer.getBoundingClientRect().top) + Math.max(0, slotsContainer.getBoundingClientRect().bottom - window.innerHeight),
                } : null,
            },
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight,
                devicePixelRatio: window.devicePixelRatio,
                aspectRatio: window.innerWidth / window.innerHeight,
                scrollX: window.scrollX,
                scrollY: window.scrollY,
                centerX: window.innerWidth / 2,
                centerY: window.innerHeight / 2,
            },
            responsive: {
                isMobile: window.innerWidth < 768,
                isTablet: window.innerWidth >= 768 && window.innerWidth < 1024,
                isDesktop: window.innerWidth >= 1024,
                contentWidthRatio: mainRect.width / window.innerWidth,
                contentHeightRatio: mainRect.height / window.innerHeight,
                gameCenterOffsetX: (mainRect.left + mainRect.width / 2) - (window.innerWidth / 2),
                gameCenterOffsetY: (mainRect.top + mainRect.height / 2) - (window.innerHeight / 2),
            },
            proposedSolution: {
                approach: 'Scale entire game container instead of just canvas',
                containerScale: scalingAnalysis.recommendedApproach.containerScale,
                transform: `scale(${scalingAnalysis.recommendedApproach.containerScale})`,
                positioning: 'Center container in viewport after scaling',
                benefits: [
                    'Preserves background scaling',
                    'Maintains aspect ratio',
                    'Prevents clipping',
                    'Responsive across all screen sizes'
                ]
            }
        });

        // Log background and parent analysis
        logBackgroundAndParentAnalysis(mainContainer, mainRect);
    };

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
            logCanvasContainer(canvasContainer, mainRect, PLINKO_CANVAS_SCALE[numberOfRows], numberOfRows);
        }

        if (slotsContainer) {
            logSlotsContainer(slotsContainer, mainRect);
        }

        if (canvasContainer && slotsContainer) {
            logCanvasSlotsRelationship(canvasContainer, slotsContainer, mainRect, numberOfRows);
        }

        logLayoutAnalysis(mainContainer, canvasContainer, slotsContainer, mainRect, numberOfRows);

    }, [numberOfRows]);

    // Initialize container scaling and log canvas scaling information for debugging mobile issues
    useEffect(() => {
        logger.logGameEvent('plinko-canvas-component-created', {
            component: 'PlinkoCanvasGame',
            numberOfRows
        }, {
            category: 'game-init',
            workflow: 'plinko-canvas-game-init'
        });

        // Calculate and set initial container scale
        const initialScale = calculateContainerScale();
        setContainerScale(initialScale);

        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        const isIPhone = /iPhone/.test(navigator.userAgent);

        logger.logUIEvent('canvas-scaling-calculation', {
            numberOfRows,
            canvasScaleValue: PLINKO_CANVAS_SCALE[numberOfRows],
            containerScale: initialScale,
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
                    scale: PLINKO_CANVAS_SCALE[numberOfRows],
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
                canvasScaleTooSmall: PLINKO_CANVAS_SCALE[numberOfRows] < 0.5,
                canvasScaleTooLarge: PLINKO_CANVAS_SCALE[numberOfRows] > 2.0,
                containerScaleTooSmall: initialScale < 0.3,
                containerScaleTooLarge: initialScale > 1.0,
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
                        expectedCanvasScale: PLINKO_CANVAS_SCALE[numberOfRows],
                        expectedContainerScale: initialScale,
                        actualScale: rect.width / 1050, // Assuming canvas width is 1050
                        canvasScaleRatio: (rect.width / 1050) / PLINKO_CANVAS_SCALE[numberOfRows],
                        containerScaleRatio: rect.width / (1050 * initialScale),
                        expectedCanvasDimensions: {
                            width: 1050 * PLINKO_CANVAS_SCALE[numberOfRows],
                            height: 600 * PLINKO_CANVAS_SCALE[numberOfRows],
                        },
                        expectedContainerDimensions: {
                            width: 1050 * initialScale,
                            height: 600 * initialScale,
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

        // Check immediately and after a delay to catch dynamic rendering
        checkCanvasScaling();
        logContainerRelationships();
        const timeoutId = setTimeout(() => {
            checkCanvasScaling();
            logContainerRelationships();
        }, 1000);

        // Monitor window resize events with comprehensive logging
        const handleResize = () => {
            // Recalculate container scale on resize
            const newContainerScale = calculateContainerScale();
            setContainerScale(newContainerScale);

            // Log resize event with detailed analysis
            logger.logUIEvent('canvas-resize-event', {
                numberOfRows,
                newCanvasScale: PLINKO_CANVAS_SCALE[numberOfRows],
                newContainerScale,
                viewport: {
                    width: window.innerWidth,
                    height: window.innerHeight,
                    devicePixelRatio: window.devicePixelRatio,
                    scrollX: window.scrollX,
                    scrollY: window.scrollY,
                },
                responsive: {
                    isMobile: window.innerWidth < 768,
                    isTablet: window.innerWidth >= 768 && window.innerWidth < 1024,
                    isDesktop: window.innerWidth >= 1024,
                    aspectRatio: window.innerWidth / window.innerHeight,
                    orientation: window.innerWidth > window.innerHeight ? 'landscape' : 'portrait',
                },
                scaling: {
                    canvasScaleValue: PLINKO_CANVAS_SCALE[numberOfRows],
                    containerScale: newContainerScale,
                    canvasScaleInRange: PLINKO_CANVAS_SCALE[numberOfRows] >= 0.5 && PLINKO_CANVAS_SCALE[numberOfRows] <= 2.0,
                    containerScaleInRange: newContainerScale >= 0.3 && newContainerScale <= 1.0,
                    expectedCanvasWidth: 1050 * PLINKO_CANVAS_SCALE[numberOfRows],
                    expectedCanvasHeight: 600 * PLINKO_CANVAS_SCALE[numberOfRows],
                    expectedContainerWidth: 1050 * newContainerScale,
                    expectedContainerHeight: 600 * newContainerScale,
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
    }, [numberOfRows, logContainerRelationships, calculateContainerScale]);

    return (
        <div
            ref={mainContainerRef}
            className="flex flex-col items-center justify-center relative w-full h-full"
            style={{
                transform: `scale(${containerScale})`,
                transformOrigin: 'center top',
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
                        transform: `scale(${1 / containerScale})`, // Counter-scale logger controls to keep them readable
                        transformOrigin: 'top left',
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
                        // Remove individual canvas scaling, let container scaling handle it
                        transform: `translateX(-50%) translateY(${numberOfRows + numberOfRows / 8}px)`,
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
