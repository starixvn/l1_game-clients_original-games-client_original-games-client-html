import { buildUserSpecificLocalStorageKey, getUserLatestGameId, setUserLatestGameId, StorageHelper } from '../storage-helper';

// Mock dependencies
jest.mock('../../app-settings', () => ({
    getAppSettings: () => ({ appType: 1 })
}));

describe('User-specific latestGameId functionality', () => {
    beforeEach(() => {
        // Clear localStorage before each test
        localStorage.clear();
        // Mock globalThis.location
        Object.defineProperty(globalThis, 'location', {
            value: { hostname: 'localhost' },
            writable: true
        });
    });

    describe('buildUserSpecificLocalStorageKey', () => {
        it('should create user-specific keys correctly', () => {
            // Arrange
            const baseKey = 'latest-game-id';
            const username = 'testuser';

            // Act
            const result = buildUserSpecificLocalStorageKey(baseKey, username);

            // Assert
            expect(result).toBe('localhost.latest-game-id.1.testuser');
        });

        it('should create base key when no username provided', () => {
            // Arrange
            const baseKey = 'latest-game-id';

            // Act
            const result = buildUserSpecificLocalStorageKey(baseKey);

            // Assert
            expect(result).toBe('localhost.latest-game-id.1');
        });
    });

    describe('getUserLatestGameId', () => {
        it('should return user-specific gameId when username provided', () => {
            // Arrange
            const username = 'testuser';
            const gameId = 1005;
            const userKey = buildUserSpecificLocalStorageKey('latest-game-id', username);
            StorageHelper.set(userKey, gameId);

            // Act
            const result = getUserLatestGameId(username);

            // Assert
            expect(result).toBe(gameId);
        });

        it('should return global gameId when no username provided', () => {
            // Arrange
            const gameId = 1005;
            StorageHelper.set('localhost.latest-game-id.1', gameId);

            // Act
            const result = getUserLatestGameId();

            // Assert
            expect(result).toBe(gameId);
        });

        it('should return 0 when no gameId stored', () => {
            // Arrange
            const username = 'testuser';

            // Act
            const result = getUserLatestGameId(username);

            // Assert
            expect(result).toBe(0);
        });
    });

    describe('setUserLatestGameId', () => {
        it('should store user-specific gameId when username provided', () => {
            // Arrange
            const username = 'testuser';
            const gameId = 1005;

            // Act
            setUserLatestGameId(gameId, username);

            // Assert
            const userKey = buildUserSpecificLocalStorageKey('latest-game-id', username);
            const storedValue = StorageHelper.get(userKey);
            expect(storedValue).toBe(gameId);
        });

        it('should store global gameId when no username provided', () => {
            // Arrange
            const gameId = 1005;

            // Act
            setUserLatestGameId(gameId);

            // Assert
            const storedValue = StorageHelper.get('localhost.latest-game-id.1');
            expect(storedValue).toBe(gameId);
        });

        it('should not interfere between different users', () => {
            // Arrange
            const user1 = 'user1';
            const user2 = 'user2';
            const gameId1 = 1005;
            const gameId2 = 1007;

            // Act
            setUserLatestGameId(gameId1, user1);
            setUserLatestGameId(gameId2, user2);

            // Assert
            expect(getUserLatestGameId(user1)).toBe(gameId1);
            expect(getUserLatestGameId(user2)).toBe(gameId2);
        });
    });
}); 