/**
 * Canvas Renderer Module
 * Handles all canvas rendering operations
 * Follows Single Responsibility Principle - only handles rendering
 */

import { Composite } from 'matter-js';
import { BallBodyExtension } from '../../../../../types/physics';
import * as DrawingUtils from './DrawingUtils';
import { LayoutData, SlotRenderData } from './LayoutCalculator';

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
            const radius = 6; // Match rounded-[6px] from history items
            const x = slotX;
            const y = slotY - slotHeight / 2;
            const width = slotWidth;
            const height = slotHeight;

            // Draw background with rounded corners
            const slotGradient = DrawingUtils.createLinearGradient(
                ctx, x, y, x, y + height,
                [[0, color], [1, '#1a252f']]
            );
            ctx.fillStyle = slotGradient;
            DrawingUtils.drawRoundedRect(ctx, x, y, width, height, radius, { fill: true });

            // Draw slot border with rounded corners
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)'; // Match border-[rgba(255,255,255,0.2)]
            ctx.lineWidth = 1;
            DrawingUtils.drawRoundedRect(ctx, x, y, width, height, radius, { stroke: true });

            // Draw multiplier text
            DrawingUtils.drawText(ctx, multiplier.toFixed(1), slotX + slotWidth / 2, slotY, {
                fillStyle: '#ffffff',
                font: `bold ${Math.max(12, Math.min(16, slotWidth / 3))}px Arial`,
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

            const strokeColor = "#FFD700";
            const lineWidth = Math.max(1, (ball.circleRadius || 5) * 0.1);

            // Draw main ball
            DrawingUtils.drawCircle(
                ctx,
                ball.position.x,
                ball.position.y,
                ball.circleRadius || 5,
                ballColor,
                strokeColor,
                lineWidth
            );

            // Add inner highlight
            ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
            DrawingUtils.drawCircle(
                ctx,
                ball.position.x - (ball.circleRadius || 5) * 0.3,
                ball.position.y - (ball.circleRadius || 5) * 0.3,
                (ball.circleRadius || 5) * 0.4
            );
        });
    }

    /**
     * Clear canvas and render all game elements
     * Main rendering orchestration function
     */
    export function renderFrame(renderContext: RenderContext): void {
        const { ctx, engine, multipliers, pins, numberOfRows, removedBallsRef, layoutData, slotRenderData } = renderContext;

        // Clear canvas
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        // Render game elements in order
        renderSlots(ctx, slotRenderData);
        renderPins(ctx, pins, layoutData);
        renderBalls(ctx, engine, removedBallsRef);
    }
}
