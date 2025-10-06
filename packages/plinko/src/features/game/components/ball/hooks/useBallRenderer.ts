import { useRef, useCallback, useMemo } from 'react';
import { Composite, Engine } from 'matter-js';
import { physicsConfig } from '../../../../../lib/physics';
import { logger } from '../../../../../services/logger';
import { BallBodyExtension } from '../../../../../types/physics';
import { getMultiplierColor } from '../../../../../lib/utils/colors-util';
import {
    calculateLayoutData,
    calculateSlotRenderData
} from '../rendering/LayoutCalculator';
import { CanvasRenderer } from '../rendering/CanvasRenderer';

interface UseBallRendererProps {
    numberOfRows: number;
    multipliers: number[];
    gameMode: number;
    canvasWidth: number;
    canvasHeight: number;
    engine: React.MutableRefObject<Engine | null>;
    pins: any[];
    removedBallsRef: React.MutableRefObject<Set<number>>;
}

interface UseBallRendererReturn {
    startRenderLoop: (
        ctx: CanvasRenderingContext2D,
        engine: Engine,
        containerSize: { width: number; height: number },
        multipliers: number[],
        pins: any[],
        numberOfRows: number
    ) => void;
    layoutData: any;
    slotRenderData: any[];
}


/**
 * Custom hook for managing canvas rendering and animation
 * Handles the render loop, layout calculations, and visual rendering of game elements
 */
export const useBallRenderer = ({
    numberOfRows,
    multipliers,
    gameMode,
    canvasWidth,
    canvasHeight,
    engine,
    pins,
    removedBallsRef
}: UseBallRendererProps): UseBallRendererReturn => {
    const animationFrameRef = useRef<number | null>(null);

    // Use the modular layout calculator for layout data
    const layoutData = useMemo(() =>
        calculateLayoutData(numberOfRows, canvasWidth, canvasHeight),
        [numberOfRows, canvasWidth, canvasHeight]
    );

    // Use the modular slot render data calculator
    const slotRenderData = useMemo(() =>
        calculateSlotRenderData(multipliers, layoutData, gameMode, getMultiplierColor),
        [multipliers, layoutData, gameMode]
    );

    // Start render loop using the modular CanvasRenderer
    const startRenderLoop = useCallback((
        ctx: CanvasRenderingContext2D,
        engine: Engine,
        containerSize: { width: number; height: number },
        multipliers: number[],
        pins: any[],
        numberOfRows: number
    ) => {
        const render = () => {
            if (!ctx || !engine) return;

            // Log render loop occasionally
            if (Math.random() < 0.001) { // Log ~0.1% of frames
                console.log('🔄 [RENDER LOOP] Frame rendered');
            }

            // Use the modular renderer to render the entire frame
            CanvasRenderer.renderFrame({
                ctx,
                engine,
                multipliers,
                pins,
                numberOfRows,
                removedBallsRef,
                layoutData,
                slotRenderData
            });

            // Log ball rendering info in development mode (less frequently)
            if (process.env.NODE_ENV === 'development') {
                const allBodies = Composite.allBodies(engine.world);
                const balls = allBodies.filter((body) => {
                    if (!body.label?.includes("ball")) return false;
                    const ballExtension = body as unknown as BallBodyExtension;
                    return !ballExtension.isRemoved && !removedBallsRef.current?.has(body.id);
                });

                if (balls.length > 0 && Math.random() < 0.002) { // ~1/500 frames
                    logger.debug('🎨 [RENDER] Active balls:', {
                        count: balls.length,
                        totalBodies: allBodies.length
                    });
                }
            }

            animationFrameRef.current = requestAnimationFrame(render);
        };

        render();
    }, [layoutData, slotRenderData, removedBallsRef]);

    return {
        startRenderLoop,
        layoutData,
        slotRenderData
    };
};
