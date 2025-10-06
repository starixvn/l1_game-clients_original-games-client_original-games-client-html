import { diagnosticTool } from '../src/utils/diagnosticTool';
import { enableLogging } from '../src/utils/enableLogging';

// Mock logger
jest.mock('../src/services/logger', () => ({
    logger: {
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
        debug: jest.fn(),
        start: jest.fn(),
        expand: jest.fn(),
        getStatus: jest.fn(() => ({ enabled: true, collapsed: false, logCount: 0 })),
        getLogs: jest.fn(() => 'mock logs'),
        downloadLogs: jest.fn(),
        clear: jest.fn()
    }
}));

// Mock window for global access
const mockWindow = {
    plinkoLogger: undefined,
    plinkoDiagnostic: undefined,
    plinkoComponentRef: undefined,
    enablePlinkoLogging: undefined
};

Object.defineProperty(global, 'window', {
    value: mockWindow,
    writable: true
});

// Mock console for diagnostic tool tests
const originalConsole = global.console;
beforeEach(() => {
    global.console = {
        ...originalConsole,
        log: jest.fn(),
        error: jest.fn(),
        warn: jest.fn()
    };
});

afterEach(() => {
    global.console = originalConsole;
    jest.clearAllMocks();
});

describe('Utility Functions Tests', () => {
    describe('diagnosticTool', () => {
        describe('checkComponentRef', () => {
            it('should check valid component ref', () => {
                const mockRef = {
                    current: {
                        spawnBall: jest.fn(),
                        spawnBallWithPath: jest.fn(),
                        isReady: jest.fn(() => true)
                    }
                };

                const result = diagnosticTool.checkComponentRef(mockRef);

                expect(result.refExists).toBe(true);
                expect(result.refCurrent).toBe(true);
                expect(result.hasSpawnBall).toBe(true);
                expect(result.hasSpawnBallWithPath).toBe(true);
                expect(result.hasIsReady).toBe(true);
                expect(result.isReady).toBe(true);

                expect(console.log).toHaveBeenCalledWith('🔍 [DIAGNOSTIC] Component ref check:', result);
            });

            it('should handle null ref', () => {
                const result = diagnosticTool.checkComponentRef(null);

                expect(result.refExists).toBe(false);
                expect(result.refCurrent).toBe(false);
                expect(result.hasSpawnBall).toBe(false);
                expect(result.hasSpawnBallWithPath).toBe(false);
                expect(result.hasIsReady).toBe(false);
                expect(result.isReady).toBeUndefined();

                expect(console.log).toHaveBeenCalledWith('🔍 [DIAGNOSTIC] Component ref check:', result);
            });

            it('should handle ref with null current', () => {
                const mockRef = { current: null };
                const result = diagnosticTool.checkComponentRef(mockRef);

                expect(result.refExists).toBe(true);
                expect(result.refCurrent).toBe(false);
                expect(result.hasSpawnBall).toBe(false);
                expect(result.hasSpawnBallWithPath).toBe(false);
                expect(result.hasIsReady).toBe(false);

                expect(console.log).toHaveBeenCalledWith('🔍 [DIAGNOSTIC] Component ref check:', result);
            });

            it('should handle incomplete component methods', () => {
                const mockRef = {
                    current: {
                        spawnBall: jest.fn(),
                        // Missing other methods
                    }
                };

                const result = diagnosticTool.checkComponentRef(mockRef);

                expect(result.hasSpawnBall).toBe(true);
                expect(result.hasSpawnBallWithPath).toBe(false);
                expect(result.hasIsReady).toBe(false);

                expect(console.log).toHaveBeenCalledWith('🔍 [DIAGNOSTIC] Component ref check:', result);
            });
        });

        describe('testBallSpawning', () => {
            it('should spawn ball successfully', () => {
                const mockComponent = {
                    spawnBall: jest.fn(),
                    isReady: jest.fn(() => true)
                };

                const mockRef = { current: mockComponent };
                const result = diagnosticTool.testBallSpawning(mockRef);

                expect(result).toBe(true);
                expect(mockComponent.spawnBall).toHaveBeenCalledWith(100);
                expect(console.log).toHaveBeenCalledWith('🧪 [DIAGNOSTIC] Testing ball spawning...');
                expect(console.log).toHaveBeenCalledWith('🎯 [DIAGNOSTIC] Attempting to spawn ball...');
                expect(console.log).toHaveBeenCalledWith('✅ [DIAGNOSTIC] Ball spawn command sent successfully');
            });

            it('should handle component not ready', () => {
                const mockComponent = {
                    spawnBall: jest.fn(),
                    isReady: jest.fn(() => false)
                };

                const mockRef = { current: mockComponent };
                const result = diagnosticTool.testBallSpawning(mockRef);

                expect(result).toBe(false);
                expect(mockComponent.spawnBall).not.toHaveBeenCalled();
                expect(console.error).toHaveBeenCalledWith('❌ [DIAGNOSTIC] Component is not ready');
            });

            it('should handle null ref', () => {
                const result = diagnosticTool.testBallSpawning(null);

                expect(result).toBe(false);
                expect(console.error).toHaveBeenCalledWith('❌ [DIAGNOSTIC] Component ref is null or undefined');
            });

            it('should handle spawn ball error', () => {
                const mockComponent = {
                    spawnBall: jest.fn(() => { throw new Error('Spawn failed'); }),
                    isReady: jest.fn(() => true)
                };

                const mockRef = { current: mockComponent };
                const result = diagnosticTool.testBallSpawning(mockRef);

                expect(result).toBe(false);
                expect(console.error).toHaveBeenCalledWith('❌ [DIAGNOSTIC] Error spawning ball:', expect.any(Error));
            });
        });

        describe('checkGameState', () => {
            beforeEach(() => {
                // Mock document methods
                Object.defineProperty(document, 'querySelector', {
                    value: jest.fn(),
                    writable: true
                });
            });

            it('should check game state in browser environment', () => {
                const mockPlayButton = { textContent: 'Play', _events: {} };
                const mockBetButton = { textContent: 'Bet', _events: {} };
                const mockSpinButton = { textContent: 'Spin', _events: {} };

                (document.querySelector as jest.Mock)
                    .mockReturnValueOnce(mockPlayButton)
                    .mockReturnValueOnce(mockBetButton)
                    .mockReturnValueOnce(mockSpinButton);

                const result = diagnosticTool.checkGameState();

                expect(result.isBrowser).toBe(true);
                expect(result.playButton).toBe(true);
                expect(result.betButton).toBe(true);
                expect(result.spinButton).toBe(true);

                expect(console.log).toHaveBeenCalledWith('🎮 [DIAGNOSTIC] Checking game state...');
                expect(console.log).toHaveBeenCalledWith('🌐 [DIAGNOSTIC] Environment:', { isBrowser: true });
                expect(console.log).toHaveBeenCalledWith('🎮 [DIAGNOSTIC] Game UI elements:', expect.objectContaining({
                    playButton: true,
                    betButton: true,
                    spinButton: true
                }));
            });

            it('should handle non-browser environment', () => {
                // Mock typeof window to return undefined
                const originalWindow = global.window;
                delete (global as any).window;

                const result = diagnosticTool.checkGameState();

                expect(result.isBrowser).toBe(false);
                expect(result.playButton).toBe(false);
                expect(result.betButton).toBe(false);
                expect(result.spinButton).toBe(false);

                expect(console.log).toHaveBeenCalledWith('🎮 [DIAGNOSTIC] Checking game state...');
                expect(console.log).toHaveBeenCalledWith('🌐 [DIAGNOSTIC] Environment:', { isBrowser: false });

                // Restore window
                (global as any).window = originalWindow;
            });

            it('should handle missing UI elements', () => {
                (document.querySelector as jest.Mock).mockReturnValue(null);

                const result = diagnosticTool.checkGameState();

                expect(result.playButton).toBe(false);
                expect(result.betButton).toBe(false);
                expect(result.spinButton).toBe(false);
            });
        });

        describe('runFullDiagnostic', () => {
            it('should run full diagnostic successfully', () => {
                const mockRef = {
                    current: {
                        spawnBall: jest.fn(),
                        spawnBallWithPath: jest.fn(),
                        isReady: jest.fn(() => true)
                    }
                };

                // Mock document.querySelector for game state check
                Object.defineProperty(document, 'querySelector', {
                    value: jest.fn(() => null),
                    writable: true
                });

                const result = diagnosticTool.runFullDiagnostic(mockRef);

                expect(result).toHaveProperty('refCheck');
                expect(result).toHaveProperty('gameState');
                expect(result).toHaveProperty('spawnTest');
                expect(result).toHaveProperty('timestamp');

                expect(console.log).toHaveBeenCalledWith('🔍 [DIAGNOSTIC] Running full diagnostic...');
                expect(console.log).toHaveBeenCalledWith('📊 [DIAGNOSTIC] Full diagnostic summary:', result);
            });
        });
    });

    describe('enableLogging', () => {
        beforeEach(() => {
            // Reset window mocks
            mockWindow.plinkoLogger = undefined;
            mockWindow.enablePlinkoLogging = undefined;
        });

        it('should enable logging when called', () => {
            enableLogging();

            expect(mockWindow.plinkoLogger).toBeDefined();
            expect(console.log).toHaveBeenCalledWith('🔧 [LOGGING] Plinko logging enabled!');
        });

        it('should handle non-browser environment', () => {
            const originalWindow = global.window;
            delete (global as any).window;

            expect(() => enableLogging()).not.toThrow();

            // Restore window
            (global as any).window = originalWindow;
        });
    });

    describe('Global access setup', () => {
        it('should not expose diagnostic tool globally by default', () => {
            // Import should not trigger global setup
            require('../src/utils/diagnosticTool');

            // Should not be exposed by default
            expect(mockWindow.plinkoDiagnostic).toBeUndefined();
        });
    });
});
