/**
 * Row-Based Scaling Tests
 * Tests that physics factors are properly adjusted when row count changes
 */

import { RowBasedPhysicsScaler, calculateCanvasScalingForRows, getRowScalingRecommendations } from '../src/features/game/components/ball/physics/scaling/row-based-scaling';
import { DEFAULT_PHYSICS_FACTORS } from '../src/features/game/components/ball/physics/factors/core-factors';

describe('Row-Based Scaling', () => {
    describe('RowBasedPhysicsScaler', () => {
        let scaler: RowBasedPhysicsScaler;

        beforeEach(() => {
            scaler = new RowBasedPhysicsScaler(8);
        });

        test('should initialize with base rows', () => {
            expect(scaler.getRowRatio()).toBe(1);
            const factors = scaler.getScaledFactors();
            expect(factors.gravity).toBeCloseTo(DEFAULT_PHYSICS_FACTORS.gravity, 2);
        });

        test('should scale gravity up for more rows', () => {
            scaler.setRows(15);
            const factors = scaler.getScaledFactors();

            // More rows should result in higher gravity for faster falling
            expect(factors.gravity).toBeGreaterThan(DEFAULT_PHYSICS_FACTORS.gravity);
            expect(scaler.getRowRatio()).toBe(15 / 8);
        });

        test('should maintain gravity for near-baseline rows (tier 1)', () => {
            scaler.setRows(5);
            const factors = scaler.getScaledFactors();

            // Near-baseline rows (≤10) should use default gravity (no scaling)
            expect(factors.gravity).toBe(DEFAULT_PHYSICS_FACTORS.gravity);
        });

        test('should maintain or optimize physics factors for rows 8-10 (tier 1)', () => {
            // Test row 8 (baseline)
            scaler.setRows(8);
            const factors8 = scaler.getScaledFactors();

            // Test row 10 (upper tier 1 boundary)
            scaler.setRows(10);
            const factors10 = scaler.getScaledFactors();

            // Tier 1 maintains gravity and friction, but optimizes restitution for less bounce
            expect(factors8.gravity).toBe(DEFAULT_PHYSICS_FACTORS.gravity);
            expect(factors8.restitution).toBe(0.25); // Reduced for less bounce
            expect(factors8.friction).toBe(DEFAULT_PHYSICS_FACTORS.friction);

            expect(factors10.gravity).toBe(DEFAULT_PHYSICS_FACTORS.gravity);
            expect(factors10.restitution).toBe(0.25); // Reduced for less bounce
            expect(factors10.friction).toBe(DEFAULT_PHYSICS_FACTORS.friction);
        });

        test('should apply gentle scaling for rows 11-14 (tier 2)', () => {
            scaler.setRows(12);
            const factors = scaler.getScaledFactors();

            // Tier 2 should apply gentle scaling
            expect(factors.gravity).toBeGreaterThan(DEFAULT_PHYSICS_FACTORS.gravity);
            expect(factors.restitution).toBeLessThan(DEFAULT_PHYSICS_FACTORS.restitution);
            expect(factors.friction).toBeGreaterThan(DEFAULT_PHYSICS_FACTORS.friction);

            // But scaling should be more conservative than before
            const gravityIncrease = factors.gravity / DEFAULT_PHYSICS_FACTORS.gravity;
            expect(gravityIncrease).toBeLessThan(1.05); // Less than 5% increase
        });

        test('should increase ball velocity for higher row counts', () => {
            scaler.setRows(12);
            const factors = scaler.getScaledFactors();

            // Higher row counts should have faster ball movement
            expect(factors.velocityY).toBeGreaterThan(DEFAULT_PHYSICS_FACTORS.velocityY);
        });

        test('should decrease air resistance for higher row counts', () => {
            scaler.setRows(16);
            const factors = scaler.getScaledFactors();

            // More rows should have less air resistance for faster movement
            expect(factors.airResistanceCoefficient).toBeLessThan(DEFAULT_PHYSICS_FACTORS.airResistanceCoefficient);
        });

        test('should provide scaling analysis', () => {
            scaler.setRows(12);
            const analysis = scaler.getRowScalingAnalysis();

            expect(analysis).toHaveProperty('baseRows', 8);
            expect(analysis).toHaveProperty('currentRows', 12);
            expect(analysis).toHaveProperty('rowRatio', 12 / 8);
            expect(analysis).toHaveProperty('scaledFactors');
        });
    });

    describe('Canvas Scaling Calculations', () => {
        test('should calculate appropriate canvas scaling for different row counts', () => {
            const scaling8Rows = calculateCanvasScalingForRows(8);
            const scaling15Rows = calculateCanvasScalingForRows(15);

            // Higher row count should result in smaller scale factor to fit
            expect(scaling15Rows.scaleFactor).toBeLessThan(scaling8Rows.scaleFactor);
        });

        test('should provide valid canvas dimensions', () => {
            const scaling = calculateCanvasScalingForRows(12);

            expect(scaling.adjustedCanvasWidth).toBeGreaterThan(0);
            expect(scaling.adjustedCanvasHeight).toBeGreaterThan(0);
            expect(scaling.scaleFactor).toBeLessThanOrEqual(1);
        });
    });

    describe('Scaling Recommendations', () => {
        test('should provide recommendations for row changes', () => {
            const recommendations = getRowScalingRecommendations(8, 15);

            expect(recommendations.length).toBeGreaterThan(0);
            expect(recommendations[0]).toHaveProperty('factor');
            expect(recommendations[0]).toHaveProperty('adjustment');
            expect(recommendations[0]).toHaveProperty('reason');
        });

        test('should recommend gravity increase for more rows', () => {
            const recommendations = getRowScalingRecommendations(8, 15);

            const gravityRec = recommendations.find(r => r.factor === 'Gravity');
            expect(gravityRec).toBeDefined();
            expect(gravityRec?.adjustment).toContain('Increased');
        });
    });

    describe('Integration Test', () => {
        test('should handle row changes from 8 to 15 correctly', () => {
            const scaler = new RowBasedPhysicsScaler(8);

            // Start with 8 rows
            const factors8Rows = scaler.getScaledFactors();

            // Change to 15 rows
            scaler.setRows(15);
            const factors15Rows = scaler.getScaledFactors();

            // Verify that key factors are adjusted appropriately for faster gameplay
            expect(factors15Rows.gravity).toBeGreaterThan(factors8Rows.gravity);
            expect(factors15Rows.velocityY).toBeGreaterThan(factors8Rows.velocityY);
            expect(factors15Rows.airResistanceCoefficient).toBeLessThan(factors8Rows.airResistanceCoefficient);
            expect(factors15Rows.collisionCooldown).toBeGreaterThan(factors8Rows.collisionCooldown);
        });
    });
});
