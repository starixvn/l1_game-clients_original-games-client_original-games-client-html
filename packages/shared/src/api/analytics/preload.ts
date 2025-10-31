import { NextApiRequest, NextApiResponse } from "next";

interface PreloadAnalyticsData {
    gameId: number;
    startTime: number;
    endTime?: number;
    totalImages: number;
    criticalImages: number;
    loadedImages: number;
    failedImages: number;
    apiResponseTime: number;
    totalLoadTime: number;
    cacheHits: number;
    compressionRatio: number;
    userAgent?: string;
    timestamp: number;
}

// In-memory storage for analytics (in production, use a database)
const analyticsStorage: PreloadAnalyticsData[] = [];

// Analytics aggregation
interface AnalyticsSummary {
    totalPreloads: number;
    averageLoadTime: number;
    averageApiResponseTime: number;
    totalImagesLoaded: number;
    averageCacheHits: number;
    averageCompressionRatio: number;
    successRate: number;
    gameBreakdown: { [gameId: number]: number };
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        // Store analytics data
        try {
            const analyticsData: PreloadAnalyticsData = {
                ...req.body,
                userAgent: req.headers['user-agent'],
                timestamp: Date.now()
            };

            // Validate required fields
            if (!analyticsData.gameId || !analyticsData.startTime) {
                res.status(400).json({ error: 'Missing required fields' });
                return;
            }

            // Store the data
            analyticsStorage.push(analyticsData);

            // Keep only last 1000 entries to prevent memory issues
            if (analyticsStorage.length > 1000) {
                analyticsStorage.splice(0, analyticsStorage.length - 1000);
            }

            res.status(200).json({ success: true, message: 'Analytics data stored' });
        } catch (error) {
            console.error('[Analytics] Error storing data:', error);
            res.status(500).json({ error: 'Failed to store analytics data' });
        }
    } else if (req.method === 'GET') {
        // Retrieve analytics summary
        try {
            const summary = generateAnalyticsSummary();
            res.status(200).json(summary);
        } catch (error) {
            console.error('[Analytics] Error generating summary:', error);
            res.status(500).json({ error: 'Failed to generate analytics summary' });
        }
    } else {
        res.setHeader('Allow', ['POST', 'GET']);
        res.status(405).json({ error: 'Method not allowed' });
    }
}

function generateAnalyticsSummary(): AnalyticsSummary {
    if (analyticsStorage.length === 0) {
        return {
            totalPreloads: 0,
            averageLoadTime: 0,
            averageApiResponseTime: 0,
            totalImagesLoaded: 0,
            averageCacheHits: 0,
            averageCompressionRatio: 0,
            successRate: 0,
            gameBreakdown: {}
        };
    }

    const totalPreloads = analyticsStorage.length;
    const totalLoadTime = analyticsStorage.reduce((sum, data) => sum + (data.totalLoadTime || 0), 0);
    const totalApiResponseTime = analyticsStorage.reduce((sum, data) => sum + (data.apiResponseTime || 0), 0);
    const totalImagesLoaded = analyticsStorage.reduce((sum, data) => sum + (data.loadedImages || 0), 0);
    const totalCacheHits = analyticsStorage.reduce((sum, data) => sum + (data.cacheHits || 0), 0);
    const totalCompressionRatio = analyticsStorage.reduce((sum, data) => sum + (data.compressionRatio || 0), 0);

    const successfulPreloads = analyticsStorage.filter(data =>
        data.loadedImages > 0 && data.failedImages === 0
    ).length;

    // Game breakdown
    const gameBreakdown: { [gameId: number]: number } = {};
    analyticsStorage.forEach(data => {
        gameBreakdown[data.gameId] = (gameBreakdown[data.gameId] || 0) + 1;
    });

    return {
        totalPreloads,
        averageLoadTime: Math.round(totalLoadTime / totalPreloads),
        averageApiResponseTime: Math.round(totalApiResponseTime / totalPreloads),
        totalImagesLoaded,
        averageCacheHits: Math.round(totalCacheHits / totalPreloads),
        averageCompressionRatio: Math.round(totalCompressionRatio / totalPreloads),
        successRate: Math.round((successfulPreloads / totalPreloads) * 100),
        gameBreakdown
    };
}

// Export for testing
export { analyticsStorage, generateAnalyticsSummary };
