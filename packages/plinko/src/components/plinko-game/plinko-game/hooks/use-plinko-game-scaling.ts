import { useMemo } from "react";
import { isMobile } from "react-device-detect";
import { PLINKO_CANVAS_SCALE } from "../constant";

interface UsePlinkoGameScalingProps {
    numberOfRows: number;
    viewportWidth: number;
    gameFrameWrapperWithoutBackgroundRef: React.RefObject<HTMLDivElement>;
}

export const usePlinkoGameScaling = ({
    numberOfRows,
    viewportWidth,
    gameFrameWrapperWithoutBackgroundRef
}: UsePlinkoGameScalingProps) => {
    const scaleValue = PLINKO_CANVAS_SCALE[numberOfRows];

    const finalScale = useMemo(() => {
        // Only apply finalScale in extreme cases to avoid interfering with scaleValue
        // The scaleValue (based on numberOfRows) should handle normal scaling
        if (!isMobile) {
            const frameWrapperWithoutBackgroundElement = gameFrameWrapperWithoutBackgroundRef?.current;
            if (frameWrapperWithoutBackgroundElement) {
                const frameRect = frameWrapperWithoutBackgroundElement.getBoundingClientRect();
                const expectedMainWidth = 1050 * scaleValue; // 1050 is the original canvas width

                // Only apply finalScale if content would be severely cut off (>50% overflow)
                const severeOverflowThreshold = 1.5;
                if (expectedMainWidth > frameRect.width * severeOverflowThreshold) {
                    const pegRadius = 8.5;
                    const mapGap = 3.4;
                    const gap = pegRadius * 2 * mapGap;
                    const initialColumns = 3;
                    const columnsInRow = initialColumns + (numberOfRows - 1);
                    const space = (1050 - gap * columnsInRow) / 2;
                    const leftmostPegX = space + 1 * gap - pegRadius * mapGap;
                    const rightmostPegX = space + columnsInRow * gap - pegRadius * mapGap;

                    const visualLeftEdge = leftmostPegX - pegRadius;
                    const visualRightEdge = rightmostPegX + pegRadius;
                    const pegsSpan = visualRightEdge - visualLeftEdge;

                    const marginFactor = 0.8; // More aggressive margin
                    const effectiveFrameWidth = frameRect.width * marginFactor;
                    return Math.max(0.5, effectiveFrameWidth / pegsSpan); // Don't scale below 0.5
                }
            }
        }

        // Let scaleValue handle normal scaling
        return 1;
    }, [viewportWidth, gameFrameWrapperWithoutBackgroundRef]); // Don't depend on numberOfRows or scaleValue to avoid interference

    return {
        scaleValue,
        finalScale
    };
};
