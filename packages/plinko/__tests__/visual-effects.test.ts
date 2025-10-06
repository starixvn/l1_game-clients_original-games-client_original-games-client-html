/**
 * @fileoverview Tests for visual-effects.ts
 * Tests visual effects functionality including win text particles and collision sounds
 */

import { createWinTextParticle, playCollisionSound } from '../src/lib/physics/visual-effects';

describe('createWinTextParticle', () => {
  beforeEach(() => {
    // Mock DOM methods for each test
    jest.spyOn(document, 'createElement').mockImplementation(() => ({
      textContent: '',
      style: { cssText: '' },
      parentNode: null,
      remove: jest.fn(),
    } as any));

    jest.spyOn(document, 'querySelector').mockReturnValue({
      appendChild: jest.fn(),
    } as any);

    jest.spyOn(document.head, 'appendChild').mockImplementation(() => ({} as Node));
    jest.spyOn(global, 'setTimeout').mockImplementation(() => 123 as any);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Happy Path', () => {
    it('should_not_crash_with_valid_parameters', () => {
      // Arrange
      const winAmount = 100;
      const x = 200;
      const y = 300;

      // Act & Assert - Should not throw
      expect(() => {
        createWinTextParticle(winAmount, x, y);
      }).not.toThrow();

      // Verify DOM methods were called
      expect(document.createElement).toHaveBeenCalledWith('div');
      expect(document.createElement).toHaveBeenCalledWith('style');
      expect(document.querySelector).toHaveBeenCalledWith('.canvas-ball-layout');
      expect(document.head.appendChild).toHaveBeenCalled();
      expect(global.setTimeout).toHaveBeenCalledWith(expect.any(Function), 2000);
    });
  });

  describe('Edge Cases', () => {
    it('should_handle_zero_win_amount', () => {
      // Arrange
      const winAmount = 0;
      const x = 0;
      const y = 0;

      // Act & Assert - Should not throw
      expect(() => {
        createWinTextParticle(winAmount, x, y);
      }).not.toThrow();
    });

    it('should_handle_negative_win_amount', () => {
      // Arrange
      const winAmount = -50;
      const x = 0;
      const y = 0;

      // Act & Assert - Should not throw
      expect(() => {
        createWinTextParticle(winAmount, x, y);
      }).not.toThrow();
    });

    it('should_handle_large_win_amount', () => {
      // Arrange
      const winAmount = 999999;
      const x = 0;
      const y = 0;

      // Act & Assert - Should not throw
      expect(() => {
        createWinTextParticle(winAmount, x, y);
      }).not.toThrow();
    });

    it('should_handle_decimal_win_amount', () => {
      // Arrange
      const winAmount = 123.456;
      const x = 0;
      const y = 0;

      // Act & Assert - Should not throw
      expect(() => {
        createWinTextParticle(winAmount, x, y);
      }).not.toThrow();
    });
  });

  describe('Error Handling', () => {
    it('should_not_crash_when_canvas_container_not_found', () => {
      // Arrange
      const winAmount = 100;
      const x = 200;
      const y = 300;

      // Override querySelector to return null
      (document.querySelector as jest.Mock).mockReturnValueOnce(null);

      // Act & Assert - Should not throw even when container is not found
      expect(() => {
        createWinTextParticle(winAmount, x, y);
      }).not.toThrow();

      // Should still create elements and add to head
      expect(document.head.appendChild).toHaveBeenCalled();
    });
  });
});

describe('playCollisionSound', () => {
  describe('Happy Path', () => {
    it('should_not_crash_for_jackpot_multiplier', () => {
      // Arrange - Act & Assert
      expect(() => playCollisionSound(10)).not.toThrow();
      expect(() => playCollisionSound(15)).not.toThrow();
      expect(() => playCollisionSound(100)).not.toThrow();
    });

    it('should_not_crash_for_big_win_multiplier', () => {
      // Arrange - Act - Assert
      expect(() => playCollisionSound(5)).not.toThrow();
      expect(() => playCollisionSound(7)).not.toThrow();
      expect(() => playCollisionSound(9)).not.toThrow();
    });

    it('should_not_crash_for_win_multiplier', () => {
      // Arrange - Act - Assert
      expect(() => playCollisionSound(2)).not.toThrow();
      expect(() => playCollisionSound(3)).not.toThrow();
      expect(() => playCollisionSound(4)).not.toThrow();
    });

    it('should_not_crash_for_small_win_multiplier', () => {
      // Arrange - Act - Assert
      expect(() => playCollisionSound(1)).not.toThrow();
      expect(() => playCollisionSound(0.5)).not.toThrow();
      expect(() => playCollisionSound(0)).not.toThrow();
    });
  });

  describe('Edge Cases', () => {
    it('should_handle_negative_multiplier', () => {
      // Arrange - Act - Assert
      expect(() => playCollisionSound(-1)).not.toThrow();
      expect(() => playCollisionSound(-10)).not.toThrow();
    });

    it('should_handle_decimal_multiplier', () => {
      // Arrange - Act - Assert
      expect(() => playCollisionSound(2.5)).not.toThrow();
      expect(() => playCollisionSound(5.7)).not.toThrow();
      expect(() => playCollisionSound(10.1)).not.toThrow();
    });

    it('should_handle_very_large_multiplier', () => {
      // Arrange - Act - Assert
      expect(() => playCollisionSound(1000)).not.toThrow();
      expect(() => playCollisionSound(Number.MAX_VALUE)).not.toThrow();
    });

    it('should_handle_zero_multiplier', () => {
      // Arrange - Act - Assert
      expect(() => playCollisionSound(0)).not.toThrow();
    });
  });

  describe('Error Handling', () => {
    it('should_handle_invalid_multiplier_types', () => {
      // Arrange - Act - Assert
      // TypeScript would catch this at compile time, but for runtime safety
      expect(() => playCollisionSound(NaN)).not.toThrow();
      expect(() => playCollisionSound(Infinity)).not.toThrow();
    });
  });
});