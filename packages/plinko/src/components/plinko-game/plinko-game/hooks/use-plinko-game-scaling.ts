import { useState, useEffect, useRef } from "react";
import { isMobile } from "react-device-detect";
import { PLINKO_CANVAS_SCALE } from "../constant";
import { calculatePegSafeScale, calculatePegsSpan } from "./peg-scaling-utils";
import {
    SCALING_THRESHOLDS,
    CANVAS_CONSTANTS,
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
            return Math.max(minScale, finalScale);
        } else {
            // Scale up: use a simple ratio to fill more of the parent space
            const scaleUpRatio = frameRect.width / expectedMainWidth;
            // Limit scale up to avoid making content too large
            const { MAX_SCALE_UP: maxScaleUp } = SCALING_THRESHOLDS.MOBILE;
            return Math.min(maxScaleUp, Math.max(DEFAULT_VALUES.NO_SCALE, scaleUpRatio));
        }
    }

    return DEFAULT_VALUES.NO_SCALE;
};

// Desktop scaling removed - handled by CSS/Tailwind responsive design

export const usePlinkoGameScaling = ({
    numberOfRows,
    gameFrameWrapperRef
}: UsePlinkoGameScalingProps) => {
    const scaleValue = PLINKO_CANVAS_SCALE[numberOfRows];
    const [isInitialized, setIsInitialized] = useState(false);
    const finalScaleRef = useRef<number>(DEFAULT_VALUES.NO_SCALE);

    // Initialize immediately since we only handle mobile scaling now
    useEffect(() => {
        if (isMobile) {
            setIsInitialized(true);
        }
    }, [isMobile]);

    // Calculate final scale once when initialized and never change it
    useEffect(() => {
        if (isInitialized && isMobile && finalScaleRef.current === DEFAULT_VALUES.NO_SCALE) {
            const frameWrapperElement = gameFrameWrapperRef?.current;
            if (frameWrapperElement) {
                const frameRect = frameWrapperElement.getBoundingClientRect();
                const expectedMainWidth = CANVAS_CONSTANTS.ORIGINAL_WIDTH * scaleValue;
                const calculatedScale = calculateMobileScaling({
                    expectedMainWidth,
                    frameRect,
                    numberOfRows,
                    hasResized: false,
                    containerRef: gameFrameWrapperRef
                });

                // Apply layout optimization logic (previously in wrapperScale)
                // This prevents content from being too small on certain row configurations
                let finalCalculatedScale = calculatedScale;
                const minAcceptableScale = 0.7; // Minimum scale to ensure content is visible
                if (calculatedScale > minAcceptableScale) {
                    // If the calculated scale is too large (content too small), apply minimum scaling
                    finalCalculatedScale = Math.max(calculatedScale * 0.9, minAcceptableScale);
                }

                finalScaleRef.current = finalCalculatedScale;
            }
        }
    }, [isInitialized, isMobile, gameFrameWrapperRef, scaleValue, numberOfRows]);

    // Always return the cached final scale
    const finalScale = finalScaleRef.current;

    return {
        scaleValue,
        finalScale
    };
};
