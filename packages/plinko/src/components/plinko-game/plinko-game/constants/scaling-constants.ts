/**
 * Plinko Game Scaling Constants
 * Centralized configuration for all scaling-related hardcoded values
 */

// Canvas and Layout Constants
export const CANVAS_CONSTANTS = {
    /** Original canvas width in pixels */
    ORIGINAL_WIDTH: 1050,
    /** Base game height in pixels */
    BASE_GAME_HEIGHT: 600,
    /** Minimum game height for mobile devices */
    MIN_MOBILE_HEIGHT: 500,
    /** Mobile height factor for small screens */
    MOBILE_HEIGHT_FACTOR: 0.65,
    /** Small screen threshold for mobile height calculation */
    SMALL_SCREEN_THRESHOLD: 700,
} as const;

// Peg Configuration Constants
export const PEG_CONSTANTS = {
    /** Radius of pegs in pixels */
    RADIUS: 8.5,
    /** Gap multiplier for peg spacing */
    MAP_GAP: 3.4,
    /** Initial number of columns */
    INITIAL_COLUMNS: 3,
    /** Visual margin multiplier for peg effects */
    VISUAL_MARGIN_MULTIPLIER: {
        /** For peg safe scale calculations */
        SAFE_SCALE: 2,
        /** For layout calculations */
        LAYOUT: 1.2,
        /** For pegs span calculations */
        SPAN: 0.5,
    },
} as const;

// Scaling Threshold Constants
export const SCALING_THRESHOLDS = {
    MOBILE: {
        /** Threshold for scaling down on mobile */
        SCALE_DOWN: 1,
        /** Threshold for scaling up on mobile */
        SCALE_UP: 0.7,
        /** Margin factor for mobile scaling */
        MARGIN_FACTOR: 0.7,
        /** Minimum scale for mobile */
        MIN_SCALE: 0.6,
        /** Maximum scale up for mobile */
        MAX_SCALE_UP: 1.1,
    },
    DESKTOP: {
        /** Threshold for scaling down on desktop */
        SCALE_DOWN: 2,
        /** Threshold for scaling up on desktop (initial render) */
        SCALE_UP_INITIAL: 0.5,
        /** Threshold for scaling up on desktop (after resize) */
        SCALE_UP_RESIZED: 0.75,
        /** Margin factor for desktop scaling */
        MARGIN_FACTOR: 0.6,
        /** Minimum scale for desktop */
        MIN_SCALE: 0.4,
        /** Maximum scale up for desktop */
        MAX_SCALE_UP: 1.2,
    },
} as const;

// Layout Threshold Constants
export const LAYOUT_THRESHOLDS = {
    STACKED: {
        /** Overflow threshold for stacked/mobile layout */
        OVERFLOW: 1.1,
        /** Scale up threshold for stacked layout */
        SCALE_UP: 0.7,
        /** Minimum scale for stacked layout */
        MIN_SCALE: 0.75,
        /** Maximum scale up for stacked layout */
        MAX_SCALE_UP: 1.15,
    },
    DESKTOP_RESIZED: {
        /** Overflow threshold for desktop after resize */
        OVERFLOW: 1.05,
        /** Scale up threshold for desktop after resize */
        SCALE_UP: 0.75,
    },
    DESKTOP_INITIAL: {
        /** Overflow threshold for desktop initial render */
        OVERFLOW: 2,
        /** Scale up threshold for desktop initial render */
        SCALE_UP: 0.5,
        /** Minimum scale for desktop initial render */
        MIN_SCALE: 0.95,
    },
} as const;

// Buffer Factors for Safe Scaling
export const BUFFER_FACTORS = {
    /** Buffer factor for peg safe scale with visual margin multiplier 2 */
    PEG_SAFE_SCALE_HIGH: 0.75,
    /** Buffer factor for peg safe scale with visual margin multiplier 1.2 */
    PEG_SAFE_SCALE_LOW: 0.88,
} as const;

// Timing Constants
export const TIMING_CONSTANTS = {
    /** Desktop initialization delay in milliseconds */
    DESKTOP_INIT_DELAY: 50,
    /** Desktop layout initialization delay in milliseconds */
    DESKTOP_LAYOUT_DELAY: 75,
} as const;

// Visual Effect Constants
export const VISUAL_CONSTANTS = {
    /** Z-index for logger controls */
    LOGGER_Z_INDEX: 10000,
    /** Slots container offset from bottom */
    SLOTS_BOTTOM_OFFSET: 30,
    /** Canvas transform offset factor */
    CANVAS_TRANSFORM_OFFSET_FACTOR: 8,
} as const;

// Default Values
export const DEFAULT_VALUES = {
    /** Default scale when no scaling is needed */
    NO_SCALE: 1,
    /** Default visual margin multiplier */
    DEFAULT_VISUAL_MARGIN_MULTIPLIER: 2,
    /** Default pegs span visual margin multiplier */
    DEFAULT_PEGS_SPAN_MARGIN_MULTIPLIER: 0.5,
} as const;

