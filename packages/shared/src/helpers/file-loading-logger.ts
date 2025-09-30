import { logger } from '../services/logger';

// File loading logger for tracking all client-server file interactions
class FileLoadingLogger {
    private static instance: FileLoadingLogger;
    private loadedFiles: Map<string, FileLoadInfo> = new Map();
    private loadingStartTimes: Map<string, number> = new Map();

    static getInstance(): FileLoadingLogger {
        if (!FileLoadingLogger.instance) {
            FileLoadingLogger.instance = new FileLoadingLogger();
        }
        return FileLoadingLogger.instance;
    }

    // Track static asset loading (CSS, JS, images, fonts, etc.)
    trackStaticAsset(url: string, type: 'css' | 'js' | 'image' | 'font' | 'audio' | 'video' | 'other' = 'other'): void {
        const startTime = Date.now();
        this.loadingStartTimes.set(url, startTime);

        logger.info('📁 [FILE-LOAD] Static asset loading started', {
            url,
            type,
            timestamp: new Date().toISOString()
        });

        // Track different types of static assets
        switch (type) {
            case 'css':
                this.trackCSSFile(url);
                break;
            case 'js':
                this.trackJSFile(url);
                break;
            case 'image':
                this.trackImageFile(url);
                break;
            case 'font':
                this.trackFontFile(url);
                break;
            case 'audio':
                this.trackAudioFile(url);
                break;
            case 'video':
                this.trackVideoFile(url);
                break;
            default:
                this.trackGenericFile(url);
        }
    }

    // Track CSS file loading
    private trackCSSFile(url: string): void {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = url;
        
        link.onload = () => {
            this.onFileLoadSuccess(url, 'css');
        };
        
        link.onerror = () => {
            this.onFileLoadError(url, 'css');
        };
        
        document.head.appendChild(link);
    }

    // Track JavaScript file loading
    private trackJSFile(url: string): void {
        const script = document.createElement('script');
        script.src = url;
        script.async = true;
        
        script.onload = () => {
            this.onFileLoadSuccess(url, 'js');
        };
        
        script.onerror = () => {
            this.onFileLoadError(url, 'js');
        };
        
        document.head.appendChild(script);
    }

    // Track image file loading
    private trackImageFile(url: string): void {
        const img = new Image();
        
        img.onload = () => {
            this.onFileLoadSuccess(url, 'image', {
                width: img.width,
                height: img.height,
                naturalWidth: img.naturalWidth,
                naturalHeight: img.naturalHeight
            });
        };
        
        img.onerror = () => {
            this.onFileLoadError(url, 'image');
        };
        
        img.src = url;
    }

    // Track font file loading
    private trackFontFile(url: string): void {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'font';
        link.type = 'font/woff2';
        link.crossOrigin = 'anonymous';
        link.href = url;
        
        link.onload = () => {
            this.onFileLoadSuccess(url, 'font');
        };
        
        link.onerror = () => {
            this.onFileLoadError(url, 'font');
        };
        
        document.head.appendChild(link);
    }

    // Track audio file loading
    private trackAudioFile(url: string): void {
        const audio = new Audio();
        
        audio.oncanplaythrough = () => {
            this.onFileLoadSuccess(url, 'audio', {
                duration: audio.duration,
                readyState: audio.readyState
            });
        };
        
        audio.onerror = () => {
            this.onFileLoadError(url, 'audio');
        };
        
        audio.src = url;
    }

    // Track video file loading
    private trackVideoFile(url: string): void {
        const video = document.createElement('video');
        
        video.oncanplaythrough = () => {
            this.onFileLoadSuccess(url, 'video', {
                duration: video.duration,
                videoWidth: video.videoWidth,
                videoHeight: video.videoHeight,
                readyState: video.readyState
            });
        };
        
        video.onerror = () => {
            this.onFileLoadError(url, 'video');
        };
        
        video.src = url;
    }

    // Track generic file loading
    private trackGenericFile(url: string): void {
        fetch(url, { method: 'HEAD' })
            .then(response => {
                if (response.ok) {
                    this.onFileLoadSuccess(url, 'other', {
                        status: response.status,
                        statusText: response.statusText,
                        contentType: response.headers.get('content-type'),
                        contentLength: response.headers.get('content-length')
                    });
                } else {
                    this.onFileLoadError(url, 'other', {
                        status: response.status,
                        statusText: response.statusText
                    });
                }
            })
            .catch(error => {
                this.onFileLoadError(url, 'other', { error: error.message });
            });
    }

    // Handle successful file load
    private onFileLoadSuccess(url: string, type: string, metadata?: any): void {
        const startTime = this.loadingStartTimes.get(url);
        const loadTime = startTime ? Date.now() - startTime : 0;
        
        const fileInfo: FileLoadInfo = {
            url,
            type,
            status: 'success',
            loadTime,
            timestamp: new Date().toISOString(),
            metadata
        };
        
        this.loadedFiles.set(url, fileInfo);
        this.loadingStartTimes.delete(url);
        
        logger.info('✅ [FILE-LOAD] File loaded successfully', {
            url,
            type,
            loadTime: `${loadTime}ms`,
            metadata
        });
    }

    // Handle file load error
    private onFileLoadError(url: string, type: string, error?: any): void {
        const startTime = this.loadingStartTimes.get(url);
        const loadTime = startTime ? Date.now() - startTime : 0;
        
        const fileInfo: FileLoadInfo = {
            url,
            type,
            status: 'error',
            loadTime,
            timestamp: new Date().toISOString(),
            error
        };
        
        this.loadedFiles.set(url, fileInfo);
        this.loadingStartTimes.delete(url);
        
        logger.error('❌ [FILE-LOAD] File failed to load', {
            url,
            type,
            loadTime: `${loadTime}ms`,
            error
        });
    }

    // Track API calls
    trackAPICall(url: string, method: string, payload?: any): void {
        const startTime = Date.now();
        this.loadingStartTimes.set(url, startTime);
        
        logger.info('🌐 [API-CALL] API request initiated', {
            url,
            method,
            payload,
            timestamp: new Date().toISOString()
        });
    }

    // Track API response
    trackAPIResponse(url: string, status: number, responseTime: number, responseData?: any): void {
        this.loadingStartTimes.delete(url);
        
        const apiInfo: FileLoadInfo = {
            url,
            type: 'api',
            status: status >= 200 && status < 300 ? 'success' : 'error',
            loadTime: responseTime,
            timestamp: new Date().toISOString(),
            metadata: {
                status,
                responseData: responseData ? JSON.stringify(responseData).substring(0, 200) : null
            }
        };
        
        this.loadedFiles.set(url, apiInfo);
        
        if (status >= 200 && status < 300) {
            logger.info('✅ [API-CALL] API request successful', {
                url,
                status,
                responseTime: `${responseTime}ms`,
                dataSize: responseData ? JSON.stringify(responseData).length : 0
            });
        } else {
            logger.error('❌ [API-CALL] API request failed', {
                url,
                status,
                responseTime: `${responseTime}ms`,
                responseData
            });
        }
    }

    // Track internationalization file loading
    trackI18nFile(namespace: string, language: string, url: string): void {
        const startTime = Date.now();
        this.loadingStartTimes.set(url, startTime);
        
        logger.info('🌍 [I18N-LOAD] Internationalization file loading', {
            namespace,
            language,
            url,
            timestamp: new Date().toISOString()
        });
    }

    // Track i18n file response
    trackI18nResponse(namespace: string, language: string, url: string, success: boolean, loadTime: number): void {
        this.loadingStartTimes.delete(url);
        
        const i18nInfo: FileLoadInfo = {
            url,
            type: 'i18n',
            status: success ? 'success' : 'error',
            loadTime,
            timestamp: new Date().toISOString(),
            metadata: {
                namespace,
                language
            }
        };
        
        this.loadedFiles.set(url, i18nInfo);
        
        if (success) {
            logger.info('✅ [I18N-LOAD] Internationalization file loaded', {
                namespace,
                language,
                url,
                loadTime: `${loadTime}ms`
            });
        } else {
            logger.error('❌ [I18N-LOAD] Internationalization file failed', {
                namespace,
                language,
                url,
                loadTime: `${loadTime}ms`
            });
        }
    }

    // Track WebSocket connections
    trackWebSocketConnection(url: string, protocol?: string): void {
        const startTime = Date.now();
        this.loadingStartTimes.set(url, startTime);
        
        logger.info('🔌 [WS-CONNECT] WebSocket connection initiated', {
            url,
            protocol,
            timestamp: new Date().toISOString()
        });
    }

    // Track WebSocket connection result
    trackWebSocketResult(url: string, success: boolean, loadTime: number): void {
        this.loadingStartTimes.delete(url);
        
        const wsInfo: FileLoadInfo = {
            url,
            type: 'websocket',
            status: success ? 'success' : 'error',
            loadTime,
            timestamp: new Date().toISOString()
        };
        
        this.loadedFiles.set(url, wsInfo);
        
        if (success) {
            logger.info('✅ [WS-CONNECT] WebSocket connected successfully', {
                url,
                loadTime: `${loadTime}ms`
            });
        } else {
            logger.error('❌ [WS-CONNECT] WebSocket connection failed', {
                url,
                loadTime: `${loadTime}ms`
            });
        }
    }

    // Get loading statistics
    getLoadingStatistics(): LoadingStatistics {
        const files = Array.from(this.loadedFiles.values());
        const successful = files.filter(f => f.status === 'success');
        const failed = files.filter(f => f.status === 'error');
        
        const totalLoadTime = files.reduce((sum, f) => sum + f.loadTime, 0);
        const averageLoadTime = files.length > 0 ? totalLoadTime / files.length : 0;
        
        const typeStats = files.reduce((stats, file) => {
            if (!stats[file.type]) {
                stats[file.type] = { total: 0, successful: 0, failed: 0, totalTime: 0 };
            }
            stats[file.type].total++;
            if (file.status === 'success') {
                stats[file.type].successful++;
            } else {
                stats[file.type].failed++;
            }
            stats[file.type].totalTime += file.loadTime;
            return stats;
        }, {} as Record<string, TypeStatistics>);
        
        return {
            totalFiles: files.length,
            successfulFiles: successful.length,
            failedFiles: failed.length,
            successRate: files.length > 0 ? (successful.length / files.length) * 100 : 0,
            totalLoadTime,
            averageLoadTime,
            typeStatistics: typeStats
        };
    }

    // Get detailed file information
    getFileInfo(url: string): FileLoadInfo | undefined {
        return this.loadedFiles.get(url);
    }

    // Get all loaded files
    getAllFiles(): FileLoadInfo[] {
        return Array.from(this.loadedFiles.values());
    }

    // Clear all tracking data
    clear(): void {
        this.loadedFiles.clear();
        this.loadingStartTimes.clear();
        logger.info('🧹 [FILE-LOAD] File loading tracking cleared');
    }
}

// Types
interface FileLoadInfo {
    url: string;
    type: string;
    status: 'success' | 'error';
    loadTime: number;
    timestamp: string;
    metadata?: any;
    error?: any;
}

interface TypeStatistics {
    total: number;
    successful: number;
    failed: number;
    totalTime: number;
}

interface LoadingStatistics {
    totalFiles: number;
    successfulFiles: number;
    failedFiles: number;
    successRate: number;
    totalLoadTime: number;
    averageLoadTime: number;
    typeStatistics: Record<string, TypeStatistics>;
}

// Export singleton instance
export const fileLoadingLogger = FileLoadingLogger.getInstance();
export type { FileLoadInfo, LoadingStatistics, TypeStatistics };



