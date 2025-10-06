import { calculateBallSize, getBallPhysicsTweaks } from '../src/lib/physics/ball-calculations';

describe('Ball Calculations', () => {
    describe('calculateBallSize', () => {
        it('should return appropriate ball size for different row counts', () => {
            // Test various row counts
            expect(calculateBallSize(5, 1)).toBeGreaterThan(0);
            expect(calculateBallSize(10, 1)).toBeGreaterThan(0);
            expect(calculateBallSize(15, 1)).toBeGreaterThan(0);
        });

        it('should scale ball size based on canvas scale factor', () => {
            const rows = 10;
            const scale1 = calculateBallSize(rows, 1);
            const scale2 = calculateBallSize(rows, 2);

            expect(scale2).toBeGreaterThan(scale1);
        });

        it('should return consistent results for same inputs', () => {
            const rows = 8;
            const scaleFactor = 1.5;

            const result1 = calculateBallSize(rows, scaleFactor);
            const result2 = calculateBallSize(rows, scaleFactor);

            expect(result1).toBe(result2);
        });

        it('should handle edge cases', () => {
            expect(() => calculateBallSize(0, 1)).not.toThrow();
            expect(() => calculateBallSize(1, 0)).not.toThrow();
            expect(() => calculateBallSize(-1, 1)).not.toThrow();
        });
    });

    describe('getBallPhysicsTweaks', () => {
        it('should return physics tweaks for different ball sizes', () => {
            const smallBall = getBallPhysicsTweaks(3);
            const largeBall = getBallPhysicsTweaks(8);

            expect(smallBall).toHaveProperty('restitution');
            // Note: friction property was removed, only frictionAir exists
            expect(smallBall).toHaveProperty('frictionAir');
            expect(smallBall).toHaveProperty('density');

            expect(largeBall).toHaveProperty('restitution');
            // Note: friction property was removed, only frictionAir exists
            expect(largeBall).toHaveProperty('frictionAir');
            expect(largeBall).toHaveProperty('density');
        });

        it('should return consistent tweaks for same ball size', () => {
            const radius = 5;
            const tweaks1 = getBallPhysicsTweaks(radius);
            const tweaks2 = getBallPhysicsTweaks(radius);

            expect(tweaks1).toEqual(tweaks2);
        });

        it('should handle edge cases', () => {
            expect(() => getBallPhysicsTweaks(0)).not.toThrow();
            expect(() => getBallPhysicsTweaks(-1)).not.toThrow();
            expect(() => getBallPhysicsTweaks(100)).not.toThrow();
        });

        it('should return valid physics values', () => {
            const tweaks = getBallPhysicsTweaks(5);

            expect(tweaks.restitution).toBeGreaterThanOrEqual(0);
            expect(tweaks.restitution).toBeLessThanOrEqual(1);
            expect(tweaks.frictionAir).toBeGreaterThanOrEqual(0);
            expect(tweaks.density).toBeGreaterThan(0);
        });
    });
});
