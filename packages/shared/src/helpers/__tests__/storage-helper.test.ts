import { buildUserSpecificLocalStorageKey, getUserLatestGameId, setUserLatestGameId, StorageHelper } from '../storage-helper';

// Mock dependencies
jest.mock('../../app-settings', () => ({
    getAppSettings: () => ({ appType: 1 })
}));

describe('User-specific latestGameId functionality (deprecated)', () => {
    beforeEach(() => {
        localStorage.clear();
        Object.defineProperty(globalThis, 'location', {
            value: { hostname: 'localhost' },
            writable: true
        });
    });

    describe('buildUserSpecificLocalStorageKey', () => {
        it('should create user-specific keys correctly', () => {
            const baseKey = 'latest-game-id';
            const username = 'testuser';
            const result = buildUserSpecificLocalStorageKey(baseKey, username);
            expect(result).toBe('localhost.latest-game-id.1.testuser');
        });

        it('should create base key when no username provided', () => {
            const baseKey = 'latest-game-id';
            const result = buildUserSpecificLocalStorageKey(baseKey);
            expect(result).toBe('localhost.latest-game-id.1');
        });
    });

    describe('getUserLatestGameId (no-op)', () => {
        it('should always return 0 regardless of username or stored value', () => {
            // Even if something is stored, getter returns 0
            const username = 'testuser';
            const userKey = buildUserSpecificLocalStorageKey('latest-game-id', username);
            StorageHelper.set(userKey, 9999);
            expect(getUserLatestGameId(username)).toBe(0);
            expect(getUserLatestGameId()).toBe(0);
        });
    });

    describe('setUserLatestGameId (no-op)', () => {
        it('should not write anything to storage', () => {
            const spy = jest.spyOn(StorageHelper, 'set');
            setUserLatestGameId(1005, 'user');
            setUserLatestGameId(1005);
            expect(spy).not.toHaveBeenCalled();
            spy.mockRestore();
        });
    });
});