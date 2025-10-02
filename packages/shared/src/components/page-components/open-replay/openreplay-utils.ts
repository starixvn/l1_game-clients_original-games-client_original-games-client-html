/**
 * OpenReplay utility functions for non-React usage
 * These can be used in services, middleware, or other non-React contexts
 */

import { isOpenReplayEnabled } from "./index";

// Global map to track retry intervals for cleanup
const retryIntervals = new Map<string, NodeJS.Timeout>();

// Retry configuration constants
const RETRY_CONFIG = {
    INTERVAL_MS: 5000, // 5 seconds
    MAX_RETRIES: 60, // 5 minutes total (60 * 5s = 300s)
    MAX_DURATION_MS: 300000, // 5 minutes in milliseconds
} as const;

interface OpenReplayTracker {
    setUserID: (userId: string) => void;
    setUserAnonymousID: (id: string) => void;
    setMetadata: (key: string, value: any) => void;
    event: (key: string, payload?: any, issue?: any) => void;
    issue: (key: string, payload?: any) => void;
    isActive: () => boolean;
    getSessionToken: () => string | null;
    start: () => Promise<any>;
    stop: () => void;
}

/**
 * Get the OpenReplay tracker instance
 */
export function getOpenReplayTracker(): OpenReplayTracker | null {
    if (typeof window !== "undefined" && window.openreplay) {
        return window.openreplay;
    }
    return null;
}

/**
 * Check if OpenReplay tracker is available and has valid configuration
 */
export function isOpenReplayAvailable(): boolean {
    const tracker = getOpenReplayTracker();
    if (!tracker) {
        return false;
    }

    // Check if tracker is active (meaning it was properly initialized)
    try {
        return tracker.isActive();
    } catch (error) {
        return false;
    }
}

/**
 * Attempt to set user ID immediately if tracker is available
 * @param userId - The user ID to set
 * @returns true if successful, false if tracker not available or error occurred
 */
function attemptSetUserID(userId: string): boolean {
    const tracker = getOpenReplayTracker();

    if (!tracker || !isOpenReplayAvailable()) {
        return false;
    }

    try {
        tracker.setUserID(userId);
        console.log("OpenReplay: User ID set to", userId);
        return true;
    } catch (error) {
        console.warn("OpenReplay: Failed to set user ID:", error);
        return false;
    }
}

/**
 * Clear existing retry interval for a user ID
 * @param userId - The user ID to clear retry interval for
 */
function clearExistingRetryInterval(userId: string): void {
    const existingInterval = retryIntervals.get(userId);
    if (existingInterval) {
        cleanupRetryInterval(userId, existingInterval);
    }
}

/**
 * Clean up retry interval and remove from tracking map
 * @param userId - The user ID associated with the interval
 * @param interval - The interval to clean up
 */
function cleanupRetryInterval(userId: string, interval: NodeJS.Timeout): void {
    clearInterval(interval);
    retryIntervals.delete(userId);
}

/**
 * Create retry interval for setting user ID
 * @param userId - The user ID to retry setting
 */
function createRetryInterval(userId: string): void {
    let retryCount = 0;

    const retryInterval = setInterval(() => {
        retryCount++;

        // Check if OpenReplay is still enabled during retry
        if (!isOpenReplayEnabled()) {
            console.log("OpenReplay: Configuration disabled during retry, stopping retry mechanism");
            cleanupRetryInterval(userId, retryInterval);
            return;
        }

        if (attemptSetUserID(userId)) {
            // Success - clean up and exit
            cleanupRetryInterval(userId, retryInterval);
            const elapsedSeconds = (retryCount * RETRY_CONFIG.INTERVAL_MS) / 1000;
            console.log(`OpenReplay: User ID successfully set to ${userId} (after ${elapsedSeconds}s)`);
            return;
        }

        if (retryCount >= RETRY_CONFIG.MAX_RETRIES) {
            // Max retries reached - clean up and exit
            console.warn("OpenReplay: Max retries reached, giving up on setting user ID");
            cleanupRetryInterval(userId, retryInterval);
            return;
        }

        // Continue retrying
        const retryIntervalSeconds = RETRY_CONFIG.INTERVAL_MS / 1000;
        console.log(
            `OpenReplay: Retrying to set user ID in ${retryIntervalSeconds}s (attempt ${retryCount + 1}/${RETRY_CONFIG.MAX_RETRIES})`
        );
    }, RETRY_CONFIG.INTERVAL_MS);

    // Store the interval for cleanup
    retryIntervals.set(userId, retryInterval);
}

/**
 * Set user ID with error handling and retry mechanism
 * Retries every 5 seconds until tracker is available and user ID is set
 * Only retries if OpenReplay is enabled in configuration
 */
export function setOpenReplayUserID(userId: string): boolean {
    // Check if OpenReplay is enabled in configuration
    if (!isOpenReplayEnabled()) {
        console.log("OpenReplay: Configuration does not allow OpenReplay to run, skipping user ID setup");
        return false;
    }

    // Try to set user ID immediately
    if (attemptSetUserID(userId)) {
        return true;
    }

    // Clear any existing retry interval for this user ID
    clearExistingRetryInterval(userId);

    // Set up retry mechanism
    console.log("OpenReplay: Tracker not available, setting up retry mechanism for user ID:", userId);
    createRetryInterval(userId);

    return false; // Return false initially, but retry in background
}

/**
 * Clear all existing retry intervals
 * Useful for cleanup when OpenReplay is disabled
 */
export function clearAllOpenReplayRetries(): void {
    const entries = Array.from(retryIntervals.entries());
    for (const [userId, interval] of entries) {
        console.log(`OpenReplay: Clearing retry interval for user ID: ${userId}`);
        cleanupRetryInterval(userId, interval);
    }
    console.log(`OpenReplay: Cleared all ${entries.length} retry intervals`);
}

/**
 * Track custom event with error handling
 */
export function trackOpenReplayEvent(key: string, payload?: any, issue?: any): boolean {
    if (!isOpenReplayAvailable()) {
        console.warn("OpenReplay: Tracker not available or not properly initialized");
        return false;
    }

    const tracker = getOpenReplayTracker();
    if (tracker) {
        try {
            tracker.event(key, payload, issue);
            console.log("OpenReplay: Event tracked", { key, payload, issue });
            return true;
        } catch (error) {
            console.warn("OpenReplay: Failed to track event:", error);
            return false;
        }
    }
    console.warn("OpenReplay: Tracker not available");
    return false;
}
