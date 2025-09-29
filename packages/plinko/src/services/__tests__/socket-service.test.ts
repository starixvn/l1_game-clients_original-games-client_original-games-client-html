import { PlinkoSocketService, InitPlinkoSocketIO, SocketState } from '../socket-service';
import { SocketInfo } from '@shared/components/game-base/type';
import { GameMessageHandler, messageEventType } from '@shared/components/game-base/handlers';
import { logger as plinkoLogger } from '../logger';

// Mock socket.io-client
const mockSocket = {
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
    disconnect: jest.fn(),
    connected: true
};

jest.mock('socket.io-client', () => ({
    io: jest.fn(() => mockSocket)
}));

// Mock the shared services
jest.mock('@shared/app-settings', () => ({
    getAppSettings: jest.fn(() => ({
        proxy: { path: '/proxy' },
        enableMsgpackParser: true
    }))
}));

jest.mock('@shared/helpers', () => ({
    buildServerUrl: jest.fn(() => 'ws://localhost:3000')
}));

// Mock the stores
jest.mock('@shared/stores/game-store/game-store', () => ({
    useGameStore: {
        getState: () => ({
            setSocket: jest.fn(),
            registerEvent: jest.fn()
        })
    }
}));

jest.mock('@shared/stores/betting-store/betting-store', () => ({
    useBettingStore: {
        getState: () => ({
            registerEvent: jest.fn()
        })
    }
}));

// Mock the logger
jest.mock('../logger', () => ({
    logger: {
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
        debug: jest.fn()
    }
}));

describe('PlinkoSocketService', () => {
    let socketService: PlinkoSocketService;
    let mockGameMessageHandler: GameMessageHandler;
    let mockSession: any;
    let mockSocketInfo: SocketInfo;

    beforeEach(() => {
        // Arrange: Set up test data
        mockSession = {
            username: 'testuser',
            ss: 'test-session-string'
        };

        mockSocketInfo = {
            namespace: 'plinko',
            path: 'game'
        };

        mockGameMessageHandler = {
            registerSocketEvents: jest.fn(),
            broadcastGameEvent: jest.fn(),
            broadcastGameMessage: jest.fn()
        } as any;

        jest.clearAllMocks();
    });

    describe('Socket Connection', () => {
        it('should connect to socket successfully', () => {
            // Arrange
            socketService = new PlinkoSocketService(
                mockGameMessageHandler,
                mockSession,
                'Plinko',
                mockSocketInfo
            );

            // Act
            const socket = socketService.connect();

            // Assert
            expect(socket).toBe(mockSocket);
            expect(plinkoLogger.info).toHaveBeenCalledWith(
                'Initializing Socket.IO connection for Plinko',
                expect.objectContaining({
                    gameName: 'Plinko',
                    namespace: 'plinko',
                    path: 'game'
                })
            );
        });

        it('should register socket events on connection', () => {
            // Arrange
            socketService = new PlinkoSocketService(
                mockGameMessageHandler,
                mockSession,
                'Plinko',
                mockSocketInfo
            );

            // Act
            socketService.connect();

            // Assert
            expect(mockGameMessageHandler.registerSocketEvents).toHaveBeenCalled();
            expect(mockSocket.on).toHaveBeenCalledWith('Plinko', expect.any(Function));
            expect(mockSocket.on).toHaveBeenCalledWith('message', expect.any(Function));
        });

        it('should handle socket connection event', () => {
            // Arrange
            socketService = new PlinkoSocketService(
                mockGameMessageHandler,
                mockSession,
                'Plinko',
                mockSocketInfo
            );
            socketService.connect();

            // Act
            const connectionHandler = mockSocket.on.mock.calls.find(
                call => call[0] === messageEventType.SOCKET_CONNECTED
            )?.[1];
            connectionHandler();

            // Assert
            expect(mockSocket.emit).toHaveBeenCalledWith('signin', mockSession);
            expect(mockGameMessageHandler.broadcastGameEvent).toHaveBeenCalledWith({
                [messageEventType.SOCKET_CONNECTED]: true
            });
            expect(plinkoLogger.info).toHaveBeenCalledWith(
                'Plinko socket connected, sending signin',
                expect.any(Object)
            );
        });

        it('should handle signed in event', () => {
            // Arrange
            socketService = new PlinkoSocketService(
                mockGameMessageHandler,
                mockSession,
                'Plinko',
                mockSocketInfo
            );
            socketService.connect();

            // Act
            const signedInHandler = mockSocket.on.mock.calls.find(
                call => call[0] === messageEventType.SIGNED_IN
            )?.[1];
            signedInHandler();

            // Assert
            expect(mockSocket.emit).toHaveBeenCalledWith('inGame', 'Plinko');
            expect(mockGameMessageHandler.broadcastGameEvent).toHaveBeenCalledWith({
                [messageEventType.SIGNED_IN]: true
            });
            expect(plinkoLogger.info).toHaveBeenCalledWith(
                'Successfully signed in to Plinko, joining game room',
                expect.any(Object)
            );
        });
    });

    describe('Message Handling', () => {
        it('should handle game messages correctly', () => {
            // Arrange
            socketService = new PlinkoSocketService(
                mockGameMessageHandler,
                mockSession,
                'Plinko',
                mockSocketInfo
            );
            socketService.connect();

            const testMessage = { betResult: { amount: 100, win: true } };

            // Act
            const gameMessageHandler = mockSocket.on.mock.calls.find(
                call => call[0] === 'Plinko'
            )?.[1];
            gameMessageHandler(testMessage);

            // Assert
            expect(mockGameMessageHandler.broadcastGameEvent).toHaveBeenCalledWith(testMessage);
            expect(plinkoLogger.debug).toHaveBeenCalledWith(
                'Received Plinko game message',
                expect.objectContaining({
                    gameName: 'Plinko',
                    messageType: 'betResult'
                })
            );
        });

        it('should handle generic messages correctly', () => {
            // Arrange
            socketService = new PlinkoSocketService(
                mockGameMessageHandler,
                mockSession,
                'Plinko',
                mockSocketInfo
            );
            socketService.connect();

            const testMessage = { notification: { type: 'info', message: 'Test' } };

            // Act
            const genericMessageHandler = mockSocket.on.mock.calls.find(
                call => call[0] === 'message'
            )?.[1];
            genericMessageHandler(testMessage);

            // Assert
            expect(mockGameMessageHandler.broadcastGameMessage).toHaveBeenCalledWith(testMessage);
            expect(plinkoLogger.debug).toHaveBeenCalledWith(
                'Received generic message for Plinko',
                expect.objectContaining({
                    gameName: 'Plinko',
                    messageType: 'notification'
                })
            );
        });
    });

    describe('Error Handling', () => {
        it('should handle socket connection error', () => {
            // Arrange
            socketService = new PlinkoSocketService(
                mockGameMessageHandler,
                mockSession,
                'Plinko',
                mockSocketInfo
            );
            socketService.connect();

            const testError = new Error('Connection failed');

            // Act
            const errorHandler = mockSocket.on.mock.calls.find(
                call => call[0] === messageEventType.SOCKET_CONNECT_ERROR
            )?.[1];
            errorHandler(testError);

            // Assert
            expect(mockGameMessageHandler.broadcastGameEvent).toHaveBeenCalledWith({
                [messageEventType.SOCKET_CONNECT_ERROR]: true
            });
            expect(plinkoLogger.error).toHaveBeenCalledWith(
                'Plinko socket connection error',
                expect.objectContaining({
                    gameName: 'Plinko',
                    error: testError
                })
            );
        });

        it('should handle socket disconnection', () => {
            // Arrange
            socketService = new PlinkoSocketService(
                mockGameMessageHandler,
                mockSession,
                'Plinko',
                mockSocketInfo
            );
            socketService.connect();

            // Act
            const disconnectHandler = mockSocket.on.mock.calls.find(
                call => call[0] === messageEventType.SOCKET_DISCONNECTED
            )?.[1];
            disconnectHandler();

            // Assert
            expect(mockGameMessageHandler.broadcastGameEvent).toHaveBeenCalledWith({
                [messageEventType.SOCKET_DISCONNECTED]: true
            });
            expect(plinkoLogger.warn).toHaveBeenCalledWith(
                'Plinko socket disconnected',
                expect.objectContaining({
                    gameName: 'Plinko'
                })
            );
        });
    });

    describe('Socket Management', () => {
        it('should disconnect socket correctly', () => {
            // Arrange
            socketService = new PlinkoSocketService(
                mockGameMessageHandler,
                mockSession,
                'Plinko',
                mockSocketInfo
            );
            socketService.connect();

            // Act
            socketService.disconnect();

            // Assert
            expect(mockSocket.disconnect).toHaveBeenCalled();
            expect(plinkoLogger.info).toHaveBeenCalledWith(
                'Disconnecting Plinko socket',
                expect.objectContaining({
                    gameName: 'Plinko'
                })
            );
        });

        it('should emit events correctly', () => {
            // Arrange
            socketService = new PlinkoSocketService(
                mockGameMessageHandler,
                mockSession,
                'Plinko',
                mockSocketInfo
            );
            socketService.connect();

            const testData = { betAmount: 100, gameMode: 0 };

            // Act
            socketService.emit('placeBet', testData);

            // Assert
            expect(mockSocket.emit).toHaveBeenCalledWith('placeBet', testData);
            expect(plinkoLogger.debug).toHaveBeenCalledWith(
                'Emitting Plinko socket event',
                expect.objectContaining({
                    event: 'placeBet',
                    gameName: 'Plinko',
                    hasData: true
                })
            );
        });

        it('should warn when emitting without connection', () => {
            // Arrange
            socketService = new PlinkoSocketService(
                mockGameMessageHandler,
                mockSession,
                'Plinko',
                mockSocketInfo
            );
            // Don't connect

            // Act
            socketService.emit('placeBet', { amount: 100 });

            // Assert
            expect(plinkoLogger.warn).toHaveBeenCalledWith(
                'Cannot emit event - socket not connected',
                expect.objectContaining({
                    event: 'placeBet',
                    gameName: 'Plinko'
                })
            );
        });

        it('should add event listeners correctly', () => {
            // Arrange
            socketService = new PlinkoSocketService(
                mockGameMessageHandler,
                mockSession,
                'Plinko',
                mockSocketInfo
            );
            socketService.connect();

            const testCallback = jest.fn();

            // Act
            socketService.on('customEvent', testCallback);

            // Assert
            expect(mockSocket.on).toHaveBeenCalledWith('customEvent', testCallback);
        });

        it('should remove event listeners correctly', () => {
            // Arrange
            socketService = new PlinkoSocketService(
                mockGameMessageHandler,
                mockSession,
                'Plinko',
                mockSocketInfo
            );
            socketService.connect();

            const testCallback = jest.fn();

            // Act
            socketService.off('customEvent', testCallback);

            // Assert
            expect(mockSocket.off).toHaveBeenCalledWith('customEvent', testCallback);
        });

        it('should return socket instance', () => {
            // Arrange
            socketService = new PlinkoSocketService(
                mockGameMessageHandler,
                mockSession,
                'Plinko',
                mockSocketInfo
            );
            socketService.connect();

            // Act
            const socket = socketService.getSocket();

            // Assert
            expect(socket).toBe(mockSocket);
        });

        it('should check connection status correctly', () => {
            // Arrange
            socketService = new PlinkoSocketService(
                mockGameMessageHandler,
                mockSession,
                'Plinko',
                mockSocketInfo
            );
            socketService.connect();

            // Act
            const isConnected = socketService.isConnected();

            // Assert
            expect(isConnected).toBe(true);
        });

        it('should return false for connection status when not connected', () => {
            // Arrange
            socketService = new PlinkoSocketService(
                mockGameMessageHandler,
                mockSession,
                'Plinko',
                mockSocketInfo
            );
            // Don't connect

            // Act
            const isConnected = socketService.isConnected();

            // Assert
            expect(isConnected).toBe(false);
        });
    });

    describe('InitPlinkoSocketIO Factory Function', () => {
        it('should create PlinkoSocketService instance', () => {
            // Act
            const service = InitPlinkoSocketIO(
                mockSocketInfo,
                mockSession,
                'Plinko',
                mockGameMessageHandler
            );

            // Assert
            expect(service).toBeInstanceOf(PlinkoSocketService);
        });
    });

    describe('SocketState Enum', () => {
        it('should have correct enum values', () => {
            // Assert
            expect(SocketState.None).toBe(0);
            expect(SocketState.Connected).toBe(1);
            expect(SocketState.Error).toBe(2);
            expect(SocketState.Disconnected).toBe(3);
        });
    });

    describe('Edge Cases and Error Handling', () => {
        it('should handle null socket gracefully', () => {
            // Arrange
            const { io } = require('socket.io-client');
            io.mockReturnValue(null);

            socketService = new PlinkoSocketService(
                mockGameMessageHandler,
                mockSession,
                'Plinko',
                mockSocketInfo
            );

            // Act
            const socket = socketService.connect();

            // Assert
            expect(socket).toBeNull();
        });

        it('should handle multiple event listeners for same event', () => {
            // Arrange
            socketService = new PlinkoSocketService(
                mockGameMessageHandler,
                mockSession,
                'Plinko',
                mockSocketInfo
            );
            socketService.connect();

            const callback1 = jest.fn();
            const callback2 = jest.fn();

            // Act
            socketService.on('testEvent', callback1);
            socketService.on('testEvent', callback2);

            // Assert
            expect(mockSocket.on).toHaveBeenCalledWith('testEvent', callback1);
            expect(mockSocket.on).toHaveBeenCalledWith('testEvent', callback2);
        });

        it('should handle disconnect when socket is null', () => {
            // Arrange
            socketService = new PlinkoSocketService(
                mockGameMessageHandler,
                mockSession,
                'Plinko',
                mockSocketInfo
            );
            // Don't connect, so socket is null

            // Act
            socketService.disconnect();

            // Assert
            expect(mockSocket.disconnect).not.toHaveBeenCalled();
        });
    });
});
