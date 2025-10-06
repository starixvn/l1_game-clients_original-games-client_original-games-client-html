/**
 * Canvas Renderer Module
 * Handles all canvas rendering operations
 * Follows Single Responsibility Principle - only handles rendering
 */

import { Composite } from 'matter-js';
import { BallBodyExtension } from '../../../../../types/physics';
import * as DrawingUtils from './drawing-utils';
import { LayoutData, SlotRenderData } from './layout-calculator';
import { logger } from '../../../../../services/logger';
import { RENDERING_CONSTANTS } from '@/lib/physics/constants/rendering-constants';
import { BALL_CONSTANTS } from '@/lib/physics/constants/ball-constants';

// Export namespace for better organization
export namespace CanvasRenderer {

    export interface RenderContext {
        ctx: CanvasRenderingContext2D;
        engine: any;
        multipliers: number[];
        pins: any[];
        numberOfRows: number;
        removedBallsRef: React.MutableRefObject<Set<number>>;
        layoutData: LayoutData;
        slotRenderData: SlotRenderData[];
    }

    /**
     * Render multiplier slots on canvas
     * Pure rendering function - only draws slots
     */
    export function renderSlots(ctx: CanvasRenderingContext2D, slotRenderData: SlotRenderData[]): void {
        slotRenderData.forEach((slot) => {
            if (!slot) return;

            const { multiplier, slotX, slotY, slotWidth, slotHeight, color } = slot;

            // Draw slot background with rounded corners to match history items
            const radius = RENDERING_CONSTANTS.SLOTS.BORDER_RADIUS; // Match rounded-[6px] from history items
            const x = slotX;
            const y = slotY - slotHeight / 2;
            const width = slotWidth;
            const height = slotHeight;

            // Draw background with rounded corners
            const slotGradient = DrawingUtils.createLinearGradient(
                ctx, x, y, x, y + height,
                [[0, color], [1, RENDERING_CONSTANTS.COLORS.SLOT_GRADIENT_START]]
            );
            ctx.fillStyle = slotGradient;
            DrawingUtils.drawRoundedRect(ctx, x, y, width, height, radius, { fill: true });

            // Draw slot border with rounded corners
            ctx.strokeStyle = RENDERING_CONSTANTS.COLORS.SLOT_STROKE; // Match border-[rgba(255,255,255,0.2)]
            ctx.lineWidth = 1;
            DrawingUtils.drawRoundedRect(ctx, x, y, width, height, radius, { stroke: true });

            // Draw multiplier text
            DrawingUtils.drawText(ctx, multiplier.toFixed(1), slotX + slotWidth / 2, slotY, {
                fillStyle: '#ffffff',
                font: `bold ${Math.max(RENDERING_CONSTANTS.SLOTS.FONT_MIN_SIZE, Math.min(RENDERING_CONSTANTS.SLOTS.FONT_MAX_SIZE, slotWidth / RENDERING_CONSTANTS.SLOTS.FONT_SIZE_DIVISOR))}px Arial`,
                textAlign: 'center',
                textBaseline: 'middle'
            });
        });
    }

    /**
     * Render pins on canvas
     * Pure rendering function - only draws pins
     */
    export function renderPins(ctx: CanvasRenderingContext2D, pins: any[], layoutData: LayoutData): void {
        pins.forEach((pin) => {
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

            DrawingUtils.drawCircle(
                ctx,
                centerX,
                centerY,
                layoutData.pegRadius,
                '#F5DCFF', // fill color
                '#E0E0E0', // stroke color
                Math.max(0.3, Math.min(1, 0.5 * layoutData.scaleFactor)) // line width
            );
        });
    }

    /**
     * Render balls on canvas
     * Pure rendering function - only draws balls
     */
    export function renderBalls(
        ctx: CanvasRenderingContext2D,
        engine: any,
        removedBallsRef: React.MutableRefObject<Set<number>>
    ): void {
        const allBodies = Composite.allBodies(engine.world);
        const balls = allBodies.filter((body) => {
            if (!body.label?.includes("ball")) return false;
            const ballExtension = body as unknown as BallBodyExtension;
            return !ballExtension.isRemoved && !removedBallsRef.current?.has(body.id);
        });

        balls.forEach((ball) => {
            const ballExtension = ball as unknown as BallBodyExtension;
            const ballColor = ballExtension.betValue && ballExtension.betValue <= 0 ?
                '#e74c3c' : '#FF6B6B'; // Use physicsConfig.colors.multiplierLoss or ball

            const strokeColor = RENDERING_CONSTANTS.BALL.BALL_STROKE;
            const lineWidth = Math.max(RENDERING_CONSTANTS.BALL.MIN_LINE_WIDTH, (ball.circleRadius || BALL_CONSTANTS.DEFAULTS.CIRCLE_RADIUS_FALLBACK) * RENDERING_CONSTANTS.BALL.LINE_WIDTH_MULTIPLIER);

            // Draw main ball
            DrawingUtils.drawCircle(
                ctx,
                ball.position.x,
                ball.position.y,
                ball.circleRadius || BALL_CONSTANTS.DEFAULTS.CIRCLE_RADIUS_FALLBACK,
                ballColor,
                strokeColor,
                lineWidth
            );

            // Add inner highlight
            ctx.fillStyle = RENDERING_CONSTANTS.COLORS.BALL_INNER_HIGHLIGHT;
            DrawingUtils.drawCircle(
                ctx,
                ball.position.x - (ball.circleRadius || BALL_CONSTANTS.DEFAULTS.CIRCLE_RADIUS_FALLBACK) * RENDERING_CONSTANTS.BALL.INNER_HIGHLIGHT_OFFSET_MULTIPLIER,
                ball.position.y - (ball.circleRadius || BALL_CONSTANTS.DEFAULTS.CIRCLE_RADIUS_FALLBACK) * RENDERING_CONSTANTS.BALL.HIGHLIGHT_POSITION_MULTIPLIER,
                (ball.circleRadius || BALL_CONSTANTS.DEFAULTS.CIRCLE_RADIUS_FALLBACK) * RENDERING_CONSTANTS.BALL.INNER_HIGHLIGHT_RADIUS_MULTIPLIER
            );
        });
    }

    /**
     * Clear canvas and render all game elements
     * Main rendering orchestration function
     */
    export function renderFrame(renderContext: RenderContext): void {
        const { ctx, engine, pins, removedBallsRef, layoutData, slotRenderData } = renderContext;

        // Clear canvas
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        // Get ball count for logging
        const allBodies = Composite.allBodies(engine.world);
        const balls = allBodies.filter((body) => {
            if (!body.label?.includes("ball")) return false;
            const ballExtension = body as unknown as BallBodyExtension;
            return !ballExtension.isRemoved && !removedBallsRef.current?.has(body.id);
        });

        // Log rendering occasionally
        if (balls.length > 0 && Math.random() < RENDERING_CONSTANTS.LOGGING.FRAME_LOG_PROBABILITY) { // Log ~0.5% of frames
            logger.debug('🎨 [RENDER] Rendering frame with balls:', balls.map(ball => ({
                id: ball.id,
                position: { x: Math.round(ball.position.x), y: Math.round(ball.position.y) },
                label: ball.label
            })));
        }

        // Render game elements in order
        renderSlots(ctx, slotRenderData);
        renderPins(ctx, pins, layoutData);
        renderBalls(ctx, engine, removedBallsRef);
    }
}
