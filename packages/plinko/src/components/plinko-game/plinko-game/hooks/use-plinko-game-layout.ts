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

    console.log('Layout Debug Info:');
    console.log(`- isMobile: ${isMobile}`);
    console.log(`- isStackedLayout: ${isStackedLayout}`);
    console.log(`- window.innerHeight: ${window.innerHeight}`);
    console.log(`- SMALL_SCREEN_THRESHOLD: ${CANVAS_CONSTANTS.SMALL_SCREEN_THRESHOLD}`);
    console.log(`- baseGameHeight: ${baseGameHeight}`);
    console.log(`- BASE_GAME_HEIGHT: ${CANVAS_CONSTANTS.BASE_GAME_HEIGHT}`);
    console.log(`- MIN_MOBILE_HEIGHT: ${CANVAS_CONSTANTS.MIN_MOBILE_HEIGHT}`);
    console.log(`- MOBILE_HEIGHT_FACTOR: ${CANVAS_CONSTANTS.MOBILE_HEIGHT_FACTOR}`);

    return {
        mainContainerRef,
        baseGameHeight
    };
};
