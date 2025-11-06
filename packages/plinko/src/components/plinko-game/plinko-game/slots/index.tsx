import { useMemo, useState, useEffect, useRef } from "react";
import { useShallow } from "zustand/react/shallow";
import Image from "next/image";
import usePlinkoGameStore from "@plinko/shared/stores/plinko-game-store";
import useGameStore from "@shared/stores/game-store/game-store";
import Tooltip from "./tooltip";
import { getLightningMultiplierColor, getMultiplierColor } from "@plinko/shared/colors-util";
import { cn } from "@shared";
import { isDesktop } from "react-device-detect";
import { usePlinkoLightningModeGameStore } from "@plinko/shared/stores";
import { buildVersion } from "@shared/constants";
import { formatPlinkoOdds } from "./slot-utils";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const fontSizes = {
    8: 18,
    9: 18,
    10: 16,
    11: 14,
    12: 12,
    13: 12,
    14: 11,
    15: 10,
    16: 9,
};

const fontSizesDesktop = {
    8: 18,
    9: 18,
    10: 16,
    11: 16,
    12: 14,
    13: 14,
    14: 12,
    15: 12,
    16: 12,
};

const Slots = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const gameConfigs = useGameStore((state) => state.gameConfigs);
    const { numberOfRows, gameMode, finishedBall } = usePlinkoGameStore(
        useShallow((state) => ({
            numberOfRows: state.numberOfRows,
            gameMode: state.gameMode,
            finishedBall: state.finishedBall,
        }))
    );

    const { isLightningMode, lightningConfig } = usePlinkoLightningModeGameStore(
        useShallow((state) => ({
            isLightningMode: state.isLightningMode,
            lightningConfig: state.lightningConfig,
        }))
    );

    const [localFinishedBall, setLocalFinishedBall] = useState(finishedBall);
    const [slotDimensions, setSlotDimensions] = useState({ width: 57, marginX: 2 });

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

    // Calculate effective numberOfRows for lightning mode
    const effectiveNumberOfRows = useMemo(() => {
        if (isLightningMode && lightningConfig?.lightningBoard?.odds) {
            return lightningConfig.lightningBoard.odds.length - 1;
        }
        return numberOfRows;
    }, [numberOfRows, isLightningMode, lightningConfig]);

    const odds = useMemo(() => {
        // Use lightning config odds if in lightning mode
        if (isLightningMode && lightningConfig?.lightningBoard?.odds) {
            return lightningConfig.lightningBoard.odds;
        }
        return gameConfigs?.odds?.[gameMode]?.[effectiveNumberOfRows] as unknown as number[];
    }, [gameMode, effectiveNumberOfRows, gameConfigs, isLightningMode, lightningConfig]);

    useEffect(() => {
        const updateDimensions = () => {
            if (!containerRef.current || !odds?.length) {
                return;
            }

            const containerWidth = containerRef.current.offsetWidth;
            const totalSlots = odds.length;

            // Calculate slot width based on container width and number of slots
            // Using a base ratio to maintain proportions
            const baseSlotWidth = 57;
            const baseMargin = 2;
            const baseTotalWidth = totalSlots * (baseSlotWidth + baseMargin * 2);

            // Scale factor based on container width
            const scaleFactor = containerWidth / baseTotalWidth;

            setSlotDimensions({
                width: baseSlotWidth * scaleFactor,
                marginX: baseMargin * scaleFactor,
            });
        };

        updateDimensions();

        const resizeObserver = new ResizeObserver(updateDimensions);
        if (containerRef.current) {
            resizeObserver.observe(containerRef.current);
        }

        return () => resizeObserver.disconnect();
    }, [odds, effectiveNumberOfRows]);

    const getFontSize = () => {
        if (isLightningMode && lightningConfig?.lightningBoard?.odds) {
            return `text-[11px]`;
        }
        return `text-[12px]`;
    };

    const getBackgroundColor = (item: number, index: number) => {
        if (isLightningMode && lightningConfig?.lightningBoard?.odds) {
            return getLightningMultiplierColor(item);
        }
        return getMultiplierColor(index, gameMode || 0, effectiveNumberOfRows);
    };

    return (
        <div ref={containerRef} className="flex items-center justify-center">
            {odds?.map((item, index) => {
                const isHit = localFinishedBall?.settlementResult?.slotIndex === index;

                return (
                    <Tooltip key={`slot-${index}-${effectiveNumberOfRows}`} index={index} totalItems={odds.length} odds={item}>
                        <span
                            key={`${index}-${item}`}
                            className={cn(
                                isHit ? "animate-slide-down" : "",
                                "flex items-center justify-center text-white font-bold h-[30px]",
                                "rounded-[4px] transition-transform duration-200 [text-shadow:_-1px_-1px_0_#262626,_1px_-1px_0_#262626,_-1px_1px_0_#262626,_1px_1px_0_#262626]"
                            )}
                            style={{
                                width: `${slotDimensions.width}px`,
                                margin: `0 ${slotDimensions.marginX}px`,
                                backgroundColor: getBackgroundColor(item, index),
                                fontSize: isDesktop
                                    ? `${fontSizesDesktop[effectiveNumberOfRows]}px`
                                    : `${fontSizes[effectiveNumberOfRows]}px`,
                            }}
                        >
                            {isLightningMode && item === 0 ? (
                                <Image
                                    src={`${basePath}/static/images/icons/hell.svg?v=${buildVersion}`}
                                    alt="hell"
                                    width={20}
                                    height={20}
                                    className="w-4 h-4"
                                />
                            ) : (
                                <span className={cn(getFontSize(), "tracking-[0px] drop-shadow-[1px_2px_1px_rgba(0,0,0,0.8)]")}>{formatPlinkoOdds(item)}</span>
                            )}
                        </span>
                    </Tooltip>
                );
            })}
        </div>
    );
};
export default Slots;
