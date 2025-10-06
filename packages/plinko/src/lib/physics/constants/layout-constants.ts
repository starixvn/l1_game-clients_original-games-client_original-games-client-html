/**
 * Layout and Positioning Constants
 * Defines all layout-related hardcoded values for board positioning and spacing
 */

export const LAYOUT_CONSTANTS = {
    // Board Layout
    BOARD: {
        PEG_RADIUS: 10,
        PEG_GAP_MULTIPLIER: 3, // mapGap factor
        PEG_GAP_BASE: 45, // Base peg gap for scaling calculations
        PEG_RADIUS_BASE: 8, // Base peg radius for scaling calculations
        SCALE_FACTOR_BASE_ROWS: 10, // Base rows for scale factor calculation
        INITIAL_COLUMNS: 3,
        WALL_LEVELS: 6,
        TRIANGULAR_WALL_THICKNESS: 10,
        TRIANGULAR_WALL_OFFSET: 15
    },

    // Margins and Spacing
    MARGINS: {
        TRIANGLE_TOP: 0.08,      // canvasHeight * 0.08
        TRIANGLE_BOTTOM: 0.15,   // canvasHeight * 0.15
        TRIANGLE_BOARD_WIDTH: 0.85, // canvasWidth * 0.85
        SPAWN_MARGIN: 0.05       // canvasWidth * 0.05
    },

    // Scale Factor Bounds
    SCALE_BOUNDS: {
        MIN_SCALE: 0.4,
        MAX_SCALE: 1.2
    },

    // Slot Positioning
    SLOTS: {
        GAP_MULTIPLIER: 2,       // pegRadius * 2 * 3
        SLOT_WIDTH_REDUCTION: 6,  // gap - 6
        SLOT_HEIGHT: 1,
        SLOT_Y_OFFSET: 40,        // 11 * 10 * 2 * 3 - 40
        SLOT_POSITION_MULTIPLIER: 0.8 // pegGap * 0.8
    },

    // Drop Positions
    DROP_POSITIONS: {
        COUNT: 9,
        MIDDLE_INDEX: 4 // 0-based index for 5th position
    },

    // Wall Thicknesses
    WALL_THICKNESS: {
        BOUNDARY: 20,
        TRIANGULAR_SEGMENT: 10
    }
} as const;
