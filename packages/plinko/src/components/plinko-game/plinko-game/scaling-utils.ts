
/**
 * Scaling utilities for Plinko game components
 * Handles responsive scaling, mobile adaptation, and canvas transformations
 */

export interface ScalingConfig {
    numberOfRows: number;
    viewportWidth: number;
    isMobile: boolean;
    scaleValue: number;
    frameRect?: DOMRect;
}

export interface ScalingResult {
    finalScale: number;
    scaledHeight: number;
    wrapperScale: number;
}

/**
 * Calculate peg geometry for scaling calculations
 */
export const calculatePegGeometry = (numberOfRows: number) => {
    const pegRadius = 8.5;
    const mapGap = 3.4;
    const gap = pegRadius * 2 * mapGap; // 57.8
    const initialColumns = 3;
    const columnsInRow = initialColumns + (numberOfRows - 1); // 12 for 10 rows
    const baseCanvasWidth = 1050;
    const space = (baseCanvasWidth - gap * columnsInRow) / 2; // 178.2
    const leftmostPegX = space + 1 * gap - pegRadius * mapGap; // 207.1
    const rightmostPegX = space + columnsInRow * gap - pegRadius * mapGap; // 842.9
    const pegsSpan = rightmostPegX - leftmostPegX; // 635.8px (distance between extreme pegs)

    return {
        pegRadius,
        mapGap,
        gap,
        initialColumns,
        columnsInRow,
        space,
        leftmostPegX,
        rightmostPegX,
        pegsSpan,
        baseCanvasWidth
    };
};

/**
 * Calculate viewport-based scaling for pegs
 */
export const calculatePegBasedScale = (pegsSpan: number, viewportWidth: number): number => {
    return viewportWidth / pegsSpan;
};

/**
 * Calculate desktop wrapper scaling when canvas exceeds frame
 */
export const calculateDesktopWrapperScale = (
    frameRect: DOMRect,
    scaleValue: number,
    baseCanvasWidth: number
): number => {
    const expectedMainWidth = baseCanvasWidth * scaleValue;

    // Calculate scale factors needed to fit main container within frame
    const scaleX = frameRect.width / expectedMainWidth;
    const scaleY = frameRect.height / (600 * scaleValue); // 600 is base canvas height
    const minScale = Math.min(scaleX, scaleY);

    // Only scale down if main container is larger than frame
    return expectedMainWidth > frameRect.width || (600 * scaleValue) > frameRect.height
        ? Math.min(1, minScale)
        : 1.0;
};

/**
 * Calculate the final scale combining all scaling factors
 */
export const calculateFinalScale = (config: ScalingConfig): number => {
    const { numberOfRows, viewportWidth, isMobile, scaleValue, frameRect } = config;

    const { pegsSpan, baseCanvasWidth } = calculatePegGeometry(numberOfRows);

    if (!isMobile) {
        // Desktop scaling logic
        if (frameRect) {
            const expectedMainWidth = baseCanvasWidth * scaleValue;

            // Use peg-based scaling if expected main container width exceeds frame width
            if (expectedMainWidth > frameRect.width) {
                return frameRect.width / pegsSpan;
            }
        }

        return scaleValue;
    }

    // Mobile scaling: combine base scaleValue with viewport adaptation
    const pegBasedScale = calculatePegBasedScale(pegsSpan, viewportWidth);
    const finalMobileScale = Math.min(pegBasedScale, scaleValue);

    return Math.max(0.5, Math.min(finalMobileScale, 2.0)); // Clamp between 0.5 and 2.0
};

/**
 * Calculate wrapper scale for desktop when main container exceeds frame dimensions
 */
export const calculateWrapperScale = (
    isMobile: boolean,
    frameRect: DOMRect | null,
    mainRect: DOMRect | null,
    finalScale: number
): number => {
    if (isMobile) {
        return 1.0; // No wrapper scaling on mobile
    }

    if (!frameRect || !mainRect) {
        return 1.0;
    }

    // Calculate scale factors needed to fit main container within frame
    const scaleX = frameRect.width / mainRect.width;
    const scaleY = frameRect.height / mainRect.height;
    const minScale = Math.min(scaleX, scaleY);

    // Only scale down if main container is larger than frame
    return mainRect.width > frameRect.width || mainRect.height > frameRect.height
        ? Math.min(1, minScale)
        : 1.0;
};

/**
 * Calculate scaled height for mobile devices
 */
export const calculateScaledHeight = (finalScale: number, baseHeight: number = 600): number => {
    return baseHeight * Math.min(1, finalScale);
};

/**
 * Get mobile-specific height styling
 */
export const getMobileHeightStyle = (isMobile: boolean, scaledHeight: number) => {
    return isMobile ? { height: `${scaledHeight}px` } : {};
};

/**
 * Get scaling debug information for logging
 */
export const getScalingDebugInfo = (config: ScalingConfig, result: ScalingResult) => {
    const { pegsSpan } = calculatePegGeometry(config.numberOfRows);

    return {
        input: {
            numberOfRows: config.numberOfRows,
            viewportWidth: config.viewportWidth,
            isMobile: config.isMobile,
            scaleValue: config.scaleValue,
            frameWidth: config.frameRect?.width,
            frameHeight: config.frameRect?.height,
        },
        geometry: {
            pegsSpan,
            baseCanvasWidth: 1050,
            baseCanvasHeight: 600,
        },
        calculations: {
            pegBasedScale: calculatePegBasedScale(pegsSpan, config.viewportWidth),
            expectedMainWidth: config.frameRect ? 1050 * config.scaleValue : null,
            wrapperScaleFactors: config.frameRect ? {
                scaleX: config.frameRect.width / (1050 * config.scaleValue),
                scaleY: config.frameRect.height / (600 * config.scaleValue),
            } : null,
        },
        result: {
            finalScale: result.finalScale,
            scaledHeight: result.scaledHeight,
            wrapperScale: result.wrapperScale,
        }
    };
};
