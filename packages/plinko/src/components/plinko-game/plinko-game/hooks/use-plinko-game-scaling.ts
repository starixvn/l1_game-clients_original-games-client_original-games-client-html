import { useMemo, useState, useEffect } from "react";
import { isMobile } from "react-device-detect";
import { PLINKO_CANVAS_SCALE } from "../constant";
import { calculatePegSafeScale, calculatePegsSpan } from "./peg-scaling-utils";
import {
    SCALING_THRESHOLDS,
    CANVAS_CONSTANTS,
    TIMING_CONSTANTS,
    DEFAULT_VALUES
} from "../constants/scaling-constants";

interface UsePlinkoGameScalingProps {
    numberOfRows: number;
    gameFrameWrapperRef: React.RefObject<HTMLDivElement>;
}

interface ScalingCalculationProps {
    expectedMainWidth: number;
    frameRect: DOMRect;
    numberOfRows: number;
    hasResized: boolean;
    containerRef?: React.RefObject<HTMLDivElement>;
}


// Mobile-specific scaling calculation
const calculateMobileScaling = ({
    expectedMainWidth,
    frameRect,
    numberOfRows,
    containerRef
}: ScalingCalculationProps) => {
    const { SCALE_DOWN: scalingThreshold, SCALE_UP: scaleUpThreshold } = SCALING_THRESHOLDS.MOBILE;

    // Check if content needs scaling down to fit within the frame
    const needsScaleDown = expectedMainWidth > frameRect.width * scalingThreshold;

    // Check if content is too small and should scale up to better utilize parent space
    const needsScaleUp = expectedMainWidth < frameRect.width * scaleUpThreshold;

    if (needsScaleDown || needsScaleUp) {
        if (needsScaleDown) {
            // Get the container element for peg boundary detection
            const containerElement = containerRef?.current;

            // First check if pegs are being cut off and calculate safe scale
            const pegSafeScale = calculatePegSafeScale(numberOfRows, frameRect, containerElement, 2);

            // Scale down: calculate based on pegs span to ensure visual effects fit
            const { pegsSpan } = calculatePegsSpan(numberOfRows, 0.5);

            // Mobile: conservative margins to ensure visual effects are fully visible
            const { MARGIN_FACTOR: marginFactor, MIN_SCALE: minScale } = SCALING_THRESHOLDS.MOBILE;
            const effectiveFrameWidth = frameRect.width * marginFactor;
            const calculatedScale = effectiveFrameWidth / pegsSpan;

            // Use the more restrictive scale between calculated and peg-safe scale
            const finalScale = Math.min(calculatedScale, pegSafeScale);

            // Allow more aggressive scaling on mobile for visual effects
            const resultScale = Math.max(minScale, finalScale);

            return resultScale;
        } else {
            // Scale up: use a simple ratio to fill more of the parent space
            const scaleUpRatio = frameRect.width / expectedMainWidth;
            // Limit scale up to avoid making content too large
            const { MAX_SCALE_UP: maxScaleUp } = SCALING_THRESHOLDS.MOBILE;
            const resultScale = Math.min(maxScaleUp, Math.max(DEFAULT_VALUES.NO_SCALE, scaleUpRatio));

            return resultScale;
        }
    }

    return DEFAULT_VALUES.NO_SCALE;
};

// Desktop-specific scaling calculation
const calculateDesktopScaling = ({
    expectedMainWidth,
    frameRect,
    numberOfRows,
    hasResized,
    containerRef
}: ScalingCalculationProps) => {
    // Desktop scaling threshold - consistent for both initial render and after resize
    // Only scale if there's extreme overflow to preserve original desktop behavior
    const { SCALE_DOWN: scalingThreshold } = SCALING_THRESHOLDS.DESKTOP;

    // Check if content needs scaling down to fit within the frame
    const needsScaleDown = expectedMainWidth > frameRect.width * scalingThreshold;

    // Check if content is too small and should scale up to better utilize parent space
    // Be very restrictive on desktop initial render, more permissive after resize
    const { SCALE_UP_INITIAL, SCALE_UP_RESIZED } = SCALING_THRESHOLDS.DESKTOP;
    const scaleUpThreshold = hasResized ? SCALE_UP_RESIZED : SCALE_UP_INITIAL;
    const needsScaleUp = expectedMainWidth < frameRect.width * scaleUpThreshold;

    if (needsScaleDown || needsScaleUp) {
        if (needsScaleDown) {
            // Get the container element for peg boundary detection
            const containerElement = containerRef?.current;

            // First check if pegs are being cut off and calculate safe scale
            const pegSafeScale = calculatePegSafeScale(numberOfRows, frameRect, containerElement, 2);

            // Scale down: calculate based on pegs span to ensure visual effects fit
            const { pegsSpan } = calculatePegsSpan(numberOfRows, 0.5);

            // Desktop: very conservative margins to ensure edge peg effects fit
            const { MARGIN_FACTOR: marginFactor, MIN_SCALE: minScale } = SCALING_THRESHOLDS.DESKTOP;
            const effectiveFrameWidth = frameRect.width * marginFactor;
            const calculatedScale = effectiveFrameWidth / pegsSpan;

            // Use the more restrictive scale between calculated and peg-safe scale
            const finalScale = Math.min(calculatedScale, pegSafeScale);

            // Apply minimum scale limits - more restrictive on desktop
            const resultScale = Math.max(minScale, finalScale);

            return resultScale;
        } else {
            // Scale up: use a simple ratio to fill more of the parent space
            const scaleUpRatio = frameRect.width / expectedMainWidth;
            // Limit scale up to avoid making content too large
            const { MAX_SCALE_UP: maxScaleUp } = SCALING_THRESHOLDS.DESKTOP;
            const resultScale = Math.min(maxScaleUp, Math.max(DEFAULT_VALUES.NO_SCALE, scaleUpRatio));

            return resultScale;
        }
    }

    return DEFAULT_VALUES.NO_SCALE;
};

export const usePlinkoGameScaling = ({
    numberOfRows,
    gameFrameWrapperRef
}: UsePlinkoGameScalingProps) => {
    const scaleValue = PLINKO_CANVAS_SCALE[numberOfRows];
    const [isInitialized, setIsInitialized] = useState(false);
    const [hasResized, setHasResized] = useState(false);

    // Track if window has been resized
    useEffect(() => {
        const handleResize = () => {
            setHasResized(true);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Initialize immediately for mobile, or after a short delay for desktop to ensure DOM stability
    useEffect(() => {
        if (isMobile) {
            // Mobile devices typically render faster, initialize immediately
            setIsInitialized(true);
        } else {
            // Desktop may need a short delay for complex layouts
            const timer = setTimeout(() => {
                setIsInitialized(true);
            }, TIMING_CONSTANTS.DESKTOP_INIT_DELAY);

            return () => clearTimeout(timer);
        }
    }, [isMobile]);

    const finalScale = useMemo(() => {
        // Don't calculate finalScale until DOM is ready
        if (!isInitialized) {
            return DEFAULT_VALUES.NO_SCALE;
        }

        const frameWrapperElement = gameFrameWrapperRef?.current;
        if (!frameWrapperElement) {
            return DEFAULT_VALUES.NO_SCALE;
        }

        const frameRect = frameWrapperElement.getBoundingClientRect();
        const expectedMainWidth = CANVAS_CONSTANTS.ORIGINAL_WIDTH * scaleValue;

        let calculatedScale: number;

        // Use appropriate scaling calculation based on device type
        if (isMobile) {
            calculatedScale = calculateMobileScaling({
                expectedMainWidth,
                frameRect,
                numberOfRows,
                hasResized,
                containerRef: gameFrameWrapperRef
            });
        } else {
            calculatedScale = calculateDesktopScaling({
                expectedMainWidth,
                frameRect,
                numberOfRows,
                hasResized,
                containerRef: gameFrameWrapperRef
            });
        }

        return calculatedScale;
    }, [gameFrameWrapperRef, isInitialized, hasResized, scaleValue, numberOfRows, isMobile]);

    return {
        scaleValue,
        finalScale
    };
};
