import { useEffect, useCallback } from "react";
import { isMobile, isTablet, isDesktop } from "react-device-detect";
import { PLINKO_CANVAS_SCALE } from "../constant";

interface UsePlinkoGameResizeProps {
    numberOfRows: number;
    viewportWidth: number;
    setViewportWidth: (width: number) => void;
    baseGameHeight: number;
}

export const usePlinkoGameResize = ({
    numberOfRows,
    viewportWidth,
    setViewportWidth,
    baseGameHeight
}: UsePlinkoGameResizeProps) => {
    const handleResize = useCallback(() => {
        setViewportWidth(window.innerWidth);
    }, [setViewportWidth]);

    useEffect(() => {
        window.addEventListener('resize', handleResize);

        // Add manual logging trigger for debugging (available in development)
        if (process.env.NODE_ENV === 'development') {
            (window as any).logPlinkoGameState = () => {
                console.log('🔍 Manually triggering Plinko game state logging...');
            };
            console.log('🔧 Plinko Debug: Call window.logPlinkoGameState() to manually log current game state');
        }

        return () => {
            window.removeEventListener('resize', handleResize);
            if (process.env.NODE_ENV === 'development') {
                delete (window as any).logPlinkoGameState;
            }
        };
    }, [handleResize, numberOfRows, viewportWidth, baseGameHeight]);

    return null;
};
