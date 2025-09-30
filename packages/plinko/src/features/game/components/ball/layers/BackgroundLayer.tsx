import React, { useRef, useEffect } from 'react';

export interface BackgroundLayerProps {
    width: number;
    height: number;
    className?: string;
}

/**
 * Layer 1: Full Canvas Background
 * Renders static visual elements across the entire canvas
 * - Background gradient (full canvas)
 * - Light effects (full canvas)
 * - Decorative elements (sides)
 * - Payout slots (bottom, outside triangular area)
 * - Multiplier text (on slots)
 */
const BackgroundLayer: React.FC<BackgroundLayerProps> = ({
    width,
    height,
    className = 'background-layer'
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set canvas size
        canvas.width = width;
        canvas.height = height;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // Save context state
        ctx.save();

        // 1. Main background - dark blue-teal gradient (full canvas)
        const gradient = ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, '#0f1419');
        gradient.addColorStop(0.3, '#1a2332');
        gradient.addColorStop(1, '#0f1419');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        // 2. Light rays/spotlights from top center (full canvas)
        ctx.save();
        ctx.globalAlpha = 0.4;
        const lightGradient = ctx.createRadialGradient(
            width / 2, 0, 0,
            width / 2, 0, height * 0.6
        );
        lightGradient.addColorStop(0, '#4a90e2');
        lightGradient.addColorStop(0.5, '#2c5aa0');
        lightGradient.addColorStop(1, 'transparent');
        ctx.fillStyle = lightGradient;
        ctx.fillRect(0, 0, width, height * 0.7);
        ctx.restore();

        // 3. Decorative zig-zag patterns on sides
        ctx.save();
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = '#4a90e2';

        // Left side zig-zag
        ctx.beginPath();
        ctx.moveTo(0, height * 0.2);
        for (let i = 0; i < 8; i++) {
            const x = (i % 2) * 20;
            const y = height * 0.2 + (i * height * 0.1);
            ctx.lineTo(x, y);
        }
        ctx.lineTo(0, height);
        ctx.lineTo(0, height * 0.2);
        ctx.fill();

        // Right side zig-zag
        ctx.beginPath();
        ctx.moveTo(width, height * 0.2);
        for (let i = 0; i < 8; i++) {
            const x = width - ((i % 2) * 20);
            const y = height * 0.2 + (i * height * 0.1);
            ctx.lineTo(x, y);
        }
        ctx.lineTo(width, height);
        ctx.lineTo(width, height * 0.2);
        ctx.fill();
        ctx.restore();

        // Restore context state
        ctx.restore();

    }, [width, height]);

    return (
        <canvas
            ref={canvasRef}
            className={className}
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: 1
            }}
        />
    );
};

export default BackgroundLayer;
