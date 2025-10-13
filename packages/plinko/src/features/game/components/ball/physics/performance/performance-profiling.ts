/**
 * Performance Profiling Module
 * Advanced performance profiling and analysis tools
 */

import { PhysicsFactors } from '../factors/core-factors';
import { PerformanceMetrics } from './performance-monitor';

/**
 * Profiling session interface
 */
export interface ProfilingSession {
    id: string;
    startTime: number;
    endTime?: number;
    duration: number;
    physicsFactors: PhysicsFactors;
    metrics: PerformanceMetrics[];
    events: ProfilingEvent[];
    metadata: Record<string, any>;
}

/**
 * Profiling event interface
 */
type ProfilingEventType = 'collision' | 'optimization' | 'adaptation' | 'error' | 'custom';
export interface ProfilingEvent {
    timestamp: number;
    type: ProfilingEventType;
    data: Record<string, any>;
    duration?: number;
}

/**
 * Performance profiler class
 */
export class PerformanceProfiler {
    private readonly sessions: Map<string, ProfilingSession> = new Map();
    private currentSession: ProfilingSession | null = null;
    private eventBuffer: ProfilingEvent[] = [];
    private readonly maxEventBufferSize = 1000;

    /**
     * Start a new profiling session
     */
    startSession(
        physicsFactors: PhysicsFactors,
        metadata: Record<string, any> = {}
    ): string {
        const sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`; // NOSONAR
        const startTime = performance.now();

        const session: ProfilingSession = {
            id: sessionId,
            startTime,
            duration: 0,
            physicsFactors: { ...physicsFactors },
            metrics: [],
            events: [],
            metadata,
        };

        this.sessions.set(sessionId, session);
        this.currentSession = session;

        this.recordEvent('custom', { type: 'session_start', sessionId }, 0);

        return sessionId;
    }

    /**
     * End the current profiling session
     */
    endSession(): ProfilingSession | null {
        if (!this.currentSession) { return null; }

        const endTime = performance.now();
        this.currentSession.endTime = endTime;
        this.currentSession.duration = endTime - this.currentSession.startTime;

        // Add buffered events to session
        this.currentSession.events = [...this.eventBuffer];
        this.eventBuffer = [];

        this.recordEvent('custom', {
            type: 'session_end',
            sessionId: this.currentSession.id,
            duration: this.currentSession.duration
        }, 0);

        const completedSession = { ...this.currentSession };
        this.currentSession = null;

        return completedSession;
    }

    /**
     * Record a profiling event
     */
    recordEvent(
        type: ProfilingEvent['type'],
        data: Record<string, any>,
        duration?: number
    ): void {
        const event: ProfilingEvent = {
            timestamp: performance.now(),
            type,
            data,
            duration,
        };

        this.eventBuffer.push(event);

        // Maintain buffer size
        if (this.eventBuffer.length > this.maxEventBufferSize) {
            this.eventBuffer.shift();
        }

        // Add to current session if active
        if (this.currentSession) {
            this.currentSession.events.push(event);
        }
    }

    /**
     * Record performance metrics
     */
    recordMetrics(metrics: PerformanceMetrics): void {
        if (this.currentSession) {
            this.currentSession.metrics.push(metrics);
        }
    }

    /**
     * Get current session
     */
    getCurrentSession(): ProfilingSession | null {
        return this.currentSession;
    }

    /**
     * Get session by ID
     */
    getSession(sessionId: string): ProfilingSession | null {
        return this.sessions.get(sessionId) || null;
    }

    /**
     * Get all sessions
     */
    getAllSessions(): ProfilingSession[] {
        return Array.from(this.sessions.values());
    }

    /**
     * Analyze session performance
     */
    analyzeSession(sessionId: string): SessionAnalysis | null {
        const session = this.sessions.get(sessionId);
        if (!session) { return null; }

        return this.analyzeSessionData(session);
    }

    /**
     * Analyze session data
     */
    private analyzeSessionData(session: ProfilingSession): SessionAnalysis {
        const metrics = session.metrics;
        const events = session.events;

        // Basic metrics analysis
        const fpsStats = this.calculateStats(metrics.map(m => m.fps));
        const frameTimeStats = this.calculateStats(metrics.map(m => m.frameTime));
        const physicsTimeStats = this.calculateStats(metrics.map(m => m.physicsTime));
        const collisionStats = this.calculateStats(metrics.map(m => m.collisionCount));

        // Event analysis
        const eventCounts = events.reduce((counts, event) => {
            counts[event.type] = (counts[event.type] || 0) + 1;
            return counts;
        }, {} as Record<string, number>);

        // Performance bottlenecks
        const bottlenecks = this.identifyBottlenecks(metrics, events);

        // Recommendations
        const recommendations = this.generateRecommendations(metrics, events, session.physicsFactors);

        return {
            sessionId: session.id,
            duration: session.duration,
            metrics: {
                fps: fpsStats,
                frameTime: frameTimeStats,
                physicsTime: physicsTimeStats,
                collisions: collisionStats,
            },
            events: {
                totalCount: events.length,
                typeBreakdown: eventCounts,
                mostFrequentEvent: Object.keys(eventCounts).reduce((a, b) =>
                    eventCounts[a] > eventCounts[b] ? a : b, ''
                ),
            },
            bottlenecks,
            recommendations,
            physicsFactors: session.physicsFactors,
            metadata: session.metadata,
        };
    }

    /**
     * Calculate statistical measures
     */
    private calculateStats(values: number[]): {
        count: number;
        average: number;
        min: number;
        max: number;
        median: number;
        standardDeviation: number;
        percentiles: { p50: number; p95: number; p99: number };
    } {
        if (values.length === 0) {
            return {
                count: 0,
                average: 0,
                min: 0,
                max: 0,
                median: 0,
                standardDeviation: 0,
                percentiles: { p50: 0, p95: 0, p99: 0 },
            };
        }

        const sorted = [...values].sort((a, b) => a - b);
        const sum = values.reduce((a, b) => a + b, 0);
        const average = sum / values.length;

        const variance = values.reduce((acc, val) => acc + Math.pow(val - average, 2), 0) / values.length;
        const standardDeviation = Math.sqrt(variance);

        return {
            count: values.length,
            average,
            min: Math.min(...values),
            max: Math.max(...values),
            median: sorted[Math.floor(sorted.length / 2)],
            standardDeviation,
            percentiles: {
                p50: sorted[Math.floor(sorted.length * 0.5)],
                p95: sorted[Math.floor(sorted.length * 0.95)],
                p99: sorted[Math.floor(sorted.length * 0.99)],
            },
        };
    }

    /**
     * Identify performance bottlenecks
     */
    private identifyBottlenecks(metrics: PerformanceMetrics[], events: ProfilingEvent[]): string[] {
        const bottlenecks: string[] = [];

        if (metrics.length === 0) { return bottlenecks; }

        const avgFPS = metrics.reduce((sum, m) => sum + m.fps, 0) / metrics.length;
        const avgFrameTime = metrics.reduce((sum, m) => sum + m.frameTime, 0) / metrics.length;
        const avgPhysicsTime = metrics.reduce((sum, m) => sum + m.physicsTime, 0) / metrics.length;
        const avgCollisions = metrics.reduce((sum, m) => sum + m.collisionCount, 0) / metrics.length;

        if (avgFPS < 45) { bottlenecks.push('Low FPS'); }
        if (avgFrameTime > 22) { bottlenecks.push('High frame time'); }
        if (avgPhysicsTime > 10) { bottlenecks.push('High physics calculation time'); }
        if (avgCollisions > 40) { bottlenecks.push('High collision count'); }

        // Check for collision spikes
        const collisionSpikes = metrics.filter(m => m.collisionCount > 60).length;
        if (collisionSpikes > metrics.length * 0.1) {
            bottlenecks.push('Collision spikes');
        }

        return bottlenecks;
    }

    /**
     * Generate performance recommendations
     */
    private generateRecommendations(
        metrics: PerformanceMetrics[],
        events: ProfilingEvent[],
        physicsFactors: PhysicsFactors
    ): string[] {
        const recommendations: string[] = [];

        if (metrics.length === 0) { return recommendations; }

        const avgFPS = metrics.reduce((sum, m) => sum + m.fps, 0) / metrics.length;
        const avgCollisions = metrics.reduce((sum, m) => sum + m.collisionCount, 0) / metrics.length;

        if (avgFPS < 50) {
            recommendations.push('Consider reducing active balls or implementing level-of-detail rendering');
        }

        if (avgCollisions > 30) {
            recommendations.push('Increase collision cooldown or implement spatial partitioning');
        }

        if (physicsFactors.airResistanceCoefficient > 0.05) {
            recommendations.push('Consider reducing air resistance coefficient for better performance');
        }

        if (physicsFactors.randomFactor > 0.15) {
            recommendations.push('High randomness may impact performance - consider reducing for critical paths');
        }

        return recommendations;
    }

    /**
     * Export profiling data
     */
    exportData(): {
        sessions: ProfilingSession[];
        summary: {
            totalSessions: number;
            totalEvents: number;
            averageSessionDuration: number;
        };
    } {
        const sessions = this.getAllSessions();
        const totalEvents = sessions.reduce((sum, session) => sum + session.events.length, 0);
        const averageSessionDuration = sessions.length > 0
            ? sessions.reduce((sum, session) => sum + session.duration, 0) / sessions.length
            : 0;

        return {
            sessions,
            summary: {
                totalSessions: sessions.length,
                totalEvents,
                averageSessionDuration,
            },
        };
    }

    /**
     * Clear all profiling data
     */
    clear(): void {
        this.sessions.clear();
        this.eventBuffer = [];
        this.currentSession = null;
    }
}

/**
 * Session analysis interface
 */
export interface SessionAnalysis {
    sessionId: string;
    duration: number;
    metrics: {
        fps: StatsResult;
        frameTime: StatsResult;
        physicsTime: StatsResult;
        collisions: StatsResult;
    };
    events: {
        totalCount: number;
        typeBreakdown: Record<string, number>;
        mostFrequentEvent: string;
    };
    bottlenecks: string[];
    recommendations: string[];
    physicsFactors: PhysicsFactors;
    metadata: Record<string, any>;
}

/**
 * Statistics result interface
 */
export interface StatsResult {
    count: number;
    average: number;
    min: number;
    max: number;
    median: number;
    standardDeviation: number;
    percentiles: { p50: number; p95: number; p99: number };
}

/**
 * Comparative performance analysis
 */
export class ComparativePerformanceAnalyzer {
    private readonly profiler: PerformanceProfiler;

    constructor(profiler: PerformanceProfiler) {
        this.profiler = profiler;
    }

    /**
     * Compare two sessions
     */
    compareSessions(sessionId1: string, sessionId2: string): {
        session1: SessionAnalysis;
        session2: SessionAnalysis;
        comparison: {
            fpsChange: number;
            frameTimeChange: number;
            physicsTimeChange: number;
            collisionChange: number;
            overallImprovement: 'better' | 'worse' | 'similar';
        };
    } | null {
        const analysis1 = this.profiler.analyzeSession(sessionId1);
        const analysis2 = this.profiler.analyzeSession(sessionId2);

        if (!analysis1 || !analysis2) { return null; }

        const fpsChange = analysis2.metrics.fps.average - analysis1.metrics.fps.average;
        const frameTimeChange = analysis2.metrics.frameTime.average - analysis1.metrics.frameTime.average;
        const physicsTimeChange = analysis2.metrics.physicsTime.average - analysis1.metrics.physicsTime.average;
        const collisionChange = analysis2.metrics.collisions.average - analysis1.metrics.collisions.average;

        // Determine overall improvement
        let overallImprovement: 'better' | 'worse' | 'similar' = 'similar';
        const positiveChanges = [fpsChange > 1, frameTimeChange < -1, physicsTimeChange < -1, collisionChange < -5];
        const negativeChanges = [fpsChange < -1, frameTimeChange > 1, physicsTimeChange > 1, collisionChange > 5];

        const positiveCount = positiveChanges.filter(Boolean).length;
        const negativeCount = negativeChanges.filter(Boolean).length;

        if (positiveCount > negativeCount) {
            overallImprovement = 'better';
        } else if (negativeCount > positiveCount) {
            overallImprovement = 'worse';
        }

        return {
            session1: analysis1,
            session2: analysis2,
            comparison: {
                fpsChange,
                frameTimeChange,
                physicsTimeChange,
                collisionChange,
                overallImprovement,
            },
        };
    }

    /**
     * Analyze performance trends across sessions
     */
    analyzeTrends(): {
        fpsTrend: 'improving' | 'degrading' | 'stable';
        performanceTrend: 'improving' | 'degrading' | 'stable';
        recommendations: string[];
    } {
        const sessions = this.profiler.getAllSessions()
            .sort((a, b) => a.startTime - b.startTime);

        if (sessions.length < 3) {
            return {
                fpsTrend: 'stable',
                performanceTrend: 'stable',
                recommendations: ['Need more sessions for trend analysis'],
            };
        }

        // Analyze FPS trend
        const recentSessions = sessions.slice(-5);
        const fpsValues = recentSessions.map(s => {
            return s.metrics.reduce((sum, m) => sum + m.fps, 0) / s.metrics.length;
        });

        const fpsSlope = this.calculateTrendSlope(fpsValues);
        const fpsTrend = Math.abs(fpsSlope) < 0.1 ? 'stable' :
            fpsSlope > 0 ? 'improving' : 'degrading';

        // Overall performance trend (lower is better for frame time)
        const frameTimeValues = recentSessions.map(s => {
            return s.metrics.reduce((sum, m) => sum + m.frameTime, 0) / s.metrics.length;
        });

        const frameTimeSlope = this.calculateTrendSlope(frameTimeValues);
        const performanceTrend = Math.abs(frameTimeSlope) < 0.5 ? 'stable' :
            frameTimeSlope < 0 ? 'improving' : 'degrading';

        const recommendations: string[] = [];

        if (fpsTrend === 'degrading') {
            recommendations.push('Performance is degrading - consider optimization strategies');
        }

        if (performanceTrend === 'degrading') {
            recommendations.push('Frame times are increasing - investigate performance issues');
        }

        return {
            fpsTrend,
            performanceTrend,
            recommendations,
        };
    }

    /**
     * Calculate trend slope using linear regression
     */
    private calculateTrendSlope(values: number[]): number {
        const n = values.length;
        if (n < 2) { return 0; }

        const xMean = (n - 1) / 2;
        const yMean = values.reduce((sum, val) => sum + val, 0) / n;

        let numerator = 0;
        let denominator = 0;

        for (let i = 0; i < n; i++) {
            const xDiff = i - xMean;
            const yDiff = values[i] - yMean;
            numerator += xDiff * yDiff;
            denominator += xDiff * xDiff;
        }

        return denominator !== 0 ? numerator / denominator : 0;
    }
}

/**
 * Create performance profiler with comparative analysis
 */
export function createPerformanceProfiler(): {
    profiler: PerformanceProfiler;
    analyzer: ComparativePerformanceAnalyzer;
} {
    const profiler = new PerformanceProfiler();
    const analyzer = new ComparativePerformanceAnalyzer(profiler);

    return { profiler, analyzer };
}
