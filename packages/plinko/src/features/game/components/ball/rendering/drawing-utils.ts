/**
 * Drawing Utilities Module
 * Provides pure drawing functions for canvas rendering
 * Follows Single Responsibility Principle - only handles drawing operations
 */

export interface DrawOptions {
    fill?: boolean;
    stroke?: boolean;
}

/**
 * Draw a rounded rectangle on canvas
 * Pure function - no side effects, only drawing operations
 */
export function drawRoundedRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number,
    options: DrawOptions = {}
): void {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();

    if (options.fill) {
        ctx.fill();
    }
    if (options.stroke) {
        ctx.stroke();
    }
}

/**
 * Draw a circle (pin or ball) on canvas
 * Pure function for circle drawing operations
 */
export function drawCircle(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    radius: number,
    fillColor?: string,
    strokeColor?: string,
    lineWidth?: number
): void {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);

    if (fillColor) {
        ctx.fillStyle = fillColor;
        ctx.fill();
    }

    if (strokeColor && lineWidth) {
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = lineWidth;
        ctx.stroke();
    }
}

/**
 * Draw text on canvas with specified styling
 * Pure function for text rendering
 */
export function drawText(
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    options: {
        font?: string;
        fillStyle?: string;
        textAlign?: CanvasTextAlign;
        textBaseline?: CanvasTextBaseline;
    } = {}
): void {
    if (options.font) {
        ctx.font = options.font;
    }
    if (options.fillStyle) {
        ctx.fillStyle = options.fillStyle;
    }
    if (options.textAlign) {
        ctx.textAlign = options.textAlign;
    }
    if (options.textBaseline) {
        ctx.textBaseline = options.textBaseline;
    }

    ctx.fillText(text, x, y);
}

/**
 * Create a gradient for visual effects
 * Pure function returning a canvas gradient
 */
export function createLinearGradient(
    ctx: CanvasRenderingContext2D,
    x0: number,
    y0: number,
    x1: number,
    y1: number,
    colorStops: Array<[number, string]>
): CanvasGradient {
    const gradient = ctx.createLinearGradient(x0, y0, x1, y1);
    colorStops.forEach(([offset, color]) => {
        // Ensure color is defined before adding to gradient
        if (color) {
            gradient.addColorStop(offset, color);
        } else {
            console.warn(`Undefined color stop encountered at offset ${offset}, skipping`);
        }
    });
    return gradient;
}
