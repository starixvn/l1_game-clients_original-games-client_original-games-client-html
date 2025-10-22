import { useCallback, useMemo, useState, useRef, useEffect } from "react";
import { Bodies, Body } from "matter-js";
import { PLINKO_OBJECTS, PlinkoCanvasConfig } from "../constant";
import { usePlinkoGameStore } from "@plinko/shared/stores/plinko-game-store";
import { SlotBody } from "../type";
import { useGameStore } from "@shared/stores/game-store";
import { getMultiplierColor } from "@plinko/shared/colors-util";
import { numberWithCommas } from "@shared";

interface UseSlotProps {
    totalScale: number;
}

export const useSlot = ({ totalScale }: UseSlotProps) => {
    const numberOfRows = usePlinkoGameStore((state) => state.numberOfRows);
    const gameConfigs = useGameStore((state) => state.gameConfigs);
    const gameMode = usePlinkoGameStore((state) => state.gameMode);
    const finishedBall = usePlinkoGameStore((state) => state.finishedBall);
    const betAmount = usePlinkoGameStore((state) => state.betAmount);

    // Tooltip state
    const [hoveredSlotIndex, setHoveredSlotIndex] = useState<number | null>(null);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const touchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const isTouchDevice = useRef(false);

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

    // Calculate probability for a slot (binomial coefficient)
    const calculateProbability = useCallback((slotIndex: number) => {
        const binomial = (n: number, k: number) => {
            if (k > n) { return 0; }
            let result = 1;
            for (let i = 0; i < k; i++) {
                result *= (n - i) / (i + 1);
            }
            return result;
        };
        return binomial(numberOfRows, slotIndex) / Math.pow(2, numberOfRows);
    }, [numberOfRows]);

    // Check if touch device
    useEffect(() => {
        isTouchDevice.current = "ontouchstart" in globalThis || navigator.maxTouchPoints > 0;
    }, []);

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

    // Draw tooltip on canvas
    const drawTooltip = useCallback((context: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
        if (hoveredSlotIndex === null || !odds || hoveredSlotIndex >= odds.length) {
            return;
        }

        const slotOdds = odds[hoveredSlotIndex];
        const probability = calculateProbability(hoveredSlotIndex);
        const winAmount = betAmount * slotOdds;

        // Tooltip dimensions and positioning
        // mousePosition is in screen coords relative to canvas element
        // Convert to canvas coordinates for proper positioning on scaled canvas
        const rect = canvas.getBoundingClientRect();
        const visualCenterX = rect.width / 2;
        const tooltipCanvasX = ((mousePosition.x - visualCenterX) / totalScale) + (canvas.width / 2);
        const tooltipCanvasY = mousePosition.y / totalScale;

        const tooltipWidth = 266;
        const tooltipHeight = 60;
        const tooltipX = Math.max(10, Math.min(tooltipCanvasX - tooltipWidth / 2, canvas.width - tooltipWidth - 10));
        const tooltipY = tooltipCanvasY - tooltipHeight - 10;

        // Draw tooltip background with gradient
        const gradient = context.createLinearGradient(tooltipX, tooltipY, tooltipX, tooltipY + tooltipHeight);
        gradient.addColorStop(0, "#093B77");
        gradient.addColorStop(1, "#031122");
        context.fillStyle = gradient;
        context.fillRect(tooltipX, tooltipY, tooltipWidth, tooltipHeight);

        // Draw tooltip border
        context.strokeStyle = "#031122";
        context.lineWidth = 1;
        context.strokeRect(tooltipX, tooltipY, tooltipWidth, tooltipHeight);

        // Draw tooltip content
        context.fillStyle = "#ffffff";
        context.font = "bold 12px Arial";
        context.textAlign = "left";

        // Win Amount section
        const winAmountX = tooltipX + 12;
        const winAmountY = tooltipY + 16;
        context.fillText("Win Amount", winAmountX, winAmountY);

        // Win amount box
        context.fillStyle = "#101721";
        context.fillRect(winAmountX, winAmountY + 4, 130, 36);
        context.strokeStyle = "#2B3648";
        context.strokeRect(winAmountX, winAmountY + 4, 130, 36);

        // Win amount text
        context.fillStyle = "#ffffff";
        context.font = "14px Arial";
        context.fillText(`$${numberWithCommas(winAmount)}`, winAmountX + 8, winAmountY + 26);

        // Chance section
        const chanceX = tooltipX + 152;
        const chanceY = tooltipY + 16;
        context.font = "bold 12px Arial";
        context.fillText("Chance", chanceX, chanceY);

        // Chance box
        context.fillStyle = "#101721";
        context.fillRect(chanceX, chanceY + 4, 100, 36);
        context.strokeStyle = "#2B3648";
        context.strokeRect(chanceX, chanceY + 4, 100, 36);

        // Chance text
        context.fillStyle = "#ffffff";
        context.font = "14px Arial";
        context.fillText(`${numberWithCommas(probability * 100, 4)}%`, chanceX + 8, chanceY + 26);

        // Draw arrow pointing down
        const arrowX = mousePosition.x;
        const arrowY = tooltipY + tooltipHeight;
        context.fillStyle = "#031122";
        context.beginPath();
        context.moveTo(arrowX, arrowY);
        context.lineTo(arrowX - 6, arrowY - 6);
        context.lineTo(arrowX + 6, arrowY - 6);
        context.closePath();
        context.fill();
    }, [hoveredSlotIndex, odds, mousePosition, betAmount, calculateProbability, totalScale]);

    // Mouse/touch event handlers
    const handleMouseMove = useCallback((event: MouseEvent, canvas: HTMLCanvasElement) => {
        if (isTouchDevice.current) return;

        const rect = canvas.getBoundingClientRect();
        // Get screen coordinates relative to canvas element
        const screenX = event.clientX - rect.left;
        const screenY = event.clientY - rect.top;

        // Transform to canvas coordinates (accounting for CSS scaling)
        // The canvas is visually scaled by totalScale and centered, so we need to convert back to original canvas coords
        const visualCenterX = rect.width / 2;
        const canvasX = ((screenX - visualCenterX) / totalScale) + (canvas.width / 2);
        const canvasY = screenY / totalScale;

        setMousePosition({ x: screenX, y: screenY }); // Keep screen coords for tooltip positioning

        // Check if mouse is over a slot (in canvas coordinates)
        const { pegRadius, mapGap } = PlinkoCanvasConfig;
        const gap = pegRadius * 2 * mapGap;
        const numberOfSlots = numberOfRows + 1;
        const slotY = (numberOfRows + 1.5) * gap;

        // Check Y proximity (within slot height + some margin) - align with visual slot position
        if (Math.abs(canvasY - (slotY - 35)) < 40) {
            // Check X position for each slot
            for (let col = 0; col < numberOfSlots; col++) {
                const space = (PlinkoCanvasConfig.width - gap * numberOfSlots) / 2;
                const slotX = space + (col + 1) * gap - pegRadius * mapGap;
                if (Math.abs(canvasX - slotX) < 25) { // 50px slot width / 2
                    setHoveredSlotIndex(col);
                    return;
                }
            }
        }

        setHoveredSlotIndex(null);
    }, [numberOfRows, totalScale]);

    const handleMouseLeave = useCallback(() => {
        if (!isTouchDevice.current) {
            setHoveredSlotIndex(null);
        }
    }, []);

    const handleTouchStart = useCallback((event: TouchEvent, canvas: HTMLCanvasElement) => {
        if (touchTimeoutRef.current) {
            clearTimeout(touchTimeoutRef.current);
        }

        const rect = canvas.getBoundingClientRect();
        const touch = event.touches[0];
        const screenX = touch.clientX - rect.left;
        const screenY = touch.clientY - rect.top;

        // Transform to canvas coordinates (accounting for CSS scaling)
        const visualCenterX = rect.width / 2;
        const canvasX = ((screenX - visualCenterX) / totalScale) + (canvas.width / 2);
        const canvasY = screenY / totalScale;

        setMousePosition({ x: screenX, y: screenY });

        touchTimeoutRef.current = setTimeout(() => {
            // Same slot detection logic as mouse move
            const { pegRadius, mapGap } = PlinkoCanvasConfig;
            const gap = pegRadius * 2 * mapGap;
            const numberOfSlots = numberOfRows + 1;
            const slotY = (numberOfRows + 1.5) * gap;

            if (Math.abs(canvasY - (slotY - 35)) < 40) {
                for (let col = 0; col < numberOfSlots; col++) {
                    const space = (PlinkoCanvasConfig.width - gap * numberOfSlots) / 2;
                    const slotX = space + (col + 1) * gap - pegRadius * mapGap;
                    if (Math.abs(canvasX - slotX) < 25) {
                        setHoveredSlotIndex(col);
                        return;
                    }
                }
            }

            setHoveredSlotIndex(null);
        }, 300);
    }, [numberOfRows, totalScale]);

    const handleTouchEnd = useCallback(() => {
        if (touchTimeoutRef.current) {
            clearTimeout(touchTimeoutRef.current);
            touchTimeoutRef.current = null;
        }
    }, []);

    const handleTouchMove = useCallback(() => {
        if (touchTimeoutRef.current) {
            handleTouchEnd();
        }
    }, [handleTouchEnd]);

    return {
        createSlots,
        drawSlot,
        drawTooltip,
        handleMouseMove,
        handleMouseLeave,
        handleTouchStart,
        handleTouchEnd,
        handleTouchMove,
    };
};
