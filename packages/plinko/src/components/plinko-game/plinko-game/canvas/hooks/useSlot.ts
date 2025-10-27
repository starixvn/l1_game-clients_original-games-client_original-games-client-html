import { useCallback } from "react";
import { Bodies, Body } from "matter-js";
import { PLINKO_OBJECTS, PlinkoCanvasConfig } from "../constant";
import { usePlinkoGameStore } from "@plinko/shared/stores/plinko-game-store";

export const useSlot = () => {
    const numberOfRows = usePlinkoGameStore((state) => state.numberOfRows);
    const createSlot = useCallback(() => {
        const { width, pegRadius, mapGap } = PlinkoCanvasConfig;
        const numberOfSlots = numberOfRows + 1;
        const x = 0;
        const y = numberOfSlots * pegRadius * 2 * mapGap;
        const options = {
            isStatic: true,
        };
        const body = Bodies.rectangle(x, y, width * 2, 1, options);
        body.label = PLINKO_OBJECTS.SLOT;
        return body;
    }, [numberOfRows]);

    const drawSlot = useCallback((body: Body, context: CanvasRenderingContext2D) => {
        if (body.label !== PLINKO_OBJECTS.SLOT) {
            return;
        }
        context.fillStyle = "#d9ead3";
        const width = body.bounds.max.x - body.bounds.min.x;
        const height = 1;
        context.fillRect(-width / 2, 0, width, height);
    }, []);

    return {
        createSlot,
        drawSlot,
    };
};
