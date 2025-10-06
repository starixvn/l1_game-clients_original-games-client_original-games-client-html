import { useRef, useCallback, useMemo } from 'react';
import { Composite, Engine } from 'matter-js';
import { physicsConfig } from '../../../../../lib/physics';

interface BallBodyExtension {
    world?: Engine['world'];
    isServiceGuided?: boolean;
    expectedFinalSlot?: number;
    multiplier?: number;
    betValue?: number;
    hasTriggeredWin?: boolean;
    servicePath?: number[];
    currentPathIndex?: number;
    isRemoved?: boolean;
    createdAt?: number;
    wrongSlotHits?: number;
    pinCollisions?: string[];
}

interface UseBallRendererProps {
    numberOfRows: number;
    multipliers: number[];
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
 * Helper function to get slot color based on multiplier
 */
function getSlotColor(multiplier: number): string {
    if (multiplier >= 100) return '#8e44ad';
    if (multiplier >= 15) return '#9b59b6';
    if (multiplier >= 2) return '#3498db';
    if (multiplier >= 0.9) return '#2980b9';
    if (multiplier >= 0.5) return '#1f4e79';
    return '#2c3e50';
}

/**
 * Custom hook for managing canvas rendering and animation
 * Handles the render loop, layout calculations, and visual rendering of game elements
 */
export const useBallRenderer = ({
    numberOfRows,
    multipliers,
    canvasWidth,
    canvasHeight,
    engine,
    pins,
    removedBallsRef
}: UseBallRendererProps): UseBallRendererReturn => {
    const animationFrameRef = useRef<number | null>(null);

    // Memoize expensive layout calculations to avoid recalculating every frame
    const layoutData = useMemo(() => {
        const scaleFactor = Math.max(0.4, Math.min(1.2, 10 / numberOfRows));
        const pegRadius = Math.max(3, Math.min(12, 8 * scaleFactor));
        const pegGap = Math.max(30, Math.min(55, 45 * scaleFactor));
        const boardTopMargin = Math.max(40, Math.min(80, 60 * scaleFactor));

        const lastRowY = boardTopMargin + (numberOfRows - 1) * pegGap;
        const lastRowColumns = numberOfRows;
        const lastRowWidth = (lastRowColumns - 1) * pegGap;
        const lastRowStartX = (canvasWidth - lastRowWidth) / 2;
        const visualSlotHeight = Math.max(15, Math.min(40, (pegGap - 8 * scaleFactor) * 1.5));
        const slotWidth = Math.max(8, Math.min(50, pegGap - 8 * scaleFactor));
        const numberOfSlots = numberOfRows + 1;

        return {
            scaleFactor,
            pegRadius,
            pegGap,
            boardTopMargin,
            lastRowY,
            lastRowStartX,
            visualSlotHeight,
            slotWidth,
            numberOfSlots
        };
    }, [numberOfRows, canvasWidth]);

    // Memoize slot rendering data
    const slotRenderData = useMemo(() => {
        const effectiveMultipliers = multipliers.length > 0 ? multipliers : [0.5, 1, 1.2, 1.5, 2, 3, 5, 10, 20];
        const slotsToDraw = Math.min(effectiveMultipliers.length, layoutData.numberOfSlots);

        return effectiveMultipliers.map((multiplier, i) => {
            if (i >= slotsToDraw) return null;

            const slotX = layoutData.lastRowStartX + (i - 0.5) * layoutData.pegGap - layoutData.slotWidth / 2;
            // FIX: Position visual slots BELOW the physics board to match physics positioning
            const slotY = layoutData.lastRowY + layoutData.pegGap * 0.8;

            return {
                multiplier,
                slotX,
                slotY,
                slotWidth: layoutData.slotWidth,
                slotHeight: layoutData.visualSlotHeight,
                color: getSlotColor(multiplier)
            };
        }).filter(Boolean);
    }, [multipliers, layoutData]);

    // Start render loop
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

            ctx.clearRect(0, 0, canvasWidth, canvasHeight);

            // Draw multiplier slots using pre-calculated data
            slotRenderData.forEach((slot, index) => {
                if (!slot) return;

                const { multiplier, slotX, slotY, slotWidth, slotHeight, color } = slot;

                // Draw slot background
                const slotGradient = ctx.createLinearGradient(slotX, slotY - slotHeight / 2, slotX, slotY + slotHeight / 2);
                slotGradient.addColorStop(0, color);
                slotGradient.addColorStop(1, '#1a252f');
                ctx.fillStyle = slotGradient;
                ctx.fillRect(slotX, slotY - slotHeight / 2, slotWidth, slotHeight);

                // Draw slot border
                ctx.strokeStyle = '#34495e';
                ctx.lineWidth = 1;
                ctx.strokeRect(slotX, slotY - slotHeight / 2, slotWidth, slotHeight);

                // Draw multiplier text
                ctx.fillStyle = '#ffffff';
                ctx.font = `bold ${Math.max(12, Math.min(16, slotWidth / 3))}px Arial`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(multiplier.toFixed(1), slotX + slotWidth / 2, slotY);
            });

            // Draw pins
            pins.forEach((pin, index) => {
                const bounds = pin.bounds;
                let centerX, centerY;
                if (!bounds?.min || !bounds?.max) {
                    // Fallback to position if bounds are not available
                    centerX = pin.position.x;
                    centerY = pin.position.y;
                } else {
                    centerX = (bounds.min.x + bounds.max.x) / 2;
                    centerY = (bounds.min.y + bounds.max.y) / 2;
                }

                ctx.fillStyle = '#F5DCFF';
                ctx.strokeStyle = '#E0E0E0';
                ctx.lineWidth = Math.max(0.3, Math.min(1, 0.5 * layoutData.scaleFactor));
                ctx.beginPath();
                ctx.arc(centerX, centerY, layoutData.pegRadius, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
            });

            // Draw balls
            const allBodies = Composite.allBodies(engine.world);
            const balls = allBodies.filter((body) => {
                if (!body.label?.includes("ball")) return false;
                const ballExtension = body as unknown as BallBodyExtension;
                return !ballExtension.isRemoved && !removedBallsRef.current?.has(body.id);
            });

            balls.forEach((ball) => {
                const ballExtension = ball as unknown as BallBodyExtension;
                const ballColor = ballExtension.betValue && ballExtension.betValue <= 0 ?
                    physicsConfig.colors.multiplierLoss : physicsConfig.colors.ball;

                ctx.fillStyle = ballColor;
                ctx.strokeStyle = "#FFD700";
                ctx.lineWidth = Math.max(1, (ball.circleRadius || 5) * 0.1);

                ctx.beginPath();
                ctx.arc(ball.position.x, ball.position.y, ball.circleRadius || 5, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();

                // Add inner highlight
                ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
                ctx.beginPath();
                ctx.arc(
                    ball.position.x - (ball.circleRadius || 5) * 0.3,
                    ball.position.y - (ball.circleRadius || 5) * 0.3,
                    (ball.circleRadius || 5) * 0.4,
                    0,
                    Math.PI * 2
                );
                ctx.fill();
            });

            animationFrameRef.current = requestAnimationFrame(render);
        };

        render();
    }, [slotRenderData, layoutData, canvasWidth, canvasHeight, removedBallsRef]);

    return {
        startRenderLoop,
        layoutData,
        slotRenderData
    };
};
