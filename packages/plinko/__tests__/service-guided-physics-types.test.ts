import { BallBodyExtension } from '../src/types/physics';

describe('Service-Guided Physics Types - TDD Tests', () => {
    describe('BallBodyExtension Interface', () => {
        it('should define required properties for service-guided balls', () => {
            // Arrange & Act
            const ballExtension: BallBodyExtension = {
                isServiceGuided: true,
                expectedFinalSlot: 3,
                multiplier: 0.5,
                betValue: 100,
                hasTriggeredWin: false,
                servicePath: [1, 0, 0, 0, 1, 0, 0, 1],
                currentPathIndex: 0,
                isRemoved: false,
                createdAt: Date.now(),
                wrongSlotHits: 0,
                pinCollisions: [],
                pathPositions: [
                    { x: 300, y: 50, type: 'spawn' },
                    { x: 310, y: 100, type: 'collision', pathIndex: 0, direction: 1 }
                ]
            };

            // Assert
            expect(ballExtension.isServiceGuided).toBe(true);
            expect(ballExtension.expectedFinalSlot).toBe(3);
            expect(ballExtension.multiplier).toBe(0.5);
            expect(ballExtension.betValue).toBe(100);
            expect(ballExtension.servicePath).toEqual([1, 0, 0, 0, 1, 0, 0, 1]);
            expect(ballExtension.currentPathIndex).toBe(0);
            expect(ballExtension.pathPositions).toHaveLength(2);
        });

        it('should support optional properties', () => {
            // Arrange & Act
            const minimalBallExtension: BallBodyExtension = {
                isServiceGuided: true
            };

            // Assert
            expect(minimalBallExtension.isServiceGuided).toBe(true);
            expect(minimalBallExtension.expectedFinalSlot).toBeUndefined();
            expect(minimalBallExtension.servicePath).toBeUndefined();
            expect(minimalBallExtension.pathPositions).toBeUndefined();
        });

        it('should support path position tracking with all properties', () => {
            // Arrange & Act
            const pathPosition = {
                x: 300,
                y: 100,
                type: 'collision',
                pegRow: 1,
                pegCol: 2,
                pathIndex: 0,
                direction: 1
            };

            const ballExtension: BallBodyExtension = {
                isServiceGuided: true,
                pathPositions: [pathPosition]
            };

            // Assert
            expect(ballExtension.pathPositions?.[0]).toEqual(pathPosition);
            expect(ballExtension.pathPositions?.[0].x).toBe(300);
            expect(ballExtension.pathPositions?.[0].y).toBe(100);
            expect(ballExtension.pathPositions?.[0].type).toBe('collision');
            expect(ballExtension.pathPositions?.[0].pegRow).toBe(1);
            expect(ballExtension.pathPositions?.[0].pegCol).toBe(2);
            expect(ballExtension.pathPositions?.[0].pathIndex).toBe(0);
            expect(ballExtension.pathPositions?.[0].direction).toBe(1);
        });
    });

    describe('Service Path Validation', () => {
        it('should support valid service path arrays', () => {
            // Arrange & Act
            const validPaths = [
                [0, 0, 0, 0, 0, 0, 0, 0], // All left
                [1, 1, 1, 1, 1, 1, 1, 1], // All right
                [1, 0, 0, 0, 1, 0, 0, 1], // Mixed
                [0, 1, 0, 1, 0, 1, 0, 1], // Alternating
                [1, 0, 1, 0, 1, 0, 1, 0]  // Alternating reverse
            ];

            validPaths.forEach((path, index) => {
                const ballExtension: BallBodyExtension = {
                    isServiceGuided: true,
                    servicePath: path
                };

                // Assert
                expect(ballExtension.servicePath).toEqual(path);
                expect(ballExtension.servicePath?.length).toBe(8);
            });
        });

        it('should support different path lengths', () => {
            // Arrange & Act
            const differentLengthPaths = [
                [0, 0, 0, 0], // 4 rows
                [1, 0, 1, 0, 1, 0, 1, 0], // 8 rows
                [1, 0, 1, 0, 1, 0, 1, 0, 1, 0] // 10 rows
            ];

            differentLengthPaths.forEach((path) => {
                const ballExtension: BallBodyExtension = {
                    isServiceGuided: true,
                    servicePath: path
                };

                // Assert
                expect(ballExtension.servicePath).toEqual(path);
                expect(ballExtension.servicePath?.length).toBe(path.length);
            });
        });
    });

    describe('Path Position Types', () => {
        it('should support spawn position type', () => {
            // Arrange & Act
            const spawnPosition = {
                x: 300,
                y: 50,
                type: 'spawn' as const
            };

            const ballExtension: BallBodyExtension = {
                isServiceGuided: true,
                pathPositions: [spawnPosition]
            };

            // Assert
            expect(ballExtension.pathPositions?.[0].type).toBe('spawn');
        });

        it('should support collision position type', () => {
            // Arrange & Act
            const collisionPosition = {
                x: 310,
                y: 100,
                type: 'collision' as const,
                pegRow: 1,
                pegCol: 2,
                pathIndex: 0,
                direction: 1
            };

            const ballExtension: BallBodyExtension = {
                isServiceGuided: true,
                pathPositions: [collisionPosition]
            };

            // Assert
            expect(ballExtension.pathPositions?.[0].type).toBe('collision');
            expect(ballExtension.pathPositions?.[0].pegRow).toBe(1);
            expect(ballExtension.pathPositions?.[0].pegCol).toBe(2);
            expect(ballExtension.pathPositions?.[0].pathIndex).toBe(0);
            expect(ballExtension.pathPositions?.[0].direction).toBe(1);
        });

        it('should support movement position type', () => {
            // Arrange & Act
            const movementPosition = {
                x: 320,
                y: 150,
                type: 'movement' as const
            };

            const ballExtension: BallBodyExtension = {
                isServiceGuided: true,
                pathPositions: [movementPosition]
            };

            // Assert
            expect(ballExtension.pathPositions?.[0].type).toBe('movement');
        });
    });

    describe('Collision Tracking', () => {
        it('should support pin collision tracking', () => {
            // Arrange & Act
            const ballExtension: BallBodyExtension = {
                isServiceGuided: true,
                pinCollisions: ['step-0', 'step-1', 'step-2']
            };

            // Assert
            expect(ballExtension.pinCollisions).toEqual(['step-0', 'step-1', 'step-2']);
            expect(ballExtension.pinCollisions?.length).toBe(3);
        });

        it('should support wrong slot hit tracking', () => {
            // Arrange & Act
            const ballExtension: BallBodyExtension = {
                isServiceGuided: true,
                wrongSlotHits: 2
            };

            // Assert
            expect(ballExtension.wrongSlotHits).toBe(2);
        });
    });

    describe('Ball State Management', () => {
        it('should support ball removal state', () => {
            // Arrange & Act
            const ballExtension: BallBodyExtension = {
                isServiceGuided: true,
                isRemoved: true
            };

            // Assert
            expect(ballExtension.isRemoved).toBe(true);
        });

        it('should support win trigger state', () => {
            // Arrange & Act
            const ballExtension: BallBodyExtension = {
                isServiceGuided: true,
                hasTriggeredWin: true
            };

            // Assert
            expect(ballExtension.hasTriggeredWin).toBe(true);
        });

        it('should support creation timestamp', () => {
            // Arrange & Act
            const timestamp = Date.now();
            const ballExtension: BallBodyExtension = {
                isServiceGuided: true,
                createdAt: timestamp
            };

            // Assert
            expect(ballExtension.createdAt).toBe(timestamp);
            expect(typeof ballExtension.createdAt).toBe('number');
        });
    });

    describe('Type Safety', () => {
        it('should enforce correct direction values', () => {
            // Arrange & Act
            const validDirections = [0, 1]; // 0 = left, 1 = right

            validDirections.forEach((direction) => {
                const pathPosition = {
                    x: 300,
                    y: 100,
                    type: 'collision' as const,
                    pathIndex: 0,
                    direction
                };

                const ballExtension: BallBodyExtension = {
                    isServiceGuided: true,
                    pathPositions: [pathPosition]
                };

                // Assert
                expect(ballExtension.pathPositions?.[0].direction).toBe(direction);
            });
        });

        it('should enforce correct path index values', () => {
            // Arrange & Act
            const validPathIndices = [0, 1, 2, 3, 4, 5, 6, 7]; // 0-based indexing

            validPathIndices.forEach((pathIndex) => {
                const pathPosition = {
                    x: 300,
                    y: 100,
                    type: 'collision' as const,
                    pathIndex,
                    direction: 1
                };

                const ballExtension: BallBodyExtension = {
                    isServiceGuided: true,
                    pathPositions: [pathPosition]
                };

                // Assert
                expect(ballExtension.pathPositions?.[0].pathIndex).toBe(pathIndex);
            });
        });

        it('should enforce correct slot index values', () => {
            // Arrange & Act
            const validSlotIndices = [0, 1, 2, 3, 4, 5, 6, 7, 8]; // 0-based slot indexing

            validSlotIndices.forEach((slotIndex) => {
                const ballExtension: BallBodyExtension = {
                    isServiceGuided: true,
                    expectedFinalSlot: slotIndex
                };

                // Assert
                expect(ballExtension.expectedFinalSlot).toBe(slotIndex);
            });
        });
    });

    describe('Integration Scenarios', () => {
        it('should support complete ball lifecycle', () => {
            // Arrange & Act - Ball creation
            const ballExtension: BallBodyExtension = {
                isServiceGuided: true,
                servicePath: [1, 0, 0, 0, 1, 0, 0, 1],
                currentPathIndex: 0,
                expectedFinalSlot: 3,
                multiplier: 0.5,
                betValue: 100,
                createdAt: Date.now(),
                pathPositions: [{ x: 300, y: 50, type: 'spawn' }],
                pinCollisions: []
            };

            // Simulate path execution
            ballExtension.currentPathIndex = 1;
            ballExtension.pinCollisions = ['step-0'];
            ballExtension.pathPositions?.push({
                x: 310,
                y: 100,
                type: 'collision',
                pegRow: 1,
                pegCol: 1,
                pathIndex: 0,
                direction: 1
            });

            // Simulate completion
            ballExtension.currentPathIndex = 8;
            ballExtension.isRemoved = true;
            ballExtension.hasTriggeredWin = true;

            // Assert
            expect(ballExtension.currentPathIndex).toBe(8);
            expect(ballExtension.pinCollisions).toContain('step-0');
            expect(ballExtension.pathPositions).toHaveLength(2);
            expect(ballExtension.isRemoved).toBe(true);
            expect(ballExtension.hasTriggeredWin).toBe(true);
        });

        it('should support error recovery scenarios', () => {
            // Arrange & Act - Ball with wrong slot hits
            const ballExtension: BallBodyExtension = {
                isServiceGuided: true,
                servicePath: [1, 0, 0, 0, 1, 0, 0, 1],
                expectedFinalSlot: 3,
                wrongSlotHits: 2,
                isRemoved: false
            };

            // Simulate third wrong hit
            ballExtension.wrongSlotHits = 3;
            ballExtension.isRemoved = true;

            // Assert
            expect(ballExtension.wrongSlotHits).toBe(3);
            expect(ballExtension.isRemoved).toBe(true);
        });
    });
});
