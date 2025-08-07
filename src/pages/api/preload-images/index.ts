import fs from "fs";
import { NextApiRequest, NextApiResponse } from "next";
import path from "path";

import { buildVersion, GameIds, LobbyGameId } from "../../../_shared/constants";
import { getPathIconGames, getPathImageGameId, pathImageMapping } from "../../../_shared/constants/resource-image-mapping";

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
    gameId: number;
    locale: string;
    gameIdsIcon: number[];
    bannerId: number;
}

// Clean up expired cache entries
const cleanupCache = () => {
    const now = Date.now();
    const keysToDelete: string[] = [];

    imageCache.forEach((entry, key) => {
        if (now - entry.timestamp > entry.ttl) {
            keysToDelete.push(key);
        }
    });

    keysToDelete.forEach(key => imageCache.delete(key));

    // If cache is still too large, remove oldest entries
    if (imageCache.size > MAX_CACHE_SIZE) {
        const entries: Array<[string, CacheEntry]> = [];
        imageCache.forEach((entry, key) => {
            entries.push([key, entry]);
        });

        entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
        const toRemove = entries.slice(0, Math.floor(MAX_CACHE_SIZE / 2));
        toRemove.forEach(([key]) => imageCache.delete(key));
    }
};

// Validate request body
const validateRequest = (body: any): body is RequestBody => {
    return (
        typeof body === 'object' &&
        typeof body.gameId === 'number' &&
        typeof body.locale === 'string' &&
        Array.isArray(body.gameIdsIcon) &&
        (body.bannerId === undefined || typeof body.bannerId === 'number')
    );
};

// Optimized file reading with error handling
const readDirectorySafely = (dirPath: string): string[] => {
    try {
        if (!fs.existsSync(dirPath)) {
            return [];
        }

        const files = fs.readdirSync(dirPath);
        return files.filter((file) => {
            const ext = path.extname(file).toLowerCase();
            return ['.jpg', '.png', '.gif', '.webp', '.svg'].includes(ext);
        });
    } catch (error) {
        console.warn(`Error reading directory ${dirPath}:`, error);
        return [];
    }
};

// Recursive directory reading with depth limit
const readFilesFromPath = (dirPath: string, imagesDir: string, maxDepth = 3, currentDepth = 0): string[] => {
    if (currentDepth >= maxDepth) {
        return [];
    }

    const fullDirPath = path.join(imagesDir, dirPath);
    const files = readDirectorySafely(fullDirPath);

    const imageFiles = files.map((file) =>
        path.join(DEFAULT_IMG_PATH, dirPath, `${file}?v=${buildVersion}`).replace(/\\/g, "/")
    );

    // Recursively read subdirectories
    const subdirs = files.filter((file) => {
        const fullPath = path.join(fullDirPath, file);
        try {
            return fs.statSync(fullPath).isDirectory();
        } catch {
            return false;
        }
    });

    for (const subdir of subdirs) {
        const subPath = path.join(dirPath, subdir);
        const subFiles = readFilesFromPath(subPath, imagesDir, maxDepth, currentDepth + 1);
        imageFiles.push(...subFiles);
    }

    return imageFiles;
};

// Get image paths based on game configuration
const getPathsImg = (gameId: number, currentLocale: string, bannerId: number, gameIdsIcon: number[]): string[] => {
    if (gameId === LobbyGameId) {
        return [...pathImageMapping.lobby, ...getPathIconGames(gameIdsIcon)];
    }

    if (gameId > 0) {
        if (gameId === GameIds.SicBall) {
            return [...getPathImageGameId(gameId), ...pathImageMapping[GameIds.SicBall]];
        }
        return [...getPathImageGameId(gameId), ...pathImageMapping.game];
    }

    return [];
};

export default function handler(req: NextApiRequest, res: NextApiResponse<any[]>) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json([]);
    }

    // Validate request body
    if (!validateRequest(req.body)) {
        return res.status(400).json([]);
    }

    const { gameId, locale, gameIdsIcon, bannerId } = req.body as RequestBody;
    const pathsImg = getPathsImg(gameId, locale, bannerId, gameIdsIcon);
    const cacheKey = `${gameId}-${buildVersion}-${locale}`;

    // Clean up cache periodically
    if (Math.random() < 0.1) { // 10% chance to cleanup on each request
        cleanupCache();
    }

    // Check cache first
    const cachedEntry = imageCache.get(cacheKey);
    if (cachedEntry && Date.now() - cachedEntry.timestamp < cachedEntry.ttl) {
        return res.status(200).json(cachedEntry.data);
    }

    // Validate paths
    if (!Array.isArray(pathsImg) || pathsImg.length === 0) {
        return res.status(200).json([]);
    }

    const imagesDir = path.join(process.cwd(), DEFAULT_STATIC_PATH);
    const imageFiles: string[] = [];

    // Process each path
    for (const dirPath of pathsImg) {
        const imagePath = path.join(DEFAULT_IMG_PATH, dirPath);
        const ext = path.extname(imagePath).toLowerCase();

        // Handle direct image files
        if (['.jpg', '.png', '.gif', '.webp', '.svg'].includes(ext)) {
            const imageUrl = `${imagePath}?v=${buildVersion}`.replace(/\\/g, "/");
            imageFiles.push(imageUrl);
        } else {
            // Handle directories
            const dirFiles = readFilesFromPath(dirPath, imagesDir);
            imageFiles.push(...dirFiles);
        }
    }

    // Remove duplicates and filter valid URLs
    const uniqueImageFiles = Array.from(new Set(imageFiles)).filter(url =>
        url.startsWith('/static/images/') &&
        url.includes('?v=')
    );

    // Cache the result
    imageCache.set(cacheKey, {
        data: uniqueImageFiles,
        timestamp: Date.now(),
        ttl: CACHE_TTL
    });

    return res.status(200).json(uniqueImageFiles);
}
