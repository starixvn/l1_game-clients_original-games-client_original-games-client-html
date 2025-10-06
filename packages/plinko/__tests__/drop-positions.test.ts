/**
 * @fileoverview Tests for drop-positions.ts
 * Tests drop position calculations for the Plinko board
 */

import { calculateDropPositions, getMiddleDropPosition } from '../src/lib/physics/drop-positions';
import { LAYOUT_CONSTANTS } from '../src/lib/physics/constants/layout-constants';

describe('calculateDropPositions', () => {
  describe('Happy Path', () => {
    it('should_return_exactly_9_drop_positions', () => {
      // Arrange
      const canvasWidth = 1000;

      // Act
      const positions = calculateDropPositions(canvasWidth);

      // Assert
      expect(positions).toHaveLength(9);
      expect(Array.isArray(positions)).toBe(true);
    });

    it('should_calculate_positions_with_correct_spacing', () => {
      // Arrange
      const canvasWidth = 1000;
      const expectedCount = LAYOUT_CONSTANTS.DROP_POSITIONS.COUNT;
      const spawnMargin = canvasWidth * LAYOUT_CONSTANTS.MARGINS.SPAWN_MARGIN;
      const availableWidth = canvasWidth - (spawnMargin * 2);
      const expectedSpacing = availableWidth / (expectedCount - 1);

      // Act
      const positions = calculateDropPositions(canvasWidth);

      // Assert
      expect(positions[0]).toBe(spawnMargin); // First position at margin
      expect(positions[positions.length - 1]).toBe(canvasWidth - spawnMargin); // Last position at margin

      // Check spacing between positions
      for (let i = 1; i < positions.length; i++) {
        const spacing = positions[i] - positions[i - 1];
        expect(spacing).toBeCloseTo(expectedSpacing, 5); // Allow for floating point precision
      }
    });

    it('should_return_positions_in_ascending_order', () => {
      // Arrange
      const canvasWidth = 800;

      // Act
      const positions = calculateDropPositions(canvasWidth);

      // Assert
      for (let i = 1; i < positions.length; i++) {
        expect(positions[i]).toBeGreaterThan(positions[i - 1]);
      }
    });

    it('should_calculate_positions_for_standard_canvas_width', () => {
      // Arrange
      const canvasWidth = 480; // Standard width from physics config

      // Act
      const positions = calculateDropPositions(canvasWidth);

      // Assert
      expect(positions).toHaveLength(9);
      positions.forEach(pos => {
        expect(pos).toBeGreaterThanOrEqual(0);
        expect(pos).toBeLessThanOrEqual(canvasWidth);
      });
    });
  });

  describe('Edge Cases', () => {
    it('should_handle_minimum_canvas_width', () => {
      // Arrange
      const canvasWidth = 100; // Very small width

      // Act
      const positions = calculateDropPositions(canvasWidth);

      // Assert
      expect(positions).toHaveLength(9);
      positions.forEach(pos => {
        expect(pos).toBeGreaterThanOrEqual(0);
        expect(pos).toBeLessThanOrEqual(canvasWidth);
      });

      // First and last should be at margins
      const spawnMargin = canvasWidth * LAYOUT_CONSTANTS.MARGINS.SPAWN_MARGIN;
      expect(positions[0]).toBeCloseTo(spawnMargin, 5);
      expect(positions[positions.length - 1]).toBeCloseTo(canvasWidth - spawnMargin, 5);
    });

    it('should_handle_large_canvas_width', () => {
      // Arrange
      const canvasWidth = 2000; // Large width

      // Act
      const positions = calculateDropPositions(canvasWidth);

      // Assert
      expect(positions).toHaveLength(9);
      positions.forEach(pos => {
        expect(pos).toBeGreaterThanOrEqual(0);
        expect(pos).toBeLessThanOrEqual(canvasWidth);
      });
    });

    it('should_handle_zero_canvas_width', () => {
      // Arrange
      const canvasWidth = 0;

      // Act
      const positions = calculateDropPositions(canvasWidth);

      // Assert
      expect(positions).toHaveLength(9);
      // All positions should be 0 when canvas width is 0
      positions.forEach(pos => {
        expect(pos).toBe(0);
      });
    });

    it('should_handle_negative_canvas_width', () => {
      // Arrange
      const canvasWidth = -100;

      // Act
      const positions = calculateDropPositions(canvasWidth);

      // Assert
      expect(positions).toHaveLength(9);
      // Positions should be calculated even with negative width (though not meaningful)
      positions.forEach(pos => {
        expect(typeof pos).toBe('number');
        expect(isNaN(pos)).toBe(false);
      });
    });
  });

  describe('Boundary Conditions', () => {
    it('should_have_positions_within_canvas_bounds', () => {
      // Arrange
      const testWidths = [200, 480, 800, 1200, 1920];

      testWidths.forEach(canvasWidth => {
        // Act
        const positions = calculateDropPositions(canvasWidth);

        // Assert
        positions.forEach(pos => {
          expect(pos).toBeGreaterThanOrEqual(0);
          expect(pos).toBeLessThanOrEqual(canvasWidth);
        });
      });
    });

    it('should_maintain_margins_from_canvas_edges', () => {
      // Arrange
      const canvasWidth = 1000;
      const spawnMargin = canvasWidth * LAYOUT_CONSTANTS.MARGINS.SPAWN_MARGIN;

      // Act
      const positions = calculateDropPositions(canvasWidth);

      // Assert
      expect(positions[0]).toBe(spawnMargin);
      expect(positions[positions.length - 1]).toBe(canvasWidth - spawnMargin);
    });
  });

  describe('Integration with Constants', () => {
    it('should_use_correct_drop_position_count_from_constants', () => {
      // Arrange
      const canvasWidth = 800;
      const expectedCount = LAYOUT_CONSTANTS.DROP_POSITIONS.COUNT;

      // Act
      const positions = calculateDropPositions(canvasWidth);

      // Assert
      expect(positions).toHaveLength(expectedCount);
    });

    it('should_use_correct_spawn_margin_from_constants', () => {
      // Arrange
      const canvasWidth = 600;
      const expectedMargin = canvasWidth * LAYOUT_CONSTANTS.MARGINS.SPAWN_MARGIN;

      // Act
      const positions = calculateDropPositions(canvasWidth);

      // Assert
      expect(positions[0]).toBe(expectedMargin);
      expect(positions[positions.length - 1]).toBe(canvasWidth - expectedMargin);
    });
  });
});

describe('getMiddleDropPosition', () => {
  describe('Happy Path', () => {
    it('should_return_middle_position_from_calculate_drop_positions', () => {
      // Arrange
      const canvasWidth = 1000;
      const positions = calculateDropPositions(canvasWidth);
      const expectedMiddleIndex = LAYOUT_CONSTANTS.DROP_POSITIONS.MIDDLE_INDEX;

      // Act
      const middlePosition = getMiddleDropPosition(canvasWidth);

      // Assert
      expect(middlePosition).toBe(positions[expectedMiddleIndex]);
    });

    it('should_return_fifth_position_as_middle', () => {
      // Arrange
      const canvasWidth = 800;

      // Act
      const middlePosition = getMiddleDropPosition(canvasWidth);

      // Assert - Should be the 5th position (0-based index 4)
      const positions = calculateDropPositions(canvasWidth);
      expect(middlePosition).toBe(positions[4]);
      expect(positions.indexOf(middlePosition)).toBe(4);
    });

    it('should_return_center_position_for_symmetric_layout', () => {
      // Arrange
      const canvasWidth = 600;

      // Act
      const middlePosition = getMiddleDropPosition(canvasWidth);

      // Assert - For symmetric layout, middle should be at canvas center
      expect(middlePosition).toBe(canvasWidth / 2);
    });
  });

  describe('Edge Cases', () => {
    it('should_handle_zero_canvas_width', () => {
      // Arrange
      const canvasWidth = 0;

      // Act
      const middlePosition = getMiddleDropPosition(canvasWidth);

      // Assert
      expect(middlePosition).toBe(0);
    });

    it('should_handle_negative_canvas_width', () => {
      // Arrange
      const canvasWidth = -200;

      // Act
      const middlePosition = getMiddleDropPosition(canvasWidth);

      // Assert
      const positions = calculateDropPositions(canvasWidth);
      expect(middlePosition).toBe(positions[LAYOUT_CONSTANTS.DROP_POSITIONS.MIDDLE_INDEX]);
    });

    it('should_handle_very_small_canvas_width', () => {
      // Arrange
      const canvasWidth = 50;

      // Act
      const middlePosition = getMiddleDropPosition(canvasWidth);

      // Assert
      expect(typeof middlePosition).toBe('number');
      expect(isNaN(middlePosition)).toBe(false);
    });
  });

  describe('Boundary Conditions', () => {
    it('should_always_return_valid_position_index', () => {
      // Arrange
      const canvasWidth = 400;

      // Act
      const middlePosition = getMiddleDropPosition(canvasWidth);

      // Assert
      const positions = calculateDropPositions(canvasWidth);
      const middleIndex = LAYOUT_CONSTANTS.DROP_POSITIONS.MIDDLE_INDEX;
      expect(middleIndex).toBeGreaterThanOrEqual(0);
      expect(middleIndex).toBeLessThan(positions.length);
    });

    it('should_return_position_within_canvas_bounds', () => {
      // Arrange
      const testWidths = [200, 480, 800, 1200];

      testWidths.forEach(canvasWidth => {
        // Act
        const middlePosition = getMiddleDropPosition(canvasWidth);

        // Assert
        expect(middlePosition).toBeGreaterThanOrEqual(0);
        expect(middlePosition).toBeLessThanOrEqual(canvasWidth);
      });
    });
  });

  describe('Integration with calculateDropPositions', () => {
    it('should_consistently_return_same_position_as_array_index', () => {
      // Arrange
      const canvasWidth = 1000;
      const positions = calculateDropPositions(canvasWidth);
      const middleIndex = LAYOUT_CONSTANTS.DROP_POSITIONS.MIDDLE_INDEX;

      // Act
      const middlePosition = getMiddleDropPosition(canvasWidth);

      // Assert
      expect(middlePosition).toBe(positions[middleIndex]);
      expect(positions[middleIndex]).toBeDefined();
    });

    it('should_work_with_any_valid_canvas_width', () => {
      // Arrange
      const testWidths = [300, 600, 900, 1200];

      testWidths.forEach(canvasWidth => {
        // Act
        const middlePosition = getMiddleDropPosition(canvasWidth);
        const positions = calculateDropPositions(canvasWidth);

        // Assert
        expect(typeof middlePosition).toBe('number');
        expect(positions).toContain(middlePosition);
        expect(positions.indexOf(middlePosition)).toBe(LAYOUT_CONSTANTS.DROP_POSITIONS.MIDDLE_INDEX);
      });
    });
  });

  describe('Fallback Behavior', () => {
    it('should_fallback_to_canvas_center_if_calculation_fails', () => {
      // Arrange - This test is more for documentation since the current implementation
      // always returns a valid position. Testing the fallback would require mocking
      // the calculateDropPositions function to return an empty array.

      // Act - Normal operation
      const canvasWidth = 500;
      const middlePosition = getMiddleDropPosition(canvasWidth);

      // Assert - Should work normally
      expect(middlePosition).toBe(canvasWidth / 2);
    });
  });
});
