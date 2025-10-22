import { useRef } from "react";
import { isMobile } from "react-device-detect";
import {
    CANVAS_CONSTANTS
} from "../constants/scaling-constants";

export const usePlinkoGameLayout = () => {

    const mainContainerRef = useRef<HTMLDivElement>(null);

    // Use mobile-like height calculation on mobile/tablet devices
    const isStackedLayout = isMobile;
    const baseGameHeight = isStackedLayout && window.innerHeight < CANVAS_CONSTANTS.SMALL_SCREEN_THRESHOLD
        ? Math.max(CANVAS_CONSTANTS.MIN_MOBILE_HEIGHT, window.innerHeight * CANVAS_CONSTANTS.MOBILE_HEIGHT_FACTOR)
        : CANVAS_CONSTANTS.BASE_GAME_HEIGHT;

    return {
        mainContainerRef,
        baseGameHeight
    };
};
