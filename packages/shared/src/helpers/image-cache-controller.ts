import axios from "axios";
import "./string-helper";
import { BASE_PATH } from '@shared/constants/base-path';

// Enhanced image cache with memory management
interface CacheEntry {
    data: string;
    timestamp: number;
    size: number;
}

export const imageCache: Record<string, CacheEntry> = {};
const MAX_CACHE_SIZE = 50 * 1024 * 1024; // 50MB limit
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes
let currentCacheSize = 0;

// Clean up cache when it gets too large
const cleanupCache = () => {
    const now = Date.now();
    const entries = Object.entries(imageCache);

    // Remove expired entries
    for (const [key, entry] of entries) {
        if (now - entry.timestamp > CACHE_TTL) {
            currentCacheSize -= entry.size;
            delete imageCache[key];
        }
    }

    // If still too large, remove oldest entries
    if (currentCacheSize > MAX_CACHE_SIZE) {
        const sortedEntries = entries
            .filter(([_, entry]) => now - entry.timestamp <= CACHE_TTL)
            .sort((a, b) => a[1].timestamp - b[1].timestamp);

        for (const [key, entry] of sortedEntries) {
            currentCacheSize -= entry.size;
            delete imageCache[key];

            if (currentCacheSize <= MAX_CACHE_SIZE * 0.8) {
                // Leave 20% buffer
                break;
            }
        }
    }
};

// Optimized base64 conversion
const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
    const bytes = new Uint8Array(buffer);
    let binary = "";
    const len = bytes.byteLength;

    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }

    return btoa(binary);
};

// Fetch image with retry logic
const fetchImageBase64 = async (imageUrl: string, retries = 2): Promise<string> => {
    const controller = new AbortController();

    try {
        imageUrl = imageUrl.removeBuildVersion().appendBuildVersion();
        const response = await axios.get(imageUrl, {
            responseType: "arraybuffer",
            signal: controller.signal,
        });

        const contentType = response.headers["content-type"]?.toLowerCase() || "image/png";
        const base64 = arrayBufferToBase64(response.data);
        return `data:${contentType};base64,${base64}`;
    } catch (error) {
        if (retries > 0 && !axios.isCancel(error)) {
            // Retry with exponential backoff
            await new Promise((resolve) => setTimeout(resolve, 1000 * (3 - retries)));
            return fetchImageBase64(imageUrl, retries - 1);
        }

        throw new Error(`Failed to fetch image: ${imageUrl} - ${error}`);
    }
};

// Calculate approximate size of base64 string
const calculateBase64Size = (base64: string): number => {
    // Base64 is roughly 4/3 the size of the original data
    return Math.ceil(base64.length * 0.75);
};

const loadPromise = new Map<string, Promise<any>>();
export const downloadAndCacheImage = async (path: string): Promise<{ path: string; valid: boolean; imageBase64: string }> => {
    // Ensure path has basePath prepended if it's a relative static path
    let fullPath = path;
    if (path.startsWith('/static/') && !path.startsWith(BASE_PATH)) {
        fullPath = `${BASE_PATH}${path}`;
    }
    const cleanPath = fullPath.removeBuildVersion();

    // Check cache first
    if (imageCache[cleanPath]) {
        const entry = imageCache[cleanPath];
        const now = Date.now();

        // Check if entry is still valid
        if (now - entry.timestamp <= CACHE_TTL) {
            return { path: cleanPath, imageBase64: entry.data, valid: true };
        } else {
            // Remove expired entry
            currentCacheSize -= entry.size;
            delete imageCache[cleanPath];
        }
    }

    try {
        // Clean up cache if needed
        if (currentCacheSize > MAX_CACHE_SIZE) {
            cleanupCache();
        }

        // Fetch and cache the image
        if (!loadPromise.has(cleanPath)) {
            loadPromise.set(cleanPath, fetchImageBase64(cleanPath));
        }
        const imageBase64 = await loadPromise.get(cleanPath);
        loadPromise.delete(cleanPath);
        const size = calculateBase64Size(imageBase64);

        // Only cache if it's not too large
        if (size < MAX_CACHE_SIZE * 0.1) {
            // Don't cache if single image is >10% of max cache
            imageCache[cleanPath] = {
                data: imageBase64,
                timestamp: Date.now(),
                size,
            };
            currentCacheSize += size;
        }

        return { path: cleanPath, imageBase64, valid: true };
    } catch (error) {
        console.warn(`Failed to download and cache image: ${cleanPath}`, error);
        return { path: cleanPath, imageBase64: "", valid: false };
    }
};

// Export cache for debugging/monitoring
export const getCacheStats = () => ({
    size: currentCacheSize,
    maxSize: MAX_CACHE_SIZE,
    entryCount: Object.keys(imageCache).length,
    utilization: (currentCacheSize / MAX_CACHE_SIZE) * 100,
});

// Clear cache manually if needed
export const clearImageCache = () => {
    Object.keys(imageCache).forEach((key) => delete imageCache[key]);
    currentCacheSize = 0;
};
