import fs from "fs";
import { NextApiRequest, NextApiResponse } from "next";
import path from "path";

import { buildVersion } from "@shared/constants";
import { getPathImageGameId } from "@shared/constants/resource-image-mapping";
import { getGameId } from "@shared/game-config";
import { getGameSettings } from "@shared/app-settings";
import { BASE_PATH } from "@shared/constants/base-path";

// Enhanced caching with TTL and memory management
interface CacheEntry {
    data: string[];
    timestamp: number;
    ttl: number;
}

const imageCache = new Map<string, CacheEntry>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const MAX_CACHE_SIZE = 100; // Maximum number of cached entries

const DEFAULT_STATIC_PATH = "public/static/images/";
const DEFAULT_IMG_PATH = "/static/images/";

interface RequestBody {
    locale?: string;
    gameIdsIcon?: number[];
    bannerId?: number;
    gameId?: number; // For backward compatibility
}

// Cleanup cache to prevent memory leaks
const cleanupCache = () => {
    const now = Date.now();
    const entriesToDelete: string[] = [];

    imageCache.forEach((entry, key) => {
        if (now - entry.timestamp > entry.ttl) {
            entriesToDelete.push(key);
        }
    });

    entriesToDelete.forEach((key) => {
        imageCache.delete(key);
    });

    // If cache is still too large, remove oldest entries
    if (imageCache.size > MAX_CACHE_SIZE) {
        const sortedEntries = Array.from(imageCache.entries()).sort(([, a], [, b]) => a.timestamp - b.timestamp);

        const toRemove = sortedEntries.slice(0, imageCache.size - MAX_CACHE_SIZE);
        toRemove.forEach(([key]) => {
            imageCache.delete(key);
        });
    }
};

// Get icon paths for games
const getPathIconGames = (gameIds: number[]): string[] => {
    return gameIds.map(gameId => `/static/images/game-icons/${gameId}/`);
};

// Get game-specific paths - can be overridden by individual games
export const getGameSpecificPaths = (gameId?: number): string[] => {
    const paths: string[] = [];

    // Lobby and game images are common
    paths.push("/static/images/game-icons/");
    paths.push("/static/images/chips/");

    // Add game-specific paths based on game ID
    if (gameId) {
        const gameSpecificPaths = getPathImageGameId(gameId);
        paths.push(...gameSpecificPaths);
    }

    return paths;
};

// Get cache-specific paths (directories) that should be scanned for all assets
export const getCacheSpecificPaths = (gameId?: number): string[] => {
    const paths: string[] = [];

    if (gameId) {
        const gameSettings = getGameSettings(gameId);
        const cachePaths = gameSettings?.gameResourceConfigs?.cachePaths || [];
        paths.push(...cachePaths);
    }

    return paths;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        if (req.method !== 'POST') {
            return res.status(405).json({
                status: "error",
                message: "Method not allowed"
            });
        }

        const { locale, gameIdsIcon, bannerId, gameId }: RequestBody = req.body;

        // Use provided gameId or get from game config
        const currentGameId = gameId || getGameId();

        // Generate cache key
        const cacheKey = `${locale || 'default'}-${gameIdsIcon?.join(',') || 'no-icons'}-${bannerId || 'no-banner'}-${currentGameId}`;

        // Check cache first
        const cachedEntry = imageCache.get(cacheKey);
        if (cachedEntry && Date.now() - cachedEntry.timestamp < cachedEntry.ttl) {
            return res.status(200).json({
                status: "ok",
                data: cachedEntry.data
            });
        }

        const imagePaths: string[] = [];

        // Add game-specific image paths
        const gamePaths = getGameSpecificPaths(currentGameId);
        imagePaths.push(...gamePaths);

        // Add cache-specific paths (directories to scan for all assets)
        const cachePaths = getCacheSpecificPaths(currentGameId);
        imagePaths.push(...cachePaths);

        // Add icon paths for other games
        if (gameIdsIcon && gameIdsIcon.length > 0) {
            const iconPaths = getPathIconGames(gameIdsIcon);
            imagePaths.push(...iconPaths);
        }

        // Add banner path if specified
        if (bannerId) {
            imagePaths.push(`/static/images/banners/${bannerId}/`);
        }

        // Read actual files from filesystem
        const allImageFiles: string[] = [];

        for (const imagePath of imagePaths) {
            try {
                const fullPath = path.join(process.cwd(), imagePath.replace('/static/images/', 'public/static/images/'));
                if (fs.existsSync(fullPath)) {
                    const files = fs.readdirSync(fullPath, { recursive: true });
                    const imageFiles = files
                        .filter((file) => {
                            const fileStr = file.toString();
                            return /\.(png|jpg|jpeg|webp|svg|gif)$/i.test(fileStr);
                        })
                        .map((file) => {
                            const fileStr = file.toString();
                            const relativePath = path.relative(fullPath, path.join(fullPath, fileStr));
                            // Normalize path separators to forward slashes for web URLs
                            const normalizedRelativePath = relativePath.replace(/\\/g, '/');
                            return `${BASE_PATH}${imagePath}${normalizedRelativePath}?v=${buildVersion}`;

                        });

                    allImageFiles.push(...imageFiles);
                }
            } catch (error) {
                console.warn(`Failed to read images from ${imagePath}:`, error);
            }
        }

        // Cache the result
        imageCache.set(cacheKey, {
            data: allImageFiles,
            timestamp: Date.now(),
            ttl: CACHE_TTL
        });

        // Periodic cache cleanup
        cleanupCache();

        return res.status(200).json({
            status: "ok",
            data: allImageFiles
        });

    } catch (error) {
        console.error('Preload images error:', error);
        return res.status(500).json({
            status: "error",
            message: "Failed to preload images",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}
