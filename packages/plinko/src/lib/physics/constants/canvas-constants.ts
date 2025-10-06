/**
 * Canvas and Scaling Constants
 * Defines all canvas-related hardcoded values and scaling factors
 */

export const CANVAS_CONSTANTS = {
    // Default Canvas Dimensions
    DIMENSIONS: {
        DEFAULT_WIDTH: 600,
        DEFAULT_HEIGHT: 550,
        REFERENCE_WIDTH: 480,
        REFERENCE_HEIGHT: 400
    },

    // Background Gradients
    BACKGROUNDS: {
        MAIN_GRADIENT: 'linear-gradient(to bottom, #0f1419 0%, #1a2332 30%, #0f1419 100%)'
    },

    // CSS Properties
    CSS: {
        FULL_SIZE: '100%'
    }
} as const;
