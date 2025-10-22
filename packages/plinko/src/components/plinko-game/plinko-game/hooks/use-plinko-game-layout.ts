import { useRef } from "react";
import { isMobile } from "react-device-detect";
import {
    CANVAS_CONSTANTS,
    VISUAL_CONSTANTS
} from "../constants/scaling-constants";

interface UsePlinkoGameLayoutParams {
    numberOfRows: number;
    scaleValue: number;
    finalScale: number;
}

export const usePlinkoGameLayout = ({
    numberOfRows,
    scaleValue,
    finalScale
}: UsePlinkoGameLayoutParams) => {

    const mainContainerRef = useRef<HTMLDivElement>(null);
    const canvasContainerRef = useRef<HTMLDivElement>(null);
    const slotsContainerRef = useRef<HTMLDivElement>(null);

    // Use mobile-like height calculation on mobile/tablet devices
    const isStackedLayout = isMobile;
    const baseGameHeight = isStackedLayout && window.innerHeight < CANVAS_CONSTANTS.SMALL_SCREEN_THRESHOLD
        ? Math.max(CANVAS_CONSTANTS.MIN_MOBILE_HEIGHT, window.innerHeight * CANVAS_CONSTANTS.MOBILE_HEIGHT_FACTOR)
        : CANVAS_CONSTANTS.BASE_GAME_HEIGHT;

    // Calculate slots position synchronously to avoid initial positioning issues
    const slotsTopPosition = (() => {
        // Calculate where the last peg is positioned after canvas transforms

        // From usePeg hook: gap = pegRadius * 2 * mapGap = 7.5 * 2 * 3.6 = 54
        const pegRadius = 7.5;
        const mapGap = 3.6;
        const gap = pegRadius * 2 * mapGap; // 54
        const lastPegYInCanvas = numberOfRows * gap;

        // Apply canvas scaling
        const lastPegYScaled = lastPegYInCanvas * scaleValue;

        // Apply canvas translateY
        const translateYValue = (numberOfRows + numberOfRows / VISUAL_CONSTANTS.CANVAS_TRANSFORM_OFFSET_FACTOR) *
            (baseGameHeight / CANVAS_CONSTANTS.BASE_GAME_HEIGHT);
        const lastPegYInGameFrame = lastPegYScaled + translateYValue;

        // Position slots below the last peg with some spacing
        const slotsTop = lastPegYInGameFrame + VISUAL_CONSTANTS.SLOTS_BOTTOM_OFFSET;

        // Ensure slots don't go below the game area
        return Math.min(slotsTop, baseGameHeight - 50);
    })();

    return {
        mainContainerRef,
        canvasContainerRef,
        slotsContainerRef,
        baseGameHeight,
        slotsTopPosition
    };
};
