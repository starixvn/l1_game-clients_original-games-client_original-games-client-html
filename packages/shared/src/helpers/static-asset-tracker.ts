import { logger } from '../services/logger';
import { fileLoadingLogger } from './file-loading-logger';

// Static asset tracker for monitoring all client-server file interactions
class StaticAssetTracker {
    private static instance: StaticAssetTracker;
    private trackedAssets: Set<string> = new Set();

    static getInstance(): StaticAssetTracker {
        if (!StaticAssetTracker.instance) {
            StaticAssetTracker.instance = new StaticAssetTracker();
        }
        return StaticAssetTracker.instance;
    }

    // Track the main game JavaScript file loading
    trackGameJSFile(gameId: number): void {
        const buildVersion = process.env.BUILD_VERSION || Date.now().toString();
        const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
        // c.js is served from root level regardless of basePath
        const jsUrl = `/c.js?${buildVersion}`;

        if (this.trackedAssets.has(jsUrl)) {
            logger.debug('♻️ [STATIC-ASSET] Game JS file already tracked', { jsUrl });
            return;
        }

        this.trackedAssets.add(jsUrl);

        logger.info('📜 [STATIC-ASSET] Tracking main game JavaScript file', {
            gameId,
            jsUrl,
            buildVersion,
            basePath,
            timestamp: new Date().toISOString()
        });

        // Track as static asset
        fileLoadingLogger.trackStaticAsset(jsUrl, 'js');

        // Also track via script tag monitoring
        this.monitorScriptTag(jsUrl, gameId);
    }

    // Monitor script tag loading
    private monitorScriptTag(jsUrl: string, gameId: number): void {
        const startTime = Date.now();

        // Check if script is already loaded
        const existingScript = document.querySelector(`script[src="${jsUrl}"]`);
        if (existingScript) {
            logger.info('✅ [STATIC-ASSET] Game JS file already loaded', {
                gameId,
                jsUrl,
                loadTime: '0ms (already loaded)'
            });
            return;
        }

        // Create and monitor script tag
        const script = document.createElement('script');
        script.src = jsUrl;
        script.async = true;

        script.onload = () => {
            const loadTime = Date.now() - startTime;
            logger.info('✅ [STATIC-ASSET] Game JS file loaded successfully', {
                gameId,
                jsUrl,
                loadTime: `${loadTime}ms`,
                scriptSize: this.getScriptSize(script)
            });
        };

        script.onerror = (error) => {
            const loadTime = Date.now() - startTime;
            logger.error('❌ [STATIC-ASSET] Game JS file failed to load', {
                gameId,
                jsUrl,
                loadTime: `${loadTime}ms`,
                error: error.toString()
            });
        };

        // Add to document
        document.head.appendChild(script);

        logger.debug('🔄 [STATIC-ASSET] Game JS script tag added to document', {
            gameId,
            jsUrl
        });
    }

    // Get script size (approximate)
    private getScriptSize(script: HTMLScriptElement): string {
        try {
            // This is an approximation - actual size would need to be fetched
            return 'unknown';
        } catch (error) {
            return 'unknown';
        }
    }

    // Track CSS file loading
    trackCSSFile(cssUrl: string, gameId?: number): void {
        if (this.trackedAssets.has(cssUrl)) {
            logger.debug('♻️ [STATIC-ASSET] CSS file already tracked', { cssUrl });
            return;
        }

        this.trackedAssets.add(cssUrl);

        logger.info('🎨 [STATIC-ASSET] Tracking CSS file', {
            gameId,
            cssUrl,
            timestamp: new Date().toISOString()
        });

        fileLoadingLogger.trackStaticAsset(cssUrl, 'css');
    }

    // Track image file loading
    trackImageFile(imageUrl: string, gameId?: number): void {
        if (this.trackedAssets.has(imageUrl)) {
            logger.debug('♻️ [STATIC-ASSET] Image file already tracked', { imageUrl });
            return;
        }

        this.trackedAssets.add(imageUrl);

        logger.info('🖼️ [STATIC-ASSET] Tracking image file', {
            gameId,
            imageUrl,
            timestamp: new Date().toISOString()
        });

        fileLoadingLogger.trackStaticAsset(imageUrl, 'image');
    }

    // Track font file loading
    trackFontFile(fontUrl: string, gameId?: number): void {
        if (this.trackedAssets.has(fontUrl)) {
            logger.debug('♻️ [STATIC-ASSET] Font file already tracked', { fontUrl });
            return;
        }

        this.trackedAssets.add(fontUrl);

        logger.info('🔤 [STATIC-ASSET] Tracking font file', {
            gameId,
            fontUrl,
            timestamp: new Date().toISOString()
        });

        fileLoadingLogger.trackStaticAsset(fontUrl, 'font');
    }

    // Track audio file loading
    trackAudioFile(audioUrl: string, gameId?: number): void {
        if (this.trackedAssets.has(audioUrl)) {
            logger.debug('♻️ [STATIC-ASSET] Audio file already tracked', { audioUrl });
            return;
        }

        this.trackedAssets.add(audioUrl);

        logger.info('🔊 [STATIC-ASSET] Tracking audio file', {
            gameId,
            audioUrl,
            timestamp: new Date().toISOString()
        });

        fileLoadingLogger.trackStaticAsset(audioUrl, 'audio');
    }

    // Track all static assets for a game
    trackGameAssets(gameId: number): void {
        const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
        const buildVersion = process.env.BUILD_VERSION || Date.now().toString();

        logger.info('📦 [STATIC-ASSET] Starting comprehensive game asset tracking', {
            gameId,
            basePath,
            buildVersion,
            timestamp: new Date().toISOString()
        });

        // Track main JS file
        this.trackGameJSFile(gameId);

        // Disabled aggressive asset tracking to prevent 404 errors
        // The assets being tracked don't exist at these paths
        logger.debug('🚫 [STATIC-ASSET] Skipping asset tracking to prevent 404 errors', {
            gameId,
            reason: 'Assets at tracked paths do not exist'
        });

        // Track common CSS files - DISABLED
        // const commonCSSFiles = [
        //     `${basePath}/_next/static/css/`,
        //     `${basePath}/styles/`,
        //     `${basePath}/game-${gameId}/styles/`
        // ];
        // commonCSSFiles.forEach(cssPath => {
        //     this.trackCSSFile(cssPath, gameId);
        // });

        // Track common image directories - DISABLED
        // const commonImageDirs = [
        //     `${basePath}/static/images/`,
        //     `${basePath}/game-${gameId}/images/`,
        //     `${basePath}/chips/`,
        //     `${basePath}/icons/`
        // ];

        // commonImageDirs.forEach(imageDir => {
        //     this.trackImageFile(imageDir, gameId);
        // });

        // Track common font files - DISABLED
        // const commonFontFiles = [
        //     `${basePath}/fonts/`,
        //     `${basePath}/_next/static/fonts/`
        // ];
        // commonFontFiles.forEach(fontPath => {
        //     this.trackFontFile(fontPath, gameId);
        // });

        logger.info('✅ [STATIC-ASSET] Game asset tracking initiated (minimal)', {
            gameId,
            trackedAssets: this.trackedAssets.size,
            note: 'Only tracking JS file to prevent 404 errors'
        });
    }

    // Get tracking statistics
    getTrackingStatistics(): { totalTracked: number; trackedAssets: string[] } {
        return {
            totalTracked: this.trackedAssets.size,
            trackedAssets: Array.from(this.trackedAssets)
        };
    }

    // Clear tracking data
    clear(): void {
        this.trackedAssets.clear();
        logger.info('🧹 [STATIC-ASSET] Static asset tracking cleared');
    }
}

// Export singleton instance
export const staticAssetTracker = StaticAssetTracker.getInstance();
