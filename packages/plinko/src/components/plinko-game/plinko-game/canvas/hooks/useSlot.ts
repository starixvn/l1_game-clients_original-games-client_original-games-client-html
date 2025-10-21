import { useCallback, useMemo } from "react";
import { Bodies, Body } from "matter-js";
import { PLINKO_OBJECTS, PlinkoCanvasConfig } from "../constant";
import { usePlinkoGameStore } from "@plinko/shared/stores/plinko-game-store";
import { SlotBody } from "../type";
import { useGameStore } from "@shared/stores/game-store";
import { getMultiplierColor } from "@plinko/shared/colors-util";

export const useSlot = () => {
    const numberOfRows = usePlinkoGameStore((state) => state.numberOfRows);
    const gameConfigs = useGameStore((state) => state.gameConfigs);
    const gameMode = usePlinkoGameStore((state) => state.gameMode);
    const finishedBall = usePlinkoGameStore((state) => state.finishedBall);

    // Get odds data for rendering multipliers
    const odds = useMemo(() => {
        return gameConfigs?.odds?.[gameMode][numberOfRows] as unknown as number[];
    }, [gameMode, numberOfRows, gameConfigs]);

    // Font size mapping (matching original Slots component)
    const fontSizes = useMemo(() => ({
        8: 18,
        9: 16,
        10: 14,
        11: 13,
        12: 12,
        13: 11,
        14: 10,
        15: 9,
        16: 9,
    }), []);

    const createSlots = useCallback(() => {
        const slots: Body[] = [];
        const { width, pegRadius, mapGap } = PlinkoCanvasConfig;
        const numberOfSlots = numberOfRows + 1;
        for (let col = 1; col <= numberOfSlots; col++) {
            const gap = pegRadius * 2 * mapGap;
            const space = (width - gap * numberOfSlots) / 2;
            const x = space + col * gap - pegRadius * mapGap;
            // Position slots below pegs with 1.5 gap spacing for better visual separation
            const y = (numberOfRows + 1.5) * gap;
            const options = {
                isSensor: true,
                isStatic: true,
            };
            const body = Bodies.rectangle(x, y, gap - 6, 1, options) as SlotBody;
            body.label = PLINKO_OBJECTS.SLOT;
            body.slotIndex = col - 1; // Slot index starts from 0
            slots.push(body);
        }
        return slots;
    }, [numberOfRows]);

    const drawSlot = useCallback((body: Body, context: CanvasRenderingContext2D) => {
        if (body.label !== PLINKO_OBJECTS.SLOT) {
            return;
        }


        const slotBody = body as SlotBody;
        const slotIndex = slotBody.slotIndex;

        if (!odds || slotIndex >= odds.length) {
            return;
        }

        const multiplier = odds[slotIndex];
        const isHit = finishedBall?.settlementResult?.slotIndex === slotIndex;

        // Slot dimensions (matching original component) - scale like pegs (no compensation)
        const slotWidth = 50;
        const slotHeight = 30;

        // Position calculation (center the slot on the collision body) - no additional scaling for position
        const x = -slotWidth / 2;
        const y = -slotHeight - 5; // Position above the collision sensor

        // Draw slot background
        const backgroundColor = getMultiplierColor(slotIndex, gameMode, numberOfRows);
        context.fillStyle = backgroundColor;
        context.fillRect(x, y, slotWidth, slotHeight);

        // Add hit animation effect
        if (isHit) {
            context.strokeStyle = "#FFD700";
            context.lineWidth = 2;
            context.strokeRect(x - 1, y - 1, slotWidth + 2, slotHeight + 2);
        }

        // Draw slot border
        context.strokeStyle = "#262626";
        context.lineWidth = 1;
        context.strokeRect(x, y, slotWidth, slotHeight);

        // Draw multiplier text
        const fontSize = fontSizes[numberOfRows];
        context.fillStyle = "#ffffff";
        context.font = `bold ${fontSize}px Arial`;
        context.textAlign = "center";
        context.textBaseline = "middle";

        // Format multiplier text (K notation for large numbers)
        const displayText = multiplier >= 1000 ? `${(multiplier / 1000).toFixed(1)}K` : multiplier.toString();
        const textX = 0; // Center on body
        const textY = y + slotHeight / 2;

        // Add text shadow effect
        context.shadowColor = "#262626";
        context.shadowOffsetX = -1;
        context.shadowOffsetY = -1;
        context.shadowBlur = 0;
        context.fillText(displayText, textX, textY);

        // Reset shadow
        context.shadowColor = "transparent";
        context.shadowOffsetX = 0;
        context.shadowOffsetY = 0;
        context.shadowBlur = 0;
    }, [odds, finishedBall, numberOfRows, gameMode, fontSizes]);

    return {
        createSlots,
        drawSlot,
    };
};
