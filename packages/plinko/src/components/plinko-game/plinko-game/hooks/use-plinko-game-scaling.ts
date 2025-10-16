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

        if (!isMobile) {
            const frameWrapperWithoutBackgroundElement = gameFrameWrapperWithoutBackgroundRef?.current;
            if (frameWrapperWithoutBackgroundElement) {
                const frameRect = frameWrapperWithoutBackgroundElement.getBoundingClientRect();
                const expectedMainWidth = 1050 * scaleValue;

                if (expectedMainWidth > frameRect.width) {
                    const marginFactor = 0.9;
                    const effectiveFrameWidth = frameRect.width * marginFactor;
                    const normalizedScale = effectiveFrameWidth / pegsSpan;
                    return normalizedScale * (pegsSpan / pegsSpan);
                } else {
                    return 1.0;
                }
            }

            const referenceRows = 10;
            const referenceScaleValue = PLINKO_CANVAS_SCALE[referenceRows] || 1.0;
            const normalizedScale = (scaleValue / referenceScaleValue) * (pegsSpan / pegsSpan);
            return Math.min(1.0, normalizedScale);
        }

        const marginFactor = 0.9;
        const effectiveViewportWidth = viewportWidth * marginFactor;
        const referenceRows = 10;
        const referenceColumnsInRow = initialColumns + (referenceRows - 1);
        const referenceSpace = (1050 - gap * referenceColumnsInRow) / 2;
        const referenceLeftmostPegX = referenceSpace + 1 * gap - pegRadius * mapGap;
        const referenceRightmostPegX = referenceSpace + referenceColumnsInRow * gap - pegRadius * mapGap;
        const referenceVisualLeftEdge = referenceLeftmostPegX - pegRadius;
        const referenceVisualRightEdge = referenceRightmostPegX + pegRadius;
        const referencePegsSpan = referenceVisualRightEdge - referenceVisualLeftEdge;
        const referenceEffectivePegsSpan = referencePegsSpan * (PLINKO_CANVAS_SCALE[referenceRows] || 1.0);
        const referenceScale = effectiveViewportWidth / referenceEffectivePegsSpan;
        const calculatedScale = referenceScale * (referenceEffectivePegsSpan / (pegsSpan * scaleValue));
        return Math.min(1.0, calculatedScale);
    }, [viewportWidth, numberOfRows, scaleValue, gameFrameWrapperWithoutBackgroundRef]);

    return {
        scaleValue,
        finalScale
    };
};
