import { useRef, useMemo, useState, useEffect } from "react";
import { isMobile } from "react-device-detect";
import { calculatePegSafeScale } from "./peg-scaling-utils";
import {
    LAYOUT_THRESHOLDS,
    CANVAS_CONSTANTS,
    TIMING_CONSTANTS,
    VISUAL_CONSTANTS,
    DEFAULT_VALUES
} from "../constants/scaling-constants";

interface UsePlinkoGameLayoutProps {
    numberOfRows: number;
    finalScale: number;
    gameFrameWrapperRef: React.RefObject<HTMLDivElement>;
}

// Helper function to determine overflow threshold
const getOverflowThreshold = (isStackedLayout: boolean, hasResized: boolean): number => {
    if (isStackedLayout) {
        return LAYOUT_THRESHOLDS.STACKED.OVERFLOW;
    } else if (hasResized) {
        return LAYOUT_THRESHOLDS.DESKTOP_RESIZED.OVERFLOW;
    } else {
        return LAYOUT_THRESHOLDS.DESKTOP_INITIAL.OVERFLOW;
    }
};

// Helper function to determine scale up threshold
const getScaleUpThreshold = (isStackedLayout: boolean, hasResized: boolean): number => {
    if (isStackedLayout) {
        return LAYOUT_THRESHOLDS.STACKED.SCALE_UP;
    } else if (hasResized) {
        return LAYOUT_THRESHOLDS.DESKTOP_RESIZED.SCALE_UP;
    } else {
        return LAYOUT_THRESHOLDS.DESKTOP_INITIAL.SCALE_UP;
    }
};

// Helper function to calculate final scale for scale down
const calculateScaleDown = (
    frameRect: DOMRect,
    mainRect: DOMRect,
    isStackedLayout: boolean,
    hasResized: boolean
): number => {
    const scaleX = frameRect.width / mainRect.width;
    const scaleY = frameRect.height / mainRect.height;
    const calculatedScale = Math.min(scaleX, scaleY);

    // Apply minimum scale limits based on context
    if (isStackedLayout) {
        return Math.max(LAYOUT_THRESHOLDS.STACKED.MIN_SCALE, calculatedScale);
    } else if (hasResized) {
        return calculatedScale; // Normal scaling after resize
    } else {
        return Math.max(LAYOUT_THRESHOLDS.DESKTOP_INITIAL.MIN_SCALE, calculatedScale);
    }
};

// Helper function to calculate final scale for scale up
const calculateScaleUp = (
    frameRect: DOMRect,
    mainRect: DOMRect,
    isStackedLayout: boolean
): number => {
    const scaleUpRatio = frameRect.width / mainRect.width;
    const maxScaleUp = isStackedLayout
        ? LAYOUT_THRESHOLDS.STACKED.MAX_SCALE_UP
        : LAYOUT_THRESHOLDS.DESKTOP_RESIZED.MAX_SCALE_UP;
    return Math.min(maxScaleUp, Math.max(DEFAULT_VALUES.NO_SCALE, scaleUpRatio));
};

export const usePlinkoGameLayout = ({
    numberOfRows,
    finalScale,
    gameFrameWrapperRef
}: UsePlinkoGameLayoutProps) => {
    const mainContainerRef = useRef<HTMLDivElement>(null);
    const canvasContainerRef = useRef<HTMLDivElement>(null);
    const slotsContainerRef = useRef<HTMLDivElement>(null);
    const [isLayoutReady, setIsLayoutReady] = useState(false);
    const [hasResized, setHasResized] = useState(false);

    // Track if window has been resized
    useEffect(() => {
        const handleResize = () => {
            setHasResized(true);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Use mobile-like height calculation on mobile/tablet devices
    const isStackedLayout = isMobile;
    const baseGameHeight = isStackedLayout && window.innerHeight < CANVAS_CONSTANTS.SMALL_SCREEN_THRESHOLD
        ? Math.max(CANVAS_CONSTANTS.MIN_MOBILE_HEIGHT, window.innerHeight * CANVAS_CONSTANTS.MOBILE_HEIGHT_FACTOR)
        : CANVAS_CONSTANTS.BASE_GAME_HEIGHT;
    const scaledHeight = baseGameHeight * Math.min(DEFAULT_VALUES.NO_SCALE, finalScale);

    // Initialize layout immediately for mobile/stacked layouts, or after a short delay for desktop
    useEffect(() => {
        if (isStackedLayout) {
            // Mobile or stacked layouts typically render faster, initialize immediately
            setIsLayoutReady(true);
        } else {
            // Desktop may need a short delay for layout stability
            const timer = setTimeout(() => {
                setIsLayoutReady(true);
            }, TIMING_CONSTANTS.DESKTOP_LAYOUT_DELAY);

            return () => clearTimeout(timer);
        }
    }, [isStackedLayout]);

    const wrapperScale = useMemo(() => {
        if (!isLayoutReady) {
            return DEFAULT_VALUES.NO_SCALE;
        }

        // On mobile, be more conservative with wrapper scaling to avoid over-scaling slots
        const frameWrapperElement = gameFrameWrapperRef?.current;
        if (!frameWrapperElement || !mainContainerRef.current) {
            return DEFAULT_VALUES.NO_SCALE;
        }

        const frameRect = frameWrapperElement.getBoundingClientRect();
        const mainRect = mainContainerRef.current.getBoundingClientRect();

        // Check for peg cutoff using the same logic as the scaling hook
        const pegSafeScale = calculatePegSafeScale(numberOfRows, frameRect, frameWrapperElement, 1.2);
        if (pegSafeScale < 1) {
            // If pegs are being cut off, return the safe scale
            return pegSafeScale;
        }

        // Determine scaling threshold based on context
        const overflowThreshold = getOverflowThreshold(isStackedLayout, hasResized);

        // Check for scale down (overflow)
        const needsScaleDown = mainRect.width > frameRect.width * overflowThreshold || mainRect.height > frameRect.height * overflowThreshold;

        // Check for scale up (content too small for parent)
        const scaleUpThreshold = getScaleUpThreshold(isStackedLayout, hasResized);
        const needsScaleUp = mainRect.width < frameRect.width * scaleUpThreshold;

        if (needsScaleDown) {
            const finalScale = calculateScaleDown(frameRect, mainRect, isStackedLayout, hasResized);

            return finalScale;
        } else if (needsScaleUp) {
            const finalScale = calculateScaleUp(frameRect, mainRect, isStackedLayout);

            return finalScale;
        }

        const finalWrapperScale = DEFAULT_VALUES.NO_SCALE;
        return finalWrapperScale;
    }, [gameFrameWrapperRef, isLayoutReady, hasResized, isStackedLayout]);

    return {
        mainContainerRef,
        canvasContainerRef,
        slotsContainerRef,
        baseGameHeight,
        scaledHeight,
        wrapperScale
    };
};
