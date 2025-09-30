import React, { useRef, useEffect } from 'react';
import { createPhysicsBodies } from '../../../../../lib/physics';

export interface BoardLayerProps {
    width: number;
    height: number;
    rows: number;
    multipliers: number[];
    className?: string;
    onBoardDimensionsCalculated?: (dimensions: {
        topMargin: number;
        bottomMargin: number;
        leftMargin: number;
        rightMargin: number;
        boardWidth: number;
        boardHeight: number;
        boardX: number;
    }) => void;
}

/**
 * Layer 2: Triangular Board Area
 * Renders the triangular game board and pin visualization
 * - Plinko board (triangular background with border)
 * - Pin visualization (white circles representing pegs)
 * - Board borders and outlines
 */
const BoardLayer: React.FC<BoardLayerProps> = ({
    width,
    height,
    rows,
    multipliers,
    className = 'board-layer',
    onBoardDimensionsCalculated
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        console.log('📐 BoardLayer useEffect triggered:', {
            hasCanvasRef: !!canvasRef.current,
            width,
            height,
            rows,
            multipliersLength: multipliers.length,
            multipliers: multipliers.slice(0, 5), // Log first 5 multipliers
            timestamp: new Date().toISOString()
        });

        const canvas = canvasRef.current;
        if (!canvas) {
            console.error('❌ BoardLayer: No canvas ref available');
            return;
        }

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set canvas size
        canvas.width = width;
        canvas.height = height;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // Save context state
        ctx.save();

        // Use the same calculations as physics bodies to ensure proper alignment
        // If multipliers is empty, use default multipliers for board calculation
        const effectiveMultipliers = multipliers.length > 0 ? multipliers : [0.5, 1, 1.2, 1.5, 2, 3, 5, 10, 20];
        console.log('📐 BoardLayer: Using effective multipliers:', {
            originalLength: multipliers.length,
            effectiveLength: effectiveMultipliers.length,
            effectiveMultipliers: effectiveMultipliers.slice(0, 5)
        });

        const { pins } = createPhysicsBodies(width, height, rows, effectiveMultipliers);
        console.log('📐 BoardLayer: Physics bodies created:', {
            pinsCount: pins.length,
            rows,
            width,
            height
        });

        // Calculate board dimensions based on actual pin positions
        if (pins.length === 0) {
            console.error('❌ BoardLayer: No pins generated, skipping board dimension calculation');
            return;
        }

        // Find the bounds of all pins to determine board area
        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;

        pins.forEach(pin => {
            const bounds = pin.bounds;
            minX = Math.min(minX, bounds.min.x);
            maxX = Math.max(maxX, bounds.max.x);
            minY = Math.min(minY, bounds.min.y);
            maxY = Math.max(maxY, bounds.max.y);
        });

        // Add padding around the pin matrix
        const padding = 20;
        const boardTopMargin = minY - padding;
        const boardBottomMargin = height * 0.15; // Keep bottom margin for slots
        const boardLeftMargin = minX - padding;
        const boardRightMargin = maxX + padding;

        // Calculate board dimensions
        const boardWidth = boardRightMargin - boardLeftMargin;
        const boardHeight = maxY - boardTopMargin + padding;
        const boardX = boardLeftMargin;

        // Notify parent component about calculated board dimensions
        if (onBoardDimensionsCalculated) {
            console.log('📐 BoardLayer: Calling onBoardDimensionsCalculated with dimensions:', {
                topMargin: boardTopMargin,
                bottomMargin: boardBottomMargin,
                leftMargin: boardLeftMargin,
                rightMargin: boardRightMargin,
                boardWidth,
                boardHeight,
                boardX,
                timestamp: new Date().toISOString()
            });

            onBoardDimensionsCalculated({
                topMargin: boardTopMargin,
                bottomMargin: boardBottomMargin,
                leftMargin: boardLeftMargin,
                rightMargin: boardRightMargin,
                boardWidth,
                boardHeight,
                boardX
            });

            console.log('✅ BoardLayer: onBoardDimensionsCalculated callback completed');
        } else {
            console.warn('⚠️ BoardLayer: No onBoardDimensionsCalculated callback provided');
        }

        // 1. Main Plinko board area - triangular background that wraps the pin matrix
        ctx.fillStyle = '#1a2332';
        ctx.strokeStyle = '#4a90e2';
        ctx.lineWidth = 2;
        ctx.beginPath();

        // Create triangular shape that wraps the pin matrix
        // Top point: center of the top row
        const topCenterX = boardX + boardWidth / 2;
        const topCenterY = boardTopMargin;

        // Bottom left: left edge of bottom row with some padding
        const bottomLeftX = boardX - padding;
        const bottomLeftY = maxY + padding;

        // Bottom right: right edge of bottom row with some padding
        const bottomRightX = boardX + boardWidth + padding;
        const bottomRightY = maxY + padding;

        ctx.moveTo(topCenterX, topCenterY);
        ctx.lineTo(bottomLeftX, bottomLeftY);
        ctx.lineTo(bottomRightX, bottomRightY);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // 2. Draw pins as small white circles using actual physics body positions
        pins.forEach(pin => {
            const bounds = pin.bounds;
            const centerX = (bounds.min.x + bounds.max.x) / 2;
            const centerY = (bounds.min.y + bounds.max.y) / 2;
            const pinRadius = Math.max(2, Math.min(4, (bounds.max.x - bounds.min.x) / 2));

            // Draw pin with white fill and subtle border
            ctx.fillStyle = '#F5DCFF'; // Light gray-white
            ctx.strokeStyle = '#E0E0E0';
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.arc(centerX, centerY, pinRadius, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
        });

        // 3. Payout slots at the bottom with proper colors (outside triangular area)
        if (multipliers.length > 0) {
            const slotWidth = Math.max(25, Math.min(60, width / multipliers.length * 0.85));
            const slotHeight = Math.max(20, Math.min(40, height * 0.08));
            const totalSlotWidth = slotWidth * multipliers.length;
            const startX = (width - totalSlotWidth) / 2;
            const slotY = height - boardBottomMargin + slotHeight / 2;

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
            });
        }

        // Restore context state
        ctx.restore();

    }, [width, height, rows, multipliers, onBoardDimensionsCalculated]);

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
                zIndex: 2
            }}
        />
    );
};

export default BoardLayer;
