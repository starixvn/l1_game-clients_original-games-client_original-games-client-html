import React, { useRef, useEffect } from 'react';
import { logger } from '../../../../../services/logger';

export interface BackgroundLayerProps {
    width: number;
    height: number;
    multipliers?: number[];
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
    multipliers = [],
    className = 'background-layer'
}) => {
    logger.info('🎨 [BACKGROUND_LAYER] BackgroundLayer component initializing', {
        width: width.toFixed(1),
        height: height.toFixed(1),
        multipliersCount: multipliers.length,
        className,
        timestamp: new Date().toISOString()
    });

    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) {
            logger.warn('🎨 [BACKGROUND_LAYER] Canvas ref not available', {
                width: width.toFixed(1),
                height: height.toFixed(1),
                multipliersCount: multipliers.length
            });
            return;
        }

        const ctx = canvas.getContext('2d');
        if (!ctx) {
            logger.error('🎨 [BACKGROUND_LAYER] Failed to get 2D context', {
                width: width.toFixed(1),
                height: height.toFixed(1),
                multipliersCount: multipliers.length
            });
            return;
        }

        logger.debug('🎨 [BACKGROUND_LAYER] Starting canvas rendering', {
            width: width.toFixed(1),
            height: height.toFixed(1),
            multipliersCount: multipliers.length,
            canvasWidth: canvas.width,
            canvasHeight: canvas.height
        });

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

        // 4. Payout slots at the bottom with proper colors (full canvas - bottom area)
        if (multipliers.length > 0) {
            const slotWidth = Math.max(25, Math.min(60, width / multipliers.length * 0.85));
            const slotHeight = Math.max(20, Math.min(40, height * 0.08));
            const totalSlotWidth = slotWidth * multipliers.length;
            const startX = (width - totalSlotWidth) / 2;
            const slotY = height - height * 0.15 + slotHeight / 2; // Position below triangular area

            logger.debug('🎨 [BACKGROUND_LAYER] Rendering payout slots', {
                slotCount: multipliers.length,
                slotWidth: slotWidth.toFixed(1),
                slotHeight: slotHeight.toFixed(1),
                totalSlotWidth: totalSlotWidth.toFixed(1),
                startX: startX.toFixed(1),
                slotY: slotY.toFixed(1),
                multipliers: multipliers.map(m => m.toFixed(1))
            });

            multipliers.forEach((multiplier, index) => {
                const slotX = startX + index * slotWidth;

                // Color coding based on multiplier value
                let slotColor = '#2c3e50'; // Default dark blue
                if (multiplier >= 100) {
                    slotColor = '#8e44ad'; // Purple for highest multipliers
                } else if (multiplier >= 15) {
                    slotColor = '#9b59b6'; // Light purple
                } else if (multiplier >= 2) {
                    slotColor = '#3498db'; // Blue
                } else if (multiplier >= 0.9) {
                    slotColor = '#2980b9'; // Darker blue
                } else if (multiplier >= 0.5) {
                    slotColor = '#1f4e79'; // Darkest blue
                }

                // Draw slot background
                ctx.fillStyle = slotColor;
                ctx.fillRect(slotX, slotY - slotHeight / 2, slotWidth, slotHeight);

                // Draw slot border
                ctx.strokeStyle = '#34495e';
                ctx.lineWidth = 1;
                ctx.strokeRect(slotX, slotY - slotHeight / 2, slotWidth, slotHeight);

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

                logger.debug('🎨 [BACKGROUND_LAYER] Rendered slot', {
                    index,
                    multiplier: multiplier.toFixed(1),
                    slotX: slotX.toFixed(1),
                    slotY: slotY.toFixed(1),
                    slotColor,
                    fontSize: Math.max(10, Math.min(16, slotWidth / 4)).toFixed(1)
                });
            });

            logger.info('🎨 [BACKGROUND_LAYER] All payout slots rendered', {
                totalSlots: multipliers.length,
                slotWidth: slotWidth.toFixed(1),
                slotHeight: slotHeight.toFixed(1)
            });
        } else {
            logger.debug('🎨 [BACKGROUND_LAYER] No multipliers provided, skipping payout slots');
        }

        // Restore context state
        ctx.restore();

        logger.info('🎨 [BACKGROUND_LAYER] Canvas rendering completed', {
            width: width.toFixed(1),
            height: height.toFixed(1),
            multipliersCount: multipliers.length,
            timestamp: new Date().toISOString()
        });

    }, [width, height, multipliers]);

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
