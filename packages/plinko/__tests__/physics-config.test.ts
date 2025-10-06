/**
 * @fileoverview Tests for physics-config.ts
 * Tests physics configuration objects, types, and ball sizing logic
 */

import { physicsConfig, ballSizingConfig, PhysicsConfig } from '../src/lib/physics/physics-config';
import { PHYSICS_CONSTANTS } from '../src/lib/physics/constants/physics-constants';
import { LAYOUT_CONSTANTS } from '../src/lib/physics/constants/layout-constants';

describe('PhysicsConfig Interface', () => {
  describe('Type Safety', () => {
    it('should_export_physics_config_interface', () => {
      // Arrange - TypeScript interface export
      // Act - Import succeeds
      // Assert - Interface is available for use
      const config: PhysicsConfig = physicsConfig;
      expect(config).toBeDefined();
      expect(typeof config).toBe('object');
    });
  });
});

describe('physicsConfig Object', () => {
  describe('Happy Path', () => {
    it('should_have_correct_pins_configuration', () => {
      // Arrange - Expected values from constants
      const expectedStartPins = LAYOUT_CONSTANTS.BOARD.INITIAL_COLUMNS;
      const expectedPinGap = LAYOUT_CONSTANTS.BOARD.PEG_GAP_MULTIPLIER;

      // Act
      const pinsConfig = physicsConfig.pins;

      // Assert
      expect(pinsConfig.startPins).toBe(expectedStartPins);
      expect(pinsConfig.pinSize).toBe(2);
      expect(pinsConfig.pinGap).toBe(expectedPinGap);
    });

    it('should_have_correct_ball_configuration', () => {
      // Arrange - Act
      const ballConfig = physicsConfig.ball;

      // Assert
      expect(ballConfig.ballSize).toBe(12);
    });

    it('should_have_correct_engine_configuration', () => {
      // Arrange - Expected gravity from constants
      const expectedGravity = PHYSICS_CONSTANTS.ENGINE.GRAVITY;

      // Act
      const engineConfig = physicsConfig.engine;

      // Assert
      expect(engineConfig.engineGravity).toBe(expectedGravity);
    });

    it('should_have_correct_world_configuration', () => {
      // Arrange - Act
      const worldConfig = physicsConfig.world;

      // Assert
      expect(worldConfig.width).toBe(480);
      expect(worldConfig.height).toBe(400);
    });

    it('should_have_correct_colors_configuration', () => {
      // Arrange - Act
      const colorsConfig = physicsConfig.colors;

      // Assert
      expect(colorsConfig.background).toBe('#1a1a2e');
      expect(colorsConfig.ball).toBe('#ff6b6b');
      expect(colorsConfig.pin).toBe('#F5DCFF');
      expect(colorsConfig.multiplierHigh).toBe('#ffd700');
      expect(colorsConfig.multiplierMedium).toBe('#ff6b6b');
      expect(colorsConfig.multiplierLow).toBe('#4ecdc4');
      expect(colorsConfig.multiplierLoss).toBe('#666');
    });

    it('should_have_all_required_properties', () => {
      // Arrange - Act
      const config = physicsConfig;

      // Assert
      expect(config).toHaveProperty('pins');
      expect(config).toHaveProperty('ball');
      expect(config).toHaveProperty('engine');
      expect(config).toHaveProperty('world');
      expect(config).toHaveProperty('colors');

      expect(config.pins).toHaveProperty('startPins');
      expect(config.pins).toHaveProperty('pinSize');
      expect(config.pins).toHaveProperty('pinGap');

      expect(config.ball).toHaveProperty('ballSize');

      expect(config.engine).toHaveProperty('engineGravity');

      expect(config.world).toHaveProperty('width');
      expect(config.world).toHaveProperty('height');

      expect(config.colors).toHaveProperty('background');
      expect(config.colors).toHaveProperty('ball');
      expect(config.colors).toHaveProperty('pin');
      expect(config.colors).toHaveProperty('multiplierHigh');
      expect(config.colors).toHaveProperty('multiplierMedium');
      expect(config.colors).toHaveProperty('multiplierLow');
      expect(config.colors).toHaveProperty('multiplierLoss');
    });
  });

  describe('Edge Cases', () => {
    it('should_have_positive_dimensions', () => {
      // Arrange - Act
      const worldConfig = physicsConfig.world;

      // Assert
      expect(worldConfig.width).toBeGreaterThan(0);
      expect(worldConfig.height).toBeGreaterThan(0);
    });

    it('should_have_valid_color_formats', () => {
      // Arrange - Act
      const colorsConfig = physicsConfig.colors;

      // Assert - Basic hex color validation
      Object.values(colorsConfig).forEach(color => {
        expect(typeof color).toBe('string');
        expect(color).toMatch(/^#[0-9a-fA-F]{3,6}$/);
      });
    });

    it('should_have_reasonable_ball_size', () => {
      // Arrange - Act
      const ballSize = physicsConfig.ball.ballSize;

      // Assert
      expect(ballSize).toBeGreaterThan(0);
      expect(ballSize).toBeLessThan(100); // Reasonable upper bound
    });

    it('should_have_reasonable_pin_size', () => {
      // Arrange - Act
      const pinSize = physicsConfig.pins.pinSize;

      // Assert
      expect(pinSize).toBeGreaterThan(0);
      expect(pinSize).toBeLessThan(50); // Reasonable upper bound
    });
  });

  describe('Integration with Constants', () => {
    it('should_use_correct_constants_from_layout_constants', () => {
      // Arrange - Act - Assert
      expect(physicsConfig.pins.startPins).toBe(LAYOUT_CONSTANTS.BOARD.INITIAL_COLUMNS);
      expect(physicsConfig.pins.pinGap).toBe(LAYOUT_CONSTANTS.BOARD.PEG_GAP_MULTIPLIER);
    });

    it('should_use_correct_constants_from_physics_constants', () => {
      // Arrange - Act - Assert
      expect(physicsConfig.engine.engineGravity).toBe(PHYSICS_CONSTANTS.ENGINE.GRAVITY);
    });
  });
});

describe('ballSizingConfig Object', () => {
  describe('Happy Path', () => {
    it('should_have_correct_base_configuration', () => {
      // Arrange - Act
      const config = ballSizingConfig;

      // Assert
      expect(config.baseRows).toBe(10);
      expect(config.baseDiameter).toBe(18);
      expect(config.minDiameter).toBe(7);
      expect(config.maxDiameter).toBe(30);
      expect(config.sizeScaleFactor).toBe(0.9);
    });

    it('should_have_all_required_properties', () => {
      // Arrange - Act
      const config = ballSizingConfig;

      // Assert
      expect(config).toHaveProperty('baseRows');
      expect(config).toHaveProperty('baseDiameter');
      expect(config).toHaveProperty('minDiameter');
      expect(config).toHaveProperty('maxDiameter');
      expect(config).toHaveProperty('sizeScaleFactor');
    });
  });

  describe('Edge Cases', () => {
    it('should_have_positive_diameters', () => {
      // Arrange - Act
      const config = ballSizingConfig;

      // Assert
      expect(config.baseDiameter).toBeGreaterThan(0);
      expect(config.minDiameter).toBeGreaterThan(0);
      expect(config.maxDiameter).toBeGreaterThan(0);
    });

    it('should_have_min_less_than_max', () => {
      // Arrange - Act
      const config = ballSizingConfig;

      // Assert
      expect(config.minDiameter).toBeLessThan(config.maxDiameter);
    });

    it('should_have_reasonable_scale_factor', () => {
      // Arrange - Act
      const scaleFactor = ballSizingConfig.sizeScaleFactor;

      // Assert
      expect(scaleFactor).toBeGreaterThan(0);
      expect(scaleFactor).toBeLessThanOrEqual(1); // Should be <= 1 for scaling down
    });

    it('should_have_positive_base_rows', () => {
      // Arrange - Act
      const baseRows = ballSizingConfig.baseRows;

      // Assert
      expect(baseRows).toBeGreaterThan(0);
    });
  });

  describe('Boundary Conditions', () => {
    it('should_handle_minimum_values', () => {
      // Arrange - Act
      const config = ballSizingConfig;

      // Assert - These are the minimum reasonable values
      expect(config.minDiameter).toBeGreaterThanOrEqual(1);
      expect(config.baseRows).toBeGreaterThanOrEqual(1);
    });

    it('should_handle_maximum_values', () => {
      // Arrange - Act
      const config = ballSizingConfig;

      // Assert - These are reasonable maximum values for the game
      expect(config.maxDiameter).toBeLessThanOrEqual(100);
      expect(config.baseRows).toBeLessThanOrEqual(20);
    });
  });
});

describe('Configuration Validation', () => {
  describe('Type Safety', () => {
    it('should_be_immutable_configuration', () => {
      // Arrange - Act - Assert
      // Test that the configuration objects are properly typed
      const physics: PhysicsConfig = physicsConfig;
      const ballSizing = ballSizingConfig;

      expect(physics).toBeDefined();
      expect(ballSizing).toBeDefined();

      // Ensure they have the expected shape
      expect(Object.keys(physics)).toHaveLength(5); // pins, ball, engine, world, colors
      expect(Object.keys(ballSizing)).toHaveLength(5); // baseRows, baseDiameter, minDiameter, maxDiameter, sizeScaleFactor
    });
  });

  describe('Error Handling', () => {
    it('should_not_have_undefined_values', () => {
      // Arrange - Act
      const physics = physicsConfig;
      const ballSizing = ballSizingConfig;

      // Assert - Recursively check that no values are undefined
      const checkNoUndefined = (obj: any): boolean => {
        if (typeof obj !== 'object' || obj === null) {
          return obj !== undefined;
        }

        return Object.values(obj).every(value =>
          typeof value === 'object' ? checkNoUndefined(value) : value !== undefined
        );
      };

      expect(checkNoUndefined(physics)).toBe(true);
      expect(checkNoUndefined(ballSizing)).toBe(true);
    });

    it('should_have_numeric_values_where_expected', () => {
      // Arrange - Act
      const physics = physicsConfig;

      // Assert
      expect(typeof physics.pins.startPins).toBe('number');
      expect(typeof physics.pins.pinSize).toBe('number');
      expect(typeof physics.pins.pinGap).toBe('number');
      expect(typeof physics.ball.ballSize).toBe('number');
      expect(typeof physics.engine.engineGravity).toBe('number');
      expect(typeof physics.world.width).toBe('number');
      expect(typeof physics.world.height).toBe('number');
    });
  });
});
