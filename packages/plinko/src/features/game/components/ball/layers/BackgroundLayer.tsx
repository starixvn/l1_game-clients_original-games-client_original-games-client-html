import React, { useRef, useEffect } from 'react';

export interface BackgroundLayerProps {
    width: number;
    height: number;
    rows: number;
    multipliers?: number[];
    className?: string;
}

/**
 * Layer 1: Full Canvas Background
 * Renders static visual elements across the entire canvas
 * - Background gradient (full canvas)
 * - Light effects (full canvas)
 * - Decorative elements (sides)
 * - Triangular board area (with integrated payout slots)
 * - Payout slots (integrated within triangular board at bottom)
 * - Multiplier text (on slots)
 */
const BackgroundLayer: React.FC<BackgroundLayerProps> = ({
    width,
    height,
    rows,
    multipliers = [],
    className = 'background-layer'
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) {
            return;
        }

        const ctx = canvas.getContext('2d');
        if (!ctx) {
            return;
        }

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

        // 4. Triangular board area with integrated payout slots
        if (multipliers.length > 0) {
            // Calculate triangular board dimensions (full width background)
            const triangleTopMargin = height * 0.08;
            const triangleBottomMargin = height * 0.15;
            const triangleBoardHeight = height - triangleTopMargin - triangleBottomMargin;
            const triangleBoardWidth = width * 1.0; // FULL WIDTH: Span entire canvas
            const triangleBoardX = (width - triangleBoardWidth) / 2;

            // Draw triangular board background
            ctx.save();
            ctx.globalAlpha = 0.1;
            ctx.fillStyle = '#4a90e2';

            // Create triangular path
            ctx.beginPath();
            ctx.moveTo(width / 2, triangleTopMargin); // Top point (center)
            ctx.lineTo(triangleBoardX, triangleTopMargin + triangleBoardHeight); // Bottom left
            ctx.lineTo(triangleBoardX + triangleBoardWidth, triangleTopMargin + triangleBoardHeight); // Bottom right
            ctx.closePath();
            ctx.fill();
            ctx.restore();

            // Calculate payout slots within the triangular board (based on rows + 1)
            const numSlots = Math.max(rows + 1, multipliers.length); // Use rows+1 or multipliers length, whichever is larger
            const slotHeight = Math.max(20, Math.min(40, height * 0.08)); // DECREASED: More modest slot height
            const slotGap = Math.max(2, Math.min(6, width * 0.005)); // Smaller gap for more slots

            // Calculate slot width based on available triangular board width to prevent overflow
            const availableWidth = triangleBoardWidth;
            const totalGapWidth = slotGap * (numSlots - 1);
            const availableSlotWidth = Math.max(availableWidth - totalGapWidth, numSlots * 15); // Minimum 15px per slot
            const slotWidth = Math.max(15, Math.min(50, availableSlotWidth / numSlots)); // Fit within available space

            const totalSlotWidth = slotWidth * numSlots + slotGap * (numSlots - 1); // Recalculate total width
            const startX = triangleBoardX + (triangleBoardWidth - totalSlotWidth) / 2; // Center within board area
            const slotY = triangleTopMargin + triangleBoardHeight + slotHeight / 2; // Below the triangular background

            // Draw slots for each position (rows + 1 slots total)
            for (let index = 0; index < numSlots; index++) {
                const slotX = startX + index * (slotWidth + slotGap);
                const multiplier = multipliers[index] || 1.0; // Default multiplier if not enough provided

                // Color coding based on multiplier value (matching expected image)
                let slotColor = '#2c3e50'; // Default dark blue
                if (multiplier >= 100) {
                    slotColor = '#8e44ad'; // Purple for highest multipliers (like 190.0)
                } else if (multiplier >= 15) {
                    slotColor = '#9b59b6'; // Light purple
                } else if (multiplier >= 2) {
                    slotColor = '#3498db'; // Blue
                } else if (multiplier >= 0.9) {
                    slotColor = '#2980b9'; // Darker blue
                } else if (multiplier >= 0.5) {
                    slotColor = '#1f4e79'; // Darkest blue
                }

                // Draw slot background with 3D effect
                const gradient = ctx.createLinearGradient(slotX, slotY - slotHeight / 2, slotX, slotY + slotHeight / 2);
                gradient.addColorStop(0, slotColor);
                gradient.addColorStop(1, '#1a252f');
                ctx.fillStyle = gradient;
                ctx.fillRect(slotX, slotY - slotHeight / 2, slotWidth, slotHeight);

                // Draw slot border with highlight
                ctx.strokeStyle = '#34495e';
                ctx.lineWidth = 1;
                ctx.strokeRect(slotX, slotY - slotHeight / 2, slotWidth, slotHeight);

                // Add subtle highlight on top edge
                ctx.strokeStyle = '#4a90e2';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(slotX, slotY - slotHeight / 2);
                ctx.lineTo(slotX + slotWidth, slotY - slotHeight / 2);
                ctx.stroke();

                // Draw multiplier text
                ctx.fillStyle = '#ffffff';
                ctx.font = `bold ${Math.max(10, Math.min(16, slotWidth / 4))}px Arial`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(
                    multiplier.toFixed(1),
                    slotX + slotWidth / 2,
                    slotY
                );
            }
        } else {
            // No multipliers provided, skipping payout slots
        }

        // Restore context state
        ctx.restore();

    }, [width, height, rows, multipliers]);

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
