import { useCallback, useRef } from "react";
import { PlinkoCanvasConfig } from "../constant";
import { PlinkoFinish } from "@plinko/shared/types/types";
import { PegBody, PathPreview } from "../type";
import { useLightningPathPreview } from "./use-lightning-path-preview";

export const usePathPreview = ({ pegsRef }: { pegsRef: React.RefObject<PegBody[]> }) => {
    const pathPreviewsRef = useRef<PathPreview[]>([]);
    const { drawLightningPathPreview } = useLightningPathPreview({ pathPreviewsRef, pegsRef });

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
                animationDuration: 300, // 0.3 seconds for path to fully appear
            };

            pathPreviewsRef.current?.push(pathPreview);
        },
        [pathPreviewsRef, pegsRef]
    );

    const drawPathPreview = useCallback(
        (context: CanvasRenderingContext2D) => {
            drawLightningPathPreview(context);
        },
        [drawLightningPathPreview, pegsRef]
    );

    return {
        createPathPreview,
        drawPathPreview,
    };
};
