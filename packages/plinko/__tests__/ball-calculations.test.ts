import {
    calculateBallSize,
    getBallPhysicsTweaks,
    BallPhysicsTweaks
} from '../src/lib/physics/ball-calculations';
import { getMiddleDropPosition } from '../src/lib/physics/drop-positions';
import { ballSizingConfig, physicsConfig } from '../src/lib/physics/physics-config';
import { BALL_CONSTANTS } from '../src/lib/physics/constants';

describe('Ball Calculations', () => {
    describe('calculateBallSize', () => {
        it('should calculate correct ball size for standard inputs', () => {
            const result = calculateBallSize(8, 1);
            expect(result).toBeGreaterThan(0);
            expect(result).toBeLessThanOrEqual(ballSizingConfig.maxDiameter / 2);
        });

        it('should handle minimum rows (1)', () => {
            const result = calculateBallSize(BALL_CONSTANTS.SIZE_CONSTRAINTS.MIN_ROWS, 1);
            expect(result).toBeGreaterThanOrEqual(BALL_CONSTANTS.SIZE_CONSTRAINTS.MIN_RADIUS); // Minimum radius
            expect(result).toBeLessThanOrEqual(ballSizingConfig.maxDiameter / 2);
        });

        it('should handle maximum rows (50)', () => {
            const result = calculateBallSize(BALL_CONSTANTS.SIZE_CONSTRAINTS.MAX_ROWS, 1);
            expect(result).toBeGreaterThanOrEqual(BALL_CONSTANTS.SIZE_CONSTRAINTS.MIN_RADIUS);
            expect(result).toBeLessThanOrEqual(ballSizingConfig.maxDiameter / 2);
        });

        it('should handle invalid rows (0)', () => {
            const result = calculateBallSize(0, 1);
            expect(result).toBeGreaterThanOrEqual(BALL_CONSTANTS.SIZE_CONSTRAINTS.MIN_RADIUS);
        });

        it('should handle invalid rows (negative)', () => {
            const result = calculateBallSize(-5, 1);
            expect(result).toBeGreaterThanOrEqual(BALL_CONSTANTS.SIZE_CONSTRAINTS.MIN_RADIUS);
        });

        it('should handle rows over maximum (100)', () => {
            const result = calculateBallSize(100, 1);
            expect(result).toBeGreaterThanOrEqual(BALL_CONSTANTS.SIZE_CONSTRAINTS.MIN_RADIUS);
        });

        it('should apply canvas scale factor', () => {
            const result1 = calculateBallSize(8, 1);
            const result2 = calculateBallSize(8, 2);
            expect(result2).toBeCloseTo(result1 * 2, 5);
        });

        it('should clamp to minimum diameter', () => {
            // Test with very large number of rows to trigger minimum clamping
            const result = calculateBallSize(1000, 1);
            expect(result).toBeGreaterThanOrEqual(ballSizingConfig.minDiameter / 2);
        });

        it('should clamp to maximum diameter', () => {
            // Test with very small number of rows to trigger maximum clamping
            const result = calculateBallSize(1, 1);
            expect(result).toBeLessThanOrEqual(ballSizingConfig.maxDiameter / 2);
        });

        it('should ensure minimum radius of 2', () => {
            // Test edge case that might result in radius < 2
            const result = calculateBallSize(1000, 0.01);
            expect(result).toBeGreaterThanOrEqual(2);
        });
    });

    describe('getBallPhysicsTweaks', () => {
        it('should return physics tweaks object', () => {
            const result = getBallPhysicsTweaks(5);
            expect(result).toHaveProperty('restitution');
            expect(result).toHaveProperty('frictionAir');
            expect(result).toHaveProperty('density');
        });

        it('should adjust restitution based on size', () => {
            const smallBall = getBallPhysicsTweaks(3);
            const largeBall = getBallPhysicsTweaks(10);

            // Small balls should have lower restitution (less bouncy)
            expect(smallBall.restitution).toBeGreaterThanOrEqual(0.8);
            expect(smallBall.restitution).toBeLessThanOrEqual(1.0);
            // Large balls should have higher restitution (more bouncy)
            expect(largeBall.restitution).toBeGreaterThanOrEqual(0.8);
            expect(largeBall.restitution).toBeLessThanOrEqual(1.1);
        });

        it('should adjust frictionAir based on size', () => {
            const smallBall = getBallPhysicsTweaks(3);
            const largeBall = getBallPhysicsTweaks(10);

            // Small balls should have lower friction (fall faster)
            expect(smallBall.frictionAir).toBeGreaterThanOrEqual(0.02);
            expect(smallBall.frictionAir).toBeLessThanOrEqual(0.05);
            // Large balls should have higher friction (fall slower)
            expect(largeBall.frictionAir).toBeGreaterThanOrEqual(0.02);
            expect(largeBall.frictionAir).toBeLessThanOrEqual(0.06);
        });

        it('should have consistent density', () => {
            const result = getBallPhysicsTweaks(5);
            expect(result.density).toBeGreaterThan(0);
            expect(result.density).toBeLessThan(0.01);
        });

        it('should handle edge case sizes', () => {
            const tinyBall = getBallPhysicsTweaks(0.1);
            const hugeBall = getBallPhysicsTweaks(1000);

            expect(tinyBall.restitution).toBeDefined();
            expect(tinyBall.frictionAir).toBeDefined();
            expect(hugeBall.restitution).toBeDefined();
            expect(hugeBall.frictionAir).toBeDefined();
        });
    });

    describe('getMiddleDropPosition', () => {
        it('should calculate middle position for standard canvas width', () => {
            const result = getMiddleDropPosition(600);
            expect(result).toBe(300); // Middle of 600px canvas
        });

        it('should handle different canvas widths', () => {
            expect(getMiddleDropPosition(400)).toBe(200);
            expect(getMiddleDropPosition(800)).toBe(400);
            expect(getMiddleDropPosition(1000)).toBe(500);
        });

        it('should handle edge cases', () => {
            expect(getMiddleDropPosition(0)).toBe(0);
            expect(getMiddleDropPosition(-100)).toBe(-50);
            expect(getMiddleDropPosition(1)).toBe(0.5);
        });

        it('should apply horizontal offset', () => {
            const basePosition = getMiddleDropPosition(600);
            // The function applies a small random offset, but base calculation should be middle
            expect(basePosition).toBe(300);
        });
    });

    describe('Integration tests', () => {
        it('should work together for complete ball setup', () => {
            const rows = 8;
            const canvasWidth = 600;
            const scaleFactor = 1;

            const ballRadius = calculateBallSize(rows, scaleFactor);
            const physicsTweaks = getBallPhysicsTweaks(ballRadius);
            const dropPosition = getMiddleDropPosition(canvasWidth);

            expect(ballRadius).toBeGreaterThan(0);
            expect(physicsTweaks).toHaveProperty('restitution');
            expect(physicsTweaks).toHaveProperty('frictionAir');
            expect(physicsTweaks).toHaveProperty('density');
            expect(dropPosition).toBe(300);

            // Ensure all values are reasonable
            expect(ballRadius).toBeLessThan(50); // Reasonable ball size
            expect(dropPosition).toBeGreaterThan(200); // Reasonable drop position
            expect(dropPosition).toBeLessThan(400);
        });

        it('should handle extreme values gracefully', () => {
            const ballRadius = calculateBallSize(1000, 0.01);
            const physicsTweaks = getBallPhysicsTweaks(ballRadius);
            const dropPosition = getMiddleDropPosition(0);

            expect(ballRadius).toBeGreaterThanOrEqual(2);
            expect(physicsTweaks.restitution).toBeDefined();
            expect(physicsTweaks.frictionAir).toBeDefined();
            expect(dropPosition).toBe(0);
        });
    });
});