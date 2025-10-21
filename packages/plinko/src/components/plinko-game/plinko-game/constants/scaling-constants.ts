/**
 * Plinko Game Scaling Constants
 * Centralized configuration for all scaling-related hardcoded values
 */

// Canvas and Layout Constants
export const CANVAS_CONSTANTS = {
    /** Original canvas width in pixels */
    ORIGINAL_WIDTH: 1050,
    /** Base game height in pixels */
    BASE_GAME_HEIGHT: 575,
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
    RADIUS: 7.5,
    /** Gap multiplier for peg spacing */
    MAP_GAP: 3.6,
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

// Scaling Threshold Constants (Mobile Only - Desktop handled by CSS/Tailwind)
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
} as const;

// Buffer Factors for Safe Scaling
export const BUFFER_FACTORS = {
    /** Buffer factor for peg safe scale with visual margin multiplier 2 */
    PEG_SAFE_SCALE_HIGH: 0.75,
    /** Buffer factor for peg safe scale with visual margin multiplier 1.2 */
    PEG_SAFE_SCALE_LOW: 0.88,
} as const;

// Visual Effect Constants
export const VISUAL_CONSTANTS = {
    /** Z-index for logger controls */
    LOGGER_Z_INDEX: 10000,
    /** Canvas transform offset factor */
    CANVAS_TRANSFORM_OFFSET_FACTOR: 8,
} as const;

// Mobile Scaling Optimization Constants
export const MOBILE_SCALING_OPTIMIZATION = {
    /** Debounce delay for resize calculations (ms) */
    RESIZE_DEBOUNCE_DELAY: 100,
    /** Minimum time between scaling recalculations (ms) */
    MIN_RECALCULATION_INTERVAL: 200,
    /** Layout optimization threshold */
    LAYOUT_OPTIMIZATION_THRESHOLD: 0.7,
    /** Layout optimization multiplier */
    LAYOUT_OPTIMIZATION_MULTIPLIER: 0.9,
    /** Minimum acceptable scale to ensure visibility */
    MIN_ACCEPTABLE_SCALE: 0.7,
} as const;

// Default Values
export const DEFAULT_VALUES = {
    /** Default scale when no scaling is needed */
    NO_SCALE: 1 as number,
    /** Default visual margin multiplier */
    DEFAULT_VISUAL_MARGIN_MULTIPLIER: 2,
    /** Default pegs span visual margin multiplier */
    DEFAULT_PEGS_SPAN_MARGIN_MULTIPLIER: 0.5,
} as const;
