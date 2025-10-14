import { useMemo, useState, useEffect, useRef, useCallback } from "react";
import { useShallow } from "zustand/react/shallow";
import usePlinkoGameStore from "@plinko/shared/stores/plinko-game-store";
import { PLINKO_CANVAS_SCALE } from "../constant";
import useGameStore from "@shared/stores/game-store/game-store";
import Tooltip from "./tooltip";
import { getMultiplierColor } from "@plinko/lib/utils/colors-util";
import { logger } from "@plinko/services/logger";

const Slots = () => {
    const gameConfigs = useGameStore((state) => state.gameConfigs);
    const { numberOfRows, gameMode, finishedBall } = usePlinkoGameStore(
        useShallow((state) => ({
            numberOfRows: state.numberOfRows,
            gameMode: state.gameMode,
            finishedBall: state.finishedBall,
        }))
    );

    logger.logUIEvent('slots-component-rendered', {
        message: 'Slots component rendered with detailed logging active',
        numberOfRows,
        gameMode
    });

    const [localFinishedBall, setLocalFinishedBall] = useState(finishedBall);
    const slotsContainerRef = useRef<HTMLDivElement>(null);
    const slotRefs = useRef<(HTMLSpanElement | null)[]>([]);

    // Detailed logging function for slots dimensions and positions
    const logSlotsDimensions = useCallback(() => {
        logger.logUIEvent('slots-logging-function-called', {
            message: 'Logging slots dimensions function called',
            numberOfRows,
            gameMode
        });

        const container = slotsContainerRef.current;
        if (!container) {
            logger.logUIEvent('slots-container-check', {
                found: false,
                message: 'Slots container not found in DOM',
                numberOfRows,
                gameMode
            });
            return;
        }

        const containerRect = container.getBoundingClientRect();
        const containerComputedStyle = window.getComputedStyle(container);
        const parentElement = container.parentElement;
        const parentRect = parentElement?.getBoundingClientRect();
        const parentComputedStyle = parentElement ? window.getComputedStyle(parentElement) : null;

        // Log container dimensions
        logger.logUIEvent('slots-container-dimensions', {
            container: {
                dimensions: {
                    width: containerRect.width,
                    height: containerRect.height,
                    top: containerRect.top,
                    left: containerRect.left,
                    right: containerRect.right,
                    bottom: containerRect.bottom,
                },
                computedStyle: {
                    width: containerComputedStyle.width,
                    height: containerComputedStyle.height,
                    position: containerComputedStyle.position,
                    display: containerComputedStyle.display,
                    transform: containerComputedStyle.transform,
                    margin: containerComputedStyle.margin,
                    padding: containerComputedStyle.padding,
                },
                attributes: {
                    className: container.className,
                    style: container.getAttribute('style'),
                }
            },
            parent: parentElement ? {
                tagName: parentElement.tagName,
                dimensions: {
                    width: parentRect?.width,
                    height: parentRect?.height,
                    top: parentRect?.top,
                    left: parentRect?.left,
                    right: parentRect?.right,
                    bottom: parentRect?.bottom,
                },
                computedStyle: {
                    width: parentComputedStyle?.width,
                    height: parentComputedStyle?.height,
                    position: parentComputedStyle?.position,
                    display: parentComputedStyle?.display,
                    transform: parentComputedStyle?.transform,
                    overflow: parentComputedStyle?.overflow,
                }
            } : null,
            gaps: parentRect ? {
                topGap: containerRect.top - parentRect.top,
                leftGap: containerRect.left - parentRect.left,
                bottomGap: parentRect.bottom - containerRect.bottom,
                rightGap: parentRect.right - containerRect.right,
            } : null,
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight,
                devicePixelRatio: window.devicePixelRatio,
            },
            scaling: {
                scaleValue: PLINKO_CANVAS_SCALE[numberOfRows],
                numberOfRows,
                gameMode,
            }
        });

        // Log individual slot dimensions
        const validSlots = slotRefs.current.filter(slot => slot !== null);
        validSlots.forEach((slot, index) => {
            const slotRect = slot.getBoundingClientRect();
            const slotComputedStyle = window.getComputedStyle(slot);

            logger.logUIEvent('slot-individual-dimensions', {
                slotIndex: index,
                totalSlots: validSlots.length,
                dimensions: {
                    width: slotRect.width,
                    height: slotRect.height,
                    top: slotRect.top,
                    left: slotRect.left,
                    right: slotRect.right,
                    bottom: slotRect.bottom,
                },
                computedStyle: {
                    width: slotComputedStyle.width,
                    height: slotComputedStyle.height,
                    margin: slotComputedStyle.margin,
                    backgroundColor: slotComputedStyle.backgroundColor,
                },
                position: {
                    centerX: slotRect.left + slotRect.width / 2,
                    centerY: slotRect.top + slotRect.height / 2,
                },
                containerRelative: {
                    relativeTop: slotRect.top - containerRect.top,
                    relativeLeft: slotRect.left - containerRect.left,
                },
                scaling: {
                    expectedWidth: 54 * PLINKO_CANVAS_SCALE[numberOfRows],
                    expectedMargin: 2 * PLINKO_CANVAS_SCALE[numberOfRows],
                    actualWidth: slotRect.width,
                    actualMargin: index > 0 ? slotRect.left - validSlots[index - 1].getBoundingClientRect().right : 0,
                }
            });
        });

        // Log slots layout analysis
        if (validSlots.length > 1) {
            const firstSlot = validSlots[0].getBoundingClientRect();
            const lastSlot = validSlots[validSlots.length - 1].getBoundingClientRect();
            const totalSlotsWidth = lastSlot.right - firstSlot.left;
            const expectedTotalWidth = validSlots.length * (54 * PLINKO_CANVAS_SCALE[numberOfRows]) +
                (validSlots.length - 1) * (2 * 2 * PLINKO_CANVAS_SCALE[numberOfRows]); // margin calculation

            logger.logUIEvent('slots-layout-analysis', {
                totalSlots: validSlots.length,
                measured: {
                    totalWidth: totalSlotsWidth,
                    containerWidth: containerRect.width,
                    firstSlotLeft: firstSlot.left,
                    lastSlotRight: lastSlot.right,
                },
                expected: {
                    totalWidth: expectedTotalWidth,
                    scaleValue: PLINKO_CANVAS_SCALE[numberOfRows],
                },
                discrepancies: {
                    widthDifference: totalSlotsWidth - expectedTotalWidth,
                    containerOverflow: totalSlotsWidth > containerRect.width ? totalSlotsWidth - containerRect.width : 0,
                    scaling: {
                        actualScale: containerRect.width / expectedTotalWidth,
                        expectedScale: PLINKO_CANVAS_SCALE[numberOfRows],
                    }
                },
                viewport: {
                    width: window.innerWidth,
                    height: window.innerHeight,
                }
            });
        }
    }, [numberOfRows, gameMode]);

    useEffect(() => {
        if (!finishedBall) {
            return undefined;
        }

        setLocalFinishedBall(finishedBall);

        const timer = setTimeout(() => {
            setLocalFinishedBall(null);
        }, 300);

        return () => clearTimeout(timer);
    }, [finishedBall]);

    // Log slots dimensions on mount and when dependencies change
    useEffect(() => {
        logger.startWorkflow('slots-component-init', 'ui', 'Initialize Slots component with detailed logging');

        // Log initial dimensions after a short delay to ensure DOM is ready
        const timeoutId = setTimeout(() => {
            logSlotsDimensions();
        }, 100);

        // Monitor window resize events
        const handleResize = () => {
            logger.logUIEvent('slots-resize-event', {
                numberOfRows,
                gameMode,
                scaleValue: PLINKO_CANVAS_SCALE[numberOfRows],
                viewport: {
                    width: window.innerWidth,
                    height: window.innerHeight,
                    devicePixelRatio: window.devicePixelRatio,
                }
            });
            logSlotsDimensions();
        };

        window.addEventListener('resize', handleResize);

        return () => {
            clearTimeout(timeoutId);
            window.removeEventListener('resize', handleResize);
            logger.endWorkflow('slots-component-init');
        };
    }, [numberOfRows, gameMode, logSlotsDimensions]);

    const odds = useMemo(() => {
        return gameConfigs?.odds?.[gameMode][numberOfRows] as unknown as number[];
    }, [gameMode, numberOfRows, gameConfigs]);

    return (
        <div ref={slotsContainerRef} className="flex items-center justify-center w-full">
            {odds?.map((item, index) => {
                const isHit = localFinishedBall?.settlementResult?.slotIndex === index;

                return (
                    <Tooltip key={`slot-${index}-${numberOfRows}`} index={index} totalItems={odds.length} odds={item}>
                        <span
                            ref={(el) => {
                                slotRefs.current[index] = el;
                            }}
                            key={`${index}-${item}`}
                            className={` ${isHit ? "animate-slide-down" : ""
                                }  flex items-center justify-center text-white text-xs font-bold h-[30px]
            rounded-[4px] transition-transform duration-200 [text-shadow:_-1px_-1px_0_#262626,_1px_-1px_0_#262626,_-1px_1px_0_#262626,_1px_1px_0_#262626]`}
                            style={{
                                width: `${54 * PLINKO_CANVAS_SCALE[numberOfRows]}px`,
                                margin: `0 ${2 * PLINKO_CANVAS_SCALE[numberOfRows]}px`,
                                backgroundColor: getMultiplierColor(index, gameMode, numberOfRows),
                            }}
                        >
                            {item}
                        </span>
                    </Tooltip>
                );
            })}
        </div>
    );
};
export default Slots;
