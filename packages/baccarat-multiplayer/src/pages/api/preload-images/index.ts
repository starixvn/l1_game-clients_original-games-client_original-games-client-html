import fs from "fs";
import { NextApiRequest, NextApiResponse } from "next";
import path from "path";

import { buildVersion, LobbyGameId } from "@shared/constants";
import { getPathImageGameId } from "@shared/constants/resource-image-mapping";

// Local path mappings for baccarat package
const pathImageMapping = {
    lobby: ["/images/game-icons/"],
    game: ["/images/chips/"]
};

// Get icon paths for games
const getPathIconGames = (gameIds: number[]): string[] => {
    return gameIds.map(gameId => `/images/game-icons/${gameId}/`);
};

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
    locale: string;
    gameIdsIcon: number[];
    bannerId: number;
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

    entriesToDelete.forEach(key => {
        console.log(`[API:preload-images] Removing expired cache entry: ${key}`);
        imageCache.delete(key);
    });

    // If cache is still too large, remove oldest entries
    if (imageCache.size > MAX_CACHE_SIZE) {
        const sortedEntries = Array.from(imageCache.entries())
            .sort(([, a], [, b]) => a.timestamp - b.timestamp);

        const toRemove = sortedEntries.slice(0, imageCache.size - MAX_CACHE_SIZE);
        toRemove.forEach(([key]) => {
            console.log(`[API:preload-images] Removing old cache entry due to size limit: ${key}`);
            imageCache.delete(key);
        });
    }
};

// Validate request body
const validateRequest = (body: any): body is RequestBody => {
    return (
        typeof body === 'object' &&
        typeof body.locale === 'string' &&
        Array.isArray(body.gameIdsIcon) &&
        (body.bannerId === undefined || typeof body.bannerId === 'number')
    );
};

// Optimized file reading with error handling
const readDirectorySafely = (dirPath: string): string[] => {
    try {
        if (!fs.existsSync(dirPath)) {
            console.log(`[API:preload-images] Directory does not exist: ${dirPath}`);
            return [];
        }

        const files = fs.readdirSync(dirPath);
        const imageFiles = files.filter((file) => {
            const ext = path.extname(file).toLowerCase();
            return ['.jpg', '.png', '.gif', '.webp', '.svg'].includes(ext);
        });

        console.log(`[API:preload-images] Found ${imageFiles.length} image files in ${dirPath}`);
        return imageFiles;
    } catch (error) {
        console.warn(`[API:preload-images] Error reading directory ${dirPath}:`, error);
        return [];
    }
};

// Recursive directory reading with depth limit
const readFilesFromPath = (dirPath: string, imagesDir: string, maxDepth = 3, currentDepth = 0): string[] => {
    if (currentDepth >= maxDepth) {
        console.log(`[API:preload-images] Max depth reached for path: ${dirPath}`);
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

    console.log(`[API:preload-images] Processing ${subdirs.length} subdirectories in ${dirPath}`);

    for (const subdir of subdirs) {
        const subPath = path.join(dirPath, subdir);
        const subFiles = readFilesFromPath(subPath, imagesDir, maxDepth, currentDepth + 1);
        imageFiles.push(...subFiles);
    }

    return imageFiles;
};

// Get image paths based on game configuration
const getPathsImg = (gameId: number, currentLocale: string, bannerId: number, gameIdsIcon: number[]): string[] => {
    console.log(`[API:preload-images] Getting image paths for gameId: ${gameId}, locale: ${currentLocale}`);

    if (gameId === LobbyGameId) {
        const paths = [...pathImageMapping.lobby, ...getPathIconGames(gameIdsIcon)];
        console.log(`[API:preload-images] Lobby game paths: ${paths.length} total`);
        return paths;
    }

    if (gameId > 0) {
        const paths = [...getPathImageGameId(gameId), ...pathImageMapping.game];
        console.log(`[API:preload-images] Regular game paths: ${paths.length} total`);
        return paths;
    }

    console.log(`[API:preload-images] No valid gameId, returning empty paths`);
    return [];
};

export default function handler(req: NextApiRequest, res: NextApiResponse<any[]>) {
    const requestId = `req-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    const startTime = Date.now();

    console.log(`[API:preload-images:${requestId}] Request received:`, {
        method: req.method,
        url: req.url,
        headers: {
            'user-agent': req.headers['user-agent'],
            'referer': req.headers['referer']
        }
    });

    // Only allow POST requests
    if (req.method !== 'POST') {
        console.log(`[API:preload-images:${requestId}] Method not allowed: ${req.method}`);
        return res.status(405).json([]);
    }

    // Validate request body
    if (!validateRequest(req.body)) {
        console.log(`[API:preload-images:${requestId}] Invalid request body:`, req.body);
        return res.status(400).json([]);
    }

    const { locale, gameIdsIcon, bannerId } = req.body;
    const gameId = process.env.NEXT_PUBLIC_DEFAULT_GAME_ID
        ? Number(process.env.NEXT_PUBLIC_DEFAULT_GAME_ID)
        : 150; // Default to Baccarat Multiplayer gameId
    const cacheKey = `${gameId}-${buildVersion}-${locale}`;

    console.log(`[API:preload-images:${requestId}] Processing request:`, {
        gameId,
        locale,
        gameIdsIcon: gameIdsIcon?.length || 0,
        bannerId,
        cacheKey
    });

    // Clean up cache periodically
    if (Math.random() < 0.1) { // 10% chance to cleanup on each request
        console.log(`[API:preload-images:${requestId}] Running cache cleanup`);
        cleanupCache();
    }

    // Check cache first
    const cachedEntry = imageCache.get(cacheKey);
    if (cachedEntry && Date.now() - cachedEntry.timestamp < cachedEntry.ttl) {
        const endTime = Date.now();
        console.log(`[API:preload-images:${requestId}] Cache hit! Returning ${cachedEntry.data.length} images in ${endTime - startTime}ms`);
        return res.status(200).json(cachedEntry.data);
    }

    console.log(`[API:preload-images:${requestId}] Cache miss, generating new response`);

    const pathsImg = getPathsImg(gameId, locale, bannerId, gameIdsIcon);

    // Validate paths
    if (!Array.isArray(pathsImg) || pathsImg.length === 0) {
        console.log(`[API:preload-images:${requestId}] No image paths found, returning empty array`);
        return res.status(200).json([]);
    }

    const imagesDir = path.join(process.cwd(), DEFAULT_STATIC_PATH);
    const imageFiles: string[] = [];

    console.log(`[API:preload-images:${requestId}] Processing ${pathsImg.length} image paths`);

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

    console.log(`[API:preload-images:${requestId}] Generated ${uniqueImageFiles.length} unique image URLs from ${imageFiles.length} total files`);

    // Cache the result
    imageCache.set(cacheKey, {
        data: uniqueImageFiles,
        timestamp: Date.now(),
        ttl: CACHE_TTL
    });

    const endTime = Date.now();
    console.log(`[API:preload-images:${requestId}] Request completed in ${endTime - startTime}ms, returning ${uniqueImageFiles.length} images`);

    return res.status(200).json(uniqueImageFiles);
}
