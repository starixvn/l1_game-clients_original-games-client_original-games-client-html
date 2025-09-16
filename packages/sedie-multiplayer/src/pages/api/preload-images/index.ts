import fs from "fs";
import { NextApiRequest, NextApiResponse } from "next";
import path from "path";

import { buildVersion } from "@shared/constants";
import { getPathImageGameId } from "@shared/constants/resource-image-mapping";

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

// Validate request body
const validateRequest = (body: any): body is RequestBody => {
    return typeof body === "object" && typeof body.gameId === "number";
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
            return [".jpg", ".png", ".gif", ".webp", ".svg"].includes(ext);
        });
    } catch (error) {
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
    const imageFiles = files.map((file) => path.join(DEFAULT_IMG_PATH, dirPath, `${file}?v=${buildVersion}`).replace(/\\/g, "/"));

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
const getPathsImg = (gameId: number): string[] => {
    if (gameId > 0) {
        return getPathImageGameId(gameId);
    }

    return [];
};

export default function handler(req: NextApiRequest, res: NextApiResponse<any[]>) {
    if (req.method !== "POST") {
        return res.status(405).json([]);
    }

    if (!validateRequest(req.body)) {
        return res.status(400).json([]);
    }

    const { gameId } = req.body;

    const pathsImg = getPathsImg(gameId);

    // Validate paths
    if (!Array.isArray(pathsImg) || pathsImg.length === 0) {
        return res.status(200).json([]);
    }

    const imagesDir = path.join(process.cwd(), DEFAULT_STATIC_PATH);
    const imageFiles: string[] = [];

    for (const dirPath of pathsImg) {
        const imagePath = path.join(DEFAULT_IMG_PATH, dirPath);
        const ext = path.extname(imagePath).toLowerCase();
        // Handle direct image files
        if ([".jpg", ".png", ".gif", ".webp", ".svg"].includes(ext)) {
            const imageUrl = `${imagePath}?v=${buildVersion}`.replace(/\\/g, "/");
            imageFiles.push(imageUrl);
        } else {
            // Handle directories
            const dirFiles = readFilesFromPath(dirPath, imagesDir);
            imageFiles.push(...dirFiles);
        }
    }
    // Remove duplicates and filter valid URLs
    const uniqueImageFiles = Array.from(new Set(imageFiles)).filter((url) => url.startsWith("/static/images/") && url.includes("?v="));

    return res.status(200).json(uniqueImageFiles);
}
