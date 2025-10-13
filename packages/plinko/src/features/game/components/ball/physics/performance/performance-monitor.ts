/**
 * Performance Monitor Module
 * Monitors and analyzes physics performance metrics
 */


/**
 * Performance metrics interface
 */
export interface PerformanceMetrics {
    fps: number;
    frameTime: number; // milliseconds
    physicsTime: number; // milliseconds
    collisionCount: number;
    activeBodies: number;
    memoryUsage: number; // MB
    timestamp: number;
}

/**
 * Performance thresholds
 */
export const PERFORMANCE_THRESHOLDS = {
    TARGET_FPS: 60,
    MAX_FRAME_TIME: 16.67, // 60 FPS
    MAX_PHYSICS_TIME: 8, // 8ms budget for physics
    MAX_COLLISIONS_PER_FRAME: 50,
    WARNING_MEMORY_USAGE: 100, // MB
    CRITICAL_MEMORY_USAGE: 200, // MB
};

/**
 * Performance monitor class
 */
export class PerformanceMonitor {
    private metrics: PerformanceMetrics[] = [];
    private maxHistorySize = 100;
    private lastFrameTime = 0;
    private frameCount = 0;
    private physicsStartTime = 0;

    /**
     * Start physics performance measurement
     */
    startPhysicsMeasurement(): void {
        this.physicsStartTime = performance.now();
    }

    /**
     * End physics performance measurement
     */
    endPhysicsMeasurement(collisionCount: number, activeBodies: number): void {
        const physicsEndTime = performance.now();
        const physicsTime = physicsEndTime - this.physicsStartTime;

        // Estimate memory usage (rough approximation)
        const memoryUsage = this.estimateMemoryUsage(activeBodies, collisionCount);

        const metrics: PerformanceMetrics = {
            fps: this.calculateFPS(),
            frameTime: this.calculateFrameTime(),
            physicsTime,
            collisionCount,
            activeBodies,
            memoryUsage,
            timestamp: Date.now(),
        };

        this.metrics.push(metrics);

        // Maintain history size
        if (this.metrics.length > this.maxHistorySize) {
            this.metrics.shift();
        }
    }

    /**
     * Update frame timing
     */
    updateFrameTiming(): void {
        const currentTime = performance.now();
        if (this.lastFrameTime > 0) {
            this.frameCount++;
        }
        this.lastFrameTime = currentTime;
    }

    /**
     * Calculate current FPS
     */
    private calculateFPS(): number {
        if (this.metrics.length < 2) { return 60; }

        const recentMetrics = this.metrics.slice(-10); // Last 10 frames
        const timeSpan = recentMetrics[recentMetrics.length - 1].timestamp - recentMetrics[0].timestamp;
        const frameCount = recentMetrics.length;

        return (frameCount / timeSpan) * 1000;
    }

    /**
     * Calculate average frame time
     */
    private calculateFrameTime(): number {
        if (this.metrics.length < 2) { return 16.67; }

        const recentMetrics = this.metrics.slice(-10);
        const totalFrameTime = recentMetrics.reduce((sum, metric) => sum + metric.frameTime, 0);

        return totalFrameTime / recentMetrics.length;
    }

    /**
     * Estimate memory usage
     */
    private estimateMemoryUsage(activeBodies: number, collisionCount: number): number {
        // Rough estimation based on typical usage patterns
        const baseMemory = 50; // MB base usage
        const bodyMemory = activeBodies * 0.5; // ~0.5MB per body
        const collisionMemory = collisionCount * 0.1; // ~0.1MB per collision

        return baseMemory + bodyMemory + collisionMemory;
    }

    /**
     * Get current performance metrics
     */
    getCurrentMetrics(): PerformanceMetrics | null {
        return this.metrics.length > 0 ? this.metrics[this.metrics.length - 1] : null;
    }

    /**
     * Get performance statistics
     */
    getPerformanceStats(): {
        averageFPS: number;
        averageFrameTime: number;
        averagePhysicsTime: number;
        maxFrameTime: number;
        maxPhysicsTime: number;
        averageCollisionsPerFrame: number;
        averageActiveBodies: number;
        performanceScore: number; // 0-100 scale
    } {
        if (this.metrics.length === 0) {
            return {
                averageFPS: 60,
                averageFrameTime: 16.67,
                averagePhysicsTime: 5,
                maxFrameTime: 16.67,
                maxPhysicsTime: 5,
                averageCollisionsPerFrame: 10,
                averageActiveBodies: 20,
                performanceScore: 100,
            };
        }

        const recentMetrics = this.metrics.slice(-20); // Last 20 measurements

        const averageFPS = recentMetrics.reduce((sum, m) => sum + m.fps, 0) / recentMetrics.length;
        const averageFrameTime = recentMetrics.reduce((sum, m) => sum + m.frameTime, 0) / recentMetrics.length;
        const averagePhysicsTime = recentMetrics.reduce((sum, m) => sum + m.physicsTime, 0) / recentMetrics.length;
        const maxFrameTime = Math.max(...recentMetrics.map(m => m.frameTime));
        const maxPhysicsTime = Math.max(...recentMetrics.map(m => m.physicsTime));
        const averageCollisionsPerFrame = recentMetrics.reduce((sum, m) => sum + m.collisionCount, 0) / recentMetrics.length;
        const averageActiveBodies = recentMetrics.reduce((sum, m) => sum + m.activeBodies, 0) / recentMetrics.length;

        // Calculate performance score (0-100)
        let score = 100;

        // FPS penalty
        if (averageFPS < 50) { score -= 30; }
        else if (averageFPS < 55) { score -= 15; }

        // Frame time penalty
        if (averageFrameTime > 20) { score -= 20; }
        else if (averageFrameTime > 18) { score -= 10; }

        // Physics time penalty
        if (averagePhysicsTime > 10) { score -= 25; }
        else if (averagePhysicsTime > 8) { score -= 10; }

        // Collision count penalty
        if (averageCollisionsPerFrame > 40) { score -= 15; }
        else if (averageCollisionsPerFrame > 30) { score -= 5; }

        const performanceScore = Math.max(0, Math.min(100, score));

        return {
            averageFPS,
            averageFrameTime,
            averagePhysicsTime,
            maxFrameTime,
            maxPhysicsTime,
            averageCollisionsPerFrame,
            averageActiveBodies,
            performanceScore,
        };
    }

    /**
     * Check if performance is within acceptable thresholds
     */
    checkPerformanceHealth(): {
        isHealthy: boolean;
        issues: string[];
        recommendations: string[];
    } {
        const current = this.getCurrentMetrics();
        const issues: string[] = [];
        const recommendations: string[] = [];

        if (!current) {
            return { isHealthy: true, issues: [], recommendations: [] };
        }

        // FPS checks
        if (current.fps < PERFORMANCE_THRESHOLDS.TARGET_FPS * 0.8) {
            issues.push(`Low FPS: ${current.fps.toFixed(1)} (target: ${PERFORMANCE_THRESHOLDS.TARGET_FPS})`);
            recommendations.push('Reduce active balls or decrease physics complexity');
        }

        // Frame time checks
        if (current.frameTime > PERFORMANCE_THRESHOLDS.MAX_FRAME_TIME * 1.5) {
            issues.push(`High frame time: ${current.frameTime.toFixed(2)}ms`);
            recommendations.push('Optimize collision detection or reduce physics iterations');
        }

        // Physics time checks
        if (current.physicsTime > PERFORMANCE_THRESHOLDS.MAX_PHYSICS_TIME * 2) {
            issues.push(`High physics time: ${current.physicsTime.toFixed(2)}ms`);
            recommendations.push('Implement spatial partitioning or reduce collision checks');
        }

        // Collision count checks
        if (current.collisionCount > PERFORMANCE_THRESHOLDS.MAX_COLLISIONS_PER_FRAME * 2) {
            issues.push(`High collision count: ${current.collisionCount}`);
            recommendations.push('Increase collision cooldown or reduce ball density');
        }

        // Memory checks
        if (current.memoryUsage > PERFORMANCE_THRESHOLDS.CRITICAL_MEMORY_USAGE) {
            issues.push(`Critical memory usage: ${current.memoryUsage.toFixed(1)}MB`);
            recommendations.push('Implement object pooling and reduce data retention');
        } else if (current.memoryUsage > PERFORMANCE_THRESHOLDS.WARNING_MEMORY_USAGE) {
            issues.push(`High memory usage: ${current.memoryUsage.toFixed(1)}MB`);
            recommendations.push('Monitor memory usage and consider optimization');
        }

        const isHealthy = issues.length === 0;

        return {
            isHealthy,
            issues,
            recommendations,
        };
    }

    /**
     * Get performance history
     */
    getPerformanceHistory(): PerformanceMetrics[] {
        return [...this.metrics];
    }

    /**
     * Clear performance history
     */
    clearHistory(): void {
        this.metrics = [];
        this.frameCount = 0;
        this.lastFrameTime = 0;
    }

    /**
     * Set maximum history size
     */
    setMaxHistorySize(size: number): void {
        this.maxHistorySize = size;

        // Trim existing history if needed
        if (this.metrics.length > this.maxHistorySize) {
            this.metrics = this.metrics.slice(-this.maxHistorySize);
        }
    }

    /**
     * Export performance data for analysis
     */
    exportPerformanceData(): {
        summary: ReturnType<typeof this.getPerformanceStats>;
        health: ReturnType<typeof this.checkPerformanceHealth>;
        history: PerformanceMetrics[];
    } {
        return {
            summary: this.getPerformanceStats(),
            health: this.checkPerformanceHealth(),
            history: this.getPerformanceHistory(),
        };
    }
}

/**
 * Create performance monitor with custom settings
 */
export function createPerformanceMonitor(maxHistorySize = 100): PerformanceMonitor {
    const monitor = new PerformanceMonitor();
    monitor.setMaxHistorySize(maxHistorySize);
    return monitor;
}

/**
 * Performance benchmarking utility
 */
export class PerformanceBenchmarker {
    private readonly monitor: PerformanceMonitor;
    private readonly benchmarks: Map<string, {
        startTime: number;
        measurements: number[];
    }> = new Map();

    constructor(monitor: PerformanceMonitor) {
        this.monitor = monitor;
    }

    /**
     * Start a benchmark
     */
    startBenchmark(name: string): void {
        this.benchmarks.set(name, {
            startTime: performance.now(),
            measurements: [],
        });
    }

    /**
     * End a benchmark and record measurement
     */
    endBenchmark(name: string): number {
        const benchmark = this.benchmarks.get(name);
        if (!benchmark) { return 0; }

        const endTime = performance.now();
        const duration = endTime - benchmark.startTime;

        benchmark.measurements.push(duration);

        // Keep only last 10 measurements
        if (benchmark.measurements.length > 10) {
            benchmark.measurements.shift();
        }

        return duration;
    }

    /**
     * Get benchmark statistics
     */
    getBenchmarkStats(name: string): {
        averageTime: number;
        minTime: number;
        maxTime: number;
        measurementCount: number;
    } | null {
        const benchmark = this.benchmarks.get(name);
        if (!benchmark || benchmark.measurements.length === 0) { return null; }

        const measurements = benchmark.measurements;
        const averageTime = measurements.reduce((sum, time) => sum + time, 0) / measurements.length;
        const minTime = Math.min(...measurements);
        const maxTime = Math.max(...measurements);

        return {
            averageTime,
            minTime,
            maxTime,
            measurementCount: measurements.length,
        };
    }

    /**
     * Get all benchmark names
     */
    getBenchmarkNames(): string[] {
        return Array.from(this.benchmarks.keys());
    }

    /**
     * Clear all benchmarks
     */
    clearBenchmarks(): void {
        this.benchmarks.clear();
    }
}

/**
 * Performance alert system
 */
type AlertType = 'warning' | 'error' | 'info';
export class PerformanceAlertSystem {
    private alerts: Array<{
        timestamp: number;
        type: AlertType;
        message: string;
        metrics: PerformanceMetrics;
    }> = [];
    private readonly maxAlerts = 50;

    /**
     * Check for performance issues and create alerts
     */
    checkAndAlert(monitor: PerformanceMonitor): void {
        const health = monitor.checkPerformanceHealth();
        const currentMetrics = monitor.getCurrentMetrics();

        if (!currentMetrics) { return; }

        // Create alerts for issues
        health.issues.forEach(issue => {
            this.addAlert('warning', `Performance Issue: ${issue}`, currentMetrics);
        });

        // Critical alerts
        if (currentMetrics.fps < 30) {
            this.addAlert('error', `Critical FPS drop: ${currentMetrics.fps.toFixed(1)}`, currentMetrics);
        }

        if (currentMetrics.frameTime > 33) { // 30 FPS threshold
            this.addAlert('error', `Critical frame time: ${currentMetrics.frameTime.toFixed(2)}ms`, currentMetrics);
        }

        if (currentMetrics.memoryUsage > PERFORMANCE_THRESHOLDS.CRITICAL_MEMORY_USAGE) {
            this.addAlert('error', `Critical memory usage: ${currentMetrics.memoryUsage.toFixed(1)}MB`, currentMetrics);
        }
    }

    /**
     * Add an alert
     */
    private addAlert(type: 'warning' | 'error' | 'info', message: string, metrics: PerformanceMetrics): void {
        this.alerts.push({
            timestamp: Date.now(),
            type,
            message,
            metrics,
        });

        // Maintain alert history size
        if (this.alerts.length > this.maxAlerts) {
            this.alerts.shift();
        }
    }

    /**
     * Get recent alerts
     */
    getRecentAlerts(count = 10): Array<{
        timestamp: number;
        type: 'warning' | 'error' | 'info';
        message: string;
        metrics: PerformanceMetrics;
    }> {
        return this.alerts.slice(-count);
    }

    /**
     * Get alert statistics
     */
    getAlertStats(): {
        totalAlerts: number;
        errorCount: number;
        warningCount: number;
        infoCount: number;
        mostRecentAlert: number; // timestamp
    } {
        const errorCount = this.alerts.filter(a => a.type === 'error').length;
        const warningCount = this.alerts.filter(a => a.type === 'warning').length;
        const infoCount = this.alerts.filter(a => a.type === 'info').length;

        const mostRecentAlert = this.alerts.length > 0
            ? this.alerts[this.alerts.length - 1].timestamp
            : 0;

        return {
            totalAlerts: this.alerts.length,
            errorCount,
            warningCount,
            infoCount,
            mostRecentAlert,
        };
    }

    /**
     * Clear alerts
     */
    clearAlerts(): void {
        this.alerts = [];
    }
}
