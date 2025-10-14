import { useCallback } from "react";
import { Bodies, Body } from "matter-js";
import { PLINKO_OBJECTS, PlinkoCanvasConfig } from "../constant";
import { usePlinkoGameStore } from "@plinko/shared/stores/plinko-game-store";

export const useSlot = () => {
    const numberOfRows = usePlinkoGameStore((state) => state.numberOfRows);
    const createSlots = useCallback(() => {
        const slots: Body[] = [];
        const { width, pegRadius, mapGap } = PlinkoCanvasConfig;
        const numberOfSlots = numberOfRows + 1;
        for (let col = 1; col <= numberOfSlots; col++) {
            const gap = pegRadius * 2 * mapGap;
            const space = (width - gap * numberOfSlots) / 2;
            const x = space + col * gap - pegRadius * mapGap;
            const y = numberOfSlots * pegRadius * 2 * mapGap - 30;
            const options = {
                isSensor: true,
                isStatic: true,
            };
            const body = Bodies.rectangle(x, y, gap - 6, 1, options);
            body.label = PLINKO_OBJECTS.SLOT;
            slots.push(body);
        }
        return slots;
    }, [numberOfRows]);

    const drawSlot = useCallback((body: Body, context: CanvasRenderingContext2D) => {
        if (body.label !== PLINKO_OBJECTS.SLOT) {
            return;
        }
        context.fillStyle = "#d9ead3";
        const width = body.bounds.max.x - body.bounds.min.x;
        const height = 30;
        context.fillRect(-width / 2, 0, width, height);
    }, []);

    return {
        createSlots,
        drawSlot,
    };
};
