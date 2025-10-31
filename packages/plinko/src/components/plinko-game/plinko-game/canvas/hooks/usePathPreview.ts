import { useCallback } from "react";
import { PlinkoCanvasConfig } from "../constant";
import { PlinkoFinish } from "@plinko/shared/types/types";

interface PathPreview {
    points: { x: number; y: number }[];
    createdAt: number;
    duration: number;
}

export const usePathPreview = ({ pathPreviewsRef }: { pathPreviewsRef: React.RefObject<PathPreview[]> }) => {
    const createPathPreview = useCallback(
        (finish: PlinkoFinish) => {
            const { width, pegRadius, mapGap } = PlinkoCanvasConfig;
            const initialColumns = 3;
            const points: { x: number; y: number }[] = [];

            // Start from center top (where ball spawns)
            const startX = width / 2;
            const startY = 20;
            points.push({ x: startX, y: startY });

            // Calculate peg collision positions based on result array
            // Starting position is middle of first row
            let currentColumnIndex = 1; // 0-indexed position in each row (middle of 3 columns)

            for (let row = 0; row < finish.result.length; row++) {
                const rowNumber = row + 1;
                const columnsInRow = initialColumns + row;
                const direction = finish.result[row]; // 0 = left, 1 = right

                // Calculate the peg position that will be hit
                const gap = pegRadius * 2 * mapGap;
                const space = (width - gap * columnsInRow) / 2;

                // Column number is 1-indexed for positioning
                const colNumber = currentColumnIndex + 1;
                const pegX = space + colNumber * gap - pegRadius * mapGap;
                const pegY = rowNumber * gap;

                points.push({ x: pegX, y: pegY });

                // Update column index for next row based on direction
                // When going left (0), stay at same index
                // When going right (1), increment index
                if (direction === 1) {
                    currentColumnIndex += 1;
                }
            }

            // Add final point to slot area
            const finalRow = finish.result.length;
            const finalColumnsInRow = initialColumns + finalRow;
            const gap = pegRadius * 2 * mapGap;
            const space = (width - gap * finalColumnsInRow) / 2;

            // Final column position after all movements
            const finalColNumber = currentColumnIndex + 1;
            const slotX = space + finalColNumber * gap - pegRadius * mapGap;
            const slotY = (finalRow + 1) * gap; // Extend to slot area

            points.push({ x: slotX, y: slotY });

            const pathPreview: PathPreview = {
                points,
                createdAt: Date.now(),
                duration: 500, // 0.5 seconds
            };

            pathPreviewsRef.current?.push(pathPreview);
        },
        [pathPreviewsRef]
    );

    const drawPathPreview = useCallback(
        (context: CanvasRenderingContext2D) => {
            if (!pathPreviewsRef.current) {
                return;
            }

            const now = Date.now();

            // Remove expired paths (modify array in place)
            const activePaths = pathPreviewsRef.current.filter((path) => now - path.createdAt < path.duration);
            pathPreviewsRef.current.length = 0;
            pathPreviewsRef.current.push(...activePaths);

            // Draw each active path
            pathPreviewsRef.current.forEach((path) => {
                context.save();

                // Draw main path line with glow effect
                // context.strokeStyle = `rgba(254, 215, 1, 0.3)`; // Yellow with transparency
                // context.lineWidth = 10;
                // context.lineCap = "round";
                // context.lineJoin = "round";
                // context.shadowBlur = 10;
                // context.shadowColor = `rgba(254, 215, 1, 0.5)`;


                // Draw brighter center line (solid)
                context.shadowBlur = 0;
                context.lineWidth = 6;

                // Create a vertical linear gradient for the stroke
                let minY = Infinity,
                    maxY = -Infinity;
                path.points.forEach((point) => {
                    if (point.y < minY) {
                        minY = point.y;
                    }
                    if (point.y > maxY) {
                        maxY = point.y;
                    }
                });

                // If all y are the same (should not happen), set a default gradient span
                if (minY === maxY) {
                    minY -= 1;
                    maxY += 1;
                }

                const gradient = context.createLinearGradient(0, minY, 0, maxY);
                gradient.addColorStop(0, "#FFFDBF");
                gradient.addColorStop(1, "#FFE100");
                context.strokeStyle = gradient;

                context.beginPath();
                path.points.forEach((point, index) => {
                    if (index === 0) {
                        context.moveTo(point.x, point.y);
                    } else {
                        context.lineTo(point.x, point.y);
                    }
                });
                context.stroke();

                context.restore();
            });
        },
        [pathPreviewsRef]
    );

    return {
        createPathPreview,
        drawPathPreview,
    };
};
