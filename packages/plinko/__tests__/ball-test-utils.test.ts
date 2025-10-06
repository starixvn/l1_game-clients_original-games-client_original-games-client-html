import {
    generateTestSpawnDetails,
    executeTestBallSpawn,
    performDirectSpawnTest,
    TestSpawnConfig,
    USER_SPECIFIED_COLLISION_PATH
} from '../src/features/game/components/ball/ball-test-utils';

// Mock calculateBallSize
jest.mock('../src/lib/physics/ball-calculations', () => ({
    calculateBallSize: jest.fn((rows: number) => Math.max(4, Math.min(8, 6 - rows * 0.2)))
}));

describe('Ball Test Utils', () => {
    const mockTestConfig: TestSpawnConfig = {
        rows: 10,
        multipliers: [0.5, 1, 1.2, 1.5, 2, 3, 5, 10, 20],
        payoutProbabilities: [0.1, 0.2, 0.3, 0.2, 0.1, 0.05, 0.03, 0.01, 0.01],
        betAmount: 100
    };

    describe('generateTestSpawnDetails', () => {
        it('should generate correct test spawn details', () => {
            const details = generateTestSpawnDetails(mockTestConfig);

            expect(details).toHaveProperty('ballRadius');
            expect(details).toHaveProperty('ballDiameter');
            expect(details).toHaveProperty('testPath');
            expect(details).toHaveProperty('pathLength');
            expect(details).toHaveProperty('finalSlot');
            expect(details).toHaveProperty('expectedMultiplier');
            expect(details).toHaveProperty('betValue');
            expect(details).toHaveProperty('expectedCollisions');
            expect(details).toHaveProperty('expectedPath');
            expect(details).toHaveProperty('pathDescription');
        });

        it('should use user-specified collision path', () => {
            const details = generateTestSpawnDetails(mockTestConfig);

            expect(details.testPath).toEqual(USER_SPECIFIED_COLLISION_PATH);
            expect(details.pathLength).toBe(USER_SPECIFIED_COLLISION_PATH.length);
            expect(details.expectedPath).toBe(USER_SPECIFIED_COLLISION_PATH.join(''));
        });

        it('should calculate ball diameter correctly', () => {
            const details = generateTestSpawnDetails(mockTestConfig);

            expect(details.ballDiameter).toBe(details.ballRadius * 2);
        });

        it('should set correct final slot and multiplier', () => {
            const details = generateTestSpawnDetails(mockTestConfig);

            expect(details.finalSlot).toBe(4);
            expect(details.expectedMultiplier).toBe(2);
            expect(details.betValue).toBe(mockTestConfig.betAmount);
        });

        it('should calculate expected collisions correctly', () => {
            const details = generateTestSpawnDetails(mockTestConfig);

            expect(details.expectedCollisions).toBe(USER_SPECIFIED_COLLISION_PATH.length);
        });

        it('should generate descriptive path description', () => {
            const details = generateTestSpawnDetails(mockTestConfig);

            expect(details.pathDescription).toContain('User-specified collision pattern');
            expect(details.pathDescription).toContain(USER_SPECIFIED_COLLISION_PATH.join('-'));
        });
    });

    describe('executeTestBallSpawn', () => {
        let mockBallLayoutRef: any;

        beforeEach(() => {
            mockBallLayoutRef = {
                spawnBallWithPath: jest.fn()
            };
        });

        it('should execute spawn successfully with valid ref', () => {
            const result = executeTestBallSpawn(mockBallLayoutRef, mockTestConfig);

            expect(result).toBe(true);
            expect(mockBallLayoutRef.spawnBallWithPath).toHaveBeenCalledWith(
                100, // betValue
                USER_SPECIFIED_COLLISION_PATH,
                4, // finalSlot
                2 // expectedMultiplier
            );
        });

        it('should return false with null ref', () => {
            const result = executeTestBallSpawn(null, mockTestConfig);

            expect(result).toBe(false);
        });

        it('should return false with ref missing spawnBallWithPath', () => {
            const invalidRef = {};
            const result = executeTestBallSpawn(invalidRef, mockTestConfig);

            expect(result).toBe(false);
        });

        it('should handle spawn errors gracefully', () => {
            mockBallLayoutRef.spawnBallWithPath.mockImplementation(() => {
                throw new Error('Spawn failed');
            });

            const result = executeTestBallSpawn(mockBallLayoutRef, mockTestConfig);

            expect(result).toBe(false);
        });
    });

    describe('performDirectSpawnTest', () => {
        let mockBallLayoutRef: any;

        beforeEach(() => {
            mockBallLayoutRef = {
                spawnBallWithPath: jest.fn()
            };
        });

        it('should perform test successfully with valid ref', () => {
            const result = performDirectSpawnTest(mockBallLayoutRef, mockTestConfig);

            expect(result).toBe(true);
            expect(mockBallLayoutRef.spawnBallWithPath).toHaveBeenCalled();
        });

        it('should return false with null ref', () => {
            const result = performDirectSpawnTest(null, mockTestConfig);

            expect(result).toBe(false);
        });

        it('should return false with ref missing spawnBallWithPath', () => {
            const invalidRef = {};
            const result = performDirectSpawnTest(invalidRef, mockTestConfig);

            expect(result).toBe(false);
        });

        it('should handle spawn errors gracefully', () => {
            mockBallLayoutRef.spawnBallWithPath.mockImplementation(() => {
                throw new Error('Spawn failed');
            });

            const result = performDirectSpawnTest(mockBallLayoutRef, mockTestConfig);

            expect(result).toBe(false);
        });
    });

    describe('USER_SPECIFIED_COLLISION_PATH', () => {
        it('should be a valid collision path', () => {
            expect(USER_SPECIFIED_COLLISION_PATH).toBeDefined();
            expect(Array.isArray(USER_SPECIFIED_COLLISION_PATH)).toBe(true);
            expect(USER_SPECIFIED_COLLISION_PATH.length).toBeGreaterThan(0);
        });

        it('should contain only 0s and 1s', () => {
            USER_SPECIFIED_COLLISION_PATH.forEach(value => {
                expect([0, 1]).toContain(value);
            });
        });

        it('should have correct length for 9 rows', () => {
            // The path should have 9 elements for 9 rows of pins
            expect(USER_SPECIFIED_COLLISION_PATH).toHaveLength(9);
        });
    });

    describe('TestSpawnConfig interface', () => {
        it('should accept valid configuration', () => {
            const config: TestSpawnConfig = {
                rows: 5,
                multipliers: [1, 2, 3],
                payoutProbabilities: [0.3, 0.4, 0.3],
                betAmount: 50
            };

            expect(config.rows).toBe(5);
            expect(config.multipliers).toHaveLength(3);
            expect(config.payoutProbabilities).toHaveLength(3);
            expect(config.betAmount).toBe(50);
        });

        it('should work with different row counts', () => {
            const configs = [
                { ...mockTestConfig, rows: 5 },
                { ...mockTestConfig, rows: 10 },
                { ...mockTestConfig, rows: 15 }
            ];

            configs.forEach(config => {
                const details = generateTestSpawnDetails(config);
                expect(details).toBeDefined();
                expect(details.betValue).toBe(config.betAmount);
            });
        });

        it('should work with different multiplier arrays', () => {
            const configs = [
                { ...mockTestConfig, multipliers: [1, 2] },
                { ...mockTestConfig, multipliers: [0.5, 1, 1.5, 2, 3] },
                { ...mockTestConfig, multipliers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] }
            ];

            configs.forEach(config => {
                const details = generateTestSpawnDetails(config);
                expect(details).toBeDefined();
            });
        });
    });
});
