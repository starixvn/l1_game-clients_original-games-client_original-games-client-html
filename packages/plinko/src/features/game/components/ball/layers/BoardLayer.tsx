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
 * Renders the pin visualization within the triangular board area
 * - Pin visualization (white circles representing pegs)
 * - Uses same triangular board dimensions as BackgroundLayer for perfect alignment
 * - Payout slots are integrated within the triangular board (BackgroundLayer)
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

        // Use the same triangular board dimensions as BackgroundLayer for perfect alignment
        // Calculate triangular board dimensions (matching BackgroundLayer exactly)
        const triangleTopMargin = height * 0.08;
        const triangleBottomMargin = height * 0.15;
        const triangleBoardHeight = height - triangleTopMargin - triangleBottomMargin;
        const triangleBoardWidth = width * 0.8; // Match physics board width
        const triangleBoardX = (width - triangleBoardWidth) / 2;

        // Use the same calculations as physics bodies to get pin positions
        // If multipliers is empty, use default multipliers for board calculation
        const effectiveMultipliers = multipliers.length > 0 ? multipliers : [0.5, 1, 1.2, 1.5, 2, 3, 5, 10, 20];

        const { pins } = createPhysicsBodies(width, height, rows, effectiveMultipliers);

        // Calculate board dimensions based on triangular board area (not pin bounds)
        if (pins.length === 0) {
            return;
        }

        // Use triangular board dimensions for consistent layout
        const boardTopMargin = triangleTopMargin;
        const boardBottomMargin = triangleBottomMargin;
        const boardLeftMargin = triangleBoardX;
        const boardRightMargin = triangleBoardX + triangleBoardWidth;

        // Calculate board dimensions
        const boardWidth = triangleBoardWidth;
        const boardHeight = triangleBoardHeight;
        const boardX = triangleBoardX;

        // Calculate triangular coordinates (matching BackgroundLayer)
        const triangleTopX = width / 2; // Center of canvas
        const triangleTopY = triangleTopMargin;
        const triangleBottomLeftX = triangleBoardX;
        const triangleBottomLeftY = triangleTopMargin + triangleBoardHeight;
        const triangleBottomRightX = triangleBoardX + triangleBoardWidth;
        const triangleBottomRightY = triangleTopMargin + triangleBoardHeight;

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
        // Pins are positioned within the triangular board area (matching BackgroundLayer)

        pins.forEach((pin, index) => {
            const bounds = pin.bounds;
            const centerX = (bounds.min.x + bounds.max.x) / 2;
            const centerY = (bounds.min.y + bounds.max.y) / 2;
            // Dynamic pin radius based on row count - larger pegs for fewer rows, smaller for more rows
            const pinRadius = Math.max(2, Math.min(8, 48 / rows));

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
