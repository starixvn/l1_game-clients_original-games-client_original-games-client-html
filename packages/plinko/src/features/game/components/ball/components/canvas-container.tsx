/**
 * Canvas Container Component
 * Handles canvas setup and rendering loop management
 * Follows Single Responsibility Principle - only handles canvas operations
 */

import React, { useRef, useEffect } from 'react';
import { logger } from '../../../../../services/logger';

export interface CanvasContainerProps {
    canvasWidth: number;
    canvasHeight: number;
    canvasScale: number;
    isInitialized: boolean;
    multipliers: number[];
    pins: any[];
    numberOfRows: number;
    startRenderLoop: (
        ctx: CanvasRenderingContext2D,
        engine: any,
        containerSize: { width: number; height: number },
        multipliers: number[],
        pins: any[],
        numberOfRows: number
    ) => void;
    engine: React.MutableRefObject<any>;
}

/**
 * Canvas Container - manages canvas element and rendering loop
 * Pure component that handles canvas-specific operations
 */
export const CanvasContainer: React.FC<CanvasContainerProps> = ({
    canvasWidth,
    canvasHeight,
    canvasScale,
    isInitialized,
    multipliers,
    pins,
    numberOfRows,
    startRenderLoop,
    engine
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Initialize canvas and start render loop when physics is ready
    useEffect(() => {
        if (!canvasRef.current || !isInitialized || !engine.current) {
            return;
        }

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) { return; }

        // Set canvas to fixed original dimensions
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;

        // Start render loop with fixed canvas dimensions
        if (process.env.NODE_ENV === 'development') {
            logger.info('🎨 [CANVAS] Starting render loop:', {
                canvasWidth,
                canvasHeight,
                canvasScale,
                pinsCount: pins.length,
                multipliersCount: multipliers.length,
                engineReady: !!engine.current
            });
        }
        startRenderLoop(ctx, engine.current, { width: canvasWidth, height: canvasHeight }, multipliers, pins, numberOfRows);
    }, [isInitialized, engine, startRenderLoop, multipliers, pins, numberOfRows, canvasWidth, canvasHeight]);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: `translate(-50%, -50%) scale(${canvasScale})`,
                width: `${canvasWidth}px`,
                height: `${canvasHeight}px`,
                zIndex: 1,
                transformOrigin: "center center",
            }}
        />
    );
};
