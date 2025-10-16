import { logger } from "@plinko/services/logger";
import { PLINKO_CANVAS_SCALE } from "./constant";

/**
 * Utility functions for logging Plinko game component state and dimensions
 */

export const logMainContainer = (mainContainer: HTMLElement, mainRect: DOMRect, mainComputedStyle: CSSStyleDeclaration) => {
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

export const logCanvasContainer = (canvasContainer: HTMLElement, mainRect: DOMRect, scaleValue: number, numberOfRows: number) => {
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

export const logSlotsContainer = (slotsContainer: HTMLElement, mainRect: DOMRect) => {
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

export const logCanvasSlotsRelationship = (canvasContainer: HTMLElement, slotsContainer: HTMLElement, mainRect: DOMRect, numberOfRows: number) => {
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

export const logLayoutAnalysis = (mainContainer: HTMLElement, canvasContainer: HTMLElement | null, slotsContainer: HTMLElement | null, mainRect: DOMRect, numberOfRows: number) => {
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
        }
    });
};

export const checkCanvasScaling = () => {
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
                expectedScale: 1.0, // This would need to be passed in or calculated
                actualScale: rect.width / 1050, // Assuming canvas width is 1050
                scaleRatio: (rect.width / 1050) / 1.0, // This would need to be passed in or calculated
                expectedDimensions: {
                    width: 1050, // This would need to be passed in or calculated
                    height: 600, // This would need to be passed in or calculated
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
