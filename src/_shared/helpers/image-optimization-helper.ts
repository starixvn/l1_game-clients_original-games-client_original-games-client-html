// Image Optimization Helper for compression and format conversion
type ImageFormat = 'webp' | 'avif' | 'jpeg' | 'png';

interface ImageOptimizationOptions {
    quality?: number;
    format?: ImageFormat;
    width?: number;
    height?: number;
    compression?: 'lossy' | 'lossless';
}

interface OptimizedImageInfo {
    originalSize: number;
    optimizedSize: number;
    compressionRatio: number;
    format: string;
    url: string;
}

class ImageOptimizationHelper {
    private static instance: ImageOptimizationHelper;
    private readonly canvas: HTMLCanvasElement | null = null;
    private readonly ctx: CanvasRenderingContext2D | null = null;

    private constructor() {
        if (typeof window !== 'undefined') {
            this.canvas = document.createElement('canvas');
            this.ctx = this.canvas.getContext('2d');
        }
    }

    static getInstance(): ImageOptimizationHelper {
        if (!ImageOptimizationHelper.instance) {
            ImageOptimizationHelper.instance = new ImageOptimizationHelper();
        }
        return ImageOptimizationHelper.instance;
    }

    // Check if WebP is supported
    isWebPSupported(): boolean {
        if (typeof window === 'undefined') {
            return false;
        }

        const canvas = document.createElement('canvas');
        canvas.width = 1;
        canvas.height = 1;
        return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    }

    // Check if AVIF is supported
    isAVIFSupported(): boolean {
        if (typeof window === 'undefined') {
            return false;
        }

        const canvas = document.createElement('canvas');
        canvas.width = 1;
        canvas.height = 1;
        return canvas.toDataURL('image/avif').indexOf('data:image/avif') === 0;
    }

    // Get optimal format based on browser support
    getOptimalFormat(): ImageFormat {
        if (this.isAVIFSupported()) return 'avif';
        if (this.isWebPSupported()) return 'webp';
        return 'jpeg';
    }

    // Optimize image URL with format and quality parameters
    optimizeImageUrl(url: string, options: ImageOptimizationOptions = {}): string {
        const { quality = 85, format, width, height } = options;

        // For local images, return as-is (server-side optimization would be needed)
        return url;
    }

    // Create responsive image URLs
    createResponsiveImageUrls(baseUrl: string, sizes: number[]): string[] {
        return sizes.map(size => this.optimizeImageUrl(baseUrl, { width: size }));
    }

    // Optimize image data using canvas
    async optimizeImageData(
        imageData: ImageData,
        options: ImageOptimizationOptions = {}
    ): Promise<OptimizedImageInfo> {
        if (!this.canvas || !this.ctx) {
            throw new Error('Canvas not available');
        }

        const { quality = 85, format = 'webp', width, height } = options;

        // Set canvas dimensions
        this.canvas.width = width || imageData.width;
        this.canvas.height = height || imageData.height;

        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Create temporary canvas for image data
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = imageData.width;
        tempCanvas.height = imageData.height;
        const tempCtx = tempCanvas.getContext('2d');
        if (!tempCtx) {
            throw new Error('Canvas 2D context not available');
        }
        tempCtx.putImageData(imageData, 0, 0);

        // Draw and scale if needed
        this.ctx.drawImage(tempCanvas, 0, 0, this.canvas.width, this.canvas.height);

        // Convert to optimized format
        const mimeType = `image/${format}`;
        const optimizedDataUrl = this.canvas.toDataURL(mimeType, quality / 100);

        // Calculate sizes
        const originalSize = imageData.data.length;
        const optimizedSize = Math.ceil(optimizedDataUrl.length * 0.75); // Base64 is ~33% larger
        const compressionRatio = ((originalSize - optimizedSize) / originalSize) * 100;

        return {
            originalSize,
            optimizedSize,
            compressionRatio: Math.round(compressionRatio),
            format,
            url: optimizedDataUrl
        };
    }

    // Preload optimized images
    async preloadOptimizedImages(
        imageUrls: string[],
        options: ImageOptimizationOptions = {}
    ): Promise<void> {
        const optimalFormat = this.getOptimalFormat();
        const optimizedUrls = imageUrls.map(url =>
            this.optimizeImageUrl(url, { ...options, format: optimalFormat })
        );

        console.log(`[ImageOptimization] Preloading ${optimizedUrls.length} optimized images with format: ${optimalFormat}`);

        const promises = optimizedUrls.map(url => this.preloadImage(url));
        await Promise.all(promises);
    }

    // Preload single image
    private preloadImage(url: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve();
            img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
            img.src = url;
        });
    }

    // Get image dimensions
    async getImageDimensions(url: string): Promise<{ width: number; height: number }> {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                resolve({ width: img.naturalWidth, height: img.naturalHeight });
            };
            img.onerror = () => reject(new Error(`Failed to get dimensions for: ${url}`));
            img.src = url;
        });
    }

    // Calculate optimal quality based on image size
    calculateOptimalQuality(width: number, height: number): number {
        const totalPixels = width * height;

        if (totalPixels > 2000000) {
            return 75; // Large images
        }
        if (totalPixels > 500000) {
            return 80;  // Medium images
        }
        return 85; // Small images
    }

    // Generate srcset for responsive images
    generateSrcSet(baseUrl: string, sizes: number[]): string {
        const optimalFormat = this.getOptimalFormat();

        return sizes
            .map(size => {
                const optimizedUrl = this.optimizeImageUrl(baseUrl, {
                    width: size,
                    format: optimalFormat
                });
                return `${optimizedUrl} ${size}w`;
            })
            .join(', ');
    }

    // Get compression statistics
    getCompressionStats(originalUrls: string[], optimizedUrls: string[]): {
        totalOriginalSize: number;
        totalOptimizedSize: number;
        averageCompressionRatio: number;
        formatUsed: string;
    } {
        // This is a simplified calculation - in real implementation, 
        // you'd need to actually measure file sizes
        const formatUsed = this.getOptimalFormat();
        const estimatedCompressionRatio = formatUsed === 'avif' ? 50 :
            formatUsed === 'webp' ? 30 : 10;

        return {
            totalOriginalSize: originalUrls.length * 100000, // Estimated
            totalOptimizedSize: Math.round(originalUrls.length * 100000 * (1 - estimatedCompressionRatio / 100)),
            averageCompressionRatio: estimatedCompressionRatio,
            formatUsed
        };
    }
}

// Export singleton instance
export const imageOptimizationHelper = ImageOptimizationHelper.getInstance();

// Utility functions
export const optimizeImageUrl = (url: string, options?: ImageOptimizationOptions): string => {
    return imageOptimizationHelper.optimizeImageUrl(url, options);
};

export const createResponsiveImageUrls = (baseUrl: string, sizes: number[]): string[] => {
    return imageOptimizationHelper.createResponsiveImageUrls(baseUrl, sizes);
};

export const getOptimalFormat = (): string => {
    return imageOptimizationHelper.getOptimalFormat();
};

export const isWebPSupported = (): boolean => {
    return imageOptimizationHelper.isWebPSupported();
};

export const isAVIFSupported = (): boolean => {
    return imageOptimizationHelper.isAVIFSupported();
};

export default imageOptimizationHelper;
