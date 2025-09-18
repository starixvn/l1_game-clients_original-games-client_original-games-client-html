import { BaccaratResult } from './types';

const STORAGE_KEY = 'baccarat_last_result';

/**
 * Utility for storing and retrieving the last baccarat result
 * to persist across page refreshes
 */
export class BaccaratResultStorage {

    /**
     * Store the baccarat result in localStorage
     */
    static storeResult(result: BaccaratResult): void {
        try {
            const dataToStore = {
                result,
                timestamp: Date.now(),
                version: '1.0' // For future compatibility
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToStore));
        } catch (error) {
            console.warn('[BaccaratResultStorage] Failed to store result:', error);
        }
    }

    /**
     * Retrieve the stored baccarat result from localStorage
     * Returns null if no data exists or data is corrupted
     */
    static getStoredResult(): BaccaratResult | null {
        try {
            const storedData = localStorage.getItem(STORAGE_KEY);
            if (!storedData) {
                return null;
            }

            const parsedData = JSON.parse(storedData);

            // Validate the stored data structure
            if (!parsedData.result ||
                !parsedData.result.player ||
                !parsedData.result.banker ||
                typeof parsedData.result.player.score !== 'number' ||
                typeof parsedData.result.banker.score !== 'number') {
                console.warn('[BaccaratResultStorage] Invalid stored data format');
                this.clearStoredResult();
                return null;
            }

            // Check if data is too old (optional - prevent using very old results)
            const MAX_AGE = 5 * 60 * 1000; // 5 minutes
            if (parsedData.timestamp && (Date.now() - parsedData.timestamp) > MAX_AGE) {
                console.warn('[BaccaratResultStorage] Stored data is too old');
                this.clearStoredResult();
                return null;
            }

            return parsedData.result;
        } catch (error) {
            console.warn('[BaccaratResultStorage] Failed to retrieve result:', error);
            this.clearStoredResult();
            return null;
        }
    }

    /**
     * Clear the stored result (useful when starting a new round)
     */
    static clearStoredResult(): void {
        try {
            localStorage.removeItem(STORAGE_KEY);
        } catch (error) {
            console.warn('[BaccaratResultStorage] Failed to clear result:', error);
        }
    }
}
