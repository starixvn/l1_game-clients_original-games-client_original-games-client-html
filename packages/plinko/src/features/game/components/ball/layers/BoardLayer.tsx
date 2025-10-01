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
        triangleTopX: number;
        triangleTopY: number;
        triangleBottomLeftX: number;
        triangleBottomLeftY: number;
        triangleBottomRightX: number;
        triangleBottomRightY: number;
    }) => void;
}

/**
 * Layer 2: Pin Visualization
 * Renders the pin visualization within the triangular area
 * - Pin visualization (white circles representing pegs)
 * Note: Triangular board area is defined by pin placement and ball clipping
 * Note: Payout slots are rendered in BackgroundLayer (Layer 1)
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

        // Use the same calculations as physics bodies to ensure proper alignment
        // If multipliers is empty, use default multipliers for board calculation
        const effectiveMultipliers = multipliers.length > 0 ? multipliers : [0.5, 1, 1.2, 1.5, 2, 3, 5, 10, 20];

        const { pins } = createPhysicsBodies(width, height, rows, effectiveMultipliers);

        // Calculate board dimensions based on actual pin positions
        if (pins.length === 0) {
            return;
        }

        // Find the bounds of all pins to determine board area
        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;

        pins.forEach((pin, index) => {
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

        // Calculate triangular coordinates (same as used for drawing)
        const triangleTopX = boardX + boardWidth / 2;
        const triangleTopY = boardTopMargin;
        const triangleBottomLeftX = boardX - padding;
        const triangleBottomLeftY = maxY + padding;
        const triangleBottomRightX = boardX + boardWidth + padding;
        const triangleBottomRightY = maxY + padding;

        // Notify parent component about calculated board dimensions
        if (onBoardDimensionsCalculated) {
            const dimensions = {
                topMargin: boardTopMargin,
                bottomMargin: boardBottomMargin,
                leftMargin: boardLeftMargin,
                rightMargin: boardRightMargin,
                boardWidth,
                boardHeight,
                boardX,
                triangleTopX,
                triangleTopY,
                triangleBottomLeftX,
                triangleBottomLeftY,
                triangleBottomRightX,
                triangleBottomRightY
            };

            onBoardDimensionsCalculated(dimensions);
        } else {
            // No onBoardDimensionsCalculated callback provided
        }

        // 1. Draw pins as small white circles using actual physics body positions
        // The triangular board area is defined by pin placement and ball clipping

        pins.forEach((pin, index) => {
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
