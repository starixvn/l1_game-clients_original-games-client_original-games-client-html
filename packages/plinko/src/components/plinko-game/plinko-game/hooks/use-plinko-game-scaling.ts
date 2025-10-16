import { useMemo, useState, useEffect } from "react";
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
    const [isInitialized, setIsInitialized] = useState(false);

    // Initialize immediately for mobile, or after a short delay for desktop to ensure DOM stability
    useEffect(() => {
        if (isMobile) {
            // Mobile devices typically render faster, initialize immediately
            setIsInitialized(true);
        } else {
            // Desktop may need a short delay for complex layouts
            const timer = setTimeout(() => {
                setIsInitialized(true);
            }, 50);

            return () => clearTimeout(timer);
        }
    }, [isMobile]);

    const finalScale = useMemo(() => {
        // Don't calculate finalScale until DOM is ready
        if (!isInitialized) {
            return 1;
        }

        const frameWrapperWithoutBackgroundElement = gameFrameWrapperWithoutBackgroundRef?.current;
        if (!frameWrapperWithoutBackgroundElement) {
            return 1;
        }

        const frameRect = frameWrapperWithoutBackgroundElement.getBoundingClientRect();
        const expectedMainWidth = 1050 * scaleValue; // 1050 is the original canvas width

        // Check if content needs scaling to fit within the frame
        if (expectedMainWidth > frameRect.width) {
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

            // Use different margin factors for mobile vs desktop
            const marginFactor = isMobile ? 0.9 : 0.8; // Less aggressive margin on mobile
            const effectiveFrameWidth = frameRect.width * marginFactor;
            const calculatedScale = effectiveFrameWidth / pegsSpan;

            // Apply minimum scale limits - be more conservative on mobile
            const minScale = isMobile ? 0.75 : 0.5;
            return Math.max(minScale, calculatedScale);
        }

        // No scaling needed
        return 1;
    }, [viewportWidth, gameFrameWrapperWithoutBackgroundRef, isInitialized, scaleValue, numberOfRows, isMobile]);

    return {
        scaleValue,
        finalScale
    };
};
