import { logger } from "@plinko/services/logger";

/**
 * Simplified logging utilities for Plinko game debugging
 */

export const logContainerDimensions = (container: HTMLElement, label: string) => {
    if (process.env.NODE_ENV !== 'development') return;

    const rect = container.getBoundingClientRect();
    logger.logUIEvent(`${label}-dimensions`, {
        width: rect.width,
        height: rect.height,
        isVisible: rect.width > 0 && rect.height > 0,
        isClipped: rect.left < 0 || rect.right > window.innerWidth || rect.top < 0 || rect.bottom > window.innerHeight
    });
};

export const logGameState = (state: any, label: string) => {
    if (process.env.NODE_ENV !== 'development') return;

    logger.logGameEvent(`game-state-${label}`, state);
};

export const logPerformanceMetric = (metric: string, value: number, unit: string = 'ms') => {
    if (process.env.NODE_ENV !== 'development') return;

    logger.logUIEvent('performance-metric', {
        metric,
        value,
        unit,
        timestamp: Date.now()
    });
};
