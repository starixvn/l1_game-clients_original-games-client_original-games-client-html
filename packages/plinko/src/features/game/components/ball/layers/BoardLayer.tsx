import React, { useRef, useEffect } from 'react';
import { createPhysicsBodies } from '../../../../../lib/physics';
import { logger } from '../../../../../services/logger';

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
    logger.info('📌 [BOARD_LAYER] BoardLayer component initializing', {
        width: width.toFixed(1),
        height: height.toFixed(1),
        rows,
        multipliersCount: multipliers.length,
        className,
        hasOnBoardDimensionsCalculated: !!onBoardDimensionsCalculated,
        timestamp: new Date().toISOString()
    });

    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) {
            logger.warn('📌 [BOARD_LAYER] Canvas ref not available', {
                width: width.toFixed(1),
                height: height.toFixed(1),
                rows,
                multipliersCount: multipliers.length
            });
            return;
        }

        const ctx = canvas.getContext('2d');
        if (!ctx) {
            logger.error('📌 [BOARD_LAYER] Failed to get 2D context', {
                width: width.toFixed(1),
                height: height.toFixed(1),
                rows,
                multipliersCount: multipliers.length
            });
            return;
        }

        logger.debug('📌 [BOARD_LAYER] Starting canvas rendering', {
            width: width.toFixed(1),
            height: height.toFixed(1),
            rows,
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

        // Use the same calculations as physics bodies to ensure proper alignment
        // If multipliers is empty, use default multipliers for board calculation
        const effectiveMultipliers = multipliers.length > 0 ? multipliers : [0.5, 1, 1.2, 1.5, 2, 3, 5, 10, 20];

        logger.debug('📌 [BOARD_LAYER] Creating physics bodies for pin calculation', {
            width: width.toFixed(1),
            height: height.toFixed(1),
            rows,
            effectiveMultipliersCount: effectiveMultipliers.length,
            usingDefaultMultipliers: multipliers.length === 0,
            effectiveMultipliers: effectiveMultipliers.map(m => m.toFixed(1))
        });

        const { pins } = createPhysicsBodies(width, height, rows, effectiveMultipliers);

        logger.info('📌 [BOARD_LAYER] Physics bodies created', {
            pinCount: pins.length,
            rows,
            effectiveMultipliersCount: effectiveMultipliers.length
        });

        // Calculate board dimensions based on actual pin positions
        if (pins.length === 0) {
            logger.warn('📌 [BOARD_LAYER] No pins created, cannot calculate board dimensions', {
                width: width.toFixed(1),
                height: height.toFixed(1),
                rows,
                effectiveMultipliersCount: effectiveMultipliers.length
            });
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

            if (index < 5) { // Log first 5 pins for debugging
                logger.debug('📌 [BOARD_LAYER] Pin bounds', {
                    pinIndex: index,
                    pinLabel: pin.label,
                    bounds: {
                        minX: bounds.min.x.toFixed(1),
                        minY: bounds.min.y.toFixed(1),
                        maxX: bounds.max.x.toFixed(1),
                        maxY: bounds.max.y.toFixed(1)
                    }
                });
            }
        });

        logger.info('📌 [BOARD_LAYER] Pin bounds calculated', {
            pinCount: pins.length,
            bounds: {
                minX: minX.toFixed(1),
                minY: minY.toFixed(1),
                maxX: maxX.toFixed(1),
                maxY: maxY.toFixed(1)
            }
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

            logger.info('📐 [BOARD_LAYER] Notifying parent of calculated board dimensions', {
                boardDimensions: {
                    topMargin: boardTopMargin.toFixed(1),
                    bottomMargin: boardBottomMargin.toFixed(1),
                    leftMargin: boardLeftMargin.toFixed(1),
                    rightMargin: boardRightMargin.toFixed(1),
                    boardWidth: boardWidth.toFixed(1),
                    boardHeight: boardHeight.toFixed(1),
                    boardX: boardX.toFixed(1)
                },
                triangleCoordinates: {
                    topX: triangleTopX.toFixed(1),
                    topY: triangleTopY.toFixed(1),
                    bottomLeftX: triangleBottomLeftX.toFixed(1),
                    bottomLeftY: triangleBottomLeftY.toFixed(1),
                    bottomRightX: triangleBottomRightX.toFixed(1),
                    bottomRightY: triangleBottomRightY.toFixed(1)
                },
                padding,
                pinCount: pins.length
            });

            onBoardDimensionsCalculated(dimensions);
        } else {
            logger.warn('📐 [BOARD_LAYER] No onBoardDimensionsCalculated callback provided', {
                boardDimensions: {
                    topMargin: boardTopMargin.toFixed(1),
                    bottomMargin: boardBottomMargin.toFixed(1),
                    leftMargin: boardLeftMargin.toFixed(1),
                    rightMargin: boardRightMargin.toFixed(1),
                    boardWidth: boardWidth.toFixed(1),
                    boardHeight: boardHeight.toFixed(1),
                    boardX: boardX.toFixed(1)
                }
            });
        }

        // 1. Draw pins as small white circles using actual physics body positions
        // The triangular board area is defined by pin placement and ball clipping
        logger.debug('📌 [BOARD_LAYER] Starting pin rendering', {
            pinCount: pins.length
        });

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

            if (index < 5) { // Log first 5 pins for debugging
                logger.debug('📌 [BOARD_LAYER] Rendered pin', {
                    pinIndex: index,
                    pinLabel: pin.label,
                    centerX: centerX.toFixed(1),
                    centerY: centerY.toFixed(1),
                    pinRadius: pinRadius.toFixed(1)
                });
            }
        });

        logger.info('📌 [BOARD_LAYER] All pins rendered', {
            totalPins: pins.length,
            pinRadius: Math.max(2, Math.min(4, (pins[0]?.bounds?.max.x - pins[0]?.bounds?.min.x) / 2)).toFixed(1)
        });

        // Restore context state
        ctx.restore();

        logger.info('📌 [BOARD_LAYER] Canvas rendering completed', {
            width: width.toFixed(1),
            height: height.toFixed(1),
            rows,
            pinCount: pins.length,
            multipliersCount: multipliers.length,
            timestamp: new Date().toISOString()
        });

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
