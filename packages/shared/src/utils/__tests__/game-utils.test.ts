import { getDefaultGameId } from '../game-utils';

describe('getDefaultGameId', () => {
    const originalEnv = process.env;

    beforeEach(() => {
        process.env = { ...originalEnv };
    });

    afterEach(() => {
        process.env = originalEnv;
    });

    it('should return the game ID from environment variable when set', () => {
        process.env.NEXT_PUBLIC_DEFAULT_GAME_ID = '150';
        expect(getDefaultGameId()).toBe(150);
    });

    it('should return the default game ID 148 when environment variable is not set', () => {
        delete process.env.NEXT_PUBLIC_DEFAULT_GAME_ID;
        expect(getDefaultGameId()).toBe(148);
    });

    it('should parse string environment variable to number', () => {
        process.env.NEXT_PUBLIC_DEFAULT_GAME_ID = '200';
        expect(getDefaultGameId()).toBe(200);
    });

    it('should handle zero as valid game ID', () => {
        process.env.NEXT_PUBLIC_DEFAULT_GAME_ID = '0';
        expect(getDefaultGameId()).toBe(0);
    });
});
