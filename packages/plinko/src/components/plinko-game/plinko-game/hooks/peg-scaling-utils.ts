import {
    PEG_CONSTANTS,
    CANVAS_CONSTANTS,
    BUFFER_FACTORS,
    DEFAULT_VALUES
} from "../constants/scaling-constants";

/**
 * Shared utility for calculating peg positions and safe scaling
 */
export const calculatePegPositions = (numberOfRows: number) => {
    const { RADIUS: pegRadius, MAP_GAP: mapGap, INITIAL_COLUMNS: initialColumns } = PEG_CONSTANTS;
    const gap = pegRadius * 2 * mapGap;
    const columnsInRow = initialColumns + (numberOfRows - 1);
    const space = (CANVAS_CONSTANTS.ORIGINAL_WIDTH - gap * columnsInRow) / 2;
    const leftmostPegX = space + 1 * gap - pegRadius * mapGap;
    const rightmostPegX = space + columnsInRow * gap - pegRadius * mapGap;

    return {
        pegRadius,
        mapGap,
        gap,
        columnsInRow,
        space,
        leftmostPegX,
        rightmostPegX,
    };
};

/**
 * Calculate safe scale to prevent peg cutoff
 */
export const calculatePegSafeScale = (
    numberOfRows: number,
    frameRect: DOMRect,
    containerElement?: HTMLDivElement | null,
    visualMarginMultiplier: number = DEFAULT_VALUES.DEFAULT_VISUAL_MARGIN_MULTIPLIER
): number => {
    if (!containerElement) {
        return DEFAULT_VALUES.NO_SCALE;
    }

    const { leftmostPegX, rightmostPegX, pegRadius } = calculatePegPositions(numberOfRows);

    // Add visual margins for effects
    const visualMargin = pegRadius * visualMarginMultiplier;
    const totalVisualLeftEdge = leftmostPegX - visualMargin;
    const totalVisualRightEdge = rightmostPegX + visualMargin;

    // Convert to actual DOM positions relative to container
    const containerRect = containerElement.getBoundingClientRect();
    const scaleX = frameRect.width / CANVAS_CONSTANTS.ORIGINAL_WIDTH; // Current scale factor

    const actualLeftEdge = frameRect.left + (totalVisualLeftEdge * scaleX);
    const actualRightEdge = frameRect.left + (totalVisualRightEdge * scaleX);

    // Check if pegs are cut off
    const leftCutoff = actualLeftEdge < containerRect.left;
    const rightCutoff = actualRightEdge > containerRect.right;

    if (leftCutoff || rightCutoff) {
        // Calculate how much scaling down is needed
        const availableWidth = containerRect.width;
        const requiredWidth = totalVisualRightEdge - totalVisualLeftEdge;

        const bufferFactor = visualMarginMultiplier === PEG_CONSTANTS.VISUAL_MARGIN_MULTIPLIER.SAFE_SCALE
            ? BUFFER_FACTORS.PEG_SAFE_SCALE_HIGH
            : BUFFER_FACTORS.PEG_SAFE_SCALE_LOW;
        const safeScale = Math.min(DEFAULT_VALUES.NO_SCALE, availableWidth / requiredWidth * bufferFactor);

        return safeScale;
    }

    return DEFAULT_VALUES.NO_SCALE; // No cutoff detected
};

/**
 * Calculate pegs span for scaling calculations
 */
export const calculatePegsSpan = (numberOfRows: number, visualMarginMultiplier: number = DEFAULT_VALUES.DEFAULT_PEGS_SPAN_MARGIN_MULTIPLIER) => {
    const { leftmostPegX, rightmostPegX, pegRadius } = calculatePegPositions(numberOfRows);

    const visualLeftEdge = leftmostPegX - pegRadius;
    const visualRightEdge = rightmostPegX + pegRadius;

    // Add extra margin for visual effects around pegs
    const visualMargin = pegRadius * visualMarginMultiplier;
    const totalVisualLeftEdge = visualLeftEdge - visualMargin;
    const totalVisualRightEdge = visualRightEdge + visualMargin;

    return {
        totalVisualLeftEdge,
        totalVisualRightEdge,
        pegsSpan: totalVisualRightEdge - totalVisualLeftEdge,
    };
};
