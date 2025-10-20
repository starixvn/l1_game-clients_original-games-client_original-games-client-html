import { useCallback } from "react";
import { Bodies } from "matter-js";
import { PegBody } from "../type";
import { PLINKO_OBJECTS, PlinkoCanvasConfig } from "../constant";
import { usePlinkoGameStore } from "@plinko/shared/stores/plinko-game-store";

export const usePeg = () => {
    const numberOfRows = usePlinkoGameStore((state) => state.numberOfRows);
    const createPegs = useCallback(() => {
        const initialColumns = 3;
        const { width, pegRadius, mapGap } = PlinkoCanvasConfig;
        const pegs: PegBody[] = [];
        for (let row = 1; row <= numberOfRows; row++) {
            const columnsInRow = initialColumns + (row - 1);
            for (let col = 1; col <= columnsInRow; col++) {
                const gap = pegRadius * 2 * mapGap;
                const space = (width - gap * columnsInRow) / 2;
                const x = space + col * gap - pegRadius * mapGap;
                const y = row * gap;
                const options = {
                    isStatic: true,
                };

                const body = Bodies.circle(x, y, pegRadius, options) as PegBody;
                body.label = PLINKO_OBJECTS.PEG;
                body.circleRadius = pegRadius;
                body.rowIndex = row - 1;
                pegs.push(body);
            }
        }
        return pegs;
    }, [numberOfRows]);

    const drawPeg = useCallback((body: PegBody, context: CanvasRenderingContext2D) => {
        if (body.label !== PLINKO_OBJECTS.PEG) {
            return;
        }
        const { pegRadius } = PlinkoCanvasConfig;
        // Layer 1: Bottom layer
        context.fillStyle = "#000";
        context.beginPath();
        context.arc(0, 2.5, pegRadius + 2.5, 0, Math.PI * 2);
        context.fill();

        // Layer 2
        context.fillStyle = "#6542FF";
        context.beginPath();
        context.arc(0, 2.5, pegRadius, 0, Math.PI * 2);
        context.fill();

        // Layer 3
        context.fillStyle = "#FFFFFF";
        context.beginPath();
        context.arc(0, 0, pegRadius, 0, Math.PI * 2);
        context.fill();
        context.fillStyle = "#BDD9E4";
        context.beginPath();
        context.arc(0, 1, pegRadius * 0.9, 0, Math.PI * 2);
        context.fill();
    }, []);

    return {
        createPegs,
        drawPeg,
    };
};
