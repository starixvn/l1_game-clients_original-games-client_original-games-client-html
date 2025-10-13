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
        context.fillStyle = "#00000080";
        context.beginPath();
        context.arc(0, 0, pegRadius + 2.7, 0, Math.PI * 2);
        context.fill();
        const gradient = context.createLinearGradient(0, -pegRadius, 0, pegRadius);
        gradient.addColorStop(0, "#FFFFFF");
        gradient.addColorStop(0.5, "#B5B5B5");
        context.fillStyle = gradient;
        context.beginPath();
        context.arc(0, 0, pegRadius, 0, Math.PI * 2);
        context.fill();
    }, []);

    return {
        createPegs,
        drawPeg,
    };
};
