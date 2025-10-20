import React, { useState, useEffect, useRef, useMemo } from "react";
import { isMobile } from "react-device-detect";
import { PLINKO_CANVAS_SCALE } from "../constant";
import { calculatePegSafeScale, calculatePegsSpan } from "./peg-scaling-utils";
import {
    SCALING_THRESHOLDS,
    CANVAS_CONSTANTS,
    DEFAULT_VALUES,
    MOBILE_SCALING_OPTIMIZATION
} from "../constants/scaling-constants";

interface UsePlinkoGameScalingProps {
    numberOfRows: number;
    gameFrameWrapperRef: React.RefObject<HTMLDivElement>;
}

// Optimized dimension tracking with ResizeObserver
class DimensionTracker {
    private readonly resizeObserver: ResizeObserver | null = null;
    private element: HTMLElement | null = null;
    private readonly listeners: Set<(rect: DOMRectReadOnly) => void> = new Set();
    private lastRect: DOMRectReadOnly | null = null;
    private debounceTimer: number | null = null;

    constructor() {
        // Initialize ResizeObserver if supported
        if (typeof ResizeObserver !== 'undefined') {
            this.resizeObserver = new ResizeObserver((entries) => {
                const entry = entries[0];
                if (entry) {
                    this.handleResize(entry.contentRect);
                }
            });
        }
    }

    private readonly handleResize = (rect: DOMRectReadOnly) => {
        // Skip if dimensions haven't meaningfully changed (sub-pixel changes)
        if (this.lastRect &&
            Math.abs(this.lastRect.width - rect.width) < 1 &&
            Math.abs(this.lastRect.height - rect.height) < 1) {
            return;
        }

        // Clear existing timer
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
        }

        // Debounce the update
        this.debounceTimer = setTimeout(() => {
            // Double-check dimensions haven't changed during debounce
            if (!this.lastRect ||
                this.lastRect.width !== rect.width ||
                this.lastRect.height !== rect.height) {
                this.lastRect = rect;
                // Use forEach for compatibility with older ES targets
                this.listeners.forEach(listener => listener(rect));
            }
        }, MOBILE_SCALING_OPTIMIZATION.RESIZE_DEBOUNCE_DELAY) as unknown as number;
    };

    observe(element: HTMLElement | null) {
        if (this.element === element) {
            return;
        }

        // Clean up previous observation
        if (this.resizeObserver && this.element) {
            this.resizeObserver.unobserve(this.element);
        }

        this.element = element;

        // Start observing new element
        if (this.resizeObserver && element) {
            this.resizeObserver.observe(element);
            // Get initial dimensions
            const rect = element.getBoundingClientRect();
            this.handleResize(rect);
        }
    }

    subscribe(listener: (rect: DOMRectReadOnly) => void) {
        this.listeners.add(listener);

        // Send current dimensions if available
        if (this.lastRect) {
            listener(this.lastRect);
        }

        return () => {
            this.listeners.delete(listener);
        };
    }

    destroy() {
        if (this.resizeObserver && this.element) {
            this.resizeObserver.unobserve(this.element);
        }
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
        }
        this.listeners.clear();
    }
}

// Cached scaling calculations to avoid recomputation
const scalingCache = new Map<string, number>();

// Optimized scaling calculation with pre-computed constants
const mobileScalingConstants = {
    scaleDownThreshold: SCALING_THRESHOLDS.MOBILE.SCALE_DOWN,
    scaleUpThreshold: SCALING_THRESHOLDS.MOBILE.SCALE_UP,
    marginFactor: SCALING_THRESHOLDS.MOBILE.MARGIN_FACTOR,
    minScale: SCALING_THRESHOLDS.MOBILE.MIN_SCALE,
    maxScaleUp: SCALING_THRESHOLDS.MOBILE.MAX_SCALE_UP,
    visualMargin: 0.5, // For pegs span calculation
    pegSafeMargin: 2,   // For safe scale calculation
} as const;

// Pure scaling calculation function (no React hooks) - optimized
function calculateMobileScalingPure(
    expectedMainWidth: number,
    frameRect: DOMRectReadOnly,
    numberOfRows: number,
    containerRef?: React.RefObject<HTMLDivElement>
): number {
    // Create optimized cache key (avoid string concatenation)
    const cacheKey = `${expectedMainWidth | 0}-${frameRect.width | 0}-${frameRect.height | 0}-${numberOfRows}`;

    // Return cached result if available
    const cached = scalingCache.get(cacheKey);
    if (cached !== undefined) {
        return cached;
    }

    const {
        scaleDownThreshold,
        scaleUpThreshold,
        marginFactor,
        minScale,
        maxScaleUp,
        visualMargin,
        pegSafeMargin
    } = mobileScalingConstants;

    // Check scaling requirements
    const needsScaleDown = expectedMainWidth > frameRect.width * scaleDownThreshold;
    const needsScaleUp = expectedMainWidth < frameRect.width * scaleUpThreshold;

    let result = DEFAULT_VALUES.NO_SCALE;

    if (needsScaleDown || needsScaleUp) {
        if (needsScaleDown) {
            // Get container element for boundary detection
            const containerElement = containerRef?.current;

            // Calculate safe scale to prevent peg cutoff
            const pegSafeScale = calculatePegSafeScale(numberOfRows, {
                width: frameRect.width,
                height: frameRect.height,
                top: frameRect.top,
                left: frameRect.left,
                right: frameRect.right,
                bottom: frameRect.bottom,
                x: frameRect.x,
                y: frameRect.y,
                toJSON: () => ({})
            } as DOMRect, containerElement, pegSafeMargin);

            // Calculate optimal scale based on peg span
            const { pegsSpan } = calculatePegsSpan(numberOfRows, visualMargin);
            const effectiveFrameWidth = frameRect.width * marginFactor;
            const calculatedScale = effectiveFrameWidth / pegsSpan;

            // Use most restrictive scale, with minimum bounds
            result = Math.max(minScale, Math.min(calculatedScale, pegSafeScale));
        } else {
            // Scale up with bounds checking
            const scaleUpRatio = frameRect.width / expectedMainWidth;
            result = Math.min(maxScaleUp, Math.max(DEFAULT_VALUES.NO_SCALE, scaleUpRatio));
        }
    }

    // Cache result with size management
    scalingCache.set(cacheKey, result);
    if (scalingCache.size > 50) {
        const firstKey = scalingCache.keys().next().value;
        scalingCache.delete(firstKey);
    }

    return result;
}

// Optimized layout adjustment - integrated into main calculation
function applyLayoutOptimization(calculatedScale: number): number {
    // Only apply optimization if scale is too small (content would be too tiny)
    const threshold = MOBILE_SCALING_OPTIMIZATION.LAYOUT_OPTIMIZATION_THRESHOLD;
    const multiplier = MOBILE_SCALING_OPTIMIZATION.LAYOUT_OPTIMIZATION_MULTIPLIER;
    const minScale = MOBILE_SCALING_OPTIMIZATION.MIN_ACCEPTABLE_SCALE;

    return calculatedScale > threshold
        ? Math.max(calculatedScale * multiplier, minScale)
        : calculatedScale;
}

export const usePlinkoGameScaling = ({
    numberOfRows,
    gameFrameWrapperRef
}: UsePlinkoGameScalingProps) => {
    const scaleValue = PLINKO_CANVAS_SCALE[numberOfRows];
    const [isInitialized, setIsInitialized] = useState(false);
    const [dimensions, setDimensions] = useState<DOMRectReadOnly | null>(null);
    // Start with safe mobile scale to prevent flash of oversized content
    const [isReady, setIsReady] = useState(!isMobile);
    const finalScaleRef = useRef<number>(isMobile ? SCALING_THRESHOLDS.MOBILE.MIN_SCALE : DEFAULT_VALUES.NO_SCALE);
    const dimensionTrackerRef = useRef<DimensionTracker | null>(null);
    const lastCalculationTimeRef = useRef<number>(0);

    // Pre-calculated expected width (no useMemo needed for simple multiplication)
    const expectedMainWidth = CANVAS_CONSTANTS.ORIGINAL_WIDTH * scaleValue;

    // Initialize dimension tracker
    useEffect(() => {
        dimensionTrackerRef.current = new DimensionTracker();
        return () => {
            dimensionTrackerRef.current?.destroy();
        };
    }, []);

    // Initialize immediately since we only handle mobile scaling now
    useEffect(() => {
        if (isMobile) {
            setIsInitialized(true);
        }
    }, [isMobile]);

    // Observe dimension changes
    useEffect(() => {
        if (gameFrameWrapperRef.current && dimensionTrackerRef.current) {
            dimensionTrackerRef.current.observe(gameFrameWrapperRef.current);
        }
    }, [gameFrameWrapperRef]);

    // Subscribe to dimension changes
    useEffect(() => {
        if (!dimensionTrackerRef.current) {
            return undefined;
        }

        return dimensionTrackerRef.current.subscribe((rect) => {
            setDimensions(rect);
        });
    }, []);

    // Calculate final scale with throttling
    const finalScale = useMemo(() => {
        // Return cached value if already calculated and ready
        if (finalScaleRef.current !== (isMobile ? SCALING_THRESHOLDS.MOBILE.MIN_SCALE : DEFAULT_VALUES.NO_SCALE) && isReady) {
            return finalScaleRef.current;
        }

        // Only calculate on mobile devices
        if (!isInitialized || !isMobile || !dimensions) {
            return isMobile ? SCALING_THRESHOLDS.MOBILE.MIN_SCALE : DEFAULT_VALUES.NO_SCALE;
        }

        // Throttle calculations to prevent excessive computation
        const now = Date.now();
        if (now - lastCalculationTimeRef.current < MOBILE_SCALING_OPTIMIZATION.MIN_RECALCULATION_INTERVAL) {
            return finalScaleRef.current;
        }

        lastCalculationTimeRef.current = now;

        // Perform scaling calculation
        const calculatedScale = calculateMobileScalingPure(
            expectedMainWidth,
            dimensions,
            numberOfRows,
            gameFrameWrapperRef
        );

        // Apply layout optimization inline
        const optimizedScale = applyLayoutOptimization(calculatedScale);

        // Cache the final result
        finalScaleRef.current = optimizedScale;

        // Mark as ready once we have calculated the scale
        if (!isReady) {
            setIsReady(true);
        }

        return optimizedScale;
    }, [
        isInitialized,
        isMobile,
        dimensions?.width,
        dimensions?.height,
        scaleValue, // expectedMainWidth depends on this
        numberOfRows,
        gameFrameWrapperRef?.current,
        isReady
    ]);

    return {
        scaleValue,
        finalScale,
        isReady
    };
};
