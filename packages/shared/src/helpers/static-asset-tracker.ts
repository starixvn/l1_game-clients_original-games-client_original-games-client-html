
// Static asset tracker for monitoring all client-server file interactions
class StaticAssetTracker {
    private static instance: StaticAssetTracker;
    private readonly trackedAssets: Set<string> = new Set();

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
            return;
        }

        this.trackedAssets.add(jsUrl);

        // Also track via script tag monitoring
        this.monitorScriptTag(jsUrl, gameId);
    }

    // Monitor script tag loading
    private monitorScriptTag(jsUrl: string, gameId: number): void {
        const startTime = Date.now();

        // Check if script is already loaded
        const existingScript = document.querySelector(`script[src="${jsUrl}"]`);
        if (existingScript) {
            return;
        }

        // Create and monitor script tag
        const script = document.createElement("script");
        script.src = jsUrl;
        script.async = true;

        // Add to document
        document.head.appendChild(script);
    }

    // Track CSS file loading
    trackCSSFile(cssUrl: string, gameId?: number): void {
        if (this.trackedAssets.has(cssUrl)) {
            return;
        }

        this.trackedAssets.add(cssUrl);
    }

    // Track image file loading
    trackImageFile(imageUrl: string, gameId?: number): void {
        if (this.trackedAssets.has(imageUrl)) {
            return;
        }

        this.trackedAssets.add(imageUrl);
    }

    // Track font file loading
    trackFontFile(fontUrl: string, gameId?: number): void {
        if (this.trackedAssets.has(fontUrl)) {
            return;
        }

        this.trackedAssets.add(fontUrl);
    }

    // Track audio file loading
    trackAudioFile(audioUrl: string, gameId?: number): void {
        if (this.trackedAssets.has(audioUrl)) {
            return;
        }

        this.trackedAssets.add(audioUrl);
    }

    // Track all static assets for a game
    trackGameAssets(gameId: number): void {
        // Track main JS file
        this.trackGameJSFile(gameId);
    }

    // Get tracking statistics
    getTrackingStatistics(): { totalTracked: number; trackedAssets: string[] } {
        return {
            totalTracked: this.trackedAssets.size,
            trackedAssets: Array.from(this.trackedAssets),
        };
    }

    // Clear tracking data
    clear(): void {
        this.trackedAssets.clear();
    }
}

// Export singleton instance
export const staticAssetTracker = StaticAssetTracker.getInstance();
