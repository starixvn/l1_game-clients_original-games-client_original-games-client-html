/**
 * Rendering and Visual Constants
 * Defines all rendering-related hardcoded values for visual elements
 */

export const RENDERING_CONSTANTS = {
    // Colors
    COLORS: {
        SLOT_STROKE: 'rgba(255, 255, 255, 0.2)',
        SLOT_GRADIENT_START: '#1a252f',
        BALL_INNER_HIGHLIGHT: 'rgba(255, 255, 255, 0.3)',
        BALL_STROKE: '#FFD700',
        FALLBACK_MULTIPLIER: '#333'
    },

    // Canvas Scaling
    CANVAS: {
        SCALE_REFERENCE_WIDTH: 400,
        SCALE_REFERENCE_HEIGHT: 400,
        SCALE_REFERENCE_WIDTH_ALT: 480,
        SCALE_REFERENCE_HEIGHT_ALT: 400
    },

    // Slot Rendering
    SLOTS: {
        BORDER_RADIUS: 6,
        FONT_MIN_SIZE: 12,
        FONT_MAX_SIZE: 16,
        FONT_SIZE_DIVISOR: 3
    },

    // Ball Rendering
    BALL: {
        BALL_STROKE: '#FFD700',
        MIN_LINE_WIDTH: 1,
        LINE_WIDTH_MULTIPLIER: 0.1,
        INNER_HIGHLIGHT_OFFSET_MULTIPLIER: 0.3,
        INNER_HIGHLIGHT_RADIUS_MULTIPLIER: 0.4,
        HIGHLIGHT_POSITION_MULTIPLIER: 0.3
    },

    // Logging
    LOGGING: {
        FRAME_LOG_PROBABILITY: 0.005, // ~0.5% of frames
        UPDATE_LOG_PROBABILITY: 0.01   // ~1% of updates
    }
} as const;
